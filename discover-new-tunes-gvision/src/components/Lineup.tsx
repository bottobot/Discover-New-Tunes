import React from 'react';

export interface LineupProps {
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

const Lineup: React.FC<LineupProps> = ({
  eventInfo,
  artists,
  lineup,
  deleteArtistValue,
  reset,
  artistLinks,
  fetchArtistLinks,
  isProcessing
}) => {
  // Component implementation
  return (
    <div>
      <h2>Lineup</h2>
      {/* Add your lineup UI here */}
      <button onClick={reset}>Reset</button>
    </div>
  );
};

export default Lineup;
