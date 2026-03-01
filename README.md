# UniQdata Enterprise Portal 와이어프레임

> 양면 건강데이터 플랫폼 - 연구자/기업용 웹 포털 UI 설계

**Live Preview:** https://3mlnssaco.github.io/uniqdata-wireframes/

---

## 페이지 구성

### 1. 연구 생성 플로우 (5단계)

| 단계 | 페이지 | 설명 |
|------|--------|------|
| Step 1 | [create.html](research/create.html) | AI 연구 설계 - 자연어로 연구 목적 입력, AI가 설계 초안 생성 |
| Step 2 | [create-step2.html](research/create-step2.html) | 설계 확인 - AI 생성 설계 검토 및 수정 |
| Step 3 | [create-step3.html](research/create-step3.html) | 데이터 수집 - 수집 항목, 빈도, 기간 설정 |
| Step 4 | [create-step4.html](research/create-step4.html) | 예산 설정 - 프로젝트 지갑 생성, 참여자 보상 설정 |
| Step 5 | [create-step5.html](research/create-step5.html) | 에스크로 예치 - XRPL 에스크로 생성 및 최종 검토 |

### 2. 연구 관리

| 페이지 | 설명 |
|--------|------|
| [list.html](research/list.html) | 연구 목록 - 내 연구 현황, 필터/정렬, 빠른 액션 |
| [data-overview.html](research/data-overview.html) | 데이터 개요 - KPI, 참여자 추이, 수집률, AI 인사이트 |
| [data-table.html](research/data-table.html) | 데이터 테이블 - 스프레드시트 뷰, 필터/정렬, Export |
| [action-center.html](research/action-center.html) | **조치 센터** - 권장 조치, 알림 관리, 이력 추적 |

### 3. AI 분석

| 페이지 | 설명 |
|--------|------|
| [analysis-discovery.html](research/analysis-discovery.html) | AI 허브 - 인과발견, SHAP, What-If, 이상탐지 통합 |

### 4. 인증

| 페이지 | 설명 |
|--------|------|
| [login.html](auth/login.html) | 로그인 |
| [signup.html](auth/signup.html) ~ [signup-step6.html](auth/signup-step6.html) | 회원가입 6단계 |

### 5. 기타

| 페이지 | 설명 |
|--------|------|
| [billing.html](billing.html) | 결제/구독 관리 |
| [team.html](team.html) | 팀원 관리 |
| [erd.html](erd.html) | DB ERD 다이어그램 |

---

## 디자인 시스템

### 색상

| 용도 | 색상 |
|------|------|
| Primary | `#3b82f6` (Blue) |
| Success | `#22c55e` (Green) |
| Warning | `#f59e0b` (Amber) |
| Danger | `#ef4444` (Red) |
| Background | `#f5f5f5` |
| Sidebar | `#1a1a1a` |

### 컴포넌트

- **KPI 카드**: 핵심 지표 표시, 증감 표시
- **차트 카드**: 추이 그래프, 히트맵
- **알림 카드**: 긴급/주의/정보 3단계 색상 구분
- **액션 버튼**: Primary(파랑), Secondary(회색), Danger(빨강)

---

## UX 설계 원칙

### 모든 UI 요소는 답해야 함

```
WHAT - 뭘 보여주는가?
LOOK - 뭘 봐야 하는가?
MEAN - 그게 뭘 의미하는가?
DO   - 그래서 뭘 해야 하는가?
```

### data-intent 속성

각 요소에 의도 명시:

```html
<div class="kpi-card"
     data-intent="이탈 감지"
     data-look="활성률, 전주 대비"
     data-mean-low="<60%: 이탈 경고"
     data-action-low="리마인더 발송">
```

### 알림 기준

| 등급 | 조건 | 대응 |
|------|------|------|
| Critical | 활성률 <50%, 예산 <5% | 당일 조치 |
| Warning | 활성률 50-70%, 품질 <75% | 주간 내 |
| Info | 목표 달성, 분석 완료 | 확인 |

---

## 폴더 구조

```
uniqdata-wireframes/
├── index.html              # 전체 페이지 목록
├── research/               # 연구 관련 페이지
│   ├── create.html         # Step 1: AI 설계
│   ├── create-step2.html   # Step 2: 설계 확인
│   ├── create-step3.html   # Step 3: 데이터 수집
│   ├── create-step4.html   # Step 4: 예산
│   ├── create-step5.html   # Step 5: 에스크로
│   ├── list.html           # 연구 목록
│   ├── data-overview.html  # 데이터 개요
│   ├── data-table.html     # 데이터 테이블
│   ├── action-center.html  # 조치 센터
│   └── analysis-discovery.html  # AI 허브
├── auth/                   # 인증 페이지
│   ├── login.html
│   └── signup*.html
├── billing.html            # 결제
├── team.html               # 팀 관리
├── erd.html                # ERD
├── schema.dbml             # 통합 DB 스키마 (51 tables)
├── schema-auth.dbml        # 인증 상세 스키마
├── schema-data.dbml        # 데이터 상세 스키마
├── schema-org.dbml         # 기관 상세 스키마
├── schema-research.dbml    # 연구 상세 스키마
├── DATA_FLOWS.md           # Core-Enterprise 데이터 흐름
└── WIREFRAME_CHANGES.md    # 변경 이력
```

---

## 스키마 문서

| 파일 | 내용 |
|------|------|
| `schema.dbml` | 통합 ERD: health_db 33테이블 (4스키마) + uniqdata_db 18테이블 |
| `DATA_FLOWS.md` | Core Internal API 데이터 흐름, 3계층 ID, k-anonymity |
| `schema-auth.dbml` | 인증 상세 (참고용, schema.dbml에 통합) |
| `schema-data.dbml` | 데이터 상세 (참고용, schema.dbml에 통합) |
| `schema-org.dbml` | 기관 상세 (참고용, schema.dbml에 통합) |
| `schema-research.dbml` | 연구 상세 (참고용, schema.dbml에 통합) |

---

## 변경 이력

| 날짜 | 변경 |
|------|------|
| 2026-03-01 | schema.dbml v7: Core 4스키마 33테이블 반영, FastAPI 기준, Internal API 13개 매핑 |
| 2026-03-01 | DATA_FLOWS.md 전면 개편: Internal API 기반, 3계층 ID, k-anonymity, Linking Token |
| 2026-02-11 | action-center.html 추가, data-intent 속성 적용 |
| 2026-02-11 | 5단계 플로우로 재구성 (Step 4 AI 도구 -> AI 허브로 통합) |
| 2026-02-10 | AI 허브 통합, 프로젝트 지갑 이원화 |
| 2026-02-07 | 초기 와이어프레임 |

---

*UniQdata - 개인 건강 데이터의 새로운 가치*
