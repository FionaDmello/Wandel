import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useRef, useState } from "react";

import { ScreenWrap } from "@/components/layout/ScreenWrap";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Divider } from "@/components/ui/Divider";
import { Label } from "@/components/ui/Label";
import { DEFAULT_QUALITIES } from "@/constants/defaultQualities";
import { INPUT_TEXT_SIZE } from "@/constants/inputClasses";
import {
  useProfile,
  useProfileQualities,
  useProfileReminders,
} from "@/hooks/useProfile";
import { useSession } from "@/hooks/useSession";
import { useSignOut } from "@/hooks/useSignOut";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";

interface SettingsFormProps {
  userId: string;
  initialWhy: string;
  initialQualities: string[];
  initialReminders: string[];
}

function SettingsForm({
  userId,
  initialWhy,
  initialQualities,
  initialReminders,
}: SettingsFormProps) {
  const navigate = useNavigate();
  const qualityInputRef = useRef<HTMLInputElement>(null);

  const [whyStatement, setWhyStatement] = useState(initialWhy);
  const [qualities, setQualities] = useState<string[]>(initialQualities);
  const [showQualityInput, setShowQualityInput] = useState(false);
  const [qualityInputValue, setQualityInputValue] = useState("");
  const [reminders, setReminders] = useState<string[]>(initialReminders);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { mutate: updateSettings, isPending } = useUpdateSettings();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

  const toggleQuality = (quality: string) => {
    setError(null);
    setQualities((prev) =>
      prev.includes(quality)
        ? prev.filter((q) => q !== quality)
        : [...prev, quality],
    );
  };

  const confirmCustomQuality = () => {
    const trimmed = qualityInputValue.trim();
    if (trimmed && !qualities.includes(trimmed)) {
      setQualities((prev) => [...prev, trimmed]);
    }
    setQualityInputValue("");
    setShowQualityInput(false);
  };

  const updateReminder = (index: number, value: string) => {
    setError(null);
    setReminders((prev) => prev.map((r, i) => (i === index ? value : r)));
  };

  const removeReminder = (index: number) => {
    setReminders((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!whyStatement.trim()) {
      setError("Your why statement can't be empty.");
      return;
    }
    if (qualities.length === 0) {
      setError("Select at least one quality.");
      return;
    }
    if (reminders.filter((r) => r.trim().length > 0).length === 0) {
      setError("Add at least one reminder.");
      return;
    }
    if (reminders.some((r) => r.trim().length === 0)) {
      setError("Remove or fill in any empty reminders.");
      return;
    }
    setError(null);
    updateSettings(
      { userId, whyStatement: whyStatement.trim(), qualities, reminders },
      {
        onSuccess: () => {
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      },
    );
  };

  const customQualities = qualities.filter(
    (q) => !DEFAULT_QUALITIES.includes(q),
  );

  return (
    <ScreenWrap>
      <div className="flex flex-col px-8 py-8 gap-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate({ to: "/engine" })}
            className="p-1 text-muted bg-transparent border-none cursor-pointer shrink-0"
            aria-label="Go back"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="font-sans text-sm font-medium text-plum">Settings</h1>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Your why</Label>
          <textarea
            value={whyStatement}
            onChange={(e) => {
              setError(null);
              setWhyStatement(e.target.value);
            }}
            rows={3}
            className={`w-full bg-card border border-[0.5px] border-border rounded-2xl px-4 py-3 font-serif italic ${INPUT_TEXT_SIZE} text-violet leading-snug outline-none resize-none placeholder:text-muted`}
            placeholder="Why are you doing this?"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Qualities</Label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_QUALITIES.map((quality) => (
              <Chip
                key={quality}
                label={quality}
                selected={qualities.includes(quality)}
                onToggle={() => toggleQuality(quality)}
              />
            ))}
            {customQualities.map((quality) => (
              <Chip
                key={quality}
                label={quality}
                selected
                onToggle={() => toggleQuality(quality)}
              />
            ))}
            {showQualityInput ? (
              <div className="inline-flex items-center gap-1 min-h-[34px] px-3 py-[6px] rounded-[20px] bg-amber border border-[0.5px] border-amber">
                <input
                  ref={qualityInputRef}
                  type="text"
                  value={qualityInputValue}
                  onChange={(e) => setQualityInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      confirmCustomQuality();
                    }
                    if (e.key === "Escape") {
                      setShowQualityInput(false);
                      setQualityInputValue("");
                    }
                  }}
                  onBlur={confirmCustomQuality}
                  placeholder="Type a quality"
                  className={`bg-transparent border-none outline-none font-sans ${INPUT_TEXT_SIZE} text-canvas placeholder:text-canvas/60 w-24`}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setShowQualityInput(true);
                  setTimeout(() => qualityInputRef.current?.focus(), 0);
                }}
                aria-label="Add custom quality"
                className="inline-flex items-center justify-center min-h-[34px] w-[34px] rounded-[20px] border border-[0.5px] border-border bg-canvas text-muted cursor-pointer"
              >
                <Plus size={13} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Kindness reminders</Label>
          <div className="flex flex-col gap-3">
            {reminders.map((reminder, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-violet"
              >
                <textarea
                  value={reminder}
                  onChange={(e) => updateReminder(index, e.target.value)}
                  rows={1}
                  className={`flex-1 bg-transparent border-none outline-none resize-none font-serif italic ${INPUT_TEXT_SIZE} text-violet leading-snug placeholder:text-muted`}
                  placeholder="Write a reminder..."
                />
                {reminders.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeReminder(index)}
                    className="text-muted bg-transparent border-none cursor-pointer shrink-0"
                    aria-label="Remove reminder"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => setReminders((prev) => [...prev, ""])}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-card border-l-[3px] border-transparent text-muted"
            >
              <Plus size={13} strokeWidth={2} />
              <span className="font-sans text-[13px]">Add a reminder</span>
            </button>
          </div>
        </div>

        {error && <p className="font-sans text-xs text-amber">{error}</p>}
        {!error && saved && (
          <p className="font-sans text-xs text-teal">Saved.</p>
        )}

        <Button variant="primary" onClick={handleSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>

        <Divider className="my-0" />

        <Button
          variant="ghost"
          onClick={() => signOut()}
          disabled={isSigningOut}
        >
          {isSigningOut ? "Signing out..." : "Sign out"}
        </Button>
      </div>
    </ScreenWrap>
  );
}

export function SettingsScreen() {
  const { session, loading } = useSession();
  const userId = session?.user.id ?? "";

  const profileQuery = useProfile(userId);
  const qualitiesQuery = useProfileQualities(userId);
  const remindersQuery = useProfileReminders(userId);

  if (
    loading ||
    !userId ||
    profileQuery.isLoading ||
    qualitiesQuery.isLoading ||
    remindersQuery.isLoading
  ) {
    return (
      <ScreenWrap>
        <div className="flex items-center justify-center min-h-dvh">
          <p className="font-sans text-xs text-muted">Loading...</p>
        </div>
      </ScreenWrap>
    );
  }

  return (
    <SettingsForm
      userId={userId}
      initialWhy={profileQuery.data?.why_statement ?? ""}
      initialQualities={qualitiesQuery.data?.map((q) => q.value) ?? []}
      initialReminders={remindersQuery.data?.map((r) => r.value) ?? []}
    />
  );
}
