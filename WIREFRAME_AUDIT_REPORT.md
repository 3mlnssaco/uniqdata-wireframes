# UniQdata 와이어프레임 종합 감사 보고서

> 작성일: 2026-02-13
> 분석 대상: wireframe HTML 31개, schema.dbml, page-spec.js, DATA_FLOWS.md, WIREFRAME_CHANGES.md

---

## 요약

전체 와이어프레임, ERD(schema.dbml), 디자이너 데이터사전(page-spec.js), 데이터플로우(DATA_FLOWS.md) 문서를 교차 검증한 결과, **심각도 높은 불일치 8건**, **구조적 문제 6건**, **페이지별 요소 타당성 이슈 12건**을 발견했습니다. 아래 세 파트로 나누어 정리합니다.

- **Part A** — 페이지 간 논리 구조 불일치 (8건)
- **Part B** — ERD ↔ 와이어프레임 정합성 (6건)
- **Part C** — 페이지별 요소 타당성 ("이게 꼭 필요한가?") (12건)

---

## Part A. 페이지 간 논리 구조 불일치

### A-1. 🔴 생성 플로우 스텝 수/명칭 불일치 (Critical)

세 문서가 서로 다른 스텝 구조를 말하고 있습니다.

| 출처 | 스텝 수 | 스텝 명칭 |
|------|---------|----------|
| **create.html** (실제 와이어프레임) | 6 | AI인터뷰 → 연구설계 → 데이터수집 → 타겟설정 → IRB심의 → 에스크로 |
| **WIREFRAME_CHANGES.md** (2/9 변경사항) | 5 | 연구설계 → 설계확인 → 데이터수집 → 예산 → 완료 |
| **page-spec.js** (데이터사전) | "Step 1/5" 표기, 그런데 create-step6 엔트리 존재 | AI인터뷰 → 설계확인 → 데이터수집 → 타겟설정 → IRB/에스크로 |

**문제점:**
- create.html의 스텝바가 6스텝을 보여주는데, WIREFRAME_CHANGES.md는 5스텝이라고 명시
- 스텝 명칭도 완전히 다름: "타겟설정" vs "예산", "IRB심의" vs "완료"
- create-step4.html이 WIREFRAME_CHANGES.md에서는 "삭제됨"이라고 했는데, 실제로는 존재하면서 다른 내용(타겟설정)이 담겨있음 → 삭제 후 다른 파일이 같은 이름으로 들어왔는지 추적 불가

**권고:** 생성 플로우 스텝 구조를 하나의 진실의 원천(single source of truth)으로 통일해야 합니다.

---

### A-2. 🔴 인증 방식 모순: 비밀번호 vs Passkey-only (Critical)

| 출처 | 인증 방식 |
|------|----------|
| **signup.html** | 7스텝 중 Step 3이 "비밀번호" 설정 |
| **schema.dbml** (users 테이블) | `password_hash` 필드 없음. passkey_credentials 테이블만 존재 |
| **DATA_FLOWS.md** | `account_logins` 테이블 참조 (존재하지 않음) |

**문제점:**
- signup.html이 비밀번호 입력 단계를 포함하지만, ERD에는 비밀번호를 저장할 곳이 없음
- 이것은 "패스키 전용 인증"을 설계했으면서 와이어프레임은 아직 비밀번호 기반으로 남아있다는 의미
- login.html에도 비밀번호 입력 필드가 있을 가능성이 높음

**권고:** signup.html의 Step 3 "비밀번호"를 제거하거나, schema.dbml에 password_hash를 추가하거나, 둘 중 하나로 정리해야 합니다.

---

### A-3. 🔴 상태(status) 값 불일치 (Critical)

| 출처 | status 값들 |
|------|-------------|
| **schema.dbml** projects.status | DRAFT, IRB_PENDING, IRB_APPROVED, RECRUITING, ACTIVE, DATA_LOCKED, ANALYSIS, COMPLETED |
| **page-spec.js** statusMap | draft, irb_submitted, irb_revision, recruiting, collecting, analyzing, completed, cancelled |

**충돌 목록:**

| page-spec.js | schema.dbml | 문제 |
|-------------|-------------|------|
| `irb_submitted` | `IRB_PENDING` | 이름 다름 (같은 의미?) |
| `irb_revision` | *(없음)* | page-spec에만 존재 |
| `collecting` | `ACTIVE` | 이름 다름 |
| *(없음)* | `IRB_APPROVED` | schema에만 존재 |
| *(없음)* | `DATA_LOCKED` | schema에만 존재 |
| `cancelled` | *(없음)* | page-spec에만 존재 |

**문제점:** 프론트엔드(page-spec.js)와 백엔드(schema.dbml)가 서로 다른 상태 값을 사용하면, 상태 뱃지가 올바르게 표시되지 않거나 API 응답을 매핑할 수 없습니다.

**권고:** schema.dbml의 값을 기준으로 page-spec.js statusMap을 맞춰야 합니다.

---

### A-4. 🟡 사이드바 네비게이션 구조 불일치 (Major)

페이지마다 사이드바 메뉴 구조가 다릅니다.

| 페이지 | 사이드바 메뉴 구조 |
|--------|-------------------|
| **list.html** | 계층형: 연구허브/새연구/내연구[개요/테이블/AI허브] + 팀/결제 |
| **irb-status.html** | 플랫: 연구허브/IRB신청/IRB현황/데이터/조치센터/AI분석/팀/지갑정산 |
| **irb-submission.html** | 플랫: 연구허브/IRB신청/IRB현황/데이터/조치센터/AI분석/팀/지갑정산 |
| **action-center.html** | 플랫: 연구허브/새연구/IRB신청/IRB현황/조치센터/AI분석/팀/결제 |
| **team.html** | 플랫: 연구허브/새연구/IRB신청/IRB현황/조치센터/팀/결제에스크로 |
| **edit.html** | 계층형: list.html과 유사 |
| **data-table.html** | 계층형: list.html과 유사 (연구별 개요/테이블/AI허브 서브메뉴) |
| **analysis-discovery.html** | 계층형: 다크모드, 연구별 서브메뉴 포함 |

**문제점:**
- 어떤 페이지는 **계층형(트리)** 사이드바, 어떤 페이지는 **플랫(일렬)** 사이드바
- 같은 메뉴도 "결제" vs "지갑/정산" vs "결제/에스크로"로 용어가 다름
- "조치 센터"가 삭제 검토 중(page-spec.js 2/11 회의)인데 대부분 페이지에 메뉴로 남아있음
- WIREFRAME_CHANGES.md에서 확정한 메뉴 구조와 실제 와이어프레임이 불일치

**권고:** WIREFRAME_CHANGES.md §2의 메뉴 구조를 기준으로 모든 와이어프레임의 사이드바를 통일해야 합니다.

---

### A-5. 🟡 IRB 플로우 vs 생성 플로우 중복/분리 모호 (Major)

| 페이지 | 내용 |
|--------|------|
| **create-step5.html** | 제목 "IRB 심의"이지만, 내용에 지갑 카드/에스크로 금액 포함 |
| **irb-submission.html** | 별도의 "IRB 심의 신청" 5스텝 플로우 (연구유형→기본정보→AI서류생성→검토수정→제출) |
| **irb-status.html** | IRB 현황 추적 대시보드 |

**문제점:**
- create-step5에서 IRB를 처리하는데, irb-submission.html이 별도의 5스텝 IRB 신청 플로우를 가지고 있음
- 연구자가 IRB를 **생성 플로우 안에서** 처리하는 건지, **별도 페이지에서** 처리하는 건지 불명확
- create-step5.html은 IRB와 에스크로를 하나에 섞어놓아서 관심사 분리가 안 됨

**권고:** IRB 신청이 생성 플로우의 일부인지, 독립 플로우인지 결정하고, 중복을 제거해야 합니다.

---

### A-6. 🟡 삭제 예정 파일이 여전히 존재 (Major)

| 파일 | 삭제 근거 | 현재 상태 |
|------|----------|----------|
| `create-step6.html` | page-spec.js: "삭제 검토 중", WIREFRAME_CHANGES.md: 5스텝으로 축소 | 파일 존재 |
| `action-center.html` | page-spec.js: "삭제 검토 중 (2/11)" | 파일 존재, 다른 페이지 사이드바에도 링크 |
| `create-step4.html` | WIREFRAME_CHANGES.md: "AI 도구 선택 삭제됨" | 파일 존재 — 하지만 다른 내용("타겟설정")이 담겨있음 |

**권고:** 삭제 결정된 파일은 즉시 제거하거나, 보존 사유를 명시해야 합니다. 특히 create-step4.html은 "삭제된 파일"과 "새로 만든 파일"이 같은 이름이라 혼란을 줍니다.

---

### A-7. 🟡 라이트모드/다크모드 불일치 (Major)

| 모드 | 해당 페이지 |
|------|------------|
| **라이트모드** (white bg) | list.html, irb-status.html, irb-submission.html, action-center.html, billing.html, team.html, research-amend.html |
| **다크모드** (dark bg) | analysis-discovery.html |
| **혼합** | data-table.html (사이드바 dark, 컨텐츠 light), data-overview.html (유사), create.html (사이드바 dark, 컨텐츠 light) |

**문제점:** 같은 플랫폼 내에서 일관된 테마가 없습니다. analysis-discovery.html만 완전 다크모드이고, 나머지는 라이트 기반인데, 연구 내부 페이지(data-table, data-overview)는 사이드바만 다크입니다.

**권고:** 디자인 시스템에서 모드를 통일하거나, 다크모드 전환이 가능한 구조라면 CSS 변수를 활용하여 일관되게 적용해야 합니다.

---

### A-8. 🟢 dashboard.html이 list.html로 리다이렉트 (Minor)

dashboard.html은 `<meta http-equiv="refresh" content="0; url=research/list.html">`로 연구 허브(list.html)로 즉시 리다이렉트합니다.

**문제점:** dashboard.html 파일 자체가 불필요합니다. index.html도 동일하게 research/list.html로 리다이렉트합니다.

**권고:** dashboard.html 삭제. 진입점은 index.html 하나로 통일.

---

## Part B. ERD ↔ 와이어프레임 정합성 검증

### B-1. 🔴 DATA_FLOWS.md 전체가 구 스키마 기반 (Critical)

DATA_FLOWS.md가 참조하는 테이블명이 schema.dbml과 **전혀 맞지 않습니다.**

| DATA_FLOWS.md가 사용하는 이름 | schema.dbml 실제 테이블 | 비고 |
|-------------------------------|------------------------|------|
| `accounts` | `users` | 이름 다름 |
| `account_logins` | `passkey_credentials` | 이름 다름 |
| `sessions` | `refresh_tokens` | 이름 다름 |
| `owners` | `enterprise_members` | 개념 다름 |
| `institutions` | `enterprises` | 이름 다름 |
| `research_projects` | `projects` | 이름 다름 |
| `team_members` | `enterprise_members` (+ 역할 기반) | 구조 다름 |
| `wallets` | `user_wallets` | 이름 다름 |
| `project_wallets` | *(존재하지 않음)* | 누락 |
| `project_wallet_deposits` | *(존재하지 않음)* | 누락 |
| `project_wallet_withdrawals` | *(존재하지 않음)* | 누락 |
| `agreements` | `participants` + `consents` | 분리됨 |
| `audit_logs` | `data_access_logs` | 이름 다름 |
| `escrows` | `settlement_batches` + XRPL tx | 구조 다름 |
| `data_collection_configs` | *(존재하지 않음)* | 누락 |

**또한 2-서버 아키텍처 위반:** DATA_FLOWS.md에서 `SELECT users.* FROM users JOIN data_points`같은 크로스-DB JOIN을 사용하고 있는데, schema.dbml은 users(health_db)와 projects(uniqdata_db)가 별도 DB이므로 직접 JOIN이 불가능합니다.

**권고:** DATA_FLOWS.md를 schema.dbml v6 기준으로 전면 재작성하거나, "더 이상 유효하지 않음" 표시를 해야 합니다.

---

### B-2. 🔴 page-spec.js의 source 필드가 구 테이블명 사용 (Critical)

page-spec.js의 dataFields.source가 참조하는 테이블명들:

| page-spec.js source | schema.dbml 실제 | 문제 |
|---------------------|-----------------|------|
| `research_projects.title` | `projects.title` | 테이블명 다름 |
| `research_projects.status` | `projects.status` | 테이블명 다름 |
| `research_projects.methodology` | *(필드 없음)* | projects에 methodology 필드 없음 |
| `research_projects.description` | *(필드 없음)* | projects에 description 필드 없음 |
| `agreements (status=active) COUNT` | `participants (status=ACTIVE)` | 테이블명 + 값 다름 |
| `data_collection_configs` | *(테이블 없음)* | 존재하지 않는 테이블 |
| `budget` | *(테이블 없음)* | 존재하지 않는 테이블 |
| `participation_criteria.age_min` | `participation_criteria.value (jsonb)` | 필드 구조 다름 (별도 필드 vs JSON) |

**권고:** page-spec.js의 모든 source 참조를 schema.dbml v6 기준으로 업데이트해야 합니다.

---

### B-3. 🔴 프로젝트 지갑(Project Wallet) 테이블 누락 (Critical)

여러 와이어프레임이 "프로젝트 지갑"을 핵심 요소로 사용하고 있습니다:

- **WIREFRAME_CHANGES.md** §3.2: 프로젝트 지갑 구조 상세 정의 (잔액, 예산, 지출)
- **data-overview.html**: 프로젝트 지갑 카드 표시
- **action-center.html**: "예산 잔액 부족" 경고 (프로젝트 지갑 잔액 기반)
- **billing.html**: 개인 지갑 ↔ 프로젝트 지갑 이체 기능
- **create-step5.html**: 에스크로 예치 (프로젝트 지갑으로)

그런데 **schema.dbml에 `project_wallets` 테이블이 없습니다.** `user_wallets`에 `wallet_type` 필드가 있어서 `USER|SERVICE|ESCROW` 값으로 구분할 수 있지만, 프로젝트와의 연결(project_id)이 없습니다.

**권고:** projects 테이블에 `escrow_wallet_address` 같은 필드를 추가하거나, 별도 `project_wallets` 테이블을 생성해야 합니다.

---

### B-4. 🟡 methodology, description 필드 누락 (Major)

page-spec.js와 create-step2.html이 참조하는 필드들이 projects 테이블에 없습니다:

| 와이어프레임에서 사용 | projects 테이블 | 상태 |
|---------------------|----------------|------|
| `methodology` (종단/횡단/코호트/환자대조) | *(없음)* | 누락 |
| `description` (연구 설명) | *(없음)* | 누락 |
| `hypothesis` (가설) | *(없음)* | 누락 |
| `duration` (연구 기간) | *(없음)* | 누락 |
| `collection_frequency` (수집 빈도) | *(없음)* | 누락 |

projects 테이블에는 title, project_type, status 등 기본 필드만 있고, 실제 연구 설계 상세 필드가 많이 빠져있습니다.

**권고:** projects 테이블에 연구 설계 관련 필드를 추가하거나, `project_details` JSON 필드로 유연하게 관리해야 합니다.

---

### B-5. 🟡 팀 관리 구조 불일치 (Major)

| 출처 | 팀 구조 |
|------|---------|
| **team.html** 와이어프레임 | 프로젝트 레벨 팀: `GET /api/v2/projects/:id/team` |
| **team.html** 역할 | Owner / Member / Viewer |
| **schema.dbml** enterprise_members | 기관 레벨: `enterprise_id + user_id + role` |
| **schema.dbml** enterprise_members.role | OWNER / PI / IRB_MEMBER / STAFF / VIEWER |

**문제점:**
- 와이어프레임은 **프로젝트 단위** 팀 관리인데, ERD는 **기관 단위** 멤버 관리
- 역할명도 다름: team.html의 "Member"는 ERD의 어떤 역할에 매핑되는지 불명확
- "PI(연구책임자)" 역할이 와이어프레임에 없음
- 프로젝트별 팀 멤버를 저장할 테이블이 ERD에 없음 (enterprise_members는 기관 레벨)

**권고:** `project_members` 테이블을 추가하거나, enterprise_members의 scope를 프로젝트 레벨까지 확장해야 합니다.

---

### B-6. 🟢 IRB 와이어프레임 ↔ ERD는 비교적 잘 맞음 (Info)

IRB 관련 페이지(irb-submission.html, irb-status.html)와 ERD(irb_submissions, irb_documents, irb_review_comments, irb_workflow_history)는 **가장 잘 정합**됩니다. 다만 irb-submission.html의 IRB 유형 선택(관찰연구/개입연구/후향적/유전체)이 irb_submissions.submission_type(INITIAL/AMENDMENT/CONTINUING_REVIEW/CLOSURE)과 개념이 달라서, 연구 유형은 projects.project_type에 저장되어야 합니다.

---

## Part C. 페이지별 요소 타당성 검토 ("이게 꼭 필요한가?")

### C-1. create.html (AI 인터뷰 — Step 1)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| AI 채팅 인터페이스 | 핵심 | ✅ 유지 | 연구 생성의 핵심 기능 |
| 우측 Report 패널 (PubMed RAG) | 과도 | ⚠️ 재검토 | Step 1에서 PubMed 검색 결과를 보여줄 필요가 있는가? 아직 연구 방향도 안 정해졌는데 선행연구를 보여주는 건 시기상조. Step 2 이후로 이동 권고 |
| 좌측 "임시저장" + "내 연구" 목록 | 부가 | ⚠️ 재검토 | 생성 중에 다른 연구 목록을 보여줄 필요는 낮음. 자동저장 기능만 유지하고, 연구 목록은 사이드바 네비게이션으로 대체 가능 |
| 7개 진행 아이콘 (주제/대상/개입 등) | 좋음 | ✅ 유지 | AI 대화의 진행도를 보여주는 좋은 UX |

---

### C-2. create-step2.html (연구 설계 확인)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| AI 생성 필드 (보라색 테두리) | 핵심 | ✅ 유지 | AI가 채운 값과 사용자 입력을 구분하는 좋은 시각적 처리 |
| Report 버튼 | 중복 의심 | ⚠️ 재검토 | Step 1에서 이미 Report를 보여주고, Step 2에서도 또 보여주면 정보 과잉. Step 2는 폼 편집에 집중해야 함 |

---

### C-3. create-step3.html (데이터 수집 설정)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 패시브/액티브/바이오마커 분류 토글 | 핵심 | ✅ 유지 | 데이터 수집 항목 선택의 핵심 UI |
| EMA 설정 섹션 | 전문적 | ⚠️ 재검토 | EMA(Ecological Momentary Assessment)는 모든 연구에 필요한 건 아님. 조건부로 표시하거나, 고급 옵션으로 접어두는 게 적절 |

---

### C-4. create-step4.html (타겟 설정)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 참여 기준 설정 | 핵심 | ✅ 유지 | 참여자 매칭에 필수 |
| **파일명 자체** | 혼란 | 🔴 변경 필요 | WIREFRAME_CHANGES.md에서 "create-step4.html 삭제(AI 도구 선택)"라고 했는데, 같은 파일명으로 다른 내용이 들어와서 혼란. 파일명 변경이나 변경 이력 명시 필요 |

---

### C-5. create-step5.html (IRB 심의 + 에스크로)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| IRB 심의 내용 | 핵심 | ✅ 유지 | 연구 생성 시 IRB 처리 필수 |
| 에스크로/지갑 카드 | 핵심이지만 혼합 | ⚠️ 분리 권고 | IRB 심의와 에스크로 예치를 하나의 페이지에 넣으면 관심사 혼합. 또한 irb-submission.html과 중복됨. 에스크로는 별도 스텝으로 분리하거나, IRB 승인 후에만 활성화되는 구조가 논리적 |
| XRPL 정보 섹션 | 부가 | ⚠️ 재검토 | 일반 연구자에게 XRPL 기술 세부사항은 불필요. "안전하게 블록체인에 기록됩니다" 정도의 메시지로 축약 권고 |

---

### C-6. create-step6.html (에스크로 + 모집 실행)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| **전체 페이지** | 삭제 대상 | 🔴 삭제 | page-spec.js에서 "삭제 검토 중"으로 표시됨. WIREFRAME_CHANGES.md도 5스텝 플로우를 확정함. 이 페이지의 에스크로 기능은 step5에 통합되었거나 별도 처리되어야 함 |

---

### C-7. action-center.html (조치 센터)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 긴급/주의/정보 3단계 알림 요약 | 좋은 설계 | ✅ 유지 (단, 통합 고려) | 연구 운영 시 조치가 필요한 사항을 모아보는 건 유용 |
| 참여자 이탈 경고 | 핵심 | ✅ 유지 | 이것이 조치 센터의 핵심 가치 |
| 예산 잔액 부족 경고 | 핵심 | ✅ 유지 | 연구 중단 방지에 필수 |
| **독립 페이지 존재** | 재검토 필요 | ⚠️ page-spec.js에서 삭제 검토 중 | 이 기능들을 개요(data-overview.html)에 알림 배너로 통합하는 것도 방법. 별도 페이지까지 필요한지는 연구 수가 많아졌을 때 판단 |

---

### C-8. data-table.html (데이터 테이블 뷰)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 날짜별/참여자별 뷰 토글 | 핵심 | ✅ 유지 | 데이터 조회의 두 축 |
| 기간별(일/주/월) 토글 | 좋음 | ✅ 유지 | 데이터 집계 단위 조절에 유용 |
| 컬럼 우선순위 범례 (P1/P2/P3) | 과도 | ⚠️ 재검토 | P1/P2/P3 라벨은 개발자 관점이지, 연구자에게는 의미 약함. 연구자가 보기엔 모든 데이터가 중요하거나, 중요도는 연구마다 다름 |
| AI 에이전트 패널 (우측) | 좋지만 문맥 의존 | ⚠️ 재검토 | data-table에서 AI 대화를 하면서 데이터를 봐야 하는 시나리오가 얼마나 빈번한지. AI 허브(analysis-discovery)로 이동 후 분석하는 게 더 자연스러울 수 있음 |

---

### C-9. data-overview.html (연구 개요)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| KPI 그리드 (4열) | 핵심 | ✅ 유지 | 연구 건강 상태의 핵심 지표 |
| 실험군/대조군 비교 + p-value | 전문적 | ✅ 유지 | RCT 연구에 필수. 단, 관찰 연구에서는 불필요할 수 있으므로 연구 유형별 조건부 표시 권고 |
| 프로젝트 지갑 카드 | 핵심 | ✅ 유지 | WIREFRAME_CHANGES.md에서 추가 확정된 요소 |

---

### C-10. analysis-discovery.html (AI 허브 — 인과 구조 발견)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 3D 그래프 시각화 | 인상적이지만 실용성 의문 | ⚠️ 재검토 | 3D 인과관계 그래프는 시각적으로 임팩트 있지만, 실제 연구자가 3D로 회전하며 분석하는 시나리오는 드뭄. 2D 네트워크 그래프가 더 실용적일 수 있음. 3D는 옵션으로 제공하고, 기본은 2D를 권고 |
| 좌측 알고리즘 선택 패널 (PC/FCI/GES 등) | 전문적 | ⚠️ 재검토 | 통계 비전문 연구자에게는 알고리즘 선택이 부담. AI가 자동 추천하고, 고급 사용자만 수동 선택할 수 있는 구조가 적절 |
| Threshold 슬라이더 | 전문적 | ⚠️ 재검토 | 위와 동일. 기본값을 AI가 설정하고, 필요시 조절 |
| 우측 AI 에이전트 패널 | 핵심 | ✅ 유지 | AI 분석 도구에서 AI 에이전트 대화는 핵심 UX |

---

### C-11. billing.html (결제/에스크로)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 개인 지갑 카드 (잔액, 주소) | 핵심 | ✅ 유지 | 자금 관리의 핵심 |
| 4개 액션 버튼 그리드 | 적절 | ✅ 유지 | 입금/출금/이체/검증의 주요 액션 |
| XRPL 주소 + 상태 표시 | 부가 | ⚠️ 재검토 | 일반 연구자에게 XRPL 주소(rXXX...)는 의미 없음. "지갑 연결됨 ✓" 수준으로 축약 가능 |
| 출금이체 탭 | 삭제 대상 | 🔴 삭제 확인 | WIREFRAME_CHANGES.md §3.3에서 "출금이체 탭 제거" 확정. 팝업으로 대체 |

---

### C-12. research-amend.html (연구 수정 — IRB 변경심의)

| 요소 | 필요? | 판정 | 이유 |
|------|-------|------|------|
| 변경 전/후 diff 테이블 | 핵심 | ✅ 유지 | 변경 내용을 명확히 보여주는 좋은 UX |
| AI 변경심의 판정 (간이/본 심사) | 핵심 | ✅ 유지 | IRB 변경심의 유형 자동 분류는 차별화 기능 |
| 추가 에스크로 섹션 | 조건부 | ⚠️ 재검토 | 예산 변경이 있는 수정만 해당. 모든 수정에 보여줄 필요 없음 |
| AI 서류 자동 생성 | 핵심 | ✅ 유지 | 변경 사유서 자동 작성은 핵심 가치 |

---

## 종합 우선순위 액션 아이템

### 🔴 즉시 해결 (Critical — 개발 진행 전 필수)

1. **생성 플로우 스텝 구조 확정** — create.html, page-spec.js, WIREFRAME_CHANGES.md 통일
2. **인증 방식 확정** — 비밀번호 vs 패스키 전용, signup.html 업데이트
3. **상태(status) 값 통일** — schema.dbml 기준으로 page-spec.js 업데이트
4. **DATA_FLOWS.md 폐기/재작성** — 현재 schema.dbml과 100% 불일치
5. **page-spec.js source 필드 업데이트** — 구 테이블명 → schema.dbml v6 테이블명
6. **project_wallets 테이블 또는 대안 ERD 추가** — 와이어프레임의 핵심 기능인데 ERD에 없음

### 🟡 단기 해결 (Major — 디자인 확정 전)

7. **사이드바 네비게이션 통일** — WIREFRAME_CHANGES.md 메뉴 구조 기준
8. **IRB 플로우 결정** — 생성 플로우 내부 vs 독립 페이지
9. **삭제 예정 파일 처리** — create-step6.html, action-center.html
10. **projects 테이블에 연구설계 필드 추가** — methodology, description, hypothesis 등
11. **팀 관리 구조 결정** — 프로젝트 레벨 vs 기관 레벨
12. **라이트/다크 모드 통일**

### 🟢 개선 사항 (Minor — 점진적)

13. dashboard.html 삭제 (리다이렉트만 하는 파일)
14. AI 허브 3D 그래프 → 2D 기본 + 3D 옵션
15. XRPL 기술 정보 일반 사용자에게 축약
16. 알고리즘 선택 UI → AI 자동 추천 + 수동 선택 옵션
