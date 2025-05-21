# LMS Eklavya Foundation

## Project Overview
The Learning Management System (LMS) for Eklavya Foundation is a comprehensive platform designed to provide higher education resources to students through various courses across different fields. The system enables teachers to create and manage courses, add lectures, PDFs, and assignments. It incorporates a regular feedback mechanism from students in the form of comments and reviews. The platform allows different organizations to independently maintain their functioning and support educational initiatives in various ways.

## Technology Stack
- **Frontend**: React.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **File Storage**: Cloudinary
- **Deployment**: Docker
- **Version Control**: GitHub

## Key Features

### Multi-level User Roles
- **Super Admin**: Manages organizations and oversees platform activities
- **Admin**: Manages organization settings, approves user requests, assigns teachers
- **Teacher**: Creates and manages course content, approves student enrollments
- **Student**: Enrolls in courses, accesses content, submits assignments, provides feedback
- **User**: Can request to join organizations

### Organization Management
- Create and manage multiple educational organizations
- Customize organization profiles and details
- Assign admins to organizations

### Course Management
- Create and organize courses within organizations
- Structure content into modules and sections
- Support for multiple content formats (videos, PDFs, text, etc.)
- Assignment creation and submission system

### Enrollment System
- Students can request to join courses
- Teachers can approve/reject enrollment requests
- Organization admins can manage user access

### Content Management
- Upload and manage various types of educational content
- Cloudinary integration for file storage
- Structured content organization

### Assignment System
- Teachers can create and assign coursework
- Students can submit assignments within deadlines
- Teachers can review submissions and provide feedback
- Deadline extension request functionality

### Feedback Mechanism
- Students can review and rate course content
- Comment system for interactive learning

## System Architecture

The application follows a modular architecture with the following core components:

### User Management Module
- Authentication and authorization
- Role-based access control
- User profile management

### Organization Module
- Organization creation and management
- User assignment to organizations

### Course Module
- Course creation and management
- Content organization and structuring
- Enrollment management

### Content Module
- Content upload and management
- Multiple format support
- Feedback system

### Assignment Module
- Assignment creation
- Submission handling
- Feedback and assessment

## Database Schema

The system implements the following key collections:

- **Users**: Stores user information, credentials, and roles
- **Organizations**: Contains organization details and references
- **Courses**: Stores course information and organizational relationships
- **Content**: Manages different types of learning materials
- **Assignments**: Tracks assignments and their requirements
- **Submissions**: Records student submissions for assignments
- **Enrollments**: Manages student enrollments in courses
- **Feedback**: Stores user feedback on content and courses

## API Documentation

The backend exposes RESTful APIs for various functionalities:

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/:role` - Get users by role

### Organization Endpoints
- `POST /api/organizations` - Create a new organization
- `GET /api/organizations` - Get all organizations
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization details

### Course Endpoints
- `POST /api/courses` - Create a new course
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course details

### Content Endpoints
- `POST /api/content` - Add new content
- `GET /api/content/course/:courseId` - Get content for a course
- `PUT /api/content/:id` - Update content
- `DELETE /api/content/:id` - Delete content

### Assignment Endpoints
- `POST /api/assignments` - Create a new assignment
- `GET /api/assignments/course/:courseId` - Get assignments for a course
- `PUT /api/assignments/:id` - Update assignment details
- `POST /api/assignments/:id/submissions` - Submit an assignment

## License
This project is proprietary and developed for Eklavya Foundation.

## Acknowledgements
- Special thanks to Eklavya Foundation for the opportunity to develop this LMS.
- Our course instructors and mentors for their guidance throughout the development process.
