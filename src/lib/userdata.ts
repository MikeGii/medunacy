// src/lib/userdata.ts
import { supabase } from "./supabase";
import type { UserData, UserDataUpdate } from "@/types/userdata";

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(); // Use maybeSingle() instead of single()

    if (error) {
      // Handle 406 or missing table gracefully
      if (error.code === "PGRST116" || error.code === "42P01" || error.message?.includes("406")) {
        console.log(`User data not accessible for user ${userId} - table might not exist or no permissions`);
        return null;
      }

      // For other errors, just log and return null
      console.error("Error fetching user data:", error);
      return null;
    }

    return data;
  } catch (err) {
    console.error("Unexpected error in getUserData:", err);
    return null;
  }
}

export async function createUserData(
  userData: Omit<UserData, "id" | "created_at" | "updated_at">
): Promise<UserData> {
  const { data, error } = await supabase
    .from("user_data")
    .insert(userData)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateUserData(
  userId: string,
  updates: UserDataUpdate
): Promise<UserData> {
  const { data, error } = await supabase
    .from("user_data")
    .update(updates)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertUserData(
  userData: Omit<UserData, "id" | "created_at" | "updated_at">
): Promise<UserData> {
  const { data, error } = await supabase
    .from("user_data")
    .upsert(userData, {
      onConflict: "user_id",
      ignoreDuplicates: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
