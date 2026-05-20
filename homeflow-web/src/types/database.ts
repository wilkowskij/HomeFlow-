// Hand-maintained DB types — mirrors the Prisma schema for the Supabase project.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Enums ────────────────────────────────────────────────────────────────────

export type DbPropertyType =
  | 'SINGLE_FAMILY'
  | 'TOWNHOUSE'
  | 'CONDO'
  | 'MULTI_FAMILY'
  | 'LAND';

export type DbJourneyStage =
  | 'PROFILE_PREAPPROVAL'
  | 'SEARCHING'
  | 'OFFER_SUBMITTED'
  | 'INSPECTION_DUE_DILIGENCE'
  | 'APPRAISAL_UNDERWRITING'
  | 'CLOSING';

export type DbAppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

// ─── Row types ────────────────────────────────────────────────────────────────

export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface BuyerProfileRow {
  id: string;
  user_id: string;
  locations: string[];
  budget_min: number;
  budget_max: number;
  timeline: string;
  bedrooms_min: number;
  bedrooms_max: number | null;
  bathrooms_min: number;
  property_types: DbPropertyType[];
  must_haves: string[];
  pre_approval_status: string;
  pre_approval_amount: number | null;
  pre_approval_doc: string | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyRow {
  id: string;
  mls_id: string | null;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number | null;
  lot_size: number | null;
  year_built: number | null;
  property_type: DbPropertyType;
  description: string | null;
  photos: string[];
  virtual_tour_url: string | null;
  listing_status: string;
  days_on_market: number;
  price_history: Json | null;
  lat: number | null;
  lng: number | null;
  neighborhood_data: Json | null;
  created_at: string;
  updated_at: string;
}

export interface PropertyAiInsightRow {
  id: string;
  property_id: string;
  user_id: string;
  match_score: number;
  pros: string[];
  cons: string[];
  summary: string;
  commute_minutes: number | null;
  estimated_monthly_cost: number | null;
  created_at: string;
}

export interface SavedHomeRow {
  id: string;
  user_id: string;
  property_id: string;
  notes: string | null;
  rating: number | null;
  saved_at: string;
}

export interface ViewingAppointmentRow {
  id: string;
  user_id: string;
  property_id: string;
  scheduled_at: string;
  duration: number;
  status: DbAppointmentStatus;
  agent_name: string | null;
  agent_phone: string | null;
  notes: string | null;
  post_visit_rating: number | null;
  post_visit_notes: string | null;
  itinerary_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface JourneyPipelineRow {
  id: string;
  user_id: string;
  current_stage: DbJourneyStage;
  agent_id: string | null;
  agent_data: Json | null;
  stage_data: Json | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  user_id: string;
  role: string;
  content: string;
  created_at: string;
}

// ─── Supabase Database shape (v2 format with Relationships) ──────────────────

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string };
        Update: Partial<Omit<ProfileRow, 'id'>>;
        Relationships: [];
      };
      buyer_profiles: {
        Row: BuyerProfileRow;
        Insert: Omit<BuyerProfileRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<BuyerProfileRow, 'id' | 'user_id'>>;
        Relationships: [];
      };
      properties: {
        Row: PropertyRow;
        Insert: Omit<PropertyRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<PropertyRow, 'id'>>;
        Relationships: [];
      };
      property_ai_insights: {
        Row: PropertyAiInsightRow;
        Insert: Omit<PropertyAiInsightRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<PropertyAiInsightRow, 'id'>>;
        Relationships: [];
      };
      saved_homes: {
        Row: SavedHomeRow;
        Insert: Omit<SavedHomeRow, 'id' | 'saved_at'> & { id?: string; saved_at?: string };
        Update: Partial<Omit<SavedHomeRow, 'id' | 'user_id' | 'property_id'>>;
        Relationships: [];
      };
      viewing_appointments: {
        Row: ViewingAppointmentRow;
        Insert: Omit<ViewingAppointmentRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<ViewingAppointmentRow, 'id' | 'user_id' | 'property_id'>>;
        Relationships: [];
      };
      journey_pipelines: {
        Row: JourneyPipelineRow;
        Insert: Omit<JourneyPipelineRow, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: string; updated_at?: string };
        Update: Partial<Omit<JourneyPipelineRow, 'id' | 'user_id'>>;
        Relationships: [];
      };
      chat_messages: {
        Row: ChatMessageRow;
        Insert: Omit<ChatMessageRow, 'created_at'> & { created_at?: string };
        Update: Partial<Omit<ChatMessageRow, 'id' | 'user_id'>>;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      property_type: DbPropertyType;
      journey_stage: DbJourneyStage;
      appointment_status: DbAppointmentStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
