# 03. 처음 시작하는 단위 테스트

테스트 파일은

1. 최상위 `__tests__` 디렉토리 하위에 만든다.
2. `*.test.ts` 와 같은 형식으로 만든다.

---

## 1. 테스트 구성 요소

### 1-1. 가장 단순한 테스트

흔한 a와 b 를 더한 값을 출력하는 함수이다.

```tsx
function add(a: number, b: number) {
  return a + b;
}
```

test, expect, toBe 의 뜻을 생각해봤을 때 어느 정도 어떻게 동작하는가에 대한 유추가 가능하다

```tsx
test("add: 1 + 2는 3", () => {
  expect(add(1, 2)).toBe(3);
});
```

### 1-2. 테스트 구성요소

use jest

1. `test` 메소드
   1. `test(테스트명, 테스트 함수)` 형태로 작성한다.
2. 단언문(assertion)

   1. `expect + matcher` 조합으로 검증값 = 기댓값 인지 검증한다.

   e.g) `expect(검증값).toBe(기댓값)`

### 1-3. 테스트 그룹 작성

`describe` 메소드를 사용하여 각 테스트들을 의미 있는 단위로 묶을 수 있다.

```tsx
describe("1. 사칙연산", () => {
  describe("1-1. add", () => {
    test("1-1-1. 반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {...});
    test("1-1-2. 반환값의 상한은 '100'이다", () => {...});
  });
  describe("1-2. sub", () => {
    test("1-2-1. 반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다", () => {...});
    test("1-2-1. 반환값의 하한은 '0'이다", () => {...);
  });
});
```

---

## 2. 테스트 실행 방법

1. package.json 내 script를 이용한 실행 방식
2. 에디터 내의 Extension을 통한 실행 방식
   - extension 1 : [jest runner](https://open-vsx.org/extension/firsttris/vscode-jest-runner)
   - extension 2: [jest](https://open-vsx.org/extension/Orta/vscode-jest)

### 2-1. 조건 분기

조건 분기는 테스트를 할 떄 주의하면서 작성해야 한다.

만약 `덧셈의 상한선은 100이다` 라는 분기가 있을 때

테스트 명을 `100 + 20 = 100 이다` 라고 해놓으면 그 누가봐도 이해가 안되는 설명이다.

이 때는 명확하게 왜 분기를 나눴는지에 대한 의도를 나타내는 것이 좋다.

`상한선은 100이다`라는 조건이 잘 동작하는지 확인하기 위해 작성된 테스트 코드이기 때문에

테스트명을 `덧셈의 상한선은 100이다` 라고 하는 것이 좋다.

### 2-2. 에지 케이스와 예외 처리

- 타입 어노테이션을 통한 입력값 제약 설정 - 즉 매개면수에 타입을 붙인다.

특정 범위로 입력값을 제한하고 싶다면 런타임에 예외를 발생시키는 처리를 추가해야 한다.

### 2-3. 예외 발생시키기

위에서 언급했던 특정 범위로 제한하는것은 타입 어노테이션으로는 한계가 있다.

아래의 테스트 코드는 `매개변수 a, b는 0이상 100 이하의 값이다` 라는 조건이 붙는다면 커버하지 못한다.

```tsx
test("반환값의 상한은 '100'이다", () => {
  expect(add(-10, 110)).toBe(100);
});
```

```tsx
function add(a: number, b: number) {
  if (a < 0 || a > 100) {
    throw new Error("0〜100 사이의 값을 입력해주세요");
  }
  if (b < 0 || b > 100) {
    throw new Error("0〜100 사이의 값을 입력해주세요");
  }
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

throw 키워드를 통해 조건을 만족시키지 못했을 떄 Error를 만들어내면 매개변수가 조건을 만족못했을 때 테스트코드에서 에러를 뱉는다.

### 2-4. 예외 발생 검증 테스트

하지만 우리는 테스트 코드 동작시에 입력값 범위에 대한 제한을 위반하는 경우 에러를 뱉기를 원하는 것이 아닌

조건에 대한 동작이 잘 이루어지는 지를 검증하기를 원한다.

`test(입력값이 {범위}가 아니라면 예외를 발생시킨다` 라는 테스트를 만든다

```tsx
test("test(입력값이 {범위}이/가 아니라면 예외를 발생시킨다", () => {
  expect(() => add(-10, 100)).toThrow();
});
```

이런 예외 발생에 대한 검증은 `toThrow` 매처를 사용한다.

예외를 발생시키 않는 입력값을 넣을 경우 실패하게 된다

```bash
# expect(() => add(70, 80)).toThrow();

Error: expect(received).toThrow()
Received function did not throwJest
```

> [!NOTE]
> TODO: 왜 예외 발생에 대한 검증 시에는 함수 형태로 expect 매개변수가 사용되어야 하는지 찾아보기

### 2-5. 오류 메시지를 활용한 세부 사항 검증

matcher의 인수로 문구를 작성하면 테스트 실패시 문구를 확인할 수 있다

```bash
# expect(() => add(-10, 80)).toThrow("0〜100 사이의 값을 입력해주세요");

expect(received).toThrow(expected)
Expected substring: "0〜100 사이의 값을 입력해주세요"
Received function did not throw
```

### 2-6. instanceof 연산자를 활용한 세부 사항 검증

상속 클래스를 커스텀해서 세부 구현 없이도 검증을 다양하게 나눌 수 있다.

```tsx
export class HttpError extends Error {}
export class RangeError extends Error {}

if (err instanceof HttpError) {
  // 발생한 에러가 HttpError인 경우
}
if (err instanceof RangeError) {
  // 발생한 에러가 RangeError인 경우
}
```

이를 이용해 위 예시를 구체화 한다면 전달받은 매개변수 검증을 위한 함수를 분리해서 작성한 후

기존 코드와 교체한다.

```tsx
function checkRange(value: number) {
  if (value < 0 || value > 100) {
    throw new RangeError("0〜100 사이의 값을 입력해주세요");
  }
}

export function add(a: number, b: number) {
  checkRange(a);
  checkRange(b);
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

이렇게 한후 테스트 코드에도 똑같이 상속 클래스를 각 매처의 매개변수로 넘겨서 검증을 한다.

```tsx
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => sub(-10, 10)).toThrow(RangeError);
  expect(() => sub(10, -10)).toThrow(RangeError);
  expect(() => sub(-10, 110)).toThrow(Error);
});
```

아래의 테스트도 성공을 하는데 이는 `RangeError` 클래스가 `Error` 클래스를 상속받았기 때문이다.

주의하도록 하자

```tsx
expect(() => sub(-10, 110)).toThrow(Error);
```

---

## 3. 용도별 matcher

### **3-1. 진릿값 검증**

- `toBeTruthy()`: 값이 JavaScript에서 true로 평가되는지 확인 (truthy)
- `toBeFalsy()`: 값이 JavaScript에서 false로 평가되는지 확인 (falsy)
- `toBeNull()`: 값이 정확히 null인지 확인
- `toBeUndefined()`: 값이 정확히 undefined인지 확인
- `toBeDefined()`: 값이 undefined가 아닌지 확인

### **3-2. 수치 검증**

- `toBe()`: 원시값의 엄격한 동등성 검사 (===)
- `toEqual()`: 값의 심층 동등성 검사
- `toBeGreaterThan()`: 값이 특정 수보다 큰지 확인 (>)
- `toBeGreaterThanOrEqual()`: 값이 특정 수보다 크거나 같은지 확인 (>=)
- `toBeLessThan()`: 값이 특정 수보다 작은지 확인 (<)
- `toBeLessThanOrEqual()`: 값이 특정 수보다 작거나 같은지 확인 (<=)
- `toBeCloseTo()`: 부동소수점 계산에서 지정한 자릿수까지 근사값 비교 (특이사항: 기본 소수점 2자리까지 비교)

### **3-3. 문자열 검증**

- `toContain()`: 문자열이 특정 부분 문자열을 포함하는지 확인
- `toMatch()`: 문자열이 정규표현식 패턴과 일치하는지 확인
- `toHaveLength()`: 문자열의 길이가 특정 값과 일치하는지 확인
- `stringContaining()`: 객체 내의 문자열 속성이 특정 부분 문자열을 포함하는지 확인
- `stringMatching()`: 객체 내의 문자열 속성이 정규표현식과 일치하는지 확인

### **3-4. 배열 검증**

- `toContain()`: 배열이 특정 원시값을 포함하는지 확인 (특이사항: 객체에는 사용 불가)
- `toContainEqual()`: 배열이 특정 객체와 동등한 객체를 포함하는지 확인
- `arrayContaining()`: 배열이 지정된 항목들을 모두 포함하는지 확인 (순서 무관)

### **3-5. 객체 검증**

- `toMatchObject()`: 객체가 지정된 속성들과 일치하는지 확인 (부분 일치 가능)
- `toHaveProperty()`: 객체가 특정 속성을 가지고 있는지 확인
- `objectContaining()`: 객체가 지정된 속성들을 포함하는지 확인 (중첩 객체에서 유용)

### **3-6 .공통 특이사항**

- 모든 matcher는 `not`을 통해 부정 조건으로 사용 가능하다
- `toBe()`는 참조 비교, `toEqual()`은 값을 비교한다.
- 객체나 배열 비교 시 `toEqual()`이 더 적합하다
- 부동소수점 비교는 `toBeCloseTo()` 사용 권장한다.

---

## 4. 비동기 처리 테스트

### 4-1. Promise를 반환하는 작성법

1. Promise를 반환하면서 then에서 단언문 작성하기

```tsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  return wait(50).then((duration) => {
    expect(duration).toBe(50);
  });
});
```

1. resolves matcher를 통한 테스트

```tsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  return expect(wait(50)).resolves.toBe(50);
});
```

### 4-2. async / await를 활용한 작성법

```tsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  await expect(wait(50)).resolves.toBe(50);
});

// or

test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  expect(await wait(50)).toBe(50);
});
```

### 4-3. Reject 검증 테스트

4-1 또는 4-2에서 다루었던 예시랑 비슷하며 차이점은 아래와 같다.

- Promise에서 then 대신에 catch가 사용
- resolves matcher 대신에 rejects matcher 사용

추가되는 방법은 try-catch 구문을 사용하는 작성법이다

```tsx
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1);
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

### 4-4. 테스트 결과가 기댓값과 일치하는지 확인하기

일단 try-catch 구문에서 테스트하기 위한 함수를 잘못 불러올 경우를 방지하기 위해서

expect.assertions 를 통해 단언문의 호출 횟수가 기대한 만큼되는 지 확인하면 된다.

- 비동기 처리 테스트를 위해서는 async 함수로 든다
- resolves나 rejects matcher를 사용하는 단언문은 await를 건다
- try-catch를 통한 검증은 expect.assertions을 사용한다.
