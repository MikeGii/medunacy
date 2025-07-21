"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: { id: string; name: string }) => void;
}

export default function CreateCategoryModal({ isOpen, onClose, onCategoryCreated }: CreateCategoryModalProps) {
  const t = useTranslations("forum.create_post.category");
  const { user } = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !categoryName.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: insertError } = await supabase
        .from("forum_categories")
        .insert({
          name: categoryName.trim(),
          created_by: user.id
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setError("Category with this name already exists");
        } else {
          throw insertError;
        }
        return;
      }

      onCategoryCreated(data);
      setCategoryName("");
      onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      setError("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#118B50] mb-4">
            {t("modal_title")}
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                {t("name")}
              </label>
              <input
                type="text"
                id="categoryName"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                placeholder={t("name_placeholder")}
                autoFocus
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={loading || !categoryName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                         hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("creating") : t("create")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}