# E2E 테스트에 대해

E2E 테스트 프레임워크로 테스트를 실시할 때 아래와 같은 상황을 구분하지 않고 E2E 테스트라고 함

- 브라우저 고유 기능과 연동한 UI 테스트
- DB 및 하위 시스템과 연동된 E2E 테스트

## 생각정리

- E2E 테스트가 언제 필요할까?
- 두가지로 나눌 수 있다.
  1. 실제 상황과 유사하게 UI를 테스트하고 싶다면, mock 서버를 만들어 E2E 테스트 프레임워크의 기능으로 테스트를 진행한다.
  2. DB 및 서브 시스템과 연동해서 실제 유사성을 높여서 테스트를 한다.
- 모든 기능을 테스트하기 위해 E2E를 쓴다기 보다는 Mock 서버를 통해 기능별 검증도 가능함을 알 수 있다.

# 실제 테스트 예시

✅ → 제 생각을 정리한 부분을 표시 해두었습니다.

## 로그인 테스트

사용자의 행동을 함수화해서 util에서 가져와 사용한다.

```tsx
// Login.spec.ts
...
test("로그인 상태이면 로그아웃할 수 있다", async ({ page }) => {
    await page.goto(url("/login"));
    await login({ page });
    await expect(page).toHaveURL(url("/"));
    await logout({ page });
    await expect(page).toHaveURL(url("/"));
    const buttonLogin = page.getByRole("link", { name: "로그인" });
    await expect(buttonLogin).toBeVisible();
  });
...


// utils.ts
export async function login({
  page,
  userName = "JPub",
}: {
  page: Page;
  userName?: UserName;
}) {
  const user = getUser(userName)!;
  await page.getByRole("textbox", { name: "메일주소" }).fill(user.email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(user.password);
  await page.getByRole("button", { name: "로그인" }).click();
}
```

- ✅ 언제 `waitForNavigation` 을 사용하는걸까?
  ```tsx
  test("로그인 성공 시 리다이렉트 이전 페이지로 돌아간다", async ({ page }) => {
    await page.goto(url("/my/posts"));
    // <-- 여기서 waitForNavigation이 없어도 괜찮은가?
    // 이미 goto 함수 안에 redirect 행위도 포함되어서 await을 하는건지?
    await expect(page).toHaveURL(url(path));
    await login({ page });
    await expect(page).toHaveURL(url("/my/posts"));
  });
  ```
  - `goto` ([playwright document](https://playwright.dev/docs/navigations))
    - 위의 코드는 페이지를 로드하고 웹 페이지가 [로드](https://developer.mozilla.org/en-US/docs/Web/API/Window/load_event) 이벤트를 발생시킬 때까지 기다립니다. 로드 이벤트는 스타일시트, 스크립트, iframe, 이미지와 같은 모든 종속 리소스를 포함하여 전체 페이지가 로드되면 발생합니다.
  - redirect가 발생해도 보통 모든 리소스가 로드되기 전 redirect 판단을 Middleware에서 내리기 때문에 goto 함수 이후에 `waitForNavigation` 는 필요없음.
  - 그러면 `login` 이후에는 필요없을까?
    - login 함수는 `click` 이벤트로 끝난다.
    - 코드에서는 로그인 성공시 `window.location.href = data.redirectUrl` 로 페이지를 redirect 시켜주는데, 브라우저 동작을 `click` 이벤트는 기다려주지 않음.
    - 하지만 playwright은 기본적으로 어느정도 wait을 보장함 ([Auto-Waiting](https://playwright.dev/docs/actionability))
      - `toHaveURL` 도 마찬가지임
    - 따라서 시간이 오래 걸린다면 `toHaveURL` 의 option에 `timeout` 을 설정해보자.
      - `waitForNavigation` 의 기본값은 timeout 없음 이기 때문에 일정 시간이 지났을 때 assertion이 필요하다면 timeout 옵션을 사용해보자
      - `waitFor~~` 은 Assertion을 위해서 사용하는게 아닌 실제 “기다리기 위해” 사용하는 함수들이다. 따라서 따로 Assertion기능이 없기 때문에 Assertion이 필요하다면 `toHave~~` 를 사용하자.

## 프로필 테스트

- 블랙박스 테스트

```tsx
test("프로필을 편집하면 프로필에 반영된다", async ({ page }) => {
  await page.goto(url(path));
  await login({ page, userName });
  // 여기서부터 프로필 편집화면
  await expect(page).toHaveURL(url(path));
  await expect(page).toHaveTitle(`${userName}님의 프로필 편집`);
  await page.getByRole("textbox", { name: "사용자명" }).fill(newName);
  await page.getByRole("button", { name: "프로필 변경하기" }).click();
  // ✅ click 이후 여기서는 waitForURL을 사용했다.
  // ✅ 다음 행위를 테스트하고 Assertion하기 위해 waitForURL 사용함.
  await page.waitForURL(url("/my/posts"));
  // 페이지 제목에 방금 입력한 이름이 포함돼 있다.
  await expect(page).toHaveTitle(`${newName}님의 기사 목록`);
  await expect(page.getByRole("region", { name: "프로필" })).toContainText(
    newName
  );
  await expect(page.locator("[aria-label='로그인한 사용자']")).toContainText(
    newName
  );
});
```

## 생각정리

- E2E 테스트는 페이지 이동, 비동기 처리 등 처리 시간이 보장되지 않는 행동들을 테스트한다.
- 기본적으로 Assertion 함수들은 5000ms 의 timeout을 갖고있다.
  - [test-config](https://playwright.dev/docs/api/class-testconfig#test-config-expect) 에서 갖고있는 defaultTimeout 을 따른다.
- `waitFor~~` 과 `toHave~~` 를 잘 구분해서 사용해야 한다.
  - 테스트 결과를 위한 Assertion은 toHave를 사용하고, 페이지 이동이나 기다리는 행동은 waitFor을 사용하자.

# 불안전한 테스트 대처법

1. 실행할때마다 DB 초기화
2. 테스트마다 사용자 새로 만들기
3. 테스트간 리소스가 경합하지 않도록 주의하기
   1. 매번 테스트마다 새로운 CRUD를 사용해서 데이터가 겹치지 않도록 잘 관리하자
4. 빌드한 어플리케이션 서버로 테스트하기
   1. local dev환경에서 테스트가 아닌 build 후 테스트하자. (응답속도 등 안정성 이슈)
5. 비동기 처리 대기
   1. 실제 결과 response까지 걸리는 시간이 충분하지 체크하자
6. —debug로 실패 원인 조사
   1. 직접 debugger에서 한줄씩 동작 확인 가능
7. CI 환경과 CPU 코어수 맞추기
   1. jest와 playwright는 동시에 처리하는 테스트가 CPU 코어수에 따라 다르다
   2. 따라서 테스트가 통과한 환경과 CI 환경의 CPU 코어수가 다르면 테스트 결과가 달라질 수 있다.
   3. Test Runner에서 고정된 CPU 코어 수를 사용하도록 지정할 수 있다.
8. 테스트 범위 최적화

## 생각정리

- 실행할때마다 DB 초기화가 가능할까?
  - 실제 backend 까지 구현해서 테스트할게 아니라면 실현하기 어려운 부분이라고 생각함.
  - msw를 사용한 mock API 구성을 잘 하는게 더 현실성 있어보임.
- E2E를 모두 구성하는게 정답은 당연히 아니다. 구현해도 자세한 기능 검증을 하는것도 정답은 아니다. 테스트의 안정성을 미뤄보았을 때, E2E가 아닌 통합테스트로 대체하는것도 방법이다.
- 얼마나 적은 비용으로 안정성 있는 서비스를 만들어 갈 수 있을까? 그 비용은 어떻게 측정할 수 있을까?
  - 정답은 없지만, unit test, ui test 만 적절히 잘 이뤄져도 서비스 안정성에 크게 기여할 수 있을거라고 생각한다.
