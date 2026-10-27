import React from 'react';
import { Modal } from '../ui/Modal';
import { getYouTubeEmbedUrl } from '../../utils/tmdb';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoKey: string | null;
  movieTitle: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  videoKey,
  movieTitle,
}) => {
  if (!videoKey) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${movieTitle} — Official Trailer`} maxWidth="4xl">
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-2xl">
        <iframe
          src={getYouTubeEmbedUrl(videoKey)}
          title={`${movieTitle} Trailer`}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </Modal>
  );
};

