import type { Session } from "@supabase/supabase-js";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { supabase } from "./setup";

export const SessionContext = createContext<Session | null>(null);

export function useSession() {
  return useContext(SessionContext);
}
