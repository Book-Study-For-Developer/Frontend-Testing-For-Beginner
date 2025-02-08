### Mock 객체를 사용하는 이유

테스트는 실제 실행 환경과 유사할수록 재현성이 높다. 하지만 재현성을 높이다보면 실행 시간이 오래 걸리거나 환경 구축이 어려워지는 경우가 있다.

지금 테스트하는 대상은 웹 API 자체가 아니라 취득한 데이터에 대한 처리라는 것을 명심하자.

웹 API 서버가 테스트 환경에 반드시 필요한 것은 아니다. 이 때 취득한 데이터 대역으로 사용하는 것이 `Mock 객체(테스트 더블, Test Double)` 이다.

### Mock 객체 용어

`스텁`, `스파이` 등은 Mock 객체를 상황에 따라 세분화한 객체의 명칭이다.

이러한 용어는 개발 언어에 상관없이 테스트 자동화 관련 문헌에서 정의한 용어이다.

### 스텁

테스트 중에 실제 객체 대신 사용되는 대역으로 미리 준비된 결과 값을 반환하도록 만들어진 객체이다.

- 테스트에 필요한 최소한의 기능만 구현
- 미리 정의된 응답만 반환
- 상태 검증에 중점

```jsx
// 계산기 스텁
const calculatorStub = {
  add: (a, b) => 5, // 항상 5를 반환하도록 고정
};

test("계산기 스텁 테스트", () => {
  const result = calculatorStub.add(2, 3);
  expect(result).toBe(5);
});
```

### 스파이

실제 객체의 메서드 호출을 감시하고 추적하는 역할을 한다. 실제 구현은 그대로 두면서 메서드 호출 정보를 기록한다.

- 메서드 호출 횟수 추적 가능
- 호출 시 전달된 인자 확인 가능
- 실제 메서드 동작은 유지

```jsx
test("스파이 테스트", () => {
  const calculator = {
    add: (a, b) => a + b,
  };

  const spyFn = jest.spyOn(calculator, "add");

  const result = calculator.add(2, 3);

  expect(spyFn).toBeCalledTimes(1); // 호출 횟수 확인
  expect(spyFn).toBeCalledWith(2, 3); // 전달된 인자 확인
  expect(result).toBe(5); // 실제 결과값 확인
});
```

> [!NOTE]
>
> Jest의 API는 `xUnit 테스트 패턴` 의 용어 정의를 충실하게 따르지 않는다.
>
> 이 책에서는 앞서 설명한 `스텁` , `스파이` 로서 사용하는 명확한 이유가 있을 때는 `스텁` , `스파이` 라고 구분하고 여러가지 이유로 사용될 때는 `Mock 객체` 라고 한다.

### 라이브러리 대체하기

```jsx
jest.mock("next/router", () => require("next-router-mock"));
```

위 코드는 `next/router` 라는 의존 모듈 대신 `next-router-mock` 이라는 라이브러리를 적용한다.

```jsx
jest.mock("./greet", () => import("./test"));
```

이렇게 `dynamic import`하면 정상적으로 모킹이 되지 않는다.

그 이유는 `require` 는 동기적으로 즉시 실행되는데, `dynamic import` 는 Promise를 반환하는 비동기 작업이기 때문이다.

`jest.mock` 은 모듈이 로드되기 전에 실행되어야 하지만 `dynamic import` 는 모듈을 나중에 가져오기 때문에 정상적으로 모킹이 되지 않는다.(`jest.mock` 은 호이스팅되어 실행된다.)

### 설정과 파기

테스트를 실행하기 전에 공통으로 설정해야 할 작업이 있거나 테스트 종료 후에 공통으로 파기 하고 싶은 작업이 있는 경우에 사용된다.

- 설정 작업: `beforeAll` , `beforeEach`
- 파기 작업: `afterAll` , `afterEach`

```jsx
describe("설정 및 파기 타이밍", () => {
  // 외부 블록
  beforeAll(() => console.log("1 - beforeAll")); // 테스트 시작 전

  beforeEach(() => console.log("1 - beforeEach")); // 테스트 케이스 전
  test("", () => console.log("1 - test")); // 테스트
  afterEach(() => console.log("1 - afterEach")); // 테스트 케이스 후

  describe("Scoped / Nested block", () => {
    // 내부 블록
    beforeAll(() => console.log("2 - beforeAll")); // 테스트 시작 전

    beforeEach(() => console.log("2 - beforeEach")); // 테스트 케이스 전(외부 -> 내부)
    test("", () => console.log("2 - test")); // 테스트
    afterEach(() => console.log("2 - afterEach")); // 테스트 케이스 후(내부 -> 외부)

    afterAll(() => console.log("2 - afterAll")); // 테스트 종료 후
  });

  afterAll(() => console.log("1 - afterAll")); // 테스트 종료 후
});
```

1. 시작 단계
   - `1 - beforeAll` : 가장 먼저 외부 블록의 모든 테스트 전에 한 번 실행
2. 첫 번째 테스트
   - `1 - beforeEach` : 첫 번째 테스트 직전
   - `1 - test` : 첫 번째 테스트
   - `1 - afterEach` : 첫 번째 테스트 직후
3. 내부 블록 시작
   - `2 - beforeAll` : 내부 블록의 테스트 시작 전
4. 두 번째 테스트
   - `1 - beforeEach` : 외부 블록의 `beforeEach` 가 먼저 실행
   - `2 - beforeEach` : 내부 블록의 `beforeEach` 가 다음 실행
   - `2 - test` : 내부 블록의 테스트
   - `2 - afterEach` : 내부 블록의 `afterEach` 가 먼저 실행
   - `1 - afterEach` : 외부 블록의 `afterEach` 가 다음 실행
5. 정리 단계
   - `2 - afterAll` : 내부 블록의 모든 테스트 완료 후
   - `1 - afterAll` : 마지막으로 외부 블록의 모든 테스트 완료 후

> [!IMPORTANT]
>
> `beforeAll` , `afterAll` : 해당 `describe` 블록 내의 모든 테스트가 실행되기 전/후에 한 번만 실행
>
> `beforeEach` , `afterEach`: 각 테스트 케이스 전/후 마다 실행
>
> 중첩된 `describe` 블록에서는 외부 → 내부 순으로 실행되고,
>
> `afterEach` 는 내부 → 외부 순으로 실행된다.

> 어우 알아야 할 메서드가 생각보다 많군요.. 많이 써봐야 익숙해지겠네요…
