import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import 'dotenv/config';
import { Course } from "../models/schema.model.js";
// import clearStudentsArray from "./empty.js";
// const Course = mongoose.model("Course", courseSchema, "courses"); // Ensure collection name is correct

// Course IDs to update
const courseIds = [
  "60c72b2f9b1e8a3c4d8a4e7d",
  "60c72b2f9b1e8a3c4d8a4e79",
  "60c72b2f9b1e8a3c4d8a4e75",
  "60c72b2f9b1e8a3c4d8a4e71",
  "60c72b2f9b1e8a3c4d8a4e67",
  "67ab3df6c4570d4af317c48a"
];

async function clearStudentsArray() {
  try {
    // Connect to MongoDB
    // Update courses
    const result = await Course.updateMany(
      { _id: { $in: courseIds } },
      { $set: { students: [] } } // Empty the students array
    );

    console.log(`Updated ${result.nModified} courses. Students array cleared.`);
  } catch (error) {
    console.error("Error updating courses:", error);
  } finally {
    mongoose.connection.close();
  }
}



export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}`,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoCreate: true // Enable auto creation of collections
            }
        );

        // Import all models to ensure they're registered
        await import("../models/schema.model.js");

        console.log(`\nMongoDB connected successfully to host: ${connectionInstance.connection.host}\n`);
        // clearStudentsArray();
        // Verify collections are created
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
    } catch (error) {
        console.log(`MongoDB connection error: ${error.message}`);
        process.exit(1);
    }
}

export default connectDB;