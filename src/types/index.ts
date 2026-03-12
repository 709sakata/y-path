export type Role = 'admin' | 'customer';
export type MembershipType = 'general' | 'member';
export type MembershipStatus = 'active' | 'withdrawn';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type AttendanceStatus = 'attending' | 'absent';
export type ActualAttendanceStatus = 'attended' | 'absent' | 'no_show';
export type ProgramCategory = 'regular' | 'irregular';

export interface User {
  id: string;
  email?: string;
  role: Role;
  organization_id?: string;
}

export interface Survey {
  id: string;
  parent_id?: string;
  title: string;
  submitted_at: string;
  answers: Record<string, string>;
  created_at: string;
}

export interface Parent {
  id: string;
  name: string;
  email: string;
  phone: string;
  postal_code?: string;
  address?: string;
  membership_type: MembershipType;
  membership_status: MembershipStatus;
  joined_at: string;
  withdrawn_at?: string;
  created_at?: string;
  children?: Child[];
  history?: Reservation[];
  surveys?: Survey[];
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
  title: string;
  description: string;
  category: ProgramCategory;
  base_price: number;
  capacity: number;
  status: 'active' | 'cancelled' | 'completed';
  schedules?: ProgramSchedule[];
}

export interface ProgramSchedule {
  id: string;
  program_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  location?: string;
  capacity: number;
  current_participants?: number;
}

export interface Reservation {
  id: string;
  parent_id: string;
  program_schedule_id: string;
  status: ReservationStatus;
  total_price: number;
  notes?: string;
  created_at: string;
  parent_name?: string;
  parent_phone?: string;
  membership_type?: MembershipType;
  program_title?: string;
  date?: string;
  time?: string;
  attendance?: Attendance[];
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
