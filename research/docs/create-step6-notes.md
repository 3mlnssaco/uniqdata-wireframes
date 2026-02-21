# Designer Notes: create-step6.html

## &#x1F4CB; 디자이너 노트: Step 6 - 에스크로 예치 + 모집 실행



    
    

      **레이아웃:**

      ① Nav (240px) | ② 에스크로 예치 에디터 (flex:1) | ③ AI 에스크로 어시스턴트 (360px)

      Step 4/5와 동일한 workspace-wrap 패턴 (step-bar → workspace → editor + chat)



      **② 에디터 5개 섹션:**

      - 프로젝트 지갑: IRB 승인 후 자동 생성. 다크 카드로 잔액/필요금액/진행률 표시

      - 내 지갑 입금: 잔액 확인 → 금액 입력 → 빠른 버튼 → 입금 실행

      - 에스크로 금액 내역: 보라색 그라디언트 카드, IRB 신청비(기납부)/보상/수수료 breakdown

      - 에스크로 예치 동의: 3개 체크박스 전체 체크 시 예치 버튼 활성화

      - 모집 실행: 에스크로 예치 완료 전 잠금 상태. Step 4 모집 요약 표시, 초대/공개 모집 버튼



      **③ AI 에스크로 어시스턴트:**

      - 예치 → 모집 실행 흐름을 안내하는 대화형 패널

      - 맥락 칩: IRB 승인, 7,740 XRP, 100명 목표, 선착순

      - 빠른 액션: 필요 금액 입금, 에스크로 상세 보기, 모집 미리보기, 지갑 충전



      **흐름 (Flow):**

      ① IRB 승인 → 프로젝트 지갑 자동 생성

      ② 내 지갑에서 프로젝트 지갑으로 입금

      ③ 에스크로 예치 동의 → 예치 실행

      ④ 모집 실행 섹션 활성화

      ⑤ 사전 초대 발송 → 수락 대기(3일) → 미수락분 공개 전환

      ⑥ 목표 인원 달성 → 자동 마감 → 연구 일괄 시작



      **핵심 포인트:**

      • 에스크로 예치와 모집 실행을 하나의 Step으로 통합

      • 모집 실행은 에스크로 예치 완료 후에만 활성화 (잠금 UX)

      • 체크박스 3개 모두 체크해야 예치 버튼 활성화 (동의 확보)



      **ERD 매핑 (v6 — 33 Tables):**

      • 프로젝트 지갑 → `project_wallets` (uniqdata_db, 1:1 projects)

      • 입금/출금 내역 → `project_wallet_transactions` (tx_type: DEPOSIT|WITHDRAWAL|REWARD_PAYOUT|REFUND)

      • 개인 지갑 잔액 → `user_wallets` (health_db, cross-DB API 조회)

      • XRPL 트랜잭션 → `xrpl_transactions` (health_db, tx_type=ESCROW_CREATE)

      • 지갑 생성 흐름: IRB 승인 → project_wallets INSERT (status=CREATED) → 입금 → FUNDED → 에스크로 → ACTIVE
    


## &#x2699;&#xFE0F; 기능 명세: Step 6 - 에스크로 예치 + 모집 실행



    
    

      **핵심 기능:**

      • 프로젝트 지갑 잔액 확인 및 진행률 표시

      • 내 지갑 → 프로젝트 지갑 입금 (금액 입력 + 빠른 버튼)

      • 에스크로 금액 내역 (IRB 신청비/보상/수수료 breakdown)

      • 에스크로 예치 동의 (3개 체크박스 전체 체크 시 활성화)

      • 모집 실행 (에스크로 예치 후 잠금 해제): 사전 초대 + 공개 모집



      **비즈니스 로직:**

      • IRB 승인 시 프로젝트 지갑이 XRPL에 자동 생성됨 → `project_wallets` INSERT

      • 개인지갑(user_wallets) → 프로젝트지갑(project_wallets)으로 이체 → `project_wallet_transactions` (tx_type=DEPOSIT)

      • IRB 심사비(1,000 XRP)는 에스크로 예치 시 함께 결제됨

      • 에스크로 예치 = 참여자 보상(6,400) + 플랫폼 수수료(340) = 6,740 XRP

      • 총 합계 7,740 XRP는 IRB 신청비 포함 전체 연구 비용

      • 에스크로 예치 → `project_wallet_transactions` (tx_type=WITHDRAWAL) + `xrpl_transactions` (tx_type=ESCROW_CREATE)

      • 에스크로 예치 후 연구 설정 변경 불가 (잠금) — project_wallets.status = ACTIVE

      • 사전 초대 → 3일 대기 → 미수락분 공개 모집 전환

      • 목표 100명 달성 시 자동 마감 → 연구 일괄 시작 — projects.status = RECRUITING → ACTIVE
    


## &#x1F517; 백엔드 호출: Step 6



    
    

      **ERD 참조 테이블:**

      • `project_wallets` — 프로젝트 전용 지갑 (서버 키 보유, 프로젝트당 1:1)

      • `project_wallet_transactions` — 입출금 내역 (DEPOSIT|WITHDRAWAL|REWARD_PAYOUT|REFUND)

      • `xrpl_transactions` — XRPL 트랜잭션 기록

      • `settlement_batches` / `settlement_items` — 참여자 정산



      **1. 프로젝트 지갑 생성 (IRB 승인 시 자동):**

      
POST /api/v2/projects/:id/wallet/create

{ "project_id": "uuid" }

→ {

  "wallet_id": "uuid",

  "wallet_address": "rPrj...1A2",

  "budget_total": 7740,

  "budget_deposited": 0,

  "status": "CREATED"

}

// → INSERT project_wallets (status=CREATED)
      


      **2. 개인지갑 → 프로젝트 지갑 이체 (DEPOSIT):**

      
POST /api/v2/projects/:id/wallet/deposit

{

  "from_wallet": "rMyWallet...",  // user_wallets.xrpl_address

  "amount": 7740,

  "currency": "XRP"

}

→ {

  "tx_id": "uuid",

  "xrpl_tx_hash": "A1B2C3...",

  "status": "CONFIRMED",

  "wallet_balance": 7740

}

// → INSERT project_wallet_transactions (tx_type=DEPOSIT)

// → UPDATE project_wallets.budget_deposited += 7740

// → UPDATE project_wallets.status = FUNDED
      


      **3. 에스크로 예치:**

      
POST /api/v2/projects/:id/escrow/create

{

  "project_wallet_id": "uuid",

  "compensation_amount": 6400,

  "platform_fee": 340,

  "irb_fee": 1000,

  "conditions": {

    "release_on": "participant_complete",

    "refund_on": "research_cancelled"

  }

}

→ {

  "escrow_tx_hash": "E4F5G6...",

  "escrow_status": "funded",

  "recruitment_unlocked": true

}

// → INSERT project_wallet_transactions (tx_type=WITHDRAWAL, memo=에스크로 예치)

// → UPDATE project_wallets.budget_spent += 7740

// → UPDATE project_wallets.status = ACTIVE

// → INSERT xrpl_transactions (tx_type=ESCROW_CREATE)
      


      **4. 모집 시작:**

      
POST /enterprise/projects/:id/recruitment/start

{

  "pre_invite": true,

  "open_recruit": false,

  "invite_accept_deadline_days": 3

}

→ {

  "status": "RECRUITING",

  "invites_sent": 4,

  "open_slots": 60

}

// → UPDATE projects.status = RECRUITING
      
    


