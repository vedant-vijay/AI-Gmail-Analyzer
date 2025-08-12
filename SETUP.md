# AI Email Assistant - Complete Setup Guide

Transform your Gmail into an intelligent assistant that helps you manage freelancing emails, never miss opportunities, and stay organized with AI-powered insights.

## 🎯 What This Does

- **Smart Email Analysis**: AI categorizes emails as client work, job opportunities, payments, meetings, etc.
- **Intelligent Summaries**: Get concise summaries with actionable insights and tips
- **Priority Detection**: Automatically identifies urgent emails from freelancing platforms
- **Pattern Analysis**: Provides insights about your email habits and recommendations
- **Actionable Tips**: Get personalized advice for each email based on freelancing context

---

## 📋 Prerequisites

- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org/))
- **Gmail Account** (the one you want to manage)
- **Google Cloud Account** (free tier is sufficient)

---

## 🚀 Quick Start (5 Minutes)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd ai-email-assistant
npm install
```

### 2. Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: **"AI Email Assistant"**
3. Enable Gmail API:
   - Search for "Gmail API" in the search bar
   - Click "Enable"
4. Create OAuth2 credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URI: `http://localhost:8080/api/auth/google/callback`
   - Download the JSON file

### 3. Environment Setup
Create `.env` file in the project root:
```env
# Required - Google OAuth2 (from your downloaded JSON)
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:8080/api/auth/google/callback

# Required - JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Optional - AI Services (for enhanced summaries)
OPENAI_API_KEY=your_openai_key_here
HUGGINGFACE_API_KEY=your_huggingface_key_here

# Optional - Custom settings
PING_MESSAGE=AI Email Assistant is running!
```

### 4. Start the Application
```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) and sign in with your Gmail account!

---

## 🔧 Detailed Configuration

### Google Cloud Console Setup (Step by Step)

#### Step 1: Create Google Cloud Project
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Project name: **"AI Email Assistant"**
4. Click "Create"

#### Step 2: Enable Gmail API
1. In the dashboard, click "APIs & Services" → "Library"
2. Search for "Gmail API"
3. Click on "Gmail API" and click "Enable"
4. Wait for activation (usually takes 1-2 minutes)

#### Step 3: Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" (unless you have Google Workspace)
3. Fill in required fields:
   - **App name**: AI Email Assistant
   - **User support email**: Your email
   - **Developer contact**: Your email
4. Add scopes:
   - `https://www.googleapis.com/auth/gmail.readonly`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
5. Add test users (your Gmail address)
6. Save and continue

#### Step 4: Create OAuth2 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Application type: **Web application**
4. Name: **AI Email Assistant**
5. Authorized JavaScript origins:
   - `http://localhost:8080`
6. Authorized redirect URIs:
   - `http://localhost:8080/api/auth/google/callback`
7. Click "Create"
8. **Download the JSON file** - you'll need the client ID and secret

---

## 🤖 AI Integration Setup

### Option 1: OpenAI (Recommended - Best Quality)
1. Visit [OpenAI Platform](https://platform.openai.com)
2. Create account and add payment method
3. Generate API key: Dashboard → API Keys → Create
4. Add to `.env`: `OPENAI_API_KEY=sk-...`
5. **Cost**: ~$0.01-0.05 per email analyzed

### Option 2: Hugging Face (Free Tier)
1. Visit [Hugging Face](https://huggingface.co)
2. Create free account
3. Go to Settings → Access Tokens → New token
4. Add to `.env`: `HUGGINGFACE_API_KEY=hf_...`
5. **Cost**: Free (with rate limits)

### Option 3: No AI Service (Fallback)
- The app works without AI APIs using smart rule-based analysis
- You'll get good categorization but basic summaries
- Perfect for testing and development

---

## 🏗️ Project Structure

```
ai-email-assistant/
├── client/                    # React frontend
│   ├── components/           # UI components
│   ├── contexts/            # Auth context
│   ├── pages/               # App pages
│   └── global.css           # Tailwind styles
├── server/                   # Express backend
│   ├── services/            # Business logic
│   │   ├── gmail.ts         # Gmail API integration
│   │   └── ai.ts            # AI analysis service
│   ├── routes/              # API endpoints
│   │   ├── auth.ts          # Authentication
│   │   └── emails.ts        # Email operations
│   └── index.ts             # Server entry point
├── shared/                   # Shared types
│   └── api.ts               # API interfaces
├── .env                     # Environment variables
└── package.json            # Dependencies
```

---

## 🔌 API Endpoints

### Authentication
- `GET /api/auth/google` - Start Google OAuth flow
- `GET /api/auth/google/callback` - OAuth callback
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### Email Operations (Authenticated)
- `GET /api/emails` - Get all emails with AI analysis
- `GET /api/emails/important` - Get high-priority emails only
- `GET /api/emails/search?q=keyword` - Search emails
- `GET /api/emails/insights` - Get AI-powered insights and recommendations
- `GET /api/accounts` - Get connected accounts
- `POST /api/emails/sync` - Trigger email sync

---

## 🎨 Frontend Features

### Dashboard Components
- **Email Cards**: Show sender, subject, AI summary, tags, and action items
- **Smart Filters**: All emails, Important only, Unread only
- **Search**: Real-time search across all email content
- **Stats Panel**: Total emails, unread count, important emails
- **AI Insights**: Pattern analysis and recommendations

### AI-Enhanced Email Display
Each email shows:
- **Smart Summary**: AI-generated concise summary
- **Action Items**: Specific tasks extracted from email
- **Tips**: Contextual advice for freelancers
- **Category**: Auto-detected (client work, job opportunity, payment, etc.)
- **Sentiment**: Positive, neutral, or negative tone
- **Estimated Read Time**: How long the full email takes to read
- **Suggested Response**: Template responses for common scenarios

---

## 🔐 Security & Privacy

### Data Protection
- **OAuth2 Security**: Industry-standard authentication
- **No Email Storage**: Emails are never stored on our servers
- **JWT Tokens**: Secure session management
- **Local Processing**: AI analysis happens in real-time

### What We Access
- **Read-only Gmail access**: We can only read, never send or delete
- **Email metadata**: Sender, subject, date, read status
- **Email content**: For AI analysis only
- **User profile**: Name and email for identification

### What We Don't Do
- ❌ Store your emails
- ❌ Send emails on your behalf
- ❌ Share data with third parties
- ❌ Access other Google services

---

## 🚀 Deployment Options

### Option 1: Local Development
```bash
npm run dev
# Runs on http://localhost:8080
```

### Option 2: Production Build
```bash
npm run build
npm start
# Optimized for production
```

### Option 3: Deploy to Render (Free)
1. Push code to GitHub
2. Connect to [Render](https://render.com)
3. Add environment variables
4. Update redirect URI to your Render URL

### Option 4: Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Add environment variables in Vercel dashboard
4. Update Google OAuth redirect URI

### Option 5: Deploy to Railway
1. Connect GitHub to [Railway](https://railway.app)
2. Add environment variables
3. Deploy automatically on push

---

## 🛠️ Troubleshooting

### Common Issues

#### "Error 403: access_denied"
- **Cause**: OAuth consent screen not configured
- **Fix**: Complete OAuth consent screen setup in Google Cloud Console
- **Add your email** as a test user if app is not verified

#### "Gmail authorization expired"
- **Cause**: Refresh token expired or revoked
- **Fix**: Sign out and sign in again
- **Prevention**: Don't revoke access in Google Account settings

#### "Failed to fetch emails"
- **Cause**: API rate limits or network issues
- **Fix**: Wait a moment and try again
- **Check**: Gmail API quotas in Google Cloud Console

#### "AI analysis not working"
- **Cause**: No AI API key configured
- **Fix**: Add OPENAI_API_KEY or HUGGINGFACE_API_KEY to .env
- **Fallback**: App works with rule-based analysis

#### "Redirect URI mismatch"
- **Cause**: Redirect URI doesn't match Google OAuth settings
- **Fix**: Ensure redirect URI in Google Cloud Console matches exactly:
  - Development: `http://localhost:8080/api/auth/google/callback`
  - Production: `https://yourdomain.com/api/auth/google/callback`

### Email Not Showing Up
- **Gmail delay**: Sometimes takes 1-2 minutes for new emails to appear
- **Filters**: Check if emails are in spam or other folders
- **Scope**: We only read emails from 'inbox' label

### Performance Issues
- **Large inboxes**: Limit email fetch to recent emails (currently 50)
- **AI analysis**: Can be slow with OpenAI API, faster with Hugging Face
- **Rate limits**: Some AI services have request limits

---

## 📊 Understanding AI Analysis

### Email Categories
- **client_work**: Emails from clients or project-related communication
- **job_opportunity**: Job postings, interview invitations, freelance gigs
- **payment**: Invoices, payment confirmations, financial matters
- **meeting**: Meeting invitations, schedule requests
- **marketing**: Newsletters, promotional content
- **personal**: Personal communications
- **other**: Everything else

### Urgency Levels
- **Critical**: Immediate attention required (urgent, emergency, ASAP)
- **High**: Important but not urgent (important, deadline, soon)
- **Medium**: Normal priority (notification, update, reminder)
- **Low**: No immediate action needed

### Smart Tags
Automatically extracted based on content:
- **urgent**, **deadline**, **project**, **client**
- **interview**, **job offer**, **payment**, **invoice**
- **meeting**, **call**, **schedule**
- **freelance**, **upwork**, **linkedin**

---

## 🔄 Development

### Running in Development Mode
```bash
npm run dev
# Frontend: http://localhost:8080
# Backend: Express server integrated with Vite
# Hot reload: Both client and server code
```

### Building for Production
```bash
npm run build        # Build both client and server
npm run build:client # Build only React frontend
npm run build:server # Build only Express backend
```

### Testing
```bash
npm test            # Run all tests
npm run typecheck   # TypeScript validation
```

### Code Structure
- **TypeScript**: Full type safety across client and server
- **Shared types**: Email interfaces shared between frontend and backend
- **Modern React**: Hooks, context, and functional components
- **Express**: RESTful API with middleware
- **Tailwind CSS**: Utility-first styling

---

## 🤝 Support & Contributing

### Getting Help
- **Issues**: Open a GitHub issue for bugs or feature requests
- **Questions**: Check this README first, then open a discussion
- **Documentation**: This file covers 95% of common questions

### Contributing
1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Roadmap
- [ ] Multiple Gmail account support
- [ ] Email templates and auto-responses
- [ ] Calendar integration
- [ ] Advanced AI insights and trends
- [ ] Mobile app
- [ ] Slack/Discord notifications

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

- **Gmail API**: For robust email access
- **OpenAI**: For intelligent email analysis
- **Hugging Face**: For free AI models
- **React & Express**: For solid full-stack foundation
- **Tailwind CSS**: For beautiful, responsive design

---

**Ready to transform your email management? Follow the setup steps above and never miss another important freelancing opportunity!** 🚀

*Questions? Issues? Open a GitHub issue and we'll help you get up and running!*
