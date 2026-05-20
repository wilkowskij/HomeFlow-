// ─── User & Profile ───────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BuyerProfile {
  userId: string;
  locations: string[];
  budgetMin: number;
  budgetMax: number;
  timeline: BuyingTimeline;
  preferences: PropertyPreferences;
  preApprovalStatus: PreApprovalStatus;
  preApprovalAmount?: number;
  preApprovalDocUrl?: string;
}

export type BuyingTimeline =
  | 'asap'
  | '1-3months'
  | '3-6months'
  | '6-12months'
  | 'just-browsing';

export interface PropertyPreferences {
  bedsMin: number;
  bedsMax?: number;
  bathsMin: number;
  bathsMax?: number;
  propertyTypes: PropertyType[];
  mustHaves: string[];
  niceToHaves: string[];
  maxCommuteMinutes?: number;
  commuteDestination?: string;
  schoolRatingMin?: number;
  requiresYard: boolean;
}

export type PreApprovalStatus = 'none' | 'in-progress' | 'approved' | 'expired';
export type PropertyType = 'single-family' | 'condo' | 'townhouse' | 'multi-family' | 'land';

// ─── Property / Listing ───────────────────────────────────────────────────────

export interface Property {
  id: string;
  mlsId?: string;
  address: PropertyAddress;
  price: number;
  pricePerSqft?: number;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft?: number;
  yearBuilt?: number;
  propertyType: PropertyType;
  status: ListingStatus;
  daysOnMarket: number;
  photos: string[];
  virtualTourUrl?: string;
  description: string;
  features: string[];
  neighborhood?: NeighborhoodData;
  aiInsights?: PropertyAIInsights;
  listedAt: string;
  updatedAt: string;
}

export interface PropertyAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

export type ListingStatus = 'active' | 'pending' | 'under-contract' | 'sold' | 'off-market';

export interface NeighborhoodData {
  walkScore?: number;
  transitScore?: number;
  bikeScore?: number;
  schoolRating?: number;
  topSchools?: School[];
  crimeIndex?: number;
  medianHomePrice?: number;
  priceChangePct12m?: number;
  nearbyAmenities?: string[];
}

export interface School {
  name: string;
  type: 'elementary' | 'middle' | 'high';
  rating: number;
  distanceMiles: number;
}

export interface PropertyAIInsights {
  matchScore: number;
  pros: string[];
  cons: string[];
  summary: string;
  commuteMinutes?: number;
  estimatedMonthlyCost?: number;
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchFilters {
  query?: string;
  locations?: string[];
  priceMin?: number;
  priceMax?: number;
  bedsMin?: number;
  bathsMin?: number;
  propertyTypes?: PropertyType[];
  sqftMin?: number;
  sqftMax?: number;
  yearBuiltMin?: number;
  maxCommuteMinutes?: number;
  mustHaveFeatures?: string[];
  status?: ListingStatus[];
  sortBy?: SearchSortBy;
  page?: number;
  pageSize?: number;
}

export type SearchSortBy =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'match-score';

export interface SearchResult {
  properties: Property[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Schedule & Viewing ───────────────────────────────────────────────────────

export interface ViewingSlot {
  id: string;
  propertyId: string;
  agentId?: string;
  startTime: string;
  endTime: string;
  type: 'open-house' | 'private-showing';
  status: 'available' | 'requested' | 'confirmed' | 'cancelled';
}

export interface ViewingAppointment {
  id: string;
  userId: string;
  propertyId: string;
  property?: Property;
  slotId: string;
  slot?: ViewingSlot;
  status: AppointmentStatus;
  agentContact?: AgentContact;
  notes?: string;
  rating?: number;
  photos?: string[];
  checklist?: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no-show';

export interface AgentContact {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl?: string;
  agency?: string;
}

export interface ViewingItinerary {
  id: string;
  userId: string;
  date: string;
  appointments: ViewingAppointment[];
  optimizedRoute?: RouteStop[];
  totalDrivingMinutes?: number;
  totalDistanceMiles?: number;
}

export interface RouteStop {
  appointmentId: string;
  order: number;
  arrivalTime: string;
  driveFromPreviousMinutes: number;
  lat: number;
  lng: number;
}

export interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

// ─── Pipeline / Journey ───────────────────────────────────────────────────────

export type JourneyStage =
  | 'profile-preapproval'
  | 'searching'
  | 'offer-submitted'
  | 'inspection-due-diligence'
  | 'appraisal-underwriting'
  | 'closing';

export interface JourneyPipeline {
  id: string;
  userId: string;
  currentStage: JourneyStage;
  stages: StageProgress[];
  connectedAgentId?: string;
  connectedAgent?: AgentContact;
  propertyOfInterestId?: string;
  startedAt: string;
  updatedAt: string;
}

export interface StageProgress {
  stage: JourneyStage;
  status: 'locked' | 'active' | 'completed';
  completedAt?: string;
  tasks: JourneyTask[];
  documents: RequiredDocument[];
}

export interface JourneyTask {
  id: string;
  label: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  assignedTo?: 'buyer' | 'agent' | 'lender' | 'attorney';
  completedAt?: string;
}

export interface RequiredDocument {
  id: string;
  name: string;
  description?: string;
  required: boolean;
  uploadedAt?: string;
  fileUrl?: string;
  status: 'missing' | 'uploaded' | 'verified' | 'rejected';
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  context?: ChatContext;
  quickActions?: QuickAction[];
}

export interface ChatContext {
  screen?: string;
  propertyId?: string;
  journeyStage?: JourneyStage;
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

// ─── API Response wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
