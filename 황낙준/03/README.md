### 처음 시작하는 단위 테스트

#### 테스트 구성요소

1. 제스트가 제공하는 API인 test 함수로 정의한다.

`test(테스트명, 테스트함수)`

두번째 인수인 테스트함수에는 단언문을 작성한다.
단언문은 검증값과 기대값이 일치하는지 검증하는 문이다.

단언문: expect(검증값), toBe(기대값)
매처: toBe(기댓값)

#### 테스트 그룹 작성

그룹화하고 싶을 때는 describe 함수를 사용한다.
test 함수는 그룹화 시킬수 없지만 describe 함수는 중첩이 가능하다는 특징이 있다.

### 테스트 실행방법

1. package.json으로 script를 실행한다.
2. jest runner를 실행한다.

### 에지 케이스와 예외 처리

1. 타입스크립트로 입력값 제약 설정

- 타입에 예외를 발생시키는 처리를 넣는 것보다 타입 애너테이션을 통해 입력값을 제약하는 것이 실수를 더 빨리 확인할 수 있다.

```ts
export function add(a: number, b: number) {
  const sum = a + b;
  if (sum > 100) {
    return 100;
  }
  return sum;
}
```

2. 예외 발생시키기

- 특정 범위로 입력값을 제한하고 싶을 때는 런타임에 예외를 발생시키는 처리 추가가 필요하다.

```ts
export function add(a: number, b: number) {
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

위처럼 작성하면 기댓값과 다를 경우, 값 반환 전에 프로그램을 중지시킨다.

만약 테스트 코드를 작성한다면 예외 처리 매처로 `toThrow`를 사용한다.

```ts
test("올바른 단언문 작성법", () => {
  // 잘못된 작성법
  expect(add(-10, 110)).toThrow();
  // 올바른 작성법
  expect(() => add(-10, 110)).toThrow();
});
```

위 코드에서 예외를 발생시키지 않으면 테스트가 실패한다.

3. 오류 메세지 활용하기

`Error` 인스턴스를 생성하면서 "0~100 사이의 값을 입력해주세요" 라는 메세지를 인수로 할당해보자.

```ts
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => add(110, -10)).toThrow("0〜1000 사이의 값을 입력해주세요");
});
```

이를 통해 예외처리라는 큰 틀이 아니라 의도한 예외처리가 발생했는지 확인할 수 있다.

4. instanceOf 활용하기
   extends로 상속받은 클래스들은 instanceof 연산자를 사용해서 다른 인스턴스와 구분할 수 있다.

```ts
export class HttpError extends Error {}
export class RangeError extends Error {}

if (err instanceof HttpError) {
  // 발생한 에러가 HttpError인 경우
}
if (err instanceof RangeError) {
  // 발생한 에러가 RangeError인 경우
}
```

만약 0~100 사이의 값이 아닌 경우 메세지까지 추가하여 에러를 작성해보자.

```ts
// index.ts
function sub(a: number, b: number): number {
  if (a < 0 || a > 100 || b < 0 || b > 100) {
    throw new RangeError("0〜100 사이의 값을 입력해주세요");
  }
  return a - b;
}

// index.test.ts
test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
  expect(() => sub(-10, 10)).toThrow(RangeError);
  expect(() => sub(10, -10)).toThrow(RangeError);
});
```

### 용도별 매처

기댓값과 일치하는지 매처로 검증한다

1. 진릿값 검증
   `toBeTruthy`/`toBeFalsy`
   true와 false를 구분할 때는 위 매처를 사용한다.

```ts
test("참인 진릿값 검증", () => {
  expect(1).toBeTruthy();
  expect("1").toBeTruthy();
  expect(true).toBeTruthy();
  expect(0).not.toBeTruthy();
  expect("").not.toBeTruthy();
  expect(false).not.toBeTruthy();
});
```

만약 `null`이나 `undefined`를 구분하고 싶다면, 아 아래 매처를 통해 구분지어보자.
`toBeNull`/`toBeUndefined`

```ts
test("null과 undefined 검증", () => {
  expect(null).toBeNull();
  expect(undefined).toBeUndefined();
});
```

2. 수치 검증
   등가 비교나 대소 비교 관련 매처를 사용한다.

```ts
describe("수치 검증", () => {
  const value = 2 + 2;
  test("검증값이 기댓값과 일치한다", () => {
    expect(value).toBe(4);
    expect(value).toEqual(4);
  });
  test("검증값이 기댓값보다 크다", () => {
    expect(value).toBeGreaterThan(3); // 4 > 3
    expect(value).toBeGreaterThanOrEqual(4); // 4 >= 4
  });
  test("검증값이 기댓값보다 작다", () => {
    expect(value).toBeLessThan(5); // 4 < 5
    expect(value).toBeLessThanOrEqual(4); // 4 <= 4
  });
});
```

JS에서는 소수 계산에 오차가 있다. 10진수인 소수를 2진수로 변환할 때 발생하는 문제다.
소숫값을 검증할 떄는 `toBeCloseTo` 매처를 사용한다.

`toBeCloseTo`는 정확한 값 비교 대신 "충분히 가까운지"를 확인합니다:

첫 번째 인자: 기대하는 값 (여기서는 0.3)
두 번째 인자: 검사할 소수점 자릿수 (기본값: 2)

2일 때: 0.005 이내의 차이를 허용
15일 때: 매우 작은 오차까지 허용
16 이상일 때: 매우 엄격한 비교로 실제 2진수 변환 오차가 드러남

```ts
let actual = 0.1 + 0.2; // 0.30000000000000004
let expected = 0.3;

// 소수점 2자리까지만 비교 (기본값)
toBeCloseTo(actual, expected); // 통과 ✅

// 소수점 15자리까지 비교
toBeCloseTo(actual, expected, 15); // 통과 ✅

// 소수점 16자리까지 비교
toBeCloseTo(actual, expected, 16); // 실패 ❌
```

3. 문자열 검증

`toContain`이나 정규 표현식을 검증하는 `toMatch`와 같은 매처를 사용한다.
문자열 길이는 `toHaveLength`로 검증한다.

```ts
const str = "Hello World";

test("toContain", () => {
  expect(str).toContain("World");
  expect(str).not.toContain("Bye");
});
test("toMatch", () => {
  expect(str).toMatch(/World/);
  expect(str).not.toMatch(/Bye/);
});
test("toHaveLength", () => {
  expect(str).toHaveLength(11);
  expect(str).not.toHaveLength(12);
});
```

`stringContaining`이나 `stringMatching`은객체에 포함된 문자열을 검증한다.
프로퍼티 중 기댓값으로 지정한 문자열의 일부가 포함됐으면 테스트가 성공한다.

```ts
const obj = { status: 200, message: str };

test("stringContaining", () => {
  expect(obj).toEqual({
    status: 200,
    message: expect.stringContaining("World")
  });
});
test("stringMatching", () => {
  expect(obj).toEqual({
    status: 200,
    message: expect.stringMatching(/World/)
  });
});
```

4. 배열 검증

배열에 원시형인 특정 값이 포함됐는지 확인하기 위해 `toContain`을 사용한다.
길이를 검증하고 싶을 때는 `toHaveLength`를 사용한다.

```ts
describe("원시형 값들로 구성된 배열", () => {
  const tags = ["Jest", "Storybook", "Playwright", "React", "Next.js"];
  test("toContain", () => {
    expect(tags).toContain("Jest");
    expect(tags).toHaveLength(5);
  });
});
```

배열에 특정 객체가 포함되었는지 확인할 떄는 `toContainEqual`을 사용한다.
`arrayContaining`을 사용하면 인수로 넘겨진 배열의 요소들이 전부 포함돼 있어야 테스트가 성공한다.

```ts
describe("객체들로 구성된 배열", () => {
  const article1 = { author: "taro", title: "Testing Next.js" };
  const article2 = { author: "jiro", title: "Storybook play function" };
  const article3 = { author: "hanako", title: "Visual Regression Testing" };
  const articles = [article1, article2, article3];
  test("toContainEqual", () => {
    expect(articles).toContainEqual(article1);
  });
  test("arrayContaining", () => {
    expect(articles).toEqual(expect.arrayContaining([article1, article3]));
  });
});
```

5. 객체 검증

`toMatchObject`를 사용하여 검증한다.
부분적으로 프로퍼티가 일치하면 테스트를 성공하고, 일치하지 않는 프로퍼티가 있으면 테스트는 실패한다.

```ts
test("toMatchObject", () => {
  const author = { name: "taroyamada", age: 38 };

  expect(author).toMatchObject({ name: "taroyamada", age: 38 });
  expect(author).toMatchObject({ name: "taroyamada" });
  expect(author).not.toMatchObject({ gender: "man" });
});
test("toHaveProperty", () => {
  expect(author).toHaveProperty("name");
  expect(author).toHaveProperty("age");
});
```

### 비동기 처리 테스트

경과 시간을 반환하는 비동기 함수를 예시로 작성

```ts
export function wait(duration: number) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(duration);
    }, duration);
  });
}
```

1. Promise를 반환하는 작성법
   Promise를 반환하면서 then에 전달할 함수에 단언문을 작성하는 방법이다.
   작업이 완료될 때까지 테스트 판정을 유예한다.

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  return wait(50).then((duration) => {
    expect(duration).toBe(50);
  });
});
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
  return timeout(50).catch((duration) => {
    expect(duration).toBe(50);
  });
});
```

두번째 방법은 resolves 매처를 사용하는 단언문을 return 하는 것이다.
resolve 됐을 때 검증하고 싶다면 사용하자.

```ts
describe("wait", () => {
  test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
    return expect(wait(50)).resolves.toBe(50);
  });
  test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
    return expect(timeout(50)).rejects.toBe(50);
  });
});
```

2. async/await를 활용한 작성법

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  await expect(wait(50)).resolves.toBe(50);
});
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  await expect(timeout(50)).rejects.toBe(50);
});
```

3. 비동기 처리 테스트 시 주의 사항

1) 비동기 처리가 포함된 부분을 테스트할 떄는 테스트 함수를 async 함수로 만든다.
2) .resolves나 .rejects가 포함된 단언문은 await한다.
3) try-catch 문의 예외 발생을 검증할 때는 expect.assertion을 사용한다.

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1);
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

만약에 동기함수로 작성할 경우에는 단언문을 반드시 return 해야한다.

```ts
test("Promise가 완료되면 테스트가 종료된다", () => {
  return expect(wait(2000)).resolves.toBe(3000);
});
```
