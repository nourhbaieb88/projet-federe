import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reservationService } from "../services/api";

function Reservation() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }
    fetchReservations();
  }, [isAuthenticated, navigate]);

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reservationService.getAll();
      let filtered = data.results || data;
      
      if (filterStatus) {
        filtered = filtered.filter(r => r.status === filterStatus);
      }
      
      setReservations(filtered);
    } catch (err) {
      setError(err.message || "Failed to load reservations");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) return;
    
    try {
      await reservationService.cancel(id);
      setReservations(prev => 
        prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r)
      );
    } catch (err) {
      setError(err.message || "Failed to cancel reservation");
    }
  };

  const statuses = [
    { value: "", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "yellow";
      case "confirmed": return "green";
      case "completed": return "blue";
      case "cancelled": return "red";
      default: return "gray";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Reservations</h1>
          <p className="text-slate-400">Manage your bookings and reservations</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status.value
                  ? "bg-blue-500 text-white"
                  : "bg-slate-700/50 text-slate-200 hover:bg-slate-700"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Reservations List */}
        {!loading && reservations.length > 0 && (
          <div className="space-y-4">
            {reservations.map((reservation) => (
              <div
                key={reservation.id}
                className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div>
                    <p className="text-slate-400 text-sm">Service</p>
                    <p className="text-white font-bold text-lg">{reservation.service_name}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Establishment</p>
                    <p className="text-white font-bold">{reservation.establishment_name}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 text-sm">Date & Time</p>
                    <p className="text-white font-bold">
                      {new Date(reservation.reservation_date).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Status</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        `bg-${getStatusColor(reservation.status)}-500/20 text-${getStatusColor(reservation.status)}-400`
                      }`}>
                        {reservation.status.toUpperCase()}
                      </span>
                    </div>

                    {reservation.status === "pending" && (
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg font-medium transition text-sm"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && reservations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg mb-4">No reservations found</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition"
            >
              Browse Establishments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Reservation;
