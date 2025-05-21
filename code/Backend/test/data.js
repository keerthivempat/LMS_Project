import mongoose from 'mongoose';
import { User, Organization, Course, Section, Assignment, Video, StudentProgress } from "../src/models/schema.model.js";
import dotenv from 'dotenv';

dotenv.config();

const seedDatabase = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            "mongodb://admin:Eklavya%401111@43.229.225.107:27017/lms?authSource=admin",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoCreate: true // Enable auto creation of collections
            }
        );

        console.log(`\nMongoDB connected successfully to host: ${connectionInstance.connection.host}\n`);

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            Organization.deleteMany({}),
            Course.deleteMany({}),
            Section.deleteMany({}),
            Assignment.deleteMany({}),
            Video.deleteMany({}),
            StudentProgress.deleteMany({})
        ]);

        // Create Users with hashed passwords
        const users = await User.create([
            {
                name: 'Super Admin',
                username: 'superadmin',
                email: 'superadmin@example.com',
                password: 'SuperAdmin123',
                role: 'super_admin'
            },
            {
                name: 'Admin User',
                username: 'admin1',
                email: 'admin@example.com',
                password: 'AdminPass123',
                role: 'admin'
            },
            {
                name: 'John Doe',
                username: 'john1',
                email: 'john@example.com',
                password: 'JohnPass123',
                role: 'teacher'
            },
            {
                name: 'Student One',
                username: 'student1',
                email: 'student1@example.com',
                password: 'StudentPass123',
                role: 'student'
            }
        ]);

        const [superAdmin, admin, teacher, student] = users;

        // Create Organizations with complete details
        const org = await Organization.create({
            name: 'Tech Academy',
            description: 'Leading technology education platform',
            slug: 'tech-academy',
            logo: 'https://example.com/tech-academy-logo.png',
            contactDetails: {
                email: 'info@techacademy.com',
                phone: '123-456-7890',
                address: '123 Tech Street, Silicon Valley, CA'
            },
            about: [
                'Industry expert instructors',
                'Hands-on project-based learning',
                'Latest curriculum aligned with industry needs'
            ],
            admins: [admin._id, superAdmin._id],
            teachers: [teacher._id],
            students: [student._id],
            courses: [] // Will be populated later
        });

        // Update users with organization reference
        await Promise.all([
            User.findByIdAndUpdate(admin._id, { $addToSet: { organizations: org._id } }),
            User.findByIdAndUpdate(teacher._id, { $addToSet: { organizations: org._id } }),
            User.findByIdAndUpdate(student._id, { $addToSet: { organizations: org._id } })
        ]);

        // Create Course with complete details
        const course = await Course.create({
            name: 'Machine Learning Fundamentals',
            description: 'Comprehensive course on ML basics',
            organization: org._id,
            teachers: [teacher._id],
            students: [student._id],
            likes: 42,
            sections: []
        });

        // Update organization and users with course reference
        await Promise.all([
            Organization.findByIdAndUpdate(org._id, { $addToSet: { courses: course._id } }),
            User.findByIdAndUpdate(teacher._id, { $addToSet: { courses: course._id } }),
            User.findByIdAndUpdate(student._id, { $addToSet: { courses: course._id } })
        ]);

        // Create Sections with resources
        const section = await Section.create({
            name: 'Introduction to ML',
            description: 'Basic concepts and applications',
            course: course._id,
            order: 1,
            resources: [
                {
                    name: 'ML Basics Slides',
                    link: 'https://example.com/ml-slides.pdf'
                }
            ]
        });

        // Update course with section reference
        await Course.findByIdAndUpdate(course._id, { $addToSet: { sections: section._id } });

        // Create Video with comments
        const video = await Video.create({
            title: 'ML Introduction',
            url: 'https://example.com/ml-intro',
            section: section._id,
            comments: [{
                user: student._id,
                text: 'Great introduction!'
            }]
        });

        // Create Assignment with submissions
        const assignment = await Assignment.create({
            title: 'ML Basics Quiz',
            description: 'Test your understanding',
            section: section._id,
            dueDate: new Date('2025-03-15'),
            assignmentLinks: ['https://example.com/ml-quiz'],
            submissions: {
                student: student._id,
                files: ['submission.pdf'],
                submittedAt: new Date()
            }
        });

        // Create Student Progress
        await StudentProgress.create({
            student: student._id,
            course: course._id,
            sectionsCompleted: [section._id],
            assignmentsSubmitted: [assignment._id],
            videosWatched: [video._id]
        });

        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();