import { OverlayModal } from "@/components/ui/OverlayModal";

interface TakeUpSpaceReferenceCardProps {
  onClose: () => void;
}

export function TakeUpSpaceReferenceCard({
  onClose,
}: TakeUpSpaceReferenceCardProps) {
  return (
    <OverlayModal onClose={onClose}>
      <div className="px-6 pt-8 pb-8 flex flex-col">
        <p className="font-serif italic text-[22px] text-plum">Take Up Space</p>
        <p className="font-sans text-[11px] text-muted mb-5">
          Learning to stay with yourself
        </p>

        <div className="flex flex-col gap-3">
          <p className="font-serif italic text-[14px] text-violet leading-relaxed">
            Self-abandonment is quiet. It looks like shrinking so someone else
            can expand. Saying yes when you meant to pause. Overriding what you
            know because conflict feels worse than disappearing.
          </p>
          <p className="font-serif italic text-[14px] text-violet leading-relaxed">
            Taking up space is the opposite. It is not always loud. Sometimes it
            is just staying — in your need, your discomfort, your knowledge of
            what is true.
          </p>
          <p className="font-serif italic text-[14px] text-violet leading-relaxed">
            This panel is where you notice both. The moments you abandoned
            yourself. The moments you didn't.
          </p>
        </div>

        <div className="border-t border-border my-5" />

        <div className="flex flex-col gap-2">
          <p className="font-sans text-[12px] text-plum leading-relaxed">
            Tap <strong>Notice</strong> to open the log. Choose{" "}
            <em>In the moment</em> or <em>Looking back.</em>
          </p>
          <p className="font-sans text-[12px] text-plum leading-relaxed">
            Answer six questions at whatever pace you need. Skip anything you're
            not ready for.
          </p>
          <p className="font-sans text-[12px] text-plum leading-relaxed">
            When you finish, you can categorise the entry — or leave it as it
            is. The noticing is enough.
          </p>
        </div>
      </div>
    </OverlayModal>
  );
}
