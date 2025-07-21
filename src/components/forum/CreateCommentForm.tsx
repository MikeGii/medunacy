"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CreateCommentFormProps {
  postId: string;
  onCommentCreated: () => void;
}

export default function CreateCommentForm({ postId, onCommentCreated }: CreateCommentFormProps) {
  const t = useTranslations("forum.post_detail.comments");
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const { error: insertError } = await supabase
        .from("forum_comments")
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        });

      if (insertError) throw insertError;

      setContent("");
      onCommentCreated();
    } catch (err) {
      console.error("Error creating comment:", err);
      setError("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="mb-4">
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          {t("add")}
        </label>
        <textarea
          id="comment"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical"
          placeholder={t("placeholder")}
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || !content.trim()}
          className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                   hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                   disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t("submitting") : t("submit")}
        </button>
      </div>
    </form>
  );
}