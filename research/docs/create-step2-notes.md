# Designer Notes: create-step2.html

## &#x1F4CB; 디자이너 노트: Step 2 - 연구 설계



    
    

      **레이아웃:**

      ① Nav (240px) | ② 연구 설계 에디터 (flex:1) | ③ AI 연구설계 어시스턴트 (360px)

      Step 6과 동일한 workspace-wrap 패턴 (step-bar → workspace → editor + chat)



      **② 에디터 6개 섹션:**

      - 기본 정보: 연구 제목, 약칭, 기간

      - 연구 배경: AI 생성 초안 + 선행연구 모달

      - 연구 목적: AI 생성 초안 + 연구 갭 모달

      - 연구 가설: 주/부 가설 + 연구 동향 모달

      - 연구 방법론: RCT/코호트/횡단 선택 + 방법론 비교 모달

      - 참여자 조건: 연령/목표/건강조건 + 표본 설계 모달



      **③ AI 연구설계 어시스턴트:**

      - 다크 테마 인라인 채팅 패널 (360px)

      - 맥락 칩: RCT, 30-60세, 대상질환 T2, n=100

      - 빠른 설정: RCT로 변경, 코호트로 변경, 40대 이상, 기간 늘려줘



      **모달 레포트 (RAG + PubMed):**

      - 선행연구: 핵심 논문 5건, DOI 링크

      - 연구 갭: 3가지 핵심 갭 식별

      - 연구 동향: 최근 3년 트렌드

      - 방법론 비교: 유사 연구 방법론 분포

      - 표본 설계: 검정력 분석 파라미터
    


## &#x2699;&#xFE0F; 기능 명세: Step 2 - 연구 설계 (v2 - 레포트 모달 분리)



    
    

      **변경 사항 (v1 → v2):**

      • 오른쪽 "연구 레포트" 패널 삭제 → 페이지 간결화

      • 각 섹션 헤더 오른쪽에 레포트 버튼 추가:

        - 연구 가설 → 연구 동향 (RAG + PubMed 논문 검색 결과)

        - 연구 방법론 → 방법론 비교 (유사 연구 방법론 분포)

        - 참여자 조건 → 표본 설계 (검정력 분석, 표본 크기 계산)

      • 버튼 클릭 시 모달 오버레이로 해당 레포트 표시

      • 사용자 타이핑 영역(왼쪽)과 레포트 참고(모달)가 분리됨



      **모달 레포트 내용 (RAG + PubMed):**

      • 연구 동향: 최근 3~5년 관련 논문 검색, 주요 발견 요약, DOI 링크

      • 방법론 비교: 유사 연구의 방법론 분포(RCT/코호트/단면), 추천 근거

      • 표본 설계: 효과크기 기반 검정력 분석, 최소 n 계산, 탈락율 반영



      **핵심 기능 (유지):**

      • AI 생성 초안 확인/수정

      • 연구 방법론 6종 선택

      • ZKP 기반 참여자 조건 설정 + 매칭 시뮬레이션

      • AI 채팅 패널로 자연어 수정
    


## &#x1F517; 백엔드 호출: Step 2



    
    

      **1. 연구 동향 레포트 (모달용):**

      
GET /api/v2/ai/research-trends

  ?topic=low_carb_glycemic_variability

  &methodology=rct

  &years=3

→ { papers: [...], summary: "...", trend_keywords: [...] }
      


      **2. 방법론 비교 레포트 (모달용):**

      
GET /api/v2/ai/methodology-comparison

  ?topic=dietary_glycemic_intervention

  &condition=diabetes_t2

→ { distribution: { rct: 62, cohort: 25, cross: 13 }, recommendation: "rct", rationale: "..." }
      


      **3. 표본 설계 레포트 (모달용):**

      
POST /api/v2/ai/sample-design

  { effect_size: 0.6, alpha: 0.05, power: 0.80, dropout_rate: 0.20 }

→ { min_n: 84, recommended_n: 100, per_group: 50, rationale: "..." }
      


      **4. 프로젝트 초안 저장:**

      
POST /api/v2/projects

PATCH /api/v2/projects/:id

  { title, methodology, duration, target_participants, eligibility: { zkp_circuits: [...] } }
      


      **5. ZKP 매칭 시뮬레이션:**

      
POST /api/v2/pool/simulate

  { zkp_circuits: [...] }

→ { estimated_matches: 2847, k_anonymity_check: "pass" }
      
    


