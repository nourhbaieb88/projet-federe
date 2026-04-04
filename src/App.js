import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Services from "./pages/Services";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import EstablishmentRegister from "./pages/EstablishmentRegister";
import EstablishmentDashboard from "./pages/EstablishmentDashboard";
import EstablishmentDetails from "./pages/EstablishmentDetails";
import Navbar from "./components/Navbar";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/establishment/:id" element={<EstablishmentDetails />} />
        <Route path="/history" element={<History />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/establishment-register" element={<EstablishmentRegister />} />
        <Route path="/establishment-dashboard" element={<EstablishmentDashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;