# Discover New Tunes

A web application that helps you discover new music by extracting artist names from festival lineup images and finding their music on streaming platforms.

## Environment Variables

The following environment variables are configured in vercel.json:

### Google Vision API
- `GOOGLE_VISION_PROJECT_ID`
- `GOOGLE_VISION_CLIENT_EMAIL`
- `GOOGLE_VISION_PRIVATE_KEY`

### Spotify API (must be set in Vercel project settings)
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
3. Add Spotify credentials in Vercel project settings
4. Deploy!

## Important Notes

- Google Vision credentials are pre-configured in vercel.json
- Spotify credentials must be added through Vercel's environment variables interface
- The application will redirect to an error page if any credentials are missing or invalid
