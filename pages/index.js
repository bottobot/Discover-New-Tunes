import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from '../styles/Home.module.scss';
import Header from '../components/Header';
import MadeBy from '../components/MadeBy';
import ContentLeft from '../components/ContentLeft';
import ContentRight from '../components/ContentRight';
import Lineup from '../components/Lineup';
import OCRReview from '../components/OCRReview';
import Notification from '../components/Notification';

const Tesseract = dynamic(() => import('tesseract.js'), { ssr: false });

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
            const response = await fetch('/api/search-artists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ artists: artistsToFetch }),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
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
        const worker = await Tesseract.createWorker('eng');
        try {
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            const { data: { text } } = await worker.recognize(file);
            console.log('OCR Result:', text);
            
            // Simple artist extraction (you may want to improve this logic)
            const artists = text.split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0 && !line.match(/^\d+$/)); // Remove empty lines and lines with only numbers
            
            return {
                artists,
                fullText: text
            };
        } finally {
            await worker.terminate();
        }
    }, []);

    const submitPhoto = useCallback(async (file) => {
        console.log('submitPhoto called with file:', file.name);
        setLoading(true);
        setLinksFetched(false);

        try {
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
    }, [processImage]);

    const handleOCRReviewConfirm = useCallback((confirmedData) => {
        console.log('OCR Review confirmed with data:', JSON.stringify(confirmedData, null, 2));
        setReviewedData(confirmedData);
        setShowOCRReview(false);
        fetchArtistLinks(confirmedData.artists);
    }, [fetchArtistLinks]);

    const selectLineup = useCallback((event) => {
        const selectedLineup = event.target.closest("button").getAttribute("lineup");
        setLineup(selectedLineup);
    }, []);

    const markAsNotArtist = useCallback(async (text) => {
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text, isArtist: false }),
            });
            if (response.ok) {
                setReviewedData(prevData => ({
                    ...prevData,
                    artists: prevData.artists.filter(artist => artist !== text)
                }));
                setNotification({ show: true, message: `Marked "${text}" as not an artist`, type: 'success' });
                setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
            } else {
                throw new Error('Feedback submission failed');
            }
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
