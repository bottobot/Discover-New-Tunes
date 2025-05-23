# Discover New Tunes

A web application that helps you discover new music by extracting artist names from festival lineup images and finding their music on streaming platforms.

## 🚨 Security Notice

**IMPORTANT**: This repository previously contained exposed API credentials. All exposed credentials have been:
- ✅ **REVOKED** and are no longer functional
- ✅ **REMOVED** from the codebase and replaced with placeholders
- ✅ **DOCUMENTED** with proper security setup instructions

**Before deploying this application, you MUST generate new credentials following the security setup guide.**

## 🔧 Setup Instructions

### 1. Credential Configuration
**⚠️ CRITICAL**: Follow the [SECURITY_SETUP.md](./SECURITY_SETUP.md) guide for secure credential management.

**Required Environment Variables:**
- `GOOGLE_VISION_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_VISION_CLIENT_EMAIL`: Service account email
- `GOOGLE_VISION_PRIVATE_KEY`: Complete RSA private key
- `SPOTIFY_CLIENT_ID`: Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret

### 2. Local Development
```bash
# Clone the repository
git clone <repository-url>
cd discover-new-tunes

# Install dependencies
npm install

# Create environment file (never commit this file)
cp .env.example .env.local

# Add your credentials to .env.local following SECURITY_SETUP.md
# Then run the development server
npm run dev
```

### 3. Production Deployment (Vercel)
```bash
# Deploy to Vercel
vercel

# Configure environment variables in Vercel Dashboard:
# Go to Project Settings → Environment Variables
# Add each credential individually (DO NOT use vercel.json env section)
```

## 🛠 Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm test         # Run tests
```

## 📁 Project Structure

```
src/
├── app/                 # Next.js app directory
│   ├── api/            # API routes
│   │   ├── upload/     # Image upload endpoint
│   │   ├── search-spotify/ # Spotify search endpoint
│   │   └── search-artists/ # Artist search endpoint
│   └── error-details/  # Error handling pages
├── components/         # React components
├── utils/             # Utility functions
│   ├── googleVision.ts    # Google Vision API client
│   ├── spotifyClient.ts   # Spotify API client
│   ├── spotifyAuth.ts     # Spotify authentication
│   └── logger.ts          # Logging utility
└── __tests__/         # Test files
```

## 🔒 Security Features

- **Secure Headers**: HSTS, X-Frame-Options, CSP-ready configuration
- **File Upload Security**: Type validation, size limits, signature verification
- **Input Validation**: Sanitized API parameters and error handling
- **Credential Protection**: Environment-based secret management
- **Error Sanitization**: Generic error messages to prevent information disclosure

## 🚀 How It Works

1. **Upload Image**: User uploads a festival lineup image
2. **OCR Processing**: Google Vision API extracts text from the image
3. **Artist Extraction**: Text is parsed to identify artist names
4. **Music Discovery**: Spotify API searches for each artist
5. **Results Display**: Matching artists with Spotify links are shown

## 🔍 API Endpoints

- `POST /api/upload` - Upload and process lineup image
- `GET /api/search-spotify?artist=<name>` - Search for artist on Spotify
- `GET /api/search-artists` - Batch search for multiple artists

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suites
npm test -- --testPathPattern=upload
npm test -- --testPathPattern=ocr
npm test -- --testPathPattern=spotify
```

## 📋 Environment Setup Checklist

- [ ] Read [SECURITY_SETUP.md](./SECURITY_SETUP.md) thoroughly
- [ ] Create new Google Cloud service account with Vision API access
- [ ] Create new Spotify application with Client Credentials flow
- [ ] Configure environment variables securely (never in code)
- [ ] Test application with new credentials
- [ ] Set up monitoring and alerting for API usage
- [ ] Configure credential rotation schedule

## ⚠️ Security Reminders

- **NEVER** commit `.env*` files to version control
- **NEVER** put real credentials in `vercel.json` or any config files
- **ALWAYS** use environment variables for sensitive data
- **REGULARLY** rotate API keys and secrets
- **MONITOR** API usage for suspicious activity
- **REVIEW** access logs periodically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow security best practices
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🔐 Security First**: This application prioritizes security and proper credential management. Always follow the security setup guide and never compromise on credential safety.
