// src/lib/userdata.ts
import { supabase } from "./supabase";
import type { UserData, UserDataUpdate } from "@/types/userdata";

export async function getUserData(userId: string): Promise<UserData | null> {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      // Handle "no rows returned" as a normal case, not an error
      if (error.code === "PGRST116") {
        console.log(
          `No user_data found for user ${userId} - this is normal for new users`
        );
        return null;
      }

      // Log other errors but don't throw for 406 errors
      if (error.message?.includes("406") || error.code === "406") {
        console.log(`User data not accessible for user ${userId}`);
        return null;
      }

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
