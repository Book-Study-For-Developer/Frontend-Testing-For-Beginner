# 4. 목 객체

## 4.1 목 객체용어

- 스텁(stub)
    - 외부 시스템(API 호출, DB 접근 등)에 의존하는 코드를 테스트할 때 사용됨
    - 외부 시스템을 호출하지않고 미리 정해놓은 값을 반환하여 테스트를 진행함.
- 스파이(spy)
    - 테스트 중 호출된 함수를 추적/기록하는 객체
    - 몇 번 호출되었는지, 어떤 파라미터로 호출되었는지 기록함

## 4.2 목 모듈을 활용한 스텁

 단위 테스트나 통합 테스트 시, 미구현되었거나 수정이 필요한 모듈에 의존하는 경우, 목 모듈을 사용해 스텁을 만들어 테스트를 진행할 수 있음.

- 테스트 함수

```jsx
//함수
export function greet(name: string) {
  return `Hello! ${name}.`;
}

//미구현 함수
export function sayGoodBye(name: string) {
  throw new Error("미구현");
}
```

- 모듈을 스텁으로 대체하기

```jsx
import { greet, sayGoodBye } from "./greet";

// jest.mock함수를 호출하면 특정 모듈을 대체하게 된다.
// 기존과 다르게 greet 함수는 미구현, sayGoodBye 함수는 구현된 것으로 대체
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

- 모듈 일부를 스텁으로 대체하기
    - [jest.requireActual(**moduleName**)](https://jestjs.io/docs/jest-object#jestrequireactualmodulename) 를 사용하면 원래 모듈을 import함

```jsx
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"),
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});

```

- 라이브러리 대체하기

```jsx
jest.mock('next/router', () => required('next-router-mock'));
```

# 4.3 웹 API 목 객체 기초

목 객체를 사용해 실제 서버의 응답 여부와 상관없이, 응답 전후의 관련 코드를 검증할 수 있다.

- 테스트 함수

```jsx
export type Profile = {
  id: string;
  name?: string;
  age?: number;
  email: string;
};

export function getMyProfile(): Promise<Profile> {
  return fetch("https://myapi.testing.com/my/profile").then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw data;
    }
    return data;
  });
}

export async function getGreet() {
  const data = await getMyProfile();
  if (!data.name) {
    return `Hello, anonymous user!`;
  }
  return `Hello, ${data.name}!`;
}
```

- 웹 API 클라이언트 스텁 구현
    - 데이터 취득 성공 테스트
        - `spyOn**(object, methodName)**`: 객체의 특정 메서드를 추적하는 메서드
        - `mockResolvedValueOnce`: resolve 응답으로 기대하는 값 지정
        
        ```jsx
        import * as Fetchers from "../fetchers";
        
        jest.mock("../fetchers");
        
        test("데이터 취득 성공 시: 사용자 이름이 있는 경우", async () => {
          jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
            id: "xxxxxxx-123456",
            email: "taroyamada@myapi.testing.com",
            name: "taroyamada",
          });
          await expect(getGreet()).resolves.toBe("Hello, taroyamada!");
        });
        ```
        
    - 데이터 취득 실패 테스트
        - `mockRejectedValueOnce`: reject 응답으로 기대하는 값 지정
        
        ```jsx
        import type { HttpError } from "./type";
        
        export const httpError: HttpError = {
          err: { message: "internal server error" },
        };
        
        test("데이터 취득 실패 시", async () => {
          // getMyProfile이 reject됐을 때의 값을 재현
          jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
          await expect(getGreet()).rejects.toMatchObject({
            err: { message: "internal server error" },
          });
        });
        
        test("데이터 취득 실패 시 에러가 발생한 데이터와 함께 예외가 throw된다", async () => {
          expect.assertions(1);
          jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
          try {
            await getGreet();
          } catch (err) {
            expect(err).toMatchObject(httpError);
          }
        });
        ```
        

# 4.4 웹 API 목 객체 생성 함수

 이번엔 고정된 값을 반환하는게 아니라 목 객체 생성함수를 사용하여 테스트를 진행한다.

- 테스트 함수

```jsx
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

- 응답을 교체하는 목 객체 생성 함수

```jsx
//픽스처(fixture): 응답을 재현하기 위한 테스트용 데이터
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

//목 객체 생성함수
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

- 데이터 취득 성공 테스트

```jsx
test("지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다", async () => {
  mockGetMyArticles();
  const data = await getMyArticleLinksByCategory("playwright");
  expect(data).toBeNull();
});
```

- 데이터 취득 실패 테스트

```jsx
test("데이터 취득에 실패하면 reject된다", async () => {
  mockGetMyArticles(500);
  await getMyArticleLinksByCategory("testing").catch((err) => {
    expect(err).toMatchObject({
      err: { message: "internal server error" },
    });
  });
});
```

# 4.5 목 함수를 사용하는 스파이

제스트의 목 함수를 사용하여 테스트 대상의 입출력을 기록하는 스파이를 구현한다.

- 실행됐는지 검증하기
    - toBeCalled: 목함수가 호출되었는지 검증하는 함수
        
        ```jsx
        test("목 함수가 실행됐다", () => {
          const mockFn = jest.fn();
          mockFn();
          expect(mockFn).toBeCalled();
        });
        
        test("목 함수가 실행되지 않았다", () => {
          const mockFn = jest.fn();
          expect(mockFn).not.toBeCalled();
        });
        ```
        
- 실행 횟수 검증
    - toHaveBeenCalledTimes(number): 목 함수가 몇번 실행되었는지 검증하는 함수
    
    ```jsx
     test("목 함수는 실행 횟수를 기록한다", () => {
      const mockFn = jest.fn();
      mockFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
      mockFn();
      expect(mockFn).toHaveBeenCalledTimes(2);
    });
    ```
    
- 실행 시 인수 검증
    - toHaveBeenCalledWith(arg1,arg2…): 특정 인수로 호출되었는지 검증하는 함수
        
        ```jsx
        test("목 함수는 실행 시 인수를 기록한다", () => {
          const mockFn = jest.fn();
          function greet(message: string) {
            mockFn(message); // 인수를 받아 실행된다.
          }
          greet("hello"); // "hello"를 인수로 실행된 것이 mockFn에 기록된다.
          expect(mockFn).toHaveBeenCalledWith("hello");
        });
        
        ```
        
- 스파이로 활용하는 방법(테스트 대상의 인수가 콜백함수인 경우, 호출 추적하기)
    
    ```jsx
    test("목 함수를 테스트 대상의 인수로 사용할 수 있다", () => {
      const mockFn = jest.fn();
      function greet(name: string, callback?: (message: string) => void) {
       callback?.(`Hello! ${name}`);
      }
      greet("Jiro", mockFn);
      expect(mockFn).toHaveBeenCalledWith("Hello! Jiro");
    });
    ```
    

- 실행 시 인수가 객체일 때 검증
    
    ```jsx
    const config = {
      mock: true,
      feature: { spy: true },
    };
    
    function checkConfig(callback?: (payload: object) => void) {
      callback?.(config);
    }
    
    //객체 전체 검증
    test("목 함수는 실행 시 인수가 객체일 때에도 검증할 수 있다", () => {
      const mockFn = jest.fn();
      checkConfig(mockFn);
      expect(mockFn).toHaveBeenCalledWith({
        mock: true,
        feature: { spy: true },
      });
    });
    
    //객체의 일부만 검증
    test("expect.objectContaining를 사용한 부분 검증", () => {
      const mockFn = jest.fn();
      checkConfig(mockFn);
      expect(mockFn).toHaveBeenCalledWith(
        expect.objectContaining({
          feature: { spy: true },
        })
      );
    });
    ```
    

# 4.6 웹 API 목 객체의 세부 사항

입력값을 검증한 후, 목 객체를 활용해 응답을 교체한다.

- 테스트 함수

```jsx
export class ValidationError extends Error { }

export function checkLength(value: string) {
  if (value.length === 0) {
    throw new ValidationError("한 글자 이상의 문자를 입력해주세요");
  }
}

```

- 목 객체 생성함수

```jsx
function mockPostMyArticle(input: ArticleInput, status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
  try {
    //입력 값 유효성 검사 실시
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
```

- 입력 값을 동적으로 생성하는 팩토리 함수

```jsx
function inputFactory(input?: Partial<ArticleInput>) {
  return {
    tags: ["testing"],
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
    ...input,
  };
}
```

- 유효성 검사 성공 테스트

```jsx

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
```

- 유효성 검사 실패테스트

```jsx
test("유효성 검사에 실패하면 reject된다", async () => {
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
```

- 데이터 취득 실패테스트
    - 유효성 검사는 통과하지만 데이터 취득에 실패했는지 확인

```jsx
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

# 4.7 현재 시각에 의존하는 테스트

 현재 시각에 의존하는 로직은 테스트 결과가 실행 시간에 영향을 미친다. 시각을 고정하면 언제 실행하더라도 일관된 결과를 얻을 수 있다

- 테스트 함수

```jsx
export function greetByTime() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "좋은 아침입니다";
  } else if (hour < 18) {
    return "식사는 하셨나요";
  }
  return "좋은 밤 되세요";
}

```

- 현재 시각 고정하기
    - `jest.useFakeTimers` : 가짜 타이머를 사용하도록 설정하는 함수
    - `jest.setSystemTime` : 가짜 타이머에 특정 시각을 현재 시각으로 설정하는 함수
    - `jest.useRealTimers` : 실제 타이머를 사용하도록 원상복귀하는 함수
    - `beforeEach`: 각 테스트가 실행되기 전 매번 실행
    - `beforeAll` : 해당 블록 내 모든 테스트가 실행되기 전 한 번만 호출
    - `afterEach`: 각 테스트가 실행된 후 매번 실행
    - `beforeAll` : 해당 블록 내 모든 테스트가 실행된 후 한 번만 호출

```jsx
describe("greetByTime(", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("아침에는 '좋은 아침입니다'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 8, 0, 0));
    expect(greetByTime()).toBe("좋은 아침입니다");
  });

  test("점심에는 '식사는 하셨나요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 14, 0, 0));
    expect(greetByTime()).toBe("식사는 하셨나요");
  });

  test("저녁에는 '좋은 밤 되세요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 21, 0, 0));
    expect(greetByTime()).toBe("좋은 밤 되세요");
  });
});

```

- 실행 순서

```jsx
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
});

// 전역 블록 (1번)
// 1 - beforeAll
// 1 - beforeEach
// 1 - test 🧪
// 1 - afterEach

// 스코프 안의 블록 (2번)
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test 🧪
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll

전역 beforeAll 
   ↓
전역 beforeEach
   ↓
내부 beforeAll 
   ↓
내부 beforeEach
   ↓
테스트 실행
   ↓
내부 afterEach
   ↓
전역 afterEach
   ↓
내부 afterAll
   ↓
전역 afterAll
```