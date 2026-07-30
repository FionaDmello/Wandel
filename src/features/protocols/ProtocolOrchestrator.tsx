import { format } from "date-fns";
import { useEffect, useRef, useState } from "react";

import { EngineDriftModal } from "@/features/protocols/EngineDriftModal";
import { EngineSlipModal } from "@/features/protocols/EngineSlipModal";
import { HabitDriftModal } from "@/features/protocols/HabitDriftModal";
import {
  useClearPendingProtocol,
  usePendingProtocols,
  useSetPendingProtocols,
} from "@/hooks/usePendingProtocol";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useProtocolDetection } from "@/hooks/useProtocolDetection";
import { useSession } from "@/hooks/useSession";
import type { Profile } from "@/types/database";
import type { PendingProtocol } from "@/types/protocols";

interface InnerProps {
  userId: string;
  profile: Profile;
}

function protocolKey(p: PendingProtocol): string {
  return p.habitId ?? p.id;
}

function OrchestratorInner({ userId, profile }: InnerProps) {
  const pendingQuery = usePendingProtocols(userId);
  const existingPending = pendingQuery.data ?? [];
  const isPendingLoaded = pendingQuery.isSuccess;

  const { detected, isChecking } = useProtocolDetection(userId, profile);

  const [queue, setQueue] = useState<PendingProtocol[]>([]);
  const didSetup = useRef(false);

  const { mutate: setProtocols } = useSetPendingProtocols(userId);
  const { mutate: clearProtocol } = useClearPendingProtocol(userId);
  const { mutate: updateProfile } = useUpdateProfile(userId);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (isChecking || !isPendingLoaded || didSetup.current) return;
    didSetup.current = true;

    const existingKeys = new Set(existingPending.map(protocolKey));
    const newOnes = detected.filter(
      (p) => !existingKeys.has(p.habitId ?? p.id),
    );
    const fullQueue = [...existingPending, ...newOnes];

    setQueue(fullQueue);

    if (newOnes.length > 0) {
      setProtocols(newOnes);
    }

    if (profile.last_protocol_check !== today) {
      updateProfile({ last_protocol_check: today });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isChecking, isPendingLoaded]);

  const handleDismiss = () => {
    const current = queue[0];
    if (current) clearProtocol(current);
    setQueue((q) => q.slice(1));
  };

  const handleComplete = () => {
    const current = queue[0];
    if (current) clearProtocol(current);
    setQueue((q) => q.slice(1));
  };

  const activeProtocol = queue[0] ?? null;

  if (!activeProtocol) return null;

  if (activeProtocol.id === "engine_slip") {
    return (
      <EngineSlipModal
        key={protocolKey(activeProtocol)}
        protocol={activeProtocol}
        userId={userId}
        onDismiss={handleDismiss}
        onComplete={handleComplete}
      />
    );
  }

  if (activeProtocol.id === "engine_drift") {
    return (
      <EngineDriftModal
        key={protocolKey(activeProtocol)}
        protocol={activeProtocol}
        userId={userId}
        onDismiss={handleDismiss}
        onComplete={handleComplete}
      />
    );
  }

  if (activeProtocol.id === "habit_drift") {
    return (
      <HabitDriftModal
        key={protocolKey(activeProtocol)}
        protocol={activeProtocol}
        userId={userId}
        onDismiss={handleDismiss}
        onComplete={handleComplete}
      />
    );
  }

  return null;
}

export function ProtocolOrchestrator() {
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  const { data: profile } = useProfile(userId);

  if (!userId || !profile) return null;

  return <OrchestratorInner userId={userId} profile={profile} />;
}
