"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    title: string;
    content: string;
    category: {
      id: string;
      name: string;
    };
  };
  onUpdate: () => void;
}

interface Category {
  id: string;
  name: string;
}

export default function EditPostModal({ isOpen, onClose, post, onUpdate }: EditPostModalProps) {
  const t = useTranslations("forum.edit_post");
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [categoryId, setCategoryId] = useState(post.category.id);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);

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
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("forum_posts")
        .update({
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId,
          updated_at: new Date().toISOString()
        })
        .eq("id", post.id);

      if (error) throw error;

      onUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      alert(t("error"));
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-2xl font-bold text-[#118B50] mb-6">{t("title")}</h2>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.title")}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
              disabled={isSaving}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.category")}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
              disabled={isSaving || loadingCategories}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("form.content")}
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {t("form.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                     hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? t("form.saving") : t("form.save")}
          </button>
        </div>
      </div>
    </div>
  );
}