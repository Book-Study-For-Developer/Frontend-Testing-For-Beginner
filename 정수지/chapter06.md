# 커버리지 리포트 개요

- 커버리지 리포트 : 테스트 프레임워크 내 구현 코드가 얼마나 테스트됐는지 측정해 리포트를 작성하는 기능

## 커버리지 리포트 출력하기

```bash
$ npx jest --coverage
```

```bash
------------------------------|---------|----------|---------|---------|---------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
------------------------------|---------|----------|---------|---------|---------
All files          |   90.52 |    80.43 |   89.89 |   90.72 |
 03/02             |     100 |      100 |     100 |     100 |
  index.ts         |     100 |      100 |     100 |     100 |
------------------------------|---------|----------|---------|---------|---------
Test Suites: 29 passed, 29 total
Tests:       4 skipped, 122 passed, 126 total
Snapshots:   9 passed, 9 total
Time:        5.294 s
```

- Stmts : 구문 커버리지
  구현 파일에 있는 모든 구문이 적어도 한 번은 실행되었는가?
- Branch : 분기 커버리지 [핵심지표]
  구현 파일에 있는 모든 조건 분기가 적어도 한 번은 실행되었는가?
  → if문, case문, 삼항연산자를 사용한 분기가 측정 대상
- Funcs : 함수 커버리지
  구현 파일에 있는 모든 함수가 적어도 한 번은 호출됐는지 나타냄
  프로젝트에서 실제로 사용하지 않지만 export 된 함수를 찾는다.
- Lines : 라인 커버리지
  구현 파일에 포함된 모든 라인이 적어도 한 번은 통과됐는지 나타냄

⇒ 커버리지를 더 높이고 싶다면 함수 커버리지와 분기 커버리지에 중점을 두자.

# 커버리지 리포트 읽기

- CLI에서 리포트를 확인할 수도 HTML로도 리포트를 생성하는 기능도 있음
- jest.config.ts
  ```tsx
  export default {
    // 생략
    collectCoverage: true,
    coverageDirectory: "coverage",
  };
  ```
  테스트 실행 후 open coverage/lcov-report/index.html을 실행하면 브라우저가 열리면서 화면이 나타남
  - 녹색 : 테스트 충분
  - 노란색, 빨간색 : 테스트 불충분
- test에 x를 붙여 **xtest**로 만들면 실행을 생략할 수 있음
  - 해당 경우 화면을 확인하면 해당 라인이 빨간색으로 칠해진 것을 확인할 수 있음
- 라인 옆 6x 문자는 해당 라인이 테스트에서 통과된 횟수를 나타냄
- 커버리지 리포트는 구현 코드의 내부 구조를 파악해 논리적으로 문서를 작성하는 테스트 방법인 화이트박스 테스트에 필수

## UI 컴포넌트의 테스트 커버리지

- JSX도 하나의 함수이므로 구문 커버리지와 분기 커버리지를 측정할 수 있음
- 커버리지는 객관적인 측정이 가능한 정량 지표
  - 프로젝트에 따라 필수로 충족시켜야 하는 품질 기준으로 사용되기도 함
    ex) 분기 커버리지가 80% 이상이 아니면 CI를 통과하지 못한다.
  - 커버리지 수치가 높다고 버그가 없다는 것을 보장해주지는 않음
  - 커버리지 수치가 낮다는 것은 테스트가 부족하다는 신호
  - 특정 파일에 테스트를 추가해야하는지 검토하는 계기로 활용됨
  - ESLint를 통과했지만 남은 중복 코드를 발견하는데에도 유용함

## 커스텀 리포터

- 테스트 실행 결과는 여러 리포트를 통해 확인할 수 있음
  - jest.config.ts에 선호하는 리포터를 추가
    ```tsx
    export default {
      clearMocks: true,
      collectCoverage: true,
      coverageDirectory: "coverage",
      moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
      testEnvironment: "jest-environment-jsdom",
      transform: { "^.+\\.(ts|tsx)$": ["esbuild-jest", { sourcemap: true }] },
      setupFilesAfterEnv: ["./jest.setup.ts"],
      **reporters: [
        "default",
        [
          "jest-html-reporters",
          {
            publicPath: "__reports__",
            filename: "jest.html",
          },
        ],
      ],**
    };
    ```
    - jest-html-reporters : 테스트 실행 결과를 그래프 형태로 보여줌, 시간이 많이 걸리는 텍스트 찾거나 정렬 기능이 있어 편함
      → 프로젝트 폴더의 `__reports__/jest.html` 을 실행해서 확인 가능
    - 특색 있는 기능을 가진 리포터도 많음 (참고 : https://github.com/jest-community/awesome-jest/blob/main/README.md#reporters)
