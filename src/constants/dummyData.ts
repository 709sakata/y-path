import { Program, Parent, Reservation, DashboardStats, CompetitorEvent, MarketInsight, PositioningPoint, LTVProjectionData, BusinessHealthCheck, Organization } from '../types';

export const DUMMY_ORGANIZATIONS: Organization[] = [
  {
    id: 'org-1',
    name: 'ASOBOスポーツ協会',
    description: 'ASOBOを拠点に活動する総合スポーツ団体です。',
    website: 'https://asobo-sports.example.com'
  },
  {
    id: 'org-2',
    name: 'わくわくキッズクラブ',
    description: '子供たちの好奇心を育む体験型イベントを企画しています。',
    website: 'https://wakuwaku-kids.example.com'
  }
];

export const DUMMY_PROGRAMS: Program[] = [
  {
    id: 'dummy-1',
    organization_id: 'org-1',
    organization_name: 'ASOBOスポーツ協会',
    title: '春の親子ヨガ教室',
    description: '初心者大歓迎！親子で楽しく体を動かしましょう。専門のインストラクターが丁寧に指導します。',
    category: 'irregular',
    capacity: 15,
    status: 'active',
    pricing: [
      { id: 'dp-1', program_id: 'dummy-1', tier_label: '一般', amount: 3500 }
    ],
    schedules: [
      {
        id: 'ds-1',
        program_id: 'dummy-1',
        start_date: '2024-04-15T10:00:00',
        end_date: '2024-04-15T11:30:00',
        capacity: 15,
        schedule_locations: [{ id: 'dl-1', schedule_id: 'ds-1', location_name: 'ASOBO 3F ホール', meeting_time: '10:00', dismissal_time: '11:30' }]
      },
      {
        id: 'ds-2',
        program_id: 'dummy-1',
        start_date: '2024-04-22T10:00:00',
        end_date: '2024-04-22T11:30:00',
        capacity: 15,
        schedule_locations: [{ id: 'dl-2', schedule_id: 'ds-2', location_name: 'ASOBO 3F ホール', meeting_time: '10:00', dismissal_time: '11:30' }]
      }
    ]
  },
  {
    id: 'dummy-2',
    organization_id: 'org-2',
    organization_name: 'わくわくキッズクラブ',
    title: 'わんぱく水泳教室',
    description: '水が苦手なお子様でも大丈夫。遊びを取り入れながら楽しく泳ぎの基本を学びます。',
    category: 'regular',
    capacity: 20,
    status: 'active',
    pricing: [
      { id: 'dp-2', program_id: 'dummy-2', tier_label: '一般', amount: 5000 }
    ],
    schedules: [
      {
        id: 'ds-3',
        program_id: 'dummy-2',
        start_date: '2024-05-01T15:30:00',
        end_date: '2024-05-01T16:30:00',
        capacity: 20,
        schedule_locations: [{ id: 'dl-3', schedule_id: 'ds-3', location_name: 'ASOBO プール', meeting_time: '15:30', dismissal_time: '16:30' }]
      }
    ]
  }
];

export const DUMMY_CUSTOMERS: Parent[] = [
  {
    id: 'dc-1',
    name: '山田 太郎',
    email: 'yamada@example.com',
    phone: '090-1234-5678',
    membership_type: 'member',
    membership_status: 'active',
    joined_at: '2023-01-10',
    children: [
      { id: 'dch-1', parent_id: 'dc-1', name: '山田 花子', birthday: '2018-05-20', is_active: true },
      { id: 'dch-2', parent_id: 'dc-1', name: '山田 次郎', birthday: '2020-11-15', is_active: true }
    ]
  },
  {
    id: 'dc-2',
    name: '佐藤 美香',
    email: 'sato@example.com',
    phone: '080-9876-5432',
    membership_type: 'general',
    membership_status: 'active',
    joined_at: '2023-06-15',
    children: [
      { id: 'dch-3', parent_id: 'dc-2', name: '佐藤 健太', birthday: '2019-02-28', is_active: true }
    ]
  }
];

export const DUMMY_RESERVATIONS: Reservation[] = [
  {
    id: 'dr-1',
    parent_id: 'dc-1',
    program_schedule_id: 'ds-1',
    status: 'pending',
    total_price: 6300,
    created_at: '2024-03-01T10:00:00Z',
    parent_name: '山田 太郎',
    parent_phone: '090-1234-5678',
    membership_type: 'member',
    program_title: '春の親子ヨガ教室',
    date: '2024-04-15',
    time: '10:00',
    attendance: [
      { id: 'da-1', reservation_id: 'dr-1', is_parent: true, planned_status: 'attending' },
      { id: 'da-2', reservation_id: 'dr-1', is_parent: false, child_id: 'dch-1', children: { name: '山田 花子' }, planned_status: 'attending' }
    ]
  },
  {
    id: 'dr-2',
    parent_id: 'dc-2',
    program_schedule_id: 'ds-3',
    status: 'confirmed',
    total_price: 5000,
    created_at: '2024-03-02T14:30:00Z',
    parent_name: '佐藤 美香',
    parent_phone: '080-9876-5432',
    membership_type: 'general',
    program_title: 'わんぱく水泳教室',
    date: '2024-05-01',
    time: '15:30',
    attendance: [
      { id: 'da-3', reservation_id: 'dr-2', is_parent: false, child_id: 'dch-3', children: { name: '佐藤 健太' }, planned_status: 'attending' }
    ]
  }
];

export const DUMMY_STATS: DashboardStats = {
  todayReservations: 12,
  monthlyRevenue: 245000,
  activeCustomers: 124,
  pendingRequests: 5,
  averageLTV: 52400,
  retentionRate: 75,
  phaseLTV: {
    trial: 3500,
    visitor: 28400,
    member: 115000
  },
  phaseCounts: {
    trial: 65,
    visitor: 42,
    member: 17
  },
  conversionRates: {
    trialToVisitor: 52,
    visitorToMember: 28
  },
  topCustomers: [
    {
      parentId: 'dc-1',
      parentName: '山田 太郎',
      phase: 'member',
      totalRevenue: 158000,
      participationCount: 18,
      averageIntervalDays: 10,
      firstParticipationDate: '2023-01-10',
      lastParticipationDate: '2024-03-01',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-10',
      parentName: '小林 直樹',
      phase: 'member',
      totalRevenue: 124000,
      participationCount: 12,
      averageIntervalDays: 22,
      firstParticipationDate: '2023-04-12',
      lastParticipationDate: '2024-02-28',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-11',
      parentName: '伊藤 恵子',
      phase: 'member',
      totalRevenue: 108000,
      participationCount: 15,
      averageIntervalDays: 15,
      firstParticipationDate: '2023-02-20',
      lastParticipationDate: '2024-03-02',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-16',
      parentName: '佐々木 健',
      phase: 'member',
      totalRevenue: 92000,
      participationCount: 11,
      averageIntervalDays: 20,
      firstParticipationDate: '2023-06-01',
      lastParticipationDate: '2024-02-25',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-17',
      parentName: '松本 裕美',
      phase: 'member',
      totalRevenue: 88000,
      participationCount: 10,
      averageIntervalDays: 25,
      firstParticipationDate: '2023-07-15',
      lastParticipationDate: '2024-03-01',
      isChurnRisk: false,
      spotRevenue: 0
    }
  ],
  enrollmentPushList: [
    {
      parentId: 'dc-3',
      parentName: '田中 健一',
      phase: 'visitor',
      totalRevenue: 18500,
      participationCount: 5,
      averageIntervalDays: 25,
      firstParticipationDate: '2023-11-01',
      lastParticipationDate: '2024-02-15',
      isChurnRisk: false,
      spotRevenue: 18500
    },
    {
      parentId: 'dc-12',
      parentName: '中村 裕子',
      phase: 'visitor',
      totalRevenue: 14000,
      participationCount: 4,
      averageIntervalDays: 40,
      firstParticipationDate: '2023-10-15',
      lastParticipationDate: '2024-02-20',
      isChurnRisk: false,
      spotRevenue: 14000
    },
    {
      parentId: 'dc-13',
      parentName: '加藤 剛',
      phase: 'visitor',
      totalRevenue: 12500,
      participationCount: 3,
      averageIntervalDays: 18,
      firstParticipationDate: '2024-01-05',
      lastParticipationDate: '2024-03-01',
      isChurnRisk: false,
      spotRevenue: 12500
    },
    {
      parentId: 'dc-18',
      parentName: '岡田 准一',
      phase: 'visitor',
      totalRevenue: 11000,
      participationCount: 3,
      averageIntervalDays: 30,
      firstParticipationDate: '2023-12-10',
      lastParticipationDate: '2024-02-28',
      isChurnRisk: false,
      spotRevenue: 11000
    }
  ],
  churnRiskList: [
    {
      parentId: 'dc-4',
      parentName: '鈴木 一郎',
      phase: 'member',
      totalRevenue: 45000,
      participationCount: 6,
      averageIntervalDays: 15,
      firstParticipationDate: '2023-08-01',
      lastParticipationDate: '2024-01-10',
      isChurnRisk: true,
      spotRevenue: 0
    },
    {
      parentId: 'dc-14',
      parentName: '渡辺 真一',
      phase: 'member',
      totalRevenue: 62000,
      participationCount: 8,
      averageIntervalDays: 20,
      firstParticipationDate: '2023-05-10',
      lastParticipationDate: '2024-01-15',
      isChurnRisk: true,
      spotRevenue: 0
    },
    {
      parentId: 'dc-19',
      parentName: '斎藤 工',
      phase: 'member',
      totalRevenue: 78000,
      participationCount: 9,
      averageIntervalDays: 18,
      firstParticipationDate: '2023-04-01',
      lastParticipationDate: '2024-01-05',
      isChurnRisk: true,
      spotRevenue: 0
    }
  ],
  milestoneList: [
    {
      parentId: 'dc-5',
      parentName: '高橋 花子',
      phase: 'member',
      totalRevenue: 85000,
      participationCount: 10,
      averageIntervalDays: 20,
      firstParticipationDate: '2023-05-01',
      lastParticipationDate: '2024-03-01',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-15',
      parentName: '森田 健太',
      phase: 'member',
      totalRevenue: 215000,
      participationCount: 30,
      averageIntervalDays: 10,
      firstParticipationDate: '2022-11-01',
      lastParticipationDate: '2024-03-02',
      isChurnRisk: false,
      spotRevenue: 0
    },
    {
      parentId: 'dc-20',
      parentName: '石原 さとみ',
      phase: 'member',
      totalRevenue: 345000,
      participationCount: 50,
      averageIntervalDays: 7,
      firstParticipationDate: '2022-05-01',
      lastParticipationDate: '2024-03-01',
      isChurnRisk: false,
      spotRevenue: 0
    }
  ],
  magicNumberData: [
    { participations: 1, enrollmentRate: 4 },
    { participations: 2, enrollmentRate: 11 },
    { participations: 3, enrollmentRate: 49 },
    { participations: 4, enrollmentRate: 68 },
    { participations: 5, enrollmentRate: 85 }
  ],
  revenueData: [
    { name: '10月', value: 125000 },
    { name: '11月', value: 148000 },
    { name: '12月', value: 195000 },
    { name: '1月', value: 162000 },
    { name: '2月', value: 178000 },
    { name: '3月', value: 245000 }
  ]
};

export const DUMMY_COMPETITOR_EVENTS: CompetitorEvent[] = [
  {
    id: 'ce-1',
    competitorName: '近隣スポーツクラブA',
    title: '親子スイミング体験会',
    price: 1500,
    date: '2024-04-10',
    themes: ['スイミング', '親子', '格安'],
    source: 'Peatix'
  },
  {
    id: 'ce-2',
    competitorName: 'カルチャーセンターB',
    title: '春のキッズヨガ',
    price: 2000,
    date: '2024-04-20',
    themes: ['ヨガ', 'キッズ', '室内'],
    source: 'SNS'
  },
  {
    id: 'ce-3',
    competitorName: '民間フィットネスC',
    title: '短期集中水泳合宿',
    price: 12000,
    date: '2024-05-03',
    themes: ['水泳', '合宿', 'GW'],
    source: 'Official'
  }
];

export const DUMMY_MARKET_INSIGHTS: MarketInsight[] = [
  {
    id: 'mi-1',
    type: 'cannibalization',
    title: '競合B社の低価格イベントによる影響',
    description: '来月、競合B社が類似の体験イベントを半額で実施します。これにより自社の体験客が20%減少する予測です。',
    impact: 'high',
    suggestedAction: '価格は下げず、「会員限定の特典」を体験当日のみ先行公開するキャンペーンを自動セットアップしました。',
    actionStatus: 'pending',
    createdAt: '2024-03-05'
  },
  {
    id: 'mi-2',
    type: 'trend',
    title: '「マインドフルネス」ワードの急上昇',
    description: '近隣他社で「マインドフルネス」を冠したプログラムの集客率が前月比30%向上しています。',
    impact: 'medium',
    suggestedAction: '既存のヨガプログラムのタイトルに「マインドフルネス」を追加し、差別化を図る。',
    actionStatus: 'dismissed',
    createdAt: '2024-03-04'
  },
  {
    id: 'mi-3',
    type: 'price',
    title: '非会員価格のベンチマーク警告',
    description: '自社の非会員価格(¥3,500)が、エリア平均(¥2,200)に対して割高になっています。',
    impact: 'medium',
    suggestedAction: '「3回セット券」を導入し、1回あたりの実質価格を下げることで心理的ハードルを下げる。',
    actionStatus: 'pending',
    createdAt: '2024-03-02'
  }
];

export const DUMMY_POSITIONING: PositioningPoint[] = [
  { id: 'p-1', name: '自社 (ASOBO)', price: 60, communityDepth: 85, isSelf: true },
  { id: 'p-2', name: '競合A', price: 30, communityDepth: 40, isSelf: false },
  { id: 'p-3', name: '競合B', price: 45, communityDepth: 20, isSelf: false },
  { id: 'p-4', name: '競合C', price: 80, communityDepth: 60, isSelf: false },
  { id: 'p-5', name: '競合D', price: 20, communityDepth: 10, isSelf: false },
];

export const DUMMY_PROJECTION_DATA: LTVProjectionData[] = Array.from({ length: 36 }, (_, i) => {
  const month = i + 1;
  const base = 250000 * Math.pow(1.02, i);
  return {
    month: `${month}ヶ月後`,
    baseRevenue: Math.round(base),
    projectedRevenue: Math.round(base * Math.pow(1.05, i)),
    referralEffect: Math.round(base * 0.1 * (i / 12))
  };
});

export const DUMMY_HEALTH_CHECKS: BusinessHealthCheck[] = [
  {
    id: 'hc-1',
    title: '離脱率の長期リスク',
    advice: '現在の離脱率が続くと、2年後に新規獲得コストが収益を圧迫するリスクがあります。今のうちに会員の「紹介プログラム」を構築し、獲得単価を下げる構造を作ってください。',
    impact: 'negative'
  },
  {
    id: 'hc-2',
    title: '収益最大化戦略',
    advice: '3年後の収益を最大化するには、入会金を下げることよりも、会員限定イベントの単価を年率5%ずつ上げるブランド戦略が最も効果的です。',
    impact: 'positive'
  }
];
