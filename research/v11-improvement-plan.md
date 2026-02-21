# v11 개선안 — 2차 인터뷰 피드백 + CDM 표준 반영

> **기준:** v10 코드 분석 + 2차 인터뷰 핵심 논점 + OHDSI CDM/CDISC 리서치
> **원칙:** "NO modes, NO toggling" 유지 + "좁고 깊게" MVP + CDM 호환 메트릭 구조

---

## 현재 v10 진단: 하드코딩 vs. Config-Driven

| 컴포넌트 | v10 상태 | 문제 |
|----------|---------|------|
| `STUDY_CONFIG.metrics` | ✅ Config-driven | 메트릭 정의는 동적 |
| `TMET` (테이블 칼럼) | ❌ **하드코딩** | 9개 고정 칼럼, STUDY_CONFIG과 동기화 안 됨 |
| `PATIENT_PROFILES` | ❌ **하드코딩** | 10명 고정, seeds가 혈당 중심 |
| `buildActionCenter()` | ⚠️ 반쪽 | 카운터는 동적이나 카드 4종은 고정 |
| `rebuildTable()` | ❌ **하드코딩** | TMET 순서 고정, 시나리오 전환 시 칼럼 불변 |
| Renderer 3종 | ✅ 확장 가능 | numeric_line / image_gallery / severity_zone |
| `buildChartGuide()` | ⚠️ 반쪽 | 해석 로직은 동적, 읽기 가이드는 고정 |

### 핵심 결론

> **`STUDY_CONFIG.metrics`는 이미 동적인데, 그걸 소비하는 `TMET`과 `rebuildTable()`이 하드코딩이라 시나리오 전환 시 칼럼이 안 바뀜.**
> 인터뷰 피드백 "혈당에 종속된 UI"의 근본 원인이 여기에 있음.

---

---

## 🆕 CDM 표준 리서치 기반 — 메트릭 정의 표준화

### 리서치 핵심 발견

#### 1. OHDSI CDM의 통일 패턴

CDM은 39개 테이블로 구성되지만, 핵심은 **모든 임상 이벤트를 동일한 구조로 통일**한다는 점:

```
[모든 이벤트] = person_id + concept_id + datetime + value + unit_concept_id
```

| CDM 테이블 | 저장 대상 | 예시 |
|-----------|---------|------|
| `measurement` | 수치 검사/측정 | 혈압, 혈당, ANC, SpO₂, 체중 |
| `observation` | 비수치 관찰 | 기분, 피부상태, 생활습관 |
| `drug_exposure` | 약물 투여 | 투여량, 복용기간 |
| `condition_occurrence` | 진단/증상 | ICD 진단코드, 부작용 |
| `procedure_occurrence` | 시술/수술 | 수술 여부, 검사 수행 |
| `device_exposure` | 기기 데이터 | 웨어러블, CGM, 활동량계 |

**v11 시사점:** 우리 `metrics` 정의에 `domain` 필드를 추가하면 CDM 테이블과 1:1 대응 가능.

#### 2. Concept ID 체계 — 어휘 표준화

CDM의 강점은 **111개 의학 어휘**를 하나의 concept_id로 통일:
- ICD-10 "E11.9" (2형 당뇨) → SNOMED concept로 매핑
- LOINC "2951-2" (나트륨 검사) → measurement_concept_id
- RxNorm (약물명) → drug_concept_id

**v11 시사점:** 지금은 `k:'wt'` 같은 임의 키를 쓰지만, `concept_hint`로 표준 코드 참조를 남겨두면 나중에 실제 CDM 연동 시 매핑 비용이 제로에 가까워짐.

#### 3. CDISC SDTM/ADaM — 임상시험 변수 표준

CDM이 관찰 연구(Retrospective) 표준이라면, **CDISC는 임상시험(Prospective) 표준**:
- **SDTM**: 원시 데이터 수집 표준 (FDA/PMDA 필수)
- **ADaM**: 분석용 데이터 표준 (SDTM에서 파생)
- 변수 이름 규칙: `AVAL` (분석값), `BASE` (기저치), `CHG` (변화량), `PCHG` (변화율)

**v11 시사점:** 우리 테이블의 Δ(delta) 계산이 사실상 ADaM의 `CHG` 패턴. `priority` 필드의 `primary/secondary/exploratory`도 ADaM의 `PARCAT1` 분류와 일치.

#### 4. 참고 플랫폼 — PatientExploreR

오픈소스 R/Shiny 앱으로, **OMOP CDM 데이터를 연구자 친화적으로 시각화**:
- **Multiplex 모드**: 서로 다른 데이터 타입(측정, 진단, 약물)을 **같은 타임라인 위에** 동시 표시
- **자동 시각화**: 데이터 타입에 따라 라인/바/이벤트마커 자동 선택
- **인터랙티브 타임라인**: 줌/팬으로 시간 범위 조절

**v11 시사점:** v10의 타임라인 + 테이블 구조가 이미 이 방향. 다만 domain별 그룹핑과 자동 시각화 선택을 추가하면 PatientExploreR 수준에 도달.

#### 5. 한국 CDM 생태계 — FEEDER-NET

- **47개 한국 병원**, 5,700만 건 환자 데이터 통합
- 서울대병원 + 분당서울대 + 보라매병원 = CDM 포팅 5~6년차
- ATLAS를 연구 도구로 사용 중
- **국내 최대 CDM 네트워크** → 우리 플랫폼이 CDM 호환이면 연동 가능성 열림

#### 6. FHIR vs. CDM — 하이브리드 전략

| | FHIR | CDM |
|--|------|-----|
| **용도** | 실시간 데이터 교환 | 연구 분석 |
| **강점** | API 기반, 세밀한 데이터 | 표준화된 분석, 페더레이션 |
| **약점** | 연구용으로 미최적화 | 실시간 연동 미지원 |

**결론:** 데이터 수집은 FHIR 패턴, 분석은 CDM 패턴 → **수집 → CDM 변환 → 분석** 파이프라인이 업계 표준.

---

### v11 메트릭 정의 스키마 — CDM 반영 최종안

기존 v10 메트릭:
```javascript
{k:'wt', name:'체중', unit:'kg', direction:'down', renderer:'numeric_line', color:'#0072B2', source:'EMR', measurement_freq:'per_visit', p_value:0.03}
```

v11 CDM-aligned 메트릭:
```javascript
{
  // === 식별 (기존) ===
  k: 'wt',                          // 내부 키 (기존 유지)
  name: '체중',                      // 표시명
  unit: 'kg',                        // 단위

  // === CDM 매핑 (NEW) ===
  domain: 'measurement',             // CDM domain → 그룹핑·렌더러 힌트
  concept_hint: 'body_weight',       // 표준 concept 참조 (LOINC/SNOMED 매핑용)
  value_type: 'numeric',             // numeric | ordinal | categorical | binary | proportion

  // === 분석 속성 (기존 + 확장) ===
  direction: 'down',                 // up | down | monitor
  priority: 'primary',              // primary | secondary | exploratory | safety | operational (CDISC ADaM)
  source: 'EMR',                     // 데이터 출처
  measurement_freq: 'per_visit',     // per_visit | continuous | daily | weekly

  // === 시각화 (자동화) ===
  renderer: null,                    // null이면 value_type + domain에서 자동 결정
  color: '#0072B2',

  // === 통계 (기존) ===
  p_value: 0.03,
  derived: null                      // 파생 메트릭이면 {from, fn, params}
}
```

### 자동 렌더러 결정 로직 — domain × value_type 매트릭스

```javascript
const AUTO_RENDERER = {
  // domain → value_type → renderer
  measurement: {
    numeric:      'numeric_line',     // 혈압, 체중, ANC → 라인차트
    proportion:   'severity_zone',    // TIR, 산소포화도 → 스택바
    ordinal:      'severity_zone',    // 독성등급(G1-G4) → 스택바
  },
  observation: {
    categorical:  'image_gallery',    // 피부상태, 기분 → 이모지
    numeric:      'numeric_line',     // GCS 점수 → 라인차트
    binary:       'binary_strip',     // Y/N 관찰 → 도트맵
  },
  drug_exposure: {
    numeric:      'numeric_line',     // 투여량(mg) → 라인차트
    binary:       'binary_strip',     // 복용 여부 → 도트맵
  },
  condition_occurrence: {
    numeric:      'histogram',        // 진단 건수 → 히스토그램
    categorical:  'event_strip',      // 진단 이벤트 → 이벤트마커 (NEW)
  },
  device_exposure: {
    numeric:      'numeric_line',     // 걸음수, 수면시간 → 라인차트
    proportion:   'severity_zone',    // 활동 달성률 → 스택바
  }
};

function resolveRenderer(metric) {
  if (metric.renderer) return metric.renderer;  // 수동 지정 우선
  const domainMap = AUTO_RENDERER[metric.domain];
  if (domainMap && domainMap[metric.value_type]) return domainMap[metric.value_type];
  return 'numeric_line';  // 기본 폴백
}
```

### 시나리오별 메트릭 구성 — CDM domain 기반

```
RCT (대사개선):
  measurement  → 체중(kg), SBP(mmHg), 심박수(bpm)
  device       → TIR(%), 걸음수(보), 수면(h)
  observation  → 피부상태(점), 순응도(%)
  drug         → 앱 사용(분)

Phase I/II (항암):
  drug         → 투여량(mg/m²)
  measurement  → ANC(×10³/μL), 혈소판(×10³/μL), 종양크기(mm)
  condition    → 독성등급(G), 부작용 발생
  observation  → ECOG PS(점)

ICU (관찰):
  measurement  → 심박수(bpm), 혈압(mmHg), SpO₂(%), 체온(°C)
  observation  → GCS(점)
  drug         → 수액(mL/h), 승압제(μg/kg/min)
  measurement  → 소변량(mL/h)

Retro CDM (후향적):
  condition    → 진단코드(건)
  drug         → 약물노출(일)
  measurement  → 검사결과(값), 외래방문(회)
  procedure    → 시술 여부
```

### 새 렌더러 — 총 5종 체계

| 렌더러 | 대상 | 시각화 |
|--------|------|--------|
| `numeric_line` | 연속 수치 시계열 | 라인차트 + CI 밴드 (기존) |
| `severity_zone` | 비율/등급 분포 | 스택바 (기존) |
| `image_gallery` | 범주형+시각 평가 | 이모지 썸네일 (기존) |
| `binary_strip` | 이진 이벤트 (NEW) | ●/○ 도트맵 |
| `event_strip` | 비정기 이벤트 (NEW) | 타임라인 마커 (진단, 시술 등) |

`histogram`은 Retro 모드의 개요 탭 전용으로 별도 처리 (테이블 셀이 아닌 메트릭 카드 레벨).

---

## v11 개선 항목 — 우선순위 순

### 1. 🔴 CRITICAL — 연구별 동적 칼럼 시스템 (CDM-aligned)

**인터뷰 근거:** "다른 데이터가 들어왔을 때도 동일하게 표시할 수 있을지 의문" (반복 3회 이상 언급)

#### 현재 문제

```
STUDY_CONFIG.metrics (9개 정의) → buildMetricsGrid() ✅ 잘 읽음
                                 → TMET (9개 하드코딩) ✗ 무시함
                                 → rebuildTable() ✗ TMET만 씀
```

#### v11 해결: TMET 제거, STUDY_CONFIG.metrics를 Single Source of Truth로

**변경 1 — `TIME_PRESETS`에 CDM-aligned `metrics_override` 추가:**

```javascript
const TIME_PRESETS = {
  visit: {
    // ... 기존 time_unit, points 등
    metrics_override: [
      // RCT(대사개선) — domain별 그룹핑
      // measurement domain
      {k:'wt',  name:'체중', unit:'kg',   domain:'measurement', concept_hint:'body_weight',
       value_type:'numeric', direction:'down', priority:'primary',
       color:'#0072B2', source:'EMR', measurement_freq:'per_visit', p_value:0.03},
      {k:'sbp', name:'SBP',  unit:'mmHg', domain:'measurement', concept_hint:'systolic_bp',
       value_type:'numeric', direction:'down', priority:'secondary',
       color:'#0072B2', source:'EMR', measurement_freq:'per_visit', p_value:0.12},
      // device domain
      {k:'tir', name:'TIR',  unit:'%',    domain:'device_exposure', concept_hint:'time_in_range',
       value_type:'proportion', direction:'up', priority:'secondary',
       color:'#10b981', source:'CGM', measurement_freq:'continuous', p_value:0.008},
      {k:'steps', name:'걸음수', unit:'보', domain:'device_exposure', concept_hint:'step_count',
       value_type:'numeric', direction:'up', priority:'exploratory',
       color:'#009E73', source:'웨어러블', measurement_freq:'daily', p_value:0.15},
      // observation domain
      {k:'skin', name:'피부', unit:'점',   domain:'observation', concept_hint:'skin_condition',
       value_type:'categorical', direction:'down', priority:'exploratory',
       color:'#a855f7', source:'EMA', measurement_freq:'per_visit', p_value:0.21},
      {k:'comp', name:'순응도', unit:'%',  domain:'observation', concept_hint:'compliance_rate',
       value_type:'numeric', direction:'up', priority:'operational',
       color:'#CC79A7', source:'앱', measurement_freq:'daily', p_value:null},
    ],
    patient_seeds_override: { /* 시나리오별 환자 시드 */ }
  },

  week: {
    // 코호트(체중관리) — measurement + device + observation
    metrics_override: [
      {k:'wt',    name:'체중',  unit:'kg',   domain:'measurement', value_type:'numeric', direction:'down', priority:'primary', ...},
      {k:'steps', name:'걸음수', unit:'보',   domain:'device_exposure', value_type:'numeric', direction:'up', priority:'secondary', ...},
      {k:'sleep', name:'수면',  unit:'h',    domain:'device_exposure', value_type:'numeric', direction:'up', priority:'secondary', ...},
      {k:'diet',  name:'식이',  unit:'kcal', domain:'observation', value_type:'numeric', direction:'down', priority:'exploratory', ...},
      {k:'mood',  name:'기분',  unit:'점',   domain:'observation', value_type:'categorical', direction:'up', priority:'exploratory', ...},
    ]
  },

  phase: {
    // Phase I/II(항암) — drug + measurement + condition
    metrics_override: [
      {k:'dose',     name:'투여량',  unit:'mg/m²',    domain:'drug_exposure', value_type:'numeric', direction:'monitor', priority:'primary', ...},
      {k:'anc',      name:'ANC',    unit:'×10³/μL',  domain:'measurement', value_type:'numeric', direction:'monitor', priority:'safety', ...},
      {k:'plt',      name:'혈소판',  unit:'×10³/μL',  domain:'measurement', value_type:'numeric', direction:'monitor', priority:'safety', ...},
      {k:'tumor',    name:'종양크기', unit:'mm',       domain:'measurement', value_type:'numeric', direction:'down', priority:'primary', ...},
      {k:'toxicity', name:'독성등급', unit:'G',        domain:'condition_occurrence', value_type:'ordinal', direction:'down', priority:'safety', ...},
      {k:'ecog',     name:'ECOG PS', unit:'점',       domain:'observation', value_type:'ordinal', direction:'down', priority:'secondary', ...},
    ]
  },

  day: {
    // ICU(관찰) — measurement + drug + observation
    metrics_override: [
      {k:'hr',    name:'심박수', unit:'bpm',       domain:'measurement', value_type:'numeric', direction:'monitor', priority:'primary', ...},
      {k:'sbp',   name:'혈압',  unit:'mmHg',      domain:'measurement', value_type:'numeric', direction:'monitor', priority:'primary', ...},
      {k:'spo2',  name:'SpO₂', unit:'%',          domain:'measurement', value_type:'proportion', direction:'up', priority:'primary', ...},
      {k:'temp',  name:'체온',  unit:'°C',         domain:'measurement', value_type:'numeric', direction:'monitor', priority:'secondary', ...},
      {k:'gcs',   name:'GCS',  unit:'점',          domain:'observation', value_type:'ordinal', direction:'up', priority:'primary', ...},
      {k:'fluid', name:'수액',  unit:'mL/h',       domain:'drug_exposure', value_type:'numeric', direction:'monitor', priority:'secondary', ...},
      {k:'urine', name:'소변량', unit:'mL/h',       domain:'measurement', value_type:'numeric', direction:'up', priority:'safety', ...},
    ]
  },

  // NEW — Retrospective CDM 분석
  retro_cdm: {
    research_type: 'retrospective',
    time_unit: 'month',
    subtitle: 'CDM 기반 후향적 코호트 분석',
    metrics_override: [
      {k:'visit_n',   name:'외래방문',  unit:'회', domain:'measurement', value_type:'numeric', direction:'monitor', priority:'primary', ...},
      {k:'drug_days', name:'약물노출',  unit:'일', domain:'drug_exposure', value_type:'numeric', direction:'monitor', priority:'primary', ...},
      {k:'cond_n',    name:'진단코드',  unit:'건', domain:'condition_occurrence', value_type:'numeric', direction:'monitor', priority:'secondary', ...},
      {k:'lab_val',   name:'검사결과',  unit:'',  domain:'measurement', value_type:'numeric', direction:'monitor', priority:'secondary', ...},
      {k:'proc_yn',   name:'시술여부',  unit:'',  domain:'procedure_occurrence', value_type:'binary', direction:'monitor', priority:'exploratory', ...},
    ],
    points: [
      {id:'M-12', label:'12개월 전', target_day:-365, window:[-15,15], epoch:'baseline', planned:true},
      {id:'M-6',  label:'6개월 전',  target_day:-180, window:[-15,15], epoch:'observation', planned:true},
      {id:'M-3',  label:'3개월 전',  target_day:-90,  window:[-15,15], epoch:'observation', planned:true},
      {id:'M0',   label:'기준시점',   target_day:0,    window:[-15,15], epoch:'index', planned:true},
      {id:'M+3',  label:'3개월 후',  target_day:90,   window:[-15,15], epoch:'followup', planned:true},
      {id:'M+6',  label:'6개월 후',  target_day:180,  window:[-15,15], epoch:'followup', planned:true},
    ]
  }
};
```

**변경 2 — `switchStudyScenario()`에서 metrics 교체:**

```javascript
function switchStudyScenario(scenarioKey) {
  const preset = TIME_PRESETS[scenarioKey];

  // 기존: timeline만 교체
  STUDY_CONFIG.timeline.time_unit = preset.time_unit;
  // ...

  // NEW: metrics도 교체
  if (preset.metrics_override) {
    STUDY_CONFIG.metrics = preset.metrics_override;
  }

  // NEW: patient seeds도 교체 (있으면)
  if (preset.patient_seeds_override) {
    // PATIENT_PROFILES 재구성
  }

  // 기존: 전체 UI 리빌드
  buildMetricsGrid();   // ← 이미 STUDY_CONFIG.metrics 루프함 → 자동으로 새 칼럼 반영
  rebuildTable();        // ← 여기가 핵심: TMET 대신 STUDY_CONFIG.metrics 사용하도록 변경
}
```

**변경 3 — `rebuildTable()`을 STUDY_CONFIG.metrics 기반으로:**

```javascript
function rebuildTable() {
  const metrics = STUDY_CONFIG.metrics;  // ← TMET 대신

  // 헤더: metrics.forEach로 동적 생성
  let hdr = '<th>ID</th><th>군</th><th>상태</th>';
  metrics.forEach(m => {
    hdr += `<th><span style="color:${m.color}">■</span> ${m.name}</th>`;
  });

  // 바디: metrics.forEach로 동적 생성
  ALL.forEach(p => {
    let row = `<td>${p.id}</td><td>${p.group}</td><td>${p.st}</td>`;
    metrics.forEach(m => {
      const arr = p[m.k];
      if (!arr) { row += '<td>—</td>'; return; }  // 해당 메트릭 없으면 대시
      const delta = arr[li] - arr[0];
      // ... 기존 delta/color 로직
      row += `<td>${deltaStr}</td>`;
    });
  });
}
```

**변경 4 — `generatePatientData()`를 metrics-aware로:**

```javascript
function generatePatientData(profiles, n) {
  const metrics = STUDY_CONFIG.metrics;
  return profiles.map(p => {
    const past = {};
    metrics.forEach(m => {
      const seed = p.seeds[m.k];
      if (seed) {
        past[m.k] = genTimeSeries(n, seed.s, seed.sl, seed.n, hashSeed(p.id + m.k), seed.nullAt);
      }
      // seed가 없으면 해당 메트릭은 null → 테이블에서 "—" 표시
    });
    return { id: p.id, past };
  });
}
```

**결과:** 시나리오 전환 시 칼럼이 **자동으로 바뀜**.
- RCT → 체중, SBP, TIR, 피부
- Phase I/II → 투여량, ANC, 혈소판, 종양크기, 독성등급
- ICU → 심박수, 혈압, SpO₂, GCS, 수액, 소변량

---

### 2. 🔴 CRITICAL — Retro vs. Prospective 연구 모드 분리

**인터뷰 근거:** "이 두 가지가 사실 굉장히 달라요. 나눠서 개발해야 한다"

#### 현재 문제

v10은 암묵적으로 **Prospective만 가정** — 실시간 데이터 수집, 실험군/대조군, 방문 추적 등이 모두 Prospective 설계

#### v11 해결: STUDY_CONFIG에 `research_type` 추가

```javascript
STUDY_CONFIG.research_type = 'prospective' | 'retrospective';
```

**Prospective일 때 (현재 v10과 동일):**
- 타임라인에 "오늘" 마커 + 미래 방문 점선
- Action Center 표시 (환자 조치, 쿼리, 안전성)
- Safety Strip 표시
- 데이터가 시간에 따라 증가 (scrubToDay)

**Retrospective일 때 (NEW):**
- 타임라인 전체가 과거 = 모든 방문이 완료 상태
- "오늘" 마커 대신 **"분석 시점"** 마커
- Action Center → **"분석 도구"**로 교체 (필터, 코호트 분류, 통계 검정)
- Safety Strip → 숨김 또는 "과거 AE 요약"으로 축소
- 데이터가 전체 로딩됨 (scrubToDay 불필요)
- Verdict Strip → "효능 판정" 대신 **"분석 결과 요약"**

**TIME_PRESETS에 반영:**

```javascript
const TIME_PRESETS = {
  visit: { research_type: 'prospective', ... },  // RCT → 진행 중
  week:  { research_type: 'prospective', ... },  // 코호트 → 진행 중
  phase: { research_type: 'prospective', ... },  // Phase I/II → 진행 중
  day:   { research_type: 'prospective', ... },  // ICU → 진행 중

  // NEW Retro scenarios
  retro_cdm: {
    research_type: 'retrospective',
    time_unit: 'month',
    subtitle: 'CDM 기반 후향적 분석',
    metrics_override: [
      {k:'visit_count', name:'외래방문', unit:'회', direction:'monitor', renderer:'numeric_line', ...},
      {k:'drug_exposure', name:'약물노출', unit:'일', direction:'monitor', renderer:'severity_zone', ...},
      {k:'condition', name:'진단코드', unit:'건', direction:'monitor', renderer:'numeric_line', ...},
      {k:'lab_result', name:'검사결과', unit:'', direction:'monitor', renderer:'numeric_line', ...},
    ],
    points: [
      {id:'M-12', label:'12개월 전', target_day:-365, ...},
      {id:'M-6', label:'6개월 전', target_day:-180, ...},
      {id:'M-3', label:'3개월 전', target_day:-90, ...},
      {id:'M0', label:'기준시점', target_day:0, ...},
    ]
  }
};
```

**UI 분기 포인트:**

```javascript
function buildTimeline() {
  if (STUDY_CONFIG.research_type === 'retrospective') {
    // 모든 phase를 완료 상태로 렌더
    // "오늘" 마커 → "분석 기준일" 마커
    // 드래그 핸들 → "분석 범위 선택" 슬라이더
  } else {
    // 기존 v10 로직
  }
}

function buildActionCenter() {
  if (STUDY_CONFIG.research_type === 'retrospective') {
    // 분석 도구 카드: 코호트 분류, 통계 검정, 데이터 필터, 내보내기
  } else {
    // 기존 v10 로직 (환자 조치, 쿼리, 안전성, 진행)
  }
}
```

---

### 3. 🟡 IMPORTANT — 데이터 타입별 자동 렌더러 선택

**인터뷰 근거:** "시계열 데이터는 1D 그래프, 카테고리컬은 빈도수/히스토그램 제안"

#### 현재 문제

렌더러가 `STUDY_CONFIG.metrics[].renderer`에 **수동 지정** — 연구자가 알아서 골라야 함

#### v11 해결: `data_type` 기반 자동 렌더러 매핑

```javascript
// 메트릭 정의에 data_type 추가
{k:'hr', name:'심박수', unit:'bpm', data_type:'continuous_ts', ...}
{k:'toxicity', name:'독성등급', unit:'G', data_type:'ordinal', ...}
{k:'skin', name:'피부상태', unit:'', data_type:'categorical_visual', ...}
{k:'tir', name:'TIR', unit:'%', data_type:'proportion_stack', ...}

// 자동 매핑
const RENDERER_MAP = {
  'continuous_ts':       'numeric_line',      // 연속 시계열 → 라인차트
  'ordinal':             'severity_zone',     // 순서형(등급) → 스택바
  'categorical_visual':  'image_gallery',     // 범주형+시각 → 이모지/썸네일
  'proportion_stack':    'severity_zone',     // 비율 분포 → 스택바
  'binary':              'binary_strip',      // 이진(Y/N) → 도트맵 (NEW)
  'frequency':           'histogram',         // 빈도 → 히스토그램 (NEW)
};

function getRenderer(metric) {
  return metric.renderer || RENDERER_MAP[metric.data_type] || 'numeric_line';
}
```

**새 렌더러 2종 추가:**

- **`binary_strip`:** 방문별 ●/○ 도트맵 (예: "부작용 발생 여부", "약물 복용 여부")
- **`histogram`:** 빈도 분포 바차트 (예: "진단코드별 건수", Retro 연구에서 유용)

---

### 4. 🟡 IMPORTANT — Action Center의 Retro/Prospective 분기

**인터뷰 근거:** "연구 설계와 데이터 시각화를 동시에 하면 과부하" + "코드 짜서 봐야 하는 과정을 생략하면 좋다"

#### Prospective Action Center (기존 유지)

```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ 👤 환자 조치  │ 📋 데이터 쿼리 │ 🛡️ 안전성 보고 │ 📊 연구 진행   │
│ 용량조절·연락  │ SDV·이상치    │ SAE 2건      │ V4 완료·57%  │
└─────────────┴──────────────┴──────────────┴──────────────┘
 Quick: 일괄연락 | 용량보류 | 쿼리처리 | 중간분석 | DSMB
```

#### Retrospective Action Center (NEW)

```
┌─────────────┬──────────────┬──────────────┬──────────────┐
│ 🔍 코호트 분류 │ 📊 통계 검정   │ 🧹 데이터 필터 │ 📤 내보내기   │
│ 포함/제외기준  │ t-test·χ²    │ 결측·이상치   │ CSV·논문표   │
└─────────────┴──────────────┴──────────────┴──────────────┘
 Quick: 기술통계 | 상관분석 | 서브그룹 | 생존분석 | 논문 Figure
```

---

### 5. 🟡 IMPORTANT — PATIENT_PROFILES의 시나리오별 분리

**인터뷰 근거:** "다양한 데이터에 대해서도 동일한 가시성으로 보여줄 수 있어야"

#### 현재 문제

`PATIENT_PROFILES`가 **혈당 연구 시드만** 가지고 있음 — 항암이나 ICU 시나리오로 전환해도 체중·혈당·걸음수 데이터가 나옴

#### v11 해결: TIME_PRESETS에 patient_seeds_override

```javascript
TIME_PRESETS.phase = {
  // ...
  patient_seeds_override: {
    exp: [
      {id:'P001', nm:'환자A', seeds:{
        dose:  {s:100, sl:25, n:5},      // mg/m², 용량 증량
        anc:   {s:4.2, sl:-0.8, n:0.3},  // ANC 감소 경향
        plt:   {s:220, sl:-30, n:10},     // 혈소판 감소
        tumor: {s:45, sl:-5, n:2},        // 종양 축소
        toxicity: {s:1, sl:0.5, n:0.2},   // 독성 등급 상승
      }},
      // ...
    ],
    ctrl: [] // Phase I에는 대조군 없음 (single_arm)
  }
};
```

**switchStudyScenario에서:**

```javascript
if (preset.patient_seeds_override) {
  PATIENT_PROFILES.exp = preset.patient_seeds_override.exp;
  PATIENT_PROFILES.ctrl = preset.patient_seeds_override.ctrl || [];
}
// → generatePatientData()가 새 시드 기반으로 데이터 재생성
```

---

### 6. 🟢 NICE-TO-HAVE — Verdict Strip의 연구 유형별 어댑터 확장

#### 현재

`verdict_adapter`가 `rct|single_arm|safety|crossover` 4종 — 모두 Prospective

#### v11 추가

```javascript
// Retro 어댑터
if (STUDY_CONFIG.verdict_adapter === 'retrospective_cohort') {
  // 카드: HR (Hazard Ratio) | OR (Odds Ratio) | 코호트 크기 | Follow-up 기간
}
if (STUDY_CONFIG.verdict_adapter === 'retrospective_cross') {
  // 카드: 유병률 | OR | 교란변수 보정 | 표본 크기
}
```

---

### 7. 🟢 NICE-TO-HAVE — 연구 계획서 기반 칼럼 우선순위

**인터뷰 근거:** "연구 계획서를 먼저 작성하고 가이드가 제공된다면, 데이터 칼럼들을 연구 연관도에 맞게 재배치" → 긍정적 반응

```javascript
STUDY_CONFIG.metrics = [
  {k:'wt', ..., priority: 'primary'},    // 1차 종료점 → 첫 번째
  {k:'tir', ..., priority: 'secondary'}, // 2차 종료점 → 두 번째
  {k:'sbp', ..., priority: 'exploratory'}, // 탐색적 → 세 번째
  {k:'steps', ..., priority: 'safety'},  // 안전성 → 네 번째
  {k:'comp', ..., priority: 'operational'}, // 운영 → 마지막
];

// 테이블 칼럼 순서 = priority 순
const PRIORITY_ORDER = ['primary','secondary','exploratory','safety','operational'];

function getOrderedMetrics() {
  return [...STUDY_CONFIG.metrics].sort((a,b) =>
    PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );
}
```

---

## 구현 순서 제안

| 단계 | 항목 | 난이도 | 영향도 |
|------|------|--------|--------|
| **Phase 1** | #1 동적 칼럼 시스템 (TMET 제거) | 중 | 🔴 극대 |
| **Phase 1** | #5 시나리오별 환자 시드 | 중 | 🔴 극대 |
| **Phase 2** | #2 Retro/Prospective 분기 | 대 | 🔴 극대 |
| **Phase 2** | #4 Action Center 분기 | 중 | 🟡 대 |
| **Phase 3** | #3 자동 렌더러 매핑 | 소 | 🟡 중 |
| **Phase 3** | #6 Verdict 어댑터 확장 | 소 | 🟢 소 |
| **Phase 3** | #7 칼럼 우선순위 정렬 | 소 | 🟢 소 |

### Phase 1만 완료해도:

> 시나리오 전환 시 **칼럼·데이터·차트가 모두 바뀌는** 진짜 범용 데이터 플랫폼 데모가 됨.
> 인터뷰 피드백 "혈당에 종속된 UI" 문제 완전 해결.

### Phase 2까지 완료하면:

> Retrospective 연구 시나리오가 추가되어, **"두 가지가 완전히 다르다"는 핵심 피드백** 반영.
> 연구자가 보기에 "이 플랫폼은 내 연구 유형을 이해하고 있다"는 신뢰감 확보.

---

## 변경 파일 영향 범위

```
data-v10-demo.html → data-v11-demo.html (복사 후 작업)

CSS 변경:
  - retro 모드 전용 스타일 추가 (~20줄)
  - histogram, binary_strip 렌더러 스타일 (~15줄)

HTML 변경:
  - 사이드바에 retro 시나리오 1개 추가 (~5줄)
  - 나머지는 JS가 동적 생성

JS 변경:
  - TMET 상수 삭제
  - TIME_PRESETS에 metrics_override + patient_seeds_override 추가 (~120줄)
  - rebuildTable() 리팩터 (~30줄 변경)
  - generatePatientData() metrics-aware로 변경 (~10줄)
  - switchStudyScenario()에 metrics 교체 로직 (~10줄)
  - buildActionCenter() 분기 추가 (~40줄)
  - buildTimeline() retro 분기 (~20줄)
  - 새 렌더러 2종 (~30줄)
  - retro_cdm 시나리오 정의 (~30줄)
```

**예상 총 변경량:** ~300줄 추가/변경, ~20줄 삭제
