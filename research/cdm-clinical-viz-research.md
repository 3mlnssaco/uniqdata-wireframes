# CDM 표준 및 임상 데이터 시각화 리서치

> **작성일:** 2026년 2월 16일
> **목적:** UniQdata 플랫폼 v11 설계를 위한 기술 리서치 — CDM 데이터 표준, 임상 데이터 시각화 베스트 프랙티스, 관련 도구/플랫폼 조사
> **활용:** v11 아키텍처 결정의 근거 자료, 향후 기술 스택 선정 시 참고

---

## 1. OHDSI CDM (Common Data Model) 아키텍처

### 1.1 개요

OHDSI(Observational Health Data Sciences and Informatics)가 관리하는 오픈소스 데이터 모델. 전 세계 병원·보험·연구기관의 관찰 건강 데이터를 **동일한 구조**로 표준화하여, 기관 간 페더레이션 분석을 가능하게 하는 것이 핵심 목표.

- **현재 버전:** v5.4
- **테이블 수:** 39개 (6개 임상 + 참조 + 건강시스템 + 파생결과 등)
- **핵심 원칙:** Person-centric — 모든 이벤트가 `person_id`를 중심으로 연결
- **공식 사이트:** https://ohdsi.github.io/CommonDataModel/

### 1.2 핵심 통일 패턴

CDM의 가장 중요한 설계 철학은 **모든 임상 이벤트를 동일한 구조로 통일**한다는 점:

```
[모든 이벤트] = person_id + concept_id + datetime + value + unit_concept_id
```

이 패턴 덕분에 혈압 측정, 약물 투여, 진단, 시술 등 이질적인 데이터가 **동일한 쿼리 패턴**으로 조회 가능.

### 1.3 6대 임상 테이블

| CDM 테이블 | 저장 대상 | 예시 데이터 | 주요 필드 |
|-----------|---------|-----------|---------|
| `measurement` | 수치 검사/측정 | 혈압, 혈당, ANC, SpO₂, 체중, 검사결과 | value_as_number, unit_concept_id, range_low, range_high |
| `observation` | 비수치 관찰 | 기분, 피부상태, 생활습관, 사회력 | value_as_string, value_as_concept_id |
| `drug_exposure` | 약물 투여 | 투여량, 복용기간, 경로 | quantity, days_supply, route_concept_id |
| `condition_occurrence` | 진단/증상 | ICD 진단코드, 부작용 | condition_status_concept_id |
| `procedure_occurrence` | 시술/수술 | 수술 여부, 검사 수행 | modifier_concept_id, quantity |
| `device_exposure` | 기기 데이터 | 웨어러블, CGM, 활동량계 | unique_device_id, quantity |

**UniQdata 시사점:** 우리 `metrics` 정의에 `domain` 필드를 추가하면 이 6개 테이블과 1:1 대응 가능. 시나리오 전환 시 어떤 domain 조합이 필요한지 자동 결정됨.

### 1.4 시간 구조 — 3계층 체계

CDM은 시간을 3단계로 관리:

```
observation_period (전체 관찰 기간)
  └─ visit_occurrence (방문 단위)
       └─ visit_detail (방문 내 세부 — ICU 이동, 병동 전환 등)
```

- 모든 임상 이벤트는 반드시 `observation_period` 내에 존재해야 함
- `visit_occurrence`는 외래/입원/응급 등 방문 유형 구분
- `visit_detail`은 입원 중 병동 이동 같은 세밀한 추적

**UniQdata 시사점:** v10의 `points[]` 배열이 사실상 `visit_occurrence` 패턴. `epoch`(baseline/treatment/follow-up)은 CDM의 `observation_period` 세분화와 유사. 이 매핑을 명시적으로 해두면 실제 CDM 데이터 연동 시 변환 비용 최소화.

---

## 2. CDM Concept ID 체계 — 어휘 표준화

### 2.1 Concept 시스템 개요

CDM의 핵심 강점은 **111개 의학 어휘(vocabulary)**를 하나의 `concept_id`로 통일하는 매핑 시스템.

### 2.2 주요 어휘 매핑

| 원본 어휘 | 용도 | 매핑 대상 | 예시 |
|-----------|------|---------|------|
| **ICD-10** | 진단코드 | → SNOMED CT | "E11.9" (2형 당뇨) → SNOMED concept_id |
| **LOINC** | 검사항목 | → measurement_concept_id | "2951-2" (나트륨 검사) → LOINC concept |
| **RxNorm** | 약물명 | → drug_concept_id | "metformin 500mg" → RxNorm concept |
| **SNOMED CT** | 임상용어 | 표준 대상 어휘 | 질환, 증상, 소견 등 포괄 |
| **CPT/HCPCS** | 시술코드 | → procedure_concept_id | 수술, 검사 코드 |

### 2.3 매핑 메커니즘

```
SOURCE_TO_CONCEPT_MAP 테이블:
  source_code (원본 코드) → source_concept_id → standard_concept_id
```

- 각 기관의 로컬 코드가 다르더라도, CDM 변환 시 동일한 standard_concept_id로 매핑
- 이를 통해 기관 간 데이터가 동일한 개념으로 쿼리 가능

### 2.4 Concept 계층 구조

Concept은 부모-자식 관계로 계층화:

```
예시: Diabetes mellitus (상위)
  ├─ Type 1 diabetes mellitus
  ├─ Type 2 diabetes mellitus
  │    ├─ Type 2 diabetes with neuropathy
  │    └─ Type 2 diabetes with nephropathy
  └─ Gestational diabetes
```

이 계층 덕분에 "당뇨" 검색 시 모든 하위 유형이 자동 포함됨.

**UniQdata 시사점:** 현재 `k:'wt'` 같은 임의 키 대신 `concept_hint: 'body_weight'`로 표준 코드 참조를 남겨두면, 나중에 실제 CDM 데이터 연동 시 매핑 비용이 거의 없어짐.

---

## 3. OHDSI 분석 도구 생태계

### 3.1 ATLAS — 코호트 정의 및 특성 분석

- **종류:** 오픈소스 웹 애플리케이션
- **주요 기능:**
  - 코호트 정의 (포함/제외 기준 설정)
  - 코호트 특성 분석 (Characterization)
  - 발생률/유병률 추정 (Incidence/Prevalence)
  - 인과 효과 추정 (Causal Effect Estimation)
  - 환자 수준 예측 (Patient-Level Prediction)
- **UI 특징:** 드래그앤드롭 기반 코호트 빌더, SQL 작성 불필요
- **사용 현황:** FEEDER-NET을 포함한 전 세계 CDM 네트워크에서 표준 도구로 사용
- **GitHub:** https://github.com/OHDSI/Atlas

**UniQdata 시사점:** Retrospective 연구의 Action Center에서 "코호트 분류" 기능은 ATLAS의 간소화 버전을 참고할 수 있음.

### 3.2 ACHILLES — 데이터베이스 프로파일링

- **종류:** R 패키지 + 웹 뷰어
- **주요 기능:**
  - CDM 데이터베이스의 **170개+ 기술 통계** 자동 계산
  - 데이터 품질 지표 (completeness, plausibility, conformance)
  - 인구통계, 진단 분포, 약물 사용 패턴 등 시각화
- **의의:** CDM 데이터의 "건강 검진" — ETL 후 데이터 품질 검증에 필수
- **GitHub:** https://github.com/OHDSI/Achilles

### 3.3 ARES — 데이터 품질 대시보드

- **종류:** 웹 대시보드
- **주요 기능:**
  - ACHILLES 결과를 기반으로 인터랙티브 시각화
  - 데이터 품질 문제 자동 탐지 및 보고
  - CDM 준수도(conformance) 점수 산출
- **의의:** 연구자에게 "이 데이터를 믿어도 되는가?"에 대한 근거 제공

### 3.4 Data Quality Dashboard (DQD)

- CDM 데이터에 대해 **3,400개+ 데이터 품질 체크** 자동 수행
- 체크 카테고리: Completeness, Conformance, Plausibility
- 결과를 pass/fail/warning으로 분류

**UniQdata 시사점:** 데이터 업로드 시 자동 품질 검증 → "데이터 신뢰도 뱃지" 형태로 UI에 반영 가능.

---

## 4. MIMIC 데이터셋 및 CDM ETL

### 4.1 MIMIC 개요

- **정식명칭:** Medical Information Mart for Intensive Care
- **출처:** MIT Lab for Computational Physiology + Beth Israel Deaconess Medical Center
- **규모:** 약 40,000+ ICU 환자, 2001-2019
- **데이터 종류:** 인구통계, 활력징후, 검사결과, 약물, 시술, 진단, 간호기록 등
- **접근:** PhysioNet 계정 + CITI 교육 이수 후 무료 접근 가능

### 4.2 MIMIC → CDM 변환 (ETL)

- **공식 ETL:** OHDSI에서 MIMIC-IV → CDM v5.3.3.1 ETL 파이프라인 공개
- **매핑 특이사항:**
  - MIMIC의 `chartevents` → CDM `measurement` 테이블
  - MIMIC의 `prescriptions` → CDM `drug_exposure` 테이블
  - MIMIC의 `diagnoses_icd` → CDM `condition_occurrence` 테이블
  - MIMIC의 `procedures_icd` → CDM `procedure_occurrence` 테이블
- **GitHub:** https://github.com/OHDSI/ETL-Synthea (참고 구조)

### 4.3 개발 활용 가치

- **데모 데이터:** MIMIC을 CDM으로 변환하면 실제 임상 데이터와 유사한 구조의 테스트 데이터 확보
- **시각화 검증:** 다양한 데이터 타입(활력징후, 검사, 약물, 진단)이 동시에 존재하여 범용 시각화 테스트에 최적
- **2차 인터뷰 참고:** 연구자가 "MIMIC 데이터셋 보시면 도움이 될 것" 직접 언급

---

## 5. CDISC SDTM/ADaM — 임상시험 데이터 표준

### 5.1 CDISC 표준 체계

CDM이 **관찰 연구(Retrospective)** 표준이라면, **CDISC는 임상시험(Prospective)** 표준.

```
데이터 수집 → CDASH (수집 표준)
           → SDTM (제출 표준)
           → ADaM (분석 표준)
           → Define-XML (메타데이터)
```

### 5.2 SDTM (Study Data Tabulation Model)

- **용도:** 임상시험 원시 데이터의 표준화된 형식 (FDA/PMDA 규제 제출 필수)
- **구조:** 도메인 기반 — 각 데이터 유형별 테이블

| SDTM 도메인 | 약어 | 내용 | CDM 대응 |
|------------|------|------|---------|
| Demographics | DM | 인구통계 | person |
| Vital Signs | VS | 활력징후 | measurement |
| Laboratory | LB | 검사결과 | measurement |
| Adverse Events | AE | 부작용 | condition_occurrence |
| Concomitant Medications | CM | 병용약물 | drug_exposure |
| Exposure | EX | 시험약 투여 | drug_exposure |
| Medical History | MH | 과거력 | condition_occurrence |
| Procedures | PR | 시술 | procedure_occurrence |

### 5.3 ADaM (Analysis Data Model)

- **용도:** SDTM에서 파생된 분석용 데이터셋
- **핵심 변수 규칙:**

| ADaM 변수 | 의미 | 계산 | UniQdata 대응 |
|-----------|------|------|-------------|
| `AVAL` | Analysis Value | 현재 분석 값 | 테이블 셀의 현재값 |
| `BASE` | Baseline Value | 기저치 (첫 방문) | `arr[0]` (첫 시점 데이터) |
| `CHG` | Change from Baseline | AVAL - BASE | 테이블의 Δ(delta) 값 |
| `PCHG` | Percent Change | (CHG / BASE) × 100 | 변화율(%) |
| `PARCAT1` | Parameter Category 1 | 파라미터 분류 | `priority` 필드 |
| `PARAM` | Parameter | 측정 항목명 | `name` 필드 |
| `PARAMCD` | Parameter Code | 항목 코드 | `k` 필드 |

### 5.4 UniQdata 활용 방안

- v10 테이블의 Δ(delta) 계산이 사실상 ADaM의 `CHG` 패턴과 동일
- `priority` 필드의 `primary/secondary/exploratory`는 ADaM의 `PARCAT1` 분류 체계와 일치
- SDTM 도메인과 CDM 테이블이 유사한 구조 → 우리 `domain` 필드가 양쪽 모두에 호환

---

## 6. FHIR vs. CDM — 비교 및 하이브리드 전략

### 6.1 비교 테이블

| 비교 항목 | FHIR (HL7) | CDM (OHDSI) |
|---------|-----------|-----------|
| **주요 용도** | 실시간 데이터 교환 (EHR ↔ 앱) | 연구용 데이터 분석 |
| **데이터 모델** | Resource 기반 (Patient, Observation 등) | 테이블 기반 (person, measurement 등) |
| **쿼리** | RESTful API | SQL |
| **표준화 수준** | 유연 (프로파일로 커스텀) | 엄격 (스키마 고정) |
| **실시간 지원** | ✅ 실시간 API | ❌ 배치 ETL |
| **연구 분석** | ⚠️ 미최적화 | ✅ 코호트 정의, 통계 분석에 최적 |
| **페더레이션** | ⚠️ 기관별 프로파일 차이 | ✅ 동일 스키마로 기관 간 쿼리 |
| **한국 채택** | 진행 중 (건강보험 연동) | 성숙 (FEEDER-NET, 47개 병원) |

### 6.2 하이브리드 전략 — 업계 표준 방향

```
[데이터 수집] → FHIR API / 웨어러블 SDK / CSV 업로드
     ↓
[ETL 변환] → CDM 스키마로 정규화
     ↓
[분석/시각화] → CDM 기반 쿼리 + 시각화
```

- **수집 레이어:** FHIR 패턴 (Resource 기반, RESTful)
- **저장/분석 레이어:** CDM 패턴 (테이블 기반, SQL)
- 이 하이브리드가 현재 **글로벌 의료 데이터 플랫폼의 표준 아키텍처**로 자리잡는 추세

**UniQdata 시사점:** MVP 단계에서는 CDM 패턴의 메트릭 정의만 도입하고, 실제 FHIR/CDM ETL은 Phase 2 이후 고려. 지금은 메타데이터 레벨에서만 CDM 호환성 확보.

---

## 7. 한국 CDM 생태계 — FEEDER-NET

### 7.1 개요

- **정식명칭:** Federated E-health Big Data for Evidence Renovation Network
- **운영:** 한국보건의료정보원 + 건강보험심사평가원 + 참여 병원
- **규모:** **47개 한국 병원**, 약 5,700만 건 환자 데이터
- **방식:** 분산 분석 (데이터가 병원을 떠나지 않고, 쿼리가 전달되어 결과만 수집)
- **CDM 버전:** OMOP CDM v5.x

### 7.2 주요 참여 기관

- 서울대학교병원 (CDM 포팅 5~6년차)
- 분당서울대병원
- 보라매병원
- 삼성서울병원, 서울아산병원, 세브란스 등 주요 상급종합병원

### 7.3 활용 도구

- **ATLAS:** 코호트 정의 및 분석 — FEEDER-NET 참여 기관에서 표준 도구로 사용
- **ACHILLES:** 각 기관 CDM 데이터의 품질 모니터링
- **클라우드 인프라:** 건강보험심사평가원 클라우드 기반 분석 환경

### 7.4 UniQdata 연동 가능성

- UniQdata가 CDM 호환 메트릭 구조를 채택하면:
  - FEEDER-NET 참여 기관의 데이터와 구조적 호환
  - CDM 기반 연구 결과를 UniQdata에서 시각화하는 워크플로우 가능
  - 연구자가 ATLAS에서 코호트 정의 → UniQdata에서 상세 시각화/분석 — 이런 보완적 포지셔닝 가능
- 2차 인터뷰 연구자의 소속 병원도 CDM 포팅 진행 중 → 실제 사용 시나리오와 직결

---

## 8. 임상시험 데이터 플랫폼 — 상용 솔루션 비교

### 8.1 주요 플랫폼 비교

| 플랫폼 | 개발사 | 주요 영역 | 시각화 특징 | 가격대 |
|--------|-------|---------|-----------|-------|
| **REDCap** | Vanderbilt Univ. | 연구 데이터 수집 | 기본 차트, 보고서 | 무료 (기관 라이선스) |
| **Medidata Rave** | Dassault Systèmes | 임상시험 EDC | 규제 준수 보고, 데이터 리스팅 | 엔터프라이즈 |
| **Oracle Clinical One** | Oracle | 통합 임상시험 | 실시간 대시보드, 안전성 신호 | 엔터프라이즈 |
| **Veeva Vault CDMS** | Veeva Systems | 임상 데이터 관리 | 통합 분석 뷰 | 엔터프라이즈 |

### 8.2 REDCap 상세

- **사용률:** 전 세계 6,000+ 기관에서 사용
- **강점:** 무료, 커스텀 데이터 수집 폼, 강력한 분기 로직
- **약점:** 시각화 기능 제한적, 대규모 데이터 분석 미지원
- **UniQdata 시사점:** REDCap이 "수집"에 강하고 "시각화"에 약함 → UniQdata가 REDCap 데이터를 가져와 시각화하는 보완적 포지션 가능

### 8.3 Medidata Rave 상세

- **시장 점유율:** 글로벌 임상시험 EDC 시장 1위
- **강점:** FDA 규제 준수, 전자서명, 감사 추적(audit trail), 다기관 연구 지원
- **약점:** 비용 매우 높음, 설정 복잡, 연구자 개인이 사용하기 어려움
- **UniQdata 시사점:** Medidata가 커버하지 못하는 "개인 연구자/소규모 연구실" 영역이 UniQdata의 틈새

---

## 9. EHR 시스템 시각화 패턴

### 9.1 Epic — 타임라인 기반 환자 뷰

- **핵심 UI 패턴:**
  - **Storyboard:** 환자 요약 카드 (인구통계, 알레르기, 활력징후)
  - **Flowsheet:** 시간순 격자 — 행=항목, 열=시간
  - **Synopsis:** 카테고리별 접이식 패널
  - **Chart Review:** 전체 의무기록 검색
- **시각화 특징:** 임계치(critical range) 색상 코딩, 트렌드 화살표, 스파크라인
- **UniQdata 시사점:** Epic의 Flowsheet가 v10 테이블과 구조적으로 유사. 임계치 색상 코딩은 v10의 direction 기반 컬러링과 같은 패턴.

### 9.2 Cerner (현 Oracle Health) — PowerChart

- **핵심 UI 패턴:**
  - **iView:** 구성 가능한 데이터 격자 (Flowsheet 유사)
  - **Results Review:** 검사결과 트리뷰 + 시계열 그래프
  - **Timeline:** 이벤트 기반 타임라인 (입퇴원, 시술, 약물)
- **시각화 특징:** 그래프와 테이블 동시 표시, 이상치 자동 하이라이트

---

## 10. 연구 데이터 분석 플랫폼

### 10.1 Palantir Foundry — 헬스케어 적용

- **특징:** 온톨로지 기반 데이터 통합 — 이질적 데이터 소스를 그래프로 연결
- **헬스케어 사례:** NHS (영국), HHS (미국) 등에서 COVID-19 대응에 사용
- **시각화:** 인터랙티브 대시보드, 드래그앤드롭 분석 빌더
- **UniQdata 시사점:** Palantir의 "온톨로지" 개념은 CDM의 "concept" 개념과 유사. 다만 Palantir는 엔터프라이즈 가격대로 개인 연구자 접근 불가.

### 10.2 Flatiron Health — 종양학 특화

- **특징:** EHR에서 추출한 실세계 데이터(RWD)로 종양학 연구 지원
- **핵심:** 비정형 데이터(의사 노트, 병리 보고서)에서 구조화된 데이터 추출
- **시각화:** 종양학 특화 타임라인 (치료 레지멘, 반응 평가, 생존 분석)
- **UniQdata 시사점:** Flatiron의 "치료 레지멘 타임라인"은 v10의 Phase 기반 타임라인과 유사. 종양학 시나리오 시각화의 좋은 참고.

### 10.3 PatientExploreR — 오픈소스 CDM 시각화

- **종류:** R/Shiny 오픈소스 앱
- **대상 데이터:** OMOP CDM
- **핵심 기능:**
  - **Multiplex 모드:** 서로 다른 데이터 타입(measurement, condition, drug)을 **같은 타임라인 위에** 동시 표시
  - **자동 시각화:** 데이터 타입에 따라 라인/바/이벤트마커 자동 선택
  - **인터랙티브 타임라인:** 줌/팬으로 시간 범위 조절
  - **환자 탐색:** 개별 환자의 전체 임상 히스토리를 한 눈에
- **GitHub:** https://github.com/OHDSI/PatientExploreR

**UniQdata 시사점 (핵심):**

- v10의 타임라인 + 테이블 구조가 이미 PatientExploreR 방향
- 추가해야 할 것: **domain별 그룹핑** + **자동 시각화 타입 선택**
- PatientExploreR의 Multiplex 모드 = 우리의 "이종 데이터 동시 표시" 목표와 정확히 일치
- 차별점: PatientExploreR은 R 기반이라 비개발자 접근 어려움 → UniQdata는 웹 기반으로 접근성 우위

---

## 11. 임상 데이터 시각화 디자인 패턴

### 11.1 이종(Heterogeneous) 데이터 동시 표시

임상 데이터의 핵심 도전: **수치, 범주, 이진, 이벤트, 영상** 등 전혀 다른 타입의 데이터를 하나의 뷰에서 보여줘야 함.

**업계 접근 방식:**

| 데이터 타입 | 추천 시각화 | 예시 |
|-----------|-----------|------|
| 연속 수치 (시계열) | 라인 차트 + CI 밴드 | 혈압, 체중, ANC |
| 비율/분포 | 스택 바 차트 | TIR, 산소포화도 |
| 순서형 등급 | 히트맵 / 스택 바 | 독성등급(G1-G4), ECOG PS |
| 범주형 (시각) | 이모지/아이콘 갤러리 | 피부상태, 기분 |
| 이진 이벤트 | 도트맵 (●/○) | 부작용 발생 여부, 약물 복용 여부 |
| 비정기 이벤트 | 타임라인 마커 | 진단, 시술, 입퇴원 |
| 결측 데이터 | 해치 패턴 / 회색 영역 | 미방문, 검사 미실시 |

### 11.2 자동 차트 타입 선택 — VisualSphere 패턴

학술 연구에서 제안된 접근: **변수의 속성(타입, 역할)에 따라 자동으로 최적 시각화를 추천**.

```
입력: { data_type, cardinality, temporality, sample_size }
  ↓
규칙 엔진:
  - numeric + temporal + n>10 → line chart
  - numeric + temporal + n≤10 → bar chart
  - categorical + low_cardinality → pie/donut
  - categorical + high_cardinality → treemap
  - binary + temporal → dot strip
  - ordinal + temporal → heatmap
  ↓
출력: recommended_chart_type
```

**v11 적용:** `domain × value_type → renderer` 매트릭스가 이 패턴의 구현:

```
measurement × numeric → numeric_line
measurement × proportion → severity_zone
observation × categorical → image_gallery
drug_exposure × binary → binary_strip
condition_occurrence × categorical → event_strip
```

### 11.3 결측 데이터 시각화

임상 데이터에서 결측(missing)은 매우 흔하며, 결측 자체가 의미를 가질 수 있음 (예: 환자가 방문하지 않은 것 자체가 중요한 신호).

**베스트 프랙티스:**

- 결측을 빈 셀이 아닌 **명시적 시각적 표현**으로 처리
- 해치 패턴(빗금), 회색 영역, 물음표 아이콘 등
- 결측 비율이 높은 항목 자동 경고
- 결측 패턴 분석 (MCAR, MAR, MNAR 분류)

**v11 적용:** 테이블 셀에서 데이터 없음 시 "—" 대신 회색 해치 + 호버 시 "미수집" 표시.

### 11.4 임계치(Threshold) 시각화

임상 데이터에서 정상 범위/위험 범위 표시는 필수.

**패턴:**

- **배경 밴드:** 정상 범위를 연한 녹색, 주의를 노란색, 위험을 빨간색으로 라인차트 배경에 표시
- **트리거 라인:** 특정 값(예: ANC < 500)에 점선 + 라벨
- **셀 컬러링:** 테이블 셀 값이 임계치를 벗어나면 배경색 변경

**v11 적용:** CDM의 `range_low`, `range_high` 필드와 연동하여 자동 임계치 표시 가능.

---

## 12. 주요 발견 요약 — v11 설계 반영 사항

### 12.1 CDM에서 가져올 것

| CDM 요소 | v11 반영 | 구체적 적용 |
|---------|---------|-----------|
| 6대 임상 테이블 분류 | `domain` 필드 | metric마다 measurement/observation/drug_exposure 등 태깅 |
| Concept ID 매핑 | `concept_hint` 필드 | 표준 코드 참조 남겨두기 (향후 CDM 연동 대비) |
| 통일된 이벤트 구조 | 메트릭 스키마 | 모든 메트릭이 동일한 필드 구조를 공유 |
| 시간 3계층 | 타임라인 구조 | observation_period → visit_occurrence → visit_detail 매핑 |

### 12.2 CDISC에서 가져올 것

| CDISC 요소 | v11 반영 | 구체적 적용 |
|-----------|---------|-----------|
| ADaM 변수 (CHG, PCHG) | Δ(delta) 계산 | 기존 로직이 이미 ADaM 패턴 — 명시적 매핑만 추가 |
| PARCAT1 분류 | `priority` 필드 | primary/secondary/exploratory/safety/operational |
| SDTM 도메인 | `domain` 필드 | CDM 도메인과 통합하여 하나의 필드로 |

### 12.3 플랫폼에서 가져올 것

| 플랫폼/도구 | 참고 요소 | v11 적용 |
|-----------|---------|---------|
| PatientExploreR | Multiplex 모드 | domain별 그룹핑 + 자동 렌더러 선택 |
| Epic Flowsheet | 임계치 색상 코딩 | range_low/high 기반 자동 컬러링 |
| ATLAS | 코호트 빌더 | Retro Action Center의 코호트 분류 기능 |
| REDCap | 커스텀 폼 | 데이터 수집 유연성 참고 |
| VisualSphere | 자동 차트 추천 | domain × value_type → renderer 매트릭스 |

### 12.4 한국 시장 시사점

- FEEDER-NET (47개 병원, 5,700만 건) → CDM 호환 시 연동 가능성
- 국내 병원의 CDM 포팅 경험 5~6년 → CDM 메타데이터를 이해하는 UI가 신뢰감 형성
- CDM 기반 연구 증가 추세 → 시장 타이밍 적절

---

## 참고 소스

### 공식 문서 및 사이트

- OHDSI CDM 공식 문서: https://ohdsi.github.io/CommonDataModel/
- OHDSI Book of OHDSI: https://ohdsi.github.io/TheBookOfOhdsi/
- CDISC SDTM Implementation Guide: https://www.cdisc.org/standards/foundational/sdtm
- CDISC ADaM Implementation Guide: https://www.cdisc.org/standards/foundational/adam
- HL7 FHIR: https://www.hl7.org/fhir/

### 도구 및 소프트웨어

- OHDSI ATLAS: https://github.com/OHDSI/Atlas
- OHDSI ACHILLES: https://github.com/OHDSI/Achilles
- PatientExploreR: https://github.com/OHDSI/PatientExploreR
- MIMIC-IV: https://physionet.org/content/mimiciv/
- REDCap: https://projectredcap.org/

### 한국 CDM 관련

- FEEDER-NET: https://feedernet.com/
- 건강보험심사평가원 CDM: https://opendata.hira.or.kr/
- 한국보건의료정보원: https://www.k-his.or.kr/

### 시각화 연구

- VisualSphere 패턴 (자동 차트 추천): 학술 논문 참고
- Few, S. — "Show Me the Numbers" (데이터 시각화 원칙)
- Tufte, E. — "The Visual Display of Quantitative Information"

---

*이 문서는 UniQdata 팀의 기술 자산으로, 향후 아키텍처 결정 및 외부 발표 시 근거 자료로 활용됩니다.*
