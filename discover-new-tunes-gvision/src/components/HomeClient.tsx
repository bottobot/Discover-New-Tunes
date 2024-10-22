'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Script from 'next/script';
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

declare global {
  interface Window {
    cv: any;
  }
}

export default function HomeClient() {
    const [imageURL, setImageURL] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [ocrData, setOCRData] = useState<OCRReviewProps['initialData'] | null>(null);
    const [reviewedData, setReviewedData] = useState<any>(null);
    const [lineup, setLineup] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
    const [artistLinks, setArtistLinks] = useState<Record<string, { spotifyUrl: string; soundcloudUrl: string }>>({});
    const [linksFetched, setLinksFetched] = useState<boolean>(false);
    const [showOCRReview, setShowOCRReview] = useState<boolean>(false);
    const [elapsedTime, setElapsedTime] = useState<number>(0);
    const [openCVLoaded, setOpenCVLoaded] = useState<boolean>(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setInterval(() => {
                setElapsedTime((prevTime) => prevTime + 1);
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [loading]);

    useEffect(() => {
        return () => {
            if (imageURL) {
                URL.revokeObjectURL(imageURL);
            }
        };
    }, [imageURL]);

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

    const processImage = useCallback(async (file: File) => {
        if (!openCVLoaded) {
            throw new Error('OpenCV.js is not loaded yet. Please try again in a moment.');
        }

        return new Promise<OCRReviewProps['initialData']>((resolve, reject) => {
            const img = new Image();
            img.onload = async () => {
                console.log('Image loaded successfully');
                try {
                    // Wait for OpenCV.js to be fully loaded
                    await window.cv.ready;
                    
                    console.log('Starting image processing');
                    const mat = window.cv.imread(img);
                    console.log('Image read into OpenCV Mat');
                    const gray = new (window.cv.Mat as any)();
                    window.cv.cvtColor(mat, gray, window.cv.COLOR_RGBA2GRAY);
                    console.log('Image converted to grayscale');
                    
                    const edges = new (window.cv.Mat as any)();
                    window.cv.Canny(gray, edges, 50, 150, 3);
                    console.log('Edge detection completed');
                    
                    const contours = new (window.cv.MatVector as any)();
                    const hierarchy = new (window.cv.Mat as any)();
                    window.cv.findContours(edges, contours, hierarchy, window.cv.RETR_EXTERNAL, window.cv.CHAIN_APPROX_SIMPLE);
                    console.log(`Found ${contours.size()} contours`);
                    
                    let possibleTextRegions = [];
                    for (let i = 0; i < contours.size(); ++i) {
                        const rect = window.cv.boundingRect(contours.get(i));
                        if (rect.width > 10 && rect.height > 10 && rect.width < mat.cols * 0.9) {
                            possibleTextRegions.push({
                                x: rect.x,
                                y: rect.y,
                                width: rect.width,
                                height: rect.height
                            });
                        }
                    }
                    console.log(`Identified ${possibleTextRegions.length} possible text regions`);
                    
                    mat.delete();
                    gray.delete();
                    edges.delete();
                    contours.delete();
                    hierarchy.delete();
                    
                    console.log('Image processing completed successfully');
                    resolve({
                        artists: possibleTextRegions.map((_, index) => `Possible Artist ${index + 1}`),
                        fullText: `Found ${possibleTextRegions.length} possible text regions`
                    });
                } catch (error) {
                    console.error('Error during image processing:', error);
                    reject(new Error(`Error processing image: ${(error as Error).message}`));
                }
            };
            img.onerror = () => {
                console.error('Failed to load image');
                reject(new Error('Failed to load image'));
            };
            img.src = URL.createObjectURL(file);
        });
    }, [openCVLoaded]);

    const submitPhoto = useCallback(async (file: File) => {
        console.log('submitPhoto called with file:', file.name);
        if (!openCVLoaded) {
            console.log('OpenCV.js is not loaded yet');
            setNotification({ 
                show: true, 
                message: 'OpenCV.js is not loaded yet. Please wait a moment and try again.', 
                type: 'error' 
            });
            return;
        }
        setLoading(true);
        setLinksFetched(false);

        try {
            console.log('Starting image processing');
            const result = await processImage(file);
            console.log('Image processing result:', result);
            
            setOCRData(result);
            setShowOCRReview(true);
            setImageURL(URL.createObjectURL(file));
        } catch (error) {
            console.error('Error in submitPhoto:', error);
            setNotification({ 
                show: true, 
                message: `Failed to process image: ${(error as Error).message}. Please try again.`, 
                type: 'error' 
            });
            setOCRData(null);
            setImageURL('');
        } finally {
            setLoading(false);
        }
    }, [processImage, openCVLoaded]);

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
        setImageURL('');
        setArtistLinks({});
        setLinksFetched(false);
        setShowOCRReview(false);
    }, []);

    return (
        <>
            <Script 
                src="https://docs.opencv.org/4.5.2/opencv.js" 
                strategy="beforeInteractive"
                onLoad={() => {
                    console.log('OpenCV.js script loaded');
                    window.cv.onRuntimeInitialized = () => {
                        console.log('OpenCV.js runtime initialized');
                        setOpenCVLoaded(true);
                    };
                }}
            />
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
        </>
    );
}
