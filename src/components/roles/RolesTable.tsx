// src/components/roles/RolesTable.tsx - REDESIGNED VERSION
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useUserManagement } from "@/hooks/useUserManagement";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "@/components/exam-tests/common/ErrorDisplay";

export default function RolesTable() {
  const t = useTranslations("roles");
  const { user: currentUser } = useAuth();

  const {
    filteredUsers,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    updateUserRole,
    updateUserSubscription,
    clearError,
    updatingUserId,
  } = useUserManagement();

  // Group users by role
  const groupedUsers = {
    admin: filteredUsers.filter((u) => u.role === "admin"),
    doctor: filteredUsers.filter((u) => u.role === "doctor"),
    user: filteredUsers.filter((u) => u.role === "user"),
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-yellow-100 text-yellow-800";
      case "doctor":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSubscriptionBadge = (status: string) => {
    return status === "premium"
      ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      : "bg-gray-100 text-gray-800";
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Error Display */}
      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} className="mb-6" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("page_title")}
          </h1>
          <p className="text-gray-600 mt-1">{t("page_subtitle")}</p>
        </div>

        {/* Search Bar */}
        <div className="w-full sm:w-auto">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="w-full sm:w-80 px-4 py-2 pl-10 pr-4 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {searchQuery ? t("search.no_results") : t("no_users")}
          </h3>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block space-y-6">
            {Object.entries(groupedUsers).map(([role, users]) => {
              if (users.length === 0) return null;

              return (
                <div
                  key={role}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Role Header */}
                  <div
                    className={`px-4 py-3 border-b border-gray-200 bg-gradient-to-r ${
                      role === "admin"
                        ? "from-yellow-500 to-amber-600"
                        : role === "doctor"
                        ? "from-purple-500 to-pink-600"
                        : "from-[#118B50] to-[#5DB996]"
                    }`}
                  >
                    <h3 className="text-sm font-semibold text-white">
                      {t(`roles.${role}`)}
                      <span className="ml-2 text-xs font-normal text-white/80">
                        ({users.length})
                      </span>
                    </h3>
                  </div>

                  {/* Users Table */}
                  <table className="w-full">
                    <thead
                      className={`bg-gradient-to-r ${
                        role === "admin"
                          ? "from-yellow-500 to-amber-600"
                          : role === "doctor"
                          ? "from-purple-500 to-pink-600"
                          : "from-[#118B50] to-[#5DB996]"
                      } border-b border-gray-200`}
                    >
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t("table.name")}
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                          {t("table.email")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          {t("table.subscription")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          {t("table.current_role")}
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">
                          {t("table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {users.map((user) => (
                        <tr key={user.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              {user.user_id === currentUser?.id && (
                                <div className="text-xs text-gray-500">
                                  {t("table.your_account")}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {user.email}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select
                              value={user.subscription_status}
                              onChange={(e) =>
                                updateUserSubscription(
                                  user.user_id,
                                  e.target.value as "free" | "premium"
                                )
                              }
                              disabled={updatingUserId === user.user_id}
                              className={`text-sm border rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#118B50] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                                user.subscription_status === "premium"
                                  ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                                  : "bg-green-50 border-green-300 text-green-800"
                              }`}
                            >
                              <option
                                value="free"
                                className="bg-green-50 text-green-800"
                              >
                                {t("subscription.free")}
                              </option>
                              <option
                                value="premium"
                                className="bg-yellow-50 text-yellow-800"
                              >
                                ⭐ {t("subscription.premium")}
                              </option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(
                                user.role
                              )}`}
                            >
                              {t(`roles.${user.role}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {user.user_id === currentUser?.id ? (
                              <span className="text-xs text-gray-500 italic">
                                -
                              </span>
                            ) : (
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  updateUserRole(user.user_id, e.target.value)
                                }
                                disabled={updatingUserId === user.user_id}
                                className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-[#118B50] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <option value="user">{t("roles.user")}</option>
                                <option value="doctor">
                                  {t("roles.doctor")}
                                </option>
                                <option value="admin">
                                  {t("roles.admin")}
                                </option>
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-6">
            {Object.entries(groupedUsers).map(([role, users]) => {
              if (users.length === 0) return null;

              return (
                <div key={role} className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 px-2">
                    {t(`roles.${role}`)}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({users.length})
                    </span>
                  </h3>

                  {users.map((user) => (
                    <div
                      key={user.user_id}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          {user.user_id === currentUser?.id && (
                            <p className="text-xs text-gray-500 mt-1">
                              {t("table.your_account")}
                            </p>
                          )}
                        </div>
                        <select
                          value={user.subscription_status}
                          onChange={(e) =>
                            updateUserSubscription(
                              user.user_id,
                              e.target.value as "free" | "premium"
                            )
                          }
                          disabled={updatingUserId === user.user_id}
                          className={`text-xs border rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#118B50] focus:border-transparent disabled:opacity-50 ${
                            user.subscription_status === "premium"
                              ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                              : "bg-green-50 border-green-300 text-green-800"
                          }`}
                        >
                          <option
                            value="free"
                            className="bg-green-50 text-green-800"
                          >
                            {t("subscription.free")}
                          </option>
                          <option
                            value="premium"
                            className="bg-yellow-50 text-yellow-800"
                          >
                            ⭐ {t("subscription.premium")}
                          </option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span
                          className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${getRoleColor(
                            user.role
                          )}`}
                        >
                          {t(`roles.${user.role}`)}
                        </span>

                        {user.user_id !== currentUser?.id && (
                          <select
                            value={user.role}
                            onChange={(e) =>
                              updateUserRole(user.user_id, e.target.value)
                            }
                            disabled={updatingUserId === user.user_id}
                            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#118B50] focus:border-transparent disabled:opacity-50"
                          >
                            <option value="user">{t("roles.user")}</option>
                            <option value="doctor">{t("roles.doctor")}</option>
                            <option value="admin">{t("roles.admin")}</option>
                          </select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
