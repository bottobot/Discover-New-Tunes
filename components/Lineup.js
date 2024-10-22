import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PropTypes from 'prop-types';
import styles from '../styles/Lineup.module.scss';

const Lineup = React.memo(({ eventInfo, artists, lineup, deleteArtistValue, reset, artistLinks, fetchArtistLinks, isProcessing }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [fetchedArtists, setFetchedArtists] = useState([]);

    const memoizedFetchArtistLinks = useCallback((artistsToFetch) => {
        console.log('memoizedFetchArtistLinks called with:', artistsToFetch);
        return fetchArtistLinks(artistsToFetch);
    }, [fetchArtistLinks]);

    useEffect(() => {
        console.log('Lineup component useEffect triggered');
        console.log('Lineup component received artists:', artists);
        console.log('Lineup component received artistLinks:', artistLinks);
        
        const unfetchedArtists = artists.filter(artist => !fetchedArtists.includes(artist) && !artistLinks[artist]);
        
        if (unfetchedArtists.length > 0 && !isLoading) {
            console.log('Setting isLoading to true');
            setIsLoading(true);
            memoizedFetchArtistLinks(unfetchedArtists).then(() => {
                console.log('fetchArtistLinks completed, setting isLoading to false');
                setIsLoading(false);
                setFetchedArtists(prev => [...prev, ...unfetchedArtists]);
            });
        } else {
            console.log('No new artists to fetch, keeping isLoading false');
        }
    }, [artists, artistLinks, fetchedArtists, isLoading, memoizedFetchArtistLinks]);

    const getSpotifyLink = (artist) => {
        if (artistLinks[artist]?.spotifyUrl) {
            return artistLinks[artist].spotifyUrl;
        }
        return `https://open.spotify.com/search/${encodeURIComponent(artist)}`;
    };

    const getSpotifyButtonText = (artist) => {
        return artistLinks[artist]?.error ? "Search for artist" : "Listen";
    };

    console.log('Rendering Lineup component, isLoading:', isLoading);
    console.log('Current artists array:', artists);

    if (isProcessing) {
        return (
            <section className={styles.container}>
                <p>Processing image... Please wait.</p>
            </section>
        );
    }

    return (
        <section className={styles.container}>
            <header className={styles.header}>
                <h1>{eventInfo.eventName || 'Your Lineup'}</h1>
                <p>{eventInfo.eventDate} | {eventInfo.eventLocation}</p>
                <button onClick={reset} className={styles.resetButton} aria-label="Reset lineup">
                    RESET
                </button>
            </header>
            <div className={styles.content}>
                {artists.length === 0 ? (
                    <p>No artists found. This could be due to the image quality or content. Please try uploading a different image or manually add artists.</p>
                ) : (
                    <ul className={styles.artistList}>
                        {artists.map((artist) => {
                            console.log('Rendering artist:', artist);
                            return (
                                <li key={artist} className={styles.artistItem}>
                                    <span className={styles.artistName}>{artist}</span>
                                    <div className={styles.artistActions}>
                                        <a href={getSpotifyLink(artist)} target="_blank" rel="noopener noreferrer" className={styles.spotifyButton}>
                                            <Image src="/spotify-icon.png" alt="Spotify" width={32} height={32} />
                                            <span>{getSpotifyButtonText(artist)}</span>
                                        </a>
                                        <button 
                                            onClick={() => deleteArtistValue(artist)}
                                            className={styles.notArtistButton}
                                            aria-label={`Mark ${artist} as not an artist`}
                                        >
                                            Not an Artist
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
                {isLoading && <p>Loading additional artist information...</p>}
                {artists.length > 0 && (
                    <div className={styles.viewFullLineup}>
                        <Link href="/lineup" className={styles.viewFullLineupButton}>
                            View Full Lineup
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
});

Lineup.propTypes = {
    eventInfo: PropTypes.shape({
        eventName: PropTypes.string,
        eventDate: PropTypes.string,
        eventLocation: PropTypes.string,
    }).isRequired,
    artists: PropTypes.arrayOf(PropTypes.string).isRequired,
    lineup: PropTypes.string,
    deleteArtistValue: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    artistLinks: PropTypes.object.isRequired,
    fetchArtistLinks: PropTypes.func.isRequired,
    isProcessing: PropTypes.bool
};

Lineup.displayName = 'Lineup';

export default Lineup;
