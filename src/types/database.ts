export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          why_statement: string | null;
          reminder_index: number;
          reminder_last_rotated: string | null;
          setup_complete: boolean;
          last_protocol_check: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          why_statement?: string | null;
          reminder_index?: number;
          reminder_last_rotated?: string | null;
          setup_complete?: boolean;
        };
        Update: {
          why_statement?: string | null;
          reminder_index?: number;
          reminder_last_rotated?: string | null;
          setup_complete?: boolean;
          last_protocol_check?: string | null;
        };
        Relationships: [];
      };
      profile_qualities: {
        Row: {
          id: string;
          user_id: string;
          value: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          value?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      profile_reminders: {
        Row: {
          id: string;
          user_id: string;
          value: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          value?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          category: "break" | "build";
          name: string;
          status: "active" | "scheduled" | "paused" | "deactivated";
          paused_at: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category: "break" | "build";
          name: string;
          status?: "active" | "scheduled" | "paused" | "deactivated";
          paused_at?: string | null;
          sort_order?: number;
        };
        Update: {
          name?: string;
          status?: "active" | "scheduled" | "paused" | "deactivated";
          paused_at?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      habit_configs: {
        Row: {
          id: string;
          habit_id: string;
          key: string;
          value: string;
          sub_type: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          key: string;
          value: string;
          sub_type?: string | null;
          sort_order?: number;
        };
        Update: {
          key?: string;
          value?: string;
          sub_type?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      engine_marks: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          timer_completed: boolean;
          confirmed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          timer_completed?: boolean;
          confirmed_at: string;
        };
        Update: {
          timer_completed?: boolean;
          confirmed_at?: string;
        };
        Relationships: [];
      };
      break_observations: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          job: string | null;
          context: string | null;
          urge_intensity: number | null;
          aftermath: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          job?: string | null;
          context?: string | null;
          urge_intensity?: number | null;
          aftermath?: string | null;
          logged_at?: string;
        };
        Update: {
          job?: string | null;
          context?: string | null;
          urge_intensity?: number | null;
          aftermath?: string | null;
        };
        Relationships: [];
      };
      break_observation_emotions: {
        Row: {
          id: string;
          observation_id: string;
          value: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          observation_id: string;
          value: string;
        };
        Update: {
          value?: string;
        };
        Relationships: [];
      };
      build_observations: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          sub_type: string | null;
          mark_type: "full" | "dot" | "half";
          mark_label: string;
          note: string | null;
          logged_at: string;
        };
        Insert: {
          id?: string;
          habit_id: string;
          user_id: string;
          date: string;
          sub_type?: string | null;
          mark_type: "full" | "dot" | "half";
          mark_label: string;
          note?: string | null;
          logged_at?: string;
        };
        Update: {
          sub_type?: string | null;
          mark_type?: "full" | "dot" | "half";
          mark_label?: string;
          note?: string | null;
        };
        Relationships: [];
      };
      pending_protocols: {
        Row: {
          user_id: string;
          protocol_id: "engine_slip" | "engine_drift" | "habit_drift";
          habit_id: string | null;
          track_type: "engine" | "break" | "build";
          track_name: string;
          drift_days: number | null;
          current_step: number;
          track_key: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          protocol_id: "engine_slip" | "engine_drift" | "habit_drift";
          habit_id?: string | null;
          track_type: "engine" | "break" | "build";
          track_name: string;
          drift_days?: number | null;
          current_step?: number;
        };
        Update: {
          protocol_id?: "engine_slip" | "engine_drift" | "habit_drift";
          habit_id?: string | null;
          track_type?: "engine" | "break" | "build";
          track_name?: string;
          drift_days?: number | null;
          current_step?: number;
        };
        Relationships: [];
      };
      standing_up_log: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string | null;
          track_type: "engine" | "break" | "build";
          track_name: string;
          fall_date: string;
          return_date: string;
          gap_days: number;
          protocol: "slip" | "drift";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id?: string | null;
          track_type: "engine" | "break" | "build";
          track_name: string;
          fall_date: string;
          return_date: string;
          gap_days: number;
          protocol: "slip" | "drift";
        };
        Update: {
          track_type?: "engine" | "break" | "build";
          track_name?: string;
          fall_date?: string;
          return_date?: string;
          gap_days?: number;
          protocol?: "slip" | "drift";
        };
        Relationships: [];
      };
      weekly_reviews: {
        Row: {
          id: string;
          user_id: string;
          week_ending: string;
          engine_response: string | null;
          pride_note: string | null;
          self_rated_consistency: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_ending: string;
          engine_response?: string | null;
          pride_note?: string | null;
          self_rated_consistency?: number | null;
        };
        Update: {
          engine_response?: string | null;
          pride_note?: string | null;
          self_rated_consistency?: number | null;
        };
        Relationships: [];
      };
      weekly_review_habits: {
        Row: {
          id: string;
          review_id: string;
          habit_id: string;
          what_done: string | null;
          what_got_in_way: string | null;
          adjustment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          review_id: string;
          habit_id: string;
          what_done?: string | null;
          what_got_in_way?: string | null;
          adjustment?: string | null;
        };
        Update: {
          what_done?: string | null;
          what_got_in_way?: string | null;
          adjustment?: string | null;
        };
        Relationships: [];
      };
      distress_tolerance_log: {
        Row: {
          id: string;
          user_id: string;
          type: "sit" | "urge_surf";
          started_at: string;
          duration_seconds: number;
          body_location: string | null;
          survived_it_note: string | null;
          completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: "sit" | "urge_surf";
          started_at?: string;
          duration_seconds: number;
          body_location?: string | null;
          survived_it_note?: string | null;
          completed?: boolean;
        };
        Update: {
          duration_seconds?: number;
          body_location?: string | null;
          survived_it_note?: string | null;
          completed?: boolean;
        };
        Relationships: [];
      };
      slip_drift_log: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string | null;
          track_type: "engine" | "break" | "build";
          type: "slip" | "drift";
          triggered_at: string;
          cause_category:
            | "distress_tolerance"
            | "logistics"
            | "emotional_load"
            | null;
          job_id: string | null;
          emotional_state_before: string | null;
          all_or_nothing_stage: string | null;
          protocol_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          habit_id?: string | null;
          track_type: "engine" | "break" | "build";
          type: "slip" | "drift";
          triggered_at?: string;
          cause_category?:
            | "distress_tolerance"
            | "logistics"
            | "emotional_load"
            | null;
          job_id?: string | null;
          emotional_state_before?: string | null;
          all_or_nothing_stage?: string | null;
          protocol_completed?: boolean;
        };
        Update: {
          cause_category?:
            | "distress_tolerance"
            | "logistics"
            | "emotional_load"
            | null;
          job_id?: string | null;
          emotional_state_before?: string | null;
          all_or_nothing_stage?: string | null;
          protocol_completed?: boolean;
        };
        Relationships: [];
      };
      practice_collection: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          is_default: boolean;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description: string;
          is_default?: boolean;
          active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          active?: boolean;
        };
        Relationships: [];
      };
      daily_intentions: {
        Row: {
          user_id: string;
          date: string;
          hard_task: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          hard_task?: string | null;
          updated_at?: string;
        };
        Update: {
          hard_task?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      hard_things_log: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          timestamp: string;
          what: string;
          before: number;
          during: number;
          after: number;
          note: string | null;
          linked_intention: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          timestamp?: string;
          what: string;
          before: number;
          during: number;
          after: number;
          note?: string | null;
          linked_intention?: boolean;
        };
        Update: never;
        Relationships: [];
      };
      self_love_log: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          timestamp: string;
          practice: string;
          practice_id: string;
          felt: number;
          note: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          timestamp?: string;
          practice: string;
          practice_id: string;
          felt: number;
          note?: string | null;
        };
        Update: never;
        Relationships: [];
      };
      self_worth_evidence: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          timestamp: string;
          title: string;
          situation: string;
          what_i_did_well: string;
          tags: string[];
          archived: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          timestamp?: string;
          title: string;
          situation: string;
          what_i_did_well: string;
          tags?: string[];
          archived?: boolean;
        };
        Update: {
          archived?: boolean;
        };
        Relationships: [];
      };
      take_up_space_log: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          mode: string;
          situation: string | null;
          action: string | null;
          cost: string | null;
          need: string | null;
          choice_text: string | null;
          teaching: string | null;
          tag_ids: string[];
          tag_names: string[];
          choice_outcome: string | null;
          panel_tag: string | null;
          status: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          mode?: string;
          situation?: string | null;
          action?: string | null;
          cost?: string | null;
          need?: string | null;
          choice_text?: string | null;
          teaching?: string | null;
          tag_ids?: string[];
          tag_names?: string[];
          choice_outcome?: string | null;
          panel_tag?: string | null;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          date?: string;
          mode?: string;
          situation?: string | null;
          action?: string | null;
          cost?: string | null;
          need?: string | null;
          choice_text?: string | null;
          teaching?: string | null;
          tag_ids?: string[];
          tag_names?: string[];
          choice_outcome?: string | null;
          panel_tag?: string | null;
          status?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      take_up_space_tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          is_default: boolean;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          is_default?: boolean;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          active?: boolean;
        };
        Relationships: [];
      };
    };
  };
}

// Convenience row types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];
export type ProfileQuality =
  Database["public"]["Tables"]["profile_qualities"]["Row"];
export type ProfileReminder =
  Database["public"]["Tables"]["profile_reminders"]["Row"];
export type Habit = Database["public"]["Tables"]["habits"]["Row"];
export type HabitConfig = Database["public"]["Tables"]["habit_configs"]["Row"];
export type BreakObservation =
  Database["public"]["Tables"]["break_observations"]["Row"];
export type BreakObservationEmotion =
  Database["public"]["Tables"]["break_observation_emotions"]["Row"];
export type BuildObservation =
  Database["public"]["Tables"]["build_observations"]["Row"];
export type PendingProtocolRow =
  Database["public"]["Tables"]["pending_protocols"]["Row"];
export type StandingUpEntry =
  Database["public"]["Tables"]["standing_up_log"]["Row"];
export type WeeklyReview =
  Database["public"]["Tables"]["weekly_reviews"]["Row"];
export type WeeklyReviewHabit =
  Database["public"]["Tables"]["weekly_review_habits"]["Row"];
export type DistressToleranceEntry =
  Database["public"]["Tables"]["distress_tolerance_log"]["Row"];
export type SlipDriftEntry =
  Database["public"]["Tables"]["slip_drift_log"]["Row"];

// App-level types
export type HabitCategory = "break" | "build";
export type HabitStatus = "active" | "scheduled" | "paused" | "deactivated";
export type MarkType = "full" | "dot" | "half";
export type TrackType = "engine" | "break" | "build";
export type ProtocolType = "slip" | "drift";

export interface HabitWithConfigs extends Habit {
  configs: HabitConfig[];
}

export interface BreakObservationWithEmotions extends BreakObservation {
  emotions: BreakObservationEmotion[];
}

export interface WeeklyReviewWithHabits extends WeeklyReview {
  habit_reviews: WeeklyReviewHabit[];
}
