import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Map from "./components/Map";
import Home from "./pages/Home";
import AddEvent from "./pages/AddEvent";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/map" element={<Map />} />
        <Route path="/form" element={<AddEvent />} />
        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
