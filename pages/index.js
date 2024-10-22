import React, { useState, useCallback, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Script from 'next/script';
import styles from '../styles/Home.module.scss';
import Header from '../components/Header';
import MadeBy from '../components/MadeBy';
import ContentLeft from '../components/ContentLeft';
import ContentRight from '../components/ContentRight';
import Lineup from '../components/Lineup';
import OCRReview from '../components/OCRReview';
import Notification from '../components/Notification';

const LoadingAnimationWithTimer = ({ elapsedTime }) => {
  const formatTime = (totalSeconds) => {
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

export default function Home() {
    const [imageURL, setImageURL] = useState('');
    const [loading, setLoading] = useState(false);
    const [ocrData, setOCRData] = useState(null);
    const [reviewedData, setReviewedData] = useState(null);
    const [lineup, setLineup] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [artistLinks, setArtistLinks] = useState({});
    const [linksFetched, setLinksFetched] = useState(false);
    const [showOCRReview, setShowOCRReview] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [openCVLoaded, setOpenCVLoaded] = useState(false);

    useEffect(() => {
        let timer;
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

    const fetchArtistLinks = useCallback(async (artistsToFetch) => {
        console.log('Fetching artist links for:', artistsToFetch);
        setLoading(true);
        try {
            // Simulate API call with client-side processing
            const mockApiCall = (artists) => {
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

    const processImage = useCallback(async (file) => {
        if (!openCVLoaded) {
            throw new Error('OpenCV.js is not loaded yet. Please try again in a moment.');
        }

        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded successfully');
                try {
                    console.log('Starting image processing');
                    const mat = window.cv.imread(img);
                    console.log('Image read into OpenCV Mat');
                    const gray = new window.cv.Mat();
                    window.cv.cvtColor(mat, gray, window.cv.COLOR_RGBA2GRAY);
                    console.log('Image converted to grayscale');
                    
                    const edges = new window.cv.Mat();
                    window.cv.Canny(gray, edges, 50, 150, 3);
                    console.log('Edge detection completed');
                    
                    const contours = new window.cv.MatVector();
                    const hierarchy = new window.cv.Mat();
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
                    reject(new Error(`Error processing image: ${error.message}`));
                }
            };
            img.onerror = () => {
                console.error('Failed to load image');
                reject(new Error('Failed to load image'));
            };
            img.src = URL.createObjectURL(file);
        });
    }, [openCVLoaded]);

    const submitPhoto = useCallback(async (file) => {
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
                message: `Failed to process image: ${error.message}. Please try again.`, 
                type: 'error' 
            });
            setOCRData(null);
            setImageURL('');
        } finally {
            setLoading(false);
        }
    }, [processImage, openCVLoaded]);

    const handleOCRReviewConfirm = useCallback((confirmedData) => {
        console.log('OCR Review confirmed with data:', JSON.stringify(confirmedData, null, 2));
        setReviewedData(confirmedData);
        setShowOCRReview(false);
    }, []);

    const selectLineup = useCallback((event) => {
        const selectedLineup = event.target.closest("button").getAttribute("lineup");
        setLineup(selectedLineup);
    }, []);

    const markAsNotArtist = useCallback(async (text) => {
        try {
            // Simulate API call with client-side processing
            setReviewedData(prevData => ({
                ...prevData,
                artists: prevData.artists.filter(artist => artist !== text)
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
            <Head>
                <title>Discover New Tunes</title>
                <meta name="description" content="Discover new tunes from lineup posters" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Script 
                src="https://docs.opencv.org/4.5.2/opencv.js" 
                strategy="afterInteractive"
                onLoad={() => {
                    console.log('OpenCV.js loaded');
                    setOpenCVLoaded(true);
                }}
            />
            <div>
                <div className={`${styles.locateArtistsContainer} ${styles.resultsBackground} ${(reviewedData || lineup) ? "nonInitial" : ""}`}>
                    <Header />
                    {loading ? (
                        <LoadingAnimationWithTimer elapsedTime={elapsedTime} />
                    ) : showOCRReview && ocrData && Array.isArray(ocrData.artists) ? (
                        <OCRReview initialData={ocrData} onConfirm={handleOCRReviewConfirm} />
                    ) : reviewedData && !linksFetched ? (
                        <div>
                            <h2>Confirmed Information</h2>
                            <p>Event Name: {reviewedData.eventInfo?.eventName || 'N/A'}</p>
                            <p>Event Date: {reviewedData.eventInfo?.eventDate || 'N/A'}</p>
                            <p>Event Location: {reviewedData.eventInfo?.eventLocation || 'N/A'}</p>
                            <h3>Artists</h3>
                            <ul>
                                {reviewedData.artists.map((artist, index) => (
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
