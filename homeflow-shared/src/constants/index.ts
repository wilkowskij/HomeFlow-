import type { JourneyStage } from '../types';

export const JOURNEY_STAGES: { stage: JourneyStage; label: string; description: string }[] = [
  {
    stage: 'profile-preapproval',
    label: 'Profile & Pre-Approval',
    description: 'Set up your buyer profile and get pre-approved for a mortgage.',
  },
  {
    stage: 'searching',
    label: 'Searching',
    description: 'Discover properties and schedule viewings.',
  },
  {
    stage: 'offer-submitted',
    label: 'Offer Submitted',
    description: 'You\'ve submitted an offer on a property.',
  },
  {
    stage: 'inspection-due-diligence',
    label: 'Inspection & Due Diligence',
    description: 'Home inspection and review of all disclosures.',
  },
  {
    stage: 'appraisal-underwriting',
    label: 'Appraisal & Underwriting',
    description: 'Lender appraises the home and processes your loan.',
  },
  {
    stage: 'closing',
    label: 'Closing',
    description: 'Final walkthrough, signing, and getting your keys!',
  },
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  'single-family': 'Single Family',
  condo: 'Condo',
  townhouse: 'Townhouse',
  'multi-family': 'Multi-Family',
  land: 'Land',
};

export const TIMELINE_LABELS: Record<string, string> = {
  asap: 'As soon as possible',
  '1-3months': '1–3 months',
  '3-6months': '3–6 months',
  '6-12months': '6–12 months',
  'just-browsing': 'Just browsing',
};

export const PRE_APPROVAL_LABELS: Record<string, string> = {
  none: 'Not started',
  'in-progress': 'In progress',
  approved: 'Approved',
  expired: 'Expired',
};

export const SORT_LABELS: Record<string, string> = {
  relevance: 'Best Match',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  newest: 'Newest First',
  'match-score': 'AI Match Score',
};

export const DEFAULT_PAGE_SIZE = 20;

export const MAX_SAVED_HOMES_MVP = 10;
export const MAX_ITINERARY_STOPS = 5;

export const APPOINTMENT_REMINDERS_HOURS = [24, 2];

export const MVP_FEATURES = [
  'onboarding',
  'search',
  'scheduling',
  'pipeline',
  'ai-chat',
] as const;
