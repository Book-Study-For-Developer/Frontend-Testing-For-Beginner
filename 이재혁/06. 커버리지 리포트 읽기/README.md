# 6. 커버리지 리포트 읽기

## 1. 커버리지 리포트 개요

- 커버리지 리포트 - 구현 코드가 얼마나 테스트됐는지 측정한 리포트
- 화이트박스 테스트 - 구현 코드의 내부 구조를 파악하여 논리적으로 문서를 작성하는 테스트 방법
- 기존 스크립트에 `--coverage` 옵션을 붙여 테스트하면 된다.

![image](https://github.com/user-attachments/assets/48290bb2-4457-4d44-b0fe-5aa8b526b9a5)

테이블 Row가 나타내는 항목들

| File   | Stmts         | Branch        | Funcs         | Lines         | Uncovered Line     |
| ------ | ------------- | ------------- | ------------- | ------------- | ------------------ |
| 파일명 | 구문 커버리지 | 분기 커버리지 | 함수 커버리지 | 라인 커버리지 | 커버되지 않은 라인 |

1. Stmts - 구현 파일에 있는 모든 구문이 적어도 한 번은 실행됐는가
2. Branch - 구현 파일에 있는 모든 조건 분기가 적어도 한 번은 실행됐는가 (커버리지를 정량 지표로 활용시 핵심 지표)
3. Funcs - 구현 파일에 있는 모든 함수가 적어도 한 번은 호출됐는가 (미사용 export 함수)
4. Lines - 구현 파일에 포함된 모든 라인이 적어도 한 번은 통과됐는가

> [!NOTE]
>
> 💡 구문과 함수
> 구문(Statements)은:
>
> - 프로그램에서 실행 가능한 최소 단위의 독립적인 코드 조각이다
> - 변수 선언, 할당문, 조건문, 반복문, 함수 호출 등 모든 실행 가능한 코드 라인을 포함한다
> - 함수 내부와 외부에 있는 모든 실행 가능한 코드를 포함한다
>   예시로 설명하면:
>
> ```jsx
> let x = 5; // Statement 1
> const y = x + 3; // Statement 2
>
> function calculate() {
>   // Function declaration
>   if (x > 0) {
>     // Statement 3
>     return x + y; // Statement 4
>   }
>   return y; // Statement 5
> }
> ```
>
> 이 코드에서:
>
> - 구문(Statements) 커버리지는 5개의 모든 실행 가능한 라인이 실행되었는지 확인한다
> - 함수(Functions) 커버리지는 `calculate` 함수가 호출되었는지만 확인한다
>   주요 차이점:
>
> 1. 범위의 차이
>    - 구문은 모든 실행 가능한 코드 라인을 포함
>    - 함수는 함수 단위의 호출만 체크
> 2. 세분화 정도
>    - 구문은 더 세밀한 단위로 커버리지를 체크
>    - 함수는 함수 호출 여부만 확인하므로 상대적으로 덜 세밀함
> 3. 용도
>    - 구문 커버리지는 코드의 모든 부분이 실행되었는지 상세히 확인할 때 유용
>    - 함수 커버리지는 미사용 함수나 데드코드 탐지에 유용
>      이러한 차이로 인해 100% 함수 커버리지가 달성되어도 구문 커버리지는 100%가 아닐 수 있다
>      함수가 호출되었더라도 함수 내부의 모든 구문이 실행되지 않았을 수 있기 때문이다

## 2. 커버리지 리포트 읽기

HTML로 리포트를 뽑아보자

```tsx
// jest.config.ts

export default {
  collectCoverage: true, // <- 옵션 추가
  coverageDirectory: "coverage", // <- 생성 루트 디렉토리
};
```

그러면 생성 시에`unittest/coverage/lcov-report/06/index.html` 경로에 파일이 생성된다

<img width="1799" alt="image 1" src="https://github.com/user-attachments/assets/ff2bb15c-14ed-450d-a030-8da7916aa6ed" />

### 1. Articles.tsx

<img width="640" alt="image 2" src="https://github.com/user-attachments/assets/f7c90988-73dc-40b8-8ec7-fd196efd7321" />

- `isLoading`에 대한 테스트 불충분 - TC`"데이터를 불러오는 중이면 '..loading'을 표시한다"`
- `itmes.length`가 없을 경우에 대한 테스트 불충분- TC `목록이 비어 있으면 '게재된 기사가 없습니다'를 표시한다`

### 2. greetByTimes.ts

<img width="635" alt="image 3" src="https://github.com/user-attachments/assets/4f6e99e2-9e87-416c-9728-79cb510d957f" />

1. `hour < 18` 조건에 대한 테스트 불충분 - TC `점심에는 '식사는 하셨나요'를 반환한다"`
2. 위 두 분기에 해당하지 않은 경우에 대한 테스트 불충분 - TC `저녁에는 '좋은 밤 되세요'를 반환한다`
