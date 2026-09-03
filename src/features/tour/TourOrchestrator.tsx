import { useRouterState } from "@tanstack/react-router";
import type { EventData } from "react-joyride";
import { EVENTS, Joyride } from "react-joyride";

import { TOUR_STEPS } from "@/constants/tourSteps";
import { resolveTourTrigger } from "@/features/tour/resolveTourTrigger";
import { TourTooltip } from "@/features/tour/TourTooltip";
import { usePendingProtocols } from "@/hooks/usePendingProtocol";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import type { Profile } from "@/types/database";

interface InnerProps {
  userId: string;
  profile: Profile;
}

function TourOrchestratorInner({ userId, profile }: InnerProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const pendingQuery = usePendingProtocols(userId);
  const hasPendingProtocol = (pendingQuery.data?.length ?? 0) > 0;

  const trigger = resolveTourTrigger(profile, pathname, hasPendingProtocol);

  const { mutate: updateProfile } = useUpdateProfile(userId);

  const steps = trigger === "part1" ? TOUR_STEPS : [];

  function handleEvent(data: EventData) {
    if (data.type !== EVENTS.TOUR_END) return;
    if (trigger === "part1") updateProfile({ tour_completed: true });
  }

  return (
    <Joyride
      steps={steps}
      run={trigger === "part1"}
      continuous
      tooltipComponent={TourTooltip}
      onEvent={handleEvent}
      options={{ zIndex: 400, scrollDuration: 0 }}
      styles={{
        overlay: { touchAction: "none", overscrollBehavior: "contain" },
      }}
    />
  );
}

export function TourOrchestrator() {
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const { data: profile } = useProfile(userId);

  if (!userId || !profile) return null;

  return <TourOrchestratorInner userId={userId} profile={profile} />;
}
