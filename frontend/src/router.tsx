import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import About from "./pages/About";
import MapView from "./pages/MapView";
import Home from "./pages/Home";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "map",
        element: <MapView />,
      },
    ]
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);