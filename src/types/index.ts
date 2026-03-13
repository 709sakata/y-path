export type Role = 'admin' | 'customer';
export type MembershipType = 'general' | 'member';
export type MembershipStatus = 'active' | 'withdrawn';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AttendanceStatus = 'attending' | 'absent';
export type ActualAttendanceStatus = 'attended' | 'absent' | 'no_show';
export type ProgramCategory = 'MONTHLY' | 'SEASONAL' | 'OVERNIGHT' | 'GROUP' | 'AFTER_SCHOOL' | 'TRIAL' | 'WELFARE' | 'FAMILY' | 'EVENT';
export type ProgramStatus = 'draft' | 'active' | 'archived' | 'cancelled' | 'completed';
export type ScheduleStatus = 'open' | 'waitlist' | 'closed' | 'cancelled';
export type PricingUnit = 'per_person' | 'per_family';
export type FireType = 'none' | 'cooking_fire' | 'campfire_small' | 'campfire' | 'both';
export type MealStyle = 'byo' | 'cooking' | 'provided' | 'free' | 'none';
export type EligibilityType = 'open' | 'single_parent' | 'members_only' | 'high_grade';

export interface User {
  id: string;
  email?: string;
  role: Role;
  organization_id?: string;
}

export interface Survey {
  id: string;
  parent_id?: string;
  organization_id?: string;
  program_id?: string;
  title: string;
  submitted_at: string;
  answers: Record<string, string>;
  created_at: string;
  parents?: { name: string; email: string };
  organizations?: { name: string };
  programs?: { title: string };
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  postal_code?: string;
  address?: string;
  created_at?: string;
  // Relationships
  parent_organizations?: ParentOrganization[];
  children?: Child[];
  history?: Reservation[];
  surveys?: Survey[];
}

export interface ParentOrganization {
  parent_id: string;
  organization_id: string;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
  joined_at: string;
  withdrawn_at?: string;
  organizations?: { name: string };
}

export interface Child {
  id: string;
  parent_id: string;
  name: string;
  birthday: string;
  notes?: string;
  is_active: boolean;
}

export interface Program {
  id: string;
  organization_id: string;
  organization_name?: string;
  category: ProgramCategory;
  title: string;
  description: string;
  status: ProgramStatus;
  
  target_age_min?: string;
  target_age_max?: string;
  target_grade_min?: number;
  target_grade_max?: number;
  eligibility: EligibilityType;
  requires_certificate: boolean;
  lottery_based: boolean;
  
  capacity: number;
  min_participants?: number;
  nights: number;
  is_annual_recurring: boolean;
  
  pricing_unit: PricingUnit;
  cancellation_policy_id?: string;
  
  fire_type: FireType;
  water_activity: boolean;
  cotton_required_days?: number[];
  muffler_prohibited: boolean;
  
  study_time: boolean;
  study_minutes_per_session?: number;
  parent_program: boolean;
  
  rental_available: boolean;
  organizer_name?: string;
  sponsor_name?: string;
  
  created_at?: string;
  updated_at?: string;

  // Relationships
  pricing?: ProgramPricing[];
  schedules?: ProgramSchedule[];
}

export interface ProgramPricing {
  id: string;
  program_id: string;
  tier_label: string;
  amount: number;
  extra_fee: number;
  applicable_days?: number;
  includes_persons?: number;
  max_persons?: number;
  min_age_free?: number;
  notes?: string;
  sort_order: number;
}

export interface Location {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  address?: string;
  default_meeting_time?: string;
  default_dismissal_time?: string;
  meeting_time_from?: string;
  meeting_time_to?: string;
  dismissal_time_from?: string;
  dismissal_time_to?: string;
  access_notes?: string;
  transport_surcharge_base: number;
}

export interface ProgramSchedule {
  id: string;
  program_id: string;
  start_date: string;
  end_date: string;
  status: ScheduleStatus;
  capacity_override?: number;
  dismissal_override?: any;
  notes?: string;
  
  // Relationships
  current_participants?: number;
  schedule_locations?: ScheduleLocation[];
}

export interface ScheduleLocation {
  schedule_id: string;
  location_id: string;
  meeting_time?: string;
  dismissal_time?: string;
  locations?: Location;
}

export interface Reservation {
  id: string;
  parent_id: string;
  child_id?: string;
  program_schedule_id: string;
  selected_location_id?: string;
  pricing_id?: string;
  status: ReservationStatus;
  total_price: number;
  notes?: string;
  created_at: string;
  
  // Joined data
  parent_name?: string;
  parent_phone?: string;
  membership_type?: string;
  child_name?: string;
  program_title?: string;
  date?: string;
  time?: string;
  start_date?: string;
  end_date?: string;
  attendance?: Attendance[];
  pricing?: ProgramPricing;
  location?: Location;
}

export interface Attendance {
  id: string;
  reservation_id: string;
  child_id?: string;
  is_parent: boolean;
  child_name?: string;
  children?: { name: string };
  planned_status: AttendanceStatus;
  actual_status?: ActualAttendanceStatus;
  check_in_time?: string;
  notes?: string;
}

export type CustomerPhase = 'trial' | 'visitor' | 'member';

export interface CustomerLTV {
  parentId: string;
  parentName: string;
  phase: CustomerPhase;
  totalRevenue: number;
  participationCount: number;
  averageIntervalDays: number;
  lastParticipationDate: string;
  firstParticipationDate: string;
  isChurnRisk: boolean;
  spotRevenue: number; // For "Enrollment Recommendation" logic
}

export interface DashboardStats {
  todayReservations: number;
  monthlyRevenue: number;
  activeCustomers: number;
  pendingRequests: number;
  revenueData: { name: string; value: number }[];
  
  // Phase Metrics
  phaseLTV: {
    trial: number;
    visitor: number;
    member: number;
  };
  phaseCounts: {
    trial: number;
    visitor: number;
    member: number;
  };

  // Retention & Funnel
  conversionRates: {
    trialToVisitor: number;
    visitorToMember: number;
  };
  retentionRate: number;
  averageLTV: number;
  
  // Lists
  topCustomers: CustomerLTV[];
  enrollmentPushList: CustomerLTV[]; // Spot revenue > Enrollment fee
  churnRiskList: CustomerLTV[];
  milestoneList: CustomerLTV[]; // Participation count = 10, 30, etc.
  
  // Magic Number Data
  magicNumberData: { participations: number; enrollmentRate: number }[];
}

export interface CompetitorEvent {
  id: string;
  competitorName: string;
  title: string;
  price: number;
  date: string;
  themes: string[];
  source: 'SNS' | 'Peatix' | 'Official';
}

export interface MarketInsight {
  id: string;
  type: 'trend' | 'price' | 'frequency' | 'cannibalization';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  suggestedAction: string;
  actionStatus: 'pending' | 'executed' | 'dismissed';
  createdAt: string;
}

export interface PositioningPoint {
  id: string;
  name: string;
  price: number; // 0-100 (Cheap to Expensive)
  communityDepth: number; // 0-100 (Light to Core)
  isSelf: boolean;
}

export interface LTVProjectionData {
  month: string;
  baseRevenue: number;
  projectedRevenue: number;
  referralEffect: number;
}

export interface BusinessHealthCheck {
  id: string;
  title: string;
  advice: string;
  impact: 'positive' | 'negative' | 'neutral';
}

export interface Organization {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  created_at?: string;
}

export interface ProgramStrategyProposal {
  id: string;
  name: string;
  target: string;
  purpose: string;
  curriculum: {
    introduction: string;
    main: string;
    closing: string;
  };
  promotionDrafts: {
    line: string;
    email: string;
    sns: string;
  };
  logic: string;
}
