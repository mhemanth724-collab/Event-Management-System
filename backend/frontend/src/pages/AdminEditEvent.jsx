import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function AdminEditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    event_name: "",
    description: "",
    category: "",
    event_date: "",
    event_time: "",
    venue: "",
    ticket_price: "",
    available_seats: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ================= FETCH EVENT =================

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        const token = localStorage.getItem("token");

        if (!token || !user || user.role !== "admin") {
          setError("Admin account required");
          setLoading(false);
          return;
        }

        const response = await api.get(`/events/${id}`);

        if (response.data.status) {
          const event = response.data.event;

          setFormData({
            event_name: event.event_name || "",
            description: event.description || "",
            category: event.category || "",
            event_date: event.event_date
              ? String(event.event_date).slice(0, 10)
              : "",
            event_time: event.event_time
              ? String(event.event_time).slice(0, 5)
              : "",
            venue: event.venue || "",
            ticket_price: event.ticket_price ?? "",
            available_seats: event.available_seats ?? "",
          });
        } else {
          setError(
            response.data.message || "Event not found"
          );
        }
      } catch (err) {
        console.error("Fetch Event Error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load event"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // ================= HANDLE CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= UPDATE EVENT =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!token || !user || user.role !== "admin") {
      setError("Admin account required");
      return;
    }

    if (
      !formData.event_name ||
      !formData.description ||
      !formData.category ||
      !formData.event_date ||
      !formData.event_time ||
      !formData.venue ||
      formData.ticket_price === "" ||
      formData.available_seats === ""
    ) {
      setError("Please fill all fields");
      return;
    }

    if (Number(formData.ticket_price) < 0) {
      setError("Ticket price cannot be negative");
      return;
    }

    if (Number(formData.available_seats) < 0) {
      setError("Available seats cannot be negative");
      return;
    }

    try {
      setSaving(true);

      const response = await api.put(
        `/events/update/${id}`,
        {
          event_name: formData.event_name,
          description: formData.description,
          category: formData.category,
          event_date: formData.event_date,
          event_time: formData.event_time,
          venue: formData.venue,
          ticket_price: Number(formData.ticket_price),
          available_seats: Number(formData.available_seats),
        }
      );

      if (response.data.status) {
        setMessage(
          response.data.message ||
            "Event updated successfully"
        );

        setTimeout(() => {
          navigate("/admin/events");
        }, 1200);
      } else {
        setError(
          response.data.message ||
            "Failed to update event"
        );
      }
    } catch (err) {
      console.error("Update Event Error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update event"
      );
    } finally {
      setSaving(false);
    }
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
        <div className="mx-auto flex max-w-4xl min-h-[400px] items-center justify-center">

          <div className="text-center">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

            <p className="mt-4 text-slate-400">
              Loading event...
            </p>

          </div>

        </div>
      </main>
    );
  }

  // ================= ERROR =================

  if (error && !formData.event_name) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-4xl">

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">

            <h2 className="text-2xl font-bold text-red-400">
              {error}
            </h2>

            <button
              onClick={() => navigate("/admin/events")}
              className="mt-6 rounded-lg bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
            >
              Back to Events
            </button>

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-20 pt-28 text-white sm:px-6">

      <div className="mx-auto max-w-4xl">

        {/* ================= HEADER ================= */}

        <div className="mb-8">

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Edit Event
          </h1>

          <p className="mt-2 text-slate-400">
            Update the event details below.
          </p>

        </div>

        {/* ================= FORM ================= */}

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">

          {/* SUCCESS */}

          {message && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {message}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* EVENT NAME */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Event Name
              </label>

              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                placeholder="Enter event name"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="5"
                placeholder="Enter event description"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Category
              </label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
              >
                <option value="">
                  Select category
                </option>

                <option value="Technology">
                  Technology
                </option>

                <option value="Music">
                  Music
                </option>

                <option value="Sports">
                  Sports
                </option>

                <option value="Business">
                  Business
                </option>

                <option value="Education">
                  Education
                </option>

                <option value="Entertainment">
                  Entertainment
                </option>

                <option value="Workshop">
                  Workshop
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            {/* DATE + TIME */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event Date
                </label>

                <input
                  type="date"
                  name="event_date"
                  value={formData.event_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Event Time
                </label>

                <input
                  type="time"
                  name="event_time"
                  value={formData.event_time}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

            </div>

            {/* VENUE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Venue
              </label>

              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleChange}
                placeholder="Enter venue"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </div>

            {/* PRICE + SEATS */}

            <div className="grid gap-6 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Ticket Price
                </label>

                <input
                  type="number"
                  name="ticket_price"
                  value={formData.ticket_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="₹ 0"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Available Seats
                </label>

                <input
                  type="number"
                  name="available_seats"
                  value={formData.available_seats}
                  onChange={handleChange}
                  min="0"
                  placeholder="Enter seats"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

            </div>

            {/* BUTTONS */}

            <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/admin/events")}
                className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Updating Event..."
                  : "Update Event"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </main>
  );
}

export default AdminEditEvent;