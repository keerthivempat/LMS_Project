import mongoose from 'mongoose';
import { User } from "./src/models/schema.model.js";
import dotenv from 'dotenv';

dotenv.config();

const addSuperAdmin = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            "mongodb://admin:Eklavya%401111@43.229.225.107:27017/lms?authSource=admin",
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            }
        );

        // console.log(`\nMongoDB connected successfully to host: ${connectionInstance.connection.host}\n`);

        // Check if superadmin already exists
        const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
        
        if (existingSuperAdmin) {
            // console.log('Superadmin already exists with credentials:');
            // console.log(`Email: ${existingSuperAdmin.email}`);
            // console.log(`Username: ${existingSuperAdmin.username}`);
            // console.log('Password: [Not shown for security reasons, use "SuperAdmin123" if this is a test environment]');
        } else {
            // Create superadmin user
            const superAdmin = await User.create({
                name: 'Super Admin',
                username: 'superadmin',
                email: 'superadmin@example.com',
                password: 'SuperAdmin123',
                role: 'superadmin',
                isEmailVerified: true,
                isActive: true
            });
            
            // console.log('Superadmin created successfully with credentials:');
            // console.log(`Email: ${superAdmin.email}`);
            // console.log(`Username: ${superAdmin.username}`);
            // console.log('Password: SuperAdmin123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error adding superadmin:', error);
        process.exit(1);
    }
};

addSuperAdmin(); 