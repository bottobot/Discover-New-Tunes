import React from 'react';

interface NotificationProps {
  show: boolean;
  message: string;
  type: string;
}

const Notification: React.FC<NotificationProps> = ({ show, message, type }) => {
  if (!show) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;
