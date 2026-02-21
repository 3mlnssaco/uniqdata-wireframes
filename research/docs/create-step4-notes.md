# Designer Notes: create-step4.html

## 📋 디자이너 노트: Step 4 - 참가자 타겟 설정 (워크스페이스)



    
    

      **레이아웃:**

      ① Nav (240px) | ② 타겟 설정 에디터 (flex:1) | ③ AI 타겟 어시스턴트 (360px)

      Step 3과 동일한 workspace-wrap 패턴 (step-bar → workspace → editor + chat)



      **② 에디터:**

      - 타겟 대상자 지정 (2패널: 왼쪽 선택 리스트 / 오른쪽 사용자 검색)

      - 모집 비율 계획 (사전 초대 / 공개 모집)

      - 모집 조건 설정: 목표 인원, 최소 시작 인원, 수락 대기 기한, 대기자, 알림 방식

      - 모집 미리보기: 폰 목업 (참가자 시점)

      - 안내 박스: 실제 모집은 Step 6에서 시작



      **③ AI 타겟 어시스턴트:**

      - 대상자 선정 전략 맥락을 보고 답변하는 대화형 패널

      - 플랫폼 내 매칭 가능 사용자 수, 적합도 분석 등

      - 빠른 액션 칩: 목표 인원 조정, 대상자 추가, 적합도 분석, 비율 조정



      **타겟 대상자:**

      • UniQdata 가입 사용자 중 조건에 맞는 참여자를 PI가 미리 선택

      • 사용자 검색: 닉네임, 건강 태그, 관심 분야로 검색

      • 필터링: 건강 태그별 빠른 필터 제공

      • 실제 초대 발송은 Step 6 (에스크로 완료 후)에서 실행



      **핵심 포인트:**

      • 이 단계는 "누구를 모집할 것인가" 를 설정하는 단계

      • 실제 모집 실행(초대 발송, 공개 모집 시작)은 Step 6에서 진행

      • IRB 심의(Step 5) + 에스크로 예치(Step 6) 완료 후 모집 시작
    


## ⚙️ 기능 명세: Step 4 - 참가자 타겟 설정



    
    

      **핵심 기능:**

      • UniQdata 가입 사용자 검색 및 타겟 선택

      • 모집 비율 계획 (사전 초대 / 공개 모집)

      • 목표 인원, 최소 시작 인원, 수락 대기 기한 설정

      • 알림 채널 선택 (앱 푸시, SMS, 이메일)

      • 모집 미리보기 (참가자 시점)



      **비즈니스 로직:**

      • 타겟 설정 완료 후 IRB 심의(Step 5)으로 이동

      • 이 단계에서는 대상자 조건/풀만 정의 (모집 실행 X)

      • 실제 모집은 Step 6에서 에스크로 예치 완료 후 실행
    


## 🔗 백엔드 호출: Step 4



    
    

      **1. 사용자 검색:**

      
GET /users/search?q=만성질환&tags=t2dm&platform=uniqdata

→ { "users": [{ "id": "uuid", "nickname": "박○○", "age": 56, "health_tags": ["대상질환"] }] }
      


      **2. 타겟 설정 저장:**

      
POST /enterprise/projects/:id/target/config

{

  "target_user_ids": ["uuid1", "uuid2", ...],

  "pre_invite_ratio": 0.4,

  "open_ratio": 0.6,

  "target_participants": 100,

  "min_start_participants": 50,

  "auto_close_on_target": true,

  "invite_accept_deadline_days": 3,

  "waitlist_enabled": true,

  "notification_channels": ["push", "sms"]

}

→ { "status": "target_configured" }
      
      

      ※ 실제 모집 시작(recruitment/start)은 Step 6에서 호출
    


