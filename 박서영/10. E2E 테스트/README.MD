# E2E 테스트

E2E 테스트는 브라우저 고유의 API를 사용하는 상황이나 화면을 이동하며 테스트해야 하는 상황에서 사용됨.

## 브라우저 고유 기능과 연동한 UI 테스트

- 화면 간의 이동
- 화면 크기 측정 후 실행되는 로직
- CSS의 미디어 쿼리를 사용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소에 데이터 저장

## 데이터베이스 및 서브 시스템과 연동한 E2E 테스트

실제와 유사하게 데이터베이스 서버나 외부시스템을 연동하여 재현하는 테스트. 표현 계층, 응용 계층, 영속 계층을 연동해 검증하므로 유사성은 높지만 실행 시간이 길고 불안정한 단점이 있음.

## Playwright

마이크로소프트가 공개한 E2E 테스트 프레임워크. 크로스 브라우징을 지원하며 디버깅 테스트, 리포터, 트레이스 뷰어, 테스트 코드 생성기 등 다양한 기능 지원.

### Locators

페이지에서 요소를 찾는 Playwright의 API

```tsx
await page.getByLabel("User Name").fill("John");
await page.getByLabel("Password").fill("secret-password");
await page.getByRole("button", { name: "Sign in" }).click();
await expect(page.getByText("Welcome, John!")).toBeVisible();
```


### Playwright 메서드


#### 1. 페이지 로드 및 URL 관련 메서드
- **`page.goto(url)`**  
  페이지로 이동.
  
- **`page.waitForURL(url, options)`**  
  페이지가 특정 URL로 변경될 때까지 기다림.
  
- **`expect(page).toHaveURL(url)`**  
  페이지가 특정 URL을 가지고 있는지 확인.
  
- **`page.waitForLoadState(state, options)`**  
  페이지가 특정 로드 상태에 도달할 때까지 기다림 (`load`, `domcontentloaded`, `networkidle` 등).
  
- **`page.reload()`**  
  페이지 새로 고침.

#### 2. DOM 요소 상호작용
- **`page.fill(selector, value)`**  
  입력 필드에 값을 채우기.
  
- **`page.click(selector)`**  
  요소 클릭하기.
  
- **`page.hover(selector)`**  
  요소 위로 마우스 올리기.
  
- **`page.selectOption(selector, option)`**  
  드롭다운 메뉴에서 옵션 선택하기.
  
- **`page.locator(selector)`**  
  특정 셀렉터에 해당하는 요소 찾기.
  
- **`page.waitForSelector(selector, options)`**  
  지정한 셀렉터가 DOM에 나타날 때까지 기다리기.

#### 3. 대기 관련 메서드
- **`page.waitForTimeout(timeout)`**  
  지정된 시간만큼 대기하기.
  
- **`page.waitForLoadState(state, {timeout: 3000})`**  
  페이지 로드 상태에 맞게 기다리기.
  
- **`page.waitForURL(url)`**  
  페이지가 특정 URL로 변경될 때까지 기다리기.

#### 4. 검증 및 확인
- **`expect(element).toBeEnabled()`**  
  요소가 활성화되어 있는지 확인.
  
- **`expect(page).toHaveURL(url)`**  
  페이지가 특정 URL을 가지고 있는지 확인.
  
- **`expect(element).toHaveText(text)`**  
  요소의 텍스트가 특정 값과 일치하는지 확인.
  
- **`expect(element).toBeVisible()`**  
  요소가 화면에 표시되는지 확인.

#### 5. 스크린샷 및 상태
- **`page.screenshot(options)`**  
  현재 페이지의 스크린샷을 찍기.
  
- **`page.setViewportSize(size)`**  
  페이지의 뷰포트 크기 설정.
  
- **`page.context()`**  
  현재 페이지의 브라우저 컨텍스트 가져오기.

#### 6. 기타
- **`expect(element).toBeVisible()`**  
  요소가 화면에 표시되는지 확인.
  
- **`page.close()`**  
  현재 페이지 닫기.
  
- **`expect(buttonLike).toBeEnabled()`**  
  버튼이 활성화 되어 있는지 확인.



### 불안정한 테스트 대처 방법
- DB 초기화: 실행 시마다 데이터베이스를 초기화하여 테스트 시점에 상태를 동일하게 유지.
- 사용자 새로 만들기: 테스트 시 기존 사용자 정보를 변경하지 않도록 새 사용자로 테스트.
- 리소스 경합 방지: 테스트 간 리소스가 경합하지 않도록 관리.
- 빌드된 서버로 테스트: 로컬 개발 환경이 아닌 빌드된 애플리케이션 서버에서 테스트.
- 비동기 처리 대기: 비동기 작업이 완료될 때까지 기다리기.
- 테스트 실패 원인 조사: --debug 모드를 사용하여 테스트 실패 원인을 분석.
- CPU 코어 수 맞추기: CI 환경과 CPU 코어 수를 맞추어 테스트 환경을 일관되게 유지.
- 테스트 범위 최적화: 필요 없는 테스트를 줄여 테스트 속도 개선.

#### 최근 테스트코드 도입 중 이슈

"GitHub에 테스트 계정의 ID와 비밀번호를 노출하지않기위해서 어떤 방법을 쓰면 좋을까"에 대해서 논의했었는데, 다른 분들은 어떤 방법을 쓰시는지 궁금합니다.

```tsx
❌
export async function login({
  page,
  userName = 'testfront'
}) {
 await page.getByRole("textbox", {name: "메일주소"}).file("testfront@front.com");
await page.getByRole("textbox", {name: "비밀번호"}).file("front1234");
 await page.getByRole("button", {name: "로그인"}).click();
}
```

- 환경변수 사용
- 실제 로그인 API를 호출하지않고 mocking