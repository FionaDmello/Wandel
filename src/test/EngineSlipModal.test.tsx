import { act, fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { EngineSlipModal } from "@/features/protocols/EngineSlipModal";
import type { PendingProtocol } from "@/types/protocols";

vi.mock("@/hooks/useProfile", () => ({
  useProfileQualities: () => ({ data: [] }),
}));

vi.mock("@/hooks/useSlipDriftLog", () => ({
  useLogSlipDrift: () => ({ mutateAsync: vi.fn() }),
}));

const protocol: PendingProtocol = {
  id: "engine_slip",
  habitId: null,
  trackType: "engine",
  trackName: "Engine",
  driftDays: null,
  currentStep: 0,
};

beforeEach(() => {
  vi.useFakeTimers();
});

describe("EngineSlipModal", () => {
  it("dismisses via backdrop tap through the real ProtocolModal wiring", () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <EngineSlipModal
        protocol={protocol}
        userId="user-1"
        onDismiss={onDismiss}
        onComplete={vi.fn()}
      />,
    );

    const backdrop = container.querySelector<HTMLDivElement>(".bg-plum\\/35")!;
    fireEvent.click(backdrop);

    act(() => {
      vi.advanceTimersByTime(380);
    });

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
