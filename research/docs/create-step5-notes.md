# Designer Notes: create-step5.html

## &#x1F4CB; 디자이너 노트: Step 5 - IRB 심의



    
    

      **레이아웃:**

      ① Nav (240px) | ② IRB 심의 에디터 (flex:1) | ③ AI IRB 어시스턴트 (360px)

      Step 4/6와 동일한 workspace-wrap 패턴 (step-bar → workspace → editor + chat)



      **IRB 심의 유형 3가지:**

      • **면제**: 기존 동의 데이터만 사용 → 심사비 없음 → 에스크로(Step 6)로 바로 이동

      • **일반 심의**: 새 데이터 수집 → 심사비 500,000원 결제 → 위원회 심의(5~14일) → 승인 후 에스크로

      • **자동 승인**: 최소 위험 연구 → 심사비 250,000원 → AI 사전 검증 통과 시 즉시 승인 → 에스크로로 바로



      **AI 추천 로직:**

      • Step 1~4의 연구 설계 분석 → 수집 데이터 유형, 대상자 위험도, 데이터 민감도(L1~L4) 기반 추천

      • L4(Restricted) 데이터 포함 시 → 일반 심의 추천

      • L1~L2 + 비침습 + 성인 대상 → 자동 승인 가능

      • 기존 동의 데이터만 사용 → 면제 추천



      **플로우 분기:**

      • 면제: Step 5 → Step 6 (에스크로)

      • 일반: Step 5 → 심사비 결제 → 심의 대기 → 승인 → Step 6

      • 자동: Step 5 → 심사비 결제 → 즉시 승인 → Step 6
    


## &#x2699;&#xFE0F; 기능 명세: Step 5 - IRB 심의



    
    

      **핵심 기능:**

      • IRB 심의 유형 선택 (면제 / 일반 심의 / 자동 승인)

      • AI 기반 유형 추천 (연구 설계 분석)

      • 심사비 결제 (XRPL 결제)

      • 유형별 조건부 UI 표시



      **비즈니스 로직:**

      • 면제: irb_type = 'EXEMPT', fee = 0, status = 'APPROVED' 즉시

      • 일반: irb_type = 'STANDARD', fee = 400 XRP, status = 'SUBMITTED' → 'UNDER_REVIEW' → 'APPROVED'

      • 자동: irb_type = 'EXPEDITED', fee = 200 XRP, AI 검증 통과 시 status = 'APPROVED' 즉시
    


## &#x1F517; 백엔드 호출: Step 5



    
    

      **1. IRB 유형 판정 (AI):**

      
POST /api/v2/ai/irb-type-recommend

{ "project_id": "uuid" }

→ { "recommended_type": "STANDARD", "reason": "L4 데이터(웨어러블) 포함", "eligible_types": ["STANDARD", "EXPEDITED"] }
      


      **2. IRB 심의 접수 + 심사비 결제:**

      
POST /enterprise/irb/submit

{ "project_id": "uuid", "irb_type": "STANDARD|EXPEDITED|EXEMPT", "fee_xrp": 400 }

→ { "irb_id": "IRB-2026-xxx", "status": "SUBMITTED", "tx_hash": "..." }
      


      **3. 자동 승인 (간이 심의):**

      
POST /enterprise/irb/expedited-approve

{ "irb_id": "IRB-2026-xxx" }

→ { "status": "APPROVED", "approved_at": "2026-02-13T...", "next_step": "escrow" }
      
    


