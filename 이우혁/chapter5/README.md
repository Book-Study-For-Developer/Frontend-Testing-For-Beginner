### 대표적인 UI 컴포넌트 기능

- 데이터를 렌더링하는 기술
- 사용자의 입력을 전달하는 기능
- 웹 API와 연동하는 기능
- 데이터를 동적으로 변경하는 기능

이 기능들은 테스트 프레임워크와 라이브러리를 통해 `의도한 대로 작동하고 있는가` 와 `문제가 생긴 부분은 없는가` 를 확인해야 한다.

---

### 웹 접근성 테스트

디자인 대로 화면이 구현됐고, 마우스 입력에 따라 정상적으로 작동한다면 품질에 문제가 없다고 생각하기 때문에 웹 접근성은 의도적으로 신경 써야만 알 수 있는 부분이다.

→ 많은 사람들이 웹 접근성을 준수하지 않는 대표적인 예시가 `체크 박스` 이다.

```jsx
<>
  <input type="checkbox" id="checkbox"/>
  <label htmlFor="checkbox" className="custom-checkbox"/>
</>

/* 기존 체크 박스는 제거 하고 커스텀 체크 박스의 스타일링을 한다.
이런 방식을 사용하면 스크린 리더와 같은 보조 기술을 사용하는 사람들은
이 체크박스의 존재를 인식할 수 없는 문제가 있다. */

input[type="checkbox"] {
	display: none; // 또는 visibility: hidden
}

.custom-checkbox {
  // 커스텀 체크박스 스타일링
}
```

> [!TIP]
>
> 💡 스크린 리더에는 읽히지만 화면에 안보이게 css 스타일링 하기
>
> - `display: none` , `visibility: hidden` : 스크린 리더가 인식하지 못함
>
> ```jsx
> .sr-only {
>   position: absolute; // 요소를 문서 흐름에서 완전히 제거
>   height: 1px; // 요소를 최소한의 크기로 설정
>   width: 1px; // 스크린 리더의 가상 커서가 최소 1px를 필요로 함
>   clip: rect(0, 0, 0, 0); // 요소를 화면에서 완전히 잘라내어 보이지 않게 만듬
>   clip-path: inset(50%); // 요소의 50%를 안쪽에서 잘라내어 시각적으로 숨김
> }
> ```

---

### UI 컴포넌트 테스트 환경 구축

UI를 렌더링하고 조작하려면 DOM API가 필요하지만 Jest가 동작하는 환경은 Node.js 환경이기 때문에 DOM API를 공식적으로 지원하지 않는다.

이 문제를 해결하려면 <a href="https://github.com/jsdom/jsdom">`jsdom`</a> 이 필요하다.

이전 버전의 jest에서는 `testEnvironment: "jsdom"` 을 설정해주면 되지만 최신 버전의 jest에서는 `jsdom` 을 개선한 `testEnvironment: "jest-environment-jsdom"` 을 설정해줘야 한다.

```jsx
// 이전 버전
module.exports = {
  testEnvironment: "jsdom",
};

// 최신 버전
module.exports = {
  testEnvironment: "jest-environment-jsdom",
};
```

`Next.js`와 같이 서버와 클라이언트 코드가 공존하는 경우에는 테스트 파일 첫 줄에 다음과 같은 주석을 작성해 파일 별로 다른 테스트 환경을 사용할 수 있도록 설정할 수 있다.

```jsx
/**
 * @jest-environment jest-environment-jsdom
 */
```

---

## 테스팅 라이브러리

UI 컴포넌트를 리액트로 만들고 있다면 `@testing-library/react` 를 사용해야 한다.

테스팅 라이브러리는 리액트 외의 다른 UI 라이브러리를 위한 테스트 라이브러리도 제공된다.

이러한 라이브러리들은 공통적으로 `@testing-library/dom` 을 코어로 사용한다.

> `@testing-library/dom` 은 `@testing-library/react` 가 의존하는 패키지라 별도의 설치 X

---

### UI 컴포넌트 테스트용 매처 확장

jest와 단언문과 매처를 UI 테스트에도 사용할 수 있지만 DOM 상태를 검증하기에는 부족해 `@testing-library/jest-dom` 을 사용한다.

---

### 사용자 입력 시뮬레이션

문자 입력 등의 이벤트를 위해 `fireEvent API`를 제공하지만 `fireEvent API` 는 DOM 이벤트를 발생시킬 뿐이기 때문에 `실제 사용자라면 불가능한 입력 패턴`을 만들기도 한다.

따라서 실제 사용자 입력에 가깝게 테스트가 가능한 `@testing-library/user-event` 를 추가로 사용하는 것이 좋다.

> [!CAUTION]
> 🤷‍♂️ `실제 사용자라면 불가능한 입력 패턴`이라는게 뭘까?
>
> ```jsx
> // fireEvent를 사용한 테스트
> fireEvent.change(input, { target: { value: "hello" } });
> ```
>
> 위 코드는 한 번에 `hello` 라는 값을 입력하지만 실제 사용자는 아래와 같은 플로우를 가지게 된다.
>
> - 글자를 한 글자씩 입력
> - keyDown, keyPress, keyUp 이벤트가 순차적으로 발생
> - input 이벤트가 각 키 입력마다 발생
> - change 이벤트는 입력이 완료되고 포커스가 빠져나갈 때 발생
>
> 이러한 문제를 해결하고자 Testing Library는 `userEvent`를 제공한다.
>
> - userEvent를 사용한 모든 인터랙션은 입력이 완료될 때까지 기다려야 하는 비동기 처리이다.
>
> ```jsx
> // userEvent를 사용한 더 현실적인 테스트
> await userEvent.type(input, "hello");
> ```

---

### 특정 DOM 요소 취득하기

`screen.getByText` : 일치하는 문자열을 가진 한 개의 텍스트 요소를 찾는 API, 요소를 발견하면 해당 요소의 참조를 취득할 수 있다.

만약 요소를 찾지 못하면 에러가 발생하고 테스트는 실패한다.

---

### 특정 DOM 요소를 역할로 취득하기

`screen.getByRole` : 특정 DOM 요소를 역할로 취득할 수 있는 API

```jsx
test("버튼을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

아래 코드는 `<input type="password"/>` 가 `textbox`라는 역할을 가지지 않기 때문에 에러가 발생한다.

```tsx
test("비밀번호 입력란", async () => {
  render(<InputAccount />);
  const textbox = screen.getByRole("textbox", { name: "비밀번호" });
  expect(textbox).toBeInTheDocument();
});
```

HTML 요소는 할당된 속성에 따라 암묵적 역할이 변하기도 하는데 `<input type="radio"/>` 가 대표적인 예시이다. `textbox` 라는 역할 대신 `radio` 라는 역할을 한다.

이처럼 HTML 요소와 역할이 항상 일치하지 않다는 점을 주의해야 한다.

> [!TIP] > **암묵적 역할(Implicit Role)**
>
> HTML 요소들은 명시적으로 role 속성을 지정하지 않아도 기본적으로 가지고 있는 역할이 있다.
>
> - `<button>` → button
> - `<h1> ~ <h6>` → heading
> - `<input type="text">` → textBox

---

### 이벤트 핸들러 호출 테스트

테스트 환경에서는 버튼 클릭과 같은 사용자 인터렉션을 발생시킬 수 없기 때문에 `fireEvent` 를 사용하여 임의의 DOM 이벤트 발생을 시킨다.

```jsx
test("버튼을 클릭하면 이벤트 핸들러가 실행된다", () => {
  const mockFn = jest.fn();
  render(<Form name="taro" onSubmit={mockFn} />);
  fireEvent.click(screen.getByRole("button"));
  expect(mockFn).toHaveBeenCalled();
});
```

---

### 목록에 표시할 내용이 없는 상황에서의 테스트

`getBy~` 는 존재하지 않는 요소의 취득을 시도하면 에러가 발생하지만, `queryBy~` 를 사용하면 존재하지 않음을 테스트 할 수 있다.

---

### 모든 테스트에 적용할 설정 파일

아래와 같이 설정하면 모든 파일에서 `@testing-library/jest-dom` 와 `react` 가 import 되기 때문에 별도의 import 문을 선언하지 않아도 된다.

```jsx
// jest.setup,ts
import "@testing-library/jest-dom";
import React from "react";

global.React = React;
```

---

### 스냅샷 갱신하기

```jsx
npx jest --updateSnapshot
```
