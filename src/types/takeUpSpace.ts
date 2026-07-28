export type TakeUpSpaceMode = "in_the_moment" | "looking_back";

export type TakeUpSpaceOutcome =
  | "override"
  | "paused"
  | "chose_differently"
  | "not_sure";

export type TakeUpSpacePanelTag =
  | "self_respect"
  | "self_love"
  | "self_worth"
  | "none";

export interface TakeUpSpaceTag {
  id: string;
  user_id: string;
  name: string;
  is_default: boolean;
  active: boolean;
  created_at: string;
}

export interface TakeUpSpaceEntry {
  id: string;
  user_id: string;
  date: string;
  mode: TakeUpSpaceMode;
  situation: string | null;
  action: string | null;
  cost: string | null;
  need: string | null;
  choice_text: string | null;
  teaching: string | null;
  tag_ids: string[];
  tag_names: string[];
  choice_outcome: TakeUpSpaceOutcome | null;
  panel_tag: TakeUpSpacePanelTag | null;
  status: "draft" | "complete";
  created_at: string;
  completed_at: string | null;
}

export interface TakeUpSpaceFilters {
  outcomes: TakeUpSpaceOutcome[];
  modes: TakeUpSpaceMode[];
  panelTags: TakeUpSpacePanelTag[];
  tagNames: string[];
  noTags: boolean;
}
