### UI 컴포넌트 테스트의 기본 개념

UI 컴포넌트는 버튼과 같은 기본 단위부터 시작하여 계층적으로 구성됩니다.
작은 컴포넌트들이 모여 더 큰 컴포넌트를 형성하고, 이것이 전체 화면을 구성하게 됩니다.
따라서 중간 단계의 컴포넌트에서 발생한 문제는 전체 애플리케이션에 영향을 미칠 수 있어 철저한 테스트가 필요합니다.

### UI 컴포넌트의 핵심 기능

1. 데이터 렌더링
2. 사용자 입력 처리
3. 웹 API 통합
4. 동적 데이터 관리

이러한 기능들이 의도한 대로 작동하는지, 예기치 않은 문제가 없는지 검증이 필요합니다.

### 테스트 환경 설정

UI 컴포넌트 테스트에는 DOM API가 필요합니다. Node.js 환경에서는 JSDOM을 통해 이를 구현합니다.

```javascript
// jest.config.js
module.exports = {
  testEnvironment: "jest-environment-jsdom"
};
```

Next.js와 같이 서버-클라이언트 코드가 혼재된 환경에서는 파일별로 테스트 환경을 지정할 수 있습니다:

```javascript
/**
 * @jest-environment jsdom
 */
```

### Testing Library 소개

Testing Library는 UI 컴포넌트 테스트를 위한 도구로, 다음과 같은 주요 기능을 제공합니다:

1. 컴포넌트 렌더링
2. DOM 요소 선택
3. 사용자 인터랙션 시뮬레이션

실제 사용자의 행동과 유사한 방식으로 테스트를 작성하는 것을 권장합니다.
React 프로젝트의 경우 `@testing-library/react`를 사용하며, 이는 `@testing-library/dom`을 기반으로 합니다.

### 테스트 도구 확장

- **매처 확장**: DOM 상태 검증을 위해 Jest의 커스텀 매처를 활용합니다.
- **사용자 이벤트 시뮬레이션**: `fireEvent` 대신 더 현실적인 사용자 인터랙션을 구현하는 `user-event`를 사용합니다.

### 요소 선택 우선순위

Testing Library는 다음과 같은 우선순위로 요소를 선택할 것을 권장합니다:

1. 접근성 관련 속성 (role, label, aria-\* 등)
2. 텍스트 콘텐츠
3. 테스트 ID

이러한 방식으로 접근성과 사용자 경험을 고려한 테스트 코드를 작성할 수 있습니다.

### 1. 모든 사용자를 위한 접근 가능한 쿼리:

**`getByRole`**

- 접근성 트리에 노출한 모든 요소를 쿼리하는 데 사용.
- `name` 옵션을 통해 액세스 가능한 이름으로 요소 필터링 가능.
- 거의 모든 UI 요소에 사용 가능하며, 접근성을 위한 가장 선호되는 방법입니다.
- 실제 예시 3가지
  React 컴포넌트 `getByRole` 쿼리 사용하여 접근 가능한 이름(Accessible Name)

  ### 버튼 예시

  ```jsx
  <button aria-label="Save">Save Changes</button>
  <button name="submit">Submit</button>
  ```

  - 첫 번째 버튼은 `aria-label` 속성을 사용하여 "Save"라는 접근 가능한 이름을 가집니다. 이 버튼은 `getByRole('button', { name: 'Save' })`로 찾을 수 있습니다.
  - 두 번째 버튼의 경우, 버튼의 내부 텍스트 "Submit"이 접근 가능한 이름으로 사용됩니다. 이 버튼은 `getByRole('button', { name: 'Submit' })`로 찾을 수 있습니다.

  ### 입력 필드 예시

  ```jsx
  <form>
    <label htmlFor="username">Username:</label>
    <input id="username" name="username" type="text" />

    <input aria-label="Search" name="search" type="text" />
  </form>
  ```

  - 첫 번째 입력 필드의 접근 가능한 이름은 `label` 요소의 텍스트인 "Username:"입니다. 이 필드는 `getByRole('textbox', { name: 'Username:' })`로 찾을 수 있습니다.
  - 두 번째 입력 필드는 `aria-label` 속성을 통해 "Search"라는 접근 가능한 이름을 가집니다. 이 필드는 `getByRole('textbox', { name: 'Search' })`로 찾을 수 있습니다.

  ### 이미지 예시

  ```jsx
  <img src="image-url.jpg" alt="Decorative Image" />
  ```

  - `img` 요소에서 `alt` 속성은 이미지의 접근 가능한 이름을 제공합니다. 여기서는 "Decorative Image"가 됩니다. 이 이미지는 `getByRole('img', { name: 'Decorative Image' })`로 찾을 수 있습니다.

**`getByLabelText`**:

- 양식 필드를 찾는 데 적합.

```jsx
function LoginForm() {
  return (
    <form>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" type="text" />
    </form>
  );
}
```

- 이 예시에서 `getByLabelText('Username')`를 사용하면 `input` 요소를 찾을 수 있습니다.

**`getByPlaceholderText`**:

- 라벨이 없는 경우에 사용.
- 자리 표시자만 있는 경우 대안으로 사용됩니다.

```jsx
function SearchBar() {
  return <input placeholder="Search query" />;
}
```

- `getByPlaceholderText('Search query')`는 위의 `input` 요소를 찾습니다.

**`getByText`**:

- 텍스트 콘텐츠를 사용하여 비대화형 요소를 찾는 데 적합.
- 예: `div`, `span`, `p` 등.

```jsx
function WelcomeMessage() {
  return <div>Welcome to our website!</div>;
}
```

- `getByText('Welcome to our website!')`는 위의 `div` 요소를 찾습니다.

**`getByDisplayValue`**:

- 양식 요소의 현재 값을 통해 요소를 찾습니다.
- 값이 채워진 페이지를 탐색할 때 유용합니다.

```jsx
class UserProfile extends React.Component {
  state = { name: "John Doe" };

  render() {
    return <input value={this.state.name} onChange={this.handleChange} />;
  }

  handleChange = (event) => {
    this.setState({ name: event.target.value });
  };
}
```

- `getByDisplayValue('John Doe')`는 현재 값이 'John Doe'인 `input` 요소를 찾습니다.

이 예시들은 각 쿼리 메서드가 실제로 어떻게 사용되는지 보여줍니다. 이러한 방식으로 요소를 찾는 것은 사용자 경험을 테스트 코드에 반영하고, 웹 접근성을 향상시키는 데 중요합니다.

### 2. 의미론적 쿼리

1. **`getByAltText`**:
   - `img`, `area`, `input`과 같은 `alt` 텍스트를 지원하는 요소에 사용.
   - 시각적 요소를 식별할 때 유용합니다.
2. **`getByTitle`**:
   - `title` 속성을 사용하여 요소를 찾습니다.
   - 스크린리더에서 일관되게 읽히지 않으며 시각적으로 보이지 않는 경우가 많습니다.

### 3. 테스트 ID 사용

1. **`getByTestId`**:

   - 특정 요소에 `data-testid` 속성이 있을 때 사용합니다.
   - 사용자가 직접 보거나 듣지 못하는 요소에 적합.
   - 역할이나 텍스트로 일치시킬 수 없는 경우의 마지막 수단으로 사용됩니다.

1. **실제 사용자 인터랙션 시뮬레이션**:
   - `user-event`는 **단순한 DOM 이벤트 발생**이 아닌, **사용자 인터랙션의 전체 과정**을 시뮬레이트합니다. 이는 **`fireEvent`와 비교했을 때 더 현실적인 사용자 경험을 제공**합니다.
1. **`setup` 메서드와 `user` 객체**:
   - `user-event`를 사용하기 위해서는 먼저 `setup` 메서드를 호출하여 `user` 객체를 생성해야 합니다. 이 `user` 객체를 통해 `click`, `hover`, `unhover` 같은 시뮬레이션 메서드에 접근할 수 있습니다.
1. **비동기 처리의 중요성**:
   - `user-event` API는 항상 프라미스를 반환합니다. 따라서 `user-event` API를 사용할 때는 비동기 처리가 필요하며, 해당 메서드가 완료될 때까지 기다렸다가 어서션(assertion)을 수행해야 합니다.

```jsx
test("don't update total if scoops input is invalid", async () => {
  const user = userEvent.setup();
  render(<Options optionType="scoops" />);
  // 중간 부분 생략
  // do the same test for "100"
  await user.clear(vanillaInput);
  await user.type(vanillaInput, "100");
  expect(scoopsSubtotal).toHaveTextContent("$0.00");
});
```

### `user-event`의 이점

`user-event`는 실제 사용자의 행동을 더 정확하고 현실적으로 모방하여, 테스트의 신뢰성을 높입니다. 또한, 비동기 처리를 통해 테스트의 정확성을 보장하고, 테스트 케이스 작성 시 사용자 관점에서의 인터랙션을 더 잘 이해하고 반영할 수 있습니다.
