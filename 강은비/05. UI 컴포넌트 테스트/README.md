# UI 컴포넌트 테스트

## UI 컴포넌트 기능

- 데이터 렌더링
- 사용자 입력 전달
- 웹 API 연동
- 데이터 변경

## UI 컴포넌트 테스트 시작하기

### 요소 취득하기

- [Testing Library](https://testing-library.com/docs/queries/about/#priority) 공식문서에서 **접근성** 기준으로 요소를 찾는 방법의 우선순위를 지정했다.
- `getByRole`: 접근성 트리에 노출되는 요소를 찾을 때 사용된다. 명시적으로 `role` 속성이 할당된 요소뿐만 아니라 암묵적 역할을 가진 요소도 취득할 수 있다. `name` 옵션을 사용해 "접근 가능한 이름"으로 필터링할 수 있다.
  - 참고: [Role list](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques#roles), [Accessible name](https://developer.mozilla.org/en-US/docs/Glossary/Accessible_name)
  - 예시: `getByRole("button", { name: /submit/i });`
- `getByLabelText`: 폼 필드를 찾을 때 사용하기 좋다.
- `getByPlaceholder`: 인풋 찾을 때 사용하기 좋다.
- `getByText`: 비 상호작용적인 요소를 (div, span) 찾을 때 사용된다.
- `getByDisplayValue`: 폼 요소의 현재 값 기반으로 요소를 찾을 때 유용하다.
- `getByAltText`: 대체 텍스트를 지원하는 요소를 찾을 때 유용하다.
- `getByTitle`
- `getByTestId`
- React Testing Library에서 제공하는 `logRoles` 함수를 사용해 렌더링 결과물에서 역할과 접근가능한 이름을 확인할 수 있다.

> 요소 취득할 때 명시적/암묵적 역할과 접근 가능한 이름을 적극적으로 활용하자! 자연스럽게 웹 접근성이 개선될 것이다.

| Type of Query | 0 Matches   | 1 Match        | >1 Matches   | Retry (Async/Await) |
| ------------- | ----------- | -------------- | ------------ | ------------------- |
| getBy...      | Throw error | Return element | Throw error  | No                  |
| getAllBy...   | Throw error | Return array   | Return array | No                  |
| queryBy...    | Return null | Return element | Throw error  | No                  |
| queryAllBy... | Return []   | Return array   | Return array | No                  |
| findBy...     | Throw error | Return element | Throw error  | Yes                 |
| findAllBy...  | Throw error | Return array   | Return array | Yes                 |

> **React Testing Library에서의 올바른 쿼리 사용법**
>
> 참고: [Common mistakes with React Testing Library](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
>
> 1. 요소가 없음을 증명할 때만 `query*` 함수를 사용해라
>
> ```ts
> // ❌
> expect(screen.queryByRole("alert")).toBeInTheDocument();
>
> // ✅
> expect(screen.getByRole("alert")).toBeInTheDocument();
> expect(screen.queryByRole("alert")).not.toBeInTheDocument();
> ```
>
> 2. 즉시 이용할 수 없는 요소를 찾을 때 `waitFor` 대신 `find*` 함수를 사용해라
>
> ```ts
> // ❌
> const submitButton = await waitFor(() =>
>   screen.getByRole("button", { name: /submit/i })
> );
>
> // ✅
> const submitButton = await screen.findByRole("button", { name: /submit/i });
> ```

## 상호작용 테스트

- `@testing-library/user-event` 라이브러리를 사용하는 것을 권장한다.
- `@testing-library/react` 에서 제공하는 `fireEvent` 보다 사용자 상호작용을 실제와 더 가깝게 재현할 수 있다.
- 참고: [공식문서 - Differences from fireEvent](https://testing-library.com/docs/user-event/intro/#differences-from-fireevent)

```ts
// Click 이벤트만 발생
fireEvent.click(screen.getByRole("button", { name: "테스트" }));

// Click 이벤트 + Mouseover 이벤트와 같이 발생가능한 모든 이벤트 발생
userEvent.click(screen.getByRole("button", { name: "테스트" }));
```

## 커스텀 매처 사용하기

- `@testing-library/jest-dom` 라이브러리에서 추가적인 매처를 제공한다.
- DOM 상태를 쉽게 검증할 수 있는 커스텀 매처를 사용하자
- 예시: `toBeDisabled`, `toBeEnabled`, `toBeInTheDocument`, `toHaveTextContent`, `toBeChecked` 등

```ts
const button = screen.getByRole("button", { name: /disabled button/i });

// ❌
expect(button.disabled).toBe(true);
// error message:
//  expect(received).toBe(expected) // Object.is equality
//
//  Expected: true
//  Received: false

// ✅
expect(button).toBeDisabled();
// error message:
//   Received element is not disabled:
//     <button />
```

## AAA 패턴

- Arrange(준비), Act(실행), Assert(검증) 형태로 테스트 코드 작성 (가독성 향상)

```ts
test("유효성 검사 에러가 발생하면 '올바르지 않은 값이 포함되어 있습니다'가 표시된다", async () => {
  render(<RegisterAddress />); // Arrange
  await fillInvalidValuesAndSubmit(); // Act
  expect(
    screen.getByText("올바르지 않은 값이 포함되어 있습니다")
  ).toBeInTheDocument(); // Assert
});
```

> Given-When-Then 패턴과 유사하다! 테스트 코드도 결국 유지보수해야 하는 코드라서 가독성이 중요한 것 같다.

## Snapshot 테스트

- 스냅샷을 활용해 회귀 테스트를 실행할 수 있다.
- `toMatchSnapshot`: 이미 생성된 스냅샷과 현 시점의 스냅샷을 비교해 차이점을 발견하면 테스트가 실패한다.
