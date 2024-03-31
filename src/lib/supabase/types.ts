import { Database } from "./supabase-generated";

export type Book = Database["public"]["Tables"]["books"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Quote = Database["public"]["Tables"]["quotes"]["Row"];
