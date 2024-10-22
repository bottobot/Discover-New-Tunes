export default function handler(req, res) {
  res.status(200).json({ message: 'Image processing is now handled on the client side.' });
}
