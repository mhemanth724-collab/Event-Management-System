import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

// ============================================================
// RAZORPAY CHECKOUT SCRIPT
// ============================================================

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });
};

// ============================================================
// DATE FORMAT
// ============================================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Date not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// TIME FORMAT
// ============================================================

const formatTime = (timeValue) => {
  if (!timeValue) {
    return "Time not available";
  }

  const timeString = String(timeValue);

  const date = new Date(`1970-01-01T${timeString}`);

  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return timeString;
};

// ============================================================
// CURRENCY FORMAT
// ============================================================

const formatCurrency = (amount) => {
  const value = Number(amount);

  if (!Number.isFinite(value)) {
    return "₹0.00";
  }

  return `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// ============================================================
// BOOKING PAGE
// ============================================================

function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [event, setEvent] = useState(null);
  const [tickets, setTickets] = useState(1);

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const [error, setError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // ==========================================================
  // LOAD EVENT
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/events/${id}`);

        if (!mounted) {
          return;
        }

        if (response.data?.status) {
          setEvent(response.data.event);
        } else {
          setError(
            response.data?.message || "Event not found"
          );
        }
      } catch (err) {
        console.error("Fetch event error:", err);

        if (!mounted) {
          return;
        }

        if (err.response?.status === 404) {
          setError("Event not found");
        } else if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          navigate("/login", {
            replace: true,
            state: {
              from: `/book/${id}`,
            },
          });
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load event"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchEvent();

    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  // ==========================================================
  // LOGIN CHECK
  // ==========================================================

  const getLoggedInUser = () => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
      return null;
    }

    try {
      const user = JSON.parse(storedUser);

      if (!user?.id) {
        return null;
      }

      return user;
    } catch (err) {
      console.error("Invalid user data:", err);
      return null;
    }
  };

  // ==========================================================
  // TICKET CHANGE
  // ==========================================================

  const increaseTickets = () => {
    if (!event) {
      return;
    }

    const availableSeats = Number(event.available_seats);

    if (tickets < availableSeats) {
      setTickets((current) => current + 1);
    }
  };

  const decreaseTickets = () => {
    setTickets((current) =>
      Math.max(1, current - 1)
    );
  };

  // ==========================================================
  // TOTAL
  // ==========================================================

  const ticketPrice = Number(
    event?.ticket_price || 0
  );

  const availableSeats = Number(
    event?.available_seats || 0
  );

  const totalAmount = ticketPrice * tickets;

  // ==========================================================
  // CREATE ORDER + OPEN RAZORPAY
  // ==========================================================

  const handleBooking = async () => {
    setError("");
    setPaymentError("");
    setPaymentSuccess(false);

    // --------------------------------------------------------
    // CHECK LOGIN
    // --------------------------------------------------------

    const token = localStorage.getItem("token");
    const user = getLoggedInUser();

    if (!token || !user) {
      navigate("/login", {
        replace: true,
        state: {
          from: `/book/${id}`,
        },
      });

      return;
    }

    // --------------------------------------------------------
    // CHECK EVENT
    // --------------------------------------------------------

    if (!event) {
      setError("Event information is unavailable.");
      return;
    }

    // --------------------------------------------------------
    // VALIDATE EVENT ID
    // --------------------------------------------------------

    const eventId = Number(id);

    if (!Number.isInteger(eventId) || eventId <= 0) {
      setError("Invalid event ID.");
      return;
    }

    // --------------------------------------------------------
    // VALIDATE TICKETS
    // --------------------------------------------------------

    const selectedTickets = Number(tickets);

    if (
      !Number.isInteger(selectedTickets) ||
      selectedTickets <= 0
    ) {
      setError("Please select a valid number of tickets.");
      return;
    }

    // --------------------------------------------------------
    // CHECK SEATS
    // --------------------------------------------------------

    if (availableSeats <= 0) {
      setError("This event is sold out.");
      return;
    }

    if (selectedTickets > availableSeats) {
      setError(
        `Only ${availableSeats} seat${
          availableSeats === 1 ? "" : "s"
        } available.`
      );

      return;
    }

    // --------------------------------------------------------
    // LOAD RAZORPAY
    // --------------------------------------------------------

    setBooking(true);

    try {
      const razorpayLoaded =
        await loadRazorpayScript();

      if (!razorpayLoaded) {
        setPaymentError(
          "Razorpay Checkout could not be loaded. Please check your internet connection and try again."
        );

        setBooking(false);
        return;
      }

      // ------------------------------------------------------
      // CREATE BACKEND ORDER
      // ------------------------------------------------------

      const orderResponse = await api.post(
        "/bookings/create-order",
        {
          event_id: eventId,
          tickets: selectedTickets,
        }
      );

      if (!orderResponse.data?.status) {
        throw new Error(
          orderResponse.data?.message ||
            "Unable to create payment order."
        );
      }

      const orderData = orderResponse.data;

      // ------------------------------------------------------
      // RAZORPAY OPTIONS
      // ------------------------------------------------------

      const options = {
        key: orderData.key_id,

        amount: orderData.amount,

        currency:
          orderData.currency || "INR",

        name: "Event Management System",

        description: `${event.event_name} - ${selectedTickets} ticket${
          selectedTickets > 1 ? "s" : ""
        }`,

        order_id: orderData.order_id,

        // ----------------------------------------------------
        // USER INFORMATION
        // ----------------------------------------------------

        prefill: {
          name: user.name || "",
          email: user.email || "",
        },

        // ----------------------------------------------------
        // THEME
        // ----------------------------------------------------

        theme: {
          color: "#7c3aed",
        },

        // ----------------------------------------------------
        // PAYMENT HANDLER
        // ----------------------------------------------------

        handler: async function (paymentResponse) {
          try {
            setPaymentError("");
            setBooking(true);

            // ----------------------------------------------
            // VERIFY PAYMENT ON BACKEND
            // ----------------------------------------------

            const verifyResponse = await api.post(
              "/bookings/verify-payment",
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            if (!verifyResponse.data?.status) {
              throw new Error(
                verifyResponse.data?.message ||
                  "Payment verification failed."
              );
            }

            // ----------------------------------------------
            // GET BOOKING ID
            // ----------------------------------------------

            const bookingId =
              verifyResponse.data?.booking_id ||
              orderData.booking_id;

            if (!bookingId) {
              throw new Error(
                "Payment successful, but booking ID was not returned."
              );
            }

            // ----------------------------------------------
            // PAYMENT SUCCESS
            // ----------------------------------------------

            setPaymentSuccess(true);
            setBooking(false);

            // ----------------------------------------------
            // GO TO BOOKING CONFIRMATION PAGE
            // ----------------------------------------------

            navigate(
              `/booking-confirmation/${bookingId}`,
              {
                replace: true,
              }
            );
          } catch (err) {
            console.error(
              "Payment verification error:",
              err
            );

            setBooking(false);

            if (err.response?.status === 401) {
              localStorage.removeItem("token");
              localStorage.removeItem("user");

              navigate("/login", {
                replace: true,
                state: {
                  from: `/book/${id}`,
                },
              });

              return;
            }

            setPaymentError(
              err.response?.data?.message ||
                err.message ||
                "Payment verification failed. Please contact support if money was deducted."
            );
          }
        },

        // ----------------------------------------------------
        // PAYMENT MODAL CLOSED
        // ----------------------------------------------------

        modal: {
          ondismiss: function () {
            setBooking(false);

            setPaymentError(
              "Payment window was closed. Your payment was not completed."
            );
          },
        },

        // ----------------------------------------------------
        // NOTES
        // ----------------------------------------------------

        notes: {
          event_id: String(eventId),
          tickets: String(selectedTickets),
        },
      };

      // ------------------------------------------------------
      // OPEN RAZORPAY
      // ------------------------------------------------------

      const razorpay =
        new window.Razorpay(options);

      // ------------------------------------------------------
      // PAYMENT FAILURE EVENT
      // ------------------------------------------------------

      razorpay.on(
        "payment.failed",
        function (response) {
          console.error(
            "Razorpay payment failed:",
            response
          );

          setBooking(false);

          setPaymentError(
            response.error?.description ||
              "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (err) {
      console.error(
        "Booking/payment error:",
        err
      );

      setBooking(false);

      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", {
          replace: true,
          state: {
            from: `/book/${id}`,
          },
        });

        return;
      }

      if (err.response?.status === 400) {
        setPaymentError(
          err.response?.data?.message ||
            "Unable to create payment order."
        );

        return;
      }

      setPaymentError(
        err.response?.data?.message ||
          err.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

          <p className="text-slate-300">
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================================
  // EVENT ERROR
  // ==========================================================

  if (error && !event) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-2xl">
            !
          </div>

          <h1 className="mb-2 text-2xl font-bold">
            Event Not Found
          </h1>

          <p className="mb-6 text-slate-400">
            {error}
          </p>

          <button
            onClick={() => navigate("/events")}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
          >
            <span className="text-xl">
              ←
            </span>

            Back
          </button>

          <h1 className="text-lg font-bold sm:text-xl">
            Event Booking
          </h1>

          <div className="w-14" />
        </div>
      </header>

      {/* CONTENT */}

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="grid gap-8 lg:grid-cols-3">

          {/* EVENT DETAILS */}

          <section className="lg:col-span-2">

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">

              {/* EVENT HEADER */}

              <div className="bg-gradient-to-br from-violet-900/50 via-slate-900 to-slate-900 p-6 sm:p-8">

                <div className="mb-4 inline-flex rounded-full border border-violet-400/20 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">
                  Event
                </div>

                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {event?.event_name}
                </h2>

                {event?.category && (
                  <p className="mt-3 text-sm text-violet-300">
                    {event.category}
                  </p>
                )}
              </div>

              {/* DETAILS */}

              <div className="grid gap-4 border-t border-slate-800 p-6 sm:grid-cols-2 sm:p-8">

                <div className="rounded-2xl bg-slate-800/60 p-5">
                  <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                    Date
                  </p>

                  <p className="font-semibold">
                    {formatDate(event?.event_date)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800/60 p-5">
                  <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                    Time
                  </p>

                  <p className="font-semibold">
                    {formatTime(event?.event_time)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-800/60 p-5 sm:col-span-2">
                  <p className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                    Venue
                  </p>

                  <p className="font-semibold">
                    {event?.venue ||
                      "Venue not available"}
                  </p>
                </div>

              </div>

              {/* DESCRIPTION */}

              {event?.description && (
                <div className="border-t border-slate-800 p-6 sm:p-8">

                  <h3 className="mb-3 text-lg font-semibold">
                    About this event
                  </h3>

                  <p className="leading-7 text-slate-400">
                    {event.description}
                  </p>

                </div>
              )}

            </div>
          </section>

          {/* BOOKING SUMMARY */}

          <aside>

            <div className="sticky top-6 rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

              <h2 className="mb-6 text-xl font-bold">
                Booking Summary
              </h2>

              {/* TICKET PRICE */}

              <div className="mb-5 flex items-center justify-between">
                <span className="text-slate-400">
                  Ticket Price
                </span>

                <span className="font-semibold">
                  {formatCurrency(ticketPrice)}
                </span>
              </div>

              {/* AVAILABLE SEATS */}

              <div className="mb-6 flex items-center justify-between">
                <span className="text-slate-400">
                  Available Seats
                </span>

                <span
                  className={
                    availableSeats > 0
                      ? "font-semibold text-emerald-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {availableSeats}
                </span>
              </div>

              {/* TICKET SELECTOR */}

              <div className="mb-6">

                <label className="mb-3 block text-sm font-semibold">
                  Number of Tickets
                </label>

                <div className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-800 p-2">

                  <button
                    type="button"
                    onClick={decreaseTickets}
                    disabled={
                      tickets <= 1 || booking
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700 text-xl font-bold transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <div className="text-center">

                    <p className="text-xl font-bold">
                      {tickets}
                    </p>

                    <p className="text-xs text-slate-500">
                      ticket
                      {tickets > 1 ? "s" : ""}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={increaseTickets}
                    disabled={
                      booking ||
                      tickets >= availableSeats
                    }
                    className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-700 text-xl font-bold transition hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>

                </div>
              </div>

              {/* TOTAL */}

              <div className="mb-6 border-t border-slate-800 pt-5">

                <div className="flex items-center justify-between">

                  <span className="text-lg font-semibold">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-violet-400">
                    {formatCurrency(totalAmount)}
                  </span>

                </div>

              </div>

              {/* GENERAL ERROR */}

              {error && (
                <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* PAYMENT ERROR */}

              {paymentError && (
                <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-300">

                  <p className="font-semibold">
                    Payment Status
                  </p>

                  <p className="mt-1">
                    {paymentError}
                  </p>

                </div>
              )}

              {/* SUCCESS */}

              {paymentSuccess && (
                <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-300">

                  <p className="font-semibold">
                    Payment Successful 🎉
                  </p>

                  <p className="mt-1">
                    Redirecting to your booking confirmation...
                  </p>

                </div>
              )}

              {/* PAYMENT BUTTON */}

              <button
                type="button"
                onClick={handleBooking}
                disabled={
                  booking ||
                  paymentSuccess ||
                  availableSeats <= 0
                }
                className="w-full rounded-2xl bg-violet-600 px-6 py-4 font-bold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {booking ? (
                  <span className="flex items-center justify-center gap-3">

                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    Processing...

                  </span>
                ) : availableSeats <= 0 ? (
                  "Sold Out"
                ) : paymentSuccess ? (
                  "Payment Successful"
                ) : (
                  `Pay ${formatCurrency(totalAmount)}`
                )}
              </button>

              {/* SECURITY TEXT */}

              <div className="mt-5 flex items-start gap-3 text-xs leading-5 text-slate-500">

                <span className="text-base">
                  🔒
                </span>

                <p>
                  Secure payment powered by Razorpay.
                  Your payment details are handled by
                  the payment gateway.
                </p>

              </div>

            </div>
          </aside>

        </div>
      </main>
    </div>
  );
}

export default Booking;