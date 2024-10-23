import React from 'react';

interface ContentLeftProps {
  submitPhoto: (file: File) => void;
  error: boolean;
}

const ContentLeft: React.FC<ContentLeftProps> = ({ submitPhoto, error }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      submitPhoto(event.target.files[0]);
    }
  };

  return (
    <div>
      <h2>Upload Lineup Image</h2>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      {error && <p>Error uploading image. Please try again.</p>}
    </div>
  );
};

export default ContentLeft;
