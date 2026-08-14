import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { Divider } from "@/components/ui/Divider";
import { IconButton } from "@/components/ui/IconButton";
import {
  useAddBuildSubType,
  useDeleteBuildSubType,
  useUpdateBuildSubType,
} from "@/hooks/useBuildHabits";
import { useUpdateHabitStatus } from "@/hooks/useHabitStatus";
import type { HabitConfig, HabitStatus } from "@/types/database";

import { VariationConfigStep } from "./VariationConfigStep";

type PanelView =
  | { mode: "list" }
  | { mode: "edit"; subType: string | null }
  | { mode: "add" };

type ConfirmingAction = "pause" | "deactivate" | null;

function getConfigValue(
  configs: HabitConfig[],
  key: string,
  subType: string | null,
): string {
  return (
    configs.find((c) => c.key === key && c.sub_type === subType)?.value ?? ""
  );
}

function getSubTypes(configs: HabitConfig[]): string[] {
  return [
    ...new Set(
      configs
        .filter((c) => c.sub_type !== null)
        .map((c) => c.sub_type as string),
    ),
  ];
}

interface BuildConfigPanelProps {
  userId: string;
  habitId: string;
  habitName: string;
  configs: HabitConfig[];
  status: HabitStatus;
  onClose: () => void;
}

export function BuildConfigPanel({
  userId,
  habitId,
  habitName,
  configs,
  status,
  onClose,
}: BuildConfigPanelProps) {
  const safeConfigs = configs ?? [];
  const subTypes = getSubTypes(safeConfigs);
  const hasSubTypes = subTypes.length > 0;

  const [view, setView] = useState<PanelView>({ mode: "list" });
  const [confirming, setConfirming] = useState<ConfirmingAction>(null);

  const { mutate: updateSubType, isPending: isUpdating } =
    useUpdateBuildSubType(userId);
  const { mutate: addSubType, isPending: isAdding } =
    useAddBuildSubType(userId);
  const { mutate: deleteSubType, isPending: isDeleting } =
    useDeleteBuildSubType(userId);
  const { mutate: updateStatus, isPending: isUpdatingStatus } =
    useUpdateHabitStatus(userId);

  const isPending = isUpdating || isAdding || isDeleting || isUpdatingStatus;

  const confirmAction = () => {
    if (!confirming) return;
    updateStatus(
      { habitId, status: confirming === "pause" ? "paused" : "deactivated" },
      { onSuccess: onClose },
    );
  };

  const get = (key: string, subType: string | null) =>
    getConfigValue(safeConfigs, key, subType);

  if (view.mode === "edit") {
    const st = view.subType;
    return (
      <ScreenWrap>
        <div className="flex items-center gap-3 px-5 pt-[14px]">
          <IconButton
            onClick={() => setView({ mode: "list" })}
            ariaLabel="Back"
            className="text-muted shrink-0"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <p className="font-sans text-sm font-medium text-plum">
            {st ?? habitName}
          </p>
        </div>

        <VariationConfigStep
          habitName={st ?? habitName}
          initialValues={{
            anchor: get("anchor", st),
            nonNegotiable: get("non_negotiable", st),
            minimumVersion: get("minimum_version", st),
            fullVersion: get("full_version", st),
          }}
          submitLabel={isUpdating ? "Saving…" : "Save"}
          onNext={(values) => {
            updateSubType(
              { habitId, subType: st, ...values },
              { onSuccess: () => setView({ mode: "list" }) },
            );
          }}
        />

        {st !== null && (
          <div className="px-8 pb-8">
            <Divider className="my-0 mb-4" />
            <button
              type="button"
              onClick={() =>
                deleteSubType(
                  { habitId, subType: st },
                  { onSuccess: () => setView({ mode: "list" }) },
                )
              }
              disabled={isPending}
              className="font-sans text-[13px] text-amber bg-transparent border-none cursor-pointer"
            >
              Remove this variation
            </button>
          </div>
        )}
      </ScreenWrap>
    );
  }

  if (view.mode === "add") {
    return (
      <ScreenWrap>
        <div className="flex items-center gap-3 px-5 pt-[14px]">
          <IconButton
            onClick={() => setView({ mode: "list" })}
            ariaLabel="Back"
            className="text-muted shrink-0"
          >
            <ArrowLeft size={18} />
          </IconButton>
          <p className="font-sans text-sm font-medium text-plum">
            New variation
          </p>
        </div>

        <VariationConfigStep
          habitName={habitName}
          existingNames={[...subTypes, habitName]}
          submitLabel={isAdding ? "Adding…" : "Add variation"}
          onNext={(name, values) => {
            addSubType(
              { habitId, subType: name, ...values },
              { onSuccess: () => setView({ mode: "list" }) },
            );
          }}
          onCancel={() => setView({ mode: "list" })}
        />
      </ScreenWrap>
    );
  }

  return (
    <ScreenWrap>
      <div className="flex items-center gap-3 px-5 pt-[14px]">
        <IconButton
          onClick={onClose}
          ariaLabel="Close"
          className="text-muted shrink-0"
        >
          <ArrowLeft size={18} />
        </IconButton>
        <p className="font-sans text-sm font-medium text-plum">
          {habitName} — config
        </p>
      </div>

      <div className="flex flex-col px-6 py-6 gap-4">
        {hasSubTypes ? (
          <>
            {subTypes.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setView({ mode: "edit", subType: st })}
                className="flex items-center justify-between px-4 py-3 bg-card rounded-2xl border-l-[3px] border-l-soft text-left border-none cursor-pointer w-full"
              >
                <span className="font-sans text-[13px] font-medium text-plum">
                  {st}
                </span>
                <span className="font-sans text-[11px] text-muted">Edit →</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => setView({ mode: "add" })}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-l-transparent text-plum border-none cursor-pointer"
            >
              <Plus size={13} strokeWidth={2} />
              <span className="font-sans text-[13px]">Add a variation</span>
            </button>
          </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setView({ mode: "edit", subType: null })}
            disabled={isPending}
          >
            Edit config
          </Button>
        )}

        {(status === "active" || status === "scheduled") && (
          <>
            <Divider className="my-0" />

            {confirming ? (
              <div className="flex flex-col gap-3">
                <p className="font-sans text-[13px] text-plum">
                  {confirming === "pause"
                    ? "Pause this habit?"
                    : "Deactivate this habit?"}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={confirmAction}
                    disabled={isUpdatingStatus}
                    className="font-sans text-[13px] font-medium text-amber bg-transparent border-none cursor-pointer"
                  >
                    {isUpdatingStatus ? "…" : "Confirm"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirming(null)}
                    className="font-sans text-[13px] text-muted bg-transparent border-none cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setConfirming("pause")}
                  className="font-sans text-[13px] text-muted text-left bg-transparent border-none cursor-pointer"
                >
                  Pause habit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirming("deactivate")}
                  className="font-sans text-[13px] text-amber text-left bg-transparent border-none cursor-pointer"
                >
                  Deactivate habit
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ScreenWrap>
  );
}
