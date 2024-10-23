import React from 'react';

interface ContentRightProps {
  selectLineup: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

const ContentRight: React.FC<ContentRightProps> = ({ selectLineup }) => {
  return (
    <div>
      <h2>Select a Sample Lineup</h2>
      <button onClick={selectLineup} data-lineup="sample1">Sample Lineup 1</button>
      <button onClick={selectLineup} data-lineup="sample2">Sample Lineup 2</button>
      <button onClick={selectLineup} data-lineup="sample3">Sample Lineup 3</button>
    </div>
  );
};

export default ContentRight;
