import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import jsPDF from "jspdf";
import api from "../services/api";

function BookingConfirmation() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/login");
        return;
      }

      const response = await api.get(`/bookings/user/${user.id}`);

      const bookings = response.data.bookings || response.data || [];

      const foundBooking = bookings.find(
        (item) => String(item.id) === String(id)
      );

      if (!foundBooking) {
        setError("Booking not found.");
        return;
      }

      setBooking(foundBooking);
    } catch (err) {
      console.error("Booking fetch error:", err);

      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Unable to load booking details.");
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const downloadTicket = () => {
    if (!booking) return;

    try {
      setDownloading(true);

      const pdf = new jsPDF();

      const pageWidth = pdf.internal.pageSize.getWidth();

      // Header
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("EVENT MANAGEMENT SYSTEM", pageWidth / 2, 20, {
        align: "center",
      });

      pdf.setFontSize(14);
      pdf.text("BOOKING CONFIRMATION TICKET", pageWidth / 2, 30, {
        align: "center",
      });

      // Confirmation
      pdf.setFontSize(16);
      pdf.text("BOOKING CONFIRMED", pageWidth / 2, 45, {
        align: "center",
      });

      // Divider
      pdf.line(20, 52, pageWidth - 20, 52);

      let y = 68;

      const addRow = (label, value) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text(label, 25, y);

        pdf.setFont("helvetica", "normal");

        const text = String(value || "N/A");
        const wrappedText = pdf.splitTextToSize(text, 105);

        pdf.text(wrappedText, 85, y);

        y += Math.max(9, wrappedText.length * 6);
      };

      addRow("Booking ID", booking.id);
      addRow("Event Name", booking.event_name);
      addRow("Event Date", formatDate(booking.event_date));
      addRow("Event Time", booking.event_time);
      addRow("Venue", booking.venue);
      addRow("Tickets", booking.tickets);
      addRow("Booked On", formatDateTime(booking.booking_date));

      y += 5;

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(13);
      pdf.text("PAYMENT DETAILS", 25, y);

      y += 12;

      addRow(
        "Total Amount",
        `Rs. ${Number(booking.total_amount || 0).toFixed(2)}`
      );

      addRow("Payment Status", booking.payment_status || "Pending");

      if (booking.razorpay_payment_id) {
        addRow(
          "Payment ID",
          booking.razorpay_payment_id
        );
      }

      if (booking.razorpay_order_id) {
        addRow(
          "Order ID",
          booking.razorpay_order_id
        );
      }

      if (booking.paid_at) {
        addRow(
          "Paid At",
          formatDateTime(booking.paid_at)
        );
      }

      // Footer
      pdf.line(20, 260, pageWidth - 20, 260);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      pdf.text(
        "Thank you for booking with Event Management System.",
        pageWidth / 2,
        275,
        {
          align: "center",
        }
      );

      pdf.text(
        "Please carry this ticket for event entry.",
        pageWidth / 2,
        283,
        {
          align: "center",
        }
      );

      pdf.save(`Event-Ticket-Booking-${booking.id}.pdf`);
    } catch (err) {
      console.error("PDF error:", err);
      alert("Unable to generate ticket PDF.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-slate-300">
            Loading booking details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center max-w-md w-full">
          <div className="text-5xl mb-4">❌</div>

          <h2 className="text-2xl font-bold mb-3">
            Booking Not Found
          </h2>

          <p className="text-slate-400 mb-6">
            {error || "We could not find this booking."}
          </p>

          <button
            onClick={() => navigate("/bookings")}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }

  const isPaid =
    String(booking.payment_status || "").toLowerCase() === "paid";

  const isCancelled =
    String(booking.status || "").toLowerCase() === "cancelled";

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">

      <div className="max-w-4xl mx-auto">

        {/* Success Header */}
        <div className="text-center mb-8">

          <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-5">
            <span className="text-5xl">
              {isPaid ? "✓" : "!"}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold">
            {isPaid
              ? "Booking Confirmed!"
              : "Booking Created"}
          </h1>

          <p className="text-slate-400 mt-3">
            {isPaid
              ? "Your payment was successful and your ticket is confirmed."
              : "Your booking is waiting for payment confirmation."}
          </p>

        </div>

        {/* Main Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">

          {/* Card Header */}
          <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <p className="text-slate-400 text-sm">
                Booking ID
              </p>

              <h2 className="text-2xl font-bold text-white">
                #{booking.id}
              </h2>
            </div>

            <div>
              {isCancelled ? (
                <span className="inline-block px-4 py-2 rounded-full bg-red-500/20 text-red-400 font-semibold">
                  CANCELLED
                </span>
              ) : isPaid ? (
                <span className="inline-block px-4 py-2 rounded-full bg-green-500/20 text-green-400 font-semibold">
                  PAYMENT SUCCESS
                </span>
              ) : (
                <span className="inline-block px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 font-semibold">
                  PAYMENT PENDING
                </span>
              )}
            </div>

          </div>

          {/* Event Details */}
          <div className="p-6">

            <h3 className="text-xl font-bold mb-6">
              Event Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Event Name
                </p>

                <p className="font-semibold text-lg">
                  {booking.event_name || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Event Date
                </p>

                <p className="font-semibold">
                  {formatDate(booking.event_date)}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Event Time
                </p>

                <p className="font-semibold">
                  {booking.event_time || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Venue
                </p>

                <p className="font-semibold">
                  {booking.venue || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Number of Tickets
                </p>

                <p className="font-semibold">
                  {booking.tickets}
                </p>
              </div>

              <div>
                <p className="text-slate-400 text-sm mb-1">
                  Total Amount
                </p>

                <p className="font-bold text-xl text-green-400">
                  ₹{Number(booking.total_amount || 0).toFixed(2)}
                </p>
              </div>

            </div>

          </div>

          {/* Payment Details */}
          <div className="p-6 border-t border-slate-800">

            <h3 className="text-xl font-bold mb-6">
              Payment Details
            </h3>

            <div className="space-y-4">

              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <span className="text-slate-400">
                  Payment Status
                </span>

                <span
                  className={
                    isPaid
                      ? "text-green-400 font-semibold"
                      : "text-yellow-400 font-semibold"
                  }
                >
                  {booking.payment_status || "Pending"}
                </span>
              </div>

              {booking.razorpay_payment_id && (
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <span className="text-slate-400">
                    Razorpay Payment ID
                  </span>

                  <span className="font-mono text-sm break-all md:text-right">
                    {booking.razorpay_payment_id}
                  </span>
                </div>
              )}

              {booking.razorpay_order_id && (
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <span className="text-slate-400">
                    Razorpay Order ID
                  </span>

                  <span className="font-mono text-sm break-all md:text-right">
                    {booking.razorpay_order_id}
                  </span>
                </div>
              )}

              {booking.paid_at && (
                <div className="flex flex-col md:flex-row md:justify-between gap-2">
                  <span className="text-slate-400">
                    Paid At
                  </span>

                  <span>
                    {formatDateTime(booking.paid_at)}
                  </span>
                </div>
              )}

              <div className="flex flex-col md:flex-row md:justify-between gap-2">
                <span className="text-slate-400">
                  Booking Date
                </span>

                <span>
                  {formatDateTime(booking.booking_date)}
                </span>
              </div>

            </div>

          </div>

          {/* Actions */}
          <div className="p-6 border-t border-slate-800">

            <div className="flex flex-col sm:flex-row gap-4">

              {isPaid && !isCancelled && (
                <button
                  onClick={downloadTicket}
                  disabled={downloading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-semibold transition"
                >
                  {downloading
                    ? "Generating PDF..."
                    : "📄 Download Ticket PDF"}
                </button>
              )}

              <button
                onClick={() => navigate("/bookings")}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition"
              >
                🎫 My Bookings
              </button>

              <button
                onClick={() => navigate("/events")}
                className="flex-1 border border-slate-600 hover:bg-slate-800 px-6 py-3 rounded-lg font-semibold transition"
              >
                Browse Events
              </button>

            </div>

            {!isPaid && !isCancelled && (
              <p className="text-yellow-400 text-sm text-center mt-5">
                Complete your payment to download the ticket.
              </p>
            )}

          </div>

        </div>

        {/* Footer Message */}
        <div className="text-center mt-8 text-slate-500 text-sm">
          Thank you for choosing Event Management System ❤️
        </div>

      </div>

    </div>
  );
}

export default BookingConfirmation;