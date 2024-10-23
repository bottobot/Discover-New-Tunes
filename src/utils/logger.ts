type LogLevel = 'info' | 'warn' | 'error';

interface LogMessage {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

function formatMessage(level: LogLevel, message: string, meta?: Record<string, any>): LogMessage {
  return {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...meta
  };
}

const logger = {
  info(message: string, meta?: Record<string, any>) {
    const logMessage = formatMessage('info', message, meta);
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify(logMessage));
    }
  },

  warn(message: string, meta?: Record<string, any>) {
    const logMessage = formatMessage('warn', message, meta);
    console.warn(JSON.stringify(logMessage));
  },

  error(message: string, meta?: Record<string, any>) {
    const logMessage = formatMessage('error', message, meta);
    console.error(JSON.stringify(logMessage));
  }
};

export default logger;
