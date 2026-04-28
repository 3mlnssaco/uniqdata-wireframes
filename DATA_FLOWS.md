# UniQLab Workspace - Data Flows

> 2026-03-01 업데이트 | Core v2.6.0 기준

UniQLab Backend(Spring Boot)은 Core 서버(FastAPI)와 **Internal API**로 통신.
직접 DB JOIN 불가 — 모든 환자 데이터는 Core Internal API를 통해서만 접근.

---

## ID 체계 (3계층 분리)

```
Layer 1: wallet_address      → Core core_auth에만 존재 (UniQLab Backend 접근 불가)
Layer 2: person_id (UUID)    → Core uq_cdm에만 존재 (UniQLab Backend 접근 불가)
Layer 3: participant_number  → UniQLab Backend가 보는 유일한 식별자
```

UniQLab Backend는 `participant_number`만 취급. `person_id`, `wallet_address`는 절대 전달되지 않음.

---

## 1. 연구자 인증

UniQLab Backend 자체 인증 (Spring Boot).
Core 인증과 별개 — 환자 인증은 Core가 담당.

```
research.institution
    → institution_member (role: PI, RESEARCHER, IRB_MEMBER)
    → institution_wallet (기관 지갑)
```

---

## 2. 프로젝트 생성 (5-Step Flow)

### Step 1: AI 연구 설계
```
연구자 자연어 입력 → AI 설계 초안 생성
    ↓
research.project (status='draft')
research.project_design (irb_content JSONB)
```

### Step 2: 설계 확인
```
project_design.irb_content 검토/수정
    ↓
research.project_data_requirement (concept_id 매핑, 수집 항목)
research.project_eligibility (자동 매칭 조건)
```

### Step 3: 데이터 수집 설정
```
project_data_requirement — 수집 항목, 빈도, 기간
project_milestone — V1~V6 방문 일정, 분석 기점
```

### Step 4: 예산 설정
```
[Core Internal API 호출]
POST /internal/escrow/create
    → Core가 프로젝트 지갑 생성, 시드 KMS 암호화
    → wallet_address 반환

research.project_wallet (wallet_address, budget_total)
research.project_budget (항목별 예산 배분)
```

### Step 5: 에스크로 예치
```
연구자 개인지갑 → 프로젝트지갑 이체 (XRPL)
project.status = 'funded' → 'recruiting'
```

---

## 3. 참여자 매칭

### 3.1 적격 대상자 추정
```
[UniQLab Backend → Core Internal API]
POST /internal/matching/estimate
Headers: X-Service-Auth: {service_token}
Body: {
    project_id: UUID,
    eligibility: [
        { concept_id: 3004249, operator: "gte", value: 7.0 },
        { concept_id: 3027018, operator: "between", value: [130, 180] }
    ]
}
Response: { estimated_count: 42 }
```
- person_id 미포함, 건수만 반환

### 3.2 모집 알림 발송
```
POST /internal/matching/recruit
Body: { project_id, eligibility, max_recruit: 100 }
Response: { notified_count: 38 }
```
- Core가 앱 푸시 발송, UniQLab Backend는 발송 건수만 수신

---

## 4. 참여자 동의 (Linking Token)

### 4.1 토큰 발급 → 카트 → 동의 요청 → 등록

```
환자 앱에서 토큰 발급 (8자리 코드)
    ↓
연구자가 토큰 코드 입력
    ↓
[UniQLab Backend → Core]
POST /internal/token/preview
Body: { token_codes: ["AB12CD34"] }
Response: { tokens: [{ code, gender_hint: "M", age_range: "30-39", status }] }
    ↓
POST /internal/token/cart
Body: { token_codes: ["AB12CD34"], project_id }
Response: { carted: 1, failed: 0 }
    ↓
POST /internal/token/send-consent
Body: { project_id }
Response: { sent_count: 12 }
```

### 4.2 환자 동의 후 등록
```
환자 앱에서 동의 승인
    ↓
[Core → UniQLab Backend 푸시]
POST /api/uniqlab/project/{id}/participant
Headers: X-Service-Auth: {token}
Body: {
    participant_number: "P001",
    enrolled_at: "2026-03-01T00:00:00Z"
}
```
- `person_id` 없음 — `participant_number`만 전달

### 4.3 토큰 상태 흐름
```
active → carted → pending_consent → enrolled
                                   → declined
                                   → expired (30일 TTL)
                                   → revoked
```

---

## 5. 데이터 조회 (Tier1 Safe Queries)

UniQLab Backend는 원시 데이터에 직접 접근 불가.
Core Internal API가 **k-anonymous 집계 데이터**만 반환.

### 5.1 개요 (그래프용)
```
POST /internal/tier1/overview
Body: {
    project_id, concept_ids: [3004249, 3027018],
    time_bucket: "week", date_from, date_to
}
Response: {
    buckets: [
        { period: "2026-W09", concept_id: 3004249,
          count: 156, mean: 6.8, std: 0.9, min: 4.2, max: 12.1 }
    ]
}
```
- 개인별 값 없음, 시간 구간 집계만

### 5.2 테이블 (참여자별 요약)
```
POST /internal/tier1/table
Body: { project_id, concept_ids, date_from, date_to }
Response: {
    rows: [
        { participant_number: "P001", concept_id: 3004249,
          count: 84, mean: 7.1, latest: 6.9, trend: "improving" }
    ]
}
```
- `person_id` 없음 — `participant_number`만 사용

### 5.3 분포 (히스토그램)
```
POST /internal/tier1/distribution
Body: { project_id, concept_id: 3004249, bin_count: 10 }
Response: {
    bins: [
        { range_low: 4.0, range_high: 5.0, count: 12 },
        { range_low: 5.0, range_high: 6.0, count: 0 }  ← k-익명성 미달 시 0 처리
    ],
    suppressed_count: 3
}
```
- **k-anonymity:** 버킷 내 참여자 수 < k (기본 5) → count = 0으로 마스킹

### 5.4 토큰 → participant_number 변환
```
POST /internal/token/resolve
Body: { token_codes: ["AB12CD34", "EF56GH78"] }
Response: {
    resolved: [
        { token_code: "AB12CD34", participant_number: "P001", status: "enrolled" }
    ]
}
```

---

## 6. 데이터 수신 (Core → UniQLab Backend 푸시)

### 6.1 데이터 전송
```
[Core → UniQLab Backend]
POST /api/uniqlab/project/{id}/dataset
Headers: X-Service-Auth: {token}
Body: {
    participant_number: "P001",
    records: [
        { concept_id: 3004249, value: 6.8, occurred_at: "...", unit: "%" }
    ]
}
```
- 원시값이 아닌 비식별 데이터
- `person_id`, `wallet_address` 절대 미포함

### 6.2 동의 철회 (삭제)
```
[Core → UniQLab Backend]
DELETE /api/uniqlab/project/{id}/participant/{participant_number}
Headers: X-Service-Auth: {token}
```
- UniQLab Backend는 해당 참여자 데이터 즉시 삭제

### 6.3 회원 탈퇴
```
[Core → UniQLab Backend]
POST /api/uniqlab/project/internal/push/withdrawal
Headers: X-Service-Auth: {token}
Body: { participant_numbers: ["P001", "P003"] }
```
- 해당 참여자의 모든 프로젝트 데이터 삭제

---

## 7. 정산 & 보상 (XRPL)

### 7.1 에스크로 생성
```
POST /internal/escrow/create
Body: { project_id, amount_xrp: 1000 }
Response: { wallet_address: "rPrj...", escrow_id, tx_hash }
```
- Core가 프로젝트 지갑 생성, 시드를 KMS로 암호화

### 7.2 참여자 보상
```
POST /internal/escrow/release
Body: {
    project_id,
    payments: [
        { participant_number: "P001", amount_xrp: 10.0 }
    ]
}
Response: {
    released: [{ participant_number: "P001", tx_hash: "..." }]
}
```
- Core가 participant_number → person_id → wallet_address 역매핑 후 지급

### 7.3 프로젝트 종료 정산
```
POST /internal/escrow/finalize
Body: { project_id }
Response: { platform_fee: 50.0, refund: 150.0, tx_hashes: [...] }
```
- 플랫폼 수수료 차감 + 잔액 연구자 환불

---

## 8. 감사 & 앵커링

### Core 측
- `anchor_log` — XRPL 앵커링 (동의, 데이터 접근, 지갑 바인딩)
- `audit_log` — 모든 데이터 접근 기록 (READ/WRITE/DELETE/EXPORT)
- `data_anchor_batch` — Merkle tree 배치 앵커링

### UniQLab Backend 측
- `webhook_events` — Core 수신 이벤트 기록
- `project_wallet_transactions` — XRPL 입출금 내역

---

## 9. 데이터 접근 권한

| 역할 | Core 데이터 | UniQLab 데이터 | 식별자 |
|------|------------|-------------------|--------|
| 환자 (앱) | 본인 전체 | - | person_id |
| 연구자 | Tier1 집계만 (Internal API) | 소속 프로젝트 | participant_number |
| 기관 PI | Tier1 집계만 (Internal API) | 기관 내 프로젝트 | participant_number |
| 플랫폼 관리자 | Core Admin API | 전체 | - |

---

## 10. Internal API 엔드포인트 요약

| Method | Path | 용도 |
|--------|------|------|
| POST | `/internal/matching/estimate` | 적격 대상자 수 추정 |
| POST | `/internal/matching/recruit` | 모집 알림 발송 |
| POST | `/internal/tier1/overview` | 시계열 집계 (그래프) |
| POST | `/internal/tier1/table` | 참여자별 요약 (테이블) |
| POST | `/internal/tier1/distribution` | 값 분포 (히스토그램) |
| POST | `/internal/token/preview` | 토큰 미리보기 (성별/연령 힌트) |
| POST | `/internal/token/cart` | 토큰 카트 추가 |
| POST | `/internal/token/send-consent` | 동의 요청 발송 |
| POST | `/internal/token/resolve` | 토큰→participant_number 변환 |
| POST | `/internal/escrow/create` | 프로젝트 지갑 생성 |
| POST | `/internal/escrow/release` | 참여자 보상 지급 |
| POST | `/internal/escrow/finalize` | 프로젝트 종료 정산 |
| GET | `/internal/health` | 헬스체크 |

모든 Internal API 호출에 `X-Service-Auth` 헤더 필수.

---

## 11. Core 아웃바운드 (Core → UniQLab Backend 푸시)

| Method | Path | 용도 |
|--------|------|------|
| POST | `/api/uniqlab/project/{id}/participant` | 참여자 등록 알림 |
| POST | `/api/uniqlab/project/{id}/dataset` | 데이터 전송 |
| DELETE | `/api/uniqlab/project/{id}/participant/{number}` | 동의 철회 |
| POST | `/api/uniqlab/project/internal/push/withdrawal` | 회원 탈퇴 |

모든 아웃바운드에 `X-Service-Auth` 헤더 포함. 실패 시 non-fatal (Core 로그만 기록).
