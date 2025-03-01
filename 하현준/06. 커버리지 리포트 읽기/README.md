## 커버리지 리포트

코드가 얼마나 테스트됐는지 측정해 리포트를 작성하는 기능이 있는데 이를 **커버리지 리포트**라고 한다.

![image](https://github.com/user-attachments/assets/fd48fdbc-60ef-4d37-8439-940293085aa3)

### 커버리지 리포트 구성

- **Stmts(구문 커버리지)**
  - 구현 파일에 있는 **모든 구문이 적어도 한 번은 실행**됐는지 나타내는 수치
- **Branch(분기 커버리지)**
  - **모든 조건 분기가 적어도 한 번**은 실행됐는지 나타내는 수치
- **Funcs(함수 커버리지)**
  - **모든 함수가 적어도 한 번**은 실행됐는지 나타내는 수치
- **Lines(라인 커버리지)**
  - **모든 라인이 적어도 한 번**은 통과됐는지 나타내는 값

### 커버리지 리포트 파일

```tsx
{
  collectCoverage: false,
  coverageDirectory: "coverage",
}
```

리포트 파일에 대한 설정을 하고 실행하면 아래와 같은 파일을 볼 수 있다.

![image](https://github.com/user-attachments/assets/1f2db6d3-a162-4ae6-abab-a9461360f11d)

- 녹색: 테스트가 충분
- 노랑/빨강: 테스트가 불충분

```tsx
describe("greetByTime(", () => {
  // ...
  // xtest로 구문을 작성하면 테스트를 스킵한다.
  xtest("저녁에는 '좋은 밤 되세요'를 반환한다", () => {
    jest.setSystemTime(new Date(2023, 4, 23, 21, 0, 0));
    expect(greetByTime()).toBe("좋은 밤 되세요");
  });
  // ...
});
```

이와 같이 커버리지를 측정하여 기준을 정할 수 있다.

ex) ‘커버리지가 80% 이상이 아니면 CI를 통과하지 못한다’

→ 커버리지 수치가 높다고 반드시 품질이 높은 것은 아님, 버그가 없다는 것을 보장하지 않음

## 커스텀 리포터

`jest-htm-reporters` 를 활용하여 테스트의 리포트를 편하게 확인 할 수 있다.

![image](https://github.com/user-attachments/assets/b8788294-819a-492a-aa45-1f1f94620816)

xtest로 작성된건 다음과 같이 pending 형태로 표현된다.

![image](https://github.com/user-attachments/assets/65165769-edda-4fe3-aa05-e5cbdf17cef8)

실패한 테스트에 대해서도 모두 표현을 해준다.
