import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { VariationConfigStep } from "@/features/build/VariationConfigStep";

function fillConfigFields() {
  fireEvent.change(screen.getByPlaceholderText("e.g. After morning coffee"), {
    target: { value: "After morning coffee" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g. 5 sun salutations"), {
    target: { value: "5 sun salutations" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g. 20 minute flow"), {
    target: { value: "20 minute flow" },
  });
  fireEvent.change(screen.getByPlaceholderText("e.g. 60 minute practice"), {
    target: { value: "60 minute practice" },
  });
}

describe("VariationConfigStep", () => {
  it("does not render a name field when existingNames is omitted", () => {
    render(
      <VariationConfigStep
        habitName="Workout"
        onNext={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.queryByText("Variation name")).not.toBeInTheDocument();
  });

  it("calls onNext with just the config values when existingNames is omitted", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledWith({
      anchor: "After morning coffee",
      nonNegotiable: "5 sun salutations",
      minimumVersion: "20 minute flow",
      fullVersion: "60 minute practice",
    });
  });

  it("renders a Variation name field when existingNames is provided", () => {
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        onNext={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText("Variation name")).toBeInTheDocument();
  });

  it("blocks submit with an error when the name is empty", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Give this variation a name.")).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("blocks submit with an error when the name duplicates an existing variation", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym", "Yoga"]}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("e.g. Yoga"), {
      target: { value: "Gym" },
    });
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("A variation with this name already exists."),
    ).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("blocks submit when the name duplicates an existing variation with different casing", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym", "Yoga"]}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("e.g. Yoga"), {
      target: { value: "gym" },
    });
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("A variation with this name already exists."),
    ).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("blocks submit when the name duplicates the parent habit name", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym", "Workout"]}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("e.g. Yoga"), {
      target: { value: "Workout" },
    });
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(
      screen.getByText("A variation with this name already exists."),
    ).toBeInTheDocument();
    expect(onNext).not.toHaveBeenCalled();
  });

  it("calls onNext with the trimmed name and values when valid", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fireEvent.change(screen.getByPlaceholderText("e.g. Yoga"), {
      target: { value: "  Yoga  " },
    });
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledWith("Yoga", {
      anchor: "After morning coffee",
      nonNegotiable: "5 sun salutations",
      minimumVersion: "20 minute flow",
      fullVersion: "60 minute practice",
    });
  });

  it("pre-populates the name field from initialValues.name in edit mode", () => {
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        initialValues={{ name: "Yoga" }}
        onNext={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByDisplayValue("Yoga")).toBeInTheDocument();
  });

  it("does not flag the name as a duplicate when it matches its own current name", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        initialValues={{ name: "Yoga" }}
        onNext={onNext}
        onCancel={vi.fn()}
      />,
    );
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(onNext).toHaveBeenCalledWith("Yoga", {
      anchor: "After morning coffee",
      nonNegotiable: "5 sun salutations",
      minimumVersion: "20 minute flow",
      fullVersion: "60 minute practice",
    });
  });

  it("disables the submit button when disabled is true", () => {
    render(
      <VariationConfigStep
        habitName="Workout"
        onNext={vi.fn()}
        onCancel={vi.fn()}
        disabled
      />,
    );
    expect(screen.getByText("Next").closest("button")).toBeDisabled();
  });

  it("shows serverError when there is no local validation error", () => {
    render(
      <VariationConfigStep
        habitName="Workout"
        onNext={vi.fn()}
        onCancel={vi.fn()}
        serverError="Something went wrong. Please try again."
      />,
    );
    expect(
      screen.getByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
  });

  it("prefers a local validation error over serverError", () => {
    const onNext = vi.fn();
    render(
      <VariationConfigStep
        habitName="Workout"
        existingNames={["Gym"]}
        onNext={onNext}
        onCancel={vi.fn()}
        serverError="Something went wrong. Please try again."
      />,
    );
    fillConfigFields();
    fireEvent.click(screen.getByText("Next"));
    expect(screen.getByText("Give this variation a name.")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong. Please try again."),
    ).not.toBeInTheDocument();
  });
});
