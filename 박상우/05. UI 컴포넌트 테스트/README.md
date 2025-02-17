## 🟢 UI 컴포넌트 테스트 기초 지식

### 🎯 MPA와 SPA의 차이점

- **MPA(Multi Page Application) -** 여러 HTML 페이지와 HTTP 요청으로 만들어진 웹 애플리케이션

- **SPA(Single Page Application) -** 한개의 HTML 페이지에서 개발하는 웹 애플리케이션. 서버의 응답으로 전달받은 HTML을 사용자의 입력에 따라 부분적으로 변경. 이때 변경되는 주요 대상이 단위 UI 컴포넌트

<br />

### 🎯 UI 컴포넌트 테스트

- 개별 UI를 조합해 화면 단위의 UI를 만든다.
  → 조합하는 과정에서 문제가 생기면 전체 애플리케이션에 문제가 생기기 때문에 테스트가 필요하다.
- UI 컴포넌트 기능

  - 데이터를 렌더링하는 기능
  - 사용자의 입력을 전달하는 기능
  - 웹 API를 연동하는 기능
  - 데이터를 동적으로 변경하는 기능

  → `의도대로 작동하고 있는가?` , `문제가 생긴 부분이 없는가?` 를 확인해야 한다.

<br />

### 🎯 웹 접근성 테스트

- 웹 접근성 → 신체적 정신적 특성에 따른 차이 없이 정보에 접근할 수 있는 정도
- **사용자와 보조 기기를 쓰는 사용자가 동일하게 요소를 인식할 수 있는 쿼리**로 테스트를 쓰기 때문에 웹 접근성 품질 향상에도 도움이 된다.

<br/>

## 🟢 라이브러리 설치

### 🎯 UI 컴포넌트 테스트 환경 구축 - `jest-environment-jsdom`

[jsdom](https://www.npmjs.com/package/jsdom) → jest가 실행되는 Node.js 환경에서는 DOM API를 제공하지 않기 때문에 웹 브라우저를 에뮬레이트 할 수 있는 jsdom을 활용한다.

#### 테스트 환경 설정

```tsx
// jest.config.js
module.exports = {
  testEnvironment: 'jest-environment-jsdom', // 최신 버전의 경우
};

// Next.js와 같은 서버/클라이언트가 공존하는 경우
/**
 * @jest-environment jest-environment-jsdom
 */
```

<br />

### 🎯 테스팅 라이브러리 - `@testing-library/react`

- `테스트는 실제 소프트웨어 사용법과 유사해야 한다`는 원칙 아래에 다음과 같은 역할을 한다.
  - UI 컴포넌트 랜더링
  - 랜더링 요소의 자식 요소 취득
  - 랜더링 요소에 인터렉션 요청
- `@testing-library/dom` - React를 포함한 여러 UI라이브러리의 코어. 그래서 다른 라이브러리를 사용하더라도 유사한 테스트 코드를 작성하게 된다.

<br />

### 🎯 UI 컴포넌트 테스트용 매처 확장 - `@testing-library/jest-dom`

DOM 상태 검증을 위한 제스트의 확장 기능을 제공. UI 컴포넌트 테스트를 쉽게 할 수 있는 여러 매처를 제공한다.

<br />

### 🎯 사용자 입력 시뮬레이션 라이브러리 - `@testing-library/user-event`

- fireAPI - 테스팅 라이브러리에서 활용하는 사용자 관련 DOM 이벤트를 발생시킬 수 있게 도와주는 API
  → 하지만 실제 사용자의 입력에 가깝게 시뮬레이션 하기 위해 `@testing-library/user-event` 를 추가로 사용한다.

<br />

## 🟢 처음 시작하는 UI 컴포넌트 테스트

### 🎯 테스트 작성 기본

```tsx
test('버튼을 표시한다', () => {
  render(<Form name='taro' />); // UI 컴포넌트 랜더링

  // .getByRole() -> 특정 DOM 요소 취득, DOM 요소를 역할로 취득
  // .toBeInTheDocument() -> @testing-library/react에서 제공하는 커스텀 매처
  expect(screen.getByRole('button')).toBeInTheDocument(); // 단언문 작성
});
```

<br />

### 🎯 역할로 특정 DOM 요소 취득하기 - `getByRole`

```tsx
screen.getByRole('button'); // 버튼 요소
screen.getByRole('heading'); // h1, h2... 와 같은 요소
```

→ **암묵적 역할**은 웹 접근성에 필수 개념. 테스팅 라이브러리에서 우선적으로 사용하도록 권장하고 있다.

<br />

### 🎯 이벤트 핸들러 호출

- **이벤트 핸들러(Event Handler)** - 입력이 발생했을 때 호출되는 함수
- UI 컴포넌트 테스트에서 이벤트 핸들러 호출은 목 함수로 검증한다.
  ```tsx
  test('버튼을 클릭하면 이벤트 핸들러가 실행된다', () => {
    const mockFn = jest.fn();
    render(<Form name='taro' onSubmit={mockFn} />); // 목 함수를 props로 전달
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled(); // 목 함수
  });
  ```

<br />

## 🟢 아이템 목록 UI 컴포넌트 테스트

```tsx
test('items의 수만큼 목록을 표시한다', () => {
  render(<ArticleList items={items} />);

  // .getAllByRoll('listItem') -> listItem의 역하을 하는 <li> 요소의 배열을 취득

  expect(screen.getAllByRole('listitem')).toHaveLength(3);
});

test('items의 수만큼 목록을 표시한다', () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole('list');
  expect(list).toBeInTheDocument();
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
});
```

<br />

#### 🧐 각 요소를 취득한 배열에는 어떤 값들이 저장될까?

![image.png](attachment:6625b95f-a816-4cca-b2a8-a345ff747cf2:image.png)

<br/>

#### **within 함수로 범위 줄이기**

```tsx
test('items의 수만큼 목록을 표시한다', () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole('list'); // list 역할을 하는 <ul> 요소 취득
  expect(list).toBeInTheDocument(); // <ul> 요소가 랜더링되었는지 테스트

  // within() -> 인자로 넘긴 요소로 범위를 축소한다.
  // screen -> 현재 랜더링된 페이지 전체를 범위로 한다.
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
});
```

<br />

### 🎯 목록에 표시할 내용이 없는 상황에서 테스트

`getByRole`, `getAllByRole` 을 통해 ‘존재하지 않음’을 검증하면 에러가 발생한다. → 대신 `queryBy~` 키워드를 사용하자

```tsx
test("목록에 표시할 데이터가 없으면 '게재된 기사가 없습니다'를 표시한다", () => {
  // 빈 배열을 items에 할당하여 목록에 표시할 데이터가 없는 상황을 재현한다.
  render(<ArticleList items={[]} />);
  // 존재하지 않을 것으로 예상하는 요소의 취득을 시도한다.
  const list = screen.queryByRole('list');
  // list가 존재하지 않는다.
  expect(list).not.toBeInTheDocument();
  // list가 null이다.
  expect(list).toBeNull();
  // '게재된 기사가 없습니다'가 표시됐는지 확인한다.
  expect(screen.getByText('게재된 기사가 없습니다')).toBeInTheDocument();
});
```

<br />

### 🎯 개별 아이템 컴포넌트 테스트

```tsx
test('링크에 id로 만든 URL을 표시한다', () => {
  render(<ArticleListItem {...item} />);

  // '더 알아보기'라는 문자열을 가진 <a> 요소 취득
  const linkElement = screen.getByRole('link', { name: '더 알아보기' });

  // 취득한 요소의 속성을 테스트\
  expect(linkElement).toHaveAttribute(
    'href',
    '/articles/howto-testing-with-typescript'
  );
});
```

<br />

### 🎯 부록: 쿼리의 우선순위

1. 모두 접근 가능한 쿼리

   신체적, 정신적 특성에 따른 차이없이 접근할 수 있는 쿼리. 시각적으로 인지한 것 과 보조 기기(스크린 리더)로 인지한 것이 동일함을 증명한다.

   → `getByRole`, `getByLableText`, `getByPlaceholderText` , `getByText`, `getByDisplayValue`

2. 시맨틱 쿼리

   공식 표준에 기반한 속성을 사용하는 쿼리를 의미, 시멘틱 쿼리를 사용하는 브라우저, 보조기기에 따라 다른 결과가 나올 수 있다.

   → `getByAltText` , `getByTitle`

3. 테스트 ID

   테스트 용으로 할당된 식별자를 의미. 역할이나 문자 콘텐츠를 활용한 쿼리를 사용하거나, 의도적으로 의미부여를 피하고 싶은 경우 사용

   → `getByTestId`

   ```html
   <div data-testid="custom-element" />
   ```

<br />

## 🟢 인터렉티브 UI 컴포넌트 테스트

### 🎯 테스트할 컴포넌트

`<field>` - form의 여러 컨트롤과 레이블을 그룹화하는 역할

`<legend>` - 부모 콘텐츠에 대한 캡션

```html
<form>
  <fieldset>
    <legend>Choose your favorite monster</legend>
    <input type="radio" id="kraken" name="monster" value="K" />
    <label for="kraken">Kraken</label><br />
  </fieldset>
</form>
```

<br />

#### 접근 가능한 이름 인용하기

`<field>`는 테스팅 라이브러리에서 group이라는 암묵적 역할을 한다.

```tsx
test('fieldset의 접근 가능한 이름을 legend에서 인용합니다', () => {
  render(<Agreement />);

  const formGroup = screen.getByRole('group', { name: '이용 약관 동의' });

  expect(formGroup).toBeInTheDocument();
});
```

앞에서도 강조했듯 웹 접근성을 위해 폼 내에 컨트롤러의 그룹이 존재한다면 <field>로 지정하는 것이 좋다.

동일하게 동작하지만 `<div>`로 영역을 구분했을 떄는 위 테스트 코드는 유효하지 않다.

```html
<div>
  <legend>...</legend>
</div>
```

<br />

#### 체크 박스의 초기 상태 검증

`toBeChecked` - 체크 박스 상태를 검증하는 매처

```jsx
test('체크 박스가 체크되어 있지 않습니다.', () => {
  render(<Agreement />);
  expect(screen.getByRole('checkbox')).not.toBeChecked(); // 체크되지 않은 상태를 테스트
});
```

<br />

### 🎯 계정 정보 입력 컴포넌트 테스트

1. userEvent로 문자열 입력하기

   사용자 입력을 실제와 가깝게 재현하기 위해 `@teseting-library/user-event` 를 사용한다.

   ```jsx
   // 테스트 파일 작성 초기에 설정, user 인스턴스 생성
   const user = userEvent.setup();

   test('메일주소 입력란', async () => {
     render(<InputAccount />);

     // 메일주소 입력란 취득
     const textbox = screen.getByRole('textbox', { name: '메일주소' });
     const value = 'taro.tanaka@example.com';

     // textbox에 value를 입력 인터렉션 재현
     await user.type(textbox, value);

     // 초깃값이 입력된 폼 요소가 존재하는지 검증
     expect(screen.getByDisplayValue(value)).toBeInTheDocument();
   });
   ```

2. 비밀번호 입력하기

   input type이 password인 경우 동일하게 요소를 `textbox`라는 역할로 가져오면 에러가 발생한다. **`password`와 관련한 역할이 없기 때문에 `getByPlacehoderText`를 통해 가져와야한다.**

   그리고 **같은 요소라고 같은 역할을 가지지 않는다.**

   ```tsx
   test('비밀번호 입력란', async () => {
     render(<InputAccount />);
     // 비밀번호에 해당하는 <input> 요소 취득
     const password = screen.getByPlaceholderText('8자 이상');

     const value = 'abcd1234';
     // 비밀번호 입력 재현
     await user.type(password, value);

     expect(screen.getByDisplayValue(value)).toBeInTheDocument();
   });
   ```

<br />

### 🎯 신규 회원가입 폼 테스트

1. 버튼 클릭 후 특정 요소 활정화 여부 테스트

   - 클릭 이벤트 - `await user.click( 요소 )`
   - 버튼 활성화 여부 매처 - `toBeDisabled` , `toBeEnabled`

   ```tsx
   test('회원가입 버튼은 비활성화 상태다', () => {
     render(<Form />);
     expect(screen.getByRole('button', { name: '회원가입' })).toBeDisabled();
   });

   test('이용 약관에 동의하는 체크 박스를 클릭하면 회원가입 버튼은 활성화된다', async () => {
     render(<Form />);

     // 클릭 이벤트 재현
     await user.click(screen.getByRole('checkbox'));
     expect(screen.getByRole('button', { name: '회원가입' })).toBeEnabled();
   });
   ```

2. form의 접근 가능한 이름

   `aria-labelledby` 를 통해 특정 요소의 id 속성으로 전달하면 접근 가능한 이름으로 인용할 수 있다.

   ```jsx
   <form aria-labelledby={headingId}>
     <h2 id={headingId}>신규 계정 등록</h2>
   </form>
   ```

   ```tsx
   test('form의 접근 가능한 이름은 heading에서 인용합니다', () => {
     render(<Form />);
     expect(
       screen.getByRole('form', { name: '신규 계정 등록' })
     ).toBeInTheDocument();
   });
   ```

<br />

## 🟢 유틸리티 함수를 활용한 테스트

### 🎯 폼 입력을 함수화하기

반복적으로 사용되나, 많은 인터렉션으로 인해 테스트 코드의 가독성이 떨어지는 경우 인터렉션 부분을 함수화하여 필요한 곳에서 불러 활용할 수 있다.

<br />

### 🎯 이전 배송지가 없는 경우의 테스트

```tsx
// 관련 테스트 그룹화 및 테스트 케이스 정의
describe('이전 배송지가 없는 경우', () => {
  test('배송지 입력란이 존재한다', () => {
    render(<Form />);
    expect(screen.getByRole('group', { name: '연락처' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '배송지' })).toBeInTheDocument();
  });

  test('폼을 제출하면 입력 내용을 전달받는다', async () => {
    // submit 콜백 함수 mocking
    const [mockFn, onSubmit] = mockHandleSubmit();

    // UI 컴포넌트 랜더링
    render(<Form onSubmit={onSubmit} />);

    // 사용자 input 입력 재현
    const contactNumber = await inputContactNumber();
    const deliveryAddress = await inputDeliveryAddress();

    // 클릭 이벤트 발생
    await await user.click(
      screen.getByRole('button', { name: '주문내용 확인' })
    );

    // 모킹 함수로 단언문 작성
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ ...contactNumber, ...deliveryAddress })
    );
  });
});
```

### 🧐 위 예제의 마지막 단언문 이해하기

**→ ❌ expect.objectContaining({ ...contactNumber, ...deliveryAddress })매처로 테스트한 반환하는 값을 가지고 toHaveBeenCalledWith() 매처를 활용한 단언문에 활용되는 건가?**

```jsx
const matcherObj = expect.objectContaining(inputValues);

console.log(matcherObj); // 반환 값은 없음

expect(mockFn).toHaveBeenCalledWith(matcherObj);
```

→ **❌** 아.. 그럼 인자로 넘겨준 **{ ...contactNumber, ...deliveryAddress } 객체를expect.objectContaining() 테스트 후 기억하고 있다가, expect.toHaveBeenCalledWith() 에서 연속적으로 체크하는 건가?**

→ 🟢 의미적으로 `{ ...contactNumber, ...deliveryAddress }` 객체를 일부분으로 가지는 인자로 모킹 함수가 실행되었는지를 테스트한다로 이해한다. ( like and 연산 )

<br />

### 🎯 이전 배송지가 있는 경우의 테스트

```tsx
describe('이전 배송지가 있는 경우', () => {
  // 랜더링된 화면에 대한 테스트
  test('질문에 대답할 때까지 배송지를 선택할 수 없다', () => {
    render(<Form deliveryAddresses={deliveryAddresses} />);
    expect(
      screen.getByRole('group', { name: '새로운 배송지를 등록하시겠습니까?' })
    ).toBeInTheDocument();
    expect(screen.getByRole('group', { name: '이전 배송지' })).toBeDisabled();
  });

  test("'아니오'를 선택하고 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();
    render(<Form deliveryAddresses={deliveryAddresses} onSubmit={onSubmit} />);

    // 아니오 버튼 클릭
    await user.click(screen.getByLabelText('아니오'));

    // 클릭 이벤트에 따른 컴포넌트 테스트
    expect(
      screen.getByRole('group', { name: '이전 배송지' })
    ).toBeInTheDocument();

    // 사용자 입력 재현 -> 폼 제출 이벤트 재현
    const inputValues = await inputContactNumber();
    await clickSubmit();

    expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(inputValues));
  });

  test("'네'를 선택하고 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();

    render(<Form deliveryAddresses={deliveryAddresses} onSubmit={onSubmit} />);

    // 아니오 버튼 클릭
    await user.click(screen.getByLabelText('네'));

    // 클릭 이벤트에 따른 컴포넌트 테스트
    expect(
      screen.getByRole('group', { name: '새로운 배송지' })
    ).toBeInTheDocument();

    // 사용자 입력 재현 -> 폼 제출 이벤트 재현
    const contactNumber = await inputContactNumber();
    const deliveryAddress = await inputDeliveryAddress();
    await clickSubmit();

    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ ...contactNumber, ...deliveryAddress })
    );
  });
});
```

<br />

## 🟢 비동기 처리가 포함된 UI 컴포넌트 테스트

### 🎯 API 클라이언트 Mocking

```tsx
import * as Fetchers from '.';
import { httpError, postMyAddressMock } from './fixtures';

export function mockPostMyAddress(status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, 'postMyAddress')
      .mockRejectedValueOnce(httpError);
  }
  return jest
    .spyOn(Fetchers, 'postMyAddress')
    .mockResolvedValueOnce(postMyAddressMock);
}
```

<br />

### 🎯 응답 성공 테스트

```tsx
jest.mock("./fetchers");

...

test("성공하면 '등록됐습니다'가 표시된다", async () => {
	// 성공 케이스 mocking
  const mockFn = mockPostMyAddress();

  render(<RegisterAddress />);

  // 폼 제출 인터렉션 재현
  const submitValues = await fillValuesAndSubmit();

  // 목 함수를 통해 테스트
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록됐습니다")).toBeInTheDocument();
});
```

<br />

### 🎯 응답 실패 테스트

```jsx
jest.mock("./fetchers");

...

test("실패하면 '등록에 실패했습니다'가 표시된다", async () => {
	// 실패 케이스 mocking
  const mockFn = mockPostMyAddress(500);

  render(<RegisterAddress />);

  // 폼 제출 인터렉션 재현
  const submitValues = await fillValuesAndSubmit();

  // 목 함수를 통해 테스트
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록에 실패했습니다")).toBeInTheDocument();
});
```

<br />

### 🎯 폼 유효성 검사 오류 테스트

```tsx
test("유효성 검사 에러가 발생하면 '올바르지 않은 값이 포함되어 있습니다'가 표시된다", async () => {
  render(<RegisterAddress />);

  await fillInvalidValuesAndSubmit();

  expect(
    screen.getByText('올바르지 않은 값이 포함되어 있습니다')
  ).toBeInTheDocument();
});
```

### 🧐 내가 잘못 이해하고 있었던 부분

👨🏻‍💻 : `await fillInvalidValuesAndSubmit();` 내부에서 throw를 하니까 .toThrow()하는지 먼저 체크하고, UI 테스트를 하면 더 확실한 테스트가 되지 않나?

❌ `.toThrow()` 는 예외로 인해 프로그램이 멈추는 경우 활용하는 매처이다. 해당 로직에서는 catch 문 내부에서 UI를 수정하고 return 하고 있기 때문에 .toThrow()를 테스트하는 것은 적절하지 않다. 그래서 에러 발생시 변경 되는 UI를 테스트하는 것이 더 적절하다.

→ throw를 한다면 모두 .toThrow로 체크가 가능하다고 생각하고 있었음😅

<br />

### 🎯 그 외 오류 테스트

```jsx
test("원인이 명확하지 않은 에러가 발생하면 '알 수 없는 에러가 발생했습니다'가 표시된다", async () => {
  render(<RegisterAddress />);

  await fillValuesAndSubmit();

  expect(
    screen.getByText('알 수 없는 에러가 발생했습니다')
  ).toBeInTheDocument();
});
```

<br />

## 🟢 UI 컴포넌트 스냅샷 테스트

컴포넌트가 이전에 비해 변경되었다는 것을 검증하기 위해 스냅샷 테스트(Snap Shot) 테스트를 한다.

### 🎯 스냅샷 기록하기

스냅샷 테스트를 실행하면 랜더링 결과를 테스트 파일과 동일한 경로의 `__snapshot__` 과 동일한 경로에 파일(테스트\_파일명.snap)을 생성한다.

```jsx
test("Snapshot: 계정명인 'taro'가 기록된다.", () =>< {
	const { container } = render(<Form name='taro' />);

	expect(container).toMatchSnapshot();
});
```

인터렉션이 일어난 경우에도 스냅샷을 저장할 수 있다. 로직 내에서 예상하지 못한 변경 사항이 발생했을 때 기존 저장한 스냅샷과 비교하여 변경 사항을 확인한다.

<br />

### 🎯 스냅샷 테스트의 동작 방식

1. **처음 실행 시**
   - 컴포넌트의 렌더링 결과를 **스냅샷 파일(.snap)**로 저장합니다.
   - `__snapshots__` 폴더 안에 `.snap` 파일이 생성됨.
2. **다음 실행 시**
   - 현재 렌더링 결과와 기존의 스냅샷을 비교합니다.
   - 내용이 다르면 테스트가 실패하고, 변경된 부분을 보여줌.
   - 변경이 의도된 경우, `npx jest --updateSnapshot` 명령어를 사용해 스냅샷을 업데이트할 수 있음.

<br />

## 🟢 암묵적 역할과 접근 가능한 이름

- 누구나 접근 가능한 쿼리에 해당하는 `getByRole` 은 HTML 요소들의 역할을 참조한다. 각 역할은 **WAI-ARIA**라고 하는 사양에 포함된 내용이다.
- WAI-ARIA에는 마크업 만으로는 부족한 내용을 보강하거나, 의도에 따른 의미를 전달하기 위한 내용들이 있다. WAI-ARIA에 따라 테스트 코드를 작성하면 웹 접근성에 대한 검증이 가능하다.

<br />

### 🎯 암묵적 역할

- HTML 요소에 초깃값으로 부여된 역할을 암묵적 역할이라고 한다.
- 초기값으로 주어진 역할외에 다른 역할을 사용해야하는 경우 `role` 속성을 통해 수정 가능하다.
  ```jsx
  <div role='button'> ... </div>
  ```

<br />

### 🎯 역할과 요소는 1대1로 매칭되지 않는다.

- 요소가 가진 암묵적 역할과 요소가 일대일로 매칭되지 않는다.
- input의 경우 type 속성에 따라 역할이 달라지며, 그 역할 이름 또한, 역할 명칭과 일치하지 않는 경우가 있다.
  ```html
  <!--role="textbox"-->
  <input type="text" />

  <!--role="checkbox"-->
  <input type="checkbox" />

  <!--role="radio"-->
  <input type="radio" />

  <!--role="spinbutton"-->
  <input type="number" />
  ```

<br />

### 🎯 aria 속성값을 통해 추출하기

- `<h1>` ~ `<h6>` 은 모두 heading이라는 역할을 가진다. 컴포넌트 내부에 여러 종류의 heading이 존재하는 경우 `getByRole` 을 통해서 하나만 가져올 수는 없고, `getAllByRole` 를 통해서 여러 개의 요소를 가져와야한다.
- 이 경우에는 aria-level 속성을 함께 사용해서 특정 heading역할을 하는 요소만 취득할 수 있다.
  ```jsx
  getByRole('heading', { level: 1 });
  // <h1> </h1>
  // <div role='heading' aria-level='1'> ... </div>
  ```

<br />

### 🎯 접근 가능한 이름을 활용해 추출하기

‘접근 가능한 이름’ 이란 보조 기기가 인식하는 노드의 명칭이며, 스크린 리더가 이 이름을 읽어 조작 가능하다.

- 버튼에 ‘전송’이라는 문자가 있으면 해당 요소는 ‘전송’ 버튼으로 읽힌다.
- 아이콘/이미지의 경우 `alt` 속성이 곧 해당 요소의 접근 가능한 이름이 된다.
  ```jsx
  getByRole('button', { name: '전송' });
  // <button>전송</button>
  // <div role='button'>전송</button>
  // <button><img alt='전송' src='...' /></button>
  ```

<br />

### 🎯 역할과 접근 가능한 이름 확인하기

- 브라우저의 개발자 도구와 확장 프로그램으로 UI 컴포넌트의 접근성 확인
- 테스트 코드의 랜더링 결과에서 역할과 접근 가능한 이름을 확인
  ```jsx
  type Props = {
    name: string,
    onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void,
  };
  export const Form = ({ name, onSubmit }: Props) => {
    return (
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit?.(event);
        }}
      >
        <h2>계정 정보1</h2>
        <h2>계정 정보2</h2>
        <h2>계정 정보3</h2>
        <h2>계정 정보4</h2>
        <h2>계정 정보5</h2>
        <p>{name}</p>
        <div>
          <button>수정1</button>
          <div role='button'>수정2</div>
        </div>
      </form>
    );
  };
  ```
  ```JavaScript
  test("logRoles: 렌더링 결과로부터 역할과 접근 가능한 이름을 확인한다", () => {
    const { container } = render(<Form name="taro" />);
    logRoles(container);
  });
  ```
  ![image.png](attachment:908d10fd-5384-4f63-a6b6-a333d5594c43:image.png)

<br/>

### 🎯 암묵적 역할 목록

| HTML 요소                 | WAI-ARIA의 암묵적 역할 | 참고                                     |
| ------------------------- | ---------------------- | ---------------------------------------- |
| `<article>`               | article                |                                          |
| `<aside>`                 | complementary          |                                          |
| `<nav>`                   | navigation             |                                          |
| `<header>`                | banner                 |                                          |
| `<footer>`                | contentinfo            |                                          |
| `<main>`                  | main                   | `aria-labelledby`가 지정된 경우다.       |
| `<section>`               | region                 | 접근 가능한 이름을 가진 경우로 한정한다. |
| `<form>`                  | form                   |                                          |
| `<button>`                | button                 |                                          |
| `<a href="xxxxx">`        | link                   | `href` 속성을 가진 경우로 한정한다.      |
| `<input type="checkbox">` | checkbox               |                                          |
| `<input type="radio">`    | radio                  |                                          |
| `<input type="button">`   | button                 |                                          |
| `<input type="text">`     | textbox                |                                          |
| `<input type="password">` | 없음                   |                                          |
| `<input type="search">`   | searchbox              |                                          |
| `<input type="email">`    | textbox                |                                          |
| `<input type="url">`      | textbox                |                                          |
| `<input type="tel">`      | textbox                |                                          |
| `<input type="number">`   | spinbutton             |                                          |
| `<input type="range">`    | slider                 |                                          |
| `<select>`                | listbox                |                                          |
| `<optgroup>`              | group                  |                                          |
| `<option>`                | option                 |                                          |
| `<ul>`                    | list                   |                                          |
| `<ol>`                    | list                   |                                          |
| `<li>`                    | listitem               |                                          |
| `<table>`                 | table                  |                                          |
| `<caption>`               | caption                |                                          |
| `<th>`                    | columnheader/rowheader | 행/열 여부에 따라 달라진다.              |
| `<td>`                    | cell                   |                                          |
| `<tr>`                    | row                    |                                          |
| `<fieldset>`              | group                  |                                          |
| `<legend>`                | 없음                   |                                          |

<br/>

### 🧐 aria-label? aria-labelledby?

**📝 `aria-label` (MDN [링크](https://developer.mozilla.org/ko/docs/Web/Accessibility/ARIA/Attributes/aria-label))**

- **모든 HTML 요소에서 사용 가능**
- 요소가 **어떤 역할을 하는지 설명하는 텍스트를 직접 지정**
- **콘텐츠 자체로 의미를 전달하기 어려운 경우** 사용 (예: 아이콘 버튼, 빈 `<div>`, `<span>` 등)

```tsx
<button aria-label='메뉴 열기'>
  <svg>...</svg>
</button>
```

📌 `aria-label="메뉴 열기"`가 **화면에는 보이지 않지만, 스크린 리더가 읽어줌**

📌 버튼 안에는 텍스트가 없기 때문에 `aria-label`이 의미를 제공

<br/>

**📝 `aria-labelledby` (MDN [링크](https://developer.mozilla.org/ko/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby))**

- **페이지의 다른 요소를 참조하여 접근 가능한 이름을 제공**
- `aria-label`보다 **우선순위가 높음** (가능하면 `aria-labelledby`를 사용하는 것이 더 좋음)
- **시각적으로 보이는 텍스트를 활용하여 요소를 설명**

```tsx
<label id="username-label">사용자 이름</label>
<input type="text" aria-labelledby="username-label" />
```

📌 `aria-labelledby="username-label"`을 사용하여 **입력 필드의 접근 가능한 이름을 `label`과 동일하게 설정**

<br/>

**📝 우선순위**

`aria-labelledby`가 `aria-label`보다 더 우선순위가 높으며, `aria-labelledby`는 다른 접근 가능한 이름 보다 우선순위가 높다.

<br/>

**📝 언제 `aria-label`과 `aria-labelledby`를 사용할까?**

1. **`aria-labelledby`를 사용할 수 있다면 항상 `aria-label`보다 우선 사용!**
2. **텍스트가 없는 요소(아이콘 버튼, 빈 `<div>` 등)는 `aria-label` 사용**
3. **이미 시각적으로 존재하는 요소를 참조할 수 있으면 `aria-labelledby` 사용**
4. **레이블을 추가할 공간이 부족한 경우 `aria-label` 사용**

📌 **결론:**

- **가능하면 `aria-labelledby`를 사용하여 기존 UI 요소를 활용하는 것이 접근성 측면에서 더 좋음**
- **`aria-label`은 추가적인 설명이 필요할 때 보완적으로 사용**

  → 아까 password에서 `getByPlaceholderText` 대신 활용할 수 있지 않을까?
