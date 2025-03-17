# Chapter10: E2E 테스트

## E2E 테스트

E2E테스트는 다음과 같은 상황에서 사용된다.

### 브라우저 고유 기능과 연동한 UI 테스트

- 화면 간의 이동
- 화면 크기를 측정해서 실행되는 로직
- CSS 미디어 쿼리를 사용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소 등에 데이터 저장

### 데이터베이스 및 서브 시스템과 연동한 E2E 테스트

- 최대한 실제와 유사하게 재현해 검증하는 테스트
- 표현 계층, 응용 계층, 영속(persistence) 계층을 연동하여 검증
- 실제 상황과 유사성이 높은 장점이 있지만, 실행 시간이 길고 불안정한 단점이 존재

## 플레이라이트(Playwright)

웹 브라우저 기반 E2E 테스트 자동화 도구

### Locators

페이지에서 요소를 찾는 API

```tsx
await page.getByLabel("User Name").fill("John");
await page.getByLabel("Password").fill("secret-password");
await page.getByRole("button", { name: "Sign in" }).click();
await expect(page.getByText("Welcome, John!")).toBeVisible();
```

### Assertions

expect 함수 형태의 테스트 assertion을 포함한다. matchers를 사용하여 다양한 조건을 검증 가능

## 불안정한 테스트 대처 방법

1. 실행할 때마다 데이터베이스 재설정하기
   일관성 있는 결과를 얻으려면 테스트 시작 시점의 상태는 항상 동일해야 한다.
2. 테스트마다 사용자를 새로 만들기
   테스트마다 사용자를 새로 생성하여 기존 사용자 정보 변경 방지
3. 테스트 간 리소스가 경합하지 않도록 주의하기
4. 빌드한 애플리케이션 서버로 테스트하기
5. 비동기 처리 대기하기
6. --debug로 테스트 실패 원인 조사하기
7. CI환경과 CPU코어 수 맞추기
8. 테스트 범위 최적화
