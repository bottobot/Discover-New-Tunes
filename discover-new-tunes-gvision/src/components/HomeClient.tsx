'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import styles from '../styles/Home.module.scss';
import {
  Header,
  MadeBy,
  ContentLeft,
  ContentRight,
  Lineup,
  OCRReview,
  Notification
} from './';

interface OCRReviewProps {
  initialData: {
    artists: string[];
    fullText: string;
  };
  onConfirm: (confirmedData: any) => void;
}

interface LineupProps {
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

const LoadingAnimationWithTimer = ({ elapsedTime }: { elapsedTime: number }) => {
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingAnimation}></div>
      <p>Processing... Time elapsed: {formatTime(elapsedTime)}</p>
    </div>
  );
};

export default function HomeClient() {
    const [loading, setLoading] = useState<boolean>(false);
    const [ocrData, setOCRData] = useState<OCRReviewProps['initialData'] | null>(null);
    const [reviewedData, setReviewedData] = useState<any>(null);
    const [lineup, setLineup] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
    const [artistLinks, setArtistLinks] = useState<Record<string, { spotifyUrl: string; soundcloudUrl: string }>>({});
    const [linksFetched, setLinksFetched] = useState<boolean>(false);
    const [showOCRReview, setShowOCRReview] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);

    const fetchArtistLinks = useCallback(async (artistsToFetch: string[]) => {
        console.log('Fetching artist links for:', artistsToFetch);
        setLoading(true);
        try {
            // Simulate API call with client-side processing
            const mockApiCall = (artists: string[]) => {
                return artists.map(artist => ({
                    [artist]: {
                        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
                        soundcloudUrl: `https://soundcloud.com/search?q=${encodeURIComponent(artist)}`,
                    }
                })).reduce((acc, curr) => ({ ...acc, ...curr }), {});
            };

            const data = mockApiCall(artistsToFetch);
            setArtistLinks(prevLinks => ({ ...prevLinks, ...data }));
        } catch (error) {
            console.error('Error fetching artist links:', error);
            setNotification({
                show: true,
                message: 'Failed to fetch some artist information. The lineup may be incomplete.',
                type: 'warning'
            });
        } finally {
            setLoading(false);
            setLinksFetched(true);
        }
    }, []);

    const submitPhoto = useCallback(async (file: File) => {
        console.log('submitPhoto called with file:', file.name);
        setLoading(true);
        setLinksFetched(false);

        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await axios.post('/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.data.success) {
                setOCRData({
                    artists: response.data.artists,
                    fullText: response.data.text,
                });
                setShowOCRReview(true);
            } else {
                throw new Error('Failed to process image');
            }
        } catch (error) {
            console.error('Error in submitPhoto:', error);
            setNotification({ 
                show: true, 
                message: `Failed to process image: ${(error as Error).message}. Please try again.`, 
                type: 'error' 
            });
            setOCRData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleOCRReviewConfirm = useCallback((confirmedData: any) => {
        console.log('OCR Review confirmed with data:', JSON.stringify(confirmedData, null, 2));
        setReviewedData(confirmedData);
        setShowOCRReview(false);
    }, []);

    const selectLineup = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        const selectedLineup = event.currentTarget.getAttribute("data-lineup");
        setLineup(selectedLineup);
    }, []);

    const markAsNotArtist = useCallback(async (text: string) => {
        try {
            // Simulate API call with client-side processing
            setReviewedData((prevData: any) => ({
                ...prevData,
                artists: prevData.artists.filter((artist: string) => artist !== text)
            }));
            setNotification({ show: true, message: `Marked "${text}" as not an artist`, type: 'success' });
            setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
        } catch (error) {
            console.error('Error:', error);
            setNotification({ show: true, message: 'Failed to submit feedback. Please try again.', type: 'error' });
        }
    }, []);

    const resetLineup = useCallback(() => {
        setOCRData(null);
        setReviewedData(null);
        setLineup(null);
        setArtistLinks({});
        setLinksFetched(false);
        setShowOCRReview(false);
    }, []);

    return (
        <div>
            <div className={`${styles.locateArtistsContainer} ${styles.resultsBackground} ${(reviewedData || lineup) ? "nonInitial" : ""}`}>
                <Header />
                {loading ? (
                    <LoadingAnimationWithTimer elapsedTime={elapsedTime} />
                ) : showOCRReview && ocrData ? (
                    <OCRReview initialData={ocrData} onConfirm={handleOCRReviewConfirm} />
                ) : reviewedData && !linksFetched ? (
                    <div>
                        <h2>Confirmed Information</h2>
                        <p>Event Name: {reviewedData.eventInfo?.eventName || 'N/A'}</p>
                        <p>Event Date: {reviewedData.eventInfo?.eventDate || 'N/A'}</p>
                        <p>Event Location: {reviewedData.eventInfo?.eventLocation || 'N/A'}</p>
                        <h3>Artists</h3>
                        <ul>
                            {reviewedData.artists.map((artist: string, index: number) => (
                                <li key={index}>{artist}</li>
                            ))}
                        </ul>
                        <button onClick={() => fetchArtistLinks(reviewedData.artists)}>Search Artists on Spotify</button>
                    </div>
                ) : reviewedData && linksFetched ? (
                    <Lineup
                        eventInfo={reviewedData.eventInfo}
                        artists={reviewedData.artists}
                        lineup={lineup}
                        deleteArtistValue={markAsNotArtist}
                        reset={resetLineup}
                        artistLinks={artistLinks}
                        fetchArtistLinks={fetchArtistLinks}
                        isProcessing={loading}
                    />
                ) : (
                    <div className={styles.viewContainer}>
                        <div id={styles.container}>
                            <div className={styles.viewRenderer}>
                                <ContentLeft submitPhoto={submitPhoto} error={false} />
                                <div className={styles.vl}></div>
                                <ContentRight selectLineup={selectLineup} />
                            </div>
                        </div>
                    </div>
                )}
                <Notification
                    show={notification.show}
                    message={notification.message}
                    type={notification.type}
                />
            </div>
            <MadeBy />
        </div>
    );
}
