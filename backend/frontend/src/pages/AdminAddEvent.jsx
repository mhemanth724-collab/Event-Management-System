import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAddEvent() {
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

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
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
      !formData.ticket_price ||
      !formData.available_seats
    ) {
      setError("Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/events/add", {
        event_name: formData.event_name,
        description: formData.description,
        category: formData.category,
        event_date: formData.event_date,
        event_time: formData.event_time,
        venue: formData.venue,
        ticket_price: Number(formData.ticket_price),
        available_seats: Number(formData.available_seats),
      });

      if (response.data.status) {
        setMessage(
          response.data.message || "Event added successfully"
        );

        setFormData({
          event_name: "",
          description: "",
          category: "",
          event_date: "",
          event_time: "",
          venue: "",
          ticket_price: "",
          available_seats: "",
        });

        setTimeout(() => {
          navigate("/admin");
        }, 1500);
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to add event"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 pb-20 pt-28 text-white sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Admin Panel
          </p>

          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Add New Event
          </h1>

          <p className="mt-2 text-slate-400">
            Create a new event and make it available for users.
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl sm:p-8">

          {/* Success */}
          {message && (
            <div className="mb-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              {message}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Event Name */}
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

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter event description"
                rows="5"
                className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-violet-500"
              />
            </div>

            {/* Category */}
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
                <option value="">Select category</option>
                <option value="Technology">Technology</option>
                <option value="Music">Music</option>
                <option value="Sports">Sports</option>
                <option value="Business">Business</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Workshop">Workshop</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date + Time */}
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

            {/* Venue */}
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

            {/* Price + Seats */}
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
                  placeholder="₹ 0"
                  min="0"
                  step="0.01"
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
                  placeholder="Enter seats"
                  min="1"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
                />
              </div>

            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 border-t border-slate-800 pt-6 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="rounded-lg border border-slate-700 px-6 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

export default AdminAddEvent;