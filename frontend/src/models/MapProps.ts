export interface MapProps {
  onMapDoubleClick: (location: { lat: number; lng: number }) => void;
  onMarkerClick: (id: string, content: { title: string; description: string; contentUrl: string }) => void;
  setClearPreviewMarker: (clearMarkerFunction: () => void) => void;
  selectedMarkerId: string | null;
}