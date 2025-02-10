## 🎯 목 객체(Mock Object)를 사용하는 이유

테스트가 실제 환경과 유사하면 재현성이 높다. 하지만 **테스트 환경과 웹 API 서버를 연동하는 것은 바람직하지 않다.**  
테스트 대상이 데이터를 처리하는 로직이라면, API 서버 연동 과정은 불필요하다.  
이때 API 요청을 대신할 **목 객체(Mock Object)** 를 사용하면 효과적인 테스트가 가능하다.

## 🛠 목 객체 용어 정리

### 1️⃣ **스텁 (STUB)**

- 의존 중인 컴포넌트의 대역을 담당.
- 정해진 값을 반환하는 용도.
- 주로 **테스트 대상에 할당하는 입력값을 제공**하는 역할.

### 2️⃣ **스파이 (SPY)**

- 함수나 메서드 호출 기록을 추적.
- 호출 횟수, 사용한 인수 등을 기록.
- **콜백 함수 실행 횟수 및 사용된 인자를 검증할 때 활용.**

<br />

## 🎯 모듈을 스텁으로 대체하기

### 🎯 모듈 전체를 스텁으로 대체하기

```tsx
import { greet, sayGoodBye } from './greet';

// jest.mock()을 사용하여 테스트에 필요한 모듈을 대체
jest.mock('./greet', () => ({
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));

test('인사말이 구현되지 않음(원래 구현과 다르게)', () => {
  expect(greet).toBe(undefined);
});

test('작별 인사를 반환(원래 구현과 다르게)', () => {
  const message = `${sayGoodBye('Taro')} See you.`;
  expect(message).toBe('Good bye, Taro. See you.');
});
```

### 🎯 모듈 일부만 스텁으로 대체하기

```tsx
jest.mock('./greet', () => ({
  ...jest.requireActual('./greet'), // 원래 모듈을 유지
  sayGoodBye: (name: string) => `Good bye, ${name}.`,
}));
```

<br />

## 🌍 웹 API 목 객체 기초

간단한 API를 통해서 해당 부분만 실습을 진행하였습니다.

https://codesandbox.io/p/sandbox/test-with-mock-w8tvwj

<br/>

## 🕒 현재 시각에 의존하는 테스트 (Fake Timer)

Jest의 가짜 타이머(fake timer)를 사용하면 **현재 시간을 조작하여 테스트를 실행**할 수 있음.

### **가짜 타이머 설정**

```tsx
jest.useFakeTimers(); // 가짜 타이머 활성화
jest.setSystemTime(new Date('2025-01-01')); // 특정 시간 설정
```

### **실제 타이머 복구**

```tsx
jest.useRealTimers(); // 실제 타이머로 복원
```

<br/>

## ✅ **테스트 사전 설정 / 복구 메서드**

테스트 실행 전후로 특정 로직을 실행할 수 있음.

| 메서드       | 설명                           |
| ------------ | ------------------------------ |
| `beforeAll`  | 모든 테스트 실행 전에 1회 실행 |
| `beforeEach` | 각 테스트 실행 전에 실행       |
| `afterEach`  | 각 테스트 실행 후 실행         |
| `afterAll`   | 모든 테스트 실행 후 1회 실행   |
