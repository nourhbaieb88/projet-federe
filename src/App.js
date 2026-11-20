import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import Home from "./pages/Home";
import Services from "./pages/Services";
import History from "./pages/History";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import ResetPassword from "./pages/ResetPassword";
import EstablishmentRegister from "./pages/EstablishmentRegister";
import EstablishmentDashboard from "./pages/EstablishmentDashboard";
import EstablishmentDetails from "./pages/EstablishmentDetails";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" toastOptions={{
        style: {
          background: 'rgba(30, 41, 59, 0.9)',
          color: '#fff',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }} />
      <Navbar />

      <Routes>
        {/* Routes Publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/establishment/:id" element={<EstablishmentDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />
        <Route path="/establishment-register" element={<EstablishmentRegister />} />
        
        {/* Routes Protégées - Tout Utilisateur Connecté */}
        <Route path="/history" element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/messages" element={
          <ProtectedRoute>
            <Messages />
          </ProtectedRoute>
        } />

        {/* Routes Protégées - Gérants Seulement */}
        <Route path="/establishment-dashboard" element={
          <ProtectedRoute allowedRoles={['establishment']}>
            <EstablishmentDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
