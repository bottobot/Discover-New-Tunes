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

export default function handler(req, res) {
  return new Promise((resolve, reject) => {
    logMessage('Upload handler called');
    logMessage(`Request method: ${req.method}`);
    logMessage(`Request headers: ${JSON.stringify(req.headers)}`);

    if (req.method !== 'POST') {
      logMessage(`Method not allowed: ${req.method}`, 'error');
      res.status(405).json({ error: `Method not allowed: ${req.method}` });
      return resolve();
    }

    const form = new formidable.IncomingForm();
    form.maxFileSize = MAX_FILE_SIZE;

    form.parse(req, async (err, fields, files) => {
      if (err) {
        logMessage(`Form parsing error: ${err.message}`, 'error');
        logMessage(`Form parsing error stack: ${err.stack}`, 'error');
        res.status(500).json({ error: 'Form parsing failed', details: err.message });
        return resolve();
      }

      logMessage('Form parsed successfully');
      logMessage(`Fields: ${JSON.stringify(fields)}`);
      logMessage(`Files: ${JSON.stringify(files)}`);

      const file = files.file;

      if (!file) {
        logMessage('No file uploaded', 'error');
        res.status(400).json({ error: 'No file uploaded' });
        return resolve();
      }

      if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        logMessage(`Invalid file type: ${file.mimetype}`, 'error');
        res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG, and GIF are allowed.' });
        return resolve();
      }

      logMessage(`File received: ${file.originalFilename}`);
      logMessage(`File size: ${file.size} bytes`);
      logMessage(`File type: ${file.mimetype}`);
      
      try {
        logMessage('Starting image processing');
        logMessage(`File path: ${file.filepath}`);
        const result = await processImage(file.filepath);
        logMessage('Image processed successfully');
        logMessage(`Result: ${JSON.stringify(result, null, 2)}`);
        res.status(200).json(result);
        return resolve();
      } catch (processError) {
        logMessage(`Image processing error: ${processError.message}`, 'error');
        logMessage(`Image processing error stack: ${processError.stack}`, 'error');
        logMessage(`Error details: ${JSON.stringify(processError, Object.getOwnPropertyNames(processError))}`, 'error');
        res.status(500).json({ 
          error: 'Image processing failed', 
          message: processError.message,
          stack: processError.stack,
          details: JSON.stringify(processError, Object.getOwnPropertyNames(processError))
        });
        return resolve();
      }
    });

    // Add a timeout to catch potential hanging requests
    const timeout = setTimeout(() => {
      logMessage('Request timed out', 'error');
      res.status(504).json({ error: 'Request timed out' });
      return resolve();
    }, 50000); // 50 seconds timeout

    // Clear the timeout if the request completes
    res.on('finish', () => {
      clearTimeout(timeout);
    });
  });
}
