import logo from './logo.svg';
import './App.css';
import Map from './components/Map';

function App() {
  return (
    <div className="App">
      <h1>Mapbox Demo</h1>
      <div className="layout-container">
        <Map />
      </div>
    </div>
  );
}

export default App;
