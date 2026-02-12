/**
 * UniQdata Enterprise Wireframe — 디자이너 데이터 사전
 * =====================================================
 * 이 파일은 각 화면에 표시되는 데이터가 무엇이고,
 * 그 데이터가 무슨 의미이며, 얼마나 중요한지를 정리합니다.
 *
 * 🎯 목적: 디자이너가 데이터 배치를 결정할 때 참고
 * 📌 "이걸 어떻게 보여줘라"가 아니라 "이 데이터가 뭔지, 얼마나 중요한지"
 *
 * 우선순위 (priority):
 *   5 ★★★★★ 필수    — 반드시 보여야 함. 없으면 페이지 의미 없음
 *   4 ★★★★☆ 중요    — 눈에 잘 띄어야 함. 핵심 판단 근거
 *   3 ★★★☆☆ 보통    — 있으면 좋지만, 공간 부족 시 축소 가능
 *   2 ★★☆☆☆ 부가    — 접어두거나 2차 화면으로 빼도 됨
 *   1 ★☆☆☆☆ 선택    — Phase 2 이후 또는 숨김 가능
 *
 * 최종 반영: 2026-02-11 회의 결정사항 포함
 */

(() => {
  // ═══════════════════════════════════════════════════════
  // 페이지별 데이터 사전
  // ═══════════════════════════════════════════════════════

  const PAGE_DATA = {

    // ─────────────────────────────────────────────────────
    // 연구 목록 (홈)
    // ─────────────────────────────────────────────────────
    list: {
      title: '연구 목록 (홈)',
      summary: '연구자가 로그인 후 처음 보는 화면. 내 연구들의 상태를 한눈에 파악하고, 어떤 연구에 주의가 필요한지 빠르게 판단하는 곳.',
      dataFields: [
        {
          name: '연구 카드 — 연구 제목',
          meaning: '연구 프로젝트의 이름. 연구자가 직접 입력한 값.',
          source: 'research_projects.title',
          priority: 5,
          note: '카드의 핵심 식별자. 가장 크게 보여야 함.'
        },
        {
          name: '연구 카드 — 연구 상태',
          meaning: '현재 연구가 어느 단계인지. draft(초안) → recruiting(모집 중) → collecting(수집 중) → analyzing(분석 중) → completed(완료). 연구자의 다음 행동을 결정하는 핵심 정보.',
          source: 'research_projects.status',
          priority: 5,
          note: '상태별 색상/뱃지로 즉시 구분 가능해야 함. 상태 정의는 아래 statusMap 참고.'
        },
        {
          name: '연구 카드 — 현재 참여자 수',
          meaning: '이 연구에 동의하고 데이터를 제공 중인 환자 수. "내 연구에 몇 명이 참여하고 있나?"',
          source: 'agreements (status=active) COUNT',
          priority: 4,
          note: '목표 인원 대비 비율로 보여주면 더 직관적 (예: 23/50명).'
        },
        {
          name: '연구 카드 — 데이터 수집률',
          meaning: '참여자들이 예상 데이터를 얼마나 제출했는지의 비율. 수집 빈도 대비 실제 제출 건수로 계산. "데이터가 잘 모이고 있나?"',
          source: 'data_points COUNT ÷ collection_frequency 기댓값',
          priority: 4,
          note: '수치(%)와 함께 시각적 바/게이지가 효과적.'
        },
        {
          name: '연구 카드 — 이탈 추이',
          meaning: '참여자가 데이터 제출을 중단하거나 동의를 철회하는 추세. "참여자가 빠져나가고 있진 않나?"',
          source: 'agreements (status=withdrawn) 추세',
          priority: 3,
          note: '↑↓ 화살표나 미니 트렌드 아이콘으로 축약 가능. 상세는 개요에서.'
        },
        {
          name: '연구 카드 — 연구 기간',
          meaning: '연구 시작일~종료일 또는 남은 기간. 연구자가 시간적 긴급성을 판단.',
          source: 'research_projects.created_at + participation_criteria 기반 계산',
          priority: 3,
          note: '남은 일수(D-30) 또는 진행률 바로 축약 가능.'
        },
        {
          name: '새 연구 만들기 버튼',
          meaning: '연구 생성 플로우(create)로 진입하는 CTA.',
          source: '(네비게이션)',
          priority: 5,
          note: '항상 접근 가능해야 함.'
        },
        {
          name: '검색/필터',
          meaning: '연구 제목 검색, 상태별 필터링. 연구가 많아질 때 필요.',
          source: '(UI 기능)',
          priority: 2,
          note: '초기(연구 1-3개)에는 덜 중요. 연구가 늘어나면 중요해짐.'
        }
      ],
      removedData: [
        {
          name: '전체 연구 총 참여자 수',
          reason: '2/11 회의: 프로젝트별 관리가 핵심이므로 합산값은 의미 약함. 삭제.',
          date: '2026-02-11'
        },
        {
          name: '전체 수집된 데이터 총량',
          reason: '2/11 회의: IRB 심사 시 데이터 변경 시 재심 필요. 프로젝트별로만 관리. 삭제.',
          date: '2026-02-11'
        }
      ],
      statusMap: {
        draft: '초안 — 연구 설계 중. 아직 IRB 제출 전.',
        irb_submitted: '심의 중 — IRB에 제출됨. 승인 대기 중. (신규 상태)',
        irb_revision: '수정 요청 — IRB에서 반려, 연구 설계 수정 필요. (신규 상태)',
        recruiting: '모집 중 — IRB 승인 완료. 참여자 모집 진행 중.',
        collecting: '수집 중 — 참여자 확보 완료. 데이터 수집 진행.',
        analyzing: '분석 중 — 데이터 수집 완료. AI 분석 단계.',
        completed: '완료 — 연구 종료. 결과 확인 가능.',
        cancelled: '취소 — 연구 중단됨.'
      },
      designNotes: '2/11 회의: 홈에서 "합산 통계(전체 참여자, 전체 데이터)"를 제거하고 프로젝트 카드 중심으로. 각 카드가 연구의 건강 상태를 즉시 보여줘야 함.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 1 (AI 인터뷰)
    // ─────────────────────────────────────────────────────
    create: {
      title: '연구 생성 — AI 인터뷰',
      summary: '연구자가 AI 채팅으로 연구 목적, 대상, 데이터 종류를 정의하는 첫 단계. AI가 질문하고, 답변을 바탕으로 연구 설계 초안을 자동 생성.',
      dataFields: [
        {
          name: 'AI 채팅 인터페이스',
          meaning: 'AI가 연구 목적·방법론·대상을 질문하고, 연구자의 답변에서 구조화된 연구 설계를 추출.',
          source: '(AI 모듈)',
          priority: 5,
          note: '전체 화면의 핵심. 채팅 UX에 집중.'
        },
        {
          name: '단계 진행 표시 (Step 1/5)',
          meaning: '전체 연구 생성 플로우에서 현재 위치. 연구자가 "얼마나 남았는지" 인지.',
          source: '(UI 상태)',
          priority: 4,
          note: '스텝 바 또는 프로그레스로 표현.'
        },
        {
          name: '연구 제목 (자동 생성)',
          meaning: 'AI가 대화에서 추출한 연구 제목 초안.',
          source: 'research_projects.title (AI 생성)',
          priority: 3,
          note: '채팅 중 사이드에서 실시간 업데이트되면 좋음. 나중에 수정 가능.'
        },
        {
          name: '연구 방법론',
          meaning: 'longitudinal(종단) / cross_sectional(횡단) / cohort(코호트) / case_control(환자대조). 연구 설계의 뼈대를 결정하는 핵심 분류.',
          source: 'research_projects.methodology',
          priority: 3,
          note: 'AI 대화 중 자동 추출. 사이드 요약에 표시.'
        },
        {
          name: '힌트 칩',
          meaning: '연구자가 답변하기 어려울 때 탭할 수 있는 예시 답변 버튼.',
          source: '(AI 모듈 제공)',
          priority: 2,
          note: '채팅 입력 위에 가볍게 배치.'
        }
      ],
      removedData: [],
      designNotes: 'AI 채팅이 메인. 오른쪽이나 하단에 연구 설계 요약이 실시간 업데이트되는 구조가 이상적.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 2 (설계 확인)
    // ─────────────────────────────────────────────────────
    'create-step2': {
      title: '연구 생성 — 설계 확인',
      summary: 'AI가 생성한 연구 설계 초안을 연구자가 검토하고 수정하는 단계. 참여 조건, 수집 데이터, 기간 등을 확정.',
      dataFields: [
        {
          name: '연구 제목',
          meaning: '연구 프로젝트명. 수정 가능.',
          source: 'research_projects.title',
          priority: 5,
          note: '인라인 편집 가능하게.'
        },
        {
          name: '연구 설명',
          meaning: '연구 목적·배경 설명문. AI가 초안 생성, 연구자가 수정.',
          source: 'research_projects.description',
          priority: 4,
          note: '텍스트 에어리어.'
        },
        {
          name: '연구 방법론',
          meaning: '종단/횡단/코호트/환자대조 중 선택.',
          source: 'research_projects.methodology',
          priority: 4,
          note: '드롭다운 또는 카드 선택.'
        },
        {
          name: '참여 조건 — 연령 범위',
          meaning: '참여 대상의 최소/최대 나이. 환자 매칭에 사용.',
          source: 'participation_criteria.age_min / age_max',
          priority: 4,
          note: '슬라이더 또는 숫자 입력.'
        },
        {
          name: '참여 조건 — 필수 질환',
          meaning: '참여자가 반드시 가지고 있어야 하는 건강 상태. 예: 제2형 당뇨, 고혈압.',
          source: 'participation_criteria.conditions[]',
          priority: 4,
          note: '태그/칩 형태로 추가/삭제.'
        },
        {
          name: '참여 조건 — 제외 조건',
          meaning: '이 조건에 해당하면 참여 불가. 예: 임신, 심장박동기 사용.',
          source: 'participation_criteria.exclusions[]',
          priority: 3,
          note: '태그/칩 형태.'
        },
        {
          name: '참여 조건 — 필수 데이터',
          meaning: '참여자가 반드시 보유해야 하는 과거 데이터. 예: 30일 심박 데이터.',
          source: 'participation_criteria.required_data[]',
          priority: 3,
          note: '이 조건으로 참여자 자동 매칭됨.'
        },
        {
          name: '참여 조건 — 지역 제한',
          meaning: '참여 가능 국가/지역. 예: KR, US.',
          source: 'participation_criteria.regions[]',
          priority: 2,
          note: 'MVP에서는 KR 고정일 수도.'
        },
        {
          name: '목표 참여자 수',
          meaning: '연구에 필요한 최소 참여 인원.',
          source: 'research_projects.target_participants',
          priority: 4,
          note: '숫자 입력.'
        },
        {
          name: '연구 기간 (일)',
          meaning: '데이터 수집 기간. 연구 전체 기간이 아니라 수집 기간.',
          source: 'research_projects.duration_days',
          priority: 3,
          note: '캘린더 또는 일수 입력.'
        },
        {
          name: '누락 항목 경고',
          meaning: '필수 항목이 비어 있을 때 경고. IRB 제출 전 모든 항목 완성 필요.',
          source: '(프론트엔드 검증)',
          priority: 4,
          note: '비어 있는 필드에 인라인 경고 또는 요약 경고.'
        }
      ],
      removedData: [],
      designNotes: '폼 전체를 한 화면에 보여주되, 섹션별로 구분. 수정 가능한 항목은 명확히. 다음 단계로 넘어가기 전에 검증.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 3 (데이터 수집 설계)
    // ─────────────────────────────────────────────────────
    'create-step3': {
      title: '연구 생성 — 데이터 수집 설계',
      summary: '어떤 건강 데이터를 어떤 빈도로 수집할지 결정. 패시브(자동 수집), 능동(환자 입력), 바이오마커(기기 연동) 3가지 범주.',
      dataFields: [
        {
          name: '패시브 데이터 선택',
          meaning: '웨어러블이 자동 수집하는 데이터. 환자가 별도 행동 불필요. 예: 심박수, 걸음 수, 수면, 혈중산소.',
          source: 'data_collection_configs.passive_data[]',
          priority: 5,
          note: '체크박스 또는 토글 리스트. 각 항목에 "이 데이터가 뭔지" 짧은 설명 필요.'
        },
        {
          name: '능동 데이터 선택',
          meaning: '환자가 직접 입력하는 주관적 데이터. 예: 기분, 통증 수준, 에너지, 스트레스.',
          source: 'data_collection_configs.active_data[]',
          priority: 5,
          note: '체크박스 또는 토글. 참여자 부담이 커지므로 "부담도 미리보기" 같은 힌트가 좋음.'
        },
        {
          name: '바이오마커 선택',
          meaning: '특수 기기로 수집하는 생체 데이터. 예: 음성 분석, CGM(연속혈당계), 혈압.',
          source: 'data_collection_configs.biomarkers[]',
          priority: 4,
          note: '기기가 필요하므로 "참여자가 이 기기를 보유해야 함" 경고 필요.'
        },
        {
          name: '수집 빈도',
          meaning: '각 데이터를 얼마나 자주 수집하는지. 패시브는 "연속" 가능, 능동은 "하루 3회" 등.',
          source: 'data_collection_configs.collection_frequency (JSON)',
          priority: 4,
          note: '데이터 선택과 함께 빈도 옵션이 연동되면 좋음.'
        },
        {
          name: '참여자 부담 계산',
          meaning: '선택한 데이터와 빈도를 기반으로 참여자의 하루 입력 부담을 예측. "하루에 몇 번 앱을 열어야 하는지?"',
          source: '(프론트엔드 계산)',
          priority: 3,
          note: '부담이 과하면 이탈률 증가. 경고 표시 고려.'
        }
      ],
      removedData: [],
      designNotes: '3가지 범주(패시브/능동/바이오마커)를 명확히 구분. 각 항목 선택 시 부담도가 실시간 반영되면 이상적.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 4 (예산 + 프로젝트 지갑)
    // 2/11: Step 4에서 AI 도구 선택 제거, 예산→지갑 자동 생성
    // ─────────────────────────────────────────────────────
    'create-step4': {
      title: '연구 생성 — 예산 계획',
      summary: '연구 예산을 설정하면 프로젝트 전용 지갑이 자동 생성됨. 참여자 보상, 플랫폼 수수료 등 비용 구조를 확인.',
      dataFields: [
        {
          name: '참여자당 보상 금액',
          meaning: '한 명의 참여자가 데이터 수집 기간 동안 받을 총 보상(XRP). "환자에게 얼마를 줄 것인가?"',
          source: 'budget 설정 → settlements 기반',
          priority: 5,
          note: '이 값 × 목표 인원 = 총 보상 예산. 핵심 입력값.'
        },
        {
          name: '목표 참여자 수',
          meaning: '이전 단계에서 설정한 값. 예산 계산에 사용.',
          source: 'research_projects.target_participants',
          priority: 4,
          note: '읽기 전용 참조값.'
        },
        {
          name: '총 예산 계산',
          meaning: '보상 + 수수료 + 추가 비용의 합계. 자동 계산.',
          source: '(프론트엔드 계산)',
          priority: 5,
          note: '큰 숫자로 눈에 띄게. 연구자가 "이 정도면 되겠나" 판단.'
        },
        {
          name: '플랫폼 수수료',
          meaning: 'UniQdata 플랫폼이 가져가는 비율 또는 금액.',
          source: '(비즈니스 로직)',
          priority: 3,
          note: '투명하게 보여주되, 보상보다는 작게.'
        },
        {
          name: '프로젝트 지갑 자동 생성 안내',
          meaning: '예산 확정 시 이 연구 전용 블록체인 지갑이 자동 생성된다는 안내.',
          source: 'project_wallets (자동 생성)',
          priority: 4,
          note: '2/11 회의: 블록체인 용어 최소화. "연구 전용 계좌가 만들어집니다" 정도로.'
        },
        {
          name: 'Passkey 인증 (확정 시)',
          meaning: '예산을 확정하려면 Passkey(비밀번호 같은 것)로 한 번 더 인증. 돈이 관련되므로.',
          source: '(인증 모듈)',
          priority: 4,
          note: '2/11 회의: "패스키"를 쉬운 말로. "비밀번호로 확인"처럼. 분실 시 경고 필요.'
        }
      ],
      removedData: [
        {
          name: 'AI 도구 선택',
          reason: '2/11 이전 회의: Step 4에서 AI 도구 선택 제거됨. AI 허브에서 통합 관리.',
          date: '2026-02-07'
        }
      ],
      designNotes: '2/11 회의: 블록체인 전문용어(에스크로, TX, 해시) 사용 금지. 금융 상품처럼 물음표(?) 아이콘으로 배경 설명 제공. 패스키 분실 경고 서브텍스트 추가.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 5 (에스크로 → 완료)
    // ─────────────────────────────────────────────────────
    'create-step5': {
      title: '연구 생성 — 완료',
      summary: '예산이 확정되고 프로젝트 지갑이 생성되면 연구 등록 완료. 다음은 IRB 제출.',
      dataFields: [
        {
          name: '완료 확인 메시지',
          meaning: '연구가 성공적으로 생성되었다는 알림.',
          source: '(UI 상태)',
          priority: 5,
          note: '성공 화면.'
        },
        {
          name: 'IRB 제출 안내',
          meaning: '연구 설계 완료 후 IRB 심의를 받아야 함을 안내. "다음 단계: IRB 제출"',
          source: '(네비게이션)',
          priority: 5,
          note: '2/11 회의: 투 스텝 프로세스. 설계 완료 → IRB 제출/현황 확인.'
        },
        {
          name: '프로젝트 지갑 주소',
          meaning: '자동 생성된 연구 전용 지갑의 주소.',
          source: 'project_wallets.wallet_address',
          priority: 2,
          note: '기술적 정보. 대부분의 연구자에게 불필요. 축소/숨김 가능.'
        }
      ],
      removedData: [],
      designNotes: '심플한 완료 화면 + IRB 제출로의 명확한 CTA.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 생성 Step 6 (에스크로 설정 — 삭제 검토 중)
    // ─────────────────────────────────────────────────────
    'create-step6': {
      title: '에스크로 설정 (삭제 검토 중)',
      summary: 'Step 4/5로 통합 가능. 별도 단계로 남길지 논의 중.',
      dataFields: [],
      removedData: [
        {
          name: '별도 에스크로 설정 페이지',
          reason: '예산 확정 시 프로젝트 지갑이 자동 생성되므로 별도 에스크로 설정은 불필요할 수 있음.',
          date: '2026-02-07'
        }
      ],
      designNotes: '삭제 후보. Step 4-5로 통합 검토 중.'
    },

    // ─────────────────────────────────────────────────────
    // 연구 개요 (프로젝트 상세 — 개요 탭)
    // ─────────────────────────────────────────────────────
    'data-overview': {
      title: '연구 개요 (프로젝트 상세 — 개요 탭)',
      summary: '특정 연구의 핵심 성과 지표를 한눈에. 참여자, 수집률, 예산, 시간적 진행 등을 대시보드 형태로 제공.',
      dataFields: [
        // KPI 카드들
        {
          name: 'KPI — 현재 참여자 수',
          meaning: '현재 이 연구에 동의하고 활동 중인 참여자 수. "지금 몇 명이 데이터를 보내고 있나?"',
          source: 'agreements WHERE status=active, COUNT',
          priority: 5,
          note: '목표 대비 비율 함께 표시 (예: 23/50). 카드형 KPI.'
        },
        {
          name: 'KPI — 데이터 수집률',
          meaning: '예상 데이터 제출량 대비 실제 제출량의 백분율. "데이터가 계획대로 모이고 있나?"',
          source: 'data_points COUNT ÷ (참여자 수 × 수집빈도 × 경과일)',
          priority: 5,
          note: '%로 표시. 낮으면 경고(빨강), 높으면 정상(초록).'
        },
        {
          name: 'KPI — 평균 응답 시간',
          meaning: '능동 데이터(설문 등) 요청 후 참여자가 응답하기까지 걸린 평균 시간.',
          source: 'data_points.timestamp - 요청 시점',
          priority: 3,
          note: '패시브 데이터만 있는 연구에서는 의미 없을 수 있음.'
        },
        {
          name: 'KPI — 예상 완료일',
          meaning: '현재 수집 속도를 기반으로 언제 데이터 수집이 끝날지 예측.',
          source: '(계산값)',
          priority: 3,
          note: '목표 인원/데이터량 충족 예상일.'
        },

        // 차트/그래프
        {
          name: '차트 — 참여자 등록 추이',
          meaning: '시간 축(X)에 따른 누적 참여자 수(Y). 모집이 얼마나 빠르게 진행되는지.',
          source: 'agreements.created_at 누적 카운트',
          priority: 4,
          note: '라인 차트. 목표선(target_participants) 함께 표시하면 효과적.'
        },
        {
          name: '차트 — 데이터 수집률 (도넛)',
          meaning: '전체 수집 목표 대비 현재 달성률을 도넛 차트로.',
          source: 'data_points 집계',
          priority: 4,
          note: '한눈에 "어디까지 왔나" 파악.'
        },
        {
          name: '차트 — 메트릭별 응답률',
          meaning: '각 데이터 종류(심박, 수면, 기분 등)별로 얼마나 잘 수집되는지. "심박은 잘 오는데 기분 입력은 안 하네?"',
          source: 'data_points GROUP BY category/metric, COUNT',
          priority: 3,
          note: '바 차트. 어떤 데이터가 부족한지 빠르게 파악.'
        },

        // 프로젝트 지갑 정보
        {
          name: '프로젝트 지갑 — 잔액',
          meaning: '이 연구 전용 지갑에 남은 금액(XRP). "보상 줄 돈이 얼마나 남았나?"',
          source: 'project_wallets: total_deposited - total_spent',
          priority: 4,
          note: '2/11 회의: 예산 사용을 별도 탭에서 관리하되, 개요에서도 잔액은 보여줘야 함.'
        },
        {
          name: '프로젝트 지갑 — 총 예산',
          meaning: '이 연구에 입금된 총 금액.',
          source: 'project_wallets.total_deposited',
          priority: 3,
          note: '잔액과 함께 "예산 소진률" 바로 표시.'
        },
        {
          name: '프로젝트 지갑 — 지출',
          meaning: '지금까지 참여자 보상 등으로 사용된 금액.',
          source: 'project_wallets.total_spent',
          priority: 3,
          note: '예산 대비 %.'
        },

        // 탭 네비게이션
        {
          name: '탭 — 개요 / 데이터 원본 / AI 허브 / 예산 관리',
          meaning: '연구 상세 화면의 4개 탭. 현재 보고 있는 탭을 강조.',
          source: '(네비게이션)',
          priority: 5,
          note: '2/11 회의: "테이블" → "데이터 원본" 등 직관적 명칭 검토 중. "예산 관리" 탭 신규 분리.'
        }
      ],
      removedData: [],
      designNotes: 'KPI 카드 → 차트 → 지갑 요약 순서로. 연구자가 위에서 아래로 훑으면서 연구 건강 상태를 파악.'
    },

    // ─────────────────────────────────────────────────────
    // 데이터 원본 (구 "테이블") — 프로젝트 상세 탭
    // 2/11: "테이블" → 직관적 명칭 변경 중
    // ─────────────────────────────────────────────────────
    'data-table': {
      title: '데이터 원본 (구 "테이블")',
      summary: '수집된 원시 데이터를 참여자별 또는 날짜별로 조회. 연구자가 실제 데이터를 눈으로 확인하는 곳.',
      dataFields: [
        // 뷰 전환
        {
          name: '뷰 전환 — 날짜별 / 참여자별',
          meaning: '두 가지 보기 방식을 전환. 날짜별: 특정 날의 모든 참여자 데이터. 참여자별: 특정 참여자의 전체 기록.',
          source: '(UI 상태)',
          priority: 5,
          note: '탭 또는 토글 스위치.'
        },

        // 날짜별 뷰
        {
          name: '날짜 선택기',
          meaning: '조회할 날짜를 선택. 좌우 화살표로 하루씩 이동.',
          source: '(UI 컨트롤)',
          priority: 5,
          note: '날짜별 뷰의 핵심 컨트롤.'
        },
        {
          name: '참여자 ID (익명)',
          meaning: '각 참여자의 식별 번호. 개인정보 보호를 위해 익명화. 예: P001, P002.',
          source: 'agreements → user_id (해시/매핑)',
          priority: 5,
          note: '실명이 아니라 연구 내 코드. 행의 첫 번째 열.'
        },
        {
          name: '로컬명',
          meaning: '연구자가 참여자에게 붙인 별칭. 예: "김OO" 또는 자체 코드.',
          source: '(연구자 설정)',
          priority: 3,
          note: '없을 수도 있음. 있으면 ID 옆에.'
        },
        {
          name: '수집 데이터 열 (동적)',
          meaning: '이 연구에서 수집 중인 데이터 종류가 각각 열이 됨. 예: 심박수, 혈당, 복약, 수면, 기분 등. 연구마다 다름.',
          source: 'data_points.value (category/metric별)',
          priority: 5,
          note: '연구의 data_collection_configs에 따라 열이 동적 생성. 데이터 없으면 빈칸 또는 "-".'
        },

        // 참여자별 뷰
        {
          name: '참여자 검색/선택',
          meaning: '특정 참여자를 검색하거나 드롭다운으로 선택.',
          source: 'agreements (active 참여자 목록)',
          priority: 4,
          note: '참여자별 뷰에서 사용.'
        },
        {
          name: '기간 범위',
          meaning: '해당 참여자의 데이터를 보여줄 기간 범위.',
          source: 'agreements.start_date ~ end_date',
          priority: 3,
          note: '캘린더 또는 프리셋(최근 7일/30일/전체).'
        },

        // 공통
        {
          name: '정렬 옵션',
          meaning: '참여자 ID순, 가나다순, 등록순, 최근 활동순.',
          source: '(UI 기능)',
          priority: 3,
          note: '열 헤더 클릭으로 정렬.'
        },
        {
          name: 'CSV/Excel 내보내기',
          meaning: '현재 보고 있는 데이터를 파일로 다운로드. 학술 논문이나 외부 분석용.',
          source: 'data_points → export',
          priority: 3,
          note: '내보내기 시 Passkey 재인증 필요. XRPL에 기록 남음.'
        }
      ],
      removedData: [],
      designNotes: '2/11 회의: "테이블"이라는 이름이 직관적이지 않음. "연구 원본", "연구 데이터", "연구 기록" 등 검토 중. 데이터 열은 연구마다 다르므로 가로 스크롤 필요.'
    },

    // ─────────────────────────────────────────────────────
    // AI 허브 (구 개별 분석 페이지들 통합)
    // ─────────────────────────────────────────────────────
    'analysis-discovery': {
      title: 'AI 허브',
      summary: '모든 AI 분석 도구를 하나의 허브에서 접근. 인과 발견, SHAP, What-If, 이상 감지 등. 이전에 분리되어 있던 5개 분석 페이지를 통합.',
      dataFields: [
        {
          name: '분석 도구 선택',
          meaning: '어떤 AI 분석을 실행할지 선택. 인과 발견(PC/FCI), 변수 중요도(SHAP), 시뮬레이션(What-If), 이상 추적 등.',
          source: '(UI 메뉴)',
          priority: 5,
          note: '탭 또는 사이드바 메뉴로 도구 전환.'
        },
        {
          name: '변수 목록',
          meaning: '이 연구에서 수집 중인 데이터 종류의 목록. 분석할 변수를 선택하는 데 사용.',
          source: 'data_collection_configs.passive_data + active_data + biomarkers',
          priority: 5,
          note: '데이터 수집 설계에서 정의한 항목들이 그대로 변수가 됨.'
        },
        {
          name: '데이터 포인트 수',
          meaning: '분석에 사용 가능한 데이터 양. "이 정도 데이터면 의미 있는 분석이 가능한가?"',
          source: 'data_points COUNT',
          priority: 4,
          note: '데이터가 부족하면 "데이터가 더 필요합니다" 경고.'
        },
        {
          name: '시간 범위',
          meaning: '분석 대상 기간. 전체 수집 기간 또는 특정 구간.',
          source: 'data_points.timestamp 범위',
          priority: 3,
          note: '날짜 범위 선택기.'
        },

        // 인과 발견 관련
        {
          name: '인과 그래프',
          meaning: '변수 간의 인과 관계를 시각화한 방향 그래프. 노드 = 변수, 엣지 = 인과 관계, 엣지 굵기 = 인과 강도.',
          source: 'ai_analyses.result (causal graph)',
          priority: 5,
          note: '인과 발견 선택 시 메인 시각화. 인터랙티브(클릭, 드래그, 줌).'
        },
        {
          name: '인과 강도 임계값 슬라이더',
          meaning: '어느 정도 강도 이상의 인과 관계만 보여줄지 필터링.',
          source: '(UI 컨트롤)',
          priority: 3,
          note: '슬라이더. 노이즈 제거용.'
        },
        {
          name: '알고리즘 선택',
          meaning: '인과 발견에 사용할 알고리즘. PC, FCI, NOTEARS, LiNGAM 등. 연구자가 방법론에 따라 선택.',
          source: '(UI 선택)',
          priority: 3,
          note: '전문 연구자용. 기본값 제공하되 변경 가능.'
        },

        // SHAP 관련
        {
          name: 'SHAP — 변수 중요도 랭킹',
          meaning: '어떤 변수가 결과에 가장 큰 영향을 미치는지 순위. 예: "수면이 혈당에 가장 큰 영향"',
          source: 'ai_analyses.result (SHAP values)',
          priority: 4,
          note: 'SHAP 선택 시. 바 차트/워터폴.'
        },

        // What-If 관련
        {
          name: 'What-If — 시나리오 입력',
          meaning: '"만약 이 변수를 이렇게 바꾸면?" 시뮬레이션. 슬라이더로 변수값 조절.',
          source: '(AI 모델)',
          priority: 3,
          note: 'What-If 선택 시. 인터랙티브 슬라이더 + 결과 미리보기.'
        }
      ],
      removedData: [
        {
          name: 'analysis-importance.html (별도 페이지)',
          reason: 'AI 허브로 통합',
          date: '2026-02-07'
        },
        {
          name: 'analysis-personalized.html (별도 페이지)',
          reason: 'AI 허브로 통합',
          date: '2026-02-07'
        },
        {
          name: 'analysis-whatif.html (별도 페이지)',
          reason: 'AI 허브로 통합',
          date: '2026-02-07'
        },
        {
          name: 'analysis-rootcause.html (별도 페이지)',
          reason: 'AI 허브로 통합',
          date: '2026-02-07'
        }
      ],
      designNotes: 'AI 분석 도구 5개를 하나의 허브로 통합. 좌측 메뉴 또는 탭으로 도구 전환, 오른쪽에 결과 시각화.'
    },

    // ─────────────────────────────────────────────────────
    // 조치 센터 (삭제 검토 중)
    // 2/11: IRB 반려 시 즉시 연구 설계 수정이 더 나은 UX
    // ─────────────────────────────────────────────────────
    'action-center': {
      title: '조치 센터 (삭제 검토 중)',
      summary: '원래 IRB 반려/이상 감지 시 조치가 필요한 항목을 모아두는 곳이었으나, 2/11 회의에서 별도 페이지 대신 즉시 해결 방식이 더 낫다고 합의.',
      dataFields: [
        {
          name: '긴급 조치 카운트',
          meaning: '즉시 대응이 필요한 이슈 수.',
          source: '(AI/규칙 기반 알림)',
          priority: 3,
          note: '삭제 검토 중. 알림 센터로 대체 가능.'
        },
        {
          name: '주의 관찰 카운트',
          meaning: '지켜봐야 하는 이슈 수.',
          source: '(AI/규칙 기반)',
          priority: 2,
          note: '삭제 검토 중.'
        },
        {
          name: '조치 카드',
          meaning: '각 이슈의 상세 정보와 조치 버튼.',
          source: '(알림/AI 분석)',
          priority: 2,
          note: '삭제 검토 중.'
        }
      ],
      removedData: [
        {
          name: '조치 센터 페이지 전체',
          reason: '2/11 회의: IRB 반려 시 조치 센터로 보내는 것보다, 심의 페이지에서 반려 사유 확인 → 연구 설계 바로 수정이 더 직관적. 별도 페이지 추가는 복잡성만 증가.',
          date: '2026-02-11'
        }
      ],
      designNotes: '삭제 후보. 대신 각 페이지에 인라인 알림/경고로 대체하는 방향.'
    },

    // ─────────────────────────────────────────────────────
    // 연구비 관리 (구 "결제 에스크로" → 명칭 변경)
    // 2/11: 별도 탭으로 분리, 쉬운 명칭 사용
    // ─────────────────────────────────────────────────────
    billing: {
      title: '연구비 관리 (구 "결제 에스크로")',
      summary: '개인 지갑과 프로젝트 지갑의 자금 관리. 입금, 이체, 정산 내역 확인. 2/11 회의: 돈 관련 복잡성이 커서 별도 탭으로 분리.',
      dataFields: [
        // 개인 지갑
        {
          name: '개인 지갑 — 잔액',
          meaning: '연구자 개인의 XRP 보유량. 여기서 프로젝트 지갑으로 이체.',
          source: 'wallets (owner_id, type=MAIN) → XRPL 잔액 조회',
          priority: 5,
          note: '2/11 회의: GNB(상단 메뉴바)에도 간단히 보여줄 것. 이 페이지에서는 상세.'
        },
        {
          name: '개인 지갑 — 지갑 주소',
          meaning: 'XRPL 블록체인 주소. 외부에서 입금 시 필요.',
          source: 'wallets.address',
          priority: 2,
          note: '복사 가능하게. 일반적으로는 숨김.'
        },

        // 프로젝트 지갑 목록
        {
          name: '프로젝트 지갑 목록',
          meaning: '각 연구별 전용 지갑 카드. 연구명 + 잔액 표시.',
          source: 'project_wallets JOIN research_projects',
          priority: 5,
          note: '연구가 여러 개면 카드 여러 개. 각 카드에 연구명과 잔액.'
        },
        {
          name: '프로젝트 지갑 — 연구명',
          meaning: '어떤 연구의 지갑인지 식별.',
          source: 'research_projects.title',
          priority: 5,
          note: '지갑 카드의 제목.'
        },
        {
          name: '프로젝트 지갑 — 잔액',
          meaning: '해당 연구에 남은 예산.',
          source: 'project_wallets: total_deposited - total_spent',
          priority: 5,
          note: '금액 + 예산 대비 %.'
        },
        {
          name: '프로젝트 지갑 — 예산',
          meaning: '이 연구에 할당된 총 예산.',
          source: 'project_wallets.total_deposited',
          priority: 4,
          note: '잔액과 비교.'
        },
        {
          name: '프로젝트 지갑 — 지출',
          meaning: '참여자 보상 등으로 사용된 금액.',
          source: 'project_wallets.total_spent',
          priority: 4,
          note: '지출 내역은 원장에서 확인.'
        },

        // 액션 버튼
        {
          name: '입금하기 (외부→개인)',
          meaning: '외부 지갑에서 개인 지갑으로 XRP 입금.',
          source: '(XRPL 트랜잭션)',
          priority: 4,
          note: '버튼 → 팝업/모달.'
        },
        {
          name: '출금하기 (개인→외부)',
          meaning: '개인 지갑에서 외부 주소로 XRP 출금.',
          source: '(XRPL 트랜잭션)',
          priority: 3,
          note: 'Passkey 인증 필요. 출금 주소 입력 + 금액.'
        },
        {
          name: '프로젝트 지갑 충전 (개인→프로젝트)',
          meaning: '개인 지갑에서 특정 프로젝트 지갑으로 자금 이체. "연구비 충전"',
          source: 'project_wallet_deposits',
          priority: 4,
          note: '2/11 회의: 복잡한 자금 이동 프로세스. 팝업에서 출발/도착/금액 확인.'
        },

        // 지출 원장
        {
          name: '연구별 지출/정산 원장',
          meaning: '각 연구의 지출 기록. 어떤 참여자에게 얼마를 언제 보상했는지.',
          source: 'settlements + project_wallet_withdrawals',
          priority: 4,
          note: '테이블 형태. 열: 날짜, 연구명, 참여자, 금액, TX(트랜잭션 해시), 상태.'
        },
        {
          name: '정산 원장 — TX 해시',
          meaning: '블록체인 거래 고유 ID. 복사해서 URL에 붙이면 거래 기록을 누구나 확인 가능.',
          source: 'settlements.tx_hash / project_wallet_withdrawals.tx_hash',
          priority: 2,
          note: '2/11 회의: 복사 버튼 필요. 클릭하면 XRPL 탐색기로 이동. 일반 연구자에겐 낯설 수 있으므로 물음표 아이콘 설명 추가.'
        },
        {
          name: '정산 원장 — 금액/상태',
          meaning: '보상 금액과 정산 상태(완료/대기).',
          source: 'settlements.amount, status',
          priority: 4,
          note: '수치는 명확하게.'
        },
        {
          name: '예산 회수 (프로젝트→개인)',
          meaning: '연구 중도 이탈 등의 이유로 프로젝트 지갑에서 남은 예산을 개인 지갑으로 회수.',
          source: 'project_wallet_withdrawals',
          priority: 2,
          note: '2/11 회의: 이 프로세스가 추가되면서 복잡성 증가 → 별도 탭 분리 이유.'
        }
      ],
      removedData: [
        {
          name: '"결제 에스크로" 명칭',
          reason: '2/11 회의: "에스크로"는 블록체인 전문용어. "연구비 정산", "연구비 지출 관리" 등 쉬운 말로 변경 예정.',
          date: '2026-02-11'
        },
        {
          name: '출금이체 탭',
          reason: '2/7 회의: 즉시 출금만 남기고 출금이체 탭 제거.',
          date: '2026-02-07'
        }
      ],
      designNotes: '2/11 회의: 돈과 관련된 탭은 복잡성이 커서 별도 탭 분리. 개인 지갑 ↔ 프로젝트 지갑 이원화 구조. 블록체인 용어 대신 금융 상품 스타일의 UX. 물음표/느낌표 아이콘으로 배경 설명 제공.'
    },

    // ─────────────────────────────────────────────────────
    // GNB (Global Navigation Bar) — 전체 화면 공통
    // ─────────────────────────────────────────────────────
    _gnb: {
      title: 'GNB (공통 상단 메뉴)',
      summary: '모든 페이지에 공통으로 표시되는 상단 네비게이션 바.',
      dataFields: [
        {
          name: '개인 지갑 잔액 (간략)',
          meaning: '연구자의 XRP 보유량. GNB에서는 숫자만 간단히.',
          source: 'wallets (MAIN) → XRPL 잔액',
          priority: 4,
          note: '2/11 회의: GNB에 개인 지갑 스테이터스(보유 금액)만 간단히 표시.'
        },
        {
          name: '메뉴 항목',
          meaning: '새 연구 → 내 연구 → [연구명] → 개요/데이터 원본/AI 허브/예산 관리',
          source: '(네비게이션)',
          priority: 5,
          note: '2/11 회의 확정 메뉴 구조.'
        },
        {
          name: '알림 아이콘',
          meaning: '읽지 않은 알림 수. 클릭하면 알림 목록.',
          source: 'notifications (read_at IS NULL) COUNT',
          priority: 3,
          note: '조치 센터를 삭제하면 알림이 더 중요해짐.'
        },
        {
          name: '프로필/설정',
          meaning: '연구자 계정 정보, 로그아웃.',
          source: 'accounts / owners',
          priority: 3,
          note: '아바타 또는 이니셜.'
        }
      ],
      removedData: [],
      designNotes: '2/11 회의: 개인 지갑 잔액을 GNB에 간단히 표시 (숫자만). 프로젝트 지갑은 GNB에 표시 안 함.'
    },

    // ─────────────────────────────────────────────────────
    // IRB 현황 페이지 (신규 — 2/11 회의)
    // ─────────────────────────────────────────────────────
    _irb_status: {
      title: 'IRB 현황 (신규 페이지)',
      summary: '2/11 회의: 연구 설계 → IRB 제출의 투 스텝 프로세스. 이 페이지에서 IRB 심의 상태를 확인하고, 반려 시 바로 연구 설계 수정으로 이동.',
      dataFields: [
        {
          name: 'IRB 제출 상태',
          meaning: '현재 IRB 심의가 어느 단계인지. draft(초안) → submitted(제출됨) → under_review(심사 중) → approved(승인) / revision_requested(수정 요청) / rejected(반려).',
          source: 'irb_submissions.status',
          priority: 5,
          note: '상태별 색상/아이콘으로 즉시 구분.'
        },
        {
          name: 'IRB 반려 사유',
          meaning: 'IRB 위원이 반려한 이유. 연구자가 이를 보고 연구 설계를 수정.',
          source: 'irb_review_comments.comment + irb_submissions.irb_comment_summary',
          priority: 5,
          note: '2/11 회의: 반려 시 여기서 사유 확인 → "연구 설계 수정하기" 버튼으로 바로 이동. 조치 센터 거치지 않음.'
        },
        {
          name: '제출 서류 목록',
          meaning: 'IRB에 제출한 서류 리스트. 자가점검표, 심의신청서, 연구계획서, 생명윤리서약서, 동의서 등.',
          source: 'irb_documents (submission_id)',
          priority: 4,
          note: '각 서류의 상태(초안/준비완료/제출됨) 표시.'
        },
        {
          name: 'IRB 심의 유형',
          meaning: '면제 확인 / 정규 심의 / 자발적 심의. AI가 연구 내용을 보고 자동 판정.',
          source: 'irb_determinations.determination_result',
          priority: 4,
          note: '면제 가능 시 간소화된 절차 안내.'
        },
        {
          name: 'XRPL 승인 기록',
          meaning: 'IRB 승인 시 블록체인에 기록되는 불변 증거.',
          source: 'irb_submissions.xrpl_tx_hash (APPROVED 시)',
          priority: 1,
          note: '기술적 정보. 대부분 숨김. 필요 시 확인.'
        },
        {
          name: '연구 설계 수정하기 버튼',
          meaning: '반려 시 바로 연구 설계(create 플로우)로 돌아가는 CTA.',
          source: '(네비게이션)',
          priority: 5,
          note: '2/11 회의 핵심: 조치 센터 없이, 반려 사유 확인 → 바로 수정.'
        }
      ],
      removedData: [],
      designNotes: '2/11 회의에서 결정된 신규 페이지. 투 스텝(연구 설계 → IRB 현황)의 두 번째 스텝. IRB 승인된 프로젝트만 "내 연구"에 포함. 반려 시 조치 센터가 아니라 여기서 바로 수정으로.'
    }
  };

  // ═══════════════════════════════════════════════════════
  // 공통 용어 사전 (전 페이지 공통)
  // ═══════════════════════════════════════════════════════

  const GLOSSARY = {
    '참여자': '연구에 동의하고 데이터를 제공하는 환자/사용자. agreement 상태가 active인 사람.',
    '수집률': '예상 데이터 제출량 대비 실제 제출량의 %. 높을수록 연구 데이터 품질이 좋음.',
    'XRP': 'XRPL 블록체인의 화폐 단위. 이 플랫폼에서 연구비 정산에 사용. UQD 토큰과도 연동 예정.',
    '패스키 (Passkey)': '비밀번호 대신 사용하는 인증 수단. 기기에 저장됨. 분실 시 복구 절차 필요. 디자인 시 "비밀번호" 수준으로 쉽게 설명.',
    'TX 해시': '블록체인 거래의 고유 ID. 복사해서 XRPL 탐색기에 붙이면 거래 기록을 누구나 확인 가능. 투명성 보장.',
    '에스크로': '제3자가 자금을 보관했다가 조건 충족 시 지급하는 방식. 이 플랫폼에서는 연구 보상금을 안전하게 관리하는 데 사용. 디자인에서는 "예치" 정도로 순화.',
    '프로젝트 지갑': '연구별로 자동 생성되는 전용 계좌. 연구비를 별도 관리. 개인 지갑과 분리.',
    'IRB': 'Institutional Review Board (기관생명윤리위원회). 인간 대상 연구 전에 반드시 받아야 하는 윤리 심의.',
    'data_points': '환자가 제출한 건강 데이터의 최소 단위. 하나의 측정값 (예: 2/11 오후 3시 심박수 72bpm).',
    '동의 (consent)': '환자가 "이 연구에 내 데이터를 이렇게 써도 됩니다"라고 허락하는 것. 블록체인에 기록됨.',
    '익명화': '참여자 개인정보를 숨기고 코드(P001, P002)로 표시. 연구자도 실명을 볼 수 없음.',
    '민감도 레벨': '데이터의 민감 정도. 1(공개 가능) ~ 4(최고 민감, 암호화 필수). 예: 심박수=2, 약물 정보=4.'
  };

  // ═══════════════════════════════════════════════════════
  // 2026-02-11 회의 변경사항 요약
  // ═══════════════════════════════════════════════════════

  const MEETING_CHANGES = {
    date: '2026-02-11',
    decisions: [
      { item: '홈 화면에서 "전체 연구 총 참여자", "수집된 데이터" 제거', reason: '프로젝트별 관리가 핵심. 합산값 의미 없음.' },
      { item: '개인 지갑 잔액을 GNB에 간단히 표시', reason: '금액만 보이게. 상세는 연구비 관리 페이지에서.' },
      { item: '프로젝트 지갑 예산은 각 연구의 예산 관리 탭에서', reason: '프로젝트별 분리 관리.' },
      { item: '예산 관리를 별도 탭으로 분리', reason: '개인↔프로젝트 자금 이동 + 회수 프로세스 추가로 복잡성 증가.' },
      { item: '"결제 에스크로" → "연구비 정산" 또는 "연구비 지출 관리"로 명칭 변경', reason: '에스크로는 전문 용어. 쉬운 말 사용.' },
      { item: '조치 센터 삭제 → 즉시 수정 방식', reason: 'IRB 반려 시 심의 페이지에서 바로 연구 설계 수정이 더 직관적.' },
      { item: '연구 설계 투 스텝: 설계 완료 → IRB 제출/현황', reason: 'IRB 승인된 프로젝트만 내 연구에 포함.' },
      { item: '"테이블" 명칭 변경 검토', reason: '"연구 원본", "연구 데이터", "연구 기록" 등 더 직관적인 이름.' },
      { item: '블록체인 용어 순화 + 정보 아이콘 추가', reason: '패스키 분실 경고, TX 해시 설명 등. 금융 상품 스타일 서브텍스트.' }
    ]
  };

  // ═══════════════════════════════════════════════════════
  // 렌더링
  // ═══════════════════════════════════════════════════════

  function injectStyle() {
    if (document.getElementById('page-spec-style')) return;
    const style = document.createElement('style');
    style.id = 'page-spec-style';
    style.textContent = `
      .page-spec {
        width: min(1080px, 100% - 48px);
        margin: 32px auto 40px;
        border-radius: 16px;
        padding: 24px 28px;
        border: 2px dashed rgba(139, 92, 246, 0.3);
        backdrop-filter: blur(6px);
        font-family: 'Pretendard', -apple-system, sans-serif;
      }
      .page-spec.dark { background: #0f172a; color: #e5e7eb; }
      .page-spec.light { background: #fafbfc; color: #1e293b; }

      .page-spec .spec-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 6px;
      }
      .page-spec .spec-badge {
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
      }
      .page-spec .spec-title {
        font-size: 16px;
        font-weight: 700;
      }
      .page-spec .spec-summary {
        font-size: 13px;
        color: #94a3b8;
        margin-bottom: 20px;
        line-height: 1.6;
      }

      /* 데이터 필드 카드 */
      .page-spec .data-field {
        padding: 14px 16px;
        border-radius: 12px;
        margin-bottom: 10px;
        border-left: 4px solid #6366f1;
        transition: all 0.15s ease;
      }
      .page-spec.dark .data-field { background: #1e293b; }
      .page-spec.light .data-field { background: white; border: 1px solid #e5e7eb; border-left: 4px solid #6366f1; }
      .page-spec .data-field:hover { transform: translateX(4px); }

      .page-spec .data-field.p5 { border-left-color: #ef4444; }
      .page-spec .data-field.p4 { border-left-color: #f59e0b; }
      .page-spec .data-field.p3 { border-left-color: #3b82f6; }
      .page-spec .data-field.p2 { border-left-color: #94a3b8; }
      .page-spec .data-field.p1 { border-left-color: #475569; opacity: 0.7; }

      .page-spec .df-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 6px;
      }
      .page-spec .df-name {
        font-size: 13px;
        font-weight: 600;
      }
      .page-spec .df-priority {
        font-size: 11px;
        letter-spacing: 1px;
      }
      .page-spec .df-meaning {
        font-size: 12px;
        color: #94a3b8;
        line-height: 1.6;
        margin-bottom: 4px;
      }
      .page-spec .df-meta {
        display: flex;
        gap: 16px;
        font-size: 11px;
        color: #64748b;
      }
      .page-spec .df-source { color: #8b5cf6; }
      .page-spec .df-note { color: #f59e0b; font-style: italic; }

      /* 삭제된 데이터 */
      .page-spec .removed-section {
        margin-top: 20px;
        padding: 16px;
        border-radius: 12px;
        border: 1px dashed #ef4444;
      }
      .page-spec.dark .removed-section { background: rgba(239, 68, 68, 0.08); }
      .page-spec.light .removed-section { background: #fef2f2; }
      .page-spec .removed-title {
        font-size: 13px;
        font-weight: 600;
        color: #ef4444;
        margin-bottom: 10px;
      }
      .page-spec .removed-item {
        font-size: 12px;
        margin-bottom: 6px;
        line-height: 1.5;
      }
      .page-spec .removed-item .ri-name { font-weight: 600; }
      .page-spec .removed-item .ri-reason { color: #94a3b8; }

      /* 디자인 노트 */
      .page-spec .design-note {
        margin-top: 20px;
        padding: 14px 16px;
        border-radius: 12px;
        font-size: 12px;
        line-height: 1.6;
        border: 1px dashed #22c55e;
      }
      .page-spec.dark .design-note { background: rgba(34, 197, 94, 0.08); color: #86efac; }
      .page-spec.light .design-note { background: #f0fdf4; color: #166534; }
      .page-spec .design-note-title {
        font-weight: 600;
        color: #22c55e;
        margin-bottom: 6px;
        font-size: 13px;
      }

      /* 상태맵 */
      .page-spec .status-map {
        margin-top: 16px;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid rgba(148,163,184,0.2);
      }
      .page-spec.dark .status-map { background: #0b1220; }
      .page-spec.light .status-map { background: #f8fafc; }
      .page-spec .status-map-title {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 10px;
      }
      .page-spec .status-item {
        font-size: 12px;
        margin-bottom: 4px;
        line-height: 1.5;
      }
      .page-spec .status-item strong { color: #8b5cf6; }

      /* 우선순위 범례 */
      .priority-legend {
        position: fixed;
        bottom: 70px;
        right: 20px;
        background: #1e293b;
        border: 1px solid #334155;
        border-radius: 12px;
        padding: 16px;
        z-index: 9998;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        display: none;
        min-width: 200px;
        font-size: 12px;
        color: #e5e7eb;
      }
      body.spec-mode .priority-legend { display: block; }
      .priority-legend h4 { font-size: 13px; margin-bottom: 12px; font-weight: 600; }
      .priority-legend-item { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
      .priority-legend-bar { width: 16px; height: 4px; border-radius: 2px; }
      .priority-legend-bar.p5 { background: #ef4444; }
      .priority-legend-bar.p4 { background: #f59e0b; }
      .priority-legend-bar.p3 { background: #3b82f6; }
      .priority-legend-bar.p2 { background: #94a3b8; }
      .priority-legend-bar.p1 { background: #475569; }

      /* 회의 변경사항 패널 */
      .meeting-changes-panel {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #fef3c7, #fde68a);
        border: 2px solid #f59e0b;
        border-radius: 12px;
        padding: 16px;
        max-width: 320px;
        max-height: 400px;
        overflow-y: auto;
        z-index: 9997;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        display: none;
        font-size: 12px;
        color: #78350f;
      }
      body.spec-mode .meeting-changes-panel { display: block; }
      .meeting-changes-panel h4 { font-size: 13px; color: #92400e; margin-bottom: 10px; }
      .meeting-changes-panel li { margin-bottom: 6px; line-height: 1.5; }
      .meeting-changes-panel .mc-reason { color: #a16207; font-style: italic; }

      /* 토글 버튼 */
      .spec-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #8b5cf6, #6366f1);
        color: white;
        border: none;
        padding: 12px 20px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(139,92,246,0.4);
        transition: all 0.2s ease;
      }
      .spec-toggle:hover { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(139,92,246,0.5); }

      /* 용어 사전 */
      .glossary-panel {
        margin-top: 24px;
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(148,163,184,0.2);
      }
      .page-spec.dark .glossary-panel { background: #0b1220; }
      .page-spec.light .glossary-panel { background: #f8fafc; }
      .glossary-panel h4 { font-size: 13px; font-weight: 600; margin-bottom: 12px; }
      .glossary-item { font-size: 12px; margin-bottom: 6px; line-height: 1.5; }
      .glossary-item strong { color: #8b5cf6; }
    `;
    document.head.appendChild(style);
  }

  function stars(n) {
    return '★'.repeat(n) + '☆'.repeat(5 - n);
  }

  function renderPageSpec() {
    const pageId = (document.body.dataset.pageId || location.pathname.split('/').pop() || '').replace('.html', '');
    const spec = PAGE_DATA[pageId];
    if (!spec) return;

    const theme = document.body.classList.contains('light-theme') ? 'light' : 'dark';
    const section = document.createElement('section');
    section.className = `page-spec ${theme}`;

    // 헤더
    let html = `
      <div class="spec-header">
        <span class="spec-badge">디자이너 데이터 사전</span>
        <span class="spec-title">${spec.title}</span>
      </div>
      <div class="spec-summary">${spec.summary}</div>
    `;

    // 데이터 필드 (우선순위 높은 순 정렬)
    const sortedFields = [...(spec.dataFields || [])].sort((a, b) => b.priority - a.priority);
    for (const f of sortedFields) {
      html += `
        <div class="data-field p${f.priority}">
          <div class="df-header">
            <span class="df-priority">${stars(f.priority)}</span>
            <span class="df-name">${f.name}</span>
          </div>
          <div class="df-meaning">${f.meaning}</div>
          <div class="df-meta">
            <span class="df-source">DB: ${f.source}</span>
            ${f.note ? `<span class="df-note">💡 ${f.note}</span>` : ''}
          </div>
        </div>
      `;
    }

    // 삭제된 데이터
    if (spec.removedData && spec.removedData.length > 0) {
      html += `<div class="removed-section"><div class="removed-title">🗑 삭제/변경된 데이터</div>`;
      for (const r of spec.removedData) {
        html += `<div class="removed-item"><span class="ri-name">✕ ${r.name}</span><br><span class="ri-reason">${r.reason} (${r.date})</span></div>`;
      }
      html += `</div>`;
    }

    // 상태맵
    if (spec.statusMap) {
      html += `<div class="status-map"><div class="status-map-title">연구 상태 정의</div>`;
      for (const [key, val] of Object.entries(spec.statusMap)) {
        html += `<div class="status-item"><strong>${key}</strong> — ${val}</div>`;
      }
      html += `</div>`;
    }

    // 디자인 노트
    if (spec.designNotes) {
      html += `
        <div class="design-note">
          <div class="design-note-title">💬 디자인 참고</div>
          ${spec.designNotes}
        </div>
      `;
    }

    section.innerHTML = html;
    document.body.appendChild(section);
  }

  function createSpecToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'spec-toggle';
    toggle.innerHTML = '📋 데이터 사전';
    toggle.onclick = function() {
      document.body.classList.toggle('spec-mode');
      this.innerHTML = document.body.classList.contains('spec-mode')
        ? '📋 사전 닫기'
        : '📋 데이터 사전';
    };
    document.body.appendChild(toggle);
  }

  function createPriorityLegend() {
    const legend = document.createElement('div');
    legend.className = 'priority-legend';
    legend.innerHTML = `
      <h4>우선순위 범례</h4>
      <div class="priority-legend-item"><span class="priority-legend-bar p5"></span> ★★★★★ 필수 — 없으면 페이지 의미 없음</div>
      <div class="priority-legend-item"><span class="priority-legend-bar p4"></span> ★★★★☆ 중요 — 눈에 띄어야 함</div>
      <div class="priority-legend-item"><span class="priority-legend-bar p3"></span> ★★★☆☆ 보통 — 공간 부족 시 축소 가능</div>
      <div class="priority-legend-item"><span class="priority-legend-bar p2"></span> ★★☆☆☆ 부가 — 접거나 2차 화면</div>
      <div class="priority-legend-item"><span class="priority-legend-bar p1"></span> ★☆☆☆☆ 선택 — 숨김 가능</div>
    `;
    document.body.appendChild(legend);
  }

  function createMeetingChangesPanel() {
    const panel = document.createElement('div');
    panel.className = 'meeting-changes-panel';
    let html = `<h4>📌 ${MEETING_CHANGES.date} 회의 결정</h4><ul>`;
    for (const d of MEETING_CHANGES.decisions) {
      html += `<li><strong>${d.item}</strong><br><span class="mc-reason">→ ${d.reason}</span></li>`;
    }
    html += `</ul>`;
    panel.innerHTML = html;
    document.body.appendChild(panel);
  }

  // 초기화
  document.addEventListener('DOMContentLoaded', () => {
    injectStyle();
    renderPageSpec();
    createSpecToggle();
    createPriorityLegend();
    createMeetingChangesPanel();
  });
})();
