# Chapter09: 시각적 회귀 테스트

## 시각적 회귀 테스트의 필요성

### CSS와 스타일 변경 검증의 어려움

- CSS는 여러 프로퍼티가 중첩되어 최종 스타일이 결정됨
- 명시도, 적용 순서, 전역 스타일 등이 복합적으로 영향을 미침
- 코드만으로는 최종 결과 예측이 매우 어려움
- 컴포넌트 기반 개발 환경에서 한 컴포넌트의 스타일 변경이 여러 화면에 영향을 미칠 수 있음

### 스냅숏 테스트의 한계

- 스냅숏 테스트는 HTML 출력 결과만 비교
- 전역 스타일의 영향을 파악하기 어려움
- CSS Modules로 정의한 내용을 알 수 없음

### 시각적 회귀 테스트의 장점

- 실제 브라우저에 렌더링된 화면을 픽셀 단위로 비교
- 개발자의 의도하지 않은 스타일 변경을 감지 가능
- 컴포넌트 단위 테스트를 통해 정확한 변경사항 파악 가능

## reg-cli로 이미지 비교하기

- `reg-suit`의 핵심 기능
- 기존 이미지(`actual`)와 비교할 이미지(`expected`)를 비교하여 차이점(`diff`)을 리포트로 출력
- 전/후 이미지를 시각적으로 확인 가능

```bash
$ mkdir vrt && cd vrt
$ mkdir {actual,expected,diff}
$ npx reg-cli actual expected diff -R index.html
```

## Storycap 도입 - 스토리북을 활용한 시각적 회귀 테스트

- Storybook 빌드 → Storycap 실행 → 모든 스토리 캡처
- 빌드된 정적 사이트: `storybook-static`
- 캡처된 이미지: `__screenshots__`

## Github Actions에 reg-suit 연동하기

### GitHub 연동을 통한 자동화

- `Fetch Expected`: 비교 기준이 될 Expected 이미지를 가져옴
- `Push Actual`: 현재 상태의 Actual 이미지를 저장소에 푸시
- `Compare`: Expected와 Actual 이미지 비교 후 시각적 차이 검출

### 필요 플러그인

- `reg-keygen-git-hash-plugin`: git 커밋 해시 기반 이미지 파일명 생성
- `reg-publish-s3-plugin`: AWS S3에 테스트 결과 업로드
- `reg-notify-github-plugin`: GitHub PR에 테스트 결과 알림

## 시각적 회귀 테스트 활용 방안

1. **반응형 디자인에 활용하기**

   - 다양한 화면 크기에서의 UI 일관성 확인
   - 디자인 실수 조기 발견

2. **릴리스 직전 리팩터링에 활용하기**

   - 실제로 필요한 CSS 코드만 남기는 작업
   - 전역 스타일 코드의 영향 범위 파악

3. **스토리 커밋 습관화로 시작하는 시각적 회귀 테스트**
   - 컴포넌트 단위로 스토리 작성
   - 세부적인 시각적 회귀 테스트 실행
