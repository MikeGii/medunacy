"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

export default function RolesTable() {
  const t = useTranslations("roles");
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
        const email = user.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, first_name, last_name, email, role")
        .order("role", { ascending: true })
        .order("first_name", { ascending: true });

      if (error) throw error;
      setUsers(data || []);
      setFilteredUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    // Prevent admin from changing their own role
    if (userId === currentUser?.id) {
      alert(t("messages.cannot_change_own_role"));
      return;
    }

    setUpdating(userId);

    try {
      const { error } = await supabase
        .from("users")
        .update({ role: newRole })
        .eq("user_id", userId);

      if (error) throw error;

      // Update local state
      const updatedUsers = users.map((user) =>
        user.user_id === userId ? { ...user, role: newRole } : user
      );
      setUsers(updatedUsers);

      // Show success message (you can use a toast library here)
      console.log(t("messages.role_updated"));
    } catch (error) {
      console.error("Error updating role:", error);
      alert(t("messages.role_update_error"));
    } finally {
      setUpdating(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-gradient-to-r from-yellow-500 to-amber-600";
      case "doctor":
        return "bg-gradient-to-r from-purple-500 to-pink-600";
      default:
        return "bg-gradient-to-r from-[#118B50] to-[#5DB996]";
    }
  };

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-500 to-amber-600 bg-clip-text text-transparent">
              {t("page_title")}
            </span>
          </h2>
          <p className="text-lg text-gray-600">{t("page_subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full px-4 py-3 pl-12 pr-4 bg-white/60 backdrop-blur-sm border border-white/50 rounded-xl
                       focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all
                       placeholder-gray-500"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>

            {/* Clear button */}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Search results count */}
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              {t("search.results", { count: filteredUsers.length })}
            </p>
          )}
        </div>

        {/* Table Container */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#118B50]">{t("loading")}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">
                {searchQuery ? t("search.no_results") : t("no_users")}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.name")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.email")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.current_role")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold">
                      {t("table.change_role")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.first_name} {user.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium text-white rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {t(`roles.${user.role}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {user.user_id === currentUser?.id ? (
                          <span className="text-sm text-gray-500 italic">
                            {t("table.your_account")}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleRoleChange(user.user_id, e.target.value)
                            }
                            disabled={updating === user.user_id}
                            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="user">{t("roles.user")}</option>
                            <option value="doctor">{t("roles.doctor")}</option>
                            <option value="admin">{t("roles.admin")}</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
