# E2E 테스트

## E2E 테스트란

- 브라우저를 사용할 수 있기 때문에 실제 애플리케이션에 가까운 테스트가 가능하다.
- 브라우저 고유의 API를 사용하거나 화면을 이동하며 테스트해야 하는 상황에 유용하다.

### 브라우저 고유 기능과 연동된 UI 테스트

- 화면 간의 이동, 화면 크기를 측정해서 실행되는 로직, 반응형 처리, 스크롤 위치에 따른 이벤트 발생, 쿠키나 로컬 스토리지 사용
- 목 객체를 만들어서 테스트를 작성할 수 있지만, 브라우저로 실제 상황과 최대한 유사하게 테스트하고 싶다면 **UI 테스트**를 하자
- API 서버나 다른 하위 시스템은 목 서버로 만들면 된다.

### 데이터베이스 및 하위 시스템과 연동한 E2E 테스트

- 표현 계층, 응용 계층, 영속 계층을 연동해 검증한다.
- 헤드리스 브라우저 <-> 애플리케이션 서버 <-> 데이터베이스

## Playwright 기초

### Locator

- 접근성 기반 로케이터를 우선적으로 사용하는 것을 권장한다.
- RTL과 다른 점은 대기 시간이 필요한지에 따라 `findByRole` 등을 구분해서 사용하지 않아도 된다.
- 인터랙션이 비동기 함수이기 때문에 `await` 키워드를 사용하면 현재 인터랙션이 완료될 때까지 기다린 후 다음 인터랙션을 실행한다.

```ts
await page.getByLabel("User Name").fill("John");
await page.getByLabel("Password").fill("secret-password");
await page.getByRole("button", { name: "Sign in" }).click();
```

### 단언문

- `expect` 함수의 인수로 로케이터 혹은 페이지를 전달할 수 있다.

```ts
// 로케이터
await expect(page.getByRole("checkbox")).toBeChecked();
await expect(page.getByRole("heading")).not.toContainText("some text");
```

```ts
// 페이지
await expect(page).toHaveURL(/.*intro/);
await expect(page).toHaveTitle(/Playwright/);
```

> E2E 테스트 예제: https://github.com/frontend-testing-book-kr/nextjs/tree/main/e2e

> 세부 내용을 건드리지 않는 **블랙박스 테스트** 형식으로 작성하자

## 유틸함수 만들어 재사용성 높이기

여러 테스트에서 사용되는 반복적인 작업들을 유틸함수로 만들어 재사용성 높이자

### 인증 관련 작업

#### 사용자 로그인

```ts
export async function login({
  page,
  userName = "JPub",
}: {
  page: Page;
  userName?: UserName;
}) {
  const user = getUser(userName)!; // 테스트용 사용자 반환
  await page.getByRole("textbox", { name: "메일주소" }).fill(user.email);
  await page.getByRole("textbox", { name: "비밀번호" }).fill(user.password);
  await page.getByRole("button", { name: "로그인" }).click();
}
```

#### 로그인 상태가 아닐 때 로그인 화면으로 리다이렉트하는지 검증

```ts
export async function assertUnauthorizedRedirect({
  page,
  path,
}: {
  page: Page;
  path: string;
}) {
  // 지정된 페이지에 접근한다.
  await page.goto(url(path));
  // 리다이렉트될 때까지 기다린다.
  await page.waitForURL(url("/login"));
  // 로그인 페이지로 이동했는지 확인한다.
  await expect(page).toHaveTitle("로그인 | Tech Posts");
}
```

```ts
test("로그인 상태가 아니면 로그인 화면으로 리다이렉트된다", async ({
  page,
}) => {
  await assertUnauthorizedRedirect({ page, path });
});
```

### 특정 기능 관련 작업 (예시: 게시물 만들기)

```ts
export async function gotoAndFillPostContents({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await page.goto(url("/login"));
  await login({ page, userName });
  await expect(page).toHaveURL(url("/"));
  await page.goto(url("/my/posts/create"));
  await page.setInputFiles("data-testid=file", [
    "public/__mocks__/images/img01.jpg",
  ]);
  await page.waitForLoadState("networkidle", { timeout: 30000 });
  await page.getByRole("textbox", { name: "제목" }).fill(title);
}

export async function gotoAndCreatePostAsDraft({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await gotoAndFillPostContents({ page, title, userName });
  await page.getByRole("button", { name: "비공개 상태로 저장" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
}

export async function gotoAndCreatePostAsPublish({
  page,
  title,
  userName,
}: {
  page: Page;
  title: string;
  userName: UserName;
}) {
  await gotoAndFillPostContents({ page, title, userName });
  await page.getByText("공개 여부").click();
  await page.getByRole("button", { name: "공개하기" }).click();
  await page.getByRole("button", { name: "네" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
}

export async function gotoEditPostPage({
  page,
  title,
}: {
  page: Page;
  title: string;
}) {
  await page.getByRole("link", { name: "편집하기" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(`기사 편집 | ${title}`);
}
```

```ts
// MyPostsCreate.spec.ts
test("신규 기사를 비공개 상태로 저장할 수 있다", async ({ page }) => {
  const title = "비공개 상태로 저장하기 테스트";
  await gotoAndCreatePostAsDraft({ page, title, userName });
});

test("신규 기사를 공개할 수 있다", async ({ page }) => {
  const title = "공개하기 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
});
```

```ts
// MyPosts.spec.ts
test("신규 기사를 비공개 상태로 저장하면 게재된 기사 목록에 기사가 추가된다", async ({
  page,
}) => {
  const title = "비공개로 저장된 기사 목록 테스트";
  await gotoAndCreatePostAsDraft({ page, title, userName });
  await page.goto(url(path));
  await expect(page.getByText(title)).toBeVisible();
});

test("신규 기사를 공개 상태로 저장하면 게재된 기사 목록에 기사가 추가된다", async ({
  page,
}) => {
  const title = "공개 상태로 저장된 기사 목록 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
  await page.goto(url(path));
  await expect(page.getByText(title)).toBeVisible();
});
```

```ts
// Top.spec.ts
test("신규 기사를 공개 상태로 저장하면 최신 기사 목록에 표시된다", async ({
  page,
}) => {
  const title = "공개 저장 후 최신 기사 목록 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
  await page.goto(url(path));
  await expect(page.getByText(title)).toBeVisible();
});

test("공개된 기사를 비공개하면 최신 기사 목록에 표시되지 않는다", async ({
  page,
}) => {
  const title = "비공개 후 최신 기사 목록 테스트";
  await gotoAndCreatePostAsPublish({ page, title, userName });
  await gotoEditPostPage({ page, title });
  await page.getByText("공개 여부").click();
  await page.getByRole("button", { name: "비공개 상태로 저장" }).click();
  await page.waitForNavigation();
  await expect(page).toHaveTitle(title);
  await page.goto(url(path));
  await expect(page.getByText(title)).not.toBeVisible();
});
```

## 불안정한 테스트 대처 방법

네트워크 지연이나 메모리 부족에 의한 서버 응답 지연 등 다양한 원인이 존재한다.

### 실행할 때마다 데이터베이스 재설정하기

- DB를 사용하는 E2E 테스트는 테스트를 실행하면 데이터가 변경된다.
- 일관성 있는 결과를 얻기 위해 테스트를 실행할 때마다 시드 스크립트로 DB를 재설정하자

### 테스트 간 리소스가 경합되지 않도록 주의하기

- 테스트가 병렬처리 되었을 때 테스트 실행 순서를 보장할 수 없기 때문에 각 테스트에서 매번 새로운 리소스를 작성해 테스트 간 리소스 경합이 발생하지 않도록 하자

### 빌드한 애플리케이션 서버로 테스트하기

- 개발 서버는 응답 속도가 느려 불안정한 테스트의 원인이 된다.

### 비동기 처리 대기하기

- 네트워크 통신 등 비동기 작업을 수행할 때 응답을 대기해야 한다.
- 만약 조작할 요소가 존재하고 문제없이 인터랙션이 할당됐음에도 테스트가 실행한다면 비동기 처리를 제대로 대기하는지 확인해야 한다.

### --debug로 테스트 실패 원인 조사하기

- 디버거를 활용해 불안정한 테스트의 원인을 파악하자

### CI 환경과 CPU 코어 수 맞추기

- 로컬에서 테스트를 실행했을 때는 모두 통과하지만 CI 환경에서는 실패하기도 한다.
- 이 경우에는 로컬 기기의 CPU 코어 수와 CI의 코어 수가 동일한지 확인해야 한다.
- 코어 수를 명시적으로 지정하지 않으면 실행 환경의 CPU 코어 수에 따라 가능한 만큼 병렬처리하기 때문에 CPU 코어 수가 변동되지 않도록 설정을 고정하자.
- 이렇게 해도 해결되지 않는다면 대기 시간의 상한을 늘리는 것도 방법이다. 전체 테스트에 많은 시간이 걸릴 수 있지만 C에서 테스트가 실패해 계속 재시도하는 것보다 시간을 단축시킬 수 있다.

### 테스트 범위 최적화

- 상황에 따라 E2E 테스트로 검증하는 것이 적절한지 살펴봐야 한다.
- E2E 테스트를 넓은 범위의 통합 테스트로 대체할 수 있으면 더 적은 비용으로 안정적인 테스트를 할 수 있다.
- 검증 내용에 맞는 최적의 테스트 범위를 찾아야 불안정한 테스트가 생길 가능성이 낮아진다.
