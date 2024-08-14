import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import About from './pages/About';
import Navbar from './components/Navbar';
import Map from './components/Mapbox';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <Navbar/>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<Map />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
