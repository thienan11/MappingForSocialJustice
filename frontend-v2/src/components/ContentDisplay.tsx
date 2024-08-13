import React from 'react';

interface ContentDisplayProps {
  url: string | null;
  title: string;
  description: string;
  onClose: () => void;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ url, title, description, onClose }) => {
  if (!url) return null;

  return (
    <div className="content-display">
      <button className="form-button" onClick={onClose}>Close</button>
      <h3>{title}</h3>
      <p>{description}</p>
      {url.endsWith('.mp4') ? (
        <video controls src={url} className="media-content" />
      ) : (
        <img src={url} alt={title} className="media-content" />
      )}
    </div>
  );
};

export default ContentDisplay;
