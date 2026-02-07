/**
 * UniQdata Enterprise - Wireframe Spec Tooltip System
 * 호버 시 동적 툴팁 생성 (겹침 방지)
 */

(function() {
  'use strict';

  let activeTooltip = null;

  // 타입별 라벨
  const TYPE_LABELS = {
    kpi: 'KPI',
    action: '액션',
    data: '데이터',
    nav: '네비',
    wallet: '지갑',
    ai: 'AI'
  };

  // 동적 툴팁 생성
  function showTooltip(element, e) {
    hideTooltip();

    const spec = element.dataset.spec;
    if (!spec) return;

    const specType = element.dataset.specType || 'data';
    const specTitle = element.dataset.specTitle || '';
    const changed = element.dataset.changed;
    const added = element.dataset.added;

    const tooltip = document.createElement('div');
    tooltip.className = 'spec-tooltip-popup';

    let html = '';

    // 타이틀 + 타입 뱃지
    if (specTitle || specType) {
      html += `<div class="tooltip-title">`;
      if (specType) {
        html += `<span class="tooltip-type ${specType}">${TYPE_LABELS[specType] || specType}</span>`;
      }
      if (specTitle) {
        html += specTitle;
      }
      html += `</div>`;
    }

    // 본문
    html += `<div class="tooltip-body">${spec}</div>`;

    // 변경사항
    if (changed) {
      html += `<div class="tooltip-changed">변경: ${changed}</div>`;
    }
    if (added) {
      html += `<div class="tooltip-added">신규: ${added}</div>`;
    }

    tooltip.innerHTML = html;
    document.body.appendChild(tooltip);

    // 위치 조정
    const rect = element.getBoundingClientRect();
    let left = rect.left;
    let top = rect.top - tooltip.offsetHeight - 10;

    // 화면 밖으로 나가면 조정
    if (top < 10) {
      top = rect.bottom + 10;
    }
    if (left + tooltip.offsetWidth > window.innerWidth - 10) {
      left = window.innerWidth - tooltip.offsetWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';

    activeTooltip = tooltip;
  }

  function hideTooltip() {
    if (activeTooltip) {
      activeTooltip.remove();
      activeTooltip = null;
    }
  }

  // 스펙 모드 토글 버튼
  function createSpecToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'spec-toggle';
    toggle.innerHTML = '스펙 보기';
    toggle.onclick = function() {
      document.body.classList.toggle('spec-mode');
      this.innerHTML = document.body.classList.contains('spec-mode')
        ? '스펙 닫기'
        : '스펙 보기';
    };
    document.body.appendChild(toggle);
  }

  // 스펙 범례
  function createSpecLegend() {
    const legend = document.createElement('div');
    legend.className = 'spec-legend';
    legend.innerHTML = `
      <h4>타입 범례</h4>
      <div class="spec-legend-item"><span class="spec-legend-color kpi"></span> KPI/통계</div>
      <div class="spec-legend-item"><span class="spec-legend-color action"></span> 액션/버튼</div>
      <div class="spec-legend-item"><span class="spec-legend-color data"></span> 데이터</div>
      <div class="spec-legend-item"><span class="spec-legend-color nav"></span> 네비게이션</div>
      <div class="spec-legend-item"><span class="spec-legend-color wallet"></span> 지갑/블록체인</div>
      <div class="spec-legend-item"><span class="spec-legend-color ai"></span> AI 기능</div>
    `;
    document.body.appendChild(legend);
  }

  // 회의 변경사항 패널
  function createMeetingChangesPanel() {
    const panel = document.createElement('div');
    panel.className = 'meeting-changes-panel';
    panel.innerHTML = `
      <h4>2026-02-07 회의 변경</h4>
      <ul>
        <li>메뉴: 홈, 개요, 테이블, AI 허브</li>
        <li>AI 도구 5개 → AI 허브 통합</li>
        <li>지갑: 개인 + 프로젝트 이원화</li>
        <li>출금: 즉시 출금만</li>
        <li>Step 4 AI 도구 선택 제거</li>
      </ul>
    `;
    document.body.appendChild(panel);
  }

  // 초기화
  function init() {
    createSpecToggle();
    createSpecLegend();
    createMeetingChangesPanel();

    // 이벤트 위임으로 툴팁 처리
    document.addEventListener('mouseenter', function(e) {
      const target = e.target.closest('[data-spec]');
      if (target) {
        showTooltip(target, e);
      }
    }, true);

    document.addEventListener('mouseleave', function(e) {
      const target = e.target.closest('[data-spec]');
      if (target) {
        hideTooltip();
      }
    }, true);

    console.log('UniQdata Spec System 로드됨');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.toggleSpecMode = function() {
    document.body.classList.toggle('spec-mode');
  };

})();
