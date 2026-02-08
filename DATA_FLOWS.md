# Enterprise Portal - Data Flows

## 1. 연구자 인증 & 온보딩

### 1.1 로그인
```
accounts → account_logins → passkey_credentials
         ↓
      sessions (생성)
         ↓
      owners (조회/생성)
```

### 1.2 기관 인증
```
account_logins.email → institutions.domains (매칭)
                     ↓
               owners.institution_id (연결)
```

---

## 2. 프로젝트 관리

### 2.1 프로젝트 생성
```sql
INSERT research_projects (owner_id, institution_id, title, status='draft')
INSERT participation_criteria (project_id, age_min, age_max, conditions)
INSERT data_collection_configs (project_id, passive_data, active_data)
INSERT project_wallets (project_id, wallet_address)
```

### 2.2 팀원 초대
```sql
-- 초대
INSERT team_members (project_id, owner_id, role='pending')
-- 수락 후
UPDATE team_members SET role='researcher'
```

### 2.3 프로젝트 예산 입금
```sql
INSERT project_wallet_deposits (project_id, depositor_owner_id, amount, tx_hash)
UPDATE project_wallets SET total_deposited += amount
```

---

## 3. 참여자 모집 & 동의

### 3.1 참여 조건 매칭 (쿼리)
```sql
SELECT users.* FROM users
JOIN data_points ON users.id = data_points.user_id
WHERE
  -- participation_criteria 조건 매칭
  users.birth_date BETWEEN age_range
  AND data_points.category IN (required_categories)
  AND data_points.metric IN (required_metrics)
```

### 3.2 동의 요청 & 수락
```sql
-- 연구자 → 사용자 동의 요청
INSERT agreements (project_id, owner_id=연구자, user_id=참여자, status='pending')

-- 사용자 동의
UPDATE agreements SET status='accepted', signed_at=NOW()
INSERT consents (user_id, app_id, scopes='{health:*:read:project_duration}')

-- XRPL 앵커링
INSERT anchor_logs (user_id, anchor_type='consent_grant', tx_hash)
```

---

## 4. 데이터 조회 (핵심!)

### 4.1 프로젝트 데이터 조회 플로우
```
연구자 요청
    ↓
[권한 검증]
team_members WHERE project_id AND owner_id
    ↓
[동의 검증]
agreements WHERE project_id AND status='accepted'
consents WHERE user_id IN (동의한 유저) AND scopes MATCH requested
    ↓
[데이터 조회]
data_points WHERE user_id IN (동의한 유저)
             AND category IN (허용된 카테고리)
             AND metric IN (허용된 메트릭)
             AND timestamp BETWEEN consent.valid_from AND consent.valid_until
    ↓
[감사 로그]
INSERT audit_logs (user_id, app_id, action='read', project_id, record_count)
```

### 4.2 데이터 조회 SQL 예시
```sql
-- 프로젝트 P001의 심박수 데이터 조회
SELECT
  dp.user_id,
  dp.metric,
  dp.value,
  dp.recorded_at
FROM data_points dp
JOIN agreements ag ON dp.user_id = ag.user_id
JOIN consents c ON dp.user_id = c.user_id
WHERE
  ag.project_id = 'P001'
  AND ag.status = 'accepted'
  AND c.scopes @> '{"health:heart_rate:read"}'
  AND c.status = 'active'
  AND dp.category = 'health'
  AND dp.metric = 'heart_rate'
  AND dp.recorded_at BETWEEN c.valid_from AND c.valid_until
ORDER BY dp.user_id, dp.recorded_at;
```

### 4.3 집계 데이터 조회
```sql
-- 프로젝트 참여자 통계
SELECT
  COUNT(DISTINCT ag.user_id) as participant_count,
  AVG(EXTRACT(YEAR FROM AGE(u.birth_date))) as avg_age,
  COUNT(dp.id) as total_data_points
FROM agreements ag
JOIN users u ON ag.user_id = u.id
LEFT JOIN data_points dp ON ag.user_id = dp.user_id
WHERE ag.project_id = 'P001' AND ag.status = 'accepted'
GROUP BY ag.project_id;
```

---

## 5. AI 분석

### 5.1 분석 요청
```sql
INSERT ai_analyses (
  user_id,        -- 분석 대상 (개인) 또는 NULL (프로젝트 집계)
  project_id,     -- 프로젝트 컨텍스트 (nullable)
  app_id,         -- 요청 앱
  type='health_trend',
  status='pending',
  input={metrics: ['heart_rate', 'sleep'], period: '30d'}
)
```

### 5.2 분석 결과 저장
```sql
UPDATE ai_analyses SET
  status='completed',
  result={trends: [...], insights: [...], risk_score: 0.3}
WHERE id = 'analysis_id';

-- 피처 추출 결과 저장
INSERT features (user_id, project_id, category, feature_type, value, period_start, period_end)
VALUES
  (user_id, project_id, 'sleep', 'avg_duration', 7.2, '2025-01-01', '2025-01-31'),
  (user_id, project_id, 'sleep', 'consistency_score', 0.85, '2025-01-01', '2025-01-31');
```

---

## 6. 정산 & 보상

### 6.1 에스크로 생성
```sql
INSERT escrows (
  project_id,
  participant_user_id,
  amount=10.0,
  currency='XRP',
  status='created',
  tx_hash='...'
)
```

### 6.2 데이터 제공 완료 → 정산
```sql
-- 에스크로 해제
UPDATE escrows SET status='released', released_at=NOW()

-- 정산 기록
INSERT settlements (
  agreement_id,
  escrow_id,
  amount,
  recipient_wallet_address,
  tx_hash
)

-- 프로젝트 지갑 출금 기록
INSERT project_wallet_withdrawals (
  project_id,
  withdrawer_owner_id,
  amount,
  purpose='participant_reward',
  tx_hash
)
```

---

## 7. 감사 & 앵커링

### 7.1 모든 데이터 접근 로깅
```sql
-- 데이터 조회 시
INSERT audit_logs (
  user_id,
  app_id,
  action='read',
  category='health',
  metric='heart_rate',
  record_count=150,
  ip_address,
  timestamp
)
```

### 7.2 중요 이벤트 XRPL 앵커링
```sql
-- 동의, 에스크로, 정산 등
INSERT anchor_logs (
  user_id,
  anchor_type,  -- 'consent_grant' | 'escrow_create' | 'settlement'
  tx_hash,
  from_address,
  to_address
)
```

---

## 데이터 접근 권한 매트릭스

| 역할 | accounts | users | data_points | research_projects | agreements |
|------|----------|-------|-------------|-------------------|------------|
| 개인 유저 | 본인 | 본인 | 본인 | 참여중인 것 | 본인 동의 |
| 연구자 | 본인 | 동의한 참여자 | 동의 범위 내 | 소속 프로젝트 | 프로젝트 내 |
| 기관 관리자 | 기관 내 | - | 집계만 | 기관 내 | 기관 내 |
| 플랫폼 관리자 | 전체 | 메타만 | 집계만 | 전체 | 전체 |

---

## API 엔드포인트 → 테이블 매핑

| Endpoint | Method | Tables (R/W) |
|----------|--------|--------------|
| `/projects` | POST | research_projects(W), participation_criteria(W), project_wallets(W) |
| `/projects/:id/data` | GET | agreements(R), consents(R), data_points(R), audit_logs(W) |
| `/projects/:id/participants` | GET | agreements(R), users(R) |
| `/projects/:id/team` | POST | team_members(W) |
| `/projects/:id/deposit` | POST | project_wallet_deposits(W), anchor_logs(W) |
| `/analyses` | POST | ai_analyses(W), features(W) |
| `/settlements` | POST | escrows(W), settlements(W), anchor_logs(W) |
