import { parseISO } from "date-fns";

import { useProfile } from "@/hooks/useProfile";

// Falls back to today while the profile is still loading, so callers that
// bound a window by signup date never see stray results from before the
// account existed (only the safe direction: this under-reports, never
// over-reports, while the real value loads in).
export function useSignupDate(userId: string): Date {
  const profileQuery = useProfile(userId);
  return profileQuery.data
    ? parseISO(profileQuery.data.created_at)
    : new Date();
}
