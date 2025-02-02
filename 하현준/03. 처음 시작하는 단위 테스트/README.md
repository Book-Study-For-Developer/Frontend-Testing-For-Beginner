## 테스트 구성 요소

### 테스트 구성 요소

- 테스트는 Jest가 제공하는 API [**`test`**](https://jestjs.io/docs/api#testname-fn-timeout)를 사용

```tsx
test(name, fn, timeout)
// it(name, fn, timeout) 으로 사용해도 무방
```

[](https://jestjs.io/docs/api#testname-fn-timeout)

- name: 테스트의 제목
- fn: 단언문 작성
- timeout: 얼마가 지나면 중단할지에 대한 ms

```tsx
expect(value).toBe(value)
```

- `expect`: 값을 테스트할 때마다 사용
- `toBe`: 원시 값을 비교하거나 객체 인스턴스의 참조적 정체성을 확인하는 데 사용 ⇒ 매처(`matcher`)

### 테스트 그룹 작성

- 연관성 있는 테스트들을 그룹화하고 싶을 때는 [`describe`](https://jestjs.io/docs/api#describename-fn) 함수를 사용

```tsx
describe(name, fn)
```

- `describe`: 여러 관련 테스트를 그룹화하는 블록을 만듭니다

## 테스트 실행 방법

1. npm run test
2. VSCode > `Jest Runner` 플러그인 활용
    - **제가 발생했던 이슈 공유**
        
        ![image](https://github.com/user-attachments/assets/63a269b7-75cf-42cc-a778-5c2f27b62bbc)
        
        - 폴더 위치를 한글로 하고 하위에 위치 시키면 test 폴더를 못찾는 이슈가 있습니다.
        - **원인**: 사진에 `testMatch`를 보면 정규식으로 `.test.ts`의 파일을 찾는데, 한글로 하면 이를 못 찾음 (근데 정규식 상으로는 찾아야 하는게 정상인데, 아마도 UTF-8 과 관련되어 있어보임)
        - **해결 방식**:  `jest.config.ts`에 새롭게 정규식을 짜거나 영어 이름을 사용 (저는 쉬운 방법인 영어 폴더명으로 선택하였습니다.)

## 조건 분기

### 상한/하한이 있는 덧셈/뺄셈 함수 테스트

```tsx
export function add(a: number, b: number) {
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}

export function sub(a: number, b: number) {
  const sum = a - b;
  if (sum < 0) {
    return 0;
  }
  return sum;
}

test("반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {
  expect(add(50, 50)).toBe(100);
});
test("반환값의 상한은 '100'이다", () => {
  expect(add(70, 80)).toBe(100);
});

test("반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다", () => {
  expect(sub(51, 50)).toBe(1);
});
test("반환값의 하한은 '0'이다", () => {
  expect(sub(70, 80)).toBe(0);
});
```

테스트 코드의 의도를 명확히 표현해야 한다.

### 에지 케이스와 예외 처리

예외를 발생시키는 케이스도 같이 테스트 해야 한다.

```tsx
export class HttpError extends Error {}
export class RangeError extends Error {}

function checkRange(value: number) {
  if (value < 0 || value > 100) {
    // 범위를 체크하는 별도의 에러 인스턴스를 만든다.
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

export function sub(a: number, b: number) {
  checkRange(a);
  checkRange(b);
  const sum = a - b;
  if (sum < 0) {
    return 0;
  }
  return sum;
}

describe("사칙연산", () => {
  describe("add", () => {
    test("반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {
      expect(add(50, 50)).toBe(100);
    });
    test("반환값의 상한은 '100'이다", () => {
      expect(add(70, 80)).toBe(100);
    });
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      const message = "0〜100 사이의 값을 입력해주세요";
      expect(() => add(-10, 10)).toThrow(message);
      expect(() => add(10, -10)).toThrow(message);
      expect(() => add(-10, 110)).toThrow(message);
    });
  });
  describe("sub", () => {
    test("반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다", () => {
      expect(sub(51, 50)).toBe(1);
    });
    test("반환값의 하한은 '0'이다", () => {
      expect(sub(70, 80)).toBe(0);
    });
    // 에러를 실제로 던지는지도 체크한다.
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      expect(() => sub(-10, 10)).toThrow(RangeError);
      expect(() => sub(10, -10)).toThrow(RangeError);
      expect(() => sub(-10, 110)).toThrow(Error);
    });
  });
});
```

## 용도별 [매처](https://jestjs.io/docs/expect#matchers)

**진릿값 검증**

- [`.toBeNull()`](https://jestjs.io/docs/expect#tobenull)
- [`.toBeTruthy()`](https://jestjs.io/docs/expect#tobetruthy)
- [`.toBeUndefined()`](https://jestjs.io/docs/expect#tobeundefined)
- [`.toBeNaN()`](https://jestjs.io/docs/expect#tobenan)
- [`.toBeFalsy()`](https://jestjs.io/docs/expect#tobefalsy)

**수치 검증을 위한 각종 매처들**

- [`.toBeGreaterThan(number | bigint)`](https://jestjs.io/docs/expect#tobegreaterthannumber--bigint)
- [`.toBeGreaterThanOrEqual(number | bigint)`](https://jestjs.io/docs/expect#tobegreaterthanorequalnumber--bigint)
- [`.toBeLessThan(number | bigint)`](https://jestjs.io/docs/expect#tobelessthannumber--bigint)
- [`.toBeLessThanOrEqual(number | bigint)`](https://jestjs.io/docs/expect#tobelessthanorequalnumber--bigint)
- [`.toBeCloseTo(number, numDigits?)`](https://jestjs.io/docs/expect#tobeclosetonumber-numdigits)

**문자열 검증**

- [`.toContain(item)`](https://jestjs.io/docs/expect#tocontainitem)
- [`.toHaveLength(number)`](https://jestjs.io/docs/expect#tohavelengthnumber)
- [`expect.stringContaining(string)`](https://jestjs.io/docs/expect#expectstringcontainingstring)
- [`expect.stringMatching(string | regexp)`](https://jestjs.io/docs/expect#expectstringmatchingstring--regexp)
- [`.toMatch(regexp | string)`](https://jestjs.io/docs/expect#tomatchregexp--string)

**배열 검증**

- [`.toContain(item)`](https://jestjs.io/docs/expect#tocontainitem)
- [`.toHaveLength(number)`](https://jestjs.io/docs/expect#tohavelengthnumber)

객체 검증

- [`.toMatchObject(object)`](https://jestjs.io/docs/expect#tomatchobjectobject)
- [`.toHaveProperty(keyPath, value?)`](https://jestjs.io/docs/expect#tohavepropertykeypath-value)
- [`expect.objectContaining(object)`](https://jestjs.io/docs/expect#expectobjectcontainingobject)

## 비동기 처리 테스트

### 

```tsx
export function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(duration);
    }, duration);
  });
}

export function timeout(duration: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(duration);
    }, duration);
  });
}
```

```tsx
describe("비동기 처리", () => {
  describe("wait", () => {
    // 1. Promise를 반환하는 작성법
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
      return wait(50).then((duration) => {
        expect(duration).toBe(50);
      });
    });
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
      return expect(wait(50)).resolves.toBe(50);
    });
    
    // 2. async/await을 활용한 작성법
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
      await expect(wait(50)).resolves.toBe(50);
    });
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
      expect(await wait(50)).toBe(50);
    });
  });
  
  // Reject 검증 테스트
  describe("timeout", () => {
    // catch문 활용
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
      return timeout(50).catch((duration) => {
        expect(duration).toBe(50);
      });
    });
    // return문을 통한 단언문 작성
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
      return expect(timeout(50)).rejects.toBe(50);
    });
    // aysnc/await 사용
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
      await expect(timeout(50)).rejects.toBe(50);
    });
  });
});

// Reject 검증 테스트
// try catch문 사용
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  // 잘못된 테스트 코드 작성을 방지하기 위해 예외가 진짜 발생하는지도 체크한다.
  expect.assertions(1);
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50);
  }
});

test("return하고 있지 않으므로 Promise가 완료되기 전에 테스트가 종료된다", () => {
  // 실패할 것을 기대하고 작성한 단언문
  // 그러나 이는 단언문이 한번도 평가되지 않았기 때문에 테스트는 성공한다.
  expect(wait(2000)).resolves.toBe(3000);
  // 올바르게 고치려면 다음 주석처럼 단언문을 return해야 한다
  // return expect(wait(2000)).resolves.toBe(3000);
});
```

비동기 테스트의 실수를 줄이기 위해서는

- 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 `async` 함수로 만든다.
- `.resolves`나 `.rejects`가 포함된 단언문은 `await`한다.
- `try-catch` 문의 예외 발생을 검증할 때는 [`expect.assertions(number)`](https://jestjs.io/docs/expect#expectassertionsnumber) 를 사용한다.
