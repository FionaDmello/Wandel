import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { JournalDaySection } from "@/features/journal/JournalDaySection";

describe("JournalDaySection", () => {
  it("hides the detail until expanded", () => {
    render(
      <JournalDaySection summary="Full · Reading">
        <p>The detail</p>
      </JournalDaySection>,
    );

    expect(screen.getByText("Full · Reading")).toBeInTheDocument();
    expect(screen.queryByText("The detail")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Full · Reading"));

    expect(screen.getByText("The detail")).toBeInTheDocument();
  });

  it("collapses again on a second click", () => {
    render(
      <JournalDaySection summary="Full · Reading">
        <p>The detail</p>
      </JournalDaySection>,
    );

    fireEvent.click(screen.getByText("Full · Reading"));
    fireEvent.click(screen.getByText("Full · Reading"));

    expect(screen.queryByText("The detail")).not.toBeInTheDocument();
  });
});
