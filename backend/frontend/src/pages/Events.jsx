import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-asc");

  // ============================================================
  // FETCH EVENTS
  // ============================================================

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);

        const response = await api.get("/events/all");

        if (response.data?.status) {
          setEvents(response.data.events || []);
        } else {
          setEvents([]);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ============================================================
  // DATE FORMAT
  // ============================================================

  const formatDate = (date) => {
    if (!date) return "Date TBA";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return String(date);
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // TIME FORMAT
  // ============================================================

  const formatTime = (time) => {
    if (!time) return "Time TBA";

    const parts = String(time).split(":");

    if (parts.length < 2) {
      return String(time);
    }

    let hours = Number(parts[0]);
    const minutes = parts[1];

    if (Number.isNaN(hours)) {
      return String(time);
    }

    const period = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  };

  // ============================================================
  // CATEGORY ICON
  // ============================================================

  const getCategoryIcon = (value) => {
    const name = String(value || "").toLowerCase();

    if (name.includes("music")) return "🎵";
    if (name.includes("business")) return "💼";
    if (name.includes("art")) return "🎨";
    if (name.includes("tech")) return "💻";
    if (name.includes("sport")) return "⚽";
    if (name.includes("education")) return "🎓";
    if (name.includes("food")) return "🍔";
    if (name.includes("health")) return "🧘";
    if (name.includes("travel")) return "✈️";

    return "🎫";
  };

  // ============================================================
  // CATEGORIES
  // ============================================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        events
          .map((event) => event.category)
          .filter((item) => item && String(item).trim())
      ),
    ];

    return ["All", ...uniqueCategories];
  }, [events]);

  // ============================================================
  // FILTER + SORT
  // ============================================================

  const filteredEvents = useMemo(() => {
    let result = [...events];

    const searchValue = search.trim().toLowerCase();

    // SEARCH
    if (searchValue) {
      result = result.filter((event) => {
        const eventName = String(event.event_name || "").toLowerCase();
        const description = String(event.description || "").toLowerCase();
        const venue = String(event.venue || "").toLowerCase();
        const eventCategory = String(event.category || "").toLowerCase();

        return (
          eventName.includes(searchValue) ||
          description.includes(searchValue) ||
          venue.includes(searchValue) ||
          eventCategory.includes(searchValue)
        );
      });
    }

    // CATEGORY
    if (category !== "All") {
      result = result.filter(
        (event) =>
          String(event.category || "").toLowerCase() ===
          String(category).toLowerCase()
      );
    }

    // SORT
    result.sort((a, b) => {
      if (sortBy === "date-asc") {
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();

        return (
          (Number.isNaN(dateA) ? Infinity : dateA) -
          (Number.isNaN(dateB) ? Infinity : dateB)
        );
      }

      if (sortBy === "date-desc") {
        const dateA = new Date(a.event_date).getTime();
        const dateB = new Date(b.event_date).getTime();

        return (
          (Number.isNaN(dateB) ? -Infinity : dateB) -
          (Number.isNaN(dateA) ? -Infinity : dateA)
        );
      }

      if (sortBy === "price-asc") {
        return (
          Number(a.ticket_price || 0) -
          Number(b.ticket_price || 0)
        );
      }

      if (sortBy === "price-desc") {
        return (
          Number(b.ticket_price || 0) -
          Number(a.ticket_price || 0)
        );
      }

      if (sortBy === "name-asc") {
        return String(a.event_name || "").localeCompare(
          String(b.event_name || "")
        );
      }

      return 0;
    });

    return result;
  }, [events, search, category, sortBy]);

  // ============================================================
  // CLEAR FILTERS
  // ============================================================

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
    setSortBy("date-asc");
  };

  const hasFilters =
    search.trim() !== "" ||
    category !== "All" ||
    sortBy !== "date-asc";

  // ============================================================
  // LOADING SCREEN
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="mb-10 text-center">
            <div className="mx-auto h-8 w-48 animate-pulse rounded bg-slate-800" />
            <div className="mx-auto mt-4 h-5 w-80 max-w-full animate-pulse rounded bg-slate-800" />
          </div>

          <div className="mb-10 h-16 animate-pulse rounded-2xl bg-slate-900" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900"
              >
                <div className="h-52 animate-pulse bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-800" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-slate-800" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN
  // ============================================================

  return (
    <div className="min-h-screen overflow-hidden bg-[#020617] text-white">

      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="relative border-b border-white/10 overflow-hidden">

        {/* Background glow */}

        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="pointer-events-none absolute -right-40 top-10 h-96 w-96 rounded-full bg-violet-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          {/* Top badge */}

          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              Live Events
            </span>
          </div>

          {/* Heading */}

          <div className="mx-auto mt-6 max-w-3xl text-center">

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Find Your Next
              <span className="block bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
                Unforgettable Experience
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
              Discover concerts, technology events, workshops,
              sports and more. Choose your experience and book
              your seat in seconds.
            </p>

          </div>

          {/* Search */}

          <div className="mx-auto mt-9 max-w-3xl">

            <div className="group relative">

              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 opacity-0 blur transition duration-500 group-focus-within:opacity-100" />

              <div className="relative flex items-center rounded-2xl border border-white/10 bg-slate-900/90 shadow-2xl backdrop-blur-xl">

                <svg
                  className="ml-5 h-5 w-5 shrink-0 text-slate-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
                  />
                </svg>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search events, venues or categories..."
                  className="w-full bg-transparent px-4 py-5 text-sm text-white outline-none placeholder:text-slate-600"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="mr-4 rounded-lg px-2 py-1 text-slate-500 transition hover:bg-white/5 hover:text-white"
                  >
                    ✕
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* Mini stats */}

          <div className="mx-auto mt-8 flex max-w-xl flex-wrap items-center justify-center gap-3 text-xs text-slate-500">

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              🎫 {events.length} Events
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              🔒 Secure Booking
            </span>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
              ⚡ Instant Confirmation
            </span>

          </div>

        </div>
      </section>

      {/* ========================================================
          FILTER BAR
      ======================================================== */}

      <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-xl shadow-black/10">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            {/* Categories */}

            <div className="min-w-0 flex-1">

              <div className="mb-3 flex items-center justify-between">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Browse Categories
                </p>

                {category !== "All" && (
                  <span className="text-xs text-cyan-400">
                    {category}
                  </span>
                )}

              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">

                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition duration-300 ${
                      category === item
                        ? "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/20"
                        : "border border-white/10 bg-slate-950 text-slate-400 hover:border-cyan-400/40 hover:text-cyan-300"
                    }`}
                  >
                    {item !== "All" && getCategoryIcon(item)}
                    {item === "All" && "✨"}
                    {item}
                  </button>
                ))}

              </div>

            </div>

            {/* Sort */}

            <div className="w-full lg:w-60">

              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Sort By
              </label>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/10"
              >
                <option value="date-asc">
                  Soonest First
                </option>

                <option value="date-desc">
                  Latest First
                </option>

                <option value="price-asc">
                  Price: Low → High
                </option>

                <option value="price-desc">
                  Price: High → Low
                </option>

                <option value="name-asc">
                  Name: A → Z
                </option>
              </select>

            </div>

          </div>

          {/* Result info */}

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-bold text-white">
                {filteredEvents.length}
              </span>{" "}
              {filteredEvents.length === 1 ? "event" : "events"}
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="w-fit rounded-lg border border-white/10 px-4 py-2 text-xs font-semibold text-slate-400 transition hover:border-red-500/40 hover:text-red-400"
              >
                Reset Filters
              </button>
            )}

          </div>

        </div>

      </section>

      {/* ========================================================
          EVENT GRID
      ======================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-10 pb-20 sm:px-6 lg:px-8">

        {filteredEvents.length === 0 ? (

          /* EMPTY STATE */

          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-slate-900 text-4xl shadow-xl">
              🔎
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No Events Found
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
              We couldn't find any events matching your
              current search or filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-7 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-300"
            >
              Explore All Events
            </button>

          </div>

        ) : (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {filteredEvents.map((event) => {

              const availableSeats = Number(
                event.available_seats ?? 0
              );

              const ticketPrice = Number(
                event.ticket_price ?? 0
              );

              const isSoldOut = availableSeats <= 0;

              const isLimited =
                availableSeats > 0 &&
                availableSeats <= 10;

              return (

                <article
                  key={event.id}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20 transition duration-500 hover:-translate-y-2 hover:border-cyan-400/30 hover:shadow-2xl hover:shadow-cyan-950/20"
                >

                  {/* EVENT VISUAL */}

                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-cyan-950 via-slate-900 to-violet-950">

                    {/* Decorative glow */}

                    <div className="absolute -left-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl transition duration-500 group-hover:bg-cyan-400/20" />

                    <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl transition duration-500 group-hover:bg-violet-500/20" />

                    {/* Pattern */}

                    <div className="absolute inset-0 opacity-20">
                      <div
                        className="h-full w-full"
                        style={{
                          backgroundImage:
                            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                          backgroundSize: "24px 24px",
                        }}
                      />
                    </div>

                    {/* Ticket icon */}

                    <div className="relative flex h-full items-center justify-center">

                      <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/5 text-6xl shadow-2xl backdrop-blur-md transition duration-500 group-hover:scale-110 group-hover:rotate-2">
                        {getCategoryIcon(event.category)}
                      </div>

                    </div>

                    {/* Category */}

                    {event.category && (
                      <span className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 text-[11px] font-bold text-cyan-300 backdrop-blur-md">
                        {event.category}
                      </span>
                    )}

                    {/* Status */}

                    <span
                      className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold backdrop-blur-md ${
                        isSoldOut
                          ? "bg-red-500/90 text-white"
                          : isLimited
                          ? "bg-amber-400/90 text-slate-950"
                          : "bg-emerald-400/90 text-slate-950"
                      }`}
                    >
                      {isSoldOut
                        ? "SOLD OUT"
                        : isLimited
                        ? "FEW LEFT"
                        : "AVAILABLE"}
                    </span>

                  </div>

                  {/* CONTENT */}

                  <div className="p-6">

                    {/* Event title */}

                    <h2 className="line-clamp-1 text-xl font-extrabold text-white transition group-hover:text-cyan-300">
                      {event.event_name || "Untitled Event"}
                    </h2>

                    {/* Description */}

                    <p className="mt-2 min-h-[48px] line-clamp-2 text-sm leading-6 text-slate-500">
                      {event.description ||
                        "Join this exciting event and enjoy an unforgettable experience."}
                    </p>

                    {/* Event details */}

                    <div className="mt-6 space-y-3">

                      {/* Date */}

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-lg">
                          📅
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Date
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-300">
                            {formatDate(event.event_date)}
                          </p>
                        </div>

                      </div>

                      {/* Time */}

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-lg">
                          ⏰
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Time
                          </p>

                          <p className="mt-0.5 text-sm font-semibold text-slate-300">
                            {formatTime(event.event_time)}
                          </p>
                        </div>

                      </div>

                      {/* Venue */}

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/5 bg-white/[0.04] text-lg">
                          📍
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                            Venue
                          </p>

                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-300">
                            {event.venue || "Venue TBA"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* PRICE */}

                    <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5">

                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Ticket From
                        </p>

                        <div className="mt-1 flex items-baseline gap-1">

                          <span className="text-sm font-semibold text-slate-500">
                            ₹
                          </span>

                          <span className="text-2xl font-black text-cyan-300">
                            {ticketPrice.toLocaleString("en-IN")}
                          </span>

                        </div>
                      </div>

                      <div className="text-right">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                          Seats
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${
                            isSoldOut
                              ? "text-red-400"
                              : isLimited
                              ? "text-amber-400"
                              : "text-emerald-400"
                          }`}
                        >
                          {isSoldOut
                            ? "Sold Out"
                            : `${availableSeats} left`}
                        </p>

                      </div>

                    </div>

                    {/* BUTTON */}

                    <Link
                      to={`/events/${event.id}`}
                      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition duration-300 ${
                        isSoldOut
                          ? "border border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                          : "bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/10 hover:bg-cyan-300 hover:shadow-cyan-400/20"
                      }`}
                    >
                      {isSoldOut
                        ? "View Event"
                        : "View Details"}

                      <svg
                        className="h-5 w-5 transition duration-300 group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 7l5 5m0 0-5 5m5-5H6"
                        />
                      </svg>
                    </Link>

                  </div>

                </article>

              );
            })}

          </div>

        )}

      </main>

      {/* ========================================================
          CTA
      ======================================================== */}

      <section className="border-t border-white/10 bg-white/[0.02]">

        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">

          <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-cyan-400/5 via-violet-500/5 to-transparent px-6 py-14">

            <div className="pointer-events-none absolute left-1/2 top-0 h-48 w-48 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative">

              <div className="text-5xl">
                🎟️
              </div>

              <h2 className="mt-5 text-2xl font-black sm:text-3xl">
                Your Next Experience Is Waiting
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Explore new experiences, discover amazing events
                and make memories that last forever.
              </p>

              <div className="mt-7 flex justify-center">

                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-cyan-400/30 bg-cyan-400/5 px-7 py-3.5 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400 hover:text-slate-950"
                >
                  Explore All Events →
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Events;