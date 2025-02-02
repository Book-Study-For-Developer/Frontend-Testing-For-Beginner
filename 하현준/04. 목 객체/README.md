## 목 객체를 사용하는 이유

API 를 사용할 때에 “성공하는 케이스” 뿐만 아니라 “실패하는 케이스”도 테스트를 해야 한다. 실제 API 서버 환경에 연동하면 실패하는 케이스를 테스트하기에는 어려움이 있다.

### 목 객체 용어

스텁과 스파이의 차이

**스텁(stub)**

- 의존 중인 컴포넌트의 대역
- 정해진 값을 반환하는 용도
- 테스트 대상에 할당하는 입력값

테스트 대상이 의존 중인 컴포넌트에 테스트가 어려운 부분이 있으면 스텁을 사용한다.

테스트 대상이 스텁에 접근하게 되면 **스텁은 정해진 값을 반환**하게 된다.

**스파이(spy)**

- 함수나 메서드의 호출 기록
- 호출된 횟수나 실행 시 사용한 인수 기록
- 테스트 대상의 출력 확인

테스트 대상 외부의 출력을 검증할 때 사용한다.

대표적으로는 콜백 함수에 사용되며, 실행 횟수, 실행시 사용한 인수를 기록하며 콜백이 의도한대로 호출했는지 검증한다.

### 제스트의 용어 혼란

제스트는 스텁, 스파이를 구현할 때 위에서 설명한 것을 기반으로 용어를 정의하지 않았다.
⇒ 나도 초반에 spyon, mock의 차이를 이해할 때 어려웠음

Jest는 스텁, 스파이를 구현할 때 `jest.mock`, `jest.fn`, `jest.spyOn` 를 사용한다.

- Mock module: `jest.mock`
- Mock function: `jest.fn`, `jest.spyOn`

**✋ 다시 한번 Recap**

결국 스텁과 스파이는 크게 나누어진 Mock의 분류라고 보면 될 것이고, jest에서는 이를 구현할 수 있도록 3가지의 함수를 제공하는 것이다.

Jest.spyOn ≠ 스파이 는 서로 같은 것이 아니다.

스텁을 구현할 떄 목 모듈을 사용할 수도 있고, 목 함수를 사용할 수도 있는 것

## 목 모듈을 활용한 스텁

실무에서 아직 개발이 되지 않은 모듈에 의존 중일 때 테스트하기가 어려울 수 있다. 이럴 때 **스텁으로 대체**한다면 테스트하는데 도움이 된다.

```tsx
// 테스트가 필요한 함수

export function greet(name: string) {
  return `Hello! ${name}.`;
}

export function sayGoodBye(name: string) {
  throw new Error("미구현");
}
```

```tsx
/**
 * 테스트할 모듈을 대체한다. => 즉 스텁을 만든 것이다.
 * 그러나 테스트할 함수가 실제 의도한 동작과 동일하게 만들어야 진짜 스텁이 되는 것
 */
jest.mock("./greet");

test("인사말을 반환하지 않는다(원래 구현과 다르게)", () => {
  expect(greet("Taro")).toBe(undefined);
});

/**
 * 미구현되어 있던 모듈을 실제 구현이 될 예정인 모듈로 대체함으로써 테스트 코드를 작성할 수 있게 되었다.
 */
jest.mock("./greet", () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test("인사말이 구현되어 있지 않다(원래 구현과 다르게)", () => {
  expect(greet).toBe(undefined);
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

`‘./greet’` 에 있는 모든 함수를 대체하는 것이 아닌 일부만 대체하고 싶다면 `requireActual`을 사용하면 된다.

```
jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"),
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));
```

**✋ ESM vs CJS**

책에서 ESM과 CJS의 임포트 방식을 설명하였는데, ESM과 CJS차이는 자바스크립트 모듈 시스템의 종류이다.

CommonJs의 경우 `require`, `module.exports` 를 사용하여야 한다.

ESM의 경우 우리가 흔히 사용하는 import, export 방식을 사용하면 된다.

두 방식의 큰 차이는 CJS는 동기적으로 로드하고, ESM은 비동기적으로 로드한다. 그래서 트리쉐이킹, 동적 import 등에서 성능 차이가 있다.

요즘에는 대부분 ESM으로 사용하기 때문에 책에서도 이를 선택한 것 같고, 예시 코드에서는 jest.config.js에 이와 관련된 세팅을 해놓았다.

```tsx

  transform: { "^.+\\.(ts|tsx)$": ["esbuild-jest", { sourcemap: true }] },
```

## 웹 API에서 목 객체 기초

```tsx
// 테스트할 함수

export const httpError: HttpError = {
  err: { message: "internal server error" },
};
const host = (path: string) => `https://myapi.testing.com${path}`;

async function handleResponse<T>(res: Response) {
  const data = (await res.json()) as T;
  if (!res.ok) {
    throw data;
  }
  return data;
}

export function getMyProfile() {
  return fetch(host("/my/profile")).then(handleResponse<Profile>);
}

export async function getGreet() {
  const data = await getMyProfile();
  if (!data.name) {
    // 1. name이 없으면 하드코딩된 인사말을 반환한다.
    return `Hello, anonymous user!`;
  }
  // 2. name이 있으면 name을 포함한 인사말을 반환한다.
  return `Hello, ${data.name}!`;
}
```

`getMyProfile`를 스텁으로 대체하여 실제 API 호출 없이 테스트를 구현하도록 할 수 있다.

```tsx
describe("getGreet", () => {
  // getMyProfile을 spyOn하여 응답을 테스트 한다.
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

  // 2. 데이터의 실패 케이스를 테스트한다.
  test("데이터 취득 실패 시", async () => {
    // getMyProfile이 reject됐을 때의 값을 재현
    jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);

    // 이렇게 해도 됨
    // await expect(getGreet()).rejects.toMatchObject(httpError);

    await expect(getGreet()).rejects.toMatchObject({
      err: { message: "internal server error" },
    });
  });
  test("데이터 취득 실패 시 에러가 발생한 데이터와 함께 예외가 throw된다", async () => {
    // 앞에서 말했듯이 실수를 방지하기 위해 실제로 에러를 한번 검사하는지 체크한다.
    expect.assertions(1);
    jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);

    try {
      await getGreet();
    } catch (err) {
      expect(err).toMatchObject(httpError);
    }
  });
});
```

## 웹 API에서 목 객체 생성 함수

```tsx
/**
 * 테스트할 함수
 *
 * article를 받아와 받아온 category 태그가 포함된 것들을 { title: '', link: '' } 의 배열로
 * 만들어주는 역할을 한다. 만약 없다면 null을 리턴한다.
 */
export async function getMyArticleLinksByCategory(category: string) {
  // 데이터 취득 함수(Web API 클라이언트)
  const data = await getMyArticles();
  // 취득한 데이터 중 지정한 태그를 포함한 기사만 골라낸다.
  const articles = data.articles.filter((article) =>
    article.tags.includes(category)
  );
  if (!articles.length) {
    // 해당되는 기사가 없으면 null을 반환한다.
    return null;
  }
  // 해당되는 기사가 있으면 목록용으로 가공해서 데이터를 반환한다.
  return articles.map((article) => ({
    title: article.title,
    link: `/articles/${article.id}`,
  }));
}
```

`getMyArticleLinksByCategory` 함수를 대체하고 함수를 대체하면 대신하여 응답할 데이터(fixture)를 만든다.

```tsx
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

```tsx
jest.mock("../fetchers");

// 매번 스텁을 만드는 것은 비효율적이기에 이를 도와주는 helper 함수를 하나 만든다.
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

// 태그에 따라 정상적으로 응답하는지 테스트한다.
test("지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("playwright");
  expect(data).toBeNull();
});

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

// 실패 케이스도 테스트 한다.
test("데이터 취득에 실패하면 reject된다", async () => {
  mockGetMyArticles(500);
  await getMyArticleLinksByCategory("testing").catch((err) => {
    expect(err).toMatchObject(httpError);
  });
});
```

**✋ 궁금한 점**

`"지정한 태그를 포함한 기사가 한 건 이상 있으면 링크 목록을 반환한다"` 테스트하는 곳에서 실제 응답과 같은지 비교할 떄 하드코딩을 하시나요?

실무에서도 유닛 테스트할 때 하드 코딩을 할지 함수를 만들어 두곳에서 사용할지 항상 고민인데요. 이 기준이 참 애매한 듯 해서 여러분들의 의견이 궁금합니다.

위의 케이스를 코드로 보여드리자면,

```tsx
export async function getMyArticleLinksByCategory(category: string) {
  // ...

  // 가공 함수 하나 만들기
  return articles.map((article) => generateCustomArticle(article));
}

export function generateCustomArticle(article: Article) {
  return {
    title: article.title,
    link: `/articles/${article.id}`,
  };
}

// 하드 코딩하지 않는 테스트 코드로 변경
// 이렇게 해도 당연히 테스트는 통과합니다.
test("지정한 태그를 포함한 기사가 한 건 이상 있으면 링크 목록을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("testing");
  expect(data).toMatchObject([
    generateCustomArticle(getMyArticlesData.articles[0]),
    generateCustomArticle(getMyArticlesData.articles[2]),
  ]);
});
```

물론 0, 1을 꺼내와서 하는거니 이것도 하드코딩 같기도 하고 과한 작업인 것 같기도..

## 목 함수를 사용하는 스파이

테스트 대상에 발생한 입출력을 기록하는 스파이를 구현하자

- `toBeCalled()`: 함수가 실행됐는지 검증
- `toHaveBeenCalledTimes()`: 함수의 실행 횟수를 검증
- `toHaveBeenCalledWith()`: 함수가 실행되었을 때 인자 검증

## 웹 API 목 객체의 세부사항

```
// 테스트할 함수
export class ValidationError extends Error { }

export function checkLength(value: string) {
  if (value.length === 0) {
    throw new ValidationError("한 글자 이상의 문자를 입력해주세요");
  }
}

export function postMyArticle(input: ArticleInput) {
  return fetch(host("/my/articles"), {
    method: "POST",
    body: JSON.stringify(input),
  }).then(handleResponse<Article>);
}
```

```tsx
// 여기서도 마찬가지로 스텁을 만들기엔 무리가 있으니 헬퍼함수를 만든다.
function mockPostMyArticle(input: ArticleInput, status = 200) {
  // 실패 케이스를 확인하기 위함
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }

  // 테스트에 필요한 부분
  try {
    checkLength(input.title);
    checkLength(input.body);
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockResolvedValue({ ...postMyArticleData, ...input });
  } catch (err) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
}

// input을 편하게 계속 만들기 위한 Helper 함수
function inputFactory(input?: Partial<ArticleInput>) {
  return {
    tags: ["testing"],
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
    ...input,
  };
}

test("유효성 검사에 성공하면 성공 응답을 반환한다", async () => {
  // 유효성 검사에 통과하는 입력을 준비한다.
  const input = inputFactory();
  // 입력값을 포함한 성공 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input);
  // input을 인수로 테스트할 함수를 실행한다.

  const data = await postMyArticle(input);
  // 취득한 데이터에 입력 내용이 포함됐는지 검증한다.
  expect(data).toMatchObject(expect.objectContaining(input));
  // 목 함수가 호출됐는지 검증한다.
  expect(mock).toHaveBeenCalled();
});

test("유효성 검사에 실패하면 reject된다", async () => {
  // 2번 검사하는지 체크
  expect.assertions(2);
  // 유효성 검사에 통과하지 못하는 입력을 준비한다.
  const input = inputFactory({ title: "", body: "" });
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

test("데이터 취득에 실패하면 reject된다", async () => {
  expect.assertions(2);
  // 유효성 검사에 통과하는 입력값을 준비한다.
  const input = inputFactory();
  // 실패 응답을 반환하는 목 객체를 만든다.
  const mock = mockPostMyArticle(input, 500);

  // reject됐는지 검증한다.
  await postMyArticle(input).catch((err) => {
    // 에러 객체가 reject됐는지 검증한다.
    expect(err).toMatchObject({ err: { message: expect.anything() } });
    // 목 함수가 호출됐는지 검증한다.
    expect(mock).toHaveBeenCalled();
  });
});
```

**✋ `mockResolvedValue` vs `mockResolvedValueOnce`**

헬퍼 함수를 만들 때 둘을 혼용하여 사용하고 있는데 둘의 차이점을 살펴보자

둘은 결국 목 모듈, 목 함수를 반환할 값을 지정하는 함수이다. 둘의 차이점은 실행횟수에 따라 달라진다.

```tsx
test("async test", async () => {
  const asyncMock = jest
    .fn()
    .mockResolvedValue("default")
    .mockResolvedValueOnce("first call")
    .mockResolvedValueOnce("second call");

  await asyncMock(); // 'first call'
  await asyncMock(); // 'second call'
  await asyncMock(); // 'default'
  await asyncMock(); // 'default'
});
```

두번째 콜 때까지는 정해진 값을 리턴하게 할 수 있고, 그 이후에는 ‘default’ 로 계속 반환값을 지정하게 된다.

### 현재 시각 고정하기

- [`jest.useFakeTimers(fakeTimersConfig?)`](https://jestjs.io/docs/jest-object#jestusefaketimersfaketimersconfig) : 가짜 타이머 사용
- [`jest.setSystemTime(now?: number | Date)`](https://jestjs.io/docs/jest-object#jestsetsystemtimenow-number--date) : 가짜 타이머에 현재 시각을 설정하는 함수
- [`jest.useRealTimers()`](https://jestjs.io/docs/jest-object#jestuserealtimers) : 실제 타이머를 사용

### 설정과 파기

테스트 마다 공통으로 설정/파기해야 할 경우가 있다. 일종의 라이프사이클을 유지 시키는 느낌이다.

```tsx
describe("설정 및 파기 타이밍", () => {
  beforeAll(() => console.log("1 - beforeAll"));
  afterAll(() => console.log("1 - afterAll"));
  beforeEach(() => console.log("1 - beforeEach"));
  afterEach(() => console.log("1 - afterEach"));

  test("", () => console.log("1 - test"));

  describe("Scoped / Nested block", () => {
    beforeAll(() => console.log("2 - beforeAll"));
    afterAll(() => console.log("2 - afterAll"));
    beforeEach(() => console.log("2 - beforeEach"));
    afterEach(() => console.log("2 - afterEach"));

    test("", () => console.log("2 - test"));
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
