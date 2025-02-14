# 목 객체

## 목 객체를 사용하는 이유

- 태스트 대상이 외부 시스템이나 객체에 의존하지 않고 독립적으로 테스트될 수 있다.
- 예상치 못한 외부 요인으로부터 테스트를 보호하고, 테스트의 예측 가능성을 높일 수 있다.
- 테스트 실행 속도를 향상시키고, 테스트 환경의 구성을 단순화하는데 도움이 된다.
- 상황에 따라 `stub`(대역)이나 `spy`(기록용)를 사용한다.

> 참고: https://jestjs.io/docs/jest-object

## 목 모듈을 활용한 스텁

모듈 전체 혹은 일부를 스텁으로 대체할 수 있다.

### 모듈 전체를 스텁으로 대체하기

```ts
// greet 모듈 전체를 스텁으로 대체하기

import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  // greet 함수가 존재하지 않음
  sayGoodBye: (name: string) => `Good bye, ${name}.`, // sayGoodBye 함수 대체
}));

test("인사말이 구현되어 있지 않다(원래 구현과 다르게)", () => {
  expect(greet).toBe(undefined);
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

### 모듈 일부를 스텁으로 대체하기

```ts
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"), // 실제 모듈의 구현을 가져옴
  sayGoodBye: (name: string) => `Good bye, ${name}.`, // sayGoodBye 함수만 대체됨
}));

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

> **Key Point**: 실무에서는 라이브러리를 대체할 때 목 모듈을 가장 많이 사용한다.
>
> ```ts
> jest.mock("next/router", () => require("next-router-mock"));
> ```

## 목 함수를 사용하는 스파이

- Jest에서 "목 함수 = 스파이"이다.
- 스파이는 태스트 대상에 발생한 입출력을 기록하는 객체이다. (인수, 호출 횟수 기록)
- 스파이에 기록된 값을 검증하면 의도한 대로 기능이 작동하는지 확인할 수 있다.

### 실행 여부 검증

```ts
test("목 함수가 실행됐다", () => {
  const mockFn = jest.fn(); // 목 함수 생성
  mockFn();
  expect(mockFn).toBeCalled();
});

test("목 함수가 실행되지 않았다", () => {
  const mockFn = jest.fn();
  expect(mockFn).not.toBeCalled();
});
```

### 실행 횟수 검증

```ts
test("목 함수는 실행 횟수를 기록한다", () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(2);
});
```

### 실행 시 인수 검증

```ts
test("목 함수는 실행 시 인수를 기록한다", () => {
  const mockFn = jest.fn();
  function greet(message: string) {
    mockFn(message); // 인수를 받아 실행된다.
  }
  greet("hello"); // "hello"를 인수로 실행된 것이 mockFn에 기록된다.
  expect(mockFn).toHaveBeenCalledWith("hello");
});

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
      feature: { spy: true },
    })
  );
});
```

> **Key Point**: 목 함수를 사용하는 스파이는 테스트 대상의 인수에 함수가 있을 때 유용하게 활용할 수 있다.
>
> ```ts
> test("목 함수를 테스트 대상의 인수로 사용할 수 있다", () => {
>   const mockFn = jest.fn();
>   greet("Jiro", mockFn);
>   expect(mockFn).toHaveBeenCalledWith("Hello! Jiro");
> });
> ```

## 웹 API 목 객체

웹 API를 재현할 때 다음과 같은 메서드들을 주로 사용한다.

- `jest.spyOn(object, methodName)`: 목 함수를 생성하고, `object[methodName]` 호출을 추적한다. 반환값은 [Jest Mock Function](https://jestjs.io/docs/mock-function-api)이다.
- `mockFn.mockResolvedValueOnce(value)`: 목 함수에 `value`를 resolve하는 Promise를 반환하는 구현체를 주입한다.
- `mockFn.mockRejectedValueOnce(value)`: 목 함수에 `value`와 함께 reject하는 Promise를 반환하는 구현체를 주입힌다.

**예시**

```ts
jest.mock("../fetchers");

function mockPostMyArticle(input: ArticleInput, status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
  try {
    // 입력값 검증 후 응답 데이터를 교체한다.
    checkLength(input.title);
    checkLength(input.body);
    return jest.spyOn(Fetchers, "postMyArticle").mockResolvedValue(input);
  } catch (err) {
    return jest
      .spyOn(Fetchers, "postMyArticle")
      .mockRejectedValueOnce(httpError);
  }
}

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

> 만약 팀에서 Mock server를 사용하면 있다면 일일이 API 호출 함수를 모킹하는 것보다 목 서버를 사용하는 게 효율적일 것 같다.

## 현재 시각에 의존하는 테스트

- 테스트가 현재 시각에 의존하면 테스트를 언제 실행하냐에 따라 테스트가 실패 혹은 성공할 수 있어 일관성을 보장하기 어렵다.
- 테스트 실행 환경의 현재 시각을 고정하면 언제 실행되더라도 동일한 테스트 결과를 얻을 수 있다.
- `jest.useFakeTimers`: 가짜 타이머 사용
- `jest.setSystemTime`: 가짜 타이머에서 사용할 현재 시각 설정
- `jest.useRealTimers`: 실제 타이머 사용하도록 지시

```ts
describe("greetByTime 함수", () => {
  // 테스트 실행하기 전에 수행해야 할 공통 설정 작업 지정
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // 각 테스트 종료 후에 수행해야 할 공통 파기 작업 지정
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
