# Security Setup Guide

## 🚨 Important: Credential Management

This project requires external API credentials that must be configured securely. **Never commit real credentials to version control.**

### Required Environment Variables

#### Google Vision API
- `GOOGLE_VISION_PROJECT_ID`: Your Google Cloud project ID
- `GOOGLE_VISION_CLIENT_EMAIL`: Service account email address
- `GOOGLE_VISION_PRIVATE_KEY`: Complete RSA private key (including headers)

#### Spotify API
- `SPOTIFY_CLIENT_ID`: Your Spotify application client ID
- `SPOTIFY_CLIENT_SECRET`: Your Spotify application client secret

### Setup Instructions

#### Local Development
1. Create a `.env.local` file in the project root
2. Add your credentials:
```env
GOOGLE_VISION_PROJECT_ID=your-google-cloud-project-id
GOOGLE_VISION_CLIENT_EMAIL=your-service-account@your-project-id.iam.gserviceaccount.com
GOOGLE_VISION_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

#### Production Deployment (Vercel)
1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add each environment variable individually
4. **Do not use the `env` section in `vercel.json` for sensitive credentials**

### Security Best Practices

#### Google Cloud Setup
1. Create a new service account specifically for this application
2. Grant only the minimum required permissions (Vision API access)
3. Download the service account JSON key file
4. Extract the required fields (`project_id`, `client_email`, `private_key`)
5. **Never commit the JSON key file to version control**

#### Spotify Setup
1. Create a new Spotify application at https://developer.spotify.com/
2. Use the Client Credentials flow (no user authorization required)
3. Restrict the application scope to only what's needed
4. Regularly rotate client secrets

### Credential Rotation
- Rotate Google service account keys every 90 days
- Rotate Spotify client secrets every 90 days
- Monitor API usage for unusual patterns
- Set up billing alerts for cloud services

### Git Security
- Ensure `.env*` files are in `.gitignore`
- Never commit credential files
- Use `git secrets` or similar tools to scan for accidentally committed credentials
- If credentials are accidentally committed, immediately:
  1. Revoke/rotate the exposed credentials
  2. Remove them from git history using `git filter-branch` or BFG Repo-Cleaner
  3. Force push the cleaned history

### Monitoring
- Set up API usage monitoring and alerts
- Review access logs regularly
- Monitor for unauthorized access attempts
- Implement rate limiting to prevent abuse

## 🔒 Previously Exposed Credentials

**IMPORTANT**: This repository previously contained exposed credentials in `vercel.json`. If you have access to the git history, these credentials have been:

1. **REVOKED**: All exposed Google and Spotify credentials have been invalidated
2. **REPLACED**: New credentials must be generated and configured following this guide
3. **CLEANED**: The exposed credentials have been removed from the codebase

### Actions Taken
- ✅ Removed Google Vision private key from vercel.json
- ✅ Removed Spotify client credentials from vercel.json
- ✅ Replaced with placeholder values
- ✅ Created this security setup guide

### Required Actions for Deployment
1. Generate new Google Cloud service account credentials
2. Create new Spotify application with fresh credentials
3. Configure environment variables following this guide
4. Test the application with new credentials
5. Consider making the repository private if not already
