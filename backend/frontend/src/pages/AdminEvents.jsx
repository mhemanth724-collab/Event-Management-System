import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminEvents() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ================= FETCH EVENTS =================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("token");

      if (!token || !user || user.role !== "admin") {
        setError("Admin account required");
        setLoading(false);
        return;
      }

      const response = await api.get("/admin/events");

      if (response.data.status) {
        setEvents(response.data.events || []);
      } else {
        setError(
          response.data.message || "Failed to load events"
        );
      }
    } catch (err) {
      console.error("Fetch Events Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load events"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= USE EFFECT =================

  useEffect(() => {
    fetchEvents();
  }, []);

  // ================= DELETE EVENT =================

  const handleDelete = async (eventId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await api.delete(
        `/events/delete/${eventId}`
      );

      if (response.data.status) {
        alert(
          response.data.message ||
            "Event deleted successfully"
        );

        fetchEvents();
      } else {
        alert(
          response.data.message ||
            "Failed to delete event"
        );
      }
    } catch (err) {
      console.error("Delete Event Error:", err);

      alert(
        err.response?.data?.message ||
          "Failed to delete event"
      );
    }
  };

  // ================= FORMAT DATE =================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    const formattedDate = new Date(date);

    if (Number.isNaN(formattedDate.getTime())) {
      return date;
    }

    return formattedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ================= FORMAT TIME =================

  const formatTime = (time) => {
    if (!time) {
      return "-";
    }

    return String(time).slice(0, 5);
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500"></div>

              <p className="mt-4 text-slate-400">
                Loading events...
              </p>

            </div>
          </div>

        </div>
      </main>
    );
  }

  // ================= ERROR =================

  if (error) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-7xl">

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">

            <h2 className="text-2xl font-bold text-red-400">
              {error}
            </h2>

            <button
              onClick={() => navigate("/admin")}
              className="mt-6 rounded-lg bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Back to Dashboard
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-20 pt-28 text-white sm:px-6">

      <div className="mx-auto max-w-7xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Admin Panel
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Manage Events
            </h1>

            <p className="mt-2 text-slate-400">
              View, edit and delete events from your platform.
            </p>
          </div>

          <button
            onClick={() => navigate("/admin/events/add")}
            className="rounded-lg bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
          >
            + Add Event
          </button>

        </div>

        {/* ================= EVENT COUNT ================= */}

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">

          <p className="text-sm text-slate-400">
            Total Events
          </p>

          <p className="mt-1 text-3xl font-bold text-white">
            {events.length}
          </p>

        </div>

        {/* ================= EMPTY STATE ================= */}

        {events.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

            <div className="text-5xl">
              📅
            </div>

            <h2 className="mt-4 text-2xl font-bold">
              No Events Found
            </h2>

            <p className="mt-2 text-slate-400">
              You haven't created any events yet.
            </p>

            <button
              onClick={() =>
                navigate("/admin/events/add")
              }
              className="mt-6 rounded-lg bg-violet-600 px-6 py-3 font-semibold hover:bg-violet-500"
            >
              Create Your First Event
            </button>

          </div>
        ) : (

          /* ================= EVENTS TABLE ================= */

          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

            <div className="overflow-x-auto">

              <table className="min-w-[1000px] w-full">

                <thead className="border-b border-slate-800 bg-slate-950">

                  <tr>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Event
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Category
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Date
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Time
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Venue
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Price
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Seats
                    </th>

                    <th className="px-5 py-4 text-left text-sm font-semibold text-slate-300">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {events.map((event) => (

                    <tr
                      key={event.id}
                      className="border-b border-slate-800 transition hover:bg-slate-800/50"
                    >

                      {/* Event */}

                      <td className="px-5 py-5">

                        <div className="max-w-[220px]">

                          <p className="font-semibold text-white">
                            {event.event_name}
                          </p>

                          <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                            {event.description}
                          </p>

                        </div>

                      </td>


                      {/* Category */}

                      <td className="px-5 py-5">

                        <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                          {event.category || "-"}
                        </span>

                      </td>


                      {/* Date */}

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                        {formatDate(event.event_date)}
                      </td>


                      {/* Time */}

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                        {formatTime(event.event_time)}
                      </td>


                      {/* Venue */}

                      <td className="max-w-[180px] px-5 py-5 text-sm text-slate-300">
                        {event.venue || "-"}
                      </td>


                      {/* Price */}

                      <td className="whitespace-nowrap px-5 py-5 text-sm font-semibold text-emerald-400">
                        ₹{Number(event.ticket_price || 0).toFixed(2)}
                      </td>


                      {/* Seats */}

                      <td className="whitespace-nowrap px-5 py-5 text-sm text-slate-300">
                        {event.available_seats ?? 0}
                      </td>


                      {/* Actions */}

                      <td className="px-5 py-5">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              navigate(
                                `/admin/events/edit/${event.id}`
                              )
                            }
                            className="rounded-lg bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-400 transition hover:bg-blue-500/20"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() =>
                              handleDelete(event.id)
                            }
                            className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}

export default AdminEvents;