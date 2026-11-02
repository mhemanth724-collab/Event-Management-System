import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await api.get("/events/all");

      if (response.data.status) {
        setEvents(response.data.events || []);
      }
    } catch (error) {
      console.error("Events Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { icon: "🎵", title: "Music" },
    { icon: "💼", title: "Business" },
    { icon: "🎨", title: "Art" },
    { icon: "💻", title: "Technology" },
    { icon: "⚽", title: "Sports" },
    { icon: "🎓", title: "Education" },
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = search.toLowerCase().trim();

      const matchesSearch =
        !text ||
        event.event_name?.toLowerCase().includes(text) ||
        event.description?.toLowerCase().includes(text) ||
        event.venue?.toLowerCase().includes(text);

      const matchesCategory =
        activeCategory === "All" ||
        event.category?.toLowerCase() === activeCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [events, search, activeCategory]);

  const featuredEvents = filteredEvents.slice(0, 6);

  const formatDate = (date) => {
    if (!date) return "Date TBA";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category) => {
    const found = categories.find(
      (item) =>
        item.title.toLowerCase() === category?.toLowerCase()
    );

    return found?.icon || "🎟️";
  };

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#05050b] text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative min-h-[760px] overflow-hidden">

        {/* Background */}

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.20),transparent_30%),radial-gradient(circle_at_85%_25%,rgba(37,99,235,0.15),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(217,70,239,0.08),transparent_35%)]" />

        <div className="absolute left-1/2 top-0 h-px w-[70%] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-24 lg:px-8 lg:pt-32">

          <div className="grid items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">

            {/* LEFT */}

            <div>

              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 backdrop-blur-xl">

                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                LIVE EVENT DISCOVERY

              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-[1.05] tracking-[-0.04em] sm:text-6xl lg:text-7xl">

                Your next

                <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                  unforgettable
                </span>

                experience.

              </h1>

              <p className="mt-7 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
                Discover concerts, technology events, business meetups,
                workshops and experiences happening around you.
              </p>

              {/* SEARCH BOX */}

              <div className="mt-9 max-w-2xl">

                <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-violet-950/20 backdrop-blur-xl sm:flex-row">

                  <div className="relative flex-1">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔎
                    </span>

                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="What do you want to experience?"
                      className="w-full rounded-xl bg-transparent py-4 pl-12 pr-4 text-sm text-white outline-none placeholder:text-slate-600"
                    />

                  </div>

                  <Link
                    to="/events"
                    className="rounded-xl bg-white px-7 py-4 text-center text-sm font-bold text-slate-950 transition hover:bg-violet-100"
                  >
                    Discover Events
                  </Link>

                </div>

              </div>

              {/* QUICK FILTERS */}

              <div className="mt-6 flex flex-wrap gap-2">

                <button
                  onClick={() => setActiveCategory("All")}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                    activeCategory === "All"
                      ? "border-violet-400/40 bg-violet-500/15 text-violet-300"
                      : "border-white/10 bg-white/[0.03] text-slate-500 hover:text-white"
                  }`}
                >
                  ✨ All Events
                </button>

                {categories.slice(0, 4).map((item) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveCategory(item.title)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                      activeCategory === item.title
                        ? "border-violet-400/40 bg-violet-500/15 text-violet-300"
                        : "border-white/10 bg-white/[0.03] text-slate-500 hover:text-white"
                    }`}
                  >
                    {item.icon} {item.title}
                  </button>
                ))}

              </div>

              {/* STATS */}

              <div className="mt-12 flex flex-wrap gap-8">

                <div>
                  <p className="text-3xl font-black">
                    {events.length}+
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Events Listed
                  </p>
                </div>

                <div className="h-12 w-px bg-white/10" />

                <div>
                  <p className="text-3xl font-black">
                    50K+
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Happy Attendees
                  </p>
                </div>

                <div className="h-12 w-px bg-white/10" />

                <div>
                  <p className="text-3xl font-black">
                    100+
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    Organizers
                  </p>
                </div>

              </div>

            </div>

            {/* RIGHT EVENT VISUAL */}

            <div className="relative hidden lg:block">

              {/* Glow */}

              <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[100px]" />

              {/* Main Ticket */}

              <div className="relative mx-auto max-w-md rotate-2 rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-2xl shadow-violet-950/50 backdrop-blur-xl">

                <div className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-violet-600 via-purple-700 to-blue-700 p-8">

                  <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />

                  <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-2xl" />

                  <div className="relative">

                    <div className="flex items-center justify-between">

                      <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        Event Pass
                      </span>

                      <span className="text-xs text-white/70">
                        #2026
                      </span>

                    </div>

                    <div className="py-16 text-center">

                      <div className="text-8xl drop-shadow-2xl">
                        🎟️
                      </div>

                      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
                        Discover
                      </p>

                      <h2 className="mt-2 text-3xl font-black">
                        Something
                      </h2>

                      <h2 className="text-3xl font-black">
                        Extraordinary
                      </h2>

                    </div>

                    <div className="flex items-end justify-between border-t border-white/20 pt-5">

                      <div>
                        <p className="text-[10px] uppercase text-white/50">
                          Access
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          Anytime. Anywhere.
                        </p>
                      </div>

                      <div className="text-4xl">
                        ✦
                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* FLOATING CARD */}

              <div className="absolute -left-10 top-16 rounded-2xl border border-white/10 bg-[#0b0b13]/95 p-4 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                    ✓
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      Secure Booking
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Payment protected
                    </p>
                  </div>

                </div>

              </div>

              {/* FLOATING CARD */}

              <div className="absolute -bottom-6 -right-5 rounded-2xl border border-white/10 bg-[#0b0b13]/95 p-4 shadow-2xl backdrop-blur-xl">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-xl">
                    ⚡
                  </div>

                  <div>
                    <p className="text-xs font-bold">
                      Instant Ticket
                    </p>
                    <p className="mt-1 text-[10px] text-slate-600">
                      Ready after payment
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          CATEGORY SECTION
      ===================================================== */}

      <section className="border-t border-white/[0.06] px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
                Explore
              </p>

              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
                Find your vibe.
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Pick a category and discover what's happening.
              </p>

            </div>

            <button
              onClick={clearFilters}
              className="text-sm font-semibold text-slate-500 transition hover:text-white"
            >
              Reset Filters ↗
            </button>

          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">

            {categories.map((item) => (

              <button
                key={item.title}
                onClick={() => setActiveCategory(item.title)}
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left transition duration-300 hover:-translate-y-1 ${
                  activeCategory === item.title
                    ? "border-violet-500/40 bg-violet-500/10"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-violet-500/30"
                }`}
              >

                <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-violet-500/10 blur-2xl transition group-hover:bg-violet-500/20" />

                <div className="relative">

                  <div className="text-3xl transition duration-300 group-hover:scale-110">
                    {item.icon}
                  </div>

                  <p className="mt-5 text-sm font-bold">
                    {item.title}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-600">
                    Explore →
                  </p>

                </div>

              </button>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          FEATURED EVENTS
      ===================================================== */}

      <section className="px-6 pb-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <div className="flex items-center gap-3">

                <span className="h-2 w-2 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />

                <p className="text-xs font-bold uppercase tracking-[0.25em] text-red-400">
                  What's happening
                </p>

              </div>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                Trending experiences
              </h2>

              <p className="mt-3 text-sm text-slate-500">
                Handpicked events worth showing up for.
              </p>

            </div>

            <Link
              to="/events"
              className="text-sm font-bold text-violet-400 transition hover:text-violet-300"
            >
              See all events →
            </Link>

          </div>

          {loading ? (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (

                <div
                  key={item}
                  className="animate-pulse rounded-3xl border border-white/10 bg-white/[0.03] p-4"
                >

                  <div className="h-52 rounded-2xl bg-white/[0.06]" />

                  <div className="mt-5 h-5 w-3/4 rounded bg-white/[0.06]" />

                  <div className="mt-3 h-4 w-full rounded bg-white/[0.06]" />

                  <div className="mt-2 h-4 w-2/3 rounded bg-white/[0.06]" />

                </div>

              ))}

            </div>

          ) : featuredEvents.length === 0 ? (

            <div className="rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-24 text-center">

              <div className="text-6xl">
                🔎
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Nothing found
              </h3>

              <p className="mt-3 text-sm text-slate-500">
                Try another keyword or choose a different category.
              </p>

              <button
                onClick={clearFilters}
                className="mt-7 rounded-xl bg-violet-600 px-6 py-3 text-sm font-bold transition hover:bg-violet-500"
              >
                Clear Search
              </button>

            </div>

          ) : (

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {featuredEvents.map((event, index) => (

                <article
                  key={event.id}
                  className="group overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025] transition duration-500 hover:-translate-y-2 hover:border-violet-500/30 hover:bg-white/[0.04] hover:shadow-2xl hover:shadow-violet-950/20"
                >

                  {/* IMAGE AREA */}

                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-violet-700/40 via-fuchsia-700/10 to-blue-900/20">

                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.25),transparent_65%)]" />

                    <div className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-black/20 text-xs backdrop-blur">
                      #{index + 1}
                    </div>

                    <div className="flex h-full items-center justify-center text-7xl transition duration-500 group-hover:scale-125">
                      {getCategoryIcon(event.category)}
                    </div>

                    {event.category && (

                      <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-200 backdrop-blur-xl">
                        {event.category}
                      </div>

                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="p-6">

                    <h3 className="line-clamp-1 text-xl font-black transition group-hover:text-violet-300">
                      {event.event_name}
                    </h3>

                    <p className="mt-3 line-clamp-2 min-h-[48px] text-sm leading-6 text-slate-500">
                      {event.description ||
                        "Join us for an amazing event experience."}
                    </p>

                    {/* DETAILS */}

                    <div className="mt-6 space-y-3">

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                          📅
                        </div>

                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-slate-700">
                            Date
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-slate-400">
                            {formatDate(event.event_date)}
                          </p>
                        </div>

                      </div>

                      {event.event_time && (

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                            🕐
                          </div>

                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-slate-700">
                              Time
                            </p>

                            <p className="mt-0.5 text-xs font-semibold text-slate-400">
                              {event.event_time}
                            </p>
                          </div>

                        </div>

                      )}

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05]">
                          📍
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] uppercase tracking-wider text-slate-700">
                            Venue
                          </p>

                          <p className="mt-0.5 truncate text-xs font-semibold text-slate-400">
                            {event.venue || "Venue TBA"}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* BOTTOM */}

                    <div className="mt-6 flex items-center justify-between border-t border-white/[0.07] pt-5">

                      <div>

                        <p className="text-[10px] uppercase tracking-wider text-slate-700">
                          Starting from
                        </p>

                        <p className="mt-1 text-xl font-black text-white">
                          ₹{event.ticket_price ?? 0}
                        </p>

                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className="rounded-xl bg-violet-600 px-5 py-3 text-xs font-bold transition hover:bg-violet-500"
                      >
                        View Event
                      </Link>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </div>

      </section>

      {/* =====================================================
          HOW IT WORKS
      ===================================================== */}

      <section className="border-y border-white/[0.06] bg-white/[0.015] px-6 py-20 lg:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="text-center">

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-400">
              Simple process
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              From discovery to experience.
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Everything is designed to make event booking quick,
              simple and secure.
            </p>

          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">

            {[
              [
                "01",
                "Discover",
                "Find concerts, workshops, conferences and experiences that match your interests.",
                "🔎",
              ],
              [
                "02",
                "Book",
                "Choose your tickets and complete your booking securely through our payment flow.",
                "🎟️",
              ],
              [
                "03",
                "Experience",
                "Get your confirmation and digital ticket. Show up and enjoy the experience.",
                "✨",
              ],
            ].map(([number, title, text, icon]) => (

              <div
                key={number}
                className="relative rounded-3xl border border-white/[0.07] bg-white/[0.025] p-7"
              >

                <div className="flex items-center justify-between">

                  <span className="text-xs font-black text-violet-400">
                    {number}
                  </span>

                  <span className="text-3xl">
                    {icon}
                  </span>

                </div>

                <h3 className="mt-8 text-xl font-black">
                  {title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          ORGANIZER CTA
      ===================================================== */}

      <section className="px-6 py-20 lg:px-8">

        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-violet-600/15 via-fuchsia-600/[0.06] to-blue-600/[0.08] px-7 py-16 text-center sm:px-12">

          <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/20 blur-[90px]" />

          <div className="relative">

            <div className="text-5xl">
              🚀
            </div>

            <p className="mt-6 text-xs font-bold uppercase tracking-[0.25em] text-violet-300">
              For organizers
            </p>

            <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black sm:text-5xl">
              Have an event?
              <span className="block text-slate-400">
                Bring it to life.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-500">
              Create memorable experiences and connect your event
              with people who are ready to attend.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

              <Link
                to="/events"
                className="rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-slate-950 transition hover:bg-violet-100"
              >
                Explore Events
              </Link>

              <Link
                to="/register"
                className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold transition hover:bg-white/10"
              >
                Create Account
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-white/[0.06] px-6 py-10 lg:px-8">

        <div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-center md:justify-between">

          <div>

            <Link
              to="/"
              className="text-2xl font-black tracking-tight"
            >
              Event
              <span className="text-violet-400">
                Hub
              </span>
            </Link>

            <p className="mt-2 text-xs text-slate-700">
              Discover. Book. Experience.
            </p>

          </div>

          <div className="flex flex-wrap gap-6 text-xs font-semibold text-slate-500">

            <Link
              to="/events"
              className="transition hover:text-violet-400"
            >
              Events
            </Link>

            <Link
              to="/about"
              className="transition hover:text-violet-400"
            >
              About
            </Link>

            <Link
              to="/register"
              className="transition hover:text-violet-400"
            >
              Register
            </Link>

          </div>

          <div className="text-xs text-slate-700">
            © 2026 EventHub
          </div>

        </div>

      </footer>

    </main>
  );
}

export default Home;