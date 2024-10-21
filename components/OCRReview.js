import React, { useState, useEffect } from 'react';

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  input: {
    width: '100%',
    padding: '5px',
    marginBottom: '10px',
  },
  artistInput: {
    display: 'flex',
    marginBottom: '10px',
  },
  artistName: {
    flex: 1,
    marginRight: '10px',
    padding: '5px',
  },
  confidence: {
    width: '100px',
    marginRight: '10px',
    padding: '5px',
  },
  button: {
    padding: '5px 10px',
    cursor: 'pointer',
  },
};

const OCRReview = ({ initialData, onConfirm }) => {
  const [eventInfo, setEventInfo] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
  });
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('OCRReview: initialData received:', JSON.stringify(initialData, null, 2));
    if (initialData && Array.isArray(initialData.artists)) {
      console.log('Setting artists state with:', initialData.artists);
      setArtists(initialData.artists);
    } else {
      console.warn('Invalid or missing artists data in initialData');
      setError('Invalid or missing artists data');
    }
  }, [initialData]);

  const handleEventInfoChange = (field, value) => {
    setEventInfo({ ...eventInfo, [field]: value });
  };

  const handleArtistChange = (index, field, value) => {
    const newArtists = [...artists];
    newArtists[index] = { ...newArtists[index], [field]: value };
    setArtists(newArtists);
  };

  const handleAddArtist = () => {
    setArtists([...artists, { name: '', confidence: 'unknown' }]);
  };

  const handleRemoveArtist = (index) => {
    const newArtists = artists.filter((_, i) => i !== index);
    setArtists(newArtists);
  };

  if (error) {
    return <div style={styles.container}><h2>Error: {error}</h2></div>;
  }

  return (
    <div style={styles.container}>
      <h2>Review OCR Results</h2>
      <div>
        <h3>Event Information</h3>
        <input
          type="text"
          value={eventInfo.eventName}
          onChange={(e) => handleEventInfoChange('eventName', e.target.value)}
          placeholder="Event Name"
          style={styles.input}
        />
        <input
          type="text"
          value={eventInfo.eventDate}
          onChange={(e) => handleEventInfoChange('eventDate', e.target.value)}
          placeholder="Event Date"
          style={styles.input}
        />
        <input
          type="text"
          value={eventInfo.eventLocation}
          onChange={(e) => handleEventInfoChange('eventLocation', e.target.value)}
          placeholder="Event Location"
          style={styles.input}
        />
      </div>
      <h3>Artist Names</h3>
      <p>Please review and edit the artist names extracted from the image:</p>
      {artists.length > 0 ? (
        artists.map((artist, index) => (
          <div key={index} style={styles.artistInput}>
            <input
              type="text"
              value={artist.name}
              onChange={(e) => handleArtistChange(index, 'name', e.target.value)}
              style={styles.artistName}
            />
            <select
              value={artist.confidence}
              onChange={(e) => handleArtistChange(index, 'confidence', e.target.value)}
              style={styles.confidence}
            >
              <option value="high">High</option>
              <option value="low">Low</option>
              <option value="unknown">Unknown</option>
            </select>
            <button onClick={() => handleRemoveArtist(index)} style={styles.button}>Remove</button>
          </div>
        ))
      ) : (
        <p>No artists found. You can add artists manually.</p>
      )}
      <button onClick={handleAddArtist} style={styles.button}>Add Artist</button>
      <button onClick={() => {
        console.log('Confirming OCR review with data:', { eventInfo, artists });
        onConfirm({ eventInfo, artists });
      }} style={styles.button}>Confirm</button>
    </div>
  );
};

export default OCRReview;
