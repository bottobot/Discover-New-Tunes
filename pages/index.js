import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import styles from '../styles/Home.module.scss';
import Header from '../components/Header';
import MadeBy from '../components/MadeBy';
import ContentLeft from '../components/ContentLeft';
import ContentRight from '../components/ContentRight';
import Lineup from '../components/Lineup';
import OCRReview from '../components/OCRReview';
import Notification from '../components/Notification';
import LoadingAnimation from '../components/LoadingAnimation';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h1>Something went wrong.</h1>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

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

    const submitPhoto = useCallback(async (file) => {
        console.log('submitPhoto called with file:', file.name);
        setLoading(true);
        setLinksFetched(false);
        const formData = new FormData();
        formData.append('file', file);

        try {
            console.log('Preparing to send POST request to /api/upload');
            console.log('FormData contents:', [...formData.entries()]);
            
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    // Remove 'Content-Type' header to let the browser set it with the correct boundary for FormData
                },
                body: formData,
            });
            
            console.log('Received response from /api/upload');
            console.log('Response status:', response.status);
            console.log('Response headers:', [...response.headers.entries()]);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response body:', errorText);
                throw new Error(`Upload failed with status ${response.status}. Error: ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Parsed response data:', JSON.stringify(data, null, 2));
            
            if (!data || !Array.isArray(data.artists)) {
                console.error('Invalid response format. Expected data.artists to be an array.');
                console.error('Received data:', data);
                throw new Error('Invalid response format');
            }
            
            console.log('Setting OCR data:', JSON.stringify(data, null, 2));
            setOCRData({
                artists: data.artists,
                fullText: data.fullText
            });
            setShowOCRReview(true);
            setImageURL(URL.createObjectURL(file));
            console.log('Updated imageURL state');
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
            console.log('Set loading to false');
        }
    }, []);

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
        <ErrorBoundary>
            <div>
                <div className={`${styles.locateArtistsContainer} ${styles.resultsBackground} ${(reviewedData || lineup) ? "nonInitial" : ""}`}>
                    <Header />
                    {loading ? (
                        <LoadingAnimation />
                    ) : showOCRReview && ocrData && Array.isArray(ocrData.artists) ? (
                        <OCRReview initialData={ocrData} onConfirm={handleOCRReviewConfirm} />
                    ) : reviewedData && !linksFetched ? (
                        <div>
                            <h2>Confirmed Information</h2>
                            <p>Event Name: {reviewedData.eventInfo.eventName}</p>
                            <p>Event Date: {reviewedData.eventInfo.eventDate}</p>
                            <p>Event Location: {reviewedData.eventInfo.eventLocation}</p>
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
        </ErrorBoundary>
    );
}
