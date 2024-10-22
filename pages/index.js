import { useState, useCallback, useEffect } from 'react';
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

export default function Home() {
    // ... (previous code remains unchanged)

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

    // ... (rest of the code remains unchanged)
}
