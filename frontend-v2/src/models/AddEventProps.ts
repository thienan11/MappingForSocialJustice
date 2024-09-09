// make it a type alias or keep it as interface?
export interface AddEventFormProps {
  location: { lat: number; lng: number };
  onClose: () => void;
}