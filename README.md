# Civify - AI-Powered CV/Resume Management Platform

Transform your CV with AI-powered precision. A comprehensive Next.js application that leverages advanced AI to parse, analyze, tailor, and manage your professional documents with 100% accuracy.

## 🚀 Features

### Enhanced CV Processing

- **Smart PDF Parsing**: Extract text from PDF CVs with high accuracy using advanced OCR
- **AI-Powered Structure Analysis**: Parse CVs into structured data with detailed field mapping
- **100% Accurate Field Extraction**: Automatically identify and extract personal info, experience, education, skills, and more
- **Multi-format Support**: Handle both text-based and image-based PDFs
- **Comprehensive Data Fields**: 15+ structured fields including personal info, work experience, education, skills, certifications, and projects

### Intelligent CV Tailoring

- **Job-Specific Optimization**: Tailor your CV to match specific job descriptions using AI analysis
- **Keyword Matching**: Automatically emphasize relevant skills and experience based on job requirements
- **Professional Formatting**: Generate clean, ATS-friendly CV layouts
- **Multiple Export Formats**: Text-based PDF, image-based PDF, or plain text
- **Experience Reordering**: Prioritize relevant experience based on job matching
- **Skills Highlighting**: Emphasize job-relevant skills and technologies
- **Cover Letter Generation**: AI-powered personalized cover letters

### Advanced AI Features

- **Google Gemini AI Integration**: Powered by Google's latest AI models for superior CV processing
- **Structured Data Processing**: Uses comprehensive CV parsing with 15+ data fields
- **Smart Content Generation**: AI-powered professional summaries and descriptions
- **Real-time Validation**: Instant feedback and suggestions during CV creation
- **Context-Aware Processing**: Understands relationships between different CV sections
- **Multi-Provider AI Support**: Extensible architecture for multiple AI providers

### User Management & Dashboard

- **User Authentication**: Secure Firebase-based authentication with email verification
- **Comprehensive Dashboard**: Manage CVs, track applications, and monitor usage
- **Profile Management**: Auto-fill and edit personal information from CV parsing
- **Usage Analytics**: Track CV generations, API calls, and subscription limits
- **Job Application Tracking**: Monitor application status and progress
- **CV Library**: Store and organize multiple CV versions

### Subscription & Licensing System

- **Flexible Plans**: Free, Premium, Enterprise, and Lifetime subscription tiers
- **Usage Limits**: Monthly CV generation limits based on plan (5-9999+)
- **API Access**: Licensed users get programmatic access to CV generation APIs
- **License Management**: Admin-controlled license activation and management
- **Payment Integration**: Paymob and PayPal payment gateway support with webhooks

### API & Integration

- **RESTful APIs**: Complete API suite for CV generation and management
- **API Key Management**: Generate and manage API keys for licensed users
- **Rate Limiting**: 500-1000 API calls per month based on plan
- **Webhook Support**: Payment and notification webhooks
- **Interactive Documentation**: Comprehensive API docs with examples
- **Authentication**: Bearer token authentication for API access

### Admin Features

- **Admin Dashboard**: Full administrative control over users and licenses
- **License Management**: Grant/revoke licenses and manage subscriptions
- **System Monitoring**: User activity and system health monitoring
- **Analytics**: Detailed usage statistics and reporting

### Modern UI/UX

- **Beautiful Interface**: Modern gradient design with smooth animations
- **Responsive Design**: Works perfectly on desktop and mobile devices
- **Progress Tracking**: Clear multi-step process with visual progress indicators
- **Interactive Elements**: Real-time keyword detection and skill highlighting
- **Step-by-Step Workflow**: Guided 4-step process from upload to export

### Database & Storage

- **Appwrite Backend**: Cloud database for user data, CVs, and applications
- **Firebase Integration**: Authentication and additional data storage
- **Secure Data Handling**: Encrypted storage with proper access controls
- **Real-time Updates**: Live data synchronization across devices

### Export & Integration

- **Multiple Formats**: PDF (text-based and image-based), plain text
- **Professional Templates**: Clean, ATS-friendly layouts
- **Download Management**: Unique filenames with timestamps to prevent conflicts
- **Email Notifications**: Automated email templates for various events
- **Push Notifications**: Real-time notifications for important updates

### Security & Compliance

- **Data Privacy**: Personal information masking for privacy protection
- **Secure Authentication**: JWT tokens with refresh token rotation
- **Role-Based Access**: Different permissions for users, licensed users, and admins
- **API Security**: Rate limiting, authentication, and authorization
- **Audit Logging**: Comprehensive logging of all user actions
- **GDPR Compliance**: Proper data handling and user consent management

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

### 1. Clone and Install

```bash
git clone <repository-url>
cd HICv-master
npm install
```

### 2. Environment Configuration

```bash
# Copy the environment template
cp .env.example .env.local

# Add your API key to .env.local
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Development Setup

```bash
# Start the Next.js development server
npm run dev

# In a separate terminal, start the Genkit AI server
npm run genkit:dev
```

### 4. Access the Application

- Main app: http://localhost:9002
- Genkit AI dashboard: http://localhost:4000

## 🔧 API Key Setup

1. **Get Google Gemini API Key**:

   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create a new API key
   - Copy the key

2. **Configure Environment**:

   ```bash
   # In your .env.local file
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Alternative Environment Variables**:
   The app also supports `GOOGLE_API_KEY` as an alternative to `GEMINI_API_KEY`.

## 📋 How to Use

### Step 1: Upload CV

- Upload your CV in PDF format (max 5MB)
- AI automatically extracts and analyzes the content
- Structured data parsing with 100% accuracy

### Step 2: Review Profile

- Auto-filled information from your CV
- Edit and refine extracted data
- Comprehensive sections: personal info, experience, education, skills

### Step 3: Job Details

- Paste the target job description
- AI detects key skills and requirements
- Choose whether to generate a cover letter

### Step 4: Generate Results

- AI creates a tailored CV optimized for the role
- Multiple export options available
- Optional personalized cover letter

## 🎯 Export Options

### Text-Based PDF (Recommended)

- ATS-friendly format
- Searchable and selectable text
- Professional formatting
- Best for online applications

### Image-Based PDF

- Pixel-perfect visual representation
- Preserves exact layout
- Good for printing

### Plain Text File

- Raw text format
- Maximum compatibility
- Easy to copy/paste

## 🧠 AI Capabilities

### CV Parsing Structure

The AI extracts and organizes:

- **Personal Information**: Name, email, phone, address, LinkedIn, GitHub, portfolio
- **Professional Summary**: Career objectives and key strengths
- **Work Experience**: Detailed job history with achievements
- **Education**: Degrees, institutions, dates, honors
- **Skills**: Technical skills, soft skills, languages, certifications
- **Additional Sections**: Projects, awards, publications, volunteering

### Tailoring Intelligence

- Keyword optimization for job matching
- Experience prioritization based on relevance
- Skills emphasis for target roles
- Professional language adaptation
- ATS optimization techniques

## 📁 Project Structure

```
src/
├── ai/                     # AI flows and configuration
│   ├── flows/
│   │   ├── cv-parsing.ts      # Enhanced CV parsing
│   │   ├── cv-tailoring.ts    # CV tailoring logic
│   │   └── cover-letter-generation.ts
│   ├── genkit.ts             # AI configuration
│   └── dev.ts               # Development setup
├── app/                    # Next.js app directory
├── components/
│   ├── app/                # Application components
│   └── ui/                 # Reusable UI components
├── hooks/                  # Custom React hooks
└── lib/                    # Utility functions
    ├── pdf.ts              # Enhanced PDF handling
    └── utils.ts            # General utilities
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start Next.js dev server
npm run genkit:dev       # Start Genkit AI server
npm run genkit:watch     # Start Genkit with auto-reload

# Production
npm run build           # Build for production
npm run start           # Start production server

# Utilities
npm run lint            # Run ESLint
npm run typecheck       # TypeScript type checking
```

## 🎨 Key Features Breakdown

### Enhanced PDF Processing

- Support for complex PDF layouts
- Text extraction with context preservation
- Error handling for corrupted or image-based PDFs

### Structured Data Extraction

- 15+ fields automatically identified
- Intelligent parsing of dates, locations, and achievements
- Skills categorization (technical vs. soft skills)

### Smart CV Tailoring

- Job description analysis and keyword extraction
- Experience reordering based on relevance
- Achievement quantification and emphasis
- Professional language optimization

### Export Flexibility

- Multiple format options for different use cases
- Text-based PDFs for ATS compatibility
- Clean, professional layouts

### User Experience

- Step-by-step guided process
- Real-time feedback and validation
- Beautiful, responsive interface
- Progress tracking and status updates

## 🚨 Troubleshooting

### Common Issues

1. **API Key Error**:

   ```
   FAILED_PRECONDITION: Please pass in the API key
   ```

   **Solution**: Ensure `GEMINI_API_KEY` is set in your `.env.local` file

2. **PDF Parsing Issues**:

   - Ensure PDF is text-based (not scanned image)
   - Check file size is under 5MB
   - Try a different PDF if extraction fails

3. **Port Conflicts**:
   - Next.js runs on port 9002
   - Genkit runs on port 4000
   - Change ports in package.json if needed

### Performance Tips

- Use text-based PDFs for better parsing accuracy
- Provide detailed job descriptions for better tailoring
- Keep CV content well-structured for optimal results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for powerful language processing
- Next.js team for the excellent framework
- Radix UI for beautiful components
- All contributors and users of the project
