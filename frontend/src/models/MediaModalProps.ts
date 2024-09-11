export interface MediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  contentUrl: string;
};