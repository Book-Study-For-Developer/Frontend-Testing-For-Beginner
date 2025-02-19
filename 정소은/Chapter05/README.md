## 처음 시작하는 UI 컴포넌트 테스트

`npm run story book` 을 사용해 스토리북 사용

```jsx
// 테스트 성공
test("이름을 표시한다", () => {
  render(<Form name="taro" />); // Form 렌더링
  console.log(screen.getByText("taro"));
});
```

**`expect()` 없이도 테스트가 통과하거나 실패하는 이유 ➡️ JEST의 기본 동작 방식 때문** <br>

Jest는 기본적으로 **테스트 함수 내부에서 예외(에러)가 발생하면 테스트를 실패로 간주**한다.

### `screen.getByText("taro")`가 요소를 찾지 못하면 예외 발생

```tsx
test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  console.log(screen.getByText("taro")); // 요소가 없으면 테스트 실패
});

```

➡️ `screen.getByText("taro")`는 해당 텍스트를 가진 요소를 찾지 못하면 **즉시 예외를 던짐** <br>
→ Jest가 이걸 감지하고 **테스트 실패!**

---

### `expect()`가 없어도 테스트가 통과하는 경우 → 에러 없이 실행되면 성공**

- Jest는 테스트 코드가 **에러 없이 실행되면 통과된 것으로 간주**함.
- 즉, 예외가 발생하지 않는 한 Jest는 "문제 없음! ✅"이라고 생각하고 테스트를 통과시킴.

###  `expect()` 없이도 통과하는 테스트

```tsx
test("이름을 표시한다", () => {
  render(<Form name="taro" />); // 렌더링만 하고 끝남
});

```

➡️ `render(<Form name="taro" />)`만 실행하고 **아무런 예외가 발생하지 않으면 Jest는 테스트를 통과**시킴.

###  `expect()` 없이도 실패하는 경우

```tsx
test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  console.log(screen.getByText("hanako")); // "hanako"가 없으면 예외 발생 → 실패!
});

```

➡️ `"hanako"`라는 텍스트가 없으면 `screen.getByText("hanako")`가 예외를 던짐 → **테스트 실패!**

---

### 단언문 작성

`@testing-library/jest-dom` 으로 확장한 커스텀 매처를 사용한다.

```jsx
test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByText("taro")).toBeInTheDocument();
});
```

`toBeInTheDocument()` 는 해당 요소가 DOM에 존재하는가를 검증하는 커스텀 매처이다. <br>이 매처를 사용한 단언문으로 ‘Props에 넘겨준 이름(taro)이 표시됐는가’를 테스트 할 수 있다. 

테스트 파일에 `@testing-library/jest-dom` 을 명시적으로 import 하지 않아도 된다.<br> 저장소 경로에 있는 `jest.setup.ts` (모든 테스트에 적용할 설정 파일)에서 import 하고 있기 때문

### 특정 DOM 요소를 역할로 취득하기

`screen.getByRole` : 특정 DOM 요소를 역할로 취득할 수 있는 함수

```jsx
test("버튼을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

`h1 ~h6` 는 `heading`이라는 암묵적 역할을 가진다. 

`toHaveTextContent()` 로 문자 포함 여부를 검증할 수 있다.

```jsx
test("heading을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("heading")).toHaveTextContent("계정 정보");
});
```

➡️ 이처럼 테스팅 라이브러리는 암묵적 역할을 활용한 쿼리를 우선적으로 사용하도록 권장.

➡️ 역할은 웹접근성에서 필수 개념

### 이벤트 핸들러 호출

이벤트 핸들러: 어떤 입력이 발생했을 때 호출되는 함수

`fireEvent` : DOM 이벤트 발생이 가능

`toHaveBeenCalled()`: mockFn이 한 번이라도 실행되었다면 테스트를 통과시킨다.

```jsx
test("버튼을 클릭하면 이벤트 핸들러가 실행된다", () => {
  const mockFn = jest.fn();// mock 함수 생성
  render(<Form name="taro" onSubmit={mockFn} />); // Form 컴포넌트 렌더링
  fireEvent.click(screen.getByRole("button")); // 버튼 클릭 이벤트 발생
  expect(mockFn).toHaveBeenCalled(); // mockFn이 호출되었는지 검증
});

```

## 아이템 목록 UI 컴포넌트 테스트

기사 존재 여부에 따른 화면 분기 처리

### 목록에 표시된 내용 테스트

`getAllByRole()` : 지정한 역할의 모든 요소들을 얻을 수 있다

`toHaveLength(number)` : 배열 길이를 검증하는 매체

```jsx
// 원하는 수만큼 list가 표시 되었는가
test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  expect(screen.getAllByRole("listitem")).toHaveLength(3);
}); // listitem : <li> 요소
```

```jsx
//<ul> 요소가 존재하는 가 검증
test("목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
});
```

---

대상 범위를 좁혀서 검증하고 싶을 경우 `within` 을 사용

```jsx
test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />); // 컴포넌트 렌더링
  const list = screen.getByRole("list"); // <ul> 요소 찾기
  expect(list).toBeInTheDocument(); // <ul>이 존재하는지 검증
  expect(within(list).getAllByRole("listitem")).toHaveLength(3); //<ul> 내부의 <li> 개수 확인
});

```

### 목록에 표시할 내용이 없는 상황에서의 테스트

```jsx
test("목록에 표시할 데이터가 없으면 '게재된 기사가 없습니다'를 표시한다", () => {
  // 빈 배열을 items에 할당하여 목록에 표시할 데이터가 없는 상황을 재현한다.
  render(<ArticleList items={[]} />);
  // 존재하지 않을 것으로 예상하는 요소의 취득을 시도한다.
  const list = screen.queryByRole("list");
  // list가 존재하지 않는다.
  expect(list).not.toBeInTheDocument();
  // list가 null이다.
  expect(list).toBeNull();
  // '게재된 기사가 없습니다'가 표시됐는지 확인한다.
  expect(screen.getByText("게재된 기사가 없습니다")).toBeInTheDocument();
});
```

목록에 표시할 내용이 없는데 `getByRole` 를 사용할 경우 테스트가 에러가 발생되어 중단되게 된다. 
하지만 `queryByRole` 으로 테스트할 경우 에러를 발생할 경우(해당하는 요소가 없을 경우) `null` 을 반환하므로 `not.toBeInTheDocument` , `toBeNull` 로 매처를 검증할 수 있다.

### 개별 아이템 컴포넌트 테스트

`toHaveAttribute` : 속성을 조사하는 매처

```jsx
const item: ItemProps = {
  id: "howto-testing-with-typescript",
  title: "타입스크립트를 사용한 테스트 작성법",
  body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
};

test("링크에 id로 만든 URL을 표시한다", () => {
  render(<ArticleListItem {...item} />);
  // name: "더 알아보기" => 링크의 텍스트 일치하는거 찾아라.
  expect(screen.getByRole("link", { name: "더 알아보기" })).toHaveAttribute(
    "href", 
    "/articles/howto-testing-with-typescript"
  ); //링크의 href 속성 검증
});

```

---

### 💡 쿼리의 우선순위

테스트에서 요소를 찾을 때 가장 적절한 방법

**왜 "쿼리의 우선순위"가 중요할까?**

테스트 라이브러리는 **사용자 관점에서 테스트 하자 라는 것을 가지고 있다. 
그래서 웹 접근성 A11y 와 밀접한 쿼리들을 우선적으로 사용해야된다.** 

```jsx
// ❌ (CSS 클래스에 의존하기에 안좋은 방법)
screen.getByTestId("login-btn");

// ✅ (사용자가 실제로 인식할 수 있는 방법 사용)
screen.getByRole("button", { name: "로그인" });
```

`getByTestId()`는 HTML 구조가 바뀌면 깨질 가능성이 크다

`getByRole()`은 웹 접근성을 고려해 **버튼을 찾는 더 좋은 방법**

###  모두 접근 가능한 쿼리

**신체적, 정신적 특성에 차이 없이 사용자가 실제로 접근할 수 있는 방법을 최우선으로 한다.** 

`getByRole` , `getByLabelText` , `getByPlaceholderText` , `getByText` , `getByDisplayValue`

```jsx
test("로그인 버튼을 찾는다", () => {
  render(<button>로그인</button>);

  // ✅ 우선순위 높은 방법 사용
  expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument(); // 가장 권장되는 방법

  // ❌ 낮은 우선순위 방법 (가능하지만 비추천)
  expect(screen.getByText("로그인")).toBeInTheDocument();

  // 🚨 최악의 방법 (가능하면 피해야 함)
  expect(screen.getByTestId("login-btn")).toBeInTheDocument();
});
```

### 2️⃣ 시맨틱 쿼리 : 사용자에게 보이지 않는 정보로 찾는 방법

`getByAltText` , `getByTitle`

### 3️⃣ 테스트 ID

**역할이나 문자 콘텐츠를 활용한 쿼리를 사용할 수 없거나** **의도적으로 의미 부여를 피하고 싶을 때**만 사용할 것을 권장한다고 한다.

`getByTestId`

- `getByRole()`, `getByText()` 같은 방법으로 요소를 찾을 수 없다면 마지막으로 사용
- UI 변경이 많으면 깨질 가능성이 높음 → 유지보수에 취약하다!
- 정말 필요한 경우에만 `data-testid`를 사용해야 함

## 인터렉티브  UI 컴포넌트 테스트

### 접근 가능한 이름 인용하기

```tsx
export const Agreement = ({ onChange }: Props) => {
  return (
    <div>
      <legend>이용 약관 동의</legend>
      <label>
        <input type="checkbox" onChange={onChange} />
        서비스&nbsp;<a href="/terms">이용 약관</a>을 확인했으며 이에 동의합니다
      </label>
    </div>
  );
};
```

```jsx
export const Agreement = ({ onChange }: Props) => {
  return (
    <fieldset>
      <legend>이용 약관 동의</legend>
      <label>
        <input type="checkbox" onChange={onChange} />
        서비스&nbsp;<a href="/terms">이용 약관</a>을 확인했으며 이에 동의합니다
      </label>
    </fieldset>
  );
};

```

`fieldset`  는 `group`이라는  암묵적 역할을 하기 때문에 `legend` 요소로 접근되어 검증할 수 있다.
`div` 는 역할을 가지지 않기 때문에 검증하기 어려울 수 있음

```tsx
export const Agreement = ({ onChange }: Props) => {
  return (
    <div role="group" aria-labelledby="agreement-title">
      <legend>이용 약관 동의</legend>
      <label>
        <input type="checkbox" onChange={onChange} />
        서비스&nbsp;<a href="/terms">이용 약관</a>을 확인했으며 이에 동의합니다
      </label>
    </div>
  );
};
```

이런식으로 `div` 에 `role="group" aria-labelledby="agreement-title"` 를 통해 역할을 부여할 수도 있다.

하지만 `legend` 는 오직 `fieldset` 내부에서만 접근 가능한 이름을 제공한다고 한다.<br>
그래서 `legend` 에 접근할 경우 테스트 코드는 에러가 나지만 `screen.getByRole("group")` 만 존재할 경우 테스트가 통과한다.

### 체크 박스의 초기 상태 검증

`toBeChecked` : 체크 박스 상태 커스텀 매처

렌더링 직후, 체크박스 체크되지 않는 상태 → ✅ 테스트 통과

```jsx
test("체크 박스가 체크되어 있지 않습니다", () => {
  render(<Agreement />);
  expect(screen.getByRole("checkbox")).not.toBeChecked();
});
```

---

### userEvent로 문자열 입력하기

`@testing-library/user-evnet` : 실제 사용자 작동에 가깝게 입력을 재현

```
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputAccount } from "./InputAccount";

// 테스트 파일 작성 초기에 설정, user 인스턴스 생성
const user = userEvent.setup();

test("메일주소 입력란", async () => {
  render(<InputAccount />);
  // 메일주소 입력란 취득
  const textbox = screen.getByRole("textbox", { name: "메일주소" });
  const value = "taro.tanaka@example.com";
  // textbox에 value를 입력
  await user.type(textbox, value);
  // 초깃값이 입력된 폼 요소가 존재하는지 검증
  expect(screen.getByDisplayValue(value)).toBeInTheDocument();
});
```

### 비밀번호 입력하기: `getByRole("textbox")`은 `type="password"` 동작 X

```jsx
// ❌ 테스트 실패
test("비밀번호 입력란", async () => {
  render(<InputAccount />);
  const textbox = screen.getByRole("textbox", { name: "비밀번호" });
  expect(textbox).toBeInTheDocument();
});
```

```
// ✅ 테스트 통과
test("비밀번호 입력란", async () => {
  render(<InputAccount />);
  const password = screen.getByPlaceholderText("8자 이상");
  const value = "abcd1234";
  await user.type(password, value);
  expect(screen.getByDisplayValue(value)).toBeInTheDocument();
});
```

---

### 버튼 활성화 여부 테스트

활성화 여부 검증은 `toBeDisabled` 와 `toBeEnabled` 매처를 사용한다.

```jsx
test("회원가입 버튼은 비활성화 상태다", () => {
  render(<Form />);
  expect(screen.getByRole("button", { name: "회원가입" })).toBeDisabled();
});

test("이용 약관에 동의하는 체크 박스를 클릭하면 회원가입 버튼은 활성화된다", async () => {
  render(<Form />);
  await user.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled();
});
```

### form 접근 가능한 이름

`aria-labelledby` 라는 속성에 h2의 요소의 id를 지정하면 접근 가능한 이름으로 인용할 수 있다.

```jsx
<form aria-labelledby={headingId}>
      <h2 id={headingId}>신규 계정 등록</h2>
      
      
//test

test("form의 접근 가능한 이름은 heading에서 인용합니다", () => {
  render(<Form />);
  expect(
    screen.getByRole("form", { name: "신규 계정 등록" })
  ).toBeInTheDocument();
});
```

## 유틸리티 함수를 활용한 테스트

### **인터렉션을 함수화 하여 테스트하기**

입력 항목이 많은 폼같은 경우 함수화가 효과적이다.

```jsx
async function inputContactNumber(
  inputValues = {
    name: "배언수",
    phoneNumber: "000-0000-0000",
  }
) {
  await user.type(
    screen.getByRole("textbox", { name: "전화번호" }),
    inputValues.phoneNumber
  );
  await user.type(
    screen.getByRole("textbox", { name: "이름" }),
    inputValues.name
  );
  return inputValues;
}

async function inputDeliveryAddress(
  inputValues = {
    postalCode: "16397",
    prefectures: "경기도",
    municipalities: "수원시 권선구",
    streetNumber: "매곡로 67",
  }
) {
  await user.type(
    screen.getByRole("textbox", { name: "우편번호" }),
    inputValues.postalCode
  );
  await user.type(
    screen.getByRole("textbox", { name: "시/도" }),
    inputValues.prefectures
  );
  await user.type(
    screen.getByRole("textbox", { name: "시/군/구" }),
    inputValues.municipalities
  );
  await user.type(
    screen.getByRole("textbox", { name: "도로명" }),
    inputValues.streetNumber
  );
  return inputValues;
}
```

## 비동기 처리가 포함된 UI 컴포넌트 테스트

`postMyAddress(value)` : 비동기 처리 함수, 상태가 300번 이상이면 예외 발생

`postMyAddress` 의 mocking 함수 만들기

```jsx
export function mockPostMyAddress(status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyAddress")
      .mockRejectedValueOnce(httpError);
  }
  return jest
    .spyOn(Fetchers, "postMyAddress")
    .mockResolvedValueOnce(postMyAddressMock);
}
```

```jsx
test("성공하면 '등록됐습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress();
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록됐습니다")).toBeInTheDocument();
});

test("실패하면 '등록에 실패했습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress(500);
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록에 실패했습니다")).toBeInTheDocument();
});

test("유효성 검사 에러가 발생하면 '올바르지 않은 값이 포함되어 있습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillInvalidValuesAndSubmit();
  expect(screen.getByText("올바르지 않은 값이 포함되어 있습니다")).toBeInTheDocument();
});

test("원인이 명확하지 않은 에러가 발생하면 '알 수 없는 에러가 발생했습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillValuesAndSubmit();
  expect(screen.getByText("알 수 없는 에러가 발생했습니다")).toBeInTheDocument();
});
```

## UI 컴포넌트 스냅숏 테스트

UI 컴포넌트가 예기치 않게 변경됐는지 검증하고 싶을 경우 `스냅숏 테스트` 진행

### 스냅숏 기록하기

`toMatchSnapShot`을 실행하면 `__snapshots__` 디렉터리가 생성되고,

디렉터리 안에 `테스트 파일명.snap` 형식으로 파일이 저장된다. 

```jsx
test("Snapshot: 계정명인 'taro'가 표시된다", () => {
  const { container } = render(<Form name="taro" />);
  expect(container).toMatchSnapshot();
});
```

```jsx
// Jest Snapshot v1, https://goo.gl/fbAQLP

exports[`Snapshot: 계정명인 'taro'가 표시된다 1`] = `
<div>
  <form>
    <h2>
      계정 정보
    </h2>
    <p>
      taro
    </p>
    <div>
      <button>
        수정
      </button>
    </div>
  </form>
</div>
`;
```

이미 커밋된 스냅숏 파일과 현재의 스냅숏 파일을 비교하여 차이점이 발견되면 테스트가 실패된다. 

실패한 테스트를 성공시키려면 커밋된 스냅숏을 갱신해야함 

테스트 실행시,`--update Snapshot` 혹은 `u` 옵션을 추가하면 스냅숏이 갱신된다. 

```jsx
npx jest --updateSnapshot
```

## 암묵적 역할과 접근 가능한 이름

**`WAI-ARIA ( 웹 접근성 )`**

스크린 리더 같은 보조 기술이 요소의 의미를 올바르게 해석할 수 있도록 도와주는 속성이다.

**HTML 태그만으로 부족한 정보**를 보완해 **요소의 역할(role)과 접근 가능한 이름(name)을 정의**할 수 있다.

**`암묵적 역할`** 

특정 HTML 요소가 **기본적으로 가지는 역할**

**역할과 요소는 일대일로 매칭되지 않는다**

 ⇒ HTML 요소의 속성값에 따라 암묵적 역할이 변할 수 있다.

**`<input>` 요소의 `type` 속성**

```html
<input type="text" />   //role="textbox"
<input type="password" /> //role="textbox" 아님 (보조기술에서 다르게 인식됨) 
<input type="checkbox" /> // role="checkbox"
<input type="radio" />    //role="radio"

```

- **같은 `<input>`이지만 `type` 값에 따라 암묵적 역할이 달라짐**

- **`type="password"`은 `textbox` 역할이 아니므로 `getByRole("textbox")`로 찾을 수 없음**

---

**`aria-role` 으로역할 변경**

```html
<div role="button">클릭</div> //스크린 리더가 버튼으로 인식
```

`<div>`는 기본적으로 역할❌ , `role="button"`을 추가하면 버튼으로 인식

---

**`getByRole`로 요소 찾기**

여러 개의 같은 역할(role)이 존재하는 경우

```jsx
// heading 역할을 가진 요소가 여러 개 있는 경우
<h1>제목1</h1>
<h2>제목2</h2>
```

 `screen.getByRole("heading")`을 실행하면 어떤 요소를 가져올지 모호해서 **테스트가 실패할 수 있다**

---

**접근 가능한 이름을 활용해 요소 찾기**

`getByRole()` 사용 시 `{ name: "텍스트" }` 옵션을 추가하면 **특정 요소만 정확히 찾을 수 있음**

```jsx
screen.getByRole("button", { name: "전송" });
```

---

**역할과 접근 가능한 이름을 확인하는 방법**

`logRoles()` 

: 테스트 중 역할과 접근 가능한 이름을 확인하는 함수,콘솔에 요소의 역할과 접근 가능한 이름이 출력된다,

```jsx
test("역할 확인", () => {
  const { container } = render(<button>전송</button>);
  logRoles(container);
});
```