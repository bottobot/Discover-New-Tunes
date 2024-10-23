import React, { useState, useEffect, KeyboardEvent } from 'react';
import styles from './OCRReview.module.css';
import ArtistList from './ArtistList';

interface OCRReviewProps {
  initialData: {
    artists: string[];
    fullText: string;
  };
  onConfirm: (confirmedData: { artists: string[]; fullText: string }) => void;
}

const OCRReview: React.FC<OCRReviewProps> = ({ initialData, onConfirm }) => {
  const [artists, setArtists] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ [key: number]: Set<string> }>({});
  const [showArtistList, setShowArtistList] = useState(false);

  useEffect(() => {
    // Process the initial data to separate artists
    const processedArtists = initialData.fullText
      .split('\n')
      .flatMap(line => line.split('•'))
      .flatMap(item => item.split(','))
      .flatMap(item => item.split('.')) // Split by periods
      .map(artist => artist.trim())
      .filter(artist => artist.length > 0 && !artist.match(/^\d/)) // Remove empty strings and lines starting with numbers
      .filter(artist => !['JULY', 'BASS COAST', 'MERRITT CANADA', 'CREATIVE', 'BRITISH', 'BC', 'COLUMBIA', 'BASSCOAST.CA'].includes(artist.toUpperCase())) // Remove non-artist text
      .map(artist => artist.replace(/\./g, '')); // Remove any remaining periods

    setArtists(processedArtists);
  }, [initialData]);

  const handleArtistChange = (index: number, value: string) => {
    const updatedArtists = [...artists];
    updatedArtists[index] = value;
    setArtists(updatedArtists);
  };

  const handleAddArtist = (index: number) => {
    const updatedArtists = [...artists];
    const selectedWordsForField = selectedWords[index] || new Set();
    
    if (selectedWordsForField.size > 0) {
      const selectedText = Array.from(selectedWordsForField).join(' ');
      updatedArtists.splice(index + 1, 0, selectedText);
      updatedArtists[index] = updatedArtists[index].split(' ').filter(word => !selectedWordsForField.has(word)).join(' ');
      
      // Clear selection
      const updatedSelectedWords = { ...selectedWords };
      delete updatedSelectedWords[index];
      setSelectedWords(updatedSelectedWords);
    } else {
      updatedArtists.splice(index + 1, 0, '');
    }
    
    setArtists(updatedArtists);
  };

  const handleRemoveArtist = (index: number) => {
    const updatedArtists = artists.filter((_, i) => i !== index);
    setArtists(updatedArtists);
    
    // Clear selection for removed field
    const updatedSelectedWords = { ...selectedWords };
    delete updatedSelectedWords[index];
    setSelectedWords(updatedSelectedWords);
  };

  const handleWordClick = (index: number, word: string) => {
    const updatedSelectedWords = { ...selectedWords };

    // Clear selections in other fields
    Object.keys(updatedSelectedWords).forEach(key => {
      if (parseInt(key) !== index) {
        delete updatedSelectedWords[parseInt(key)];
      }
    });

    if (!updatedSelectedWords[index]) {
      updatedSelectedWords[index] = new Set();
    }
    
    if (updatedSelectedWords[index].has(word)) {
      updatedSelectedWords[index].delete(word);
    } else {
      updatedSelectedWords[index].add(word);
    }
    
    if (updatedSelectedWords[index].size === 0) {
      delete updatedSelectedWords[index];
    }
    
    setSelectedWords(updatedSelectedWords);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault();
      deleteSelectedWords(index);
    }
  };

  const deleteSelectedWords = (index: number) => {
    const selectedWordsForField = selectedWords[index] || new Set();
    if (selectedWordsForField.size > 0) {
      const updatedArtists = [...artists];
      updatedArtists[index] = updatedArtists[index].split(' ').filter(word => !selectedWordsForField.has(word)).join(' ');
      setArtists(updatedArtists);

      // Clear selection
      const updatedSelectedWords = { ...selectedWords };
      delete updatedSelectedWords[index];
      setSelectedWords(updatedSelectedWords);
    }
  };

  const handleMinusClick = (index: number) => {
    const selectedWordsForField = selectedWords[index] || new Set();
    if (selectedWordsForField.size > 0) {
      deleteSelectedWords(index);
    } else {
      // Remove the entire field regardless of whether there's text or not
      handleRemoveArtist(index);
    }
  };

  const handleConfirm = () => {
    const confirmedArtists = artists.filter(artist => artist.trim().length > 0);
    setShowArtistList(true);
    onConfirm({
      artists: confirmedArtists,
      fullText: confirmedArtists.join('\n')
    });
  };

  if (showArtistList) {
    return <ArtistList artists={artists.filter(artist => artist.trim().length > 0)} />;
  }

  return (
    <div className={styles.ocrReview}>
      <h2>OCR Review</h2>
      <div className={styles.instructions}>
        <p>
          Please review the list of names. If more than one artist is in a text box, just select their names and hit the plus button. It will automatically add a new text box and fill in the name. To delete a name, just select it by clicking or pressing it and hit the minus button. To delete a field and all the text, you do not need to select any of it, just hit the minus button.
        </p>
        <p>
          After you&apos;ve confirmed the artist names, hit the "Continue" button in order to upload the list and get all their links to their Spotify and Soundcloud pages in a tidy list for you!
        </p>
      </div>
      <div className={styles.artistsList}>
        {artists.map((artist, index) => (
          <div key={index} className={styles.artistInputContainer}>
            <button
              onClick={() => handleAddArtist(index)}
              className={styles.addButton}
            >
              +
            </button>
            <div 
              className={styles.artistInput}
              onKeyDown={(e) => handleKeyDown(e, index)}
              tabIndex={0}
            >
              {artist.split(' ').map((word, wordIndex) => (
                <span
                  key={wordIndex}
                  onClick={() => handleWordClick(index, word)}
                  className={`${styles.word} ${selectedWords[index]?.has(word) ? styles.selectedWord : ''}`}
                >
                  {word}{' '}
                </span>
              ))}
            </div>
            <button
              onClick={() => handleMinusClick(index)}
              className={styles.removeButton}
            >
              -
            </button>
          </div>
        ))}
      </div>
      <button className={styles.confirmButton} onClick={handleConfirm}>Continue</button>
    </div>
  );
};

export default OCRReview;
