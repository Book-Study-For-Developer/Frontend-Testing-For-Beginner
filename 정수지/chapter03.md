# 단위 테스트

## 환경 설정

- JEST
  - 간단한 설정만으로 사용 가능, 목 객체와 코드 커버리지 수집 기능을 갖춤
  - Meta의 오픈소스

<br/>

## 테스트 구현

- 테스트는 구현 파일이 아닌 별도의 파일을 만들어 테스트 대상을 불러와서 테스트한다.

  - 구현 파일명.ts / 구현 파일명.test.ts로 명명함
  - 반드시 같은 구현 파일과 같은 디렉터리에 둘 필요는 없음
  - 저장소 최상위에 `__test__`라는 디렉터리를 만들고 이 디렉터리 안에 있는 테스트 파일들을 테스트하는 방식도 많이 사용함

- test 함수로 정의
  - 2개의 매개변수(테스트명, 테스트 함수)를 받음
    - 테스트명 : 테스트의 내용을 잘 나타내는 제목을 할당
    - 테스트 함수 : 단언문(검증값이 기댓값과 일치하는지 검증하는 문) 작성
- 단언문

  - expect 함수와 함께 이에 덧붙이는 matcher(매처)로 구성됨

    ```typescript
    expect(검증값).toBe(기댓값);
    ```

- 테스트 그룹 작성

  - 연관성 있는 테스트들을 그룹화하고 싶은 경우 `describe` 함수 사용
  - test 함수는 중첩이 불가능하지만, describe 함수는 중첩이 가능하다.

    ```
    PASS  src/03/04/index.test.ts
      사칙연산
        add
          ✓ 반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다 (2 ms)
          ✓ 반환값의 상한은 '100'이다
        sub
          ✓ 반환값은 첫 번째 매개변수에서 두 번째 매개변수를 뺀 값이다
          ✓ 반환값의 하한은 '0'이다 (1 ms)
    ```

    _+. 테스트 실행 결과도 위와 같이 describe로 구분되어 나온다._

<br/>

## 테스트 실행

1. package.json 내 npm script를 `"test": "jest"` 추가 후 `npm test` 명령어로 실행

   - `npm test src/03/02`, `npm test src/03/02.index.test.ts`로 영역을 한정지어 실행 가능

2. 확장 프로그램 `Jest Runner`로 실행

모든 테스트를 실행하고 싶을 때는 1번이 편하고, 특정 테스트를 실행하고 싶다면 2번이 편하다.

<br/>

## 테스트 실행 결과 확인

- PASS: 테스트 통과
- FAIL: 테스트 실패
- 테스트가 완료되면 테스트 결과 개요가 테미널에 출력됨

<br/>

## 조건 분기

- 테스트명을 이해할 수 있게 작성해야한다.

  ```plaintext
  잘못된 예시
  ✓ 50 + 50은 100 (1 ms)
  ✓ 70 + 80은 100

  올바른 예시
  ✓ 반환값은 첫 번째 매개변수와 두 번째 매개변수를 더한 값이다
  ✓ 반환값의 상한은 '100'이다 (1 ms)
  ```

- 덧셈의 결과가 100을 넘는 경우 100이 출력되는 함수인 경우인데 70 + 80은 100이라고 적는다면 추후 작업자 본인이 추후 해당 테스트 결과를 보더라도 이해하기 어렵다. 때문에 테스트 코드가 어떤 의도로 작성되었으며, 어떤 작업이 포함됐는지 테스트명으로 명확하게 표현해야 한다.

<br/>

## 엣지 케이스와 예외처리

1. 타입스크립트로 입력값 제약 설정 (ex. 매개변수에 타입 애너테이션 붙이기)

2. 예외 발생시키기 (ex. `throw new Error()`)

   - 예외 발생 여부를 테스트하기 위해서는 [toThrow](https://jestjs.io/docs/expect#tothrowerror) 키워드를 사용한다.
     _+. alias로 toThrowError를 사용할 수도 있음_
   - 예외 발생을 검증하는 단언문을 작성할 때는 화살표 함수로 감싸서 작성한다. 화살표 함수를 사용하면 함수에서 예외가 발생하는지 검증할 수 있다.
     _+. 왜 화살표 함수를 사용해야할까?_
     `expect(add(-10, 110)).toThrow();`와 같이 작성하게 되면 add(-10, 100) 함수가 즉시 실행된다. 만약 add가 예외를 던진다면, Jest의 expect()가 실행되기도 전에 예외가 발생해 테스트 자체가 깨지게 된다. 때문에 `expect(() => add(-10, 110)).toThrow();` 이렇게 화살표 함수를 통해 함수를 전달하게 되면 Jest는 함수 자체를 받게되고, 내부적으로 실행하면서 예외 발생 여부를 감지하게 된다. - 오류 메세지를 활용해 세부 사항을 검증할 수 있다. 단순 `toThrow()`가 아니라 `toThrow("오류 메세지")`로 입력하게 된다면 오류 메세지가 기댓값과 일치하는지 검증할 수 있다.

- 의도적으로 예외를 발생시키기도 하지만 의도치 않은 버그가 생겨 발생할 때도 있다. 의도한 대로 예외가 발생하고 있는가? 라는 관점으로 접근하면 더욱 좋은 테스트 코드를 작성할 수 있다.

3. `instanceof` 연산자를 활용해 다른 인스턴스와 구분할 수 있다.

   - Error를 extends 키워드로 상속받은 경우 instanceof 연산자를 사용해서 다른 인스턴스와 구분할 수 있다.
   - toThrow 키워드를 통해 Error의 인스턴스를 확인할 수 있다. `.toThrow(RangeError)`

4. 용도별 매처

   - 진리값 매처

     - `toBeTruthy()`는 true인 값과 일치하는 매쳐, `toBeFalsy()`는 false인 값과 일치하는 매처
       - 각 매처앞에 `.not`을 추가하면 진릿값을 반전시킬 수 있다.
       - `expect(1).toBeTruthy()`, `expect('').not.toBeTruthy()`
     - `toBeNull()`, `toBeUndefined()`, `toBeDefined()`

   - 수치 검증

     - 등가 비교 : `toBe()`, `toEqual()`
     - 대소 비교 : `toBeGreaterThan()`, `toBeGreaterThanOrEqual()`, `toBeLessThan()`, `toBeLessThanOrEqual()`
     - 소숫값 검증 : `toBeCloseTo()`
       - 자바스크립트는 소수 계산에 오차가 있기 때문
       - `toBeCloseTo(0.3, 15)`로 두번째 인수에는 몇 자릿수까지 비교할 것인지 지정도 가능
     - 문자열 검증 : 등가 비교에 사용하는 매처, `toContain()` 일부가 일치하는지 확인하는 매처, `toMatch()` 정규 표현식으로 검증하는 매처, `toHaveLength()` 문자열 길이를 검증하는 매처, `stringContaining()` 및 `stringMatching()`은 객체에 포함된 문자열을 검증할 때 사용

       ```JavaScript
         const str = "Hello World"
         const obj = {status: 200, message: str}

         test("stringContaining", () => {
           expect(obj).toEqual({
             status: 200,
             **message: expect.stringContaining("World")**
           })
         })

         test("stringContaining", () => {
           expect(obj).toEqual({
             status: 200,
             **message: expect.stringMatching(/World/)**
           })
         })
       ```

   - 배열 검증

     - `toContain()` : 원시형인 특정 값 포함 여부 확인
     - `toHaveLength()` : 배열의 길이 검증
     - `toContainEqual()` : 배열에 특정 객체가 포함됐는지 확인
     - `arrayContaining()` : 인수로 넘겨준 배열의 요소들이 전부 포함되어있는지
       - ex. `expect(articles).toEqual(expect.arrayContaining([article1, article2]))`
       - 사실 `toEqual()`로 확인할 수 있지만, 이 경우 순서와 요소 개수가 정확히 일치해야함

   - 객체 검증
     - `toMatchObject()` : 부분적으로 일치해도 성공
     - `toHaveProperty()` : 객체에 특정 프로퍼티가 있는지 검증
     - `objectContaining()` : 객체 내 또 다른 객체 검증시 사용 (부분적으로 일치해도 성공)

## 비동기 처리 케이스

- Promise를 반환하는 작성법
  - Promise를 반환하면서 then에 전달할 함수에 단언문을 작성하는 방법
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
      return wait(50).then((duration) => {
        expect(duration).toBe(50);
      });
    });
    ```
  - resolves 매처를 사용하는 단언문을 return 하는 방법
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", () => {
      return expect(wait(50)).resolves.toBe(50);
    });
    ```
- async/await 작성법
  - 비동기 처리가 포함된 단언문이 여럿일 때 한 개의 테스트 함수 내에서 정리할 수 있는 장점이 있음
  - 테스트 함수를 async 함수로 만들고 함수 내에서 Promise가 완료될 때까지 기다리는 방법
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
      await expect(wait(50)).resolves.toBe(50);
    });
    ```
  - Promise가 완료되는 것을 기다린 뒤 단언문을 실행하는 것
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve된다", async () => {
      expect(await wait(50)).toBe(50);
    });
    ```
- Reject 검증 테스트

  - Promise를 return 하는 방법
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
      return timeout(50).catch((duration) => {
        expect(duration).toBe(50);
      })
    });
    ```
  - rejects 매처를 사용하는 단언문을 활용 (단언문 return)
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", () => {
      return expect(timeout(50)).rejects.toBe(50);
    });
    ```
  - rejects 매처를 사용하는 단언문을 활용 (async/await 활용)
    ```JavaScript
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
      await expect(timeout(50)).rejects.toBe(50);
    });
    ```
  - try-catch 문을 사용하는 방법

    ```JavaScript
      test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
        expect.assertions(1);
        try {
          await timeout(50);
        } catch (e) {
          expect(e).toBe(50);
        }
      });
    ```

- 테스트 결과가 기댓값과 일치하는지 확인하기
  - [expect.assertions()](https://jestjs.io/docs/expect#expectassertionsnumber) : 실행되는 단언문의 횟수를 인수로 받아 기대한 횟수만큼 단언문이 호출됐는지 검증
    _+. 우선 어설션은 역설이라는 뜻으로 프로그램 변수 값이 예상한 것과 같은지 확인하는 데 사용되는 디버깅 문을 의미한다._
    _+. expect.assertions()은 주로 비동기에서 테스트 중에 특정 수의 어설션이 호출되는지 확인하는데 사용된다. 주로 비동기 테스트에서 expect가 실행되지 않는 문제 방지, 조건문으로 인해 expect가 실행되지 않는 경우 방지, 테스트 코드가 변경되었을 때 예상되는 expect 개수를 보장하기 위해 사용된다._
- 비동기 처리 테스트를할 때 테스트 함수가 동기 함수라면 반드시 단언문을 return 해야 한다.
- 실수를 방지하기 위해 아래와 같은 비동기 테스트 처리 원칙을 가지고 접근해야한다.
  - 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 async 함수로 만든다.
  - .resolves, .rejects가 포함된 단언문은 await한다.
  - try-catch 문의 예외 발생을 검증할 때는 expect.assertions를 사용한다.
