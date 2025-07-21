// src/hooks/useUserProfile.ts
"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getUserData, upsertUserData } from "@/lib/userdata";
import type { UserData } from "@/types/userdata";

interface PersonalData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  language: string;
}

interface ProfileCompletion {
  isComplete: boolean;
  completedFields: number;
  totalFields: number;
  percentage: number;
}

export function useUserProfile() {
  const { user } = useAuth();

  // Professional data state
  const [professionalData, setProfessionalData] = useState<UserData | null>(
    null
  );

  // Personal data state
  const [personalData, setPersonalData] = useState<PersonalData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    language: "et",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all user data
  useEffect(() => {
    const fetchAllUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Fetch professional data
        const profData = await getUserData(user.id);
        setProfessionalData(profData);

        // Fetch personal data
        const metadata = user.user_metadata || {};
        const { data: userData, error: dbError } = await supabase
          .from("users")
          .select("first_name, last_name, email, phone, preferred_language")
          .eq("user_id", user.id)
          .single();

        if (dbError && dbError.code !== "PGRST116") {
          throw dbError;
        }

        setPersonalData({
          firstName: userData?.first_name || metadata.first_name || "",
          lastName: userData?.last_name || metadata.last_name || "",
          email: userData?.email || user.email || "",
          phone: userData?.phone || metadata.phone || "",
          language: userData?.preferred_language || "et",
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAllUserData();
  }, [user]);

  // Calculate profile completion
  const profileCompletion = useMemo((): ProfileCompletion => {
    if (!professionalData) {
      return {
        isComplete: false,
        completedFields: 0,
        totalFields: 6,
        percentage: 0,
      };
    }

    let completedFields = 0;
    const totalFields = 6;

    if (professionalData.university?.trim()) completedFields++;
    if (professionalData.specialization?.trim()) completedFields++;
    if (professionalData.workplace?.trim()) completedFields++;
    if (professionalData.languages?.length > 0) completedFields++;
    if (professionalData.personal_description?.trim()) completedFields++;
    if (professionalData.university_finished !== undefined) completedFields++;

    const percentage = Math.round((completedFields / totalFields) * 100);
    const isComplete = completedFields >= 4; // At least 4/6 fields filled

    return { isComplete, completedFields, totalFields, percentage };
  }, [professionalData]);

  // Update professional data
  const updateProfessionalData = async (
    data: Omit<UserData, "id" | "created_at" | "updated_at">
  ): Promise<boolean> => {
    if (!user) {
      setError("User not authenticated");
      return false;
    }

    try {
      setError(null);
      setLoading(true);
      const savedData = await upsertUserData({ ...data, user_id: user.id });
      setProfessionalData(savedData);
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save professional data"
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalData = async (
    updates: Partial<PersonalData>
  ): Promise<boolean> => {
    if (!user) {
      setError("User not authenticated");
      return false;
    }

    try {
      console.log("Starting updatePersonalData with:", updates);
      setError(null);
      setLoading(true);

      // Skip auth metadata update for now - comment out this section
      /*
    console.log('About to update auth metadata...');
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
      },
    });

    console.log('Auth update completed, error:', authError);

    if (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    */

      console.log("About to update users table...");
      // Update users table (including language preference)
      const updateData = {
        first_name: updates.firstName,
        last_name: updates.lastName,
        phone: updates.phone,
        preferred_language: updates.language,
      };
      console.log("Update data:", updateData);

      const { error: dbError } = await supabase
        .from("users")
        .update(updateData)
        .eq("user_id", user.id);

      console.log("Database update completed, error:", dbError);

      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }

      console.log("About to update local state...");
      // Update local state
      setPersonalData((prev) => ({ ...prev, ...updates }));

      console.log("Update successful");
      return true;
    } catch (err) {
      console.error("Update error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update personal data"
      );
      return false;
    } finally {
      console.log("Setting loading to false");
      setLoading(false);
    }
  };

  return {
    // Personal data
    personalData,
    updatePersonalData,

    // Professional data
    professionalData,
    updateProfessionalData,

    // Profile completion
    profileCompletion,

    // Common states
    loading,
    error,
  };
}
