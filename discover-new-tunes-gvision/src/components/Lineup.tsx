import React from 'react';
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
  isProcessing
}) => {
  return (
    <div className={styles.lineup}>
      <h2>{eventInfo.eventName} Lineup</h2>
      <p>{eventInfo.eventDate} - {eventInfo.eventLocation}</p>
      <ul className={styles.artistList}>
        {artists.map((artist, index) => (
          <li key={index} className={styles.artistItem}>
            <span className={styles.artistName}>{artist}</span>
            {artistLinks[artist] ? (
              artistLinks[artist].spotifyUrl ? (
                <a
                  href={artistLinks[artist].spotifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.spotifyButton}
                >
                  Spotify
                </a>
              ) : (
                <span className={styles.noLinkFound}>No Spotify link found</span>
              )
            ) : (
              <span className={styles.loading}>Loading...</span>
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
      {isProcessing && (
        <p className={styles.processingMessage}>Still processing some artist links...</p>
      )}
      <button onClick={reset} className={styles.resetButton}>Reset</button>
    </div>
  );
};

export default Lineup;
