# 04. 목 객체

## 1. 목 객체를 사용하는 이유

목 객체 → 테스트가 어려운 부분을 테스트 + 더 효율적인 테스트

- 실제 실행 환경과 가장 유사하면서도 API 통신에 대한 성공 케이스 + 실패 케이스도 테스트 해야 한다.
- 이러한 체크는 실제 환경에서는 어렵다

## 2. 목 객체 용어

상황에 따라 세분화된 객체의 명칭, 테스트 더블의 일종

테스트 더블 - 테스트하기 까다로운 케이스를 대신 진행 가능하게 만들어주는 객체

### 2-1. 스텁을 사용하는 이유

`스텁(stub)`은 주로 대역으로 사용한다.

- 반환하는 값에 대한 기대를 가정하고 지정한 더미 데이터
- 기대한 값을 테스트 하는 것

### 2-2. 스파이를 사용하는 이유

`스파이(spy)`는 주로 기록하는 용도이다

- 몇번 호출, 어떤 인자, 어떤 반환값을 기록한다.

### 2-3. 제스트의 영어 혼란

- 스텁, 스파이의 기준을 명확히 따르지 않고 목 모듈(jest.mock) or 목 함수(jest.fn, jest.spyOn)을 사용
- 목 객체 - 테스트 대역

---

## 2. 목 모듈을 사용한 스텁

테스트를 실시할 때 미구현되거나 수정이 필요한 모듈에 의존적인 경우가 있다

이때 해당 모듈로 대체하면 테스트할 수 있게 된다.

```tsx
// ./greet

// 구현된 함수
export function greet(name: string) {
  return `Hello! ${name}.`;
}

// 미구현된 함수
export function sayGoodBye(name: string) {
  throw new Error("미구현");
}
```

의도대로 정상동작하는 테스트

```tsx
import { greet } from "./greet";

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});
```

실패할 것처럼 보이지만 성공하는 테스트

`jest.mock`을 통해 테스트할 `greet` 모듈을 대체했기 때문이다.

```tsx
import { greet } from "./greet";

jest.mock("./greet");

test("인사말을 반환하지 않는다(원래 구현과 다르게)", () => {
  expect(greet("Taro")).toBe(undefined);
});
```

### 2-1. 모듈을 스텁으로 대체하기

`jest.mock(대체할 모듈, 대체할 함수 구현)`

모듈의 일부를 테스트 시에 대체한다면 원하는 대로 테스트 가능하게 만들 수 있다.

```tsx
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

// mocking한 스텁에서 대체할 함수를 구현하지 않았기에 그대로 undefined 반환
test("인사말이 구현되어 있지 않다(원래 구현과 다르게)", () => {
  expect(greet).toBe(undefined);
});

// mocking한 스텁에서 대체할 함수를 구현하였기에 원하는 대로 반
// 원래는 Error를 반환하는 미구현된 함수이다.
test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

### 2-2. 모듈 일부를 스텁으로 대체하기

현재 모듈에서는 `greet, sayGoodBye` 모두 `mock`을 통해 대체한 상태이다.

하지만 `greet`는 이미 정상동작하는 함수이며 있는 그대로 테스트하고 싶다면 `jest.requireActual(대체할 모듈)` 을 통해 일부분만 스텁으로 대체할 수 있다.

```tsx
jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"), // <- 원래 모듈 사용하기!
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});
```

---

## 3. 웹 API 목 객체 기초

대체된 웹 API 클라이언트로 테스트를 작성한다

스텁은 실제 응답은 아니지만 응답 전후의 관련 코드를 검증할 때 유용하게 사용할 수 있다.

테스트할 함수

```tsx
export type Profile = {
  id: string;
  name?: string;
  age?: number;
  email: string;
};

// ==========================================

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw data;
  }
  return data;
}

const host = (path: string) => `https://myapi.testing.com${path}`;

export function getMyProfile(): Promise<Profile> {
  return fetch(host("/my/profile")).then(handleResponse);
}

// ==========================================

export function getMyProfile(): Promise<Profile> {
  return fetch("https://myapi.testing.com/my/profile").then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  });
}

// ==========================================

export async function getGreet() {
  // 테스트하고 싶은 것은 이 라인에서의 데이터 취득 여부와
  const data = await getMyProfile();
  // 취득한 데이터를 이 라인에서 사용할 수 있는지다.
  if (!data.name) {
    return `Hello, anonymous user!`;
  }
  return `Hello, ${data.name}!`;
}
```

웹 API 클라이언트인 `getMyProfile` 함수를 스텁으로 대체하면 실제 서버가 없어도 테스트가 가능하다.

### 3-1. 웹 API 클라이언트 스텁 구현

mock을 통해 Fetchers 모듈을 대체

```tsx
import * as Fetchers from "../fetchers";

jest.mock("../fetchers");
```

그 중에서 `*jest.spyOn*` 을 통해 `getMyProfile` 함수를 대체한다.

```tsx
jest.spyOn(테스트할 겍체, 테스트할 함수 이름)
jest.spyOn(Fetchers, "getMyProfile")
```

없는 함수를 들고 오면 에러가 발생한다.

```tsx
jest.spyOn(Fetchers, "noFn");
```

```
Error: Cannot spy on the noFn property because it is not a function; undefined given instead.
If you are trying to mock a property, use `jest.replaceProperty(object, 'noFn', value)` instead.Jest
Property 'mockResolvedValueOnce' does not exist on type 'never'.
```

### 3-2. 성공 케이스 테스트 (resolve 재현 스텁)

`mockResolvedValueOnce` 함수를 통해 성공 케이스에 대한 반환값을 검증할 수 있다.

`jest.fn().mockImplementationOnce(() => Promise.resolve(value));`

```tsx
export async function getGreet() {
  // 테스트하고 싶은 것은 이 라인에서의 데이터 취득 여부와
  const data = await getMyProfile();
  // 취득한 데이터를 이 라인에서 사용할 수 있는지다.
  if (!data.name) {
    return `Hello, anonymous user!`;
  }
  return `Hello, ${data.name}!`;
}

// ==========================================

test("데이터 취득 성공 시 : 사용자 이름이 없는 경우", async () => {
  // getMyProfile이 resolve됐을 때의 값을 재현
  jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
    id: "xxxxxxx-123456",
    email: "taroyamada@myapi.testing.com",
  });
  await expect(getGreet()).resolves.toBe("Hello, anonymous user!");
});

test("데이터 취득 성공 시: 사용자 이름이 있는 경우", async () => {
  jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
    id: "xxxxxxx-123456",
    email: "taroyamada@myapi.testing.com",
    name: "taroyamada",
  });
  await expect(getGreet()).resolves.toBe("Hello, taroyamada!");
});
```

### 3-3. 실패 케이스 테스트 (reject 재현 스텁)

`mockRejectedValueOnce` 함수의 인자로 오류 객체를 넣으면 실패 시에 해당 객체를 반환한다.

`jest.fn().mockImplementation(() => Promise.reject(value));`

```tsx
export function getMyProfile(): Promise<Profile> {
  return fetch("https://myapi.testing.com/my/profile").then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      // 실패시 예외 처리
      throw data; // 오류 객체 반환
    }
    return data;
  });
}

// ==========================================

// 오류 객체
export const httpError: HttpError = {
  err: { message: "internal server error" },
};

// ==========================================

test("데이터 취득 실패 시", async () => {
  // getMyProfile이 reject됐을 때의 값을 재현
  jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
  await expect(getGreet()).rejects.toMatchObject({
    err: { message: "internal server error" }, // 오류 객체 반환!
  });
});

// 예외 발생을 검증하고 싶다면??? 이전 장에서 배웠던 방식
test("데이터 취득 실패 시 에러가 발생한 데이터와 함께 예외가 throw된다", async () => {
  expect.assertions(1); // 호출 1회 기대
  jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError); //reject 스텁
  try {
    await getGreet();
  } catch (err) {
    expect(err).toMatchObject(httpError); // 기대 1회 호출
  }
});
```

---

## 4. 웹 API 목 객체 생성 함수

응답 데이터를 대체하는 목 객체 생성 함수 사용법

```tsx
export async function getMyArticleLinksByCategory(category: string) {
  // 데이터 취득 함수(Web API 클라이언트)
  const data = await getMyArticles();
  // 취득한 데이터 중 지정한 태그를 포함한 기사만 골라낸다.
  const articles = data.articles.filter((article) =>
    article.tags.includes(category)
  );
  if (!articles.length) {
    // case1. 해당되는 기사가 없으면 null을 반환한다.
    return null;
  }
  // case2. 해당되는 기사가 있으면 목록용으로 가공해서 데이터를 반환한다.
  return articles.map((article) => ({
    title: article.title,
    link: `/articles/${article.id}`,
  }));
}
```

위 함수를 위한 테스트 케이스 3개

1. 태그와 매칭되는 기사가 없으면 null 반환
2. 태그와 매칭되는 기사가 있다면 가공된 데이터 반환
3. 데이터 패칭 실패시 예외 발생

### 4-1. 응답을 교체하는 목 객체 생성 함수

준비물

- `getMyArticles` 웹 클라이언트 API
- 픽스처(응답 재현을 위한 테스트용 데이터)

```tsx
// 타입
export type Article = {
  id: string;
  createdAt: string;
  tags: string[];
  title: string;
  body: string;
};

// ==========================================

// 웹 클라이언트 API
export function getMyArticles(): Promise<Articles> {
  return fetch(host("/my/articles")).then(handleResponse);
}

// ==========================================

// 픽스처
export const getMyArticlesData: Articles = {
  articles: [
    {
      id: "howto-testing-with-typescript",
      createdAt: "2022-07-19T22:38:41.005Z",
      tags: ["testing"],
      title: "타입스크립트를 사용한 테스트 작성법",
      body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
    },
    {
      id: "nextjs-link-component",
      createdAt: "2022-07-19T22:38:41.005Z",
      tags: ["nextjs"],
      title: "Next.js의 링크 컴포넌트",
      body: "Next.js는 화면을 이동할 때 링크 컴포넌트를 사용한다",
    },
    {
      id: "react-component-testing-with-jest",
      createdAt: "2022-07-19T22:38:41.005Z",
      tags: ["testing", "react"],
      title: "제스트로 시작하는 리액트 컴포넌트 테스트",
      body: "제스트는 단위 테스트처럼 UI 컴포넌트를 테스트할 수 있다",
    },
  ],
};
```

- 목 객체 생성 함수 만들기

반복적인 spyOn 생성없이 편안한 테스트 가능

```tsx
function mockGetMyArticles(status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "getMyArticles")
      .mockRejectedValueOnce(httpError);
  }
  return jest
    .spyOn(Fetchers, "getMyArticles")
    .mockResolvedValueOnce(getMyArticlesData);
}
```

### 4-2. 성공 케이스 테스트

- case1. 매칭되는게 없으니 null 반환

```tsx
test("지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("playwright");
  expect(data).toBeNull(); // null!
});
```

- case2. 매칭된 데이터 반환

```tsx
test("지정한 태그를 포함한 기사가 한 건 이상 있으면 링크 목록을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("testing");
  expect(data).toMatchObject([
    {
      link: "/articles/howto-testing-with-typescript",
      title: "타입스크립트를 사용한 테스트 작성법",
    },
    {
      link: "/articles/react-component-testing-with-jest",
      title: "제스트로 시작하는 리액트 컴포넌트 테스트",
    },
  ]);
});
```

### 4-3. 실패 케이스 테스트

```tsx
test("데이터 취득에 실패하면 reject된다", async () => {
  expect.assertions(1); // 이건 사용할 필요가 없을까?
  mockGetMyArticles(500);
  await getMyArticleLinksByCategory("testing").catch((err) => {
    expect(err).toMatchObject({
      err: { message: "internal server error" },
    });
  });
});
```

## 5. 목 함수를 사용하는 스파이

### 5-1. 실행됐는지 검증하기

- `jest.fn`을 사용한 목 함수 작성
- `toBeCalled` matcher을 통해 목 함수가 호출되었는지 검증

```tsx
test("목 함수가 실행됐다", () => {
  const mockFn = jest.fn();
  mockFn(); // 호출!
  expect(mockFn).toBeCalled(); // 호출 검증!
});

test("목 함수가 실행되지 않았다", () => {
  const mockFn = jest.fn();
  expect(mockFn).not.toBeCalled(); // 호출 안됨 검증!
});
```

### 5-2. 실행 횟수 검증

- `toHaveBeenCalledTimes` matcher를 통해 함수 호출 횟수 검증

```tsx
test("목 함수는 실행 횟수를 기록한다", () => {
  const mockFn = jest.fn();
  mockFn(); // 1번
  expect(mockFn).toHaveBeenCalledTimes(1); // 1번 호출되었나?
  mockFn(); // 2번
  expect(mockFn).toHaveBeenCalledTimes(2); // 2번 호출 되었나?
});
```

### 5-3. 실행시 인수 검증

- `toHaveBeenCalledWith` matcher를 통해 특정 인수로 호출되는 지 검증

```tsx
test("목 함수는 함수 안에서도 실행할 수 있다", () => {
  const mockFn = jest.fn();
  function greet() {
    mockFn(); // 1번
  }
  greet();
  expect(mockFn).toHaveBeenCalledTimes(1); // 1번 호출되었나?
});

test("목 함수는 실행 시 인수를 기록한다", () => {
  const mockFn = jest.fn();
  function greet(message: string) {
    mockFn(message); // 인수를 받아 실행된다.
  }
  greet("hello"); // "hello"를 인수로 실행된 것이 mockFn에 기록된다.
  expect(mockFn).toHaveBeenCalledWith("hello");
});
```

### 5-4. 실행 시 인수가 객체일 때의 검증

- 인수가 배열, 객체여도 검증이 가능하다.
- `toHaveBeenCalledWith` matcher로 검증이 가능하다.
- `objectContaining` matcher를 통해 부분 검증도 가능하다.

```tsx
const config = {
  mock: true,
  feature: { spy: true },
};

test("목 함수는 실행 시 인수가 객체일 때에도 검증할 수 있다", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith({
    mock: true,
    feature: { spy: true },
  });
});

test("expect.objectContaining를 사용한 부분 검증", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      feature: { spy: true }, // 일부만 검증
    })
  );
});
```

---

## 6. 웹 API 목 객체의 세부 사항

```tsx
// 유효성 검사를 위한 함수
export class ValidationError extends Error {}

export function checkLength(value: string) {
  if (value.length === 0) {
    throw new ValidationError("한 글자 이상의 문자를 입력해주세요");
  }
}

// ==========================================

jest.mock("../fetchers");

// 웹 API 목 객체 생성 함수
function mockPostMyArticle(input: ArticleInput, status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
  try {
    checkLength(input.title); // 유효성 검사 !
    checkLength(input.body); // 유효성 검사 !
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockResolvedValue({ ...postMyArticleData, ...input });
  } catch (err) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
}

// ==========================================

// 동적인 값 생성을 위한 함수
function inputFactory(input?: Partial<ArticleInput>) {
  return {
    tags: ["testing"],
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
    ...input,
  };
}
```

### 6-1. 성공 케이스 테스트

```tsx
test("유효성 검사에 성공하면 성공 응답을 반환한다", async () => {
  // =================성공=======================

  // 유효성 검사에 통과하는 입력을 준비한다.
  const input = inputFactory();

  // ==========================================
  // 입력값을 포함한 성공 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input);
  // input을 인수로 테스트할 함수를 실행한다.
  const data = await postMyArticle(input);
  // 취득한 데이터에 입력 내용이 포함됐는지 검증한다.
  expect(data).toMatchObject(expect.objectContaining(input));
  // 목 함수가 호출됐는지 검증한다.
  expect(mock).toHaveBeenCalled();
});
```

### 6-2. 실패 케이스 테스트

```tsx
test("유효성 검사에 실패하면 reject된다", async () => {
  expect.assertions(2);
  // =================실패=======================

  // 유효성 검사에 통과하지 못하는 입력을 준비한다.
  const input = inputFactory({ title: "", body: "" });

  // ==========================================
  // 입력값을 포함한 성공 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input);
  // 유효성 검사에 통과하지 못하고 reject됐는지 검증한다.
  await postMyArticle(input).catch((err) => {
    // 에러 객체가 reject됐는지 검증한다.
    expect(err).toMatchObject({ err: { message: expect.anything() } });
    // 목 함수가 호출됐는지 검증한다.
    expect(mock).toHaveBeenCalled();
  });
});

// ==========================================

test("데이터 취득에 실패하면 reject된다", async () => {
  expect.assertions(2);
  // 유효성 검사에 통과하는 입력값을 준비한다.
  const input = inputFactory();
  // =================실패=======================

  // 실패 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input, 500);

  // ==========================================
  // reject됐는지 검증한다.
  await postMyArticle(input).catch((err) => {
    // 에러 객체가 reject됐는지 검증한다.
    expect(err).toMatchObject({ err: { message: expect.anything() } });
    // 목 함수가 호출됐는지 검증한다.
    expect(mock).toHaveBeenCalled();
  });
});
```

---

## 7. 현재 시각에 의존하는 테스트

- 보통 테스트는 고정된 시점, 상황을 가정하고 테스트 한다.
- 테스트 코드에 시간에 관련된 값이 들어가면 고정된다고 생각하지만 그렇지 않다.
- 그래서 고정된 시간을 위한 세팅이 별도로 필요하다.

```tsx
beforeEach(() => {
  jest.useFakeTimers(); // 각 테스트 시작 전 가짜 타이머 설정
});

afterEach(() => {
  jest.useRealTimers(); // 각 테스트 종료 후 실제 타이머로 복귀
});
```

- `setSystemTime` 함수는 특정 가짜 시간으로 고정한다.

```tsx
test("점심에는 '식사는 하셨나요'를 반환한다", () => {
  jest.setSystemTime(new Date(2023, 4, 23, 14, 0, 0)); // 특정 시간으로 고정
  expect(greetByTime()).toBe("식사는 하셨나요");
});
```

### 7-1. 설정과 파기

- 테스트 시작 전후로 설정 또는 파기할 수 있는 지점들이 있다.
- before은 top-down
- after은 botoom-up
- 이런 느낌인듯 하다?

```tsx
describe("설정 및 파기 타이밍", () => {
  1. beforeAll(() => console.log("1 - beforeAll"));
  12. afterAll(() => console.log("1 - afterAll"));
  2. 6. beforeEach(() => console.log("1 - beforeEach"));
  4. 10. afterEach(() => console.log("1 - afterEach"));

  3. test("", () => console.log("1 - test"));

  describe("Scoped / Nested block", () => {
    5. beforeAll(() => console.log("2 - beforeAll"));
    11. afterAll(() => console.log("2 - afterAll"));
    7. beforeEach(() => console.log("2 - beforeEach"));
    9. afterEach(() => console.log("2 - afterEach"));

    8. test("", () => console.log("2 - test"));
  });

  // 1 - beforeAll
  // 1 - beforeEach
  // 1 - test
  // 1 - afterEach
  // 2 - beforeAll
  // 1 - beforeEach
  // 2 - beforeEach
  // 2 - test
  // 2 - afterEach
  // 1 - afterEach
  // 2 - afterAll
  // 1 - afterAll
});
```
