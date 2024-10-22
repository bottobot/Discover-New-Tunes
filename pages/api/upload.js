export default function handler(req, res) {
  if (req.method === 'POST') {
    // This is just a placeholder response since image processing is now client-side
    res.status(200).json({ message: 'Image processing is now handled on the client side.' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
