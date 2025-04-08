export interface MediaViewerProps {
  // title: string;
  // description: string;
  // contentUrl: string;
  // onClose: () => void;

  selectedMediaItems: string[];
  mediaItems: {[id: string]: {
    title: string;
    description: string;
    contentUrl: string;
  }};
  activeMediaItem: string | null;
  setActiveMediaItem: (id: string | null) => void;
  toggleItemSelection: (id: string) => void;
  clearSelections: () => void;
  onClose: () => void;
  hoveredItemId: string | null;
  onItemHover: (id: string | null) => void;
}