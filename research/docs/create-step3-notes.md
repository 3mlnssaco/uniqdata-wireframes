# Designer Notes: create-step3.html

## &#x1F4CB; 디자이너 노트: Step 3 - 데이터 수집



    
    

      **레이아웃:**

      ① Nav (240px) | ② 데이터 수집 에디터 (flex:1) | ③ AI 데이터 어시스턴트 (360px)

      Step 6과 동일한 workspace-wrap 패턴 (step-bar → workspace → editor + chat)



      **데이터 분류:**

      • **패시브**: 자동 수집 (웨어러블, 활동량, 수면, 심박수) - 참여자 부담 최소

      • **능동 (EMA)**: 직접 입력 (식단, 약물, 기분) - 빈도 설정 중요

      • **맥락 (Qual)**: 식사 사진/일기/사건 로그 등 (정량 해석 보완)

      • **바이오마커**: 고급 분석용 (음성, 인지, 혈액검사)



      **EMA 빈도 설정:**

      • 연구 방법론에 따라 AI가 적정 빈도 추천

      • MRT: 하루 여러 번 무작위

      • 코호트: 하루 1-2회 고정



      **참여자 부담 계산:**

      • 예상 일일 입력 횟수 표시

      • 너무 많으면 완료율 하락 경고
    


## &#x2699;&#xFE0F; 기능 명세: Step 3 - 데이터 수집



    
    

      **핵심 기능:**

      • 수집 데이터 항목 선택 (토글)

      • 4개 카테고리: 패시브/능동(EMA)/맥락/바이오마커

      • EMA 빈도 설정 (하루 N회)

      • 참여자 부담 점수 실시간 계산



      **데이터 민감도 레벨 (L1-L4):**

      • **L1 (Public)**: app_id, 타임스탬프 - At Rest 암호화

      • **L2 (Internal)**: 연령대, 성별 - At Rest 암호화

      • **L3 (Confidential)**: 이메일, 전화 - At Rest + 필드 암호화

      • **L4 (Restricted)**: 진단코드, 처방, 바이오마커 - At Rest + 필드 암호화 + 접근 로그



      **동의 스코프 (Consent Scope):**

      • 형식: `{domain}:{metric}:{permission}:{range}`

      • 예시: `health:heart_rate:read:30d`

      • 예시: `med:medication:write:7d`

      • 수집 항목별로 필요한 동의 스코프 자동 생성



      **AI 어시스턴트:**

      • 연구 목적 기반 추천 항목 표시

      • "추천 적용" 버튼으로 일괄 선택

      • 인과 연결 예상 설명
    


## &#x1F517; 백엔드 호출: Step 3



    
    

      **1. 데이터 수집 설정 저장 (민감도 레벨 포함)**

      
PATCH /api/v2/projects/:id

Headers: Authorization: Bearer {jwt}


Request Body:

{

  "data_collection": {

    "passive": [

      { "type": "cgm", "sensitivity_level": "L4", "consent_scope": "health:blood_glucose:read:60d", "frequency": "5min" },

      { "type": "heart_rate", "sensitivity_level": "L2", "consent_scope": "health:heart_rate:read:60d", "frequency": "continuous" },

      { "type": "sleep", "sensitivity_level": "L2", "consent_scope": "health:sleep:read:60d", "frequency": "daily" },

      { "type": "steps", "sensitivity_level": "L1", "consent_scope": "health:activity:read:60d", "frequency": "daily" }

    ],

    "active": [

      { "type": "medication", "sensitivity_level": "L4", "consent_scope": "med:medication:read:60d", "ema_frequency": "per_dose" },

      { "type": "mood", "sensitivity_level": "L2", "consent_scope": "health:mood:read:60d", "ema_frequency": "2_per_day" },

      { "type": "diet", "sensitivity_level": "L2", "consent_scope": "health:nutrition:read:60d", "ema_frequency": "3_per_day" }

    ],

    "qualitative": [

      { "type": "meal_photo", "sensitivity_level": "L3", "consent_scope": "media:photo:read:60d" }

    ]

  }

}

→ 200 OK { "project_id": "uuid", "data_collection_updated": true, "estimated_burden_score": 7.5, "l4_data_included": true }
      


      **2. AI 추천 데이터 항목 조회**

      
POST /api/v2/ai/recommend-data-collection

{ "project_id": "uuid", "research_question": "약물 순응도와 혈당 변동의 상관관계", "methodology": "prospective_cohort" }

→ 200 OK { "recommendations": [...], "causal_graph_preview": { "edges": [...] } }
      


      **3. 참여자 부담 점수 계산**

      
POST /api/v2/projects/:id/calculate-burden

→ 200 OK { "burden_score": 7.5, "daily_prompts": 9, "time_per_day_minutes": 12, "warning": "daily_prompts > 8: 완료율 하락 위험" }
      


      **4. 동의서 템플릿 미리보기 생성**

      
POST /api/v2/projects/:id/consent-preview

→ 200 OK { "consent_template": { "title": "연구 참여 동의서", "sections": [...], "passkey_required": true } }
      
    


