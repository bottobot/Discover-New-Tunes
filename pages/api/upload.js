import formidable from 'formidable';
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
}

export default async function handler(req, res) {
  logMessage('Upload handler called');
  logMessage(`Request method: ${req.method}`);
  logMessage(`Request headers: ${JSON.stringify(req.headers)}`);

  if (req.method !== 'POST') {
    logMessage(`Method not allowed: ${req.method}`, 'error');
    return res.status(405).json({ error: `Method not allowed: ${req.method}` });
  }

  // Set a longer timeout (10 minutes)
  res.setTimeout(600000, () => {
    logMessage('Request timed out after 10 minutes', 'error');
    res.status(504).json({ error: 'Request timed out' });
  });

  try {
    logMessage('Initializing form parser');
    const form = new formidable.IncomingForm();
    form.maxFileSize = MAX_FILE_SIZE;

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    logMessage('Form parsed successfully');
    logMessage(`Fields: ${JSON.stringify(fields)}`);
    logMessage(`Files: ${JSON.stringify(files)}`);

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
    
    logMessage('Starting image processing');
    logMessage(`File path: ${file.filepath}`);
    const processingStartTime = Date.now();
    const result = await processImage(file.filepath);
    const processingEndTime = Date.now();
    logMessage(`Image processing completed in ${processingEndTime - processingStartTime}ms`);
    logMessage(`Result: ${JSON.stringify(result, null, 2)}`);
    return res.status(200).json(result);
  } catch (error) {
    logMessage(`Error in upload handler: ${error.message}`, 'error');
    logMessage(`Error stack: ${error.stack}`, 'error');
    return res.status(500).json({ 
      error: 'Upload failed', 
      message: error.message,
      stack: error.stack,
      details: JSON.stringify(error, Object.getOwnPropertyNames(error))
    });
  }
}
