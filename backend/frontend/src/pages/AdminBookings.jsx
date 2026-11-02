import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminBookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // ADMIN CHECK
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "admin") {
        navigate("/");
        return;
      }

      fetchBookings();
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // FETCH ALL BOOKINGS
  // ==========================================
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/bookings");

      if (response.data.status) {
        setBookings(response.data.bookings || []);
      } else {
        setError(
          response.data.message || "Failed to load bookings"
        );
      }
    } catch (err) {
      console.error("Bookings Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load bookings. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT DATE
  // ==========================================
  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // FORMAT TIME
  // ==========================================
  const formatTime = (time) => {
    if (!time) return "-";

    return String(time).substring(0, 5);
  };

  // ==========================================
  // FORMAT AMOUNT
  // ==========================================
  const formatAmount = (amount) => {
    const value = Number(amount || 0);

    return `₹${value.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>

            <p className="text-slate-300">
              Loading bookings...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              ADMIN PANEL
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              All Bookings
            </h1>

            <p className="mt-2 text-slate-400">
              Manage and monitor all event bookings.
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              to="/admin"
              className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              ← Dashboard
            </Link>

            <button
              onClick={fetchBookings}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* =====================================
            ERROR
        ====================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-red-300">
                {error}
              </p>

              <button
                onClick={fetchBookings}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* =====================================
            SUMMARY CARD
        ====================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Bookings
            </p>

            <h2 className="mt-2 text-3xl font-bold text-white">
              {bookings.length}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Tickets
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-400">
              {bookings.reduce(
                (total, booking) =>
                  total + Number(booking.tickets || 0),
                0
              )}
            </h2>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              Total Revenue
            </p>

            <h2 className="mt-2 text-3xl font-bold text-emerald-400">
              {formatAmount(
                bookings.reduce(
                  (total, booking) =>
                    total + Number(booking.total_amount || 0),
                  0
                )
              )}
            </h2>
          </div>
        </div>

        {/* =====================================
            BOOKINGS TABLE
        ====================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">
            <h2 className="text-lg font-semibold">
              Booking Records
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Complete list of customer bookings.
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl">
                📭
              </div>

              <h3 className="text-lg font-semibold text-white">
                No bookings found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no ticket bookings.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">

                <thead className="bg-slate-800/70">
                  <tr>
                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Booking ID
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      User ID
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Event
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Event Date
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Venue
                    </th>

                    <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tickets
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Booking Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">

                  {bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="transition hover:bg-slate-800/40"
                    >

                      {/* Booking ID */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-blue-400">
                          #{booking.id}
                        </span>
                      </td>

                      {/* User ID */}
                      <td className="px-5 py-4">
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                          User #{booking.user_id}
                        </span>
                      </td>

                      {/* Event */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-white">
                            {booking.event_name || "Unknown Event"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Event ID: #{booking.event_id}
                          </p>
                        </div>
                      </td>

                      {/* Event Date */}
                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm text-slate-200">
                            {formatDate(booking.event_date)}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {formatTime(booking.event_time)}
                          </p>
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-300">
                          {booking.venue || "-"}
                        </span>
                      </td>

                      {/* Tickets */}
                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-400">
                          {booking.tickets}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-emerald-400">
                          {formatAmount(booking.total_amount)}
                        </span>
                      </td>

                      {/* Booking Date */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-slate-400">
                          {formatDate(booking.booking_date)}
                        </span>
                      </td>

                    </tr>
                  ))}

                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default AdminBookings;