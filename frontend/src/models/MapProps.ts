export interface MapProps {
  onMapDoubleClick: (location: { lat: number; lng: number }) => void;
  onMarkerClick: (content: { title: string; description: string; contentUrl: string }) => void;
  setClearPreviewMarker: (clearMarkerFunction: () => void) => void;
}