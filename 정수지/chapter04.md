# 목 객체

## 목 객체를 사용하는 이유

- 실제 실행 환경과 유사하게 만들기 위해 시간이 너무 많이 걸리거나 환경 구축이 어려워짐 (ex. 웹 API에서 취득한 데이터를 다뤄야 하는 경우)
  - 특히, 네트워크 성공 실패도 테스트가 필요한데 성공의 경우는 API 서버를 연동할 수 있다면 테스트가 가능하지만, 실패하는 경우의 테스트를 위해 실제 API 서버에 테스트용 코드를 추가하는 것은 옳지 않음
- 테스트하는 대상은 웹 API 자체가 아니라 취득한 데이터에 대한 처리이기 때문에 취득한 데이터 대역으로 목 객체(테스트 더블)을 사용한다.

<br/>

### 목 객체 용어

- 스텁, 스파이 : 목 객체를 상황에 따라 세분화한 객체의 명칭
- 스텁을 사용하는 이유 : 주로 대역으로 사용
  - 의존 중인 컴포넌트의 대역 (ex. 웹 API에 의존 중인 대상을 테스트하는 경우)
  - 정해진 값을 반환하는 용도
  - 테스트 대상에 할당하는 입력값
- 스파이를 사용하는 이유 : 기록하는 용도로 사용
  - 함수나 메서드의 호출 기록
  - 호출된 횟수나 실행 시 사용한 인수 기록
  - 테스트 대상의 출력 확인
- Jest는 용어 정의를 충실하게 따르지 않음. Jest는 스텁, 스파이를 구현할 때 목 모듈(jest.mock) 혹은 목 함수(jest.fn, jest.spyOn)라는 API를 사용함.
  _+. 즉, Jest에서는 스텁과 스파이를 구분하는 것이 아니라 둘다 목이라는 범주에 포함되어서 다루어짐_

<br/>

## 목 모듈을 활용한 스텁

- 실무에서는 라이브러리를 대체할 때 목 모듈을 가장 많이 사용함
- 목 모듈로 의존 중인 모듈의 스텁을 만드는 방법 (ex. 단위 테스트나 통합 테스트를 실시할 때 구현이 완성되어 있지 않거나 수정이 필요한 모듈에 의존중인 경우)
- 테스트 이전에 `jest.mock()`을 호출해서 테스트할 모듈을 대체함. 두번째 인수에는 대체할 함수를 구현할 수 있음

  ```javascript
  import { greet, sayGoodBye } from "./greet";

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

- `jest.requireActual` 함수를 사용하면 원래 모듈의 구현을 import 할 수 있다.
  ```javascript
  jest.mock("./greet", () => ({
    ...jest.requireActual("./greet"),
    sayGoodBye: (name: string) => `Good bye, ${name}.`,
  }));
  ```
- 라이브러리 대체하기
  ```javascript
  jest.mock("next/router", () => require("next-router-mock"));
  ```

<br/>

## 웹 API 목 객체 기초

- 웹 API 관련 코드를 웹 API 클라이언트의 대역인 스텁으로 대체하여 테스트를 작성함
- `jest.spyOn(테스트할 객체, 테스트할 함수 이름)`을 사용
- 데이터 취득 성공을 재현한 테스트
  - `mockResolvedValueOnce(성공했을 때 응답으로 기대하는 객체)`에 데이터 취득이 성공했을 때 응답으로 기대하는 객체를 지정
    ```javascript
    test("데이터 취득 성공 시 : 사용자 이름이 없는 경우", async () => {
      jest.spyOn(Fetchers, "getMyProfile").mockResolvedValueOnce({
        id: "xxxxxxx-123456",
        email: "taroyamada@myapi.testing.com",
      });
      await expect(getGreet()).resolves.toBe("Hello, anonymous user!");
    });
    ```
- 데이터 취득 실패를 재현한 테스트
  - `mockRejectedValueOnce(실패했을 때 응답으로 기대하는 객체)`
    ```javascript
    test("데이터 취득 실패 시", async () => {
      jest.spyOn(Fetchers, "getMyProfile").mockRejectedValueOnce(httpError);
      await expect(getGreet()).rejects.toMatchObject({
        err: { message: "internal server error" },
      });
    });
    ```
    ```javascript
    // 예외 발생 검증
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

<br/>

## 웹 API 목 객체 생성 함수

- 응답 데이터를 대체하는 목 객체 생성 함수의 사용 방법

  - 픽스쳐(fixture, 응답을 재현할 테스트용 데이터) 만들기
  - 목 객체 생성 함수(테스트에 필요한 설정을 최대한 적은 매개변수로 교체할 수 있게 만드는 유틸리티 함수) 사용
    ```javascript
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
  - 데이터 취득 성공을 재현한 테스트
    ```javascript
    test("지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다", async () => {
      mockGetMyArticles();
      const data = await getMyArticleLinksByCategory("playwright");
      expect(data).toBeNull();
    });
    ```
    ```javascript
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
  - 데이터 취득 실패를 재현한 테스트

    ```javascript
    test("데이터 취득에 실패하면 reject된다", async () => {
      mockGetMyArticles(500);
      await getMyArticleLinksByCategory("testing").catch((err) => {
        expect(err).toMatchObject({
          err: { message: "internal server error" },
        });
      });
    });
    ```

<br/>

## 목 함수를 사용하는 스파이

- `jest.fn`을 사용해서 목 함수를 작성, `toBeCalled` 매처를 사용해 실행 여부를 검증할 수 있음

  ```javascript
  test("목 함수가 실행됐다", () => {
    const mockFn = jest.fn();
    mockFn();
    expect(mockFn).toBeCalled();
  });
  ```

- 실행 횟수 검증 : `toHaveBeenCalledTimes` 매처를 사용해 함수가 몇 번 호출됐는지 검증
- 실행 시 인수 검증 : `toHaveBeenCalledWith` 매처를 사용해 인수로 실행된 것이 기록
  _+. `mockFn.mock.calls`를 통해 기록을 확인할 수 있음_

  - 목 함수를 사용해서 테스트 대상의 인수에 함수가 있을 때 유용하게 활용 가능
  - 인수가 원시형이 아니라 배열이나 객체일 때도 검증 가능
  - 객체가 너무 크면 `expect.objectContaining` 보조 함수를 사용하면 객체의 일부만 검증 가능

<br/>

## 웹 API 목 객체의 세부 사항

- 입력값을 검증한 후 응답 데이터를 교체하는 목 객체의 구현 방법

- 팩토리 함수 : 입력으로 보낼 값을 동적으로 생성할 수 있는 함수

  ```javascript
  function inputFactory(input?: Partial<ArticleInput>) {
    return {
      tags: ["testing"],
      title: "타입스크립트를 사용한 테스트 작성법",
      body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
      ...input,
    };
  }
  ```

```javascript
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

<br/>

## 현재 시각에 의존하는 테스트

- 아침, 점심, 저녁마다 다른 인사말을 반환하는 함수 생성
- 현재 시각 고정하기
  - `jest.useFakeTimers` : 가짜 타이머를 사용하도록 지시
  - `jest.setSystemTime` : 가짜 타이머에서 사용할 현재 시각 설정
  - `jest.useRealTimers` : 실제 타이머를 사용하도록 지시 (원상복구)

### 설정과 파기

- `beforeAll`, `beforeEach` : 테스트 실행 전 공통으로 설정해아 할 작업 설정
- `afterAll`, `afterEach` : 테스트 종료 후 공통으로 파기하고 싶은 작업
- 실행되는 순서는 beforeAll -> beforeEach -> test -> afterEach -> afterAll
  - beforeAll → 모든 테스트 실행 전에 한 번만 실행
  - beforeEach → 각 테스트 실행 전에 매번 실행
  - afterEach → 각 테스트 실행 후에 매번 실행
  - afterAll → 모든 테스트 종료 후 한 번만 실행

<br/>

---

### TODO

- [ ] ESM(ES MODULE), CJS(Common JS)
