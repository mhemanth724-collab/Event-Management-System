import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // ADMIN CHECK
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userData);

      if (user.role !== "admin") {
        navigate("/");
        return;
      }

      fetchUsers();
    } catch (err) {
      console.error("User data error:", err);

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");
    }
  }, [navigate]);

  // ==========================================
  // FETCH ALL USERS
  // ==========================================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users");

      if (response.data.status) {
        setUsers(response.data.users || []);
      } else {
        setError(
          response.data.message || "Failed to load users."
        );
      }
    } catch (err) {
      console.error("Users Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to load users. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // GET USER INITIALS
  // ==========================================
  const getInitials = (name) => {
    if (!name) return "U";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // ==========================================
  // GET ROLE STYLE
  // ==========================================
  const getRoleStyle = (role) => {
    if (role?.toLowerCase() === "admin") {
      return "bg-violet-500/10 text-violet-400 border-violet-500/20";
    }

    return "bg-blue-500/10 text-blue-400 border-blue-500/20";
  };

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">

            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-700 border-t-blue-500"></div>

            <p className="text-slate-300">
              Loading users...
            </p>

          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN UI
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =====================================
            HEADER
        ====================================== */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
              Admin Panel
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              All Users
            </h1>

            <p className="mt-2 text-slate-400">
              View and monitor all registered users.
            </p>

          </div>

          <div className="flex gap-3">

            <Link
              to="/admin"
              className="rounded-lg border border-slate-700 bg-slate-900 px-5 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              ← Dashboard
            </Link>

            <button
              onClick={fetchUsers}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Refresh
            </button>

          </div>

        </div>

        {/* =====================================
            ERROR MESSAGE
        ====================================== */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-red-300">
                {error}
              </p>

              <button
                onClick={fetchUsers}
                className="w-fit rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>

            </div>

          </div>
        )}

        {/* =====================================
            SUMMARY CARDS
        ====================================== */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* TOTAL USERS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Total Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-white">
                  {users.length}
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                👥
              </div>

            </div>

          </div>

          {/* ADMIN COUNT */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Administrators
                </p>

                <h2 className="mt-2 text-3xl font-bold text-violet-400">
                  {
                    users.filter(
                      (user) =>
                        user.role?.toLowerCase() === "admin"
                    ).length
                  }
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/10 text-2xl">
                🛡️
              </div>

            </div>

          </div>

          {/* NORMAL USERS */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  Regular Users
                </p>

                <h2 className="mt-2 text-3xl font-bold text-emerald-400">
                  {
                    users.filter(
                      (user) =>
                        user.role?.toLowerCase() !== "admin"
                    ).length
                  }
                </h2>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl">
                👤
              </div>

            </div>

          </div>

        </div>

        {/* =====================================
            USERS TABLE
        ====================================== */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {/* TABLE HEADER */}
          <div className="border-b border-slate-800 px-5 py-4 sm:px-6">

            <h2 className="text-lg font-semibold">
              Registered Users
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Complete list of users registered on EventHub.
            </p>

          </div>

          {/* EMPTY STATE */}
          {users.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800 text-2xl">
                👤
              </div>

              <h3 className="text-lg font-semibold text-white">
                No users found
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                There are currently no registered users.
              </p>

            </div>
          ) : (
            /* TABLE */
            <div className="overflow-x-auto">

              <table className="min-w-[900px] w-full">

                <thead className="bg-slate-800/70">

                  <tr>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      User ID
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Mobile
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Role
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-800">

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="transition hover:bg-slate-800/40"
                    >

                      {/* USER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-blue-400">
                            {getInitials(user.name)}
                          </div>

                          <div>

                            <p className="font-medium text-white">
                              {user.name || "Unknown User"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              EventHub Member
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* USER ID */}
                      <td className="px-5 py-4">

                        <span className="rounded-full bg-slate-800 px-3 py-1 text-sm text-slate-300">
                          #{user.id}
                        </span>

                      </td>

                      {/* EMAIL */}
                      <td className="px-5 py-4">

                        <span className="text-sm text-slate-300">
                          {user.email || "-"}
                        </span>

                      </td>

                      {/* MOBILE */}
                      <td className="px-5 py-4">

                        <span className="text-sm text-slate-300">
                          {user.mobile || "-"}
                        </span>

                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase ${getRoleStyle(
                            user.role
                          )}`}
                        >
                          {user.role || "user"}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default AdminUsers;