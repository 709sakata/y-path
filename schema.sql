-- ============================================================
--  YMCA プログラム管理システム（統合版）
--  対象: Supabase (PostgreSQL 15+)
--  設計方針:
--    - マルチテナント（organizations単位でRLS）
--    - 第3正規形（price_settings JSOBを正規テーブルへ）
--    - 既存スキーマ（parents/children/reservations/attendance）を引き継ぎ
--    - 姫路YMCAの実データ検証済み構造を反映
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
--  ENUM
-- ============================================================

CREATE TYPE program_category AS ENUM (
  'MONTHLY',       -- 野外活動クラブ等・年間定期
  'SEASONAL',      -- 季節デイキャンプ（日帰り複数日）
  'OVERNIGHT',     -- 宿泊キャンプ
  'GROUP',         -- 団体向けデイキャンプ
  'AFTER_SCHOOL',  -- 学童保育
  'TRIAL',         -- お試し体験
  'WELFARE',       -- 支援・無料プログラム
  'FAMILY',        -- ファミリー体験
  'EVENT'          -- 単発イベント（汎用）
);

CREATE TYPE program_status AS ENUM (
  'draft', 'active', 'archived', 'cancelled', 'completed'
);

CREATE TYPE schedule_status AS ENUM (
  'open', 'waitlist', 'closed', 'cancelled'
);

CREATE TYPE reservation_status AS ENUM (
  'pending', 'confirmed', 'cancelled', 'completed'
);

CREATE TYPE pricing_unit AS ENUM (
  'per_person',   -- 個人単位
  'per_family'    -- 家族・グループ単位
);

CREATE TYPE fire_type AS ENUM (
  'none',
  'cooking_fire',    -- 野外料理・飯盒
  'campfire_small',  -- キャンドル等
  'campfire',        -- 本格キャンプファイヤー
  'both'             -- 野外料理 + キャンプファイヤー
);

CREATE TYPE meal_style AS ENUM (
  'byo',       -- 弁当持参
  'cooking',   -- 野外料理（当日調理）
  'provided',  -- 主催者が用意
  'free',      -- 自由（施設利用可）
  'none'       -- 食事なし
);

CREATE TYPE eligibility_type AS ENUM (
  'open',           -- 誰でも参加可
  'single_parent',  -- ひとり親家庭限定
  'members_only',   -- 会員限定
  'high_grade'      -- 高学年限定（小4以上等）
);

CREATE TYPE membership_type AS ENUM (
  'general',  -- 一般
  'member'    -- 会員（野外活動クラブ等）
);

CREATE TYPE membership_status AS ENUM (
  'active',
  'withdrawn'
);

CREATE TYPE attendance_planned AS ENUM (
  'attending', 'absent'
);

CREATE TYPE attendance_actual AS ENUM (
  'attended', 'absent', 'no_show'
);


-- ============================================================
--  1. organizations（テナント）
-- ============================================================

CREATE TABLE organizations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  description TEXT,
  logo_url    TEXT,
  website     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  2. locations（会場マスタ）
--     organizations単位で管理（マルチテナント）
-- ============================================================

CREATE TABLE locations (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  code                    TEXT NOT NULL,  -- 'ASOBO', 'HIMEJI_STATION' 等（org内でユニーク）
  name                    TEXT NOT NULL,
  address                 TEXT,
  -- 集合・解散の標準時刻
  -- 固定時刻 or 幅（どちらか一方を使用）
  default_meeting_time    TIME,
  default_dismissal_time  TIME,
  meeting_time_from       TIME,
  meeting_time_to         TIME,
  dismissal_time_from     TIME,
  dismissal_time_to       TIME,
  -- 一方通行・一斉解散等の特記事項
  access_notes            TEXT,
  -- 送迎加算のベース額（条件分岐がある場合はtransport_surcharge_rulesを参照）
  transport_surcharge_base INTEGER NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (organization_id, code),
  CONSTRAINT locations_time_check CHECK (
    default_meeting_time IS NOT NULL
    OR (meeting_time_from IS NOT NULL AND meeting_time_to IS NOT NULL)
  )
);

-- 送迎加算の条件分岐（姫路駅のような複雑なケース）
CREATE TABLE transport_surcharge_rules (
  id              SERIAL PRIMARY KEY,
  location_id     UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  condition_label TEXT NOT NULL,   -- '通常月', '街頭募金月（非参加）' 等
  amount          INTEGER NOT NULL,
  priority        INTEGER NOT NULL DEFAULT 0  -- 高い方が優先適用
);


-- ============================================================
--  3. cancellation_policies（キャンセルポリシー）
--     organizations単位で定義・programsから参照
-- ============================================================

CREATE TABLE cancellation_policies (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (organization_id, name)
);

CREATE TABLE cancellation_tiers (
  id               SERIAL PRIMARY KEY,
  policy_id        UUID NOT NULL REFERENCES cancellation_policies(id) ON DELETE CASCADE,
  days_before_min  INTEGER,      -- NULL = 無制限（11日前〜）
  days_before_max  INTEGER,      -- NULL = プログラム開始後
  rate             NUMERIC(3,2) NOT NULL CHECK (rate BETWEEN 0 AND 1),
  label            TEXT NOT NULL,
  sort_order       INTEGER NOT NULL
);


-- ============================================================
--  4. programs（プログラムマスタ）
-- ============================================================

CREATE TABLE programs (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category             program_category NOT NULL DEFAULT 'EVENT',
  title                TEXT NOT NULL,
  description          TEXT,
  status               program_status NOT NULL DEFAULT 'draft',

  -- 対象
  target_age_min       TEXT,     -- '年中', '小1' 等の表示用文字列
  target_age_max       TEXT,
  target_grade_min     INTEGER,  -- 数値化（年中=0, 小1=1, ..., 中3=9）
  target_grade_max     INTEGER,
  eligibility          eligibility_type NOT NULL DEFAULT 'open',
  requires_certificate BOOLEAN NOT NULL DEFAULT FALSE,  -- 証明書提出必要（WELFARE等）
  lottery_based        BOOLEAN NOT NULL DEFAULT FALSE,  -- 抽選あり

  -- 定員
  capacity             INTEGER NOT NULL DEFAULT 20,
  min_participants     INTEGER,  -- 最少催行人数

  -- 日程
  nights               INTEGER NOT NULL DEFAULT 0,  -- 0=日帰り, 1=1泊2日, ...
  is_annual_recurring  BOOLEAN NOT NULL DEFAULT FALSE,  -- 年間定期（MONTHLY）

  -- 料金
  pricing_unit         pricing_unit NOT NULL DEFAULT 'per_person',
  cancellation_policy_id UUID REFERENCES cancellation_policies(id),

  -- 活動内容
  fire_type            fire_type NOT NULL DEFAULT 'none',
  water_activity       BOOLEAN NOT NULL DEFAULT FALSE,
  -- cotton_required_days: NULLは不要, '{}'は全日不要, '{3}'は3日目のみ
  cotton_required_days INTEGER[],
  muffler_prohibited   BOOLEAN NOT NULL DEFAULT FALSE,

  -- 学習・保護者プログラム
  study_time           BOOLEAN NOT NULL DEFAULT FALSE,
  study_minutes_per_session INTEGER,
  parent_program       BOOLEAN NOT NULL DEFAULT FALSE,  -- 保護者向け説明会あり（TRIAL等）

  -- レンタル
  rental_available     BOOLEAN NOT NULL DEFAULT FALSE,

  -- 主催・協力（WELFARE等）
  organizer_name       TEXT,   -- NULLの場合はorganization.nameを使用
  sponsor_name         TEXT,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  5. program_pricing（料金テーブル）
--     base_priceを廃止してこちらに正規化
-- ============================================================

CREATE TABLE program_pricing (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id       UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  tier_label       TEXT NOT NULL,
  -- 例: '一般', '野外活動クラブメンバー', '4日間・一般', '1家族基本（大人1+子1）'
  amount           INTEGER NOT NULL,
  extra_fee        INTEGER NOT NULL DEFAULT 0,  -- 非会員の臨時会費（別途請求）
  applicable_days  INTEGER,   -- 日数が料金を決める場合（学童4日間/5日間）
  -- PER_FAMILY用
  includes_persons INTEGER,   -- この料金に含まれる人数（例: 2）
  max_persons      INTEGER,   -- グループ上限
  min_age_free     INTEGER,   -- この歳以下無料（例: 3）
  -- 適用条件の備考
  notes            TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0
);


-- ============================================================
--  6. program_rental_options（レンタル品）
-- ============================================================

CREATE TABLE program_rental_options (
  id          SERIAL PRIMARY KEY,
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  item_name   TEXT NOT NULL,
  price       INTEGER NOT NULL,
  notes       TEXT
);


-- ============================================================
--  7. program_schedules（開催回）
--     旧: program_schedules を拡張・置換
-- ============================================================

CREATE TABLE program_schedules (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id        UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  -- 日程
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  -- 募集状態
  status            schedule_status NOT NULL DEFAULT 'open',
  -- 定員上書き
  capacity_override INTEGER,
  -- 解散時刻の上書き（特殊月・街頭募金等）
  -- 例: {"ASOBO": "15:30", "HIMEJI_STATION": "16:00"}
  dismissal_override JSONB,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  8. schedule_locations（セッション×会場）
--     保護者が予約時に集合場所を選択するための中間テーブル
-- ============================================================

CREATE TABLE schedule_locations (
  schedule_id      UUID NOT NULL REFERENCES program_schedules(id) ON DELETE CASCADE,
  location_id     UUID NOT NULL REFERENCES locations(id),
  -- locationのデフォルト値を上書き（セッション固有の時刻）
  meeting_time    TIME,
  dismissal_time  TIME,
  PRIMARY KEY (schedule_id, location_id)
);


-- ============================================================
--  9. schedule_meals（日程別昼食）
--     複数日プログラムで日ごとに昼食スタイルが変わる場合
-- ============================================================

CREATE TABLE schedule_meals (
  id                  SERIAL PRIMARY KEY,
  program_id          UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  -- NULLは全セッション共通
  schedule_id          UUID REFERENCES program_schedules(id) ON DELETE CASCADE,
  -- NULLは全日共通ルール
  day_number          INTEGER,
  meal_style          meal_style NOT NULL,
  menu_note           TEXT,               -- '竹炊き込みご飯', 'ダッチオーブンクッキング' 等
  byo_order_available BOOLEAN NOT NULL DEFAULT FALSE  -- 弁当注文サービスあり
);


-- ============================================================
--  10. group_plans（GROUPカテゴリ固有：団体プランA/B/C/D）
-- ============================================================

CREATE TABLE group_plans (
  id              SERIAL PRIMARY KEY,
  program_id      UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  plan_code       TEXT NOT NULL,    -- 'A', 'B', 'C', 'D'
  plan_name       TEXT NOT NULL,
  season          TEXT NOT NULL CHECK (season IN ('summer', 'spring_autumn')),
  leader_included BOOLEAN NOT NULL DEFAULT FALSE,
  child_fee       INTEGER NOT NULL,
  leader_fee      INTEGER NOT NULL,
  deposit_per_person INTEGER NOT NULL DEFAULT 1000,
  fire_type       fire_type NOT NULL DEFAULT 'none',
  meal_style      meal_style NOT NULL DEFAULT 'cooking',
  meal_menu       TEXT,
  notes           TEXT,
  UNIQUE (program_id, plan_code)
);


-- ============================================================
--  11. tags & program_tags（テーマタグ）
-- ============================================================

CREATE TABLE tags (
  id              SERIAL PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  UNIQUE (organization_id, name)
);

CREATE TABLE program_tags (
  program_id  UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
  tag_id      INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (program_id, tag_id)
);


-- ============================================================
--  12. parents（保護者・顧客）  ※既存ほぼ踏襲
-- ============================================================

CREATE TABLE parents (
  id          UUID PRIMARY KEY,  -- References auth.users(id)
  name        TEXT NOT NULL,
  email       TEXT UNIQUE NOT NULL,
  phone       TEXT,
  postal_code TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 保護者 × 団体の所属（1人が複数団体を行き来できる）
CREATE TABLE parent_organizations (
  parent_id         UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  organization_id   UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  membership_type   membership_type NOT NULL DEFAULT 'general',
  membership_status membership_status NOT NULL DEFAULT 'active',
  joined_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  withdrawn_at      TIMESTAMPTZ,
  PRIMARY KEY (parent_id, organization_id)
);


-- ============================================================
--  13. children（子ども）  ※既存踏襲
-- ============================================================

CREATE TABLE children (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id   UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  birthday    DATE,
  notes       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);


-- ============================================================
--  14. reservations（予約）
--     ・child_idを予約時点で記録（既存の欠損を修正）
--     ・集合場所の選択を追加
--     ・pricing_idで料金区分を確定
-- ============================================================

CREATE TABLE reservations (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id           UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  child_id            UUID REFERENCES children(id) ON DELETE SET NULL,  -- 追加
  program_schedule_id   UUID NOT NULL REFERENCES program_schedules(id) ON DELETE CASCADE,
  selected_location_id UUID REFERENCES locations(id),  -- 集合場所選択
  pricing_id          UUID REFERENCES program_pricing(id),  -- 適用料金区分
  status              reservation_status NOT NULL DEFAULT 'pending',
  total_price         INTEGER NOT NULL DEFAULT 0,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  15. attendance（出欠）  ※既存踏襲
-- ============================================================

CREATE TABLE attendance (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
  child_id       UUID REFERENCES children(id) ON DELETE SET NULL,
  is_parent      BOOLEAN NOT NULL DEFAULT FALSE,
  planned_status attendance_planned NOT NULL DEFAULT 'attending',
  actual_status  attendance_actual,
  check_in_time  TIMESTAMPTZ,
  notes          TEXT
);


-- ============================================================
--  16. customer_surveys（アンケート）  ※既存踏襲
-- ============================================================

CREATE TABLE customer_surveys (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id       UUID REFERENCES parents(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  program_id      UUID REFERENCES programs(id),
  title           TEXT NOT NULL,
  submitted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answers         JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
--  17. インデックス
-- ============================================================

-- programs
CREATE INDEX idx_programs_org         ON programs(organization_id);
CREATE INDEX idx_programs_category    ON programs(category);
CREATE INDEX idx_programs_status      ON programs(status);

-- sessions
CREATE INDEX idx_schedules_program     ON program_schedules(program_id);
CREATE INDEX idx_schedules_start_date  ON program_schedules(start_date);
CREATE INDEX idx_schedules_status      ON program_schedules(status);

-- schedule_locations
CREATE INDEX idx_schedule_locs_schedule ON schedule_locations(schedule_id);

-- pricing
CREATE INDEX idx_pricing_program      ON program_pricing(program_id);

-- reservations
CREATE INDEX idx_reservations_parent  ON reservations(parent_id);
CREATE INDEX idx_reservations_child   ON reservations(child_id);
CREATE INDEX idx_reservations_schedule ON reservations(program_schedule_id);
CREATE INDEX idx_reservations_status  ON reservations(status);

-- attendance
CREATE INDEX idx_attendance_resv      ON attendance(reservation_id);
CREATE INDEX idx_attendance_child     ON attendance(child_id);

-- parents

-- children
CREATE INDEX idx_children_parent      ON children(parent_id);
CREATE INDEX idx_parent_orgs_parent    ON parent_organizations(parent_id);
CREATE INDEX idx_parent_orgs_org       ON parent_organizations(organization_id);

-- locations
CREATE INDEX idx_locations_org        ON locations(organization_id);

-- tags
CREATE INDEX idx_tags_org             ON tags(organization_id);


-- ============================================================
--  18. updated_at 自動更新
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER programs_updated_at
  BEFORE UPDATE ON programs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ============================================================
--  19. Row Level Security（マルチテナント）
--
--  方針:
--    - 全テーブルにRLS有効
--    - organization_idを持つテーブルはJWT claimsのorg_idと照合
--    - 保護者は自分のデータのみ読み書き可
--    - programs等のマスタは所属orgメンバーが読み取り可
-- ============================================================

ALTER TABLE organizations               ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_surcharge_rules   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_policies       ENABLE ROW LEVEL SECURITY;
ALTER TABLE cancellation_tiers          ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_pricing             ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_rental_options      ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_schedules            ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_locations           ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_meals               ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_plans                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                        ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_tags                ENABLE ROW LEVEL SECURITY;
ALTER TABLE parents                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_organizations        ENABLE ROW LEVEL SECURITY;
ALTER TABLE children                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations                ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_surveys            ENABLE ROW LEVEL SECURITY;

-- ヘルパー関数: JWTからorg_idを取得
CREATE OR REPLACE FUNCTION auth_org_id()
RETURNS UUID AS $$
  SELECT (auth.jwt() -> 'app_metadata' ->> 'organization_id')::UUID;
$$ LANGUAGE sql STABLE;

-- プログラム系: 同一orgメンバーは読み取り可
-- ============================================================
--  RLS ポリシー
--  方針:
--    個人情報なし → 誰でも読める（anon含む）
--    個人情報あり → 本人 or 管理者のみ
-- ============================================================

-- [ 公開テーブル：誰でも読める ]
CREATE POLICY "public_read_organizations"
  ON organizations FOR SELECT USING (TRUE);

CREATE POLICY "public_read_locations"
  ON locations FOR SELECT USING (TRUE);

CREATE POLICY "public_read_transport_surcharge_rules"
  ON transport_surcharge_rules FOR SELECT USING (TRUE);

CREATE POLICY "public_read_cancellation_policies"
  ON cancellation_policies FOR SELECT USING (TRUE);

CREATE POLICY "public_read_cancellation_tiers"
  ON cancellation_tiers FOR SELECT USING (TRUE);

CREATE POLICY "public_read_programs"
  ON programs FOR SELECT USING (status = 'active');

CREATE POLICY "public_read_program_pricing"
  ON program_pricing FOR SELECT USING (TRUE);

CREATE POLICY "public_read_program_rental_options"
  ON program_rental_options FOR SELECT USING (TRUE);

CREATE POLICY "public_read_program_schedules"
  ON program_schedules FOR SELECT USING (TRUE);

CREATE POLICY "public_read_schedule_locations"
  ON schedule_locations FOR SELECT USING (TRUE);

CREATE POLICY "public_read_schedule_meals"
  ON schedule_meals FOR SELECT USING (TRUE);

CREATE POLICY "public_read_group_plans"
  ON group_plans FOR SELECT USING (TRUE);

CREATE POLICY "public_read_tags"
  ON tags FOR SELECT USING (TRUE);

CREATE POLICY "public_read_program_tags"
  ON program_tags FOR SELECT USING (TRUE);

-- [ 個人情報テーブル：本人のみ読み書き ]
CREATE POLICY "parent_read_own"
  ON parents FOR SELECT USING (id = auth.uid());

CREATE POLICY "parent_update_own"
  ON parents FOR UPDATE USING (id = auth.uid());

CREATE POLICY "parent_read_own_orgs"
  ON parent_organizations FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "parent_read_own_children"
  ON children FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "parent_write_own_children"
  ON children FOR ALL USING (parent_id = auth.uid());

CREATE POLICY "parent_read_own_reservations"
  ON reservations FOR SELECT USING (parent_id = auth.uid());

CREATE POLICY "parent_insert_reservation"
  ON reservations FOR INSERT WITH CHECK (parent_id = auth.uid());

CREATE POLICY "parent_read_own_attendance"
  ON attendance FOR SELECT
  USING (
    reservation_id IN (
      SELECT id FROM reservations WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "parent_read_own_surveys"
  ON customer_surveys FOR SELECT USING (parent_id = auth.uid());

-- [ 管理者：同一org の全データを操作可 ]
CREATE POLICY "admin_all_programs"
  ON programs FOR ALL
  USING (
    organization_id = auth_org_id()
    AND auth.role() = 'authenticated'
  );


-- ============================================================
--  20. 初期データ：姫路YMCA
-- ============================================================

-- organization
INSERT INTO organizations (id, name, website) VALUES
  ('11111111-0000-0000-0000-000000000001',
   '姫路YMCA',
   'https://himeji-ymca.org');

-- locations
INSERT INTO locations
  (organization_id, code, name, address,
   default_meeting_time, default_dismissal_time,
   access_notes, transport_surcharge_base)
VALUES
  ('11111111-0000-0000-0000-000000000001',
   'ASOBO', 'YMCA太子遊びと冒険の森 ASOBO', '揖保郡太子町原白毛山921',
   '09:30', '16:30',
   'ASOBOは道が狭く車の行き違いが難しいため、全員集合後に下山。集合受付は9:10から。',
   0),

  ('11111111-0000-0000-0000-000000000001',
   'HIMEJI_STATION', '姫路駅南口ロータリー', '兵庫県姫路市駅前町',
   '08:50', '17:00',
   NULL, 1600),

  ('11111111-0000-0000-0000-000000000001',
   'HARA_HALL', '原公民館', '揖保郡太子町原1039',
   NULL, NULL,
   NULL, 0),

  ('11111111-0000-0000-0000-000000000001',
   'TAKANOTSU', 'たかのす里山キャンプ場', '宍粟市千種町鷹巣519-2',
   NULL, NULL,
   '雪キャンプ専用。往復貸切バス利用。', 0);

-- HARA_HALLの時間幅を設定（春学童・夏学童・冬学童で異なるためschedule_locationsで上書き）
UPDATE locations
  SET meeting_time_from  = '08:00',
      meeting_time_to    = '09:00',
      dismissal_time_from = '16:30',
      dismissal_time_to   = '18:30'
WHERE code = 'HARA_HALL'
  AND organization_id = '11111111-0000-0000-0000-000000000001';

-- HIMEJI_STATIONの送迎加算条件分岐
INSERT INTO transport_surcharge_rules (location_id, condition_label, amount, priority)
SELECT id, '通常月', 1600, 0 FROM locations
  WHERE code = 'HIMEJI_STATION'
    AND organization_id = '11111111-0000-0000-0000-000000000001';

INSERT INTO transport_surcharge_rules (location_id, condition_label, amount, priority)
SELECT id, '街頭募金実施月（募金非参加者）', 1000, 1 FROM locations
  WHERE code = 'HIMEJI_STATION'
    AND organization_id = '11111111-0000-0000-0000-000000000001';

INSERT INTO transport_surcharge_rules (location_id, condition_label, amount, priority)
SELECT id, '街頭募金実施月（募金参加者）', 500, 2 FROM locations
  WHERE code = 'HIMEJI_STATION'
    AND organization_id = '11111111-0000-0000-0000-000000000001';

-- キャンセルポリシー（全SEASONAL/OVERNIGHT/AFTER_SCHOOL共通）
INSERT INTO cancellation_policies (id, organization_id, name) VALUES
  ('22222222-0000-0000-0000-000000000001',
   '11111111-0000-0000-0000-000000000001',
   '標準キャンセルポリシー');

INSERT INTO cancellation_tiers
  (policy_id, days_before_min, days_before_max, rate, label, sort_order)
VALUES
  ('22222222-0000-0000-0000-000000000001', 11,   NULL, 0.00, '11日前まで：無料',           1),
  ('22222222-0000-0000-0000-000000000001',  8,   10,   0.20, '10〜8日前：費用の20%',        2),
  ('22222222-0000-0000-0000-000000000001',  2,    7,   0.30, '7〜2日前：費用の30%',         3),
  ('22222222-0000-0000-0000-000000000001',  1,    1,   0.40, '前日：費用の40%',             4),
  ('22222222-0000-0000-0000-000000000001',  0,    0,   0.50, '当日：費用の50%',             5),
  ('22222222-0000-0000-0000-000000000001', NULL, NULL, 1.00, '開始後・無断欠席：100%',      6);