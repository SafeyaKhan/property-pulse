#!/usr/bin/env node

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.loadEnvFile(path.join(__dirname, "..", ".env"));

const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  image: String,
  createdAt: Date,
});

const propertySchema = new mongoose.Schema({
  owner: mongoose.Schema.Types.ObjectId,
  name: String,
  type: String,
  description: String,
  location: {
    street: String,
    city: String,
    state: String,
    zipcode: String,
  },
  beds: Number,
  baths: Number,
  square_feet: Number,
  amenities: [String],
  rates: {
    weekly: Number,
    monthly: Number,
  },
  seller_info: {
    name: String,
    email: String,
    phone: String,
  },
  images: [String],
  is_featured: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const User = mongoose.model("User", userSchema);
const Property = mongoose.model("Property", propertySchema);

const fixOwners = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✓ Connected to MongoDB");

    // Find safeya user
    const safeya = await User.findOne({ username: "Safeya Rafy Siddiqui" });

    if (!safeya) {
      console.error('✗ User "safeya" not found in database');
      console.log("Available users:");
      const allUsers = await User.find({});
      allUsers.forEach((user) => {
        console.log(`  - ${user.username} (${user.email})`);
      });
      process.exit(1);
    }

    console.log(`Found user: ${safeya.username} (${safeya._id})`);

    // Update all properties to have safeya as owner
    const result = await Property.updateMany({}, { owner: safeya._id });

    console.log(
      `✓ Updated ${result.modifiedCount} properties with owner: ${safeya.username}`,
    );

    await mongoose.disconnect();
    console.log("✓ Done!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error:", error.message);
    process.exit(1);
  }
};

fixOwners();
