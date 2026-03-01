# uniqdata-wireframes

## 역할

Enterprise Portal(연구자/기업용 웹) ERD, 와이어프레임, HTML 프로토타입 모음.

## 현재 상태 (2026-03-01)

Phase 1B 개발 진행 중. Core v2.6.0 기준으로 스키마/데이터 흐름 문서 최신화 완료.

- `schema.dbml` — 통합 ERD: health_db 33테이블 (4스키마) + uniqdata_db 18테이블
- `DATA_FLOWS.md` — Core Internal API 기반 데이터 흐름, 3계층 ID, k-anonymity
- HTML 와이어프레임 — Enterprise Portal UI 참고용

## 참고 가치

- ERD: 2-서버 51테이블 전체 스키마 (OMOP CDM 기반)
- 데이터 흐름: Core Internal API 13개 엔드포인트 + 4개 아웃바운드 푸시
- 와이어프레임: Enterprise Portal UI (5-Step 연구 생성, 조치 센터, AI 허브)
- Linking Token 플로우: active -> carted -> pending_consent -> enrolled
