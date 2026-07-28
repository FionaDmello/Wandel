import { describe, expect, it } from "vitest";

import { filterTakeUpSpaceEntries } from "@/features/engine/filterTakeUpSpaceEntries";
import type { TakeUpSpaceEntry, TakeUpSpaceFilters } from "@/types/takeUpSpace";

function makeEntry(
  overrides: Partial<TakeUpSpaceEntry> = {},
): TakeUpSpaceEntry {
  return {
    id: "entry-1",
    user_id: "user-1",
    date: "2026-07-28",
    mode: "in_the_moment",
    situation: "s",
    action: "a",
    cost: "c",
    need: "n",
    choice_text: "ct",
    teaching: "t",
    tag_ids: [],
    tag_names: [],
    choice_outcome: "paused",
    panel_tag: "none",
    status: "complete",
    created_at: "2026-07-28T00:00:00Z",
    completed_at: "2026-07-28T00:10:00Z",
    ...overrides,
  };
}

function makeDraft(): TakeUpSpaceEntry {
  return makeEntry({
    action: null,
    cost: null,
    need: null,
    choice_text: null,
    teaching: null,
    choice_outcome: null,
    panel_tag: null,
    status: "draft",
    completed_at: null,
  });
}

const EMPTY_FILTERS: TakeUpSpaceFilters = {
  outcomes: [],
  modes: [],
  panelTags: [],
  tagNames: [],
  noTags: false,
};

describe("filterTakeUpSpaceEntries", () => {
  it("returns all entries unchanged when no filters are active, drafts included", () => {
    const entries = [makeEntry(), makeDraft()];
    expect(filterTakeUpSpaceEntries(entries, EMPTY_FILTERS)).toEqual(entries);
  });

  it("filters by outcome, matching any selected value", () => {
    const override = makeEntry({
      id: "e-override",
      choice_outcome: "override",
    });
    const paused = makeEntry({ id: "e-paused", choice_outcome: "paused" });
    const notSure = makeEntry({ id: "e-not-sure", choice_outcome: "not_sure" });
    const result = filterTakeUpSpaceEntries([override, paused, notSure], {
      ...EMPTY_FILTERS,
      outcomes: ["override", "paused"],
    });
    expect(result).toEqual([override, paused]);
  });

  it("filters by mode", () => {
    const moment = makeEntry({ id: "e-moment", mode: "in_the_moment" });
    const back = makeEntry({ id: "e-back", mode: "looking_back" });
    const result = filterTakeUpSpaceEntries([moment, back], {
      ...EMPTY_FILTERS,
      modes: ["looking_back"],
    });
    expect(result).toEqual([back]);
  });

  it("filters by panel tag, excluding entries with panel_tag: null", () => {
    const selfWorth = makeEntry({ id: "e-worth", panel_tag: "self_worth" });
    const untagged = makeEntry({ id: "e-untagged", panel_tag: null });
    const result = filterTakeUpSpaceEntries([selfWorth, untagged], {
      ...EMPTY_FILTERS,
      panelTags: ["self_worth"],
    });
    expect(result).toEqual([selfWorth]);
  });

  it("filters by tag name, matching entries containing any selected name", () => {
    const work = makeEntry({ id: "e-work", tag_names: ["work"] });
    const settling = makeEntry({ id: "e-settling", tag_names: ["settling"] });
    const both = makeEntry({ id: "e-both", tag_names: ["work", "settling"] });
    const result = filterTakeUpSpaceEntries([work, settling, both], {
      ...EMPTY_FILTERS,
      tagNames: ["work"],
    });
    expect(result).toEqual([work, both]);
  });

  it("noTags alone matches only entries with zero tags", () => {
    const tagged = makeEntry({ id: "e-tagged", tag_names: ["work"] });
    const untagged = makeEntry({ id: "e-untagged", tag_names: [] });
    const result = filterTakeUpSpaceEntries([tagged, untagged], {
      ...EMPTY_FILTERS,
      noTags: true,
    });
    expect(result).toEqual([untagged]);
  });

  it("noTags combined with tag names matches untagged OR name-matched entries", () => {
    const work = makeEntry({ id: "e-work", tag_names: ["work"] });
    const settling = makeEntry({ id: "e-settling", tag_names: ["settling"] });
    const untagged = makeEntry({ id: "e-untagged", tag_names: [] });
    const result = filterTakeUpSpaceEntries([work, settling, untagged], {
      ...EMPTY_FILTERS,
      tagNames: ["work"],
      noTags: true,
    });
    expect(result).toEqual([work, untagged]);
  });

  it("combines multiple categories with AND", () => {
    const matches = makeEntry({
      id: "e-matches",
      choice_outcome: "override",
      mode: "in_the_moment",
    });
    const wrongMode = makeEntry({
      id: "e-wrong-mode",
      choice_outcome: "override",
      mode: "looking_back",
    });
    const result = filterTakeUpSpaceEntries([matches, wrongMode], {
      ...EMPTY_FILTERS,
      outcomes: ["override"],
      modes: ["in_the_moment"],
    });
    expect(result).toEqual([matches]);
  });

  it("excludes a draft entry whenever any category is active", () => {
    const complete = makeEntry({
      id: "e-complete",
      choice_outcome: "override",
    });
    const draft = makeDraft();
    const result = filterTakeUpSpaceEntries([complete, draft], {
      ...EMPTY_FILTERS,
      outcomes: ["override"],
    });
    expect(result).toEqual([complete]);
  });
});
