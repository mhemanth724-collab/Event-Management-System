import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState({
    total_users: 0,
    total_events: 0,
    total_bookings: 0,
    total_tickets: 0,
    total_revenue: 0,
    available_seats: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // ADMIN AUTH CHECK
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

      fetchDashboard();
    } catch (err) {
      console.error("User data error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // FETCH DASHBOARD STATISTICS
  // ==========================================
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/dashboard");

      if (response.data.status) {
        setStatistics(
          response.data.statistics || {
            total_users: 0,
            total_events: 0,
            total_bookings: 0,
            total_tickets: 0,
            total_revenue: 0,
            available_seats: 0,
          }
        );
      } else {
        setError(
          response.data.message ||
            "Failed to load dashboard statistics."
        );
      }
    } catch (err) {
      console.error("Dashboard Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
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
              Loading admin dashboard...
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN DASHBOARD
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Admin Panel
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Admin Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-slate-400">
              Manage events, users and bookings from one place.
            </p>

          </div>

          <button
            onClick={fetchDashboard}
            className="w-fit rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            ↻ Refresh Dashboard
          </button>

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
                onClick={fetchDashboard}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =====================================
            STATISTICS
        ====================================== */}
        <section className="mb-8">

          <div className="mb-4">

            <h2 className="text-xl font-semibold">
              Overview
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Current EventHub statistics
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* TOTAL USERS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-blue-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Total Users
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-white">
                    {statistics.total_users}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                  👥
                </div>

              </div>

            </div>

            {/* TOTAL EVENTS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-violet-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Total Events
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-violet-400">
                    {statistics.total_events}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl">
                  🎫
                </div>

              </div>

            </div>

            {/* TOTAL BOOKINGS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-emerald-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Total Bookings
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-emerald-400">
                    {statistics.total_bookings}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                  📋
                </div>

              </div>

            </div>

            {/* TOTAL TICKETS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-orange-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Tickets Sold
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-orange-400">
                    {statistics.total_tickets}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
                  🎟️
                </div>

              </div>

            </div>

            {/* TOTAL REVENUE */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-green-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Total Revenue
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-green-400">
                    {formatCurrency(statistics.total_revenue)}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10 text-2xl">
                  ₹
                </div>

              </div>

            </div>

            {/* AVAILABLE SEATS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-cyan-500/30">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-slate-400">
                    Available Seats
                  </p>

                  <h3 className="mt-2 text-3xl font-bold text-cyan-400">
                    {statistics.available_seats}
                  </h3>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
                  💺
                </div>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================
            MANAGEMENT
        ====================================== */}
        <section>

          <div className="mb-4">

            <h2 className="text-xl font-semibold">
              Management
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Manage your EventHub platform
            </p>

          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

            {/* ADD EVENT */}
            <Link
              to="/admin/events/add"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40 hover:bg-slate-800"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl transition group-hover:bg-blue-500/20">
                ➕
              </div>

              <h3 className="text-lg font-semibold">
                Add Event
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                Create a new event and add ticket details.
              </p>

              <span className="mt-5 inline-block text-sm font-medium text-blue-400">
                Create Event →
              </span>

            </Link>

            {/* MANAGE EVENTS */}
            <Link
              to="/admin/events"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-violet-500/40 hover:bg-slate-800"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl transition group-hover:bg-violet-500/20">
                🎫
              </div>

              <h3 className="text-lg font-semibold">
                Manage Events
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View, edit and delete existing events.
              </p>

              <span className="mt-5 inline-block text-sm font-medium text-violet-400">
                Manage Events →
              </span>

            </Link>

            {/* ALL BOOKINGS */}
            <Link
              to="/admin/bookings"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40 hover:bg-slate-800"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl transition group-hover:bg-emerald-500/20">
                📋
              </div>

              <h3 className="text-lg font-semibold">
                All Bookings
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View and monitor all customer bookings.
              </p>

              <span className="mt-5 inline-block text-sm font-medium text-emerald-400">
                View Bookings →
              </span>

            </Link>

            {/* ALL USERS */}
            <Link
              to="/admin/users"
              className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-orange-500/40 hover:bg-slate-800"
            >

              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl transition group-hover:bg-orange-500/20">
                👥
              </div>

              <h3 className="text-lg font-semibold">
                All Users
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                View all registered EventHub users.
              </p>

              <span className="mt-5 inline-block text-sm font-medium text-orange-400">
                View Users →
              </span>

            </Link>

          </div>

        </section>

        {/* =====================================
            ADMIN STATUS
        ====================================== */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-400">
                System Status
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                EventHub Administration
              </h3>

            </div>

            <div className="flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>

              <span className="text-sm font-medium text-emerald-400">
                Dashboard Active
              </span>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

export default AdminDashboard;