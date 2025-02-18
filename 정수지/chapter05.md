부제 : UI 컴포넌트를 테스트할 때 중점을 어디에 두어야 하는가?

- 목차

---

# UI 컴포넌트 테스트 기초 지식

## MPA와 SPA의 차이점

### MPA(multi-page application)

- 여러 HTML 페이지와 HTTP 요청으로 만들어진 웹 애플리케이션
- 과거의 웹 애플리케이션 방식, 페이지 요청 단위에 기반하여 사용자와 대화하는 방식으로 개발

### SPA(single-page application)

- 한개의 HTML 페이지에서 개발하는 웹 애플리케이션
- 웹 서버가 응답으로 보낸 최초의 HTML 페이지를 사용자 입력에 따라 부분적으로 HTML을 변경함
  부분적으로 변경할 때 주요 대상이 되는 단위가 UI 컴포넌트

화면을 이동할 때,

- MPA는 페이지가 새로고침되어 HTML을 서버에서 받아와 전체 페이지를 다시 렌더링함
- SPA는 초기 HTML을 로드한 후, 추가적인 데이터는 JSON 등으로 서버에서 받아와 변경된 부분만 JavaScript를 통해 갱신하는 구조
  → 사용자의 입력에 따라 필요한 최소한의 데이터만 취득해 화면을 갱신
  → 필요한 만큼만 데이터를 받기 때문에 응답이 빠르고, 데이터 취득에 사용되는 리소스 부담도 줄일 수 있어 백엔드에도 간접적인 영향을 미침

## UI 컴포넌트 테스트

최소 단위의 UI (ex. 버튼) → 중간 크기의 UI → 화면 단위의 UI → 애플리케이션으로 조합된 UI

### **UI 컴포넌트 테스트가 필요한 이유**

하위 단계(ex. 중간 크기의 UI 컴포넌트)의 UI 컴포넌트에 문제가 생기면 최악의 경우 페이지 전체에 문제가 생겨 애플리케이션을 사용하지 못하게 될 수 있기 때문

### **대표적인 UI 컴포넌트 기능**

- 데이터 렌더링
- 사용자의 입력 전달
- 웹 API와 연동
- 데이터를 동적으로 변경하는 기능

→ 위 기능들은 테스트 프레임워크와 라이브러리를 사용해 **의도한 대로 작동하고 있는가**와 **문제가 생긴 부분이 없는가**를 확인해야함

해당 챕터에서는 렌더링할 UI 컴포넌트와 연관된 데이터를 중심으로 테스트를 작성

## 웹 접근성 테스트

### 웹 접근성이란?

- 신체적, 정신적 특성에 따른 차이 없이 정보에 접근할 수 있는 정도
- 화면에 보이는 문제가 아니기 때문에 의식적으로 신경 써야만 알 수 있음
  ex) 외관에 치중한 나머지 input 요소를 css로 제거하는 경우 → 마우스 사용자는 클릭 가능하지만, 보조 기기를 사용하는 경우 체크 박스의 존재조차 알 수 없게됨

마우스를 쓰는 사용자, 보조기기를 쓰는 사용자가 동일하게 요소들을 인식할 수 있는 **쿼리로 테스트를 작성**해야 하기 때문에 UI 컴포넌트 테스트는 기본적인 기능의 테스트뿐만 아니라 웹 접근성 품질 향상에도 도움이 됨

---

# 라이브러리 설치

```jsx
jest-environment-jsdom
@testing-library/react
@testing-library/jest-dom
@testing-library/user-event
```

- jest-environment-jsdom : UI를 렌더링하고 조작하기 위해 DOM API가 필요하지만 jest가 테스트를 실행하는 환경인 Node.js는 공식적으로 DOM API를 지원하지 않기 때문
- @testing-library/react : UI 컴포넌트를 리액트로 만들고 있기 때문에 리액트용 테스트 라이브러리 사용
  react가 아니어도 다른 UI 라이브러리를 사용하는 경우에도 @testing-library/dom을 코어로 사용하기 때문에 유사한 테스트 코드를 작성하게 됨
  @testing-library/dom은 @testing-library/react가 의존하는 패키지로 직접 설치할 필요 없음
- @testing-library/jest-dom : 커스텀 매처라는 제스트의 확장 기능을 제공함. UI 컴포넌트를 쉽게 테스트 할 수 있는 여러 매처를 사용할 수 있음
- @testing-library/user-event : 실제 사용자의 입력에 가깝게 시뮬레이션 가능하게 하기 위함
  (+. 테스팅 라이브러리는 문자 입력 등의 이벤트를 발생시키고자 fireEvent API를 제공하지만 DOM 이벤트를 발생시킬 뿐이기 때문에 실제 사용자라면 불가능한 입력 패턴을 만들기도 함)

## UI 컴포넌트 테스트 환경 구축

- UI 컴포넌트 테스트 진행 : 렌더링된 UI를 조작 → 조작 때문에 발생한 결과를 검증

- 기본적인 테스트 환경는 `jest.config.js`의 testEnvironment에 지정함

```jsx
module.exports = {
  testEnvironment: "jest-environment-jsdom",
};
```

- `jest.setup.ts` : 모든 테스트에 적용할 설정 파일

+. Next.js 애플리케이션처럼 서버와 클라이언트 코드가 공존하는 경우, 테스트 파일 첫 줄에 다음과 같은 주석을 작성해 파일별로 다른 테스트 환경을 사용하도록 설정 가능

```jsx
/**
 * @jest-environment jest-environment-jsdom
 */
```

## 테스팅 라이브러리

- UI 컴포넌트를 테스트하는 라이브러리
- 역할
  - UI 컴포넌트 렌더링
  - 렌더링된 요소에서 임의의 자식 요소를 취득
  - 렌더링된 요소에 인터렉션을 일으킴
- 기본 원칙 : **‘테스트는 소프트웨어의 사용법과 유사해야한다’**
  클릭, 마우스 오버, 키보드 입력 같은 기능을 사용해 실제 웹 애플리케이션을 조작할 때와 유사하게 테스트를 작성할 것을 권장함

---

# 처음 시작하는 UI 컴포넌트 테스트

## 테스트 할 UI 컴포넌트

```tsx
type Props = {
  name: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};

export const Form = ({ name, onSubmit }: Props) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      <h2>계정 정보</h2>
      <p>{name}</p>
      <div>
        <button>수정</button>
      </div>
    </form>
  );
};
```

## UI 컴포넌트 렌더링

- 테스팅 라이브러리의 render 함수를 사용해 테스트할 UI 컴포넌트를 코드와 같이 렌더링

```tsx
import { render, screen } from "@testing-library/react";
import { Form } from "./Form";

test("이름을 표시한다", () => {
  render(<Form name="taro" />);
});
```

## 특정 DOM 요소 취득하기

- `screen.getByText` 를 사용해 렌더링 된 요소 중 특정 DOM 요소를 취득
  일치하는 문자열을 가진 한 개의 텍스트 요소를 찾는 API, 요소를 발견하면 해당 요소의 참조 취득 가능
  만약 요소를 찾지 못하면 오류가 발생하고 테스트는 실패함

## 단언문 작성

- @testing-library/jest-dom으로 확장한 커스텀 매처를 사용
- toBeInTheDocument() : 해당 요소가 DOM에 존재하는가 검증하는 커스텀 매처
  (ex. Props에 넘겨준 이름이 표시됐는가를 테스트 할 수 있음)

```tsx
import { render, screen } from "@testing-library/react";
import { Form } from "./Form";

test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByText("taro")).toBeInTheDocument();
});
```

## 특정 DOM 요소를 역할로 취득하기

- screen.getByRole : 특정 DOM 요소를 역할로 취득할 수 있는 함수
- toHaveTextContent : 문자 포함 여부를 검증할 수 있는 매처
- toHaveBeenCalled : 함수의 호출 여부를 검증할 수 있는 매처

### Button

```tsx
test("버튼을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

### heading

```tsx
test("heading을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("heading")).toHaveTextContent("계정 정보");
});
```

## 이벤트 핸들러 호출 테스트

- 이벤트 핸들러로 목 함수(mockFn)를 전달해 검증
- 테스트 환경에서는 직접 버튼을 클릭할 수 없기 때문에 fireEvent.click을 사용해 버튼 클릭을 재현할 수 있음

```tsx
test("버튼을 클릭하면 이벤트 핸들러가 실행된다", () => {
  const mockFn = jest.fn();
  render(<Form name="taro" onSubmit={mockFn} />);
  fireEvent.click(screen.getByRole("button"));
  expect(mockFn).toHaveBeenCalled();
});
```

---

# 아이템 목록 UI 컴포넌트 테스트

Props로 취득한 목록을 표시하는 테스트 살펴보기

- 한 번에 여러 DOM 요소를 취득하는 방법
- ‘존재하지 않음’을 확인하는 매처

## 테스트할 UI 컴포넌트

```tsx
import { ArticleListItem, ItemProps } from "./ArticleListItem";

type Props = {
  items: ItemProps[];
};

export const ArticleList = ({ items }: Props) => {
  return (
    <div>
      <h2>기사 목록</h2>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <ArticleListItem {...item} key={item.id} />
          ))}
        </ul>
      ) : (
        <p>게재된 기사가 없습니다</p>
      )}
    </div>
  );
};
```

## 목록에 표시된 내용 테스트

### 테스트용 데이터 준비

```tsx
import { ItemProps } from "./ArticleListItem";

export const items: ItemProps[] = [
  {
    id: "howto-testing-with-typescript",
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
  },
  {
    id: "nextjs-link-component",
    title: "Next.js의 링크 컴포넌트",
    body: "Next.js는 화면을 이동할 때 링크 컴포넌트를 사용한다",
  },
  {
    id: "react-component-testing-with-jest",
    title: "제스트로 시작하는 리액트 컴포넌트 테스트",
    body: "제스트는 단위 테스트처럼 UI 컴포넌트를 테스트할 수 있다",
  },
];
```

```tsx
test("목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
});
```

- getAllByRole(”listitem”) : 목록에 데이터가 표시되는지 확인
- toHaveLength : 배열 길이 검증 매처

### within 함수로 범위 좁히기

- 큰 컴포넌트를 다룰 때는 테스트 대상이 아닌 listitem도 getAllByRole의 반환값에 포함될 수 있음
- 취득한 list 노드로 범위를 좁혀 여기에 포함된 listitem 요소의 숫자를 검증해야하는데 이때 within 사용
- within 함수의 반환값에는 screen과 동일한 요소 취득 API가 포함됨

```tsx
test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
});
```

### 목록에 표시할 내용이 없는 상황에서의 테스트

- getByRole, getByLabelText는 존재하지 않은 요소의 취득을 시도하면 오류가 발생함
- queryBy 접두사를 붙인 API를 사용해야 함
  - queryBy 접두사를 붙인 API를 사용하면 테스트가 에러 발생으로 중단되지 않음
  - 취득할 요소가 없으면 null을 반환하므로 not.toBeInTheDocument, toBeNull 매처로 검증 가능

```tsx
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

### 개별 아이템 컴포넌트 테스트

```tsx
export type ItemProps = {
  id: string;
  title: string;
  body: string;
};

export const ArticleListItem = ({ id, title, body }: ItemProps) => {
  return (
    <li>
      <h3>{title}</h3>
      <p>{body}</p>
      <a href={`/articles/${id}`}>더 알아보기</a>
    </li>
  );
};
```

```tsx
import { render, screen } from "@testing-library/react";
import { ArticleListItem, ItemProps } from "./ArticleListItem";

const item: ItemProps = {
  id: "howto-testing-with-typescript",
  title: "타입스크립트를 사용한 테스트 작성법",
  body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
};

test("링크에 id로 만든 URL을 표시한다", () => {
  render(<ArticleListItem {...item} />);
  expect(screen.getByRole("link", { name: "더 알아보기" })).toHaveAttribute(
    "href",
    "/articles/howto-testing-with-typescript"
  );
});
```

- toHaveAttribute : 속성을 조사하는 매처

### [쿼리(요소 취득 API)의 우선순위]

1. 모두가 접근 가능한 쿼리

   신체적, 정신적 특성에 따른 차이 없이 접근할 수 있는 쿼리를 의미

   시각적으로 인지한 것과 스크린 리더 등의 보조 기기로 인지한 것이 동일하다는 것을 증명할 수 있음

   - getByRole
     - 명시적으로 role 속성이 할당된 요소 뿐 아니라 암묵적 역할을 가진 요소 취득 가능
   - getByLabelText
   - getByPlaceholderText
   - getByText
   - getByDisplayValue

2. 시맨틱 쿼리

   공식 표준에 기반한 속성을 사용하는 쿼리를 의미

   브라우저나 보조 기기에 따라 상당히 다른 결과가 나올 수 있어 주의해야 함

   - getByAltText
   - getByTitle

3. 테스트 ID

   테스트용으로 할당된 식별자를 의미

   역할이나 문자 콘텐츠를 활용한 쿼리를 사용할 수 없거나 의도적으로 의미 부여를 피하고 싶을 때만 사용 권장

   - getByTestId

---

# 인터렉티브 UI 컴포넌트 테스트

Form 요소의 입력과 상태 체크하는 테스트 작성, 접근성 기반 쿼리 사용으로 DOM 구조를 토대로 만들어진 접근성 무엇인지 알아보기

## Agreement

### 접근 가능한 이름 인용하기

```tsx
type Props = {
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

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

- fieldset 요소는 group이라는 암묵적 역할을 함
- legend는 fieldset의 하위 요소로 그룹에 제목을 붙이는데 사용

```tsx
test("fieldset의 접근 가능한 이름을 legend에서 인용합니다", () => {
  render(<Agreement />);
  expect(
    screen.getByRole("group", { name: "이용 약관 동의" })
  ).toBeInTheDocument();
});
```

### 체크 박스의 초기 상태 검증

- 체크 박스 상태를 toBeChecked 매처로 검증

```tsx
test("체크 박스가 체크되어 있지 않습니다", () => {
  render(<Agreement />);
  expect(screen.getByRole("checkbox")).not.toBeChecked();
});
```

## InputAccount

```tsx
export const InputAccount = () => {
  return (
    <fieldset>
      <legend>계정정보 입력</legend>
      <div>
        <label>
          메일주소
          <input type="text" placeholder="example@test.com" />
        </label>
      </div>
      <div>
        <label>
          비밀번호
          <input type="password" placeholder="8자 이상" />
        </label>
      </div>
    </fieldset>
  );
};
```

### userEvent로 문자열 입력

- userEvent.setup() : API로 호출할 user 인스턴스 생성

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InputAccount } from "./InputAccount";

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

### 비밀번호 입력하기

- HTML 요소와 역할이 항상 일치하진 않음
  <input type=”password” /> 는 역할을 가지지 않아 아래 코드는 실패
  ```tsx
  test("비밀번호 입력란", async () => {
    render(<InputAccount />);
    const textbox = screen.getByRole("textbox", { name: "비밀번호" });
    expect(textbox).toBeInTheDocument();
  });
  ```
- getByPlaceholderText : 역할이 없는 경우 요소를 취득하는 대체 수단으로 활용
  ```tsx
  test("비밀번호 입력란", async () => {
    render(<InputAccount />);
    expect(() => screen.getByPlaceholderText("8자 이상")).not.toThrow();
    expect(() => screen.getByRole("textbox", { name: "비밀번호" })).toThrow();
  });
  ```
  ```tsx
  test("비밀번호 입력란", async () => {
    render(<InputAccount />);
    const password = screen.getByPlaceholderText("8자 이상");
    const value = "abcd1234";
    await user.type(password, value);
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
  });
  ```

## 신규 회원가입 폼 테스트

```tsx
import { useId, useState } from "react";
import { Agreement } from "./Agreement";
import { InputAccount } from "./InputAccount";

export const Form = () => {
  const [checked, setChecked] = useState(false);
  const headingId = useId();
  return (
    <form aria-labelledby={headingId}>
      <h2 id={headingId}>신규 계정 등록</h2>
      <InputAccount />
      <Agreement
        onChange={(event) => {
          setChecked(event.currentTarget.checked);
        }}
      />
      <div>
        <button disabled={!checked}>회원가입</button>
      </div>
    </form>
  );
};
```

### form의 접근 가능한 이름

- aria-labelledby 속성에 h2 요소의 id를 지정하면 접근 가능한 이름으로 인용 가능
- useId : React 18에 추가된 훅으로 접근성에 필요한 id 값을 자동으로 생성하고 관리해줌
- 접근 가능한 이름을 할당하면 form 요소에는 form이라는 역할이 적용되지만, 접근 가능한 이름을 할당하지 않으면 역할을 가지지 않음

```tsx
test("form의 접근 가능한 이름은 heading에서 인용합니다", () => {
  render(<Form />);
  expect(
    screen.getByRole("form", { name: "신규 계정 등록" })
  ).toBeInTheDocument();
});
```

### 회원가입 버튼의 활성화 여부 테스트

- toBeDisabled, toBeEnabled : 버튼의 활성화 여부 검증을 위한 매처

```tsx
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

---

# 유틸리티 함수를 활용한 테스트

폼 입력 인터랙션을 함수화해서 다시 활용하는 팁

## 배송지 정보 입력 폼

```tsx
import { useState } from "react";
import { ContactNumber } from "./ContactNumber";
import { DeliveryAddress } from "./DeliveryAddress";
import { PastDeliveryAddress } from "./PastDeliveryAddress";
import { RegisterDeliveryAddress } from "./RegisterDeliveryAddress";

export type AddressOption = React.ComponentProps<"option"> & { id: string };
export type Props = {
  deliveryAddresses?: AddressOption[];
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};
export const Form = (props: Props) => {
  const [registerNew, setRegisterNew] = useState<boolean | undefined>(
    undefined
  );
  return (
    <form onSubmit={props.onSubmit}>
      <h2>배송지 정보 입력</h2>
      <ContactNumber />
      {props.deliveryAddresses?.length ? (
        <>
          <RegisterDeliveryAddress onChange={setRegisterNew} />
          {registerNew ? (
            <DeliveryAddress title="새로운 배송지" />
          ) : (
            <PastDeliveryAddress
              disabled={registerNew === undefined}
              options={props.deliveryAddresses}
            />
          )}
        </>
      ) : (
        <DeliveryAddress />
      )}
      <hr />
      <div>
        <button>주문내용 확인</button>
      </div>
    </form>
  );
};
```

화면 분기에 따라 전송되는 값의 패턴이 3가지

- 이전 배송지가 없음
- 이전 배송지가 있음 : 새로운 배송지를 등록하지 않음
- 이전 배송지가 있음 : 새로운 배송지를 등록

### 폼 입력을 함수화하기

- 위 컴포넌트처럼 화면 분기가 있는 경우 등 여러 번 동일한 인터랙션을 작성해야 할 때가 많은데, 이때 반복적으로 호출해야 하는 인터렉션을 하나의 함수로 정리하면 여러 곳에서 다시 활용할 수 있음
- 사전에 입력할 내용의 초깃값을 인수에 설정하고 필요할 때마다 변경 가능
- 입력 항목이 많은 폼일수록 함수화가 효과적

```tsx
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
```

```tsx
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

## 이전 배송지가 없는 경우의 테스트

```tsx
async function clickSubmit() {
  await user.click(screen.getByRole("button", { name: "주문내용 확인" }));
}

function mockHandleSubmit() {
  const mockFn = jest.fn();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: { [k: string]: unknown } = {};
    formData.forEach((value, key) => (data[key] = value));
    mockFn(data);
  };
  return [mockFn, onSubmit] as const;
}

describe("이전 배송지가 없는 경우", () => {
  test("배송지 입력란이 존재한다", () => {
    render(<Form />);
    expect(screen.getByRole("group", { name: "연락처" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "배송지" })).toBeInTheDocument();
  });

  test("폼을 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();
    render(<Form onSubmit={onSubmit} />);
    const contactNumber = await inputContactNumber();
    const deliveryAddress = await inputDeliveryAddress();
    await clickSubmit();
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ ...contactNumber, ...deliveryAddress })
    );
  });

  test("Snapshot", () => {
    const { container } = render(<Form />);
    expect(container).toMatchSnapshot();
  });
});
```

## 이전 배송지가 있는 경우의 테스트

```tsx
describe("이전 배송지가 있는 경우", () => {
  test("질문에 대답할 때까지 배송지를 선택할 수 없다", () => {
    render(<Form deliveryAddresses={deliveryAddresses} />);
    expect(
      screen.getByRole("group", { name: "새로운 배송지를 등록하시겠습니까?" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: "이전 배송지" })
    ).toBeDisabled();
  });

  test("'아니오'를 선택하고 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();
    render(<Form deliveryAddresses={deliveryAddresses} onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("아니오"));
    expect(
      screen.getByRole("group", { name: "이전 배송지" })
    ).toBeInTheDocument();
    const inputValues = await inputContactNumber();
    await clickSubmit();
    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(inputValues));
  });

  test("'네'를 선택하고 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();
    render(<Form deliveryAddresses={deliveryAddresses} onSubmit={onSubmit} />);
    await user.click(screen.getByLabelText("네"));
    expect(
      screen.getByRole("group", { name: "새로운 배송지" })
    ).toBeInTheDocument();
    const contactNumber = await inputContactNumber();
    const deliveryAddress = await inputDeliveryAddress();
    await clickSubmit();
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ ...contactNumber, ...deliveryAddress })
    );
  });
```

---

# 비동기 처리가 포함된 UI 컴포넌트 테스트

Fetch API로 전송하는 과정의 테스트

## 계정 정보 등록

```tsx
import { useState } from "react";
import { Form } from "../06/Form";
import { postMyAddress } from "./fetchers";
import { handleSubmit } from "./handleSubmit";
import { checkPhoneNumber, ValidationError } from "./validations";

export const RegisterAddress = () => {
  const [postResult, setPostResult] = useState("");
  return (
    <div>
      <Form
        onSubmit={handleSubmit((values) => {
          try {
            checkPhoneNumber(values.phoneNumber);
            postMyAddress(values)
              .then(() => {
                setPostResult("등록됐습니다");
              })
              .catch(() => {
                setPostResult("등록에 실패했습니다");
              });
          } catch (err) {
            if (err instanceof ValidationError) {
              setPostResult("올바르지 않은 값이 포함되어 있습니다");
              return;
            }
            setPostResult("알 수 없는 에러가 발생했습니다");
          }
        })}
      />
      {postResult && <p>{postResult}</p>}
    </div>
  );
};
```

## 웹 API 클라이언트 확인

```tsx
import { Result } from "./type";

async function handleResponse(res: Response) {
  const data = await res.json();
  if (!res.ok) {
    throw data;
  }
  return data;
}

const host = (path: string) => `https://myapi.testing.com${path}`;

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

export function postMyAddress(values: unknown): Promise<Result> {
  return fetch(host("/my/address"), {
    method: "POST",
    body: JSON.stringify(values),
    headers,
  }).then(handleResponse);
}
```

```tsx
import * as Fetchers from ".";
import { httpError, postMyAddressMock } from "./fixtures";

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

## 입력된 값을 전송하는 인터랙션 함수

```tsx
async function fillValuesAndSubmit() {
  const contactNumber = await inputContactNumber();
  const deliveryAddress = await inputDeliveryAddress();
  const submitValues = { ...contactNumber, ...deliveryAddress };
  await clickSubmit();
  return submitValues;
}
```

```tsx
jest.mock("./fetchers");

// 응답 성공 테스트
test("성공하면 '등록됐습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress();
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록됐습니다")).toBeInTheDocument();
});

// 응답 실패 테스트
test("실패하면 '등록에 실패했습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress(500);
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록에 실패했습니다")).toBeInTheDocument();
});
```

## 유효성 검사 오류 테스트

```tsx
<Form
  onSubmit={handleSubmit((values) => {
    try {
      checkPhoneNumber(values.phoneNumber);
      // 데이터 취득 함수
    } catch (err) {
      if (err instanceof ValidationError) {
        setPostResult("올바르지 않은 값이 포함되어 있습니다");
        return;
      }
    }
  })}
/>
```

```tsx
export class ValidationError extends Error {}

export function checkPhoneNumber(value: any) {
  if (!value.match(/^[0-9\-]+$/)) {
    throw new ValidationError();
  }
}
```

```tsx
async function fillInvalidValuesAndSubmit() {
  const contactNumber = await inputContactNumber({
    name: "배언수",
    phoneNumber: "abc-defg-hijkl",
  });
  const deliveryAddress = await inputDeliveryAddress();
  const submitValues = { ...contactNumber, ...deliveryAddress };
  await clickSubmit();
  return submitValues;
}
```

- AAA 패턴(Arrange Act Assert Pattern) 준비, 실행, 검증 3단계로 정리한 테스트 코드, 가독성이 좋음

```tsx
test("유효성 검사 에러가 발생하면 메시지가 표시된다", async () => {
  render(<RegisterAddress />); // 준비
  await fillInvalidValuesAndSubmit(); // 실행
  expect(
    screen.getByText("올바르지 않은 값이 포함되어 있습니다")
  ).toBeInTheDocument(); // 검증
});
```

## 알 수 없는 오류 테스트

```tsx
test("원인이 명확하지 않은 에러가 발생하면 메시지가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillValuesAndSubmit();
  expect(
    screen.getByText("알 수 없는 에러가 발생했습니다")
  ).toBeInTheDocument();
});
```

---

# UI 컴포넌트 스냅숏 테스트

UI 컴포넌트가 예기치 않게 변경됐는지 검증하고 싶은 경우 스냅숏 테스트를 수행

## 스냅숏 기록하기

- UI 컴포넌트의 스냅숏 테스트를 실행하면 HTML 문자열로 해당 시점의 렌더링 결과를 외부 파일에 저장함
- 스냅숏 테스를 실행하려면 스냅숏을 남기고 싶은 컴포넌트의 테스트 파일에 toMatchSnapshot을 사용하는 단언문을 실행해야함

```tsx
test("Snapshot: 계정명인 'taro'가 표시된다", () => {
  const { container } = render(<Form name="taro" />);
  expect(container).toMatchSnapshot();
});
```

- 테스트를 실행하면 테스트 파일과 같은 경로에 **snapshots** 디렉터리가 생성되고, 디렉터리 안에 ‘테스트 파일명.snap’ 형식으로 파일이 저장된다.
- 파일을 열어보면 UI 컴포넌트가 HTML 문자열로 변경된 것을 확인 할 수 있다.

```tsx
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

+. 자동으로 생성되는 .snap 파일은 git의 추적 대상으로 두고 커밋하는 것이 일반적

## 회귀 테스트 발생시키기

- 스냅숏 테스트는 이미 커밋된 .snap 파일과 현 시점의 스냅숏 파일을 비교하여 차이점이 발견되면 테스트가 실패하게 만듦

## 스냅숏 갱신하기

- 테스트를 실행할 때 —updateSnapshot 또는 -u 옵션을 추가하면 스냅숏이 새로운 내용으로 갱신됨

```bash
$ npx jest —updateSnapshot
```

## 인터랙션을 실행한 후 스냅숏 기록하기

- 스냅숏 테스트는 UI 컴포넌트에 Props에 기반한 결과 외에도 인터랙션 실행 후의 출력 결과도 기록할 수 있음

---

## 암묵적 역할과 접근 가능한 이름

- getByRole은 HTML 요소의 역할(웹 기술 표준을 정하는 W3C의 WAI-ARIA)을 참조함
  WAI-ARIA(Web Accessibility Initiative - Accessible Rich Internet Application)

## 암묵적 역할

button과 같이 명시적으로 role을 지정하지 않아도 초깃값으로 부여된 역할을 의미

```tsx
<button>전송</button>
<button role="button">전송</button> // role 속성 지정할 필요 없음

<div role="button">전송</div>
```

## 역할과 요소는 1:1로 매칭되지 않는다

- 요소가 가진 암묵적 역할과 요소가 일대일로 매칭되지는 않는다.
- 암묵적 역할은 요소에 할당한 속성에 따라 변경된다.

```tsx
<input type="text" />     // role="textbox"
<input type="checkbox" /> // role="checkbox"
<input type="radio" />    // role="radio"
<input type="number" />   // role="spinbutton"
```

## aria 속성값을 활용해 추출하기

- h1-h6 요소는 heading이라는 암묵적 역할을 가지는데 h1, h2을 동시에 가진다면 heading 역할을 가진 요소가 여러개가 있는 상황이 생김
- screen.getByRole(”heading”)으로 요소를 취득하려고 하면 테스트는 실패, screen.getAllByRole(”heading”)은 성공함
- h1 하나만 취득하고 싶다면 getByRole(”heading”, { level : 1 })이라는 쿼리로 특정할 수 있음

## 접근 가능한 이름을 활용해 추출하기

- 접근 가능한 이름 : 보조 기기가 인식하는 노드의 명칭
  (Accessible Name and Description Computation 1.2 사양에 근거해 결정됨)
- 스크린 리더는 접근 가능한 이름을 읽어서 조작할 수 있는 기능을 설명함

## 역할과 접근 가능한 이름 확인하기

- 브라우저의 개발자 도구와 확장 프로그램으로 특정 UI 컴포넌트의 접근성을 확인
- 테스트 코드의 렌더링 결과에서 역할과 접근 가능한 이름을 확인
  @testing-library/react의 logRoles 함수를 실행
  ```tsx
  test("logRoles: 렌더링 결과로부터 역할과 접근 가능한 이름을 확인한다", () => {
    const { container } = render(<Form name="taro" />);
    logRoles(container);
  });
  ```

## 암묵적 역할 목록

| HTML 요소                       | WAI-ARIA의 암묵적 역할     | 참고                                |
| ------------------------------- | -------------------------- | ----------------------------------- |
| `<article>`                     | article                    |                                     |
| `<aside>`                       | commplementary             |                                     |
| `<nav>`                         | navigation                 |                                     |
| **`<header>`**                  | **banner**                 |                                     |
| **`<footer>`**                  | **contentinfo**            |                                     |
| `<main>`                        | main                       |                                     |
| **`<section>`**                 | **region**                 | aria-labelledby가 지정된 경우       |
| `<form>`                        | form                       | 접근 가능한 이름을 가진 경우로 한정 |
| `<button>`                      | button                     |                                     |
| `<a href=”x”>`                  | link                       | href 속성을 가진 경우로 한정        |
| `<input type=”checkbox" /> `    | checkbox                   |                                     |
| `<input type="radio" />`        | radio                      |                                     |
| `<input type="button" />`       | button                     |                                     |
| `<input type="text" />`         | textbox                    |                                     |
| **`<input type="password" />`** | **없음**                   |                                     |
| `<input type="search" />`       | searchbox                  |                                     |
| **`<input type="email" />`**    | **textbox**                |                                     |
| **`<input type="url" />`**      | **textbox**                |                                     |
| **`<input type="tel" />`**      | **textbox**                |                                     |
| **`<input type="number" />`**   | **spinbutton**             |                                     |
| **`<input type="range" />`**    | **slider**                 |                                     |
| **`<select>`**                  | **listbox**                |                                     |
| **`<optgroup>`**                | **group**                  |                                     |
| `<option>`                      | option                     |                                     |
| `<ul>`                          | list                       |                                     |
| `<ol>`                          | list                       |                                     |
| `<li>`                          | listitem                   |                                     |
| `<table>`                       | table                      |                                     |
| `<caption>`                     | caption                    |                                     |
| **`<th>`**                      | **columnheader/rowheader** | 행/열 여부에 따라 달라짐            |
| `<td>`                          | cell                       |                                     |
| `<tr>`                          | row                        |                                     |
| **`<fieldset>`**                | **group**                  |                                     |
| **`<legend>`**                  | **없음**                   |                                     |
