import React, { useState, useEffect } from 'react';
import styles from './ArtistList.module.css';

interface ArtistListProps {
  artists: string[];
}

interface ArtistWithSpotify {
  name: string;
  spotifyUrl: string | null;
}

const ArtistList: React.FC<ArtistListProps> = ({ artists }) => {
  const [artistsWithSpotify, setArtistsWithSpotify] = useState<ArtistWithSpotify[]>([]);

  useEffect(() => {
    const fetchSpotifyLinks = async () => {
      const results = await Promise.all(
        artists.map(async (artist) => {
          const spotifyUrl = await searchSpotifyArtist(artist);
          return { name: artist, spotifyUrl };
        })
      );
      setArtistsWithSpotify(results);
    };

    fetchSpotifyLinks();
  }, [artists]);

  const searchSpotifyArtist = async (artistName: string): Promise<string | null> => {
    try {
      const response = await fetch(`/api/search-spotify?artist=${encodeURIComponent(artistName)}`);
      const data = await response.json();
      return data.spotifyUrl || null;
    } catch (error) {
      console.error('Error searching Spotify:', error);
      return null;
    }
  };

  return (
    <div className={styles.artistList}>
      <h2>Artist List with Spotify Links</h2>
      <ul>
        {artistsWithSpotify.map((artist, index) => (
          <li key={index} className={styles.artistItem}>
            <span className={styles.artistName}>{artist.name}</span>
            {artist.spotifyUrl && (
              <a
                href={artist.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.spotifyButton}
              >
                Spotify
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ArtistList;
