export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar: string;
          bio: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar?: string;
          bio?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar?: string;
          bio?: string | null;
          phone?: string | null;
        };
      };
      user_teams: {
        Row: { user_id: string; team_id: string; fandom_level: string | null };
        Insert: { user_id: string; team_id: string; fandom_level?: string | null };
        Update: { fandom_level?: string | null };
      };
      follows: {
        Row: { follower_id: string; following_id: string; created_at: string };
        Insert: { follower_id: string; following_id: string; created_at?: string };
        Update: Record<string, never>;
      };
      neighborhoods: {
        Row: { id: string; name: string; emoji: string; created_by: string | null; created_at: string };
        Insert: { id?: string; name: string; emoji?: string; created_by?: string | null; created_at?: string };
        Update: { name?: string; emoji?: string };
      };
      neighborhood_members: {
        Row: { neighborhood_id: string; user_id: string; joined_at: string };
        Insert: { neighborhood_id: string; user_id: string; joined_at?: string };
        Update: Record<string, never>;
      };
      messages: {
        Row: { id: string; neighborhood_id: string; user_id: string | null; content: string; tag: string | null; created_at: string };
        Insert: { id?: string; neighborhood_id: string; user_id?: string | null; content: string; tag?: string | null; created_at?: string };
        Update: { content?: string };
      };
      hot_takes: {
        Row: { id: string; content: string; author_id: string; neighborhood_id: string | null; neighborhood_name: string | null; is_public: boolean; team_ids: string[]; created_at: string };
        Insert: { id?: string; content: string; author_id: string; neighborhood_id?: string | null; neighborhood_name?: string | null; is_public?: boolean; team_ids?: string[]; created_at?: string };
        Update: { content?: string; is_public?: boolean };
      };
      hot_take_reactions: {
        Row: { hot_take_id: string; user_id: string; emoji: string; created_at: string };
        Insert: { hot_take_id: string; user_id: string; emoji: string; created_at?: string };
        Update: { emoji?: string };
      };
      hot_take_comments: {
        Row: { id: string; hot_take_id: string; user_id: string; content: string; created_at: string };
        Insert: { id?: string; hot_take_id: string; user_id: string; content: string; created_at?: string };
        Update: { content?: string };
      };
      debates: {
        Row: { id: string; claim: string; side1_label: string | null; side2_label: string | null; author_id: string; neighborhood_id: string | null; neighborhood_name: string | null; is_public: boolean; status: string; resolution: string | null; team_ids: string[]; created_at: string };
        Insert: { id?: string; claim: string; side1_label?: string | null; side2_label?: string | null; author_id: string; neighborhood_id?: string | null; neighborhood_name?: string | null; is_public?: boolean; status?: string; resolution?: string | null; team_ids?: string[]; created_at?: string };
        Update: { status?: string; resolution?: string | null; is_public?: boolean };
      };
      debate_sides: {
        Row: { debate_id: string; user_id: string; side: string };
        Insert: { debate_id: string; user_id: string; side: string };
        Update: Record<string, never>;
      };
      debate_votes: {
        Row: { debate_id: string; user_id: string; choice: string; created_at: string };
        Insert: { debate_id: string; user_id: string; choice: string; created_at?: string };
        Update: { choice?: string };
      };
      debate_arguments: {
        Row: { id: string; debate_id: string; user_id: string; side: string; content: string; created_at: string };
        Insert: { id?: string; debate_id: string; user_id: string; side: string; content: string; created_at?: string };
        Update: { content?: string };
      };
      bets: {
        Row: { id: string; claim: string; author_id: string; neighborhood_id: string | null; neighborhood_name: string | null; stakes: string | null; status: string; winner_id: string | null; is_push: boolean; is_public: boolean; side1_label: string | null; side2_label: string | null; team_ids: string[]; created_at: string };
        Insert: { id?: string; claim: string; author_id: string; neighborhood_id?: string | null; neighborhood_name?: string | null; stakes?: string | null; status?: string; winner_id?: string | null; is_push?: boolean; is_public?: boolean; side1_label?: string | null; side2_label?: string | null; team_ids?: string[]; created_at?: string };
        Update: { status?: string; winner_id?: string | null; is_push?: boolean; is_public?: boolean };
      };
      bet_participants: {
        Row: { bet_id: string; user_id: string; side: string | null };
        Insert: { bet_id: string; user_id: string; side?: string | null };
        Update: Record<string, never>;
      };
      analyses: {
        Row: { id: string; title: string; content: string; author_id: string; neighborhood_id: string | null; neighborhood_name: string | null; is_public: boolean; team_ids: string[]; created_at: string };
        Insert: { id?: string; title: string; content: string; author_id: string; neighborhood_id?: string | null; neighborhood_name?: string | null; is_public?: boolean; team_ids?: string[]; created_at?: string };
        Update: { title?: string; content?: string; is_public?: boolean };
      };
      analysis_comments: {
        Row: { id: string; analysis_id: string; user_id: string; content: string; created_at: string };
        Insert: { id?: string; analysis_id: string; user_id: string; content: string; created_at?: string };
        Update: { content?: string };
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_id_by_username: {
        Args: { p_username: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
  };
}
