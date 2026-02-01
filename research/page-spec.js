(() => {
  const PAGE_SPECS = {
    list: {
      title: '연구 목록',
      theme: 'dark',
      purpose: '연구 상태/진행률/데이터 품질을 한 화면에서 비교',
      features: [
        '연구 카드(상태/모집률/품질/데이터량)',
        '퀵 액션(개요/테이블/분석으로 이동)',
        '필터/정렬(상태/기간/품질)'
      ],
      backend: [
        'GET /api/v1/projects (리스트/필터)',
        'GET /api/v1/projects/:id (요약)',
        'GET /api/v1/projects/:id/participants (카운트)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        '권한: WorkspaceMember (role 기반)',
        'Audit: list 조회 로그'
      ],
      schema: [
        'projects',
        'participants_summary'
      ],
      dataMap: [
        'projects (title/status/period/owner)',
        'project_members (role, team)',
        'participants_summary (total/active)',
        'data_points / data_stats (데이터 수집량)',
        'escrows (budget/status) [planned]'
      ],
      statusMap: [
        'draft: 초안(에스크로 미생성)',
        'recruiting: 참여자 모집 중',
        'collecting: 데이터 수집 중',
        'analyzing: 분석 진행 중',
        'completed: 완료'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant DB
  App->>API: GET /api/v1/projects
  API->>DB: load projects + summary
  DB-->>API: projects
  API-->>App: list response`
    },
    create: {
      title: '연구 생성 (기본 정보)',
      theme: 'light',
      purpose: '연구 목적/기간/대상/보상 기본값 정의',
      features: [
        '연구 기본 정보 입력',
        '코호트 조건(연령/질환 등) 설정',
        '임시 저장(초안)'
      ],
      backend: [
        'POST /api/v1/projects (초안 생성)',
        'PATCH /api/v1/projects/:id (기본 정보 저장)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        '권한: WorkspaceMember(owner/admin)'
      ],
      schema: [
        'projects'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant DB
  App->>API: POST /api/v1/projects (draft)
  API->>DB: insert project
  DB-->>API: project_id
  API-->>App: draft created`
    },
    'create-step2': {
      title: '설계 확인',
      theme: 'light',
      purpose: '입력된 설계 항목 검토 및 보완',
      features: [
        '연구 설계 요약',
        '누락 항목 경고',
        '수정/확정'
      ],
      backend: [
        'GET /api/v1/projects/:id',
        'PATCH /api/v1/projects/:id'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        '권한: WorkspaceMember(owner/admin)'
      ],
      schema: [
        'projects'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant DB
  App->>API: GET /api/v1/projects/:id
  API->>DB: load project
  DB-->>API: project
  API-->>App: summary
  App->>API: PATCH /api/v1/projects/:id
  API->>DB: update fields
  API-->>App: saved`
    },
    'create-step3': {
      title: '데이터 수집 설계',
      theme: 'light',
      purpose: '수집 항목/빈도/데이터 범주 확정',
      features: [
        '패시브/능동/맥락 선택',
        'EMA 빈도 설정',
        '참여자 부담 계산'
      ],
      backend: [
        '[제안] PATCH /api/v1/projects/:id (data_spec)',
        '[제안] POST /api/v1/projects/:id/consent-templates'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        '데이터 스키마 검증 + audit log'
      ],
      schema: [
        'data_spec',
        'consent_templates'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant AI
  participant DB
  App->>AI: 데이터 추천 요청 (옵션)
  AI-->>App: 추천 항목
  App->>API: PATCH /api/v1/projects/:id (data_spec)
  API->>DB: save data_spec
  API-->>App: saved`
    },
    'create-step4': {
      title: 'AI 도구',
      theme: 'light',
      purpose: '연구 도구/분석 옵션 선택',
      features: [
        'AI/인과 도구 선택',
        '옵션별 비용/효과 비교'
      ],
      backend: [
        '[제안] PATCH /api/v1/projects/:id (analysis_tools)'
      ],
      security: [
        'Auth: Bearer + X-App-Id'
      ],
      schema: [
        'analysis_tools'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant DB
  App->>API: PATCH /api/v1/projects/:id (analysis_tools)
  API->>DB: save tools
  API-->>App: saved`
    },
    'create-step5': {
      title: '예산 계획',
      theme: 'light',
      purpose: '보상/수수료/예산 배분 설정',
      features: [
        '예산 구성(참여자/플랫폼/추가 비용)',
        '예상 총액 계산'
      ],
      backend: [
        '[제안] PATCH /api/v1/projects/:id (budget)',
        'GET /api/v1/projects/:projectId/escrow (예정)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Step-up: Passkey 재인증 (예산 확정)'
      ],
      schema: [
        'budget',
        'escrow'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant DB
  App->>API: PATCH /api/v1/projects/:id (budget)
  API->>DB: update budget
  API-->>App: saved
  App->>API: Passkey step-up (confirm)
  API-->>App: verified`
    },
    'create-step6': {
      title: '에스크로 설정',
      theme: 'light',
      purpose: '보상 지급을 위한 에스크로 확정',
      features: [
        '에스크로 생성/확정',
        '서명/승인 상태 확인'
      ],
      backend: [
        'GET /api/v1/projects/:projectId/escrow',
        '[제안] POST /api/v1/projects/:projectId/escrow/setup'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Step-up: Passkey 서명',
        'XRPL anchor 기록'
      ],
      schema: [
        'escrow',
        'settlements'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant XRPL
  participant DB
  App->>API: POST /api/v1/projects/:id/escrow/setup
  API->>XRPL: escrow create
  XRPL-->>API: tx hash
  API->>DB: save escrow + tx
  API-->>App: escrow ready`
    },
    'data-overview': {
      title: '연구 개요',
      theme: 'dark',
      purpose: '참여자/품질/수집률 핵심 지표 요약',
      features: [
        '참여자/진행률 카드',
        '핵심 인사이트 요약',
        'AI 어시스턴트 브리핑'
      ],
      backend: [
        'GET /api/v1/projects/:id',
        'GET /api/v1/projects/:id/participants',
        'POST /api/v1/tier1/queries (요약 지표)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        '권한: WorkspaceMember',
        'Consent/DataAccess 체크',
        'Audit: read log'
      ],
      schema: [
        'projects',
        'participants_summary',
        'tier1_query_result'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant DB
  App->>API: GET /api/v1/projects/:id
  API->>DB: load project
  API-->>App: project
  App->>API: POST /api/v1/tier1/queries (summary)
  API->>Tier1: run safe query
  Tier1-->>API: aggregates
  API-->>App: overview`
    },
    'data-table': {
      title: '데이터 테이블',
      theme: 'dark',
      purpose: '안전 뷰 기반 데이터 조회/필터/내보내기',
      features: [
        '필터/정렬/검색',
        'CSV/Excel 내보내기',
        '안전 뷰(k-익명)'
      ],
      backend: [
        'POST /api/v1/tier1/queries',
        'POST /api/v1/tier1/reports (export)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크',
        'Export는 Passkey 재인증',
        'Audit + XRPL anchor (export)'
      ],
      schema: [
        'tier1_query_result',
        'report_exports'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant XRPL
  App->>API: POST /api/v1/tier1/queries
  API->>Tier1: safe query (k gate)
  Tier1-->>API: rows
  API-->>App: table data
  App->>API: POST /api/v1/tier1/reports (export)
  API->>XRPL: anchor export log
  API-->>App: export file`
    },
    'analysis-discovery': {
      title: '인과 발견',
      theme: 'dark',
      purpose: '인과 그래프 탐색/필터/요약',
      features: [
        '알고리즘 선택(PC/FCI/NOTEARS)',
        '인과 강도/신뢰도 필터',
        '3D 그래프 탐색'
      ],
      backend: [
        '[예정] POST /api/v1/analysis/projects/:id/discovery',
        'POST /api/v1/tier1/queries (학습 데이터)'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크',
        'Audit: 분석 실행 로그'
      ],
      schema: [
        'analysis_graph',
        'tier1_query_result'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant Graph
  App->>API: POST /analysis/discovery
  API->>Tier1: fetch training data
  Tier1-->>API: dataset
  API->>Graph: build causal graph
  Graph-->>API: graph
  API-->>App: discovery result`
    },
    'analysis-importance': {
      title: 'SHAP (영향 요인)',
      theme: 'dark',
      purpose: '변수 중요도/기여도 요약',
      features: [
        '변수 중요도 랭킹',
        '긍/부정 기여도 비교',
        '요약/내보내기'
      ],
      backend: [
        '[예정] POST /api/v1/analysis/projects/:id/importance',
        'POST /api/v1/tier1/queries'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크'
      ],
      schema: [
        'analysis_importance'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant Model
  App->>API: POST /analysis/importance
  API->>Tier1: fetch features
  Tier1-->>API: features
  API->>Model: compute importance
  Model-->>API: shap summary
  API-->>App: importance`
    },
    'analysis-personalized': {
      title: 'CATE (개인화 효과)',
      theme: 'dark',
      purpose: '집단별 처치 효과 분포',
      features: [
        '세그먼트 자동 분류',
        '효과 분포/상위 그룹',
        '반례 탐색'
      ],
      backend: [
        '[예정] POST /api/v1/analysis/projects/:id/cate',
        'POST /api/v1/tier1/queries'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크'
      ],
      schema: [
        'cate_results'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant Model
  App->>API: POST /analysis/cate
  API->>Tier1: cohort data
  Tier1-->>API: dataset
  API->>Model: estimate CATE
  Model-->>API: cate distribution
  API-->>App: cate`
    },
    'analysis-whatif': {
      title: 'What-If',
      theme: 'dark',
      purpose: '반사실 시나리오 시뮬레이션',
      features: [
        '개입 변수 설정',
        '효과 곡선/신뢰구간',
        '시나리오 저장'
      ],
      backend: [
        '[예정] POST /api/v1/analysis/projects/:id/whatif',
        'POST /api/v1/tier1/queries'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크'
      ],
      schema: [
        'whatif_results'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant Model
  App->>API: POST /analysis/whatif
  API->>Tier1: fetch baseline
  Tier1-->>API: baseline
  API->>Model: simulate intervention
  Model-->>API: scenario results
  API-->>App: what-if`
    },
    'analysis-rootcause': {
      title: '이상 추적',
      theme: 'dark',
      purpose: '이상 원인 경로/근본 원인 탐색',
      features: [
        '이상 감지 이벤트',
        '원인 경로 강조',
        '대응 제안'
      ],
      backend: [
        '[예정] POST /api/v1/analysis/projects/:id/rootcause',
        'POST /api/v1/tier1/queries'
      ],
      security: [
        'Auth: Bearer + X-App-Id',
        'Consent/DataAccess 체크'
      ],
      schema: [
        'rootcause_paths'
      ],
      flow: `sequenceDiagram
  participant App
  participant API
  participant Tier1
  participant Model
  App->>API: POST /analysis/rootcause
  API->>Tier1: anomaly window
  Tier1-->>API: window data
  API->>Model: find root cause
  Model-->>API: path result
  API-->>App: root cause`
    }
  };

  function injectStyle() {
    if (document.getElementById('page-spec-style')) return;
    const style = document.createElement('style');
    style.id = 'page-spec-style';
    style.textContent = `
      .page-spec {
        width: min(980px, 100% - 48px);
        margin: 32px auto 40px;
        border-radius: 12px;
        padding: 16px 20px;
        border: 1px dashed rgba(148, 163, 184, 0.35);
        backdrop-filter: blur(6px);
      }
      .page-spec.light { background: #f8fafc; color: #0f172a; }
      .page-spec.dark { background: #111827; color: #e5e7eb; border-color: #1f2937; }
      .page-spec .spec-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
      .page-spec .spec-sub { font-size: 12px; color: #94a3b8; margin-bottom: 12px; }
      .page-spec .spec-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
      .page-spec .spec-box { padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(148, 163, 184, 0.2); }
      .page-spec.light .spec-box { background: #fff; }
      .page-spec.dark .spec-box { background: #0b1220; border-color: #1f2937; }
      .page-spec .spec-box h4 { font-size: 12px; margin-bottom: 8px; font-weight: 600; color: inherit; }
      .page-spec .spec-box ul { font-size: 11px; line-height: 1.6; padding-left: 16px; }
      .page-spec .spec-box li { margin-bottom: 4px; }
      .page-spec .spec-extra { margin-top: 12px; }
      .page-spec .spec-extra .spec-box { border-style: dashed; }
      .page-spec .spec-flow {
        margin-top: 16px;
        border-radius: 12px;
        border: 1px solid rgba(148, 163, 184, 0.2);
        padding: 12px;
      }
      .page-spec .spec-flow summary {
        cursor: pointer;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .page-spec .spec-flow .mermaid {
        background: #0f172a;
        color: #e2e8f0;
        border-radius: 10px;
        padding: 12px;
        overflow: auto;
      }
      .page-spec.light .spec-flow .mermaid {
        background: #f1f5f9;
        color: #0f172a;
      }
      @media (max-width: 980px) {
        .page-spec .spec-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderPageSpec() {
    const pageId = (document.body.dataset.pageId || location.pathname.split('/').pop() || '').replace('.html', '');
    const spec = PAGE_SPECS[pageId];
    if (!spec) return;

    const section = document.createElement('section');
    section.className = `page-spec ${spec.theme || 'dark'}`;
    const securityBox = spec.security
      ? `<div class="spec-box"><h4>보안/감사</h4><ul>${spec.security.map(f => `<li>${f}</li>`).join('')}</ul></div>`
      : '';

    section.innerHTML = `
      <div class="spec-title">기능 명세 · 백엔드 호출 전략</div>
      <div class="spec-sub">${spec.title} — ${spec.purpose}</div>
      <div class="spec-grid">
        <div class="spec-box">
          <h4>핵심 기능</h4>
          <ul>${spec.features.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        <div class="spec-box">
          <h4>백엔드 호출 전략</h4>
          <ul>${spec.backend.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        <div class="spec-box">
          <h4>데이터 스키마</h4>
          <ul>${spec.schema.map(f => `<li>${f}</li>`).join('')}</ul>
        </div>
        ${securityBox}
      </div>
    `;

    if (spec.dataMap || spec.statusMap) {
      const dataBox = spec.dataMap
        ? `<div class="spec-box"><h4>데이터 소스/테이블</h4><ul>${spec.dataMap.map(f => `<li>${f}</li>`).join('')}</ul></div>`
        : '';
      const statusBox = spec.statusMap
        ? `<div class="spec-box"><h4>연구 상태 정의</h4><ul>${spec.statusMap.map(f => `<li>${f}</li>`).join('')}</ul></div>`
        : '';
      const extra = document.createElement('div');
      extra.className = 'spec-grid spec-extra';
      extra.innerHTML = `${dataBox}${statusBox}`;
      section.appendChild(extra);
    }

    if (spec.flow) {
      const flow = document.createElement('details');
      flow.className = 'spec-flow';
      flow.open = false;
      flow.innerHTML = `
        <summary>데이터 이동 / 인증 / 감사 흐름</summary>
        <div class="mermaid">${spec.flow}</div>
      `;
      section.appendChild(flow);
    }
    document.body.appendChild(section);
  }

  function loadMermaid(theme) {
    if (window.mermaid) {
      window.mermaid.initialize({ startOnLoad: false, theme: theme === 'dark' ? 'dark' : 'neutral' });
      window.mermaid.init(undefined, document.querySelectorAll('.page-spec .mermaid'));
      return;
    }
    if (document.getElementById('page-spec-mermaid')) return;
    const script = document.createElement('script');
    script.id = 'page-spec-mermaid';
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    script.onload = () => loadMermaid(theme);
    document.head.appendChild(script);
  }

  document.addEventListener('DOMContentLoaded', () => {
    injectStyle();
    renderPageSpec();
    const pageId = (document.body.dataset.pageId || location.pathname.split('/').pop() || '').replace('.html', '');
    const spec = PAGE_SPECS[pageId];
    if (spec?.flow) loadMermaid(spec.theme || 'dark');
  });
})();
