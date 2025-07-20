// src/types/userdata.ts
export interface LanguageSkill {
  language: string;
  level: string;
}

export interface UserData {
  id?: string;
  user_id: string;
  university?: string;
  university_finished: boolean;
  specialization?: string;
  workplace?: string;
  languages: LanguageSkill[];
  personal_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserDataUpdate {
  university?: string;
  university_finished?: boolean;
  specialization?: string;
  workplace?: string;
  languages?: LanguageSkill[];
  personal_description?: string;
}