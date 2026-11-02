
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // =====================================================
  // CHECK LOGIN STATUS
  // =====================================================

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Invalid user data:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setIsMenuOpen(false);

    navigate("/login");
  };

  // =====================================================
  // CLOSE MOBILE MENU
  // =====================================================

  const handleNavigation = () => {
    setIsMenuOpen(false);
  };

  // =====================================================
  // ACTIVE LINK
  // =====================================================

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }

    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path) => `
    relative px-1 py-2 text-sm font-medium transition
    ${
      isActive(path)
        ? "text-white"
        : "text-slate-400 hover:text-white"
    }
  `;

  const mobileLinkClass = (path) => `
    flex items-center justify-between rounded-xl px-4 py-3.5
    text-sm font-medium transition
    ${
      isActive(path)
        ? "bg-violet-500/10 text-violet-300"
        : "text-slate-300 hover:bg-white/5 hover:text-white"
    }
  `;

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-slate-950/80 shadow-lg shadow-black/10 backdrop-blur-2xl">

      {/* =================================================
          DESKTOP NAVBAR
      ================================================= */}

      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* ================= LOGO ================= */}

        <Link
          to="/"
          onClick={handleNavigation}
          className="group flex items-center gap-3"
        >
          <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-lg font-black text-white shadow-lg shadow-violet-600/20 transition duration-300 group-hover:scale-105">

            <span className="relative z-10">E</span>

            <div className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
          </div>

          <div className="hidden sm:block">
            <p className="text-lg font-black tracking-tight text-white">
              Event<span className="text-violet-400">Hub</span>
            </p>

            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500">
              Experience More
            </p>
          </div>
        </Link>

        {/* ================= DESKTOP MENU ================= */}

        <div className="hidden items-center gap-7 md:flex">

          <Link
            to="/"
            className={navLinkClass("/")}
          >
            Home

            {isActive("/") && (
              <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
            )}
          </Link>

          <Link
            to="/events"
            className={navLinkClass("/events")}
          >
            Events

            {isActive("/events") && (
              <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
            )}
          </Link>

          <Link
            to="/bookings"
            className={navLinkClass("/bookings")}
          >
            My Bookings

            {isActive("/bookings") && (
              <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
            )}
          </Link>

          <Link
            to="/about"
            className={navLinkClass("/about")}
          >
            About

            {isActive("/about") && (
              <span className="absolute -bottom-2 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-violet-400" />
            )}
          </Link>
        </div>

        {/* ================= DESKTOP AUTH ================= */}

        <div className="hidden items-center gap-3 md:flex">

          {user ? (
            <>
              {/* USER PROFILE */}

              <div className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-violet-500/20 hover:bg-white/[0.06]">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black text-white shadow-md shadow-violet-600/20">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="max-w-[130px]">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Welcome
                  </p>

                  <p className="truncate text-sm font-semibold text-white">
                    {user.name || "User"}
                  </p>
                </div>
              </div>

              {/* LOGOUT */}

              <button
                onClick={handleLogout}
                className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* LOGIN */}

              <Link
                to="/login"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:text-white"
              >
                Login
              </Link>

              {/* REGISTER */}

              <Link
                to="/register"
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-900/20 transition duration-300 hover:-translate-y-0.5 hover:from-violet-500 hover:to-indigo-500"
              >
                <span className="relative z-10">
                  Get Started
                </span>

                <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-full" />
              </Link>
            </>
          )}
        </div>

        {/* ================= MOBILE BUTTON ================= */}

        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-slate-300 transition hover:bg-white/10 hover:text-white md:hidden"
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* =================================================
          MOBILE MENU
      ================================================= */}

      <div
        className={`overflow-hidden border-t border-white/10 bg-slate-950/95 transition-all duration-300 md:hidden ${
          isMenuOpen
            ? "max-h-[600px] opacity-100"
            : "max-h-0 border-transparent opacity-0"
        }`}
      >
        <div className="px-4 pb-5 pt-4 sm:px-6">

          <div className="flex flex-col gap-1.5">

            {/* HOME */}

            <Link
              to="/"
              onClick={handleNavigation}
              className={mobileLinkClass("/")}
            >
              <span>Home</span>

              {isActive("/") && (
                <span className="text-violet-400">●</span>
              )}
            </Link>

            {/* EVENTS */}

            <Link
              to="/events"
              onClick={handleNavigation}
              className={mobileLinkClass("/events")}
            >
              <span>Events</span>

              {isActive("/events") && (
                <span className="text-violet-400">●</span>
              )}
            </Link>

            {/* BOOKINGS */}

            <Link
              to="/bookings"
              onClick={handleNavigation}
              className={mobileLinkClass("/bookings")}
            >
              <span>My Bookings</span>

              {isActive("/bookings") && (
                <span className="text-violet-400">●</span>
              )}
            </Link>

            {/* ABOUT */}

            <Link
              to="/about"
              onClick={handleNavigation}
              className={mobileLinkClass("/about")}
            >
              <span>About</span>

              {isActive("/about") && (
                <span className="text-violet-400">●</span>
              )}
            </Link>
          </div>

          {/* ================= MOBILE AUTH ================= */}

          {user ? (
            <div className="mt-4 border-t border-white/10 pt-4">

              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-black text-white">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">
                    Logged in as
                  </p>

                  <p className="truncate text-sm font-semibold text-white">
                    {user.name || "User"}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 hover:text-red-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">

              <Link
                to="/login"
                onClick={handleNavigation}
                className="rounded-xl px-4 py-3 text-center text-sm font-semibold text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={handleNavigation}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:from-violet-500 hover:to-indigo-500"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

