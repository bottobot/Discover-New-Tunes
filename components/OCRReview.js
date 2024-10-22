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
    alignItems: 'center',
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
  addButton: {
    padding: '5px 10px',
    marginRight: '10px',
    cursor: 'pointer',
    fontSize: '20px',
    lineHeight: '1',
  },
  summaryText: {
    marginBottom: '20px',
    fontStyle: 'italic',
  },
};

const OCRReview = ({ initialData, onConfirm }) => {
  const [eventInfo, setEventInfo] = useState({
    eventName: '',
    eventDate: '',
    eventLocation: '',
  });
  const [artists, setArtists] = useState([]);
  const [fullText, setFullText] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('OCRReview: initialData received:', JSON.stringify(initialData, null, 2));
    if (initialData && Array.isArray(initialData.artists)) {
      console.log('Setting artists state with:', initialData.artists);
      setArtists(initialData.artists.map(artist => ({ name: artist, confidence: 'unknown' })));
      setFullText(initialData.fullText || '');
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

  const handleAddArtist = (index) => {
    const newArtists = [...artists];
    newArtists.splice(index + 1, 0, { name: '', confidence: 'unknown' });
    setArtists(newArtists);
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
      <p style={styles.summaryText}>{fullText}</p>
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
      <p>Please review and edit the possible artist names extracted from the image:</p>
      {artists.length > 0 ? (
        artists.map((artist, index) => (
          <div key={index} style={styles.artistInput}>
            <button onClick={() => handleAddArtist(index)} style={styles.addButton}>+</button>
            <input
              type="text"
              value={artist.name || ''}
              onChange={(e) => handleArtistChange(index, 'name', e.target.value)}
              style={styles.artistName}
            />
            <select
              value={artist.confidence || 'unknown'}
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
        <p>No potential artists found. You can add artists manually.</p>
      )}
      <button onClick={() => handleAddArtist(artists.length - 1)} style={styles.button}>Add Artist</button>
      <button onClick={() => {
        console.log('Confirming OCR review with data:', { eventInfo, artists });
        onConfirm({ eventInfo, artists: artists.map(a => a.name) });
      }} style={styles.button}>Confirm</button>
    </div>
  );
};

export default OCRReview;
