# Discover New Tunes

A web application that helps you discover new music by extracting artist names from festival lineup images and finding their music on streaming platforms.

## Environment Variables

The following environment variables must be set in your Vercel project settings:

### Google Vision API
The Google Vision credentials are partially configured in vercel.json, but you need to add the private key:

1. Go to your Vercel project settings
2. Navigate to the Environment Variables section
3. Add a new environment variable:
   - Name: `GOOGLE_VISION_PRIVATE_KEY`
   - Value: (Copy the entire private key from the service account JSON, including the "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----" lines)
   - Scope: Production, Preview, Development

### Spotify API
- `SPOTIFY_CLIENT_ID`: Client ID from Spotify Developer Dashboard
- `SPOTIFY_CLIENT_SECRET`: Client Secret from Spotify Developer Dashboard

## Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the development server: `npm run dev`

## Deployment

1. Push your changes to GitHub
2. Connect your repository to Vercel
3. Configure the private key in your Vercel project settings
4. Deploy!

## Important Notes

- The private key should be added through Vercel's environment variables interface, not directly in vercel.json
- Make sure to replace any `\n` characters in the private key with actual newlines when adding it to Vercel
- The private key should never be committed to the repository
