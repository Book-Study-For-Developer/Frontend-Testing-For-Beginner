## 목 객체를 사용하는 이유

환경 구축이 어려운 웹 API 등을 데이터 대역으로 사용하여 효율적인 테스트 환경 구축

### 목 객체 용어

#### 스텁(stub)

> 주로 **대역**으로 사용

- 의존 중인 컴포넌트의 대역
- 정해진 값을 반환하는 용도
- 테스트 대상에 할당하는 입력값
- 테스트 대상이 의존 중인 컴포넌트애 테스트하기 어려운 부분이 있을 때 사용
- 웹 API에 의존 중인 대상을 테스트하는 경우 사용 → 웹 API에 이런 값을 반환받았을 때 이렇게 작동해야 한다
- 테스트 대상이 스텁에 접근하면 스텁은 정해진 값을 반환

#### 스파이(spy)

> 주로 **기록**하는 용도

- 함수나 메서드의 호출 기록
- 호출된 횟수나 실행 시 사용한 인수 기록
- 테스트 대상의 출력 확인
- 테스트 대상 외부의 출력을 검증할 때 사용
- 콜백 함수 검증 시 주로 사용 → 실행된 횟수, 실행 시 사용한 인수 등을 기록하여 의도대로 호출이 됐는지 검증 가능

## 목 모듈을 활용한 스텁

- Jest의 목 모듈로 의존 중인 모듈의 스텁을 만드는 방법
- 단위 테스트나 통합 테스트를 실시할 때 구현이 완성되어 있지 않거나 수정이 필요한 모듈에 의존 중인 경우 해당 모듈로 대체하면 테스트할 수 없었던 대상을 테스트할 수 있음

```tsx
export function greet(name: string) {
  return `Hello! ${name}.`
}

export function sayGoodBye(name: string) {
  throw new Error('미구현')
}
```

### 일반적인 테스트

```tsx
import { greet } from './greet'

test('인사말을 반환한다(원래 구현대로)', () => {
  expect(greet('Taro')).toBe('Hello! Taro.')
})
```

- `jest.mock`이 테스트할 모듈을 대체하면서 `greet` 함수 호출 시 `undefined`를 반환

```tsx
import { greet } from './greet'

jest.mock('./greet')

test('인사말을 반환하지 않는다(원래 구현과 다르게)', () => {
  expect(greet('Taro')).toBe(undefined)
})
```

### 모듈을 스텁으로 대체하기

- `jest.mock(moduleName, factory, options)`
  - `moduleName`: 모킹할 모듈의 경로
  - `factory`: 대체할 함수
  - `options`: 모킹 동작을 제어하는 추가적인 설정

```tsx
import { greet, sayGoodBye } from './greet'

jest.mock('./greet', () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}))

test('인사말이 구현되어 있지 않다(원래 구현과 다르게)', () => {
  expect(greet).toBe(undefined)
})

test('작별 인사를 반환한다(원래 구현과 다르게)', () => {
  const message = `${sayGoodBye('Taro')} See you.`
  expect(message).toBe('Good bye, Taro. See you.')
})
```

- 이때, 대체한 함수에 `greet` 함수를 구현하지 않았기 때문에 `undefined`로 반환됨

> 일부만 모킹하고 나머지는 원래 구현대로 사용하고 싶다면? → `jest.requireActual`

### 모듈 일부를 스텁으로 대체하기

- 모듈의 일부만 모킹하고 나머지는 원본을 유지하는 방법
- `jest.requireActual(modulName)`을 사용하여 실제 모듈의 나머지 기능을 유지 가능

```tsx
import { greet, sayGoodBye } from './greet'

jest.mock('./greet', () => ({
  ...jest.requireActual('./greet'),
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}))

test('인사말을 반환한다(원래 구현대로)', () => {
  expect(greet('Taro')).toBe('Hello! Taro.')
})

test('작별 인사를 반환한다(원래 구현과 다르게)', () => {
  const message = `${sayGoodBye('Taro')} See you.`
  expect(message).toBe('Good bye, Taro. See you.')
})
```

### 라이브러리 대체하기

- [next-router-mock](https://www.npmjs.com/package/next-router-mock)
- 즉시 로드하여 사용하는 방법

```tsx
jest.mock('next/router', () => require('next-router-mock'))
```

- 테스트 파일에서 라이브러리 대체하는 방법

```tsx
jest.mock('next/router', () => jest.requireActual('next-router-mock'))
```

## 웹 API 목 객체 기초

- fetch API를 사용하여 로그인한 사용자의 프로필 정보를 취득하는 웹 API 클라이언트

```tsx
export type Profile = {
  id: string
  name?: string
  age?: number
  email: string
}

export function getMyProfile(): Promise<Profile> {
  return fetch('https://myapi.testing.com/my/profile').then(async res => {
    const data = await res.json()
    if (!res.ok) {
      throw data
    }
    return data
  })
}
```

- 로그인된 사용자에 인사말을 반환하는 함수 → `data.name`에 따라 반환값이 다르게 분기 처리

```tsx
import { getMyProfile } from '../fetchers'

export async function getGreet() {
  const data = await getMyProfile()
  if (!data.name) {
    return `Hello, anonymous user!`
  }
  return `Hello, ${data.name}!`
}
```

- 테스트 하고자 하는 부분
  - `const data = await getMyProfile` → 데이터 취득 여부
  - `if (!data.name)` → 취득한 데이터 사용 가능 여부

### 웹 API 클라이언트 스텁 구현

```tsx
import * as Fetchers from '../fetchers'

jest.mock('../fetchers')
```

### 데이터 취득 성공을 재현한 테스트

- 데이터 취득이 성공했을 때(`resolve`) 응답으로 기대하는 객체를 `mockResolvedValueOnce`에 지정
- `getGreet`는 사용자 이름이 없는 경우와 / 있는 경우의 테스트를

```tsx
test('데이터 취득 성공 시 : 사용자 이름이 없는 경우', async () => {
  jest.spyOn(Fetchers, 'getMyProfile').mockResolvedValueOnce({
    id: 'xxxxxxx-123456',
    email: 'taroyamada@myapi.testing.com',
  })

  await expect(getGreet()).resolves.toBe('Hello, anonymous user!')
})
```

```tsx
test('데이터 취득 성공 시 : 사용자 이름이 있는 경우', async () => {
  jest.spyOn(Fetchers, 'getMyProfile').mockResolvedValueOnce({
    id: 'xxxxxxx-123456',
    email: 'taroyamada@myapi.testing.com',
    name: 'taroyamada',
  })

  await expect(getGreet()).resolves.toBe('Hello, taroyamada!')
})
```

### 데이터 취득 실패를 재현한 테스트

- `getMyProfile` 함수가 데이터 취득을 실패하는 경우

```tsx
export function getMyProfile(): Promise<Profile> {
  return fetch('https://myapi.testing.com/my/profile').then(async res => {
    const data = await res.json()
    if (!res.ok) {
      throw data // 200번대 외의 응답인 경우
    }
    return data
  })
}
```

- 에러 객체

```tsx
export const httpError: HTTPError = {
  err: { message: 'internal server error' },
}
```

- 에러 객체를 `mockRejectedValueOnce()` 인수로 `getMyProfile` 함수의 `reject`를 재현하는 스텁 구현

```tsx
test('데이터 취득 실패 시', async () => {
  jest.spyOn(Fetchers, 'getMyProfile').mockRejectedValueOnce(httpError)
  await expect(getGreet()).rejects.toMatchObject({
    // rejects 시 에러 객체와 매치하는지 확인하는 단언
    err: { message: 'internal server error' },
  })
})
```

- 예외가 발생하고 있는지 `try-catch`로 검증

```tsx
test('데이터 취득 실패 시 오류가 발생한 데이터와 함께 예외가 throw된다', async () => {
  expect.assertions(1) // 단언문이 1회 발생하도록
  jest.spyOn(Fetchers, 'getMyProfile').mockRejectedValueOnce(httpError)
  try {
    await getGreet()
  } catch (err) {
    expect(err).toMatchObject(httpError)
  }
})
```

## 웹 API 목 객체 생성 함수

### 테스트 대상 함수

```tsx
import { getMyArticles } from '../fetchers'

export async function getMyArticleLinksByCategory(category: string) {
  const data = await getMyArticles()

  const articles = data.articles.filter(article => article.tags.includes(category))
  if (!articles.length) {
    return null
  }

  return articles.map(article => ({
    title: article.title,
    link: `/articles/${article.id}`,
  }))
}
```

- `getMyArticleLinksByCategory`
  - 지정한 태그를 가진 기사가 한 건도 없으면 `null`을 반환한다.
  - 지정한 태그를 가진 기사가 한 건 이상 있으면 링크 목록을 반환한다.
  - 데이터 취득에 실패하면 예외가 발생한다.

### 응답 데이터를 대체하는 목 객체 생성 함수

- 테스트 픽스처(fixture): 테스트 대상 시스템을 실행하기 위해 해줘야 하는 모든 것

```tsx
export const getMyArticlesData: Articles = {
  articles: [
    {
      id: 'howto-testing-with-typescript',
      createdAt: '2022-07-19T22:38:41.005Z',
      tags: ['testing'],
      title: '타입스크립트를 사용한 테스트 작성법',
      body: '테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다',
    },
    {
      id: 'nextjs-link-component',
      createdAt: '2022-07-19T22:38:41.005Z',
      tags: ['nextjs'],
      title: 'Next.js의 링크 컴포넌트',
      body: 'Next.js는 화면을 이동할 때 링크 컴포넌트를 사용한다',
    },
    {
      id: 'react-component-testing-with-jest',
      createdAt: '2022-07-19T22:38:41.005Z',
      tags: ['testing', 'react'],
      title: '제스트로 시작하는 리액트 컴포넌트 테스트',
      body: '제스트는 단위 테스트처럼 UI 컴포넌트를 테스트할 수 있다',
    },
  ],
}
```

- 목 객체 생성 함수

```tsx
function mockGetMYArticle(status = 200) {
  if (status > 299) {
    return jest.spyOn(Fetchers, 'getMyArticles').mockRejectedValueOnce(httpError)
  }

  return jest.spyOn(Fetchers, 'getMyArticles').mockResolvedValueOnce(getMyArticlesData)
}
```

### 데이터 취득 성공을 재현한 테스트

```tsx
test('지정한 태그를 포함한 기사가 한 건도 없으면 null을 반환한다.', async () => {
  mockGetMYArticle()
  const data = await getMyArticleLinksByCategory('playwright')
  expect(data).toBe(null)
})
```

```tsx
test('지정한 태그를 포함한 기사가 한 건 이상 있으면 링크 목록을 반환한다.', async () => {
  mockGetMyArticles()
  const data = await getMyArticleLinksByCategory('testing')
  expect(data).toMatchObject([
    {
      title: '타입스크립트를 사용한 테스트 작성법',
      link: '/articles/howto-testing-with-typescript',
    },
    {
      title: '제스트로 시작하는 리액트 컴포넌트 테스트',
      link: '/articles/react-component-testing-with-jest',
    },
  ])
})
```

### 데이터 취득 실패를 재현한 테스트

```tsx
test('데이터 취득에 실패하면 reject된다', async () => {
  mockGetMyArticles(500)
  await getMyArticleLinksByCategory('testing').catch(err => {
    expect(err).toMatchObject({
      err: { message: 'internal server error' },
    })
  })
})
```

## 목 함수를 사용하는 스파이

- `jest.fn()`을 사용해서 목 함수 작성
- `toBeCalled()`: 실행 여부 검증
- `toHaveBeenCalledTimes()`: 실행 횟수 검증
- `toHaveBeenCalledWith()`: 실행 시 인수 검증

### 스파이로 활용하는 방법

```tsx
export function greet(name: string, callback?: (message: string) => void) {
  callback?.(`Hello! ${name}`)
}
```

- 콜백 함수를 실행했을 때 인수 검증

```tsx
test('목 함수를 테스트 대상의 인수로 사용할 수 있다', () => {
  const mockFn = jest.fn()
  greet('Jiro', mockFn)
  expect(mockFn).toHaveBeenCalledWith('Hello! Jiro')
})
```

### 실행 시 인수가 객체일 때의 검증

- 인수가 문자열 같은 원시형이 아닌 배열이나 객체일 때도 검증 가능
- config 객체를 정의한 후 checkConfig 함수가 config를 콜백 함수의 인수로 넘겨 실행하는 코드

```tsx
const config = {
  mock: true,
  feature: { spy: true },
}

export function checkConfig(callback?: (payload: object) => void) {
  callback?.(config)
}
```

```tsx
test('목 함수는 실행 시 인수가 객체일 때에도 검증할 수 있다.', () => {
  const mockFn = jest.fn()
  checkConfig(mockFn)
  expect(mockFn).toHaveBeenCalledWith({
    mock: true,
    feature: { spy: true },
  })
})
```

- 여기서 객체가 너무 클 경우 `expect.objectContaining`으로 객체의 일부 검증

```tsx
test('expect.objectContaining를 사용한 부분 검증', () => {
  const mockFn = jest.fn()
  checkConfig(mockFn)
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining({ feature: { spy: true } }))
})
```

## 웹 API 목 객체의 세부 사항

- 입력값을 검증한 응답 데이터를 교체하는 목 객체 구현 방법

```tsx
export class ValidationError extends Error {}

export function checkLength(value: string) {
  if (value.length === 0) {
    throw new ValidationError('한 글자 이상의 문자를 입력해주세요')
  }
}
```

### 목 객체 생성 함수 만들기

```tsx
function mockPostArticle(input: ArticleInput, status = 200) {
  if (status > 299) {
    return jest.spyOn(Fetchers, 'postMyArticle').mockRejectedValueOnce(httpError)
  }

  try {
    checkLength(input.title)
    checkLength(input.body)
    return jest
      .spyOn(Fetchers, 'postMyArticle')
      .mockResolvedValue({ ...postMyArticleData, ...input })
  } catch (err) {
    return jest.spyOn(Fetchers, 'postMyArticle').mockRejectedValueOnce(httpError)
  }
}
```

### 테스트 준비

- 입력으로 보낼 값을 동적으로 생성하는 팩토리 함수 만들기
  - 기본적으로 유효성 검사를 통과하는 내용 반환
  - 필요에 따라 인수를 넘겨서 유효성 검사를 통과하지 못하는 내용으로 덮어써서 반환 가능

```tsx
function inputFactory(input?: Partial<ArticleInput>) {
  return {
    tags: ['testing'],
    title: '타입스크립트를 사용한 테스트 작성법',
    body: '테스트 작성 시 타입스크립트를 사용하면 테스트의 유지보수가 쉬워진다',
    ...input,
  }
}
```

### 유효성 검사 성공 재현 테스트

```tsx
test('유효성 검사에 성공하면 성공 응답을 반환한다', async () => {
  const input = inputFactory()
  const mock = mockPostArticle(input)
  const data = await postMyArticle(input)
  expect(data).toMatchObject(expect.objectContaining(input))
  expect(mock).toHaveBeenCalled()
})
```

### 유효성 검사 실패 재현 테스트

```tsx
test('유효성 검사에 실패하면 reject된다', async () => {
  expect.assertions(2)
  const input = inputFactory({ title: '', body: '' })
  const mock = mockPostArticle(input)
  await postMyArticle(input).catch(err => {
    expect(err).toMatchObject({ err: { message: expect.anything() } })
    expect(mock).toHaveBeenCalled()
  })
})
```

### 데이터 취득 실패 재현 테스트

```tsx
test('데이터 취득에 실패하면 reject된다', async () => {
  expect.assertions(2)
  const input = inputFactory()
  const mock = mockPostArticle(input, 500)
  await postMyArticle(input).catch(err => {
    expect(err).toMatchObject({ err: { message: expect.anything() } })
    expect(mock).toHaveBeenCalled()
  })
})
```

## 현재 시각에 의존하는 테스트

### 현재 시각 고정하기

- `jest.useFakeTimers`: 가짜 타이머 함수
- `jest.setSystemTime`: 가짜 타이머에서 사용할 현재 시각을 설정하는 함수
- `jest.useRealTimers`: 실제 타이머 함수

### 테스트 전/후 처리

- 설정(setup): 테스트 실행 전에 특정 동작을 수행

  - `beforeEach` → 반복 실행
  - `beforeAll` → 한 번만 실행

- 파기(teardown): 테스트가 끝난 후 특정 정리 작업을 수행
  - `afterEach` → 반복 실행
  - `afterAll` → 한 번만 실행

```tsx
beforeAll(() => console.log('1 - beforeAll'))
afterAll(() => console.log('1 - afterAll'))
beforeEach(() => console.log('1 - beforeEach'))
afterEach(() => console.log('1 - afterEach'))

test('', () => console.log('1 - test'))

describe('Scoped / Nested block', () => {
  beforeAll(() => console.log('2 - beforeAll'))
  afterAll(() => console.log('2 - afterAll'))
  beforeEach(() => console.log('2 - beforeEach'))
  afterEach(() => console.log('2 - afterEach'))

  test('', () => console.log('2 - test'))
})

// 1 - beforeAll
// 1 - beforeEach
// 1 - test
// 1 - afterEach
// 2 - beforeAll
// 1 - beforeEach
// 2 - beforeEach
// 2 - test
// 2 - afterEach
// 1 - afterEach
// 2 - afterAll
// 1 - afterAll
```
