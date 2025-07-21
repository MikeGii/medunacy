"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import UserDetailsModal from "./UserDetailsModal";

interface UserData {
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: string;
}

interface UsersTableProps {
  onUserSelect: (user: UserData) => void;
}

export default function UsersTable({ onUserSelect }: UsersTableProps) {
  const t = useTranslations("users");
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("user_id, first_name, last_name, email, phone, role")
        .order("account_created", { ascending: false });

      if (error) throw error;

      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("page_title")}
            </span>
          </h2>
          <p className="text-lg text-gray-600">{t("table_title")}</p>
        </div>

        {/* Table Container */}
        <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-[#118B50]">{t("table.loading")}</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">{t("table.no_users")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.first_name")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.last_name")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.email")}
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold">
                      {t("table.phone")}
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-white/50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.first_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.last_name || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {user.phone || "-"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onUserSelect(user)}
                          className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white text-sm font-medium rounded-lg hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300"
                        >
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {t("table.view_details")}
                        </button>
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
