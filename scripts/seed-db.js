#!/usr/bin/env node

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
process.loadEnvFile(path.join(__dirname, "..", ".env"));

// Import Property model
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

const Property = mongoose.model("Property", propertySchema);

const seedDB = async () => {
  try {
    // Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
    });
    console.log("✓ Connected to MongoDB");

    // Clear existing properties
    console.log("Clearing existing properties...");
    await Property.deleteMany({});
    console.log("✓ Cleared existing data");

    // Read properties.json
    const propertiesPath = path.join(__dirname, "..", "properties.json");
    const propertiesData = JSON.parse(fs.readFileSync(propertiesPath, "utf-8"));

    // Clean data: remove _id (let MongoDB generate), set owner to null, fix image paths
    const cleanedData = propertiesData.map(({ _id, ...property }) => ({
      ...property,
      owner: new mongoose.Types.ObjectId(),
      images: property.images.map((img) => {
        if (img.startsWith("/") || img.startsWith("http")) {
          return img;
        }
        // Use local images from public folder
        return `/images/properties/${img}`;
      }),
    }));

    // Insert properties
    console.log(`Inserting ${cleanedData.length} properties...`);
    const result = await Property.insertMany(cleanedData);
    console.log(`✓ Inserted ${result.length} properties`);

    // Disconnect
    await mongoose.disconnect();
    console.log("✓ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDB();
