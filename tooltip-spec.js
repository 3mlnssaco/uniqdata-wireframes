/**
 * UniQdata Enterprise - Wireframe Spec Tooltip System
 * 각 요소 호버 시 기획 의도/데이터 설명 표시
 *
 * 사용법:
 * 1. data-spec="설명 텍스트" 속성 추가
 * 2. data-spec-type="kpi|action|data|nav|wallet|ai" 속성으로 타입 지정
 * 3. data-changed="변경사항" 속성으로 회의 변경사항 표시
 * 4. data-removed="제거 이유" 속성으로 삭제 예정 표시
 * 5. data-added="추가 설명" 속성으로 신규 추가 표시
 */

(function() {
  'use strict';

  // 스펙 모드 토글 버튼 생성
  function createSpecToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'spec-toggle';
    toggle.innerHTML = '📋 스펙 보기';
    toggle.onclick = function() {
      document.body.classList.toggle('spec-mode');
      this.innerHTML = document.body.classList.contains('spec-mode')
        ? '✕ 스펙 닫기'
        : '📋 스펙 보기';
    };
    document.body.appendChild(toggle);
  }

  // 스펙 범례 생성
  function createSpecLegend() {
    const legend = document.createElement('div');
    legend.className = 'spec-legend';
    legend.innerHTML = `
      <h4>요소 타입 범례</h4>
      <div class="spec-legend-item"><span class="spec-legend-color kpi"></span> KPI/통계</div>
      <div class="spec-legend-item"><span class="spec-legend-color action"></span> 액션/버튼</div>
      <div class="spec-legend-item"><span class="spec-legend-color data"></span> 데이터 표시</div>
      <div class="spec-legend-item"><span class="spec-legend-color nav"></span> 네비게이션</div>
      <div class="spec-legend-item"><span class="spec-legend-color wallet"></span> 지갑/블록체인</div>
      <div class="spec-legend-item"><span class="spec-legend-color ai"></span> AI 기능</div>
    `;
    document.body.appendChild(legend);
  }

  // 회의 변경사항 패널 생성
  function createMeetingChangesPanel() {
    const panel = document.createElement('div');
    panel.className = 'meeting-changes-panel';
    panel.innerHTML = `
      <h4>📝 2026-02-07 회의 변경사항</h4>
      <ul>
        <li><strong>메뉴 구조:</strong> 홈, 개요, 테이블, AI 허브까지만</li>
        <li><strong>인과발견/SHAP 등:</strong> AI 허브로 통합</li>
        <li><strong>Step 4 AI 도구:</strong> 제거 예정</li>
        <li><strong>데이터 트렌드:</strong> 7일→전체 기간</li>
        <li><strong>지갑 구조:</strong> 개인+프로젝트 이원화</li>
        <li><strong>출금이체 탭:</strong> 제거</li>
        <li><strong>개요 페이지:</strong> 프로젝트 지갑 추가</li>
        <li><strong>홈 카드 버튼:</strong> 참여자/데이터 통합</li>
      </ul>
    `;
    document.body.appendChild(panel);
  }

  // 툴팁 위치 조정 (화면 밖으로 나가지 않도록)
  function adjustTooltipPosition(element) {
    const tooltip = element.querySelector('.spec-tooltip');
    if (!tooltip) return;

    const rect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    if (rect.right > viewportWidth) {
      tooltip.style.left = 'auto';
      tooltip.style.right = '0';
      tooltip.style.transform = 'none';
    }

    if (rect.left < 0) {
      tooltip.style.left = '0';
      tooltip.style.right = 'auto';
      tooltip.style.transform = 'none';
    }
  }

  // 동적 툴팁 생성 (더 복잡한 정보용)
  function createRichTooltip(element) {
    const spec = element.dataset.spec;
    const specType = element.dataset.specType || 'data';
    const specTitle = element.dataset.specTitle || '요소 설명';
    const priority = element.dataset.priority;

    const tooltip = document.createElement('div');
    tooltip.className = 'spec-tooltip';
    tooltip.innerHTML = `
      <div class="spec-tooltip-header">
        <span class="spec-tooltip-type spec-tooltip-type-${specType}">${getTypeLabel(specType)}</span>
        ${priority ? `<span class="spec-tooltip-priority">우선순위 ${priority}</span>` : ''}
      </div>
      <div class="spec-tooltip-title">${specTitle}</div>
      <div class="spec-tooltip-body">${spec}</div>
    `;

    return tooltip;
  }

  function getTypeLabel(type) {
    const labels = {
      kpi: '📊 KPI',
      action: '🎯 액션',
      data: '📁 데이터',
      nav: '🧭 네비',
      wallet: '💳 지갑',
      ai: '🤖 AI'
    };
    return labels[type] || '📌 정보';
  }

  // 초기화
  function init() {
    // CSS가 로드되었는지 확인
    const cssLoaded = document.querySelector('link[href*="tooltip-spec.css"]');
    if (!cssLoaded) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'tooltip-spec.css';
      document.head.appendChild(link);
    }

    createSpecToggle();
    createSpecLegend();
    createMeetingChangesPanel();

    // 모든 data-spec 요소에 이벤트 추가
    document.querySelectorAll('[data-spec]').forEach(element => {
      element.addEventListener('mouseenter', function() {
        adjustTooltipPosition(this);
      });
    });

    console.log('📋 UniQdata Wireframe Spec System 로드됨');
    console.log('💡 "스펙 보기" 버튼을 클릭하면 각 요소의 기획 의도를 확인할 수 있습니다.');
  }

  // DOM 로드 후 초기화
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // 전역 함수로 스펙 모드 토글 가능하게
  window.toggleSpecMode = function() {
    document.body.classList.toggle('spec-mode');
  };

})();

// 페이지별 스펙 정의
const PAGE_SPECS = {
  // 홈 (연구 목록) 페이지
  home: {
    kpiSummary: {
      title: '전체 KPI 요약',
      type: 'kpi',
      priority: 1,
      description: '연구자가 한눈에 전체 현황 파악. 총 연구 수, 참여자 수, 데이터량, 에스크로 잔액 표시.',
      apiCall: 'GET /api/v2/dashboard/summary'
    },
    projectCard: {
      title: '연구 카드',
      type: 'data',
      priority: 1,
      description: '개별 연구 요약. 참여자 현황, 수집률, 마감일, 알림 표시. 클릭 시 개요 페이지로 이동.',
      changed: '참여자/데이터 버튼 하나로 통합'
    },
    dataCollectionTrend: {
      title: '데이터 수집 트렌드',
      type: 'data',
      priority: 2,
      description: '일별 응답률 그래프. 이탈 추이 파악용.',
      changed: '7일→전체 기간으로 변경. 기간 필터 추가 고려.'
    }
  },

  // 개요 페이지
  overview: {
    keyInsight: {
      title: '핵심 인사이트',
      type: 'ai',
      priority: 1,
      description: 'AI가 분석한 주요 발견사항. 복약 순응도 변화, 이상치 알림 등 표시.'
    },
    currentParticipants: {
      title: '현재 참여자',
      type: 'kpi',
      priority: 1,
      description: '목표 대비 현재 참여자 수. 달성률 시각화.'
    },
    activeParticipants: {
      title: '활성 참여자',
      type: 'kpi',
      priority: 2,
      description: '최근 7일 내 데이터 제출한 참여자. 이탈 감지용.'
    },
    completionRate: {
      title: '평균 완료율',
      type: 'kpi',
      priority: 2,
      description: '일일 데이터 제출 기준 완료율.'
    },
    projectWallet: {
      title: '프로젝트 지갑',
      type: 'wallet',
      priority: 1,
      description: '이 연구 전용 지갑. 예산 잔액, 지급 내역 표시.',
      added: '회의 결정: 프로젝트별 지갑 분리'
    }
  },

  // 테이블 페이지
  table: {
    viewToggle: {
      title: '뷰 토글 (날짜별/참여자별)',
      type: 'nav',
      priority: 1,
      description: '날짜별: 일별 전체 데이터. 참여자별: 개인별 시계열.',
      changed: '참여자별 와이어프레임 추가 예정'
    },
    dataColumns: {
      title: '데이터 컬럼',
      type: 'data',
      priority: 1,
      description: '심박수, 혈당, 복약, 수면, 기분 등. 텍스트 기반 엑셀 형식.',
      changed: '시각화→텍스트 기반으로 변경'
    },
    pagination: {
      title: '페이징',
      type: 'action',
      priority: 2,
      description: '데이터 원본 반출 방지용. 한 번에 제한된 행만 표시.'
    }
  },

  // AI 허브 (신규)
  aiHub: {
    title: 'AI 허브',
    type: 'ai',
    priority: 1,
    description: '연구 방법론별 최적화된 AI 알고리즘 선택. 인과발견, SHAP, CATE, What-If 등 통합.',
    added: '기존 개별 메뉴를 AI 허브로 통합'
  },

  // 결제/에스크로
  billing: {
    projectLedger: {
      title: '연구별 지출 원장',
      type: 'wallet',
      priority: 1,
      description: '연구별 예치, 정산, 환불 내역. 온체인 검증 상태 표시.'
    },
    externalTransactions: {
      title: '외부 입출금 내역',
      type: 'wallet',
      priority: 2,
      description: '외부 지갑과의 입출금 기록.'
    },
    withdrawPopup: {
      title: '출금 팝업',
      type: 'action',
      priority: 1,
      description: '출금 대상 지갑, 금액, 목적 입력. 즉시 출금만 지원.',
      changed: '에스크로 해제/예약 출금 옵션 제거'
    }
  },

  // 연구 생성 스텝
  createStep5: {
    projectWalletCreation: {
      title: '프로젝트 지갑 생성',
      type: 'wallet',
      priority: 1,
      description: '예산 설정 전 서버에서 프로젝트 지갑 자동 생성.',
      added: '회의 결정: 지갑 이원화'
    },
    budgetTransfer: {
      title: '예산 이체',
      type: 'wallet',
      priority: 1,
      description: '개인 지갑에서 프로젝트 지갑으로 예산 이체. 팝업으로 진행.',
      added: '회의 결정: 개인→프로젝트 이체 팝업'
    }
  }
};

// 스펙 정보를 요소에 적용하는 헬퍼 함수
window.applySpec = function(selector, pageKey, specKey) {
  const element = document.querySelector(selector);
  const spec = PAGE_SPECS[pageKey]?.[specKey];

  if (element && spec) {
    element.dataset.spec = spec.description;
    element.dataset.specType = spec.type;
    element.dataset.specTitle = spec.title;
    if (spec.priority) element.dataset.priority = spec.priority;
    if (spec.changed) element.dataset.changed = spec.changed;
    if (spec.added) element.dataset.added = spec.added;
    if (spec.removed) element.dataset.removed = spec.removed;
  }
};

// 전역으로 스펙 정보 노출
window.PAGE_SPECS = PAGE_SPECS;
