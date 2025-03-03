## 🟢 커버리지 리포트 개요

커버리지 리포트 - 구현 코드가 얼마나 테스트됐는지 측정해 리포트를 작성하는 기능

<div align='center'>
  <img width="884" alt="image1" src="https://github.com/user-attachments/assets/7ba248af-ea53-4b76-bcb0-51c944f7f2be" />
</div>

- Stmts ( 구문 커버리지 ) - 구문 파일에 있는 모든 구문이 한번 씩 실행되었는지
- Branch ( 분기 커버리지 ) - 모든 조건 분기가 적어도 한 번은 실행되는지
- Funcs ( 함수 커버리지 ) - 모든 함수가 적어도 한 번은 호출되는지
- Lines ( 라인 커버리지 ) - 모든 라인이 적어도 한 번은 통과됐는지

<br />

## 🟢 커버리지 리포트 읽기

```tsx
// jest.config.ts
export default {
  collectCoverage: true,
  coverageDirectory: 'coverage',
};
```

`collectCoverage` - `--coverage` 옵션을 넣지 않아도 리포트가 생성

`coverageDirectory` - 리포트를 생성할 임의의 디렉토리를 입력

<br/>

### 함수의 테스트 커버리지

```tsx
import { greetByTime } from './greetByTime';

describe('greetByTime(', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.useRealTimers();
  });
  // (1) '좋은 아침입니다'를 반환하는 함수
  test("아침에는 '좋은 아침입니다'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 8, 0, 0));
    expect(greetByTime()).toBe('좋은 아침입니다');
  });
  // (2) '식사는 하셨나요'를 반환하는 함수
  test("점심에는 '식사는 하셨나요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 14, 0, 0));
    expect(greetByTime()).toBe('식사는 하셨나요');
  });
  // (3) '좋은 밤되세요'를 반환하는 함수
  test("저녁에는 '좋은 밤 되세요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 21, 0, 0));
    expect(greetByTime()).toBe('좋은 밤 되세요');
  });
});
```

`test` - 테스트를 수행한다.

`xtest` - 테스트를 수행 생략한다.

1. 1️⃣, 2️⃣, 3️⃣ 모두 xtest로 생략한 경우

<div align='center'>
  <img width="599" alt="image" src="https://github.com/user-attachments/assets/d3708540-f5d4-446b-a9e8-1287642926ca" />
</div>

2. 1️⃣ 번 테스트 케이스를 xtest로 생략한 경우

<div align='center'>
  <img width="636" alt="image" src="https://github.com/user-attachments/assets/9edbf0d6-85b9-4b80-b0c2-aaa86002cf79" />
</div>

3. 2️⃣, 3️⃣ 번 테스트 케이스를 xtest로 생략한 경우

<div align='center'>
  <img width="626" alt="image" src="https://github.com/user-attachments/assets/215012bb-7bba-46bc-bfeb-2df58ead8661" />
</div>

4. 모든 테스트 케이스를 수행하는 경우

<div align='center'>
  <img width="597" alt="image" src="https://github.com/user-attachments/assets/df34193e-ab08-4050-a367-a1b2e53be95b" />
</div>

커버리지 리포트는 구현 코드의 내부 구조를 파악해서 논리적으로 문서를 작성하는 화이트박스 테스트에서 필수적인 요소이다.

<br />

### UI 컴포넌트의 테스트 커버리지

JSX도 동일한 함수이기 때문에 구문 커버리지와 분기 커버리지를 측정할 수 있다.

<div align='center'>
  <img width="660" alt="image" src="https://github.com/user-attachments/assets/9e4c6f62-6d87-4578-afa2-9e99535acd8f" />
</div>

<br />

### 🧐 I, E 는 뭐지?

Jest 커버리지 리포트에서 제공하는 **브랜치(조건문) 커버리지 관련 표시**이다.

- **I (Implicit - 암시적)**
  - 이 코드 경로(branch)는 실행되지 않았지만, 테스트에 의해 어떤 식으로든 간접적으로 영향을 받았을 가능성이 있음.
  - 예를 들어, `if (hour < 12)`의 `true` 조건은 테스트되었지만, `else if (hour < 18)`는 실행되지 않아서 발생할 수 있음.
- **E (Explicit - 명시적)**
  - 이 코드 경로(branch)는 완전히 실행되지 않음.
  - 즉, `else if (hour < 18)`가 테스트되지 않아서 **명시적으로 커버되지 않은 상태**라는 의미.

<br />

### 🧐 왜 테스트 케이스가 실행되지 않는데 `3x` 가 실행된거지?

<div align='center'>
  <img width="599" alt="image" src="https://github.com/user-attachments/assets/08561c7d-caf8-4753-b488-f6a72c1ae927" />
</div>

모든 테스트 케이스가 생략된 경우에도 첫번째 줄은 3x로 테스트에 통과한 이력이 생긴다. ( answer by GPT… )

1. **코드 커버리지 도구의 동작 방식**
   - Jest와 같은 테스트 프레임워크에서 코드 커버리지를 측정할 때, 테스트가 실행되지 않더라도 테스트 환경에서 파일이 불러와지는 경우가 있음
   - `greetByTime.ts` 파일이 테스트 환경에서 import되었기 때문에 첫 번째 줄(`export function greetByTime()`)은 3번 실행된 것으로 기록됨.
2. **파일이 직접 실행되지 않아도 import되면 카운트됨**
   - 예를 들어, `greetByTime.ts`가 어떤 테스트 파일에서 `import`되었지만, 해당 함수가 실제로 실행되지 않았다면 `export function greetByTime()` 줄만 실행된 것으로 인식됨
   - 즉, `greetByTime` 함수 내부의 코드는 실행되지 않았지만, 모듈 자체가 로드된 횟수(3회)가 기록됨

<br />

## 🟢 커스텀 리포터

### jest-html-reporter

테스트 실행 결과를 그래프 형태로 보여준다. 검색, 정렬이 가능하다. 그 외에 실패한 테스트에 대해서 상세 정보 확인이 가능하다.
