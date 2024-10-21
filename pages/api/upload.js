import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { processImage } from '../../utils/imageProcessing';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function logMessage(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}`;
  if (type === 'error') {
    console.error(logMessage);
  } else {
    console.log(logMessage);
  }
  fs.appendFileSync(path.join(process.cwd(), 'upload.log'), logMessage + '\n');
}

export default async function handler(req, res) {
  logMessage('Upload handler called');

  if (req.method !== 'POST') {
    logMessage('Method not allowed', 'error');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logMessage('Parsing form');
    const form = new formidable.IncomingForm();
    form.maxFileSize = MAX_FILE_SIZE;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        logMessage(`Form parsing error: ${err.message}`, 'error');
        logMessage(`Form parsing error stack: ${err.stack}`, 'error');
        return res.status(500).json({ error: 'Form parsing failed', details: err.message });
      }

      logMessage('Form parsed successfully');
      const file = files.file;

      if (!file) {
        logMessage('No file uploaded', 'error');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        logMessage(`Invalid file type: ${file.mimetype}`, 'error');
        return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' });
      }

      logMessage(`File received: ${file.originalFilename}`);
      logMessage(`File size: ${file.size} bytes`);
      logMessage(`File type: ${file.mimetype}`);
      
      try {
        logMessage('Reading file');
        const imageBuffer = fs.readFileSync(file.filepath);
        logMessage('Image buffer read successfully');
        logMessage('Processing image');
        const result = await processImage(imageBuffer);
        logMessage('Image processed successfully');
        logMessage(`Full result object: ${JSON.stringify(result, null, 2)}`);
        return res.status(200).json(result);
      } catch (processError) {
        logMessage(`Image processing error: ${processError.message}`, 'error');
        logMessage(`Image processing error stack: ${processError.stack}`, 'error');
        return res.status(500).json({ error: 'Image processing failed', details: processError.message, stack: processError.stack });
      }
    });
  } catch (error) {
    logMessage(`Unhandled error: ${error.message}`, 'error');
    logMessage(`Unhandled error stack: ${error.stack}`, 'error');
    return res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
}
