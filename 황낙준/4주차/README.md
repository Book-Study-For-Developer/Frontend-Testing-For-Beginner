### 목 객체를 사용하는 이유

테스트 대상은 웹 API 가 아니라 취득한 데이터를 처리하는 것이다.
이때 취득한 데이터 대역으로 사용하는 것이 목 객체다.

### 목 객체 용어

xUnit 테스트 패턴이 정의한 용어이다.
스텁과 스파이로도 정의하지만 목객체는 이보다 더 큰 범위이다.

1. 스텁(stub)
   주로 대역으로 사용한다.

- 의존중인 컴포넌트
- 정해진 값을 반환하는 용도
- 테스트 대상에 할당하는 입력값

을 주로 대역한다.
웹 API에서 이런 값을 반환 받았을 때는 어떻게 작동해야한다.가 검증 목표이다.

2. 스파이(SPY)
   주로 기록하는 용도이다.

- 함수나 메서드의 호출기록
- 호출된 횟수나 실행시 사용한 인수 기록
- 테스트 대상의 출력확인

콜백함수 검증하는데 많이 쓰이고,인수 등을 기록하여 의도대로 콜백이 호출됐는지 검증할 수 있다.

3. jest
   jest는 jest.mock 혹은 jest.fn, jest.spyon라는 api를 사용한다.

### 목 모듈 활용한 스텁

단위 및 통합 테스트를 실시할 떄, 구현이 완성되어있지 않거나 수정이 필요한 모듈에 의존중인 경우, 사용한다.

1. 일반적으로 사용하는 경우

```ts
import { greet } from "./greet";

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});
```

2. jest.mock으로 undefined 리턴하기
   jest.mock을 사용하는 경우, 기존 구현과 다르게 undefined를 반환한다.
   테스트 모듈을 대체했기 때문이다.

```ts
import { greet } from "./greet";

jest.mock("./greet");

test("인사말을 반환하지 않는다(원래 구현과 다르게)", () => {
  expect(greet("Taro")).toBe(undefined);
});
```

3. jest.mock으로 에러 피하기
   이번에는 sayGoodBye라는 오류 리턴하는 함수를 사용해보자.
   실제로 사용하면, 에러가 발생한다.
   jest.mock(stub)을 사용하여 성공하는 테스트로 변경하였다.

```ts
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`
}));

test("인사말이 구현되어 있지 않다(원래 구현과 다르게)", () => {
  expect(greet).toBe(undefined);
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

4. jest.requireActual 사용해보기
   jest.requireActual를 사용하면, 원래 모듈 구현을 import 할 수 있다.

```ts
import { greet, sayGoodBye } from "./greet";

jest.mock("./greet", () => ({
  ...jest.requireActual("./greet"),
  sayGoodBye: (name: string) => `Good bye, ${name}.`
}));

test("인사말을 반환한다(원래 구현대로)", () => {
  expect(greet("Taro")).toBe("Hello! Taro.");
});

test("작별 인사를 반환한다(원래 구현과 다르게)", () => {
  const message = `${sayGoodBye("Taro")} See you.`;
  expect(message).toBe("Good bye, Taro. See you.");
});
```

5. 라이브러리 대체하기
   라이브러리들을 대체할 때 목 모듈을 가장 많이 사용한다.

jest.mock("next/router", ()=> require("next-router-mock"));
위 코드는 next/router 대신 next router mock을 사용한다.

### 웹 API 목 객체 기초

1. spyOn 사용하기

```ts
jest.spyon(테스트할 객체, 테스트할 함수 이름)
```

위와 같은 방법으로 사용한다.
만약 성공하거나 실패한 값을 지정하고 싶다면, `mockResolvedValueOnce`/`mockRejectedValueOnce`를 사용하여 리턴하자

```ts
if (status > 299) {
  return jest.spyOn(Fetchers, "getMyArticles").mockRejectedValueOnce(httpError);
}
return jest
  .spyOn(Fetchers, "getMyArticles")
  .mockResolvedValueOnce(getMyArticlesData);
```

### 목 함수를 사용하는 스파이

이번에는 제스트 목함수를 활용하여 스파이를 활용해보자

1. 실행됐는지 검증하기

```ts
test("목 함수가 실행됐다", () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toBeCalled();
});
```

2. 실행횟수 검증하기

```ts
test("목 함수는 실행 횟수를 기록한다", () => {
  const mockFn = jest.fn();
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(1);
  mockFn();
  expect(mockFn).toHaveBeenCalledTimes(2);
});
```

3. 목함수 실행시 인수 및 실행 여부 검증

```ts
test("목 함수는 실행 시 인수를 기록한다", () => {
  const mockFn = jest.fn();
  function greet(message: string) {
    mockFn(message); // 인수를 받아 실행된다.
  }
  greet("hello"); // "hello"를 인수로 실행된 것이 mockFn에 기록된다.
  expect(mockFn).toHaveBeenCalledWith("hello");
  expect(mockFn).toHaveBeenCalledTimes(1);
});
```

4. 실행 시 인수가 객체일 때 검증
   `toHaveBeenCalledWith`/`objectContaining` 매처를 사용하여 검증할 수 있다.

```ts
const config = {
  mock: true,
  feature: { spy: true }
};

export function checkConfig(callback?: (payload: object) => void) {
  callback?.(config);
}

test("목 함수는 실행 시 인수가 객체일 때에도 검증할 수 있다", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith({
    mock: true,
    feature: { spy: true }
  });
});

test("expect.objectContaining를 사용한 부분 검증", () => {
  const mockFn = jest.fn();
  checkConfig(mockFn);
  expect(mockFn).toHaveBeenCalledWith(
    expect.objectContaining({
      feature: { spy: true }
    })
  );
});
```

### 시각에 의존하는 테스트

테스트할 함수는 시간에 영향을 받는다.
이를 지정해줄 수 있다.

`jest.useFakeTimers`: 제스트에 가짜 타이머를 사용하도록 지시하는 함수
`jest.setSystemTime`: 가짜 타이머에서 사용할 현재 시각을 설정하는 함수
`jest.useRealTimers`: 제스트에 실제 타이머를 사용하도록 지시하는 원상 복귀 함수

```ts
export function greetByTime() {
  const hour = new Date().getHours();
  if (hour < 12) {
    return "좋은 아침입니다";
  } else if (hour < 18) {
    return "식사는 하셨나요";
  }
  return "좋은 밤 되세요";
}

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
