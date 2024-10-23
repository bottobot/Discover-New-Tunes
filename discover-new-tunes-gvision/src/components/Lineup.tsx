import React, { useEffect } from 'react';
import styles from './Lineup.module.css';

export interface LineupProps {
  eventInfo: {
    eventName: string;
    eventDate: string;
    eventLocation: string;
  };
  artists: string[];
  lineup: string | null;
  deleteArtistValue: (text: string) => Promise<void>;
  reset: () => void;
  artistLinks: Record<string, { spotifyUrl: string; soundcloudUrl: string }>;
  fetchArtistLinks: (artistsToFetch: string[]) => Promise<void>;
  isProcessing: boolean;
}

const Lineup: React.FC<LineupProps> = ({
  eventInfo,
  artists,
  lineup,
  deleteArtistValue,
  reset,
  artistLinks,
  fetchArtistLinks,
  isProcessing
}) => {
  useEffect(() => {
    if (artists.length > 0 && Object.keys(artistLinks).length === 0) {
      fetchArtistLinks(artists);
    }
  }, [artists, artistLinks, fetchArtistLinks]);

  return (
    <div className={styles.lineup}>
      <h2>{eventInfo.eventName} Lineup</h2>
      <p>{eventInfo.eventDate} - {eventInfo.eventLocation}</p>
      {isProcessing ? (
        <p>Processing artist links...</p>
      ) : (
        <ul className={styles.artistList}>
          {artists.map((artist, index) => (
            <li key={index} className={styles.artistItem}>
              <span className={styles.artistName}>{artist}</span>
              {artistLinks[artist]?.spotifyUrl && (
                <a
                  href={artistLinks[artist].spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotifyButton}
                >
                  Spotify
                </a>
              )}
              <button
                onClick={() => deleteArtistValue(artist)}
                className={styles.deleteButton}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
      <button onClick={reset} className={styles.resetButton}>Reset</button>
    </div>
  );
};

export default Lineup;
