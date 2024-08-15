export class CoordinateZoomControl {
  private container: HTMLDivElement;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this.container.style.background = 'rgba(0, 0, 0, 0.3)'; // Semi-transparent background
    this.container.style.padding = '5px'; // Small padding
    this.container.style.borderRadius = '5px'; // Slightly rounded corners
    this.container.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.2)'; // Light shadow
    this.container.style.position = 'absolute'; 
    this.container.style.top = '15px'; // Position inside the map
    this.container.style.right = '15px'; // Position inside the map
    this.container.style.zIndex = '1'; // Ensure it’s above other elements
    this.container.style.fontSize = '12px'; // Smaller font size
    this.container.style.color = '#fff'; // Light text color
    this.container.style.opacity = '0.8'; // Slightly transparent
    this.container.style.padding = '4px'; // Reduced padding for a compact look
  }

  onAdd(map: mapboxgl.Map) {
    this.update(map);
    map.on('move', () => this.update(map));
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
  }

  private update(map: mapboxgl.Map) {
    const { lng, lat } = map.getCenter();
    const zoom = map.getZoom().toFixed(2);
    this.container.innerHTML = `
      <div>Lng: ${lng.toFixed(4)}</div>
      <div>Lat: ${lat.toFixed(4)}</div>
      <div>Zoom: ${zoom}</div>
    `;
  }
}