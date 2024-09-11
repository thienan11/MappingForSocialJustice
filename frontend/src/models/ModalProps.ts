export interface ModalProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}