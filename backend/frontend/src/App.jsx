import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Booking from "./pages/Booking";
import Bookings from "./pages/Bookings";
import BookingConfirmation from "./pages/BookingConfirmation";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import AdminAddEvent from "./pages/AdminAddEvent";
import AdminEvents from "./pages/AdminEvents";
import AdminEditEvent from "./pages/AdminEditEvent";
import AdminBookings from "./pages/AdminBookings";
import AdminUsers from "./pages/AdminUsers";

// ================= ABOUT =================

function About() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          About Us
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          About EventHub
        </h1>

        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400">
          EventHub is an event management platform where users
          can discover events, view event details and book tickets
          easily.
        </p>
      </div>
    </main>
  );
}

// ================= APP =================

function App() {
  return (
    <BrowserRouter>

      {/* ================= NAVBAR ================= */}
      <Navbar />

      <Routes>

        {/* ================= HOME ================= */}

        <Route
          path="/"
          element={<Home />}
        />

        {/* ================= EVENTS ================= */}

        <Route
          path="/events"
          element={<Events />}
        />

        {/* ================= EVENT DETAILS ================= */}

        <Route
          path="/events/:id"
          element={<EventDetails />}
        />

        {/* ================= BOOK TICKET ================= */}

        <Route
          path="/book/:id"
          element={<Booking />}
        />

        {/* ================= MY BOOKINGS ================= */}

        <Route
          path="/bookings"
          element={<Bookings />}
        />

        {/* ================= BOOKING CONFIRMATION ================= */}

        <Route
          path="/booking-confirmation/:id"
          element={<BookingConfirmation />}
        />

        {/* ================= ABOUT ================= */}

        <Route
          path="/about"
          element={<About />}
        />

        {/* ================= LOGIN ================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        {/* ================= REGISTER ================= */}

        <Route
          path="/register"
          element={<Register />}
        />

        {/* ==================================================
            ADMIN ROUTES
        ================================================== */}

        {/* ================= ADMIN DASHBOARD ================= */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

        {/* ================= ADMIN ADD EVENT ================= */}

        <Route
          path="/admin/events/add"
          element={<AdminAddEvent />}
        />

        {/* ================= ADMIN MANAGE EVENTS ================= */}

        <Route
          path="/admin/events"
          element={<AdminEvents />}
        />

        {/* ================= ADMIN EDIT EVENT ================= */}

        <Route
          path="/admin/events/edit/:id"
          element={<AdminEditEvent />}
        />

        {/* ================= ADMIN ALL BOOKINGS ================= */}

        <Route
          path="/admin/bookings"
          element={<AdminBookings />}
        />

        {/* ================= ADMIN ALL USERS ================= */}

        <Route
          path="/admin/users"
          element={<AdminUsers />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;