## 테스트 구성 요소

> [!NOTE]
>
> #### AAA 패턴
>
> - Arrange(환경) : 테스트 환경 설정
> - Act(동작) : 테스트 대상 코드를 호출하거나 실행
> - Assert(검증) : 동작 단계에서 실행한 코드의 결과를 검증하고 예상한 대로 동작하는지 확인
>
> ```tsx
> test('두 숫자를 더한 값을 반환해야 한다.', () => {
>   // Arrange (준비)
>   const a = 2
>   const b = 3
>
>   // Act (실행)
>   const result = sum(a, b)
>
>   // Assert (검증)
>   expect(result).toBe(5)
> })
> ```

### `test`

- 테스트는 Jest가 제공하는 API인 `test` 함수로 정의

```tsx
test(name, fn, timeout)
```

- `name`: 테스트명
- `fn`: 실행할 테스트 함수
- `timeout`: 테스트가 완료될 때까지 기다리는 최대 시간 (기본값 5000ms)

> [!NOTE]
>
> #### `test`와 `it`
>
> 테스트 코드 경험은 많이 없지만 둘 중 `it`을 주로 써왔는데
> 책 예제 코드를 실습하면서 `test`로 쓰게 되었다.
> 두 함수의 동작이 동일하다고 알고 있었지만, 구현도 완전히 동일한지 궁금해서 찾아보았다.
>
> 🤔 둘이 진짜 같은 걸까?
>
> - 소스 코드: [Global.ts](https://github.com/jestjs/jest/blob/dc9f98cae4ee990f77e92ebf186948ca4983a61a/packages/jest-types/src/Global.ts#L160)
> - 동일한 인터페이스(`ItConcurrent`) 사용
>
> ```tsx
> export interface TestFrameworkGlobals {
>  it: ItConcurrent;
>  test: ItConcurrent;
>  fit: ItBase & {concurrent?: ItConcurrentBase};
>  xit: ItBase;
>  xtest: ItBase;
>  describe: Describe;
>  xdescribe: DescribeBase;
>  fdescribe: DescribeBase;
>  beforeAll: HookBase;
>  beforeEach: HookBase;
>  afterEach: HookBase;
>  afterAll: HookBase;
> ```
>
> 🤔 둘 중 어떤 게 먼저 나왔을까?
>
> 공식문서에도 `test` 하위에 짤막하게 설명되어 있어 `it`이 나중에 나왔을 것 같았지만 먼저 나왔다고 한다.
> (실제로 두 함수 모두 `it`을 공유)
> Jasmine, Mocha 등 먼저 나온 테스트 프레임워크가 따르는 BDD(Behavior Driven Development) 스타일을 그대로 차용하여 만들어진 뒤, Jest 팀에서 `test`를 별칭으로 추가했다고 한다.
>
> - 관련 내용: [Releases/v13.1.0](https://github.com/jestjs/jest/releases/tag/v13.1.0)

> [!TIP]
>
> #### `only`, `skip`, `todo`
>
> - `test.each(table)(name, fn, timeout)`: 다른 테스트 데이터로 동일한 테스트 케이스를 반복 실행할 때 사용
> - `test.only(name, fn, timeout)`: 특정 테스트 코드만 실행하고 싶을 때 사용
> - `test.skip(name, fn, timeout)`: 테스트 코드를 삭제하지 않고 테스트 실행을 건너뛸 때 사용
> - `test.todo(name)`: 구현 예정인 테스트 코드를 미리 작성할 때 사용
>   - 콜백 함수를 전달하면 에러가 발생하므로, 테스트를 이미 구현했지만 실행하지 않으려면 `test.skip`을 사용
>
> 좀 더 자세한 내용은 공식 문서 [Globals](https://jestjs.io/docs/api) 참고

### `expect`

- `test` 함수의 두 번째 인수인 테스트 함수에 단언문을 작성할 때 사용
- 단언문
  - 검증값이 기댓값과 일치하는지 검증
  - `expect` 함수와 이에 덧붙이는 매처(matcher)로 구성

```tsx
expect(receivedValue)
```

- 단언문: `expect(검증값).toBe(기댓값)`
- 매처: `toBe(기댓값)`

### `describe`

- 연관성 있는 테스트들을 그룹화하고 싶을 때 사용
- `describe` 함수는 중첩이 가능

```tsx
describe(name, fn)
```

- `name`: 테스트 그룹명
- `fn`: 테스트 그룹에 포함된 테스트들을 정의하는 함수

## 조건 분기

- `add` 함수에 반환값의 상한(`100`) 추가

```tsx
export function add(a: number, b: number) {
  const sum = a + b
  if (sum > 100) {
    return 100
  }
  return sum
}
```

- 테스트는 통과하지만 이해할 수 없는 테스트명 → `70 + 80`이 `100`이 된다

```tsx
test('70 + 80은 100', () => {
  expect(add(70, 80)).toBe(100)
})
```

- `test` 함수를 사용할 때는 테스트 코드가 어떤 의도로 작성됐으며, 어떤 작업이 포함됐는지 테스트명으로 명확하게 표현해야 함

```tsx
describe('add', () => {
  test('반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다', () => {
    expect(add(50, 50)).toBe(100)
  })
  test("반환값의 상한은 '100'이다", () => {
    expect(add(70, 80)).toBe(100)
  })
})
```

## 에지 케이스와 예외 처리

- 모듈이 예외 처리를 했다면 예상하지 못한 입력값을 받았을 때 실행 중인 디버거로 문제를 빨리 발견할 수 있음
- 정적 타입을 붙이는 것만으로 부족할 때(_특정 범위로 입력값을 제한하는 경우_) → 런타임에 예외를 발생시키는 처리 추가
- 예외 처리용 매처 → `.toThrow()`

### 테스트 대상 함수

```tsx
export class HttpError extends Error {}
export class RangeError extends Error {}

function checkRange(value: number) {
  if (value < 0 || value > 100) {
    throw new RangeError('0〜100 사이의 값을 입력해주세요')
  }
}

export function add(a: number, b: number) {
  checkRange(a)
  checkRange(b)
  const sum = a + b
  if (sum > 100) {
    return 100
  }
  return sum
}

export function sub(a: number, b: number) {
  checkRange(a)
  checkRange(b)
  const sum = a - b
  if (sum < 0) {
    return 0
  }
  return sum
}
```

### 테스트 코드

```tsx
describe('사칙연산', () => {
  describe('add', () => {
    test('반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다', () => {
      expect(add(50, 50)).toBe(100)
    })
    test("반환값의 상한은 '100'이다", () => {
      expect(add(70, 80)).toBe(100)
    })
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      const message = '0〜100 사이의 값을 입력해주세요'
      expect(() => add(-10, 10)).toThrow(message)
      expect(() => add(10, -10)).toThrow(message)
      expect(() => add(-10, 110)).toThrow(message)
    })
  })
  describe('sub', () => {
    test('반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다', () => {
      expect(sub(51, 50)).toBe(1)
    })
    test("반환값의 하한은 '0'이다", () => {
      expect(sub(70, 80)).toBe(0)
    })
    test("인수가 '0~100'의 범위밖이면 예외가 발생한다", () => {
      expect(() => sub(-10, 10)).toThrow(RangeError)
      expect(() => sub(10, -10)).toThrow(RangeError)
      expect(() => sub(-10, 110)).toThrow(Error)
    })
  })
})
```

## 용도별 매처

- 공식문서: [Matchers](https://jestjs.io/docs/expect#matchers)

### 진릿값 검증

- `toBeTruthy`
- `toBeFalsy`
- `toBeNull`
- `toBeUndefined`

### 수치 검증

- `toBeGreaterThan`
- `toBeGreaterThanOrEqual`
- `toBeLessThan`
- `toBeLessThanOrEqual`
- `toBeCloseTo`

### 문자열 검증

- `toContain`
- `toMatch`
- `toHaveLength`
- `expect.stringContaining`
- `expect.stringMatching`

### 배열 검증

- `toContain`
- `toHaveLength`
- `toContainEqual`
- `expect.arrayContaining`

### 객체 검증

- `toMatchObject`
- `toHaveProperty`
- `expect.objectContaining`

## 비동기 처리 테스트

```tsx
export function wait(duration: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(duration)
    }, duration)
  })
}
```

### `Promise`를 반환하는 작성법

- `Promise`를 반환하면서 `then`에 전달할 함수에 단언문을 작성하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', () => {
  return wait(50).then(duration => {
    expect(duration).toBe(50)
  })
})
```

- `resolves` 매처를 사용하는 단언문을 반환하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', () => {
  return expect(wait(50)).resolves.toBe(50)
})
```

### `async/await`를 활용한 작성법

> `async/await` 함수를 사용하면 비동기 처리가 포함된 단언문이 여럿일 때 한 개의 테스트 함수 내에서 정리할 수 있는 장점이 있다!

- 테스트 함수를 `async` 함수로 만들고 함수 내에서 `Promise`가 완료될 때까지 기다리는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', async () => {
  await expect(wait(50)).resolves.toBe(50)
})
```

- 검증값이 `Promise`가 완료되는 것을 기다린 뒤 단언문을 실행하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다', async () => {
  expect(await wait(50)).resolves.toBe(50)
})
```

### `Reject` 검증 테스트

```tsx
export function timeout(duration: number) {
  return new Promise((_, reject) => {
    setTimeout(() => {
      reject(duration)
    }, duration)
  })
}
```

- `Promise`를 return 하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', () => {
  return timeout(50).catch(duration => {
    expect(duration).toBe(50)
  })
})
```

- `rejects` 매처를 사용하는 단언문을 활용하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', () => {
  return expect(timeout(50)).rejects.toBe(50)
})

test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  await expect(timeout(50)).rejects.toBe(50)
})
```

- `try-catch` 문을 사용하는 방법

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  expect.assertions(1)
  try {
    await timeout(50) // Unhandled Rejection을 발생
  } catch (err) {
    expect(err).toBe(50) // 발생한 오류를 단언문으로 검증
  }
})
```

### 테스트 결과가 기댓값과 일치하는지 확인하기

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  try {
    await wait(50)
  } catch (err) {
    expect(err).toBe(50) // 실행되지 않는다
  }
})
```

- `expect.assertions`
  - 실행되어야 하는 단언문의 횟수를 인수로 받아 기대한 횟수만큼 단언문이 호출되었는지 검증

```tsx
test('지정 시간을 기다린 뒤 경과 시간과 함께 reject된다', async () => {
  expect.assertions(1)
  try {
    await wait(50)
  } catch (err) {
    expect(err).toBe(50) // 실행되지 않는다
  }
})
```

- 테스트 함수가 동기 함수라면 반드시 단언문을 반환해야 함

```tsx
test('return하고 있지 않으므로 Promise가 완료되기 전에 테스트가 종료된다', () => {
  return expect(wait(2000)).resolves.toBe(3000)
})
```

- 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 `async` 함수로 만든다.
- `.resolves`나 `.rejects`가 포함된 단언문은 `await`한다.
- `try-catch` 문의 예외 발생을 검증할 때는 `expect.assertions`를 사용한다.
