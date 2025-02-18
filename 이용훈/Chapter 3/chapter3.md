# Chapter 3. 처음 시작하는 단위 테스트

### 3.5.3 예외 발생 검증 테스트

```tsx
// ❌잘못된 작성법
test("잘못된 작성법", () => {
  expect(add(-10, 110)).toThrow();
});
```

```tsx
// ✅올바른 작성법
test("올바른 작성법", () => {
  expect(() => add(-10, 110)).toThrow();
});
```

첫 번째 코드가 잘못된 이유는 **`expect(add(-10, 110))`에서 `add(-10, 110)`가 즉시 실행**되기 때문이다. 테스트에서는 **함수를 실행하는 것이 아니라, "실행했을 때 예외가 발생하는지"를 확인해야한다**

---

## 3.7 비동기 처리 테스트

### 3.7.2 Promise를 반환하는 작성법

- **첫 번째 방법)** 테스트 함수(=`test` 함수의 두 번째 인자) 내부에서 `Promise` 인스턴스를 반환
    
    Jest는 테스트 대상 함수가 `Promise`를 리턴하면 Jest는 해당 프로미스가 resolve될 때까지 기다린다(출처: [Jest Docs - Testing Asynchronous Code.Promises](https://jestjs.io/docs/asynchronous#promises))
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve 된다", () => {
      return (
        wait(500)  // wait 함수가 resolve할 때까지 테스트를 유예한다
      )
    })
    ```
    
    위의 코드에서 테스트 대상인 `wait` 함수는 `Promise` 인스턴스를 반환하고, 이 인스턴스를 `test`의 콜백 함수 내부에서 한 번 더 반환하고 있다. 이렇게 되면 Jest는 `wait` 함수가 resolve할 때까지 테스트를 유예한다
    
    이 상태에서 테스트를 수행하고 싶다면:
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve 된다", () => {
      return (
        wait(500)
          .then(duration => expect(duration).toBe(500))
      )
    })
    ```
    
    위와 같이 `wait` 함수가 반환하는 `Promise` 인스턴스에 대해 `.then()`을 사용하여, resolve시 테스트를 수행할 수 있다
    
- **두 번째 방법)** 테스트 함수 내부에서 `resolves` 매처를 사용하는 단언문을 반환
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve 된다", () => {
      return (
        expect(wait(500)).resolves.toBe(500)
      )
    })
    ```
    
    첫 번째 방법보다 간편하다
    

### 3.7.3 async/await를 활용한 작성법

- **세 번째 방법)** `await`로 단언문 수행
    
    테스트 함수를 `async` 함수로 만들고, 테스트 함수 내부에서 `Promise`가 완료될 때까지 기다리는 방법이다. `resolves` 매처를 사용하는 단언문도 `await`로 대기시킬 수 있다:
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve 된다", async () => {
      await expect(wait(500)).resolves.toBe(500)
    })
    ```
    
- **네 번째 방법)** `Promise`가 완료되는 것을 기다린 뒤 단언문을 실행
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 resolve 된다", async () => {
      const result = await wait(500);  // Promise가 완료될 때까지 await로 기다린다
      expect(result).toBe(500);
    })
    ```
    

### 3.7.4 Reject 검증 테스트

- **첫 번째 방법)** `then`대신 `catch` 사용
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject 된다", () => {
      return (
        timeout(500)
          .catch(duration => expect(duration).toBe(500))
      )
    })
    ```
    
- **두 번째 방법)** `resolves`매처 대신 `rejects` 매처 사용
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject 된다", () => {
      return (
        expect(timeout(500)).rejects.toBe(500)
      )
    })
    ```
    
- **세 번째 방법)** `try-catch` 문 사용
    
    테스트 함수를 `async` 함수로 만들고, unhandled rejection을 `try` 블록에서 발생시키고 발생한 오류를 `catch` 블록에서 받아 단언문으로 검증한다:
    
    ```tsx
    test("지정 시간을 기다린 뒤 경과 시간과 함께 reject 된다", async () => {
      try {
        await timeout(50)
      } catch (err) {
        expect(err).toBe(50)
      }
    })
    ```
    

### 3.7.5 테스트 결과가 기대값과 일치하는지 확인하기

```tsx
// ❌잘못 작성된 테스트: pass 하면 안되지만 pass한다
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  try {
    await wait(50); // timeout 함수를 사용할 생각이었는데 실수로 wait을 사용했다
    // 에러가 발생하지 않으므로 여기서 종료되면서 테스트는 성공한다
  } catch (err) {
    // 단언문은 실행되지 않는다
    expect(err).toBe(50);
  }
});
```

위와 같은 실수를 하지 않으려면 테스트 함수 첫 줄에 `expect.assertions()`를 호출해야한다. 이 메소드는 실행되어야하는 단언문의 횟수를 인수로 받아 기대한 횟수만큼 단언문이 호출됐는지 검증한다:

```tsx
// ✅의도대로 작성된 테스트
test("지정 시간을 기다린 뒤 경과 시간과 함께 reject된다", async () => {
  expect.assertions(1); // 단언문이 한 번 실행되는 것을 기대하는 테스트가 된다
  try {
    await wait(50);
    // 단언문이 한 번도 실행되지 않은채로 종료되므로 테스트는 실패한다
  } catch (err) {
    expect(err).toBe(50);
  }
});
```

비동기 처리 테스트를 할 때는 첫 번째 줄에 `expect.assertions()`를 추가하면 사소한 실수를 줄일 수 있다

특히 비동기 처리를 테스트할 때 테스트 함수가 동기 함수라면 반드시 단언문을 `return`해야 한다:

```tsx
// ❌잘못 작성된 테스트
test("return하고 있지 않으므로 Promise가 완료되기 전에 테스트가 종료된다", () => {
  expect(wait(2000)).resolves.toBe(3000)  // 실패하기를 기대하는데 실패하지않는다
})
```

테스트에 따라서는 단언문을 여러 번 작성해야 할 때가 있는데, 단언문을 여러 번 작성하다 보면 `return`하는 것을 잊기 쉽다. 이 같은 실수를 하지 않으려면 비동기 처리가 포함된 부분을 테스트할 때 다음과 같은 원칙을 가지고 접근해야 한다:

- 비동기 처리가 포함된 부분을 테스트할 때는 테스트 함수를 `async` 함수로 만든다
- `.resolves`나 `.rejects`가 포함된 단언문은 `await`한다
- `try-catch`문의 예외 발생을 검증할 때는 `expect.assertions()`를 사용한다