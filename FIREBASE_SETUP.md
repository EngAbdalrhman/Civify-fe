# Firebase Setup Instructions for HICv

This document provides instructions for setting up Firebase Authentication and Realtime Database for the HICv AI-Refactor Pro application.

## Prerequisites

- A Google account
- Access to the [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "hicv-ai-refactor")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project console, click on "Authentication" in the left sidebar
2. Click on the "Get started" button
3. Go to the "Sign-in method" tab
4. Enable the following sign-in providers:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and add your project's support email

## Step 3: Set up Realtime Database

1. In your Firebase project console, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location for your database (preferably close to your users)
4. Start in **test mode** for now (you can configure security rules later)
5. Click "Done"

## Step 4: Configure Security Rules

Replace the default rules with the following to ensure users can only access their own data:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

## Step 5: Get Firebase Configuration

1. In your Firebase project console, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to the "Your apps" section
4. Click on the web icon (`</>`) to add a web app
5. Register your app with a nickname (e.g., "HICv Web App")
6. Copy the Firebase configuration object

## Step 6: Update Your Application

1. Open `src/lib/firebase.ts` in your project
2. Replace the placeholder configuration with your actual Firebase config:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## Step 7: Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:9002`
3. You should be redirected to the login page
4. Try creating an account with email/password
5. Try signing in with Google
6. After authentication, you should be able to access the main application
7. Process a CV and save it to test the database functionality
8. Check the dashboard to see your saved CVs

## Database Structure

The application uses the following database structure:

```
users/
  {userId}/
    profile/
      name: string
      email: string
      phone: string
      summary: string
      experience: string
      education: string
      skills: string
    cvs/
      {cvId}/
        id: string
        fileName: string
        rawText: string
        structuredData: object
        profile: object
        createdAt: string
        updatedAt: string
    jobApplications/
      {jobAppId}/
        id: string
        cvId: string
        jobTitle: string
        company: string
        jobDescription: string
        tailoredCV: string
        coverLetter: string
        applicationStatus: string
        createdAt: string
        updatedAt: string
    generatedContent/
      {contentId}/
        id: string
        cvId: string
        type: string
        content: string
        prompt: string
        createdAt: string
    settings/
      theme: string
      notifications: object
      privacy: object
      preferences: object
```

## Features Implemented

✅ **Firebase Authentication**
- Email/password authentication
- Google OAuth sign-in
- Authentication state management
- Protected routes

✅ **Realtime Database**
- Save CV data and parsed information
- Store job applications and generated content
- User profile management
- Real-time data synchronization

✅ **User Dashboard**
- View all saved CVs
- Manage job applications
- Track application status
- Delete and organize CVs

✅ **Data Persistence**
- Automatic saving of processed CVs
- Generated content storage
- User preferences and settings

## Security Considerations

1. **Database Rules**: The security rules ensure users can only access their own data
2. **Authentication Required**: All database operations require user authentication
3. **Client-side Validation**: Form validation prevents invalid data submission
4. **Error Handling**: Proper error handling for failed operations

## Troubleshooting

### Common Issues:

1. **"Permission denied" errors**: Check your database security rules
2. **Authentication not working**: Verify your Firebase config and enabled sign-in methods
3. **Database not saving**: Ensure the Realtime Database is created and rules are set
4. **Google sign-in fails**: Make sure Google provider is enabled and configured

### Debug Steps:

1. Check the browser console for error messages
2. Verify Firebase configuration in `src/lib/firebase.ts`
3. Test authentication in the Firebase Console
4. Check database rules and structure in the Firebase Console

## Next Steps

- Configure production security rules
- Set up Firebase hosting for deployment
- Add email verification for new accounts
- Implement password reset functionality
- Add data export/import features
