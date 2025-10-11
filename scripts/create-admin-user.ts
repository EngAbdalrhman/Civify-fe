/**
 * Script to create admin user in Appwrite
 * Run with: npx tsx scripts/create-admin-user.ts
 */

import { Client, Databases, ID } from "appwrite";

// Configuration
const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "";
const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "";
const USERS_COLLECTION_ID = process.env.NEXT_PUBLIC_APPWRITE_USERS_COLLECTION_ID || "users";

// Admin user details
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "amabdo30@gmail.com";
const ADMIN_USER_ID = process.argv[2]; // Pass Firebase UID as argument

if (!ADMIN_USER_ID) {
  console.error("❌ Error: Please provide the Firebase UID of the admin user");
  console.log("\nUsage: npx tsx scripts/create-admin-user.ts <FIREBASE_UID>");
  console.log("\nExample: npx tsx scripts/create-admin-user.ts abc123xyz456");
  console.log("\nTo get the Firebase UID:");
  console.log("1. Login to your app with the admin email");
  console.log("2. Check the browser console or Firebase Authentication console");
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log("🚀 Creating admin user in Appwrite...\n");

    // Initialize Appwrite client
    const client = new Client();
    client
      .setEndpoint(APPWRITE_ENDPOINT)
      .setProject(APPWRITE_PROJECT_ID);

    const databases = new Databases(client);

    // Check if user already exists
    try {
      const existingUser = await databases.getDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        ADMIN_USER_ID
      );

      console.log("⚠️  User already exists in Appwrite!");
      console.log("\nCurrent user data:");
      console.log(JSON.stringify(existingUser, null, 2));

      // Update to make admin
      const updated = await databases.updateDocument(
        APPWRITE_DATABASE_ID,
        USERS_COLLECTION_ID,
        ADMIN_USER_ID,
        {
          isAdmin: true,
          email: ADMIN_EMAIL,
          updatedAt: new Date().toISOString(),
        }
      );

      console.log("\n✅ User updated to admin successfully!");
      console.log("\nUpdated user data:");
      console.log(JSON.stringify(updated, null, 2));
      return;
    } catch (error: any) {
      if (error.code !== 404) {
        throw error;
      }
      // User doesn't exist, create new
    }

    // Create admin user
    const newUser = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      USERS_COLLECTION_ID,
      ADMIN_USER_ID, // Use Firebase UID as document ID
      {
        email: ADMIN_EMAIL,
        name: "Admin",
        phone: "",
        summary: "",
        experience: "",
        education: "",
        skills: "",
        isAdmin: true,
        isLicensed: false,
        cvCount: 0,
        cvLimit: 100, // Give admin higher CV limit
        apiUsageCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log("✅ Admin user created successfully!\n");
    console.log("User details:");
    console.log(JSON.stringify(newUser, null, 2));
    console.log("\n🎉 You can now login with the admin email and access the admin dashboard!");
  } catch (error) {
    console.error("❌ Error creating admin user:", error);
    process.exit(1);
  }
}

createAdminUser();

