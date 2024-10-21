import { useState, useEffect } from 'react';
import styles from '../styles/Lineup.module.scss';
import Image from 'next/image';
import HomeLink from '../components/HomeLink';

export default function Lineup() {
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState(null);
  const [expandedArtist, setExpandedArtist] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      const response = await fetch('/api/get-artists');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched artists:', data);
      
      // Fetch Spotify details for each artist
      const artistsWithDetails = await Promise.all(data.map(async (artist) => {
        try {
          const details = await fetchArtistDetails(artist);
          return { ...details, originalName: artist };
        } catch (error) {
          console.error(`Error fetching details for ${artist}:`, error);
          return { name: artist, originalName: artist, spotifyUrl: null };
        }
      }));

      setArtists(artistsWithDetails);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError(error.message);
    }
  };

  const fetchArtistDetails = async (artist) => {
    try {
      const response = await fetch(`/api/search-artist?artist=${encodeURIComponent(artist)}`);
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Artist not found: ${artist}`);
          return { name: artist, spotifyUrl: null };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching details for ${artist}:`, error);
      return { name: artist, spotifyUrl: null };
    }
  };

  const toggleArtistExpansion = (index) => {
    setExpandedArtist(expandedArtist === index ? null : index);
  };

  if (error) {
    return (
      <div>
        <HomeLink />
        <div className={styles.error}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <HomeLink />
      <h1>Artist Lineup</h1>
      {artists.length === 0 ? (
        <p>Loading artists...</p>
      ) : (
        <ul className={styles.artistList}>
          {artists.map((artist, index) => (
            <li key={index} className={styles.artistItem}>
              <div className={styles.artistHeader} onClick={() => toggleArtistExpansion(index)}>
                {artist.images && artist.images.length > 0 && (
                  <Image 
                    src={artist.images[artist.images.length - 1].url} 
                    alt={artist.name} 
                    width={50} 
                    height={50} 
                    className={styles.artistImage}
                  />
                )}
                <span className={styles.artistName}>{artist.name || artist.originalName}</span>
                {artist.genres && artist.genres.length > 0 && (
                  <span className={styles.artistGenres}>{artist.genres.join(', ')}</span>
                )}
                {artist.spotifyUrl && (
                  <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" className={styles.spotifyLink}>
                    <Image src="/spotify-icon.png" alt="Spotify" width={24} height={24} />
                  </a>
                )}
              </div>
              {expandedArtist === index && (
                <div className={styles.artistDetails}>
                  {artist.popularity && (
                    <p>Popularity: {artist.popularity}</p>
                  )}
                  {artist.followers && (
                    <p>Followers: {artist.followers.toLocaleString()}</p>
                  )}
                  {artist.topTracks && artist.topTracks.length > 0 && (
                    <div>
                      <h3>Top Tracks:</h3>
                      <ul>
                        {artist.topTracks.map((track, trackIndex) => (
                          <li key={trackIndex}>
                            <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer">
                              {track.name}
                            </a>
                            {track.previewUrl && (
                              <audio controls src={track.previewUrl}>
                                Your browser does not support the audio element.
                              </audio>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
