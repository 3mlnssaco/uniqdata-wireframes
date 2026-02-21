/**
 * AI Chat Panel - 연구 설계 어시스턴트
 *
 * 기능:
 * - 자연어로 폼 필드 자동 채우기
 * - 참여자 조건 설정
 * - 데이터 수집 항목 선택
 * - 실시간 변경 사항 반영 + 되돌리기
 */

class AIChatPanel {
  constructor(options = {}) {
    this.messagesContainer = document.getElementById('ai-chat-messages');
    this.inputField = document.getElementById('ai-chat-input');
    this.sendBtn = document.getElementById('ai-send-btn');
    this.quickChips = document.querySelectorAll('.ai-quick-chip');

    // 폼 요소 연결
    this.formElements = options.formElements || {};

    // 변경 이력 (undo 용)
    this.changeHistory = [];

    // 현재 컨텍스트
    this.context = {
      step: options.step || 1,
      research: options.research || {},
      selections: {}
    };

    this.init();
  }

  init() {
    // 전송 버튼
    if (this.sendBtn) {
      this.sendBtn.addEventListener('click', () => this.sendMessage());
    }

    // Enter 키
    if (this.inputField) {
      this.inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
    }

    // 빠른 액션 칩
    this.quickChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const action = chip.dataset.action;
        if (action) {
          this.handleQuickAction(action);
        }
      });
    });

    // 초기 메시지
    this.addWelcomeMessage();
  }

  addWelcomeMessage() {
    const welcomeMessages = {
      1: "안녕하세요! 연구 설계를 도와드릴게요. 어떤 연구를 진행하고 싶으신가요?",
      2: "연구 설계를 확인하고 있어요. 수정이 필요한 부분이 있으면 말씀해주세요.",
      3: "데이터 수집 설정을 도와드릴게요. 어떤 데이터를 수집하고 싶으신가요?",
      4: "AI 분석 도구 선택을 도와드릴게요. 어떤 분석이 필요하신가요?",
      5: "예산 설정을 도와드릴게요. 참여자당 보상은 어느 정도로 생각하시나요?",
      6: "에스크로 예치 단계입니다. 궁금한 점이 있으시면 물어보세요."
    };

    this.addMessage('assistant', welcomeMessages[this.context.step] || welcomeMessages[1]);
  }

  sendMessage() {
    const text = this.inputField?.value.trim();
    if (!text) return;

    // 사용자 메시지 추가
    this.addMessage('user', text);
    this.inputField.value = '';

    // AI 응답 (시뮬레이션)
    this.showTyping();
    setTimeout(() => {
      this.hideTyping();
      this.processUserMessage(text);
    }, 800 + Math.random() * 500);
  }

  addMessage(type, content, actions = null) {
    const msg = document.createElement('div');
    msg.className = `ai-message ${type}`;

    const sender = type === 'assistant' ? '🤖 AI 어시스턴트' : '나';

    msg.innerHTML = `
      <div class="sender">${sender}</div>
      <div class="content">${content}</div>
    `;

    // 액션 카드가 있으면 추가
    if (actions) {
      const actionCard = this.createActionCard(actions);
      msg.appendChild(actionCard);
    }

    this.messagesContainer?.appendChild(msg);
    this.scrollToBottom();
  }

  createActionCard(actions) {
    const card = document.createElement('div');
    card.className = 'ai-action-card';

    let itemsHtml = actions.items.map(item => `
      <div class="ai-action-item">
        <span class="check">✓</span>
        <span class="field">${item.field}:</span>
        <span class="value">${item.value}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="action-title">
        <span>⚡</span>
        ${actions.title}
      </div>
      ${itemsHtml}
      <div class="ai-action-buttons">
        <button class="ai-action-btn confirm" data-action-id="${actions.id}">적용 완료</button>
        <button class="ai-action-btn undo" data-action-id="${actions.id}">되돌리기</button>
      </div>
    `;

    // 버튼 이벤트
    card.querySelector('.confirm')?.addEventListener('click', (e) => {
      e.target.textContent = '✓ 적용됨';
      e.target.disabled = true;
      e.target.style.background = '#166534';
    });

    card.querySelector('.undo')?.addEventListener('click', (e) => {
      this.undoAction(actions.id);
      card.style.opacity = '0.5';
      card.querySelector('.action-title').innerHTML = '<span>↩️</span> 되돌림';
    });

    return card;
  }

  showTyping() {
    const typing = document.createElement('div');
    typing.className = 'ai-typing';
    typing.id = 'ai-typing-indicator';
    typing.innerHTML = `
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
      <div class="ai-typing-dot"></div>
    `;
    this.messagesContainer?.appendChild(typing);
    this.scrollToBottom();
  }

  hideTyping() {
    document.getElementById('ai-typing-indicator')?.remove();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  // 사용자 메시지 처리 (패턴 매칭 시뮬레이션)
  processUserMessage(text) {
    const lowerText = text.toLowerCase();

    // 연령 조건
    if (lowerText.includes('40대') || lowerText.includes('40세')) {
      this.handleAgeCondition(40, 49);
      return;
    }
    if (lowerText.includes('50대') || lowerText.includes('50세')) {
      this.handleAgeCondition(50, 59);
      return;
    }
    if (lowerText.includes('60대') || lowerText.includes('60세')) {
      this.handleAgeCondition(60, 69);
      return;
    }
    if (/(\d+)세?\s*이상/.test(text)) {
      const age = parseInt(RegExp.$1);
      this.handleAgeCondition(age, 100);
      return;
    }

    // 질환 조건
    if (lowerText.includes('만성질환') || lowerText.includes('diabetes')) {
      this.handleCondition('diabetes_t2', '제2형 만성질환');
      return;
    }
    if (lowerText.includes('고혈압') || lowerText.includes('hypertension')) {
      this.handleCondition('hypertension', '고혈압');
      return;
    }

    // 데이터 선택
    if (lowerText.includes('cgm') || lowerText.includes('혈당')) {
      this.handleDataSelection('cgm', '웨어러블 (연속혈당)');
      return;
    }
    if (lowerText.includes('심박') || lowerText.includes('heart')) {
      this.handleDataSelection('heart_rate', '심박수');
      return;
    }
    if (lowerText.includes('수면') || lowerText.includes('sleep')) {
      this.handleDataSelection('sleep', '수면');
      return;
    }
    if (lowerText.includes('식단') || lowerText.includes('meal') || lowerText.includes('diet')) {
      this.handleDataSelection('diet', '식단 기록');
      return;
    }
    if (lowerText.includes('약물') || lowerText.includes('medication')) {
      this.handleDataSelection('medication', '약물 기록');
      return;
    }

    // 전체 추천
    if (lowerText.includes('추천') || lowerText.includes('권장') || lowerText.includes('알아서')) {
      this.handleAutoRecommend();
      return;
    }

    // 초기화
    if (lowerText.includes('초기화') || lowerText.includes('리셋') || lowerText.includes('clear')) {
      this.handleReset();
      return;
    }

    // 기본 응답
    this.addMessage('assistant',
      "죄송해요, 정확히 이해하지 못했어요. 다음과 같이 말씀해주시면 도움을 드릴 수 있어요:\n\n" +
      "• \"40대 이상만 모집해줘\"\n" +
      "• \"만성질환 환자만 대상으로 해줘\"\n" +
      "• \"웨어러블이랑 식단 데이터 추가해줘\"\n" +
      "• \"AI 추천대로 설정해줘\""
    );
  }

  // 연령 조건 설정
  handleAgeCondition(minAge, maxAge) {
    const actionId = 'age_' + Date.now();
    const label = maxAge >= 100 ? `${minAge}세 이상` : `${minAge}~${maxAge}세`;

    // 폼에 적용
    this.applyToForm('age_min', minAge);
    this.applyToForm('age_max', maxAge);

    // 변경 이력 저장
    this.changeHistory.push({
      id: actionId,
      type: 'age',
      previous: { min: this.context.selections.age_min, max: this.context.selections.age_max },
      current: { min: minAge, max: maxAge }
    });

    this.context.selections.age_min = minAge;
    this.context.selections.age_max = maxAge;

    this.addMessage('assistant', `참여자 연령 조건을 설정했습니다.`, {
      id: actionId,
      title: '참여 조건 변경',
      items: [
        { field: '연령', value: label }
      ]
    });

    this.updateContextCard();
  }

  // 질환 조건 설정
  handleCondition(conditionId, conditionLabel) {
    const actionId = 'condition_' + Date.now();

    this.applyToForm('condition', conditionId);

    this.changeHistory.push({
      id: actionId,
      type: 'condition',
      previous: this.context.selections.condition,
      current: conditionId
    });

    this.context.selections.condition = conditionId;

    this.addMessage('assistant', `질환 조건을 설정했습니다.`, {
      id: actionId,
      title: '참여 조건 변경',
      items: [
        { field: '필수 질환', value: conditionLabel }
      ]
    });

    this.updateContextCard();
  }

  // 데이터 항목 선택
  handleDataSelection(dataId, dataLabel) {
    const actionId = 'data_' + Date.now();

    this.applyDataSelection(dataId, true);

    this.changeHistory.push({
      id: actionId,
      type: 'data',
      dataId: dataId,
      selected: true
    });

    this.addMessage('assistant', `데이터 수집 항목을 추가했습니다.`, {
      id: actionId,
      title: '수집 항목 변경',
      items: [
        { field: '추가됨', value: dataLabel }
      ]
    });

    this.updateContextCard();
  }

  // AI 추천 적용
  handleAutoRecommend() {
    const actionId = 'recommend_' + Date.now();

    const recommendations = [
      { id: 'cgm', label: '웨어러블' },
      { id: 'heart_rate', label: '심박수' },
      { id: 'sleep', label: '수면' },
      { id: 'medication', label: '약물' },
      { id: 'diet', label: '식단' },
      { id: 'mood', label: '기분' }
    ];

    recommendations.forEach(item => {
      this.applyDataSelection(item.id, true);
    });

    this.applyToForm('age_min', 30);
    this.applyToForm('age_max', 70);
    this.applyToForm('condition', 'diabetes_t2');

    this.addMessage('assistant',
      `만성질환 연구에 최적화된 설정을 적용했습니다. 이 설정은 약물-혈당 인과관계 분석에 적합해요.`,
      {
        id: actionId,
        title: 'AI 추천 설정 적용',
        items: [
          { field: '연령', value: '30~70세' },
          { field: '질환', value: '제2형 만성질환' },
          { field: '수집 데이터', value: '웨어러블, 심박, 수면, 약물, 식단, 기분' }
        ]
      }
    );

    this.updateContextCard();
  }

  // 초기화
  handleReset() {
    const actionId = 'reset_' + Date.now();

    // 모든 선택 해제
    document.querySelectorAll('.data-item.selected').forEach(item => {
      item.classList.remove('selected');
    });

    this.context.selections = {};

    this.addMessage('assistant', '모든 설정을 초기화했습니다. 처음부터 다시 설정해주세요.');
    this.updateContextCard();
  }

  // 폼에 값 적용
  applyToForm(field, value) {
    const element = this.formElements[field] || document.querySelector(`[data-field="${field}"]`);
    if (element) {
      if (element.tagName === 'SELECT') {
        element.value = value;
      } else if (element.tagName === 'INPUT') {
        element.value = value;
      }
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // 데이터 항목 선택/해제
  applyDataSelection(dataId, selected) {
    const item = document.querySelector(`.data-item[data-id="${dataId}"]`);
    if (item) {
      item.classList.toggle('selected', selected);
      item.dispatchEvent(new Event('click', { bubbles: true }));
    }
  }

  // 되돌리기
  undoAction(actionId) {
    const action = this.changeHistory.find(h => h.id === actionId);
    if (!action) return;

    switch (action.type) {
      case 'age':
        this.applyToForm('age_min', action.previous?.min || '');
        this.applyToForm('age_max', action.previous?.max || '');
        break;
      case 'condition':
        this.applyToForm('condition', action.previous || '');
        break;
      case 'data':
        this.applyDataSelection(action.dataId, !action.selected);
        break;
    }

    this.addMessage('assistant', '이전 변경사항을 되돌렸습니다.');
  }

  // 컨텍스트 카드 업데이트
  updateContextCard() {
    const chips = document.querySelector('.ai-context-chips');
    if (!chips) return;

    const selections = this.context.selections;
    let html = '';

    if (selections.age_min) {
      const label = selections.age_max >= 100
        ? `${selections.age_min}세+`
        : `${selections.age_min}-${selections.age_max}세`;
      html += `<span class="ai-context-chip active">${label}</span>`;
    }

    if (selections.condition) {
      const labels = { diabetes_t2: '만성질환', hypertension: '고혈압' };
      html += `<span class="ai-context-chip active">${labels[selections.condition] || selections.condition}</span>`;
    }

    const selectedData = document.querySelectorAll('.data-item.selected');
    if (selectedData.length > 0) {
      html += `<span class="ai-context-chip active">${selectedData.length}개 데이터</span>`;
    }

    chips.innerHTML = html || '<span class="ai-context-chip">설정 없음</span>';
  }

  // 빠른 액션 처리
  handleQuickAction(action) {
    switch (action) {
      case 'recommend':
        this.inputField.value = 'AI 추천대로 설정해줘';
        this.sendMessage();
        break;
      case 'age40':
        this.inputField.value = '40대 이상만 모집해줘';
        this.sendMessage();
        break;
      case 'diabetes':
        this.inputField.value = '만성질환 환자만 대상으로 해줘';
        this.sendMessage();
        break;
      case 'cgm_diet':
        this.inputField.value = '웨어러블이랑 식단 데이터 추가해줘';
        this.sendMessage();
        break;
    }
  }
}

// 전역 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 현재 페이지의 스텝 감지
  const stepMatch = window.location.pathname.match(/step(\d)/);
  const currentStep = stepMatch ? parseInt(stepMatch[1]) : 1;

  window.aiChat = new AIChatPanel({
    step: currentStep,
    research: {
      title: '만성질환 약물 순응도 연구'
    }
  });
});
