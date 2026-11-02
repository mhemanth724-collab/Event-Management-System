import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";

import api from "../services/api";

function Bookings() {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) return "N/A";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return value;
    }
  };

  // =====================================================
  // FORMAT DATE + TIME
  // =====================================================

  const formatDateTime = (value) => {
    if (!value) return "N/A";

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return value;
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (value) => {
    if (!value) return "N/A";

    try {
      const time = String(value).slice(0, 5);
      const [hours, minutes] = time.split(":");

      if (hours === undefined || minutes === undefined) {
        return value;
      }

      const hour = Number(hours);
      const minute = Number(minutes);

      if (
        Number.isNaN(hour) ||
        Number.isNaN(minute) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59
      ) {
        return value;
      }

      const period = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;

      return `${formattedHour}:${String(minute).padStart(
        2,
        "0"
      )} ${period}`;
    } catch {
      return value;
    }
  };

  // =====================================================
  // GET PAYMENT STATUS
  // =====================================================

  const getPaymentStatus = (booking) => {
    return String(
      booking.payment_status || "Pending"
    ).toLowerCase();
  };

  // =====================================================
  // GET BOOKING STATUS
  // =====================================================

  const getBookingStatus = (booking) => {
    return String(
      booking.status || "Unknown"
    ).toLowerCase();
  };

  // =====================================================
  // PAYMENT STATUS BADGE
  // =====================================================

  const renderPaymentStatus = (booking) => {
    const status = getPaymentStatus(booking);

    if (status === "paid") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Payment Paid
        </span>
      );
    }

    if (
      status === "failed" ||
      status === "cancelled" ||
      status === "canceled"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Payment Failed
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
        <span className="h-2 w-2 rounded-full bg-yellow-400" />
        Payment Pending
      </span>
    );
  };

  // =====================================================
  // BOOKING STATUS BADGE
  // =====================================================

  const renderBookingStatus = (booking) => {
    const status = getBookingStatus(booking);

    if (
      status === "booked" ||
      status === "confirmed"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400">
          <span className="h-2 w-2 rounded-full bg-violet-400" />
          Booking Confirmed
        </span>
      );
    }

    if (
      status === "cancelled" ||
      status === "canceled"
    ) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
          <span className="h-2 w-2 rounded-full bg-red-400" />
          Booking Cancelled
        </span>
      );
    }

    if (status === "payment pending") {
      return (
        <span className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-400">
          <span className="h-2 w-2 rounded-full bg-yellow-400" />
          Payment Pending
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300">
        <span className="h-2 w-2 rounded-full bg-slate-400" />
        {booking.status || "Unknown"}
      </span>
    );
  };

  // =====================================================
  // DOWNLOAD BOOKING TICKET PDF
  // =====================================================

  const downloadTicket = (booking) => {
    try {
      setDownloadingId(booking.id);

      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const totalAmount = Number(
        booking.total_amount || 0
      );

      // =================================================
      // HEADER
      // =================================================

      pdf.setFillColor(15, 23, 42);

      pdf.rect(
        0,
        0,
        pageWidth,
        42,
        "F"
      );

      pdf.setTextColor(255, 255, 255);

      pdf.setFontSize(20);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "EVENT MANAGEMENT SYSTEM",
        pageWidth / 2,
        17,
        {
          align: "center",
        }
      );

      pdf.setFontSize(10);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.text(
        "Booking Confirmation Ticket",
        pageWidth / 2,
        27,
        {
          align: "center",
        }
      );

      // =================================================
      // CONFIRMED BADGE
      // =================================================

      pdf.setFillColor(
        16,
        185,
        129
      );

      pdf.roundedRect(
        pageWidth / 2 - 30,
        50,
        60,
        10,
        3,
        3,
        "F"
      );

      pdf.setTextColor(
        255,
        255,
        255
      );

      pdf.setFontSize(8);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "BOOKING CONFIRMED",
        pageWidth / 2,
        56.5,
        {
          align: "center",
        }
      );

      // =================================================
      // EVENT NAME
      // =================================================

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.setFontSize(17);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      const eventName =
        booking.event_name || "Event";

      const eventNameLines =
        pdf.splitTextToSize(
          eventName,
          pageWidth - 40
        );

      pdf.text(
        eventNameLines,
        pageWidth / 2,
        78,
        {
          align: "center",
        }
      );

      // =================================================
      // LINE
      // =================================================

      pdf.setDrawColor(
        203,
        213,
        225
      );

      pdf.line(
        20,
        90,
        pageWidth - 20,
        90
      );

      // =================================================
      // DETAILS FUNCTION
      // =================================================

      const addRow = (
        label,
        value,
        y
      ) => {
        pdf.setFontSize(10);

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setTextColor(
          100,
          116,
          139
        );

        pdf.text(
          label,
          20,
          y
        );

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setTextColor(
          15,
          23,
          42
        );

        const safeValue = String(
          value || "N/A"
        );

        const valueLines =
          pdf.splitTextToSize(
            safeValue,
            pageWidth - 95
          );

        pdf.text(
          valueLines,
          75,
          y
        );
      };

      // =================================================
      // EVENT DETAILS
      // =================================================

      addRow(
        "Booking ID",
        `#${booking.id}`,
        103
      );

      addRow(
        "Event",
        booking.event_name || "N/A",
        115
      );

      addRow(
        "Date",
        formatDate(booking.event_date),
        127
      );

      addRow(
        "Time",
        formatTime(booking.event_time),
        139
      );

      addRow(
        "Venue",
        booking.venue || "N/A",
        151
      );

      addRow(
        "Tickets",
        booking.tickets || 0,
        163
      );

      addRow(
        "Booked On",
        formatDateTime(
          booking.booking_date
        ),
        175
      );

      // =================================================
      // PAYMENT BOX
      // =================================================

      pdf.setFillColor(
        248,
        250,
        252
      );

      pdf.roundedRect(
        20,
        187,
        pageWidth - 40,
        52,
        4,
        4,
        "F"
      );

      pdf.setFontSize(10);

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.text(
        "PAYMENT INFORMATION",
        28,
        199
      );

      // Total Amount

      pdf.setTextColor(
        15,
        23,
        42
      );

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.text(
        "Total Amount",
        28,
        213
      );

      pdf.setTextColor(
        124,
        58,
        237
      );

      pdf.setFontSize(15);

      pdf.text(
        `Rs. ${totalAmount.toFixed(2)}`,
        pageWidth - 28,
        213,
        {
          align: "right",
        }
      );

      // Payment Status

      pdf.setFontSize(10);

      pdf.setTextColor(
        16,
        185,
        129
      );

      pdf.text(
        "Payment Status: PAID",
        28,
        227
      );

      // =================================================
      // PAYMENT IDS
      // =================================================

      pdf.setFontSize(9);

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.text(
        `Payment ID: ${
          booking.razorpay_payment_id ||
          "N/A"
        }`,
        20,
        250
      );

      pdf.text(
        `Order ID: ${
          booking.razorpay_order_id ||
          "N/A"
        }`,
        20,
        258
      );

      pdf.text(
        `Paid At: ${
          formatDateTime(
            booking.paid_at
          )
        }`,
        20,
        266
      );

      // =================================================
      // FOOTER
      // =================================================

      pdf.setDrawColor(
        203,
        213,
        225
      );

      pdf.line(
        20,
        275,
        pageWidth - 20,
        275
      );

      pdf.setTextColor(
        100,
        116,
        139
      );

      pdf.setFontSize(9);

      pdf.text(
        "Please carry this ticket for event entry.",
        pageWidth / 2,
        285,
        {
          align: "center",
        }
      );

      pdf.text(
        "Thank you for booking with Event Management System.",
        pageWidth / 2,
        292,
        {
          align: "center",
        }
      );

      // =================================================
      // SAVE PDF
      // =================================================

      pdf.save(
        `Event-Ticket-Booking-${booking.id}.pdf`
      );
    } catch (error) {
      console.error(
        "PDF Download Error:",
        error
      );

      alert(
        "Unable to generate ticket PDF. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  // =====================================================
  // FETCH USER BOOKINGS
  // =====================================================

  const fetchBookings = useCallback(
    async () => {
      const currentToken =
        localStorage.getItem("token");

      const currentStoredUser =
        localStorage.getItem("user");

      let currentUser = null;

      try {
        currentUser = currentStoredUser
          ? JSON.parse(
              currentStoredUser
            )
          : null;
      } catch (err) {
        console.error(
          "User JSON Parse Error:",
          err
        );

        currentUser = null;
      }

      // LOGIN CHECK

      if (
        !currentToken ||
        !currentUser?.id
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/login");

        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await api.get(
            `/bookings/user/${currentUser.id}`
          );

        if (response.data?.status) {
          setBookings(
            response.data.bookings || []
          );
        } else {
          setBookings([]);

          setError(
            response.data?.message ||
              "Unable to load your bookings."
          );
        }
      } catch (err) {
        console.error(
          "Bookings Error:",
          err
        );

        // JWT error

        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "token"
          );

          localStorage.removeItem(
            "user"
          );

          navigate("/login");

          return;
        }

        // Forbidden

        if (
          err.response?.status === 403
        ) {
          setError(
            err.response?.data?.message ||
              "You are not allowed to view these bookings."
          );

          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your bookings. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // =====================================================
  // CANCEL BOOKING
  // =====================================================

  const cancelBooking = async (
    bookingId
  ) => {
    if (!bookingId) {
      alert("Invalid booking ID.");
      return;
    }

    if (cancellingId) {
      return;
    }

    const confirmCancel =
      window.confirm(
        "Are you sure you want to cancel this booking?"
      );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingId(bookingId);

      const response =
        await api.delete(
          `/bookings/cancel/${bookingId}`
        );

      if (response.data?.status) {
        alert(
          response.data?.message ||
            "Booking cancelled successfully."
        );

        await fetchBookings();
      } else {
        alert(
          response.data?.message ||
            "Unable to cancel booking."
        );
      }
    } catch (err) {
      console.error(
        "Cancel Booking Error:",
        err
      );

      if (
        err.response?.status === 401
      ) {
        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        navigate("/login");

        return;
      }

      if (
        err.response?.status === 403
      ) {
        alert(
          err.response?.data?.message ||
            "You are not allowed to cancel this booking."
        );

        return;
      }

      alert(
        err.response?.data?.message ||
          "Unable to cancel booking. Please try again."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-violet-500" />

              <p className="mt-4 text-slate-400">
                Loading your bookings...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-950 px-6 pb-20 pt-32 text-white">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            My Account
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            My Bookings
          </h1>

          <p className="mt-3 text-slate-400">
            Manage your event tickets,
            payments and bookings.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 flex flex-col gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-300 sm:flex-row sm:items-center sm:justify-between">
            <p>{error}</p>

            <button
              onClick={fetchBookings}
              className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/20"
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY STATE */}

        {!error &&
          bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-10 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/10 text-3xl">
                🎟️
              </div>

              <h2 className="mt-5 text-2xl font-semibold">
                No bookings yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-slate-400">
                You haven't booked any
                events yet. Explore
                available events and
                reserve your tickets.
              </p>

              <Link
                to="/events"
                className="mt-6 inline-flex rounded-xl bg-violet-600 px-6 py-3 font-semibold transition hover:bg-violet-500"
              >
                Explore Events
              </Link>

            </div>
          )}

        {/* BOOKING CARDS */}

        {bookings.length > 0 && (
          <div className="grid gap-6">

            {bookings.map((booking) => {
              const totalAmount =
                Number(
                  booking.total_amount || 0
                );

              const paymentStatus =
                getPaymentStatus(booking);

              const bookingStatus =
                getBookingStatus(booking);

              const canCancel =
                bookingStatus !==
                  "cancelled" &&
                bookingStatus !==
                  "canceled";

              const canDownloadTicket =
                paymentStatus === "paid" &&
                bookingStatus !==
                  "cancelled" &&
                bookingStatus !==
                  "canceled";

              return (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl transition hover:border-slate-700"
                >

                  {/* TOP SECTION */}

                  <div className="flex flex-col justify-between gap-5 lg:flex-row">

                    {/* EVENT INFORMATION */}

                    <div className="flex-1">

                      <div className="flex flex-wrap items-center gap-3">

                        <span className="rounded-full bg-violet-500/10 px-3 py-1.5 text-xs font-semibold text-violet-400">
                          BOOKING #{booking.id}
                        </span>

                        {renderBookingStatus(
                          booking
                        )}

                        {renderPaymentStatus(
                          booking
                        )}

                      </div>

                      <h2 className="mt-4 text-2xl font-bold">
                        {booking.event_name ||
                          "Event"}
                      </h2>

                      {/* EVENT DETAILS */}

                      <div className="mt-5 grid gap-5 text-sm sm:grid-cols-2 lg:grid-cols-4">

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Date
                          </p>

                          <p className="mt-1 text-white">
                            {formatDate(
                              booking.event_date
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Time
                          </p>

                          <p className="mt-1 text-white">
                            {formatTime(
                              booking.event_time
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Venue
                          </p>

                          <p className="mt-1 text-white">
                            {booking.venue ||
                              "N/A"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Tickets
                          </p>

                          <p className="mt-1 text-white">
                            {booking.tickets ||
                              0}
                          </p>
                        </div>

                      </div>
                    </div>

                    {/* PAYMENT INFORMATION */}

                    <div className="flex min-w-[270px] flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-5">

                      <div>

                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Total Amount
                        </p>

                        <p className="mt-2 text-3xl font-bold text-violet-400">
                          ₹
                          {totalAmount.toFixed(
                            2
                          )}
                        </p>

                        <div className="mt-4">
                          {renderPaymentStatus(
                            booking
                          )}
                        </div>

                        <p className="mt-4 text-xs text-slate-500">
                          Booked on
                        </p>

                        <p className="mt-1 text-sm text-slate-300">
                          {formatDateTime(
                            booking.booking_date
                          )}
                        </p>

                      </div>

                      {/* DOWNLOAD TICKET */}

                      {canDownloadTicket && (
                        <button
                          onClick={() =>
                            downloadTicket(
                              booking
                            )
                          }
                          disabled={
                            downloadingId ===
                            booking.id
                          }
                          className={`mt-5 rounded-xl px-4 py-3 text-sm font-semibold text-white transition ${
                            downloadingId ===
                            booking.id
                              ? "cursor-not-allowed bg-slate-700"
                              : "bg-violet-600 hover:bg-violet-500"
                          }`}
                        >
                          {downloadingId ===
                          booking.id
                            ? "Generating PDF..."
                            : "📄 Download Ticket PDF"}
                        </button>
                      )}

                      {/* PENDING MESSAGE */}

                      {paymentStatus ===
                        "pending" && (
                        <div className="mt-5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
                          <p className="text-xs text-yellow-400">
                            Complete payment to
                            download your ticket.
                          </p>
                        </div>
                      )}

                      {/* CANCEL BOOKING */}

                      {canCancel && (
                        <button
                          onClick={() =>
                            cancelBooking(
                              booking.id
                            )
                          }
                          disabled={
                            cancellingId ===
                            booking.id
                          }
                          className={`mt-3 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                            cancellingId ===
                            booking.id
                              ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500"
                              : "border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                          }`}
                        >
                          {cancellingId ===
                          booking.id
                            ? "Cancelling..."
                            : "Cancel Booking"}
                        </button>
                      )}

                    </div>
                  </div>

                  {/* PAYMENT DETAILS */}

                  {paymentStatus ===
                    "paid" && (
                    <div className="mt-6 border-t border-slate-800 pt-5">

                      <div className="mb-4">

                        <h3 className="text-sm font-semibold text-white">
                          Payment Details
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Razorpay payment
                          information
                        </p>

                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        {/* PAYMENT ID */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Payment ID
                          </p>

                          <p className="mt-2 break-all text-sm text-slate-300">
                            {booking.razorpay_payment_id ||
                              "N/A"}
                          </p>

                        </div>

                        {/* ORDER ID */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Order ID
                          </p>

                          <p className="mt-2 break-all text-sm text-slate-300">
                            {booking.razorpay_order_id ||
                              "N/A"}
                          </p>

                        </div>

                        {/* PAID AT */}

                        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">

                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            Paid At
                          </p>

                          <p className="mt-2 text-sm text-slate-300">
                            {formatDateTime(
                              booking.paid_at
                            )}
                          </p>

                        </div>

                      </div>
                    </div>
                  )}

                  {/* PENDING PAYMENT */}

                  {paymentStatus ===
                    "pending" && (
                    <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">

                      <div className="flex items-start gap-3">

                        <span className="text-xl">
                          ⏳
                        </span>

                        <div>

                          <p className="font-semibold text-yellow-400">
                            Payment Pending
                          </p>

                          <p className="mt-1 text-sm text-slate-400">
                            Your payment has
                            not been completed
                            yet.
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}

          </div>
        )}

      </div>
    </main>
  );
}

export default Bookings;