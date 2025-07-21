"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import CreateCategoryModal from "./CreateCategoryModal";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

interface Category {
  id: string;
  name: string;
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated }: CreatePostModalProps) {
  const t = useTranslations("forum.create_post");
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("id, name")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !title.trim() || !content.trim() || !selectedCategory) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("forum_posts")
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category_id: selectedCategory
        });

      if (insertError) throw insertError;

      onPostCreated();
      resetForm();
      onClose();
    } catch (err) {
      console.error("Error creating post:", err);
      setError("Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setSelectedCategory("");
    setError(null);
  };

  const handleCategoryCreated = (newCategory: Category) => {
    setCategories([...categories, newCategory]);
    setSelectedCategory(newCategory.id);
    setShowCategoryModal(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-[#118B50] mb-6">
              {t("modal_title")}
            </h2>

            <form onSubmit={handleSubmit}>
              {/* Title */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.title")} *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("form.title_placeholder")}
                />
              </div>

              {/* Category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.category")} *
                </label>
                <div className="flex space-x-2">
                  <select
                    id="category"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  >
                    <option value="">{t("form.category_placeholder")}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-4 py-2 bg-[#E3F0AF] text-[#118B50] rounded-lg hover:bg-[#d4e19f] transition-colors"
                  >
                    {t("category.new")}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.content")} *
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical"
                  placeholder={t("form.content_placeholder")}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Markdown is supported
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {t("form.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim() || !content.trim() || !selectedCategory}
                  className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                           hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t("form.creating") : t("form.submit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
}