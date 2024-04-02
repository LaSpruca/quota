import { useQuery } from "@tanstack/react-query";
import {
  getBook,
  getBookMembers,
  getBooksWithOwnerProfile,
  getProfile,
  getQuotesFromBook,
  useSession,
} from "./supabase";

export function useBook(id: string) {
  return useQuery({
    queryKey: ["get-book", id],
    queryFn: async () => await getBook(id),
  });
}

export function useQuotes(id: string) {
  return useQuery({
    queryKey: ["get-quotes", id],
    staleTime: 600000, // Cache for 10 minutes
    queryFn: async () => await getQuotesFromBook(id),
  });
}

export function useProfile() {
  const {
    user: { email },
  } = useSession();

  return useQuery({
    queryKey: ["get-profile"],
    staleTime: 3600000, // Cache for an hour
    queryFn: async () => {
      return await getProfile(email!);
    },
  });
}

export function useBooks() {
  return useQuery({
    queryKey: ["get-books"],
    staleTime: 3600000, // Cache for an hour
    enabled: true,
    queryFn: async () => {
      return getBooksWithOwnerProfile();
    },
  });
}

export function useMembers(bookId: string) {
  return useQuery({
    queryKey: ["get-members", bookId],
    staleTime: 3600000, // Cache for an hour
    queryFn: async () => {
      return await getBookMembers(bookId);
    },
  });
}
