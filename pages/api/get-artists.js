import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'GET') {
    try {
      console.log('GET request received for /api/get-artists');
      
      // Read the artists from a JSON file
      const filePath = path.join(process.cwd(), 'data', 'artists.json');
      console.log('Attempting to read file:', filePath);
      
      if (!fs.existsSync(filePath)) {
        console.error('File does not exist:', filePath);
        return res.status(404).json({ message: 'Artists data file not found' });
      }

      const fileContents = fs.readFileSync(filePath, 'utf8');
      console.log('File contents:', fileContents);

      const artists = JSON.parse(fileContents);
      console.log('Parsed artists:', artists);

      // Sort the artists alphabetically
      const sortedArtists = artists.sort((a, b) => a.localeCompare(b));

      console.log('Sorted artists:', sortedArtists);

      res.status(200).json(sortedArtists);
    } catch (error) {
      console.error('Error reading artists:', error);
      res.status(500).json({ message: 'Error fetching artists', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
