# 처음 시작하는 단위 테스트

## 테스트 구성 요소

- 테스트명: 테스트 코드가 어떤 의도로 작성되었으며, 어떤 작업이 포함됐는지 명확하게 표현해야 한다.
- 테스트 함수: 단언문을 포함한다. 단언문은 검증값과 기대값이 일치하는지 검증한다.
  - Jest Matcher: https://jestjs.io/docs/using-matchers
  - `expect` API Doc: https://jestjs.io/docs/expect
- 테스트 그룹: 연관성 있는 테스트들의 그룹, 중첩이 가능하다.

## 단위 테스트 예시

### 조건 분기

```ts
export const add = (a: number, b: number) => {
  const sum = a + b;
  if (sum > 100) return 100;
  return sum;
};
```

```ts
// Bad Example
test("50 + 50은 100", () => {
  expect(add(50, 50)).toBe(100);
});

// 구현 코드를 모른다면 `70+80`이 `100`이 된다는 것을 이해할 수 없다.
test("70 + 50은 100", () => {
  expect(add(70, 50)).toBe(100);
});
```

```ts
// Good Example

// 함수의 명세와 정책이 명확하게 드러난다.
// 설명이 잘 작성된 테코는 그 자체로 명세 역할을 수행한다.
test("반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다", () => {
  expect(add(50, 50)).toBe(100);
});

test("반환값의 상한은 '100'이다", () => {
  expect(add(70, 80)).toBe(100);
});
```

### 예외 발생

- `toThrow` 매처를 사용해 예외 발생을 검증할 수 있다.
- 인수를 할당하면 예외의 세부 사항을 검증할 수 있다.
  - 정규식: 에러 메시지가 정규식 패턴과 일치하는지 검증
  - 문자열: 에러 메시지가 문자열을 포함하는지 검증
  - 에러 객체: 에러 메시지가 객체의 `message` 속성값과 일치하는지 검증
  - 에러 클래스: 에러 객체가 클래스의 인스턴스인지 검증

> 참고: https://jestjs.io/docs/expect#tothrowerror

### 비동기 처리

비동기 처리가 포함된 함수를 검증하는데 다양한 방법이 있다.

**`then/catch` 메서드에 전달한 함수에 단언문 작성**

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

**`resolves/rejects` 매처 사용**

```ts
test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
  // 비동기 처리를 테스트할 때 테스트 함수가 동기 함수라면 반드시 단언문을 반환해야 한다.
  return expect(wait(50)).resolves.toBe(50);
});

test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
  // make sure to add a return statement
  return expect(timeout(50)).rejects.toBe(50);
});
```

> 참고
>
> - https://jestjs.io/docs/expect#resolves
> - https://jestjs.io/docs/expect#rejects

**`async/await` 사용**

```ts
// resolves/rejects 매처 사용하는 단언문에 await 키워드 붙이기

test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  await expect(wait(50)).resolves.toBe(50);
});

test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  await expect(timeout(50)).rejects.toBe(50);
});
```

```ts
// Promise를 반환하는 함수에 await 키워드 붙이기

test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
  expect(await wait(50)).toBe(50);
});

test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1); // 테스트 중 실행될 단언문의 개수 검증
  try {
    await timeout(50);
  } catch (err) {
    expect(err).toBe(50); // 반드시 실행되어야 함
  }
});
```

> 참고: https://jestjs.io/docs/expect#expectassertionsnumber

## Key Takeaway

- 테스트 대상의 명세와 정책이 명확하게 드러나도록 테스트 설명을 작성하자. 구현 내용을 모르더라도 테스트 설명을 보고 동작 방식을 이해할 수 있게!
- Matcher들이 정말 많은데 그때그때 필요한 걸 공식문서에서 찾아서 사용해야 할 것 같다.
