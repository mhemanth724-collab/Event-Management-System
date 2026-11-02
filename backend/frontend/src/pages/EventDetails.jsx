
import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../services/api";

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/events/${id}`);

      console.log("Event Details Response:", response.data);

      if (response.data.status) {
        setEvent(response.data.event);
      } else {
        setError("Event not found.");
      }
    } catch (err) {
      console.error("Event Details Error:", err);

      if (err.response?.status === 404) {
        setError("Event not found.");
      } else {
        setError("Unable to load event details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Music: "🎵",
      Business: "💼",
      Art: "🎨",
      Technology: "💻",
      Sports: "🏆",
      Education: "🎓",
      Food: "🍽️",
      Health: "❤️",
      Travel: "✈️",
    };

    return icons[category] || "✨";
  };

  const availableSeats = Number(event?.available_seats || 0);

  const isSoldOut = availableSeats <= 0;

  const isFewSeats =
    availableSeats > 0 && availableSeats <= 10;

  const formattedDate = event?.event_date
    ? new Date(event.event_date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "Date not available";

  const formattedTime = event?.event_time
    ? String(event.event_time).slice(0, 5)
    : "Time not available";

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 pb-20 pt-28 text-white">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-8 h-5 w-32 rounded bg-slate-800" />

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="grid lg:grid-cols-2">
              <div className="h-[420px] bg-slate-900 lg:h-[600px]" />

              <div className="space-y-6 p-8 lg:p-12">
                <div className="h-4 w-32 rounded bg-slate-800" />
                <div className="h-12 w-4/5 rounded bg-slate-800" />
                <div className="h-20 rounded bg-slate-900" />

                <div className="space-y-4">
                  <div className="h-20 rounded-2xl bg-slate-900" />
                  <div className="h-20 rounded-2xl bg-slate-900" />
                  <div className="h-20 rounded-2xl bg-slate-900" />
                </div>

                <div className="h-14 rounded-xl bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
        <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-2xl">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-violet-500/10 text-5xl">
            🎫
          </div>

          <h1 className="mt-7 text-3xl font-bold">
            Event Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            {error ||
              "The event you are looking for does not exist."}
          </p>

          <Link
            to="/events"
            className="mt-8 inline-flex rounded-xl bg-violet-600 px-7 py-3 text-sm font-semibold transition hover:bg-violet-500"
          >
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 pb-20 pt-28 text-white">
      {/* Background Decoration */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute left-[-180px] top-[100px] h-[400px] w-[400px] rounded-full bg-violet-600/10 blur-[120px]" />

        <div className="absolute right-[-180px] top-[500px] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* =========================
            BACK BUTTON
        ========================= */}

        <button
          onClick={() => navigate("/events")}
          className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
        >
          <span className="transition group-hover:-translate-x-1">
            ←
          </span>

          Back to Events
        </button>

        {/* =========================
            MAIN CARD
        ========================= */}

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/30 backdrop-blur-xl">
          <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
            {/* =========================
                EVENT VISUAL
            ========================= */}

            <div className="relative min-h-[430px] overflow-hidden bg-gradient-to-br from-violet-700/30 via-indigo-700/10 to-slate-950 lg:min-h-[650px]">
              {/* Decorative circles */}

              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />

              <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full border border-white/10" />

              <div className="absolute left-10 top-20 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />

              <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-3xl" />

              {/* Grid pattern */}

              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* Category */}

              <div className="absolute left-6 top-6 z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs font-semibold backdrop-blur-xl">
                  <span className="text-base">
                    {getCategoryIcon(event.category)}
                  </span>

                  {event.category || "Event"}
                </div>
              </div>

              {/* Status */}

              <div className="absolute right-6 top-6 z-10">
                <span
                  className={`rounded-full border px-4 py-2 text-xs font-bold backdrop-blur-xl ${
                    isSoldOut
                      ? "border-red-400/20 bg-red-500/10 text-red-300"
                      : isFewSeats
                      ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                      : "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  {isSoldOut
                    ? "SOLD OUT"
                    : isFewSeats
                    ? "FEW SEATS LEFT"
                    : "AVAILABLE"}
                </span>
              </div>

              {/* Main Icon */}

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[3rem] bg-violet-500/20 blur-3xl" />

                  <div className="relative flex h-48 w-48 items-center justify-center rounded-[3rem] border border-white/10 bg-white/[0.06] text-[100px] shadow-2xl backdrop-blur-xl transition duration-500 hover:scale-105">
                    {getCategoryIcon(event.category)}
                  </div>
                </div>
              </div>

              {/* Bottom visual info */}

              <div className="absolute bottom-6 left-6 right-6">
                <div className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Event ID
                      </p>

                      <p className="mt-1 font-semibold text-white">
                        #{event.id}
                      </p>
                    </div>

                    <div className="h-10 w-px bg-white/10" />

                    <div className="text-right">
                      <p className="text-xs uppercase tracking-widest text-slate-500">
                        Tickets
                      </p>

                      <p className="mt-1 font-semibold text-emerald-400">
                        {availableSeats} available
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* =========================
                EVENT CONTENT
            ========================= */}

            <div className="p-6 sm:p-8 lg:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Discover • Experience • Enjoy
              </p>

              <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {event.event_name}
              </h1>

              <p className="mt-6 text-sm leading-7 text-slate-400">
                {event.description ||
                  "Join us for an amazing event experience filled with unforgettable moments."}
              </p>

              {/* =========================
                  INFORMATION GRID
              ========================= */}

              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {/* Date */}

                <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-violet-500/30 hover:bg-violet-500/[0.04]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-xl transition group-hover:scale-110">
                      📅
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {formattedDate}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Time */}

                <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-cyan-500/30 hover:bg-cyan-500/[0.04]">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 text-xl transition group-hover:scale-110">
                      ⏰
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {formattedTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Venue */}

                <div className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-500/30 hover:bg-emerald-500/[0.04] sm:col-span-2">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-xl transition group-hover:scale-110">
                      📍
                    </div>

                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Venue
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-200">
                        {event.venue || "Venue not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* =========================
                  SEAT AVAILABILITY
              ========================= */}

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ticket Availability
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-200">
                      {isSoldOut
                        ? "This event is currently sold out."
                        : `${availableSeats} seats remaining`}
                    </p>
                  </div>

                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                      isSoldOut
                        ? "bg-red-500/10"
                        : isFewSeats
                        ? "bg-amber-500/10"
                        : "bg-emerald-500/10"
                    }`}
                  >
                    🎟️
                  </div>
                </div>

                {!isSoldOut && (
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isFewSeats
                          ? "w-[25%] bg-amber-400"
                          : "w-[75%] bg-emerald-400"
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* =========================
                  PRICE + BOOK
              ========================= */}

              <div className="mt-8 border-t border-white/10 pt-7">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Ticket Price
                    </p>

                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-4xl font-black text-white">
                        ₹{event.ticket_price ?? 0}
                      </span>

                      <span className="text-sm text-slate-500">
                        / ticket
                      </span>
                    </div>
                  </div>

                  <div className="hidden text-right sm:block">
                    <p className="text-xs text-slate-500">
                      Secure booking
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-400">
                      ✓ Available
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/book/${event.id}`)
                  }
                  disabled={isSoldOut}
                  className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 py-4 text-sm font-bold shadow-lg shadow-violet-900/20 transition duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500 hover:shadow-violet-900/40 disabled:cursor-not-allowed disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none"
                >
                  <span className="relative z-10">
                    {isSoldOut
                      ? "Sold Out"
                      : "Book Tickets →"}
                  </span>

                  {!isSoldOut && (
                    <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                </button>

                <p className="mt-4 text-center text-xs text-slate-500">
                  Fast & secure ticket booking • Instant confirmation
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            BOTTOM TRUST SECTION
        ========================= */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-2xl">🔒</div>
            <h3 className="mt-3 text-sm font-bold">
              Secure Booking
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Your booking process is protected.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-2xl">⚡</div>
            <h3 className="mt-3 text-sm font-bold">
              Instant Confirmation
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Get your booking confirmation quickly.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
            <div className="text-2xl">🎟️</div>
            <h3 className="mt-3 text-sm font-bold">
              Digital Ticket
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Download your ticket after payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventDetails;

