import React from 'react';

export interface OCRReviewProps {
  initialData: {
    artists: string[];
    fullText: string;
  };
  onConfirm: (confirmedData: any) => void;
}

const OCRReview: React.FC<OCRReviewProps> = ({ initialData, onConfirm }) => {
  // Component implementation
  return (
    <div>
      <h2>OCR Review</h2>
      {/* Add your OCR review UI here */}
      <button onClick={() => onConfirm(initialData)}>Confirm</button>
    </div>
  );
};

export default OCRReview;
