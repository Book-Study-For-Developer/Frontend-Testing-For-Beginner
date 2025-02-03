### Jest

Mock 객체와 코드 커버리지 수집 기능까지 갖춘 메타의 오픈 소스이다.

> 메타쪽 레포에 없길래 찾아보니깐 OpenJS Foundation 으로 소유권 이전을 했다고 한다😮

### test

```jsx
test(테스트 명, 테스트 함수)
```

- 첫 번째 인수: 테스트 내용을 잘 나타내는 제목을 짓는다.
  - 테스트 코드가 어떤 의도로 작성됐으며, 어떤 작업이 포함되었는지 테스트 명으로 명확하게 표현해야 한다.
- 두 번째 인수: 검증 값이 기대 값과 일치하는지 검증하는 단언문을 작성한다.
  - 단언문은 `expect` 함수와 매처(Matcher)로 구성되어 있다.
  - 단언문: `expect(검증값).toBe(기대값)`
  - 매처: `toBe(기대값)`

### 테스트 그룹화

연관성 있는 테스트들을 그룹화하고 싶을 때는 `describe` 함수를 사용한다.

`test` 함수와 유사하게 `describe(그룹명, 그룹함수)` 형식으로 두 개의 매개변수로 구성된다.

```jsx
describe("add", () => {
  test("1 + 1은 2", () => {
    expect(add(1, 1)).toBe(2);
  });

  test("1 + 2는 3", () => {
    expect(add(1, 2)).toBe(3);
  });
});
```

- `test` 는 중첩이 불가능하지만 `describe` 은 중첩이 가능하다.

### 예외 발생시키기

매개변수 `a` , `b` 는 `0에서 100까지 숫자만 받을 수 있다는 조건`을 추가하면 타입스크립트만으로 커버하기 어렵기 때문에 함수 내부에서 분기처리를 통해 예외를 발생시키면 구현 중에 발생하는 문제를 빠르게 발견할 수 있다.

```jsx
const add = (a: number, b: number) => {
  if (a < 0 || a > 100) throw new Error("0 ~ 100 사이의 값을 입력해 주세요.");
  if (b < 0 || b > 100) throw new Error("0 ~ 100 사이의 값을 입력해 주세요.");
  return a + b;
};
```

### 예외 발생 검증 테스트

```jsx
expect(예외가 발생하는 함수).toThrow(에러 세부 사항 검증);
// 에러 세부 사항 검증은 옵셔널이다.
// 정규 표현식, 문자열, 에러 객체, 에러 클래스 등 테스트가 가능하다.
```

예외가 발생하는 함수는 화살표 함수로 감싸서 작성한 함수다.

화살표 함수를 사용하면 함수에서 예외가 발생하는지 검증할 수 있다.

```jsx
// ⛔️ 잘못된 작성법
expect(add(-10, 100)).toThrow("0 ~ 100 사이의 값을 입력해 주세요.");

// ✅ 올바른 작성법
expect(add(-10, 100)).toThrow("0 ~ 100 사이의 값을 입력해 주세요.");
```

### Matchers

| Method                 | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| toBe                   | 원시 값의 정확한 일치를 테스트                                 |
| toEqual                | 객체나 배열의 모든 속성을 재귀적으로 비교                      |
| not                    | Matcher의 결과를 반대로 테스트                                 |
| toBeNull               | null 값인지 테스트                                             |
| toBeUndefined          | 값이 정의되어 있는지 테스트                                    |
| toBoTruthy             | true로 평가되는 값인지 테스트                                  |
| toBoFalsy              | false로 평가되는 값인지 테스트                                 |
| toBeGreaterThan        | 주어진 값보다 큰지 테스트                                      |
| toBeGreaterThanOrEqual | 주어진 값보다 크거나 같은지 테스트                             |
| toBeLessThan           | 주어진 값보다 작은지 테스트                                    |
| toBeLessThanOrEqual    | 주어진 값보다 작거나 같은지 테스트                             |
| toBeCloseTo            | 부동 소수점 숫자를 비교할 때 사용                              |
| toMatch                | 문자열이 정규 표현식과 일치하는지 테스트                       |
| toContain              | 배열이나 순회 가능한 객체에 특정 항목이 포함되어 있는지 테스트 |
| toThrow                | 함수가 예외를 던지는지 테스트                                  |
| toHaveProperty         | 객체가 특정 속성을 가지고 있는지 테스트                        |
| toHaveBeenCalled       | 모의 함수가 호출되었는지 테스트                                |
| toHaveBeenCalledWith   | 모의 함수가 특정 인수로 호출되었는지 테스트                    |

이외에도 <a href="https://jestjs.io/docs/using-matchers">더 많은 Matcher</a>가 존재한다.

### 비동기 처리 테스트

1. `then` 에 전달될 함수에 단언문을 작성하는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  return wait(50).then((duration) => {
    expect(duration).toBe(50);
  });
});
```

해당 인스턴스를 테스트 함수의 반환 값으로 `return`하면 `Promise`가 처리 중인 작업이 완료될 때까지 테스트 판정을 유예한다.

2. `resloves` 매처에 사용하는 단언문을 `return` 하는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  return expect(wait(50)).resolves.toBe(50);
});
```

`wait` 함수가 `reslove` 됐을 때의 값을 검증한다.

3. 테스트를 함수를 `async` 함수로 만들고 함수 내에서 `Promise`가 완료될 때까지 기다리는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  await expect(wait(50)).resolves.toBe(50);
});
```

테스트 함수를 `async` 함수로 만들고 함수 내에서 `Promise` 가 완료될 때까지 기다리는 방법이다.

4. 검증 값인 `Promise` 가 완료되는 것을 기다린 뒤 단언문을 실행하는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  expect(await wait(50)).toBe(50);
});
```

`async/await` 함수를 사용하면 비동기 처리가 포함된 단언문이 여러 개일 때 한 개의 테스트 함수 내에서 정리할 수 있는 장점도 있다.

> 🤔 나는 4번 방식이 가장 간단하고 직관적이라는 생각이 드는 것 같다.

### Reject 검증 테스트

1. `Promise`를 `return` 하는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
  return timeout(50).catch((duration) => {
    expect(duration).toBe(50);
  });
});
```

`catch` 메서드에 전달할 함수에 단언문을 작성한다.

2. `rejects` 매처를 사용하는 단언문을 활용하는 방법

```jsx
// 단언문 return
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
  return expect(timeout(50)).rejects.toBe(50);
});

// async/await 사용
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  await expect(timeout(50)).rejects.toBe(50);
});
```

단언문을 `return` 하거나 `async/await` 를 사용한다.

3. `try-catch` 문을 사용하는 방법

```jsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1); // 반드시 1개의 assertion(expect)이 실행되어야 함
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

`Unhandled Rejection` 을 `try` 블록에서 발생시키고, 발생한 오류를 `catch` 블록에서 받아 단언문으로 검증한다.

> [!TIP]
> Promise 거부(reject)의 두 가지 상태
>
> | State               | Description                                              |
> | ------------------- | -------------------------------------------------------- |
> | Handled Rejection   | reject된 Promise를 .catch() 또는 try-catch로 처리한 상태 |
> | Unhandled Rejection | reject된 Promise를 아무도 처리하지 않은 상태             |

> 🤔 이번에도 3번 방식이 가장 직관적인 것 같다.

> [!WARNING]
>
> 비동기 처리를 테스트할 때 테스트 함수가 `동기 함수` 인 경우 반드시 단언문을 `return` 해야한다.
>
> 이 같은 실수를 하지 않으려면 비동기 처리가 포함된 부부을 테스트할 때는 다음과 같은 원칙을 가지고 접근해야 한다.
>
> - 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 `async` 함수로 만든다.
> - `.resloves`, `rejects` 가 포함된 단언문은 `await` 한다.
> - `try-catch` 문의 예외 발생을 검증할 때는 `expect.assertions` 를 사용한다.
