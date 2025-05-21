import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';



const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'student', 'teacher', 'admin', 'superadmin'], default: 'user' },
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course',unique:true }],
    refreshToken: { type: String },

    isActive: { type: Boolean, default: false },

    // Avatar fields
    hasCustomAvatar: {
        type: Boolean,
        default: false
    },
    avatarIndex: {
        type: Number,
        default: 0,
        min: 0
    },

    // Email verification fields
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationTokenExpires: { type: Date },

    // Add these fields for OTP-based password change
    passwordResetOTP: { 
        type: String, 
        default: null 
    },
    passwordResetOTPExpiry: { 
        type: Date, 
        default: null 
    },

}, { timestamps: true });

// Indexing for // UserSchema.index({ email: 1 });
// faster queries
// UHash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            id: this._id,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    );
};


// Generate email verification token
UserSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = verificationToken; // Store the raw token
    this.emailVerificationTokenExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    return verificationToken;
};

// Generate phone OTP
UserSchema.methods.generatePhoneOTP = function () {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    this.phoneOTP = otp;
    this.phoneOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    return otp;
};

// Generate JWT Token

// Compare password
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};


// Organization Schema
const OrganizationSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, unique: true },
    description: { type: String },
    logo: { type: String },
    contactDetails: {
        email: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    about: [{ type: String }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added students array
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added teachers array
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }]
}, { timestamps: true });

// OrganizationSchema.index({ name: 1 });
OrganizationSchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    next();
});


// Course Schema
const CourseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    likes: { type: Number, default: 0 },
    description: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' ,unique:true}],
    // pending students are the students who have 
    // requested to join the course but are not yet approved
    pendingStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }]
}, { timestamps: true });

// CourseSchema.index({ name: 1 });
CourseSchema.pre('save', function (next) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
    next();
});

// Section Schema
const SectionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    videos: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Video'
    }],
    assignments: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'Assignment'
    }],
    resources: [{
        name: { type: String, required: true },
        link: { type: String, required: true }
    }],
    comments: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        text: { type: String, required: true },
        likes: { type: Number, default: 0 },
        likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        createdAt: { type: Date, default: Date.now },
        replies: [{
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            text: { type: String, required: true },
            likes: { type: Number, default: 0 },
            likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            createdAt: { type: Date, default: Date.now }
        }]
    }]
}, { timestamps: true });

// Video Schema
const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String }]
}, { timestamps: true });

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    assignmentLinks: [{ type: String }],
    submissions: [{
        student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        files: [{ type: String }],
        submittedAt: { type: Date },
    }],
    feedback: { type: String }
}, { timestamps: true });

// Student Progress Schema
const StudentProgressSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    sectionsCompleted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
    assignmentsSubmitted: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' }],
    videosWatched: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]
}, { timestamps: true });

// Submission Schema
const SubmissionSchema = new mongoose.Schema({
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    files: [{ type: String }],
    submittedAt: { type: Date, default: Date.now },
    // New fields for teacher review
    review: {
        comment: { type: String },
        grade: { type: Number },
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date }
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed'],
        default: 'pending'
    }
}, { timestamps: true });
// Enrollment Request Schema
const EnrollmentRequestSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    organization: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Organization', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
    processedAt: { 
        type: Date 
    },
    processedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    rejectionReason: { 
        type: String 
    }
}, { timestamps: true });

const CourseEnrollmentRequestSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    course: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Course', 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'rejected'], 
        default: 'pending' 
    },
    requestedAt: { 
        type: Date, 
        default: Date.now 
    },
    processedAt: { 
        type: Date 
    },
    processedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    rejectionReason: { 
        type: String 
    }
}, { timestamps: true });

const EnrollmentRequest = mongoose.model('EnrollmentRequest', EnrollmentRequestSchema);
const CourseEnrollmentRequest = mongoose.model('CourseEnrollmentRequest', CourseEnrollmentRequestSchema);
const User = mongoose.model('User', UserSchema);
const Organization = mongoose.model('Organization', OrganizationSchema);
const Course = mongoose.model('Course', CourseSchema);
const Section = mongoose.model('Section', SectionSchema);
const Video = mongoose.model('Video', VideoSchema);
const Assignment = mongoose.model('Assignment', AssignmentSchema);
const StudentProgress = mongoose.model('StudentProgress', StudentProgressSchema);
const Submission = mongoose.model('Submission', SubmissionSchema);
export {
    User,
    Organization,
    Course,
    Section,
    Video,
    Assignment,
    StudentProgress,
    Submission,
    EnrollmentRequest,
    CourseEnrollmentRequest,
};
