## 🟢 기본 테스트 작성

```TypeScript
// test( 테스트 명, 테스트 함수 );
// 단언문 : expect(검증값).toBe(기댓값);
// 매처 : toBe(기댓값)

test(테스트 명, () => {
	expect(검증값).toBe(기댓값);
})
```

<br/>

## 🟢 테스트 그룹 작성

```ts
// describe( 그룹명, 그룹 함수 )

describe('사칙연산', () => {
	describe('덧셈', () => {
		...
	});

	describe('뺄셈', () => {
		...
	});
});
```

<br/>

## 🟢 예외 발생 검증 테스트

```jsx
test('add two positive integer', () => {
  // expect(add(-10, 100)).toThrow();
  expect(() => add(-10, 100)).toThrow();
});
```

<br/>

### 🤷🏻 **예외 테스트에서 익명함수를 전달하는 이유**

`expect(add(-10, 100)).toThrow()` 로 작성하게되면 단언문 실행을 위해 내부의 add가 먼저 실행된다.  
이때 add가 에러를 발생시키면 **테스트 전에 실패해서 테스트가 중단**된다.  
따라서 `() ⇒ add(-10, 100)`를 전달해 실행을 지연시켜야 한다.
<br/>

### 🤷🏻 **오류 메세지를 통한 세부 검증**

```jsx
const BETWEEN_0_AND_100 = '0 ~ 100 사이의 값을 입력해주세요.';

const add = (v1: number, v2: number) => {
  if (v1 <= 0 || v1 >= 100 || v2 <= 0 || v2 >= 100) {
    throw new Error(BETWEEN_0_AND_100);
  }

  return v1 + v2;
};

test('add two positive integer', () => {
  expect(() => add(-10, 100)).toThrow(BETWEEN_0_AND_100);
});
```

toThrow의 인수로 특정 메세지를 입력하여 상세한 테스트가 가능하다.

의도하지 않은 예외가 발생할 수 있기 때문에 구분하기 위해 `의도적으로 예외가 발생하고 있는지의 관점으로 접근하는 것이 좋다.

<br/>

### 🤷🏻 **instanceof 연산자를 통한 세부사항 검증**

```jsx
const BETWEEN_0_AND_100 = '0 ~ 100 사이의 값을 입력해주세요.';

class RangeError extends Error {}

const add = (v1: number, v2: number) => {
  if (v1 <= 0 || v1 >= 100 || v2 <= 0 || v2 >= 100) {
    throw new RangeError(BETWEEN_0_AND_100);
  }

  return v1 + v2;
};

test('add two positive integer', () => {
  expect(() => add(-10, 100)).toThrow(BETWEEN_0_AND_100);
});
```

<br/>

## 🟢 용도별 매처

| 용도        | 매처                   | 설명                                                                                                                                                 |
| ----------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 일치 검증   | toBe                   | 검증값과 기댓값이 일치하는지 검증 ( 엄격한 일치 비교 )                                                                                               |
|             | toEqual                | 검증값과 기댓값이 일치하는지 검증 ( 값 비교, 객체 구조 비교 )                                                                                        |
| 진릿값 검증 | toBeTruthy             | 참인 값과 일치하는 매처                                                                                                                              |
|             | toBeFalsy              | 거짓인 값과 일치하는 매처                                                                                                                            |
|             | toBeNull               | null을 검증하는 매처. toBeFalsy와 일치하지만 구체적으로 null 값인지를 검증할 떄 활용.                                                                |
|             | toBeUndefined          | undefined를 검증하는 매처. toBeFalsy와 일치하지만 구체적으로 undefined 값인지를 검증할 떄 활용.                                                      |
| 수치 검증   | toBeGreaterThanOrEqual | 검증값이 기댓값 보다 크거나 같은지 검증                                                                                                              |
|             | toBeGreaterThan        | 검증값이 기댓값 보다 큰지 검증                                                                                                                       |
|             | toBeLessThanOrEqual    | 검증값이 기댓값 보다 작거나 같은지 검증                                                                                                              |
|             | toBeLessThan           | 검증값이 기댓값 보다 작은지 검증                                                                                                                     |
|             | toBeCloseTo            | 자바스크립트에서는 소수 계산 오차가 있기 때문에 일반적으로 연산한 소숫 값을 검증할 때 사용. 두번째 인수에 소숫점 몇 자리수를 비교할 것인지 설정 가능 |
| 문자열 검증 | toContain              | 문자열 일부가 일치하는지 검증                                                                                                                        |
|             | toMatch                | 정규 표현식에 대한 검증                                                                                                                              |
|             | toHaveLength           | 문자열 길이에 대한 검증                                                                                                                              |
|             | stringContaining       | 객체에 포함된 문자열이 일치하는지 검증                                                                                                               |
|             | stringMatching         | 객체에 포함된 문자열에 대해 정규 표현식을 통해 검증                                                                                                  |
| 배열 검증   | toContain              | 특정 값을 포함하고 있는지 검증                                                                                                                       |
|             | toHaveLength           | 배열의 길이를 검증                                                                                                                                   |
|             | toContainEqual         | 배열에 특정 객체가 포함되었는지 검증                                                                                                                 |
|             | arrayContaining        | 인수로 넘겨준 배열의 요소들이 모두 포함되어 있는지 검증                                                                                              |
| 객체 검증   | toMatchObject          | 인수로 넘긴 객체의 프로퍼티가 모두 존재하는지 검증                                                                                                   |
|             | toHaveProperty         | 객체에 특정 프로퍼티가 있는지 검증                                                                                                                   |
|             | objectContaining       | 객체 내 또다른 객체를 검증                                                                                                                           |

✨ Jest 공식 문서 : https://jestjs.io/docs/using-matchers

<br/>

## 🔴 `toBe` vs `toEqual` 차이점

### `toBe` (엄격한 일치 비교, `===`)

`toBe`는 엄격한 비교(strict equality, `===`)를 사용합니다. 즉, 값과 메모리 주소(객체의 참조)까지 동일해야 합니다.

🧐 **특징**

- 기본 자료형에서는 `toBe`와 `toEqual`이 동일하게 동작
- **객체(Object, Array)는 메모리 참조(레퍼런스)가 다르면 `toBe`가 실패**

🔬 **예제**

```
// 기본 자료형에서는 `toBe` 사용 가능
expect(10).toBe(10); // ✅ 통과
expect('hello').toBe('hello'); // ✅ 통과

// 객체 비교에서는 `toBe` 실패
expect({ a: 1 }).toBe({ a: 1 }); // ❌ 실패 (다른 객체)

```

{ a: 1 }과 { a: 1 }은 값이 같아 보이지만 서로 다른 메모리 주소를 가짐 → toBe는 false 반환

<br />

---

<br />

### `toEqual` (값 비교, 객체 구조 비교)

`toEqual`은 **객체나 배열을 비교할 때, 내부 값이 같으면 통과**합니다.

🧐 특징

- 객체(Object)나 배열(Array) 내부 값을 비교할 때 사용
- 재귀적으로 내부 속성을 비교하므로, 구조가 같으면 `true`

🔬 **예제**

```
// 객체 내부 값 비교
expect({ a: 1 }).toEqual({ a: 1 }); // ✅ 통과 (내용이 같음)

// 배열 내부 값 비교
expect([1, 2, 3]).toEqual([1, 2, 3]); // ✅ 통과 (내용이 같음)

```

<br/>

## 🟢 비동기 처리 테스트

Promise를 반환하는 방법

1. .then으로 전달할 함수 내에 단언문을 작성

   ```jsx
   test('비동기 테스트', () => {
     return wait(50).then((duration) => {
       expect(duration).toBe(50);
     });
   });
   ```

1. 단언문을 resolves 매처로 반환

   ```jsx
   test('비동기 테스트', () => {
     return expect(wait(50)).resolves.toBe(50);
   });
   ```

1. async/await을 활용한 작성법 → 테스트 함수 내에서 await하기

   ```jsx
   test('비동기 테스트', async () => {
     await expect(wait(50)).resolves.toBe(50);
   });
   ```

   > **🧐 return 은 필요없나요?** → async/await 키워드를 쓰면 Jest가 내부적으로 Promise를 기다려주기 때문에 return는 필요없다.

1. async/await을 활용한 작성법 → Promise 완료를 기다린 후 단언문 실행하기

   ```jsx
   test('비동기 테스트', async () => {
     expect(await wait(50)).resolves.toBe(50);
   });
   ```

<br/>

## 🟢 Reject 검증 테스트

1. Promise를 Return

   ```jsx
   test('reject 테스트', () => {
     return timeout(50).catch((duration) => {
       expect(duration).toBe(50);
     });
   });
   ```

2. rejects 매처를 사용하는 단언문을 활용 - return 활용

   ```jsx
   test('reject 테스트', () => {
     return expect(timeout(50)).rejects.toBe(50);
   });
   ```

3. rejects 매처를 사용하는 단언문을 활용 - async/await 활용

   ```jsx
   test('reject 테스트', async () => {
     await expect(timeout(50)).rejects.toBe(50);
   });
   ```

4. try-catch문 활용

   ```jsx
   test('reject 테스트', async () => {
     expect.assertions(1);

     try {
       await timeout(50);
     } catch (error) {
       expect(err).toBe(50);
     }
   });
   ```

   `expect.assertion(1);` → 실행되어야 하는 단언문의 개수를 받아 단언문이 호출됐는지 검증. assertion을 사용하지 않으면 어떠한 경우에 단언문을 하나도 실행하지 않고 성공으로 통과되는 경우가 있기 때문에 내부에 작성한 단언문을 확실히 통과하는지 더블 체크할 수 있다.
