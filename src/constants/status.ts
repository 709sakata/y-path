export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const RESERVATION_STATUS_LABELS: Record<string, string> = {
  [RESERVATION_STATUS.PENDING]: '承認待ち',
  [RESERVATION_STATUS.CONFIRMED]: '予約確定',
  [RESERVATION_STATUS.CANCELLED]: 'キャンセル',
  [RESERVATION_STATUS.COMPLETED]: '参加完了',
};

export const PROGRAM_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
  [PROGRAM_STATUS.ACTIVE]: '募集中',
  [PROGRAM_STATUS.COMPLETED]: '募集終了',
  [PROGRAM_STATUS.CANCELLED]: '中止',
};

export const MEMBERSHIP_STATUS = {
  ACTIVE: 'active',
  WITHDRAWN: 'withdrawn',
} as const;

export const MEMBERSHIP_STATUS_LABELS: Record<string, string> = {
  [MEMBERSHIP_STATUS.ACTIVE]: '入会中',
  [MEMBERSHIP_STATUS.WITHDRAWN]: '退会',
};

export const ATTENDANCE_STATUS = {
  ATTENDING: 'attending',
  ABSENT: 'absent',
} as const;

export const ACTUAL_ATTENDANCE_STATUS = {
  ATTENDED: 'attended',
  ABSENT: 'absent',
  NO_SHOW: 'no_show',
} as const;

export const MEMBERSHIP_TYPE = {
  GENERAL: 'general',
  MEMBER: 'member',
} as const;

export const MEMBERSHIP_TYPE_LABELS: Record<string, string> = {
  [MEMBERSHIP_TYPE.GENERAL]: '一般',
  [MEMBERSHIP_TYPE.MEMBER]: '会員',
};

export const CUSTOMER_PHASE = {
  TRIAL: 'trial',
  VISITOR: 'visitor',
  MEMBER: 'member',
} as const;

export const CUSTOMER_PHASE_LABELS: Record<string, string> = {
  [CUSTOMER_PHASE.TRIAL]: '初回体験',
  [CUSTOMER_PHASE.VISITOR]: 'ビジター',
  [CUSTOMER_PHASE.MEMBER]: '会員',
};
