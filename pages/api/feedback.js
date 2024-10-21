import fs from 'fs';
import path from 'path';

const feedbackPath = path.join(process.cwd(), 'feedback.json');

function loadFeedbackData() {
  try {
    const data = fs.readFileSync(feedbackPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log('No existing feedback data found. Starting with empty dataset.');
    return {};
  }
}

function saveFeedbackData(data) {
  fs.writeFileSync(feedbackPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { text, isArtist } = req.body;

  if (typeof text !== 'string' || text.trim().length === 0 || typeof isArtist !== 'boolean') {
    return res.status(400).json({ error: 'Invalid feedback data.' });
  }

  try {
    const feedbackData = loadFeedbackData();
    feedbackData[text.toLowerCase()] = isArtist;
    saveFeedbackData(feedbackData);

    // Update the excluded words list if the text is not an artist
    if (!isArtist) {
      const excludedWordsPath = path.join(process.cwd(), 'excluded_words.json');
      let excludedWords = [];
      try {
        excludedWords = JSON.parse(fs.readFileSync(excludedWordsPath, 'utf8'));
      } catch (error) {
        console.log('No existing excluded words found. Starting with empty list.');
      }
      if (!excludedWords.includes(text.toUpperCase())) {
        excludedWords.push(text.toUpperCase());
        fs.writeFileSync(excludedWordsPath, JSON.stringify(excludedWords, null, 2));
      }
    }

    res.status(200).json({ message: 'Feedback received and saved.' });
  } catch (error) {
    console.error('Error processing feedback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
