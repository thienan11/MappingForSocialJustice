import React from 'react';

const ContentDisplay = ({ url, title, description, onClose }) => {
    if (!url) return null;

    return (
        <div className="content-display">
            <button onClick={onClose}>Close</button>
            <h3>{title}</h3>
            <p>{description}</p>
            {url.endsWith('.mp4') ? (
                <video controls src={url} />
            ) : (
                <img src={url} alt={title} />
            )}
        </div>
    );
};

export default ContentDisplay;
