'use client';

import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import OCRReview from './OCRReview';
import Lineup from './Lineup';

const HomeClient: React.FC = () => {
  const [step, setStep] = useState<'upload' | 'review' | 'lineup'>('upload');
  const [ocrData, setOcrData] = useState<{ artists: string[]; fullText: string } | null>(null);
  const [confirmedArtists, setConfirmedArtists] = useState<string[]>([]);
  const [artistLinks, setArtistLinks] = useState<Record<string, { spotifyUrl: string; soundcloudUrl: string }>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOCRComplete = (text: string) => {
    const artists = text.split('\n')
      .flatMap(line => line.split('•'))
      .flatMap(item => item.split(','))
      .map(artist => artist.trim())
      .filter(artist => artist.length > 0 && !artist.match(/^\d/))
      .filter(artist => !['JULY', 'BASS COAST', 'MERRITT CANADA', 'CREATIVE', 'BRITISH', 'BC', 'COLUMBIA', 'BASSCOAST.CA'].includes(artist.toUpperCase()));

    setOcrData({ artists, fullText: text });
    setStep('review');
  };

  const handleOcrConfirm = (confirmedData: { artists: string[]; fullText: string }) => {
    setConfirmedArtists(confirmedData.artists);
    setStep('lineup');
  };

  const handleDeleteArtist = async (artist: string) => {
    setConfirmedArtists(prev => prev.filter(a => a !== artist));
  };

  const handleReset = () => {
    setStep('upload');
    setOcrData(null);
    setConfirmedArtists([]);
    setArtistLinks({});
  };

  const fetchArtistLinks = async (artistsToFetch: string[]) => {
    setIsProcessing(true);
    const newArtistLinks: Record<string, { spotifyUrl: string; soundcloudUrl: string }> = {};

    for (const artist of artistsToFetch) {
      try {
        const response = await fetch(`/api/search-spotify?artist=${encodeURIComponent(artist)}`);
        const data = await response.json();
        newArtistLinks[artist] = {
          spotifyUrl: data.spotifyUrl || '',
          soundcloudUrl: '', // We're not implementing SoundCloud search in this version
        };
      } catch (error) {
        console.error(`Error fetching links for ${artist}:`, error);
        newArtistLinks[artist] = { spotifyUrl: '', soundcloudUrl: '' };
      }
    }

    setArtistLinks(newArtistLinks);
    setIsProcessing(false);
  };

  return (
    <div>
      {step === 'upload' && (
        <ImageUpload onOCRComplete={handleOCRComplete} />
      )}
      {step === 'review' && ocrData && (
        <OCRReview initialData={ocrData} onConfirm={handleOcrConfirm} />
      )}
      {step === 'lineup' && (
        <Lineup
          eventInfo={{
            eventName: 'Event',
            eventDate: 'TBD',
            eventLocation: 'TBD'
          }}
          artists={confirmedArtists}
          lineup={confirmedArtists.join(', ')}
          deleteArtistValue={handleDeleteArtist}
          reset={handleReset}
          artistLinks={artistLinks}
          fetchArtistLinks={fetchArtistLinks}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default HomeClient;
