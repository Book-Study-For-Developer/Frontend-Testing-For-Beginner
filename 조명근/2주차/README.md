# UI 컴포넌트 테스트

## 1. 기초 지식

UI 컴포넌트는 작은 단위의 컴포넌트들이 모여서 중간크기, 화면크기의 페이지를 이룬다.
각 컴포넌트들의 역할이 옳바르게 동작하는지 확인하는 테스트 코드를 작성하므로써 애플리케이션의 품질을 보장한다.

UI 컴포넌트의 역할은 아래와 같다.

- 데이터 렌더링
- 사용자의 입력 전달
- 웹 API와의 연동
- 데이터의 동적 변경

위 역할을 충분히 수행하는지를 검수할 수 있게 테스트 코드를 작성해야 한다.

## 2. 테스트 라이브러리

UI 컴포넌트 테스트는 실제 렌더링된 UI를 조작하고 테스트한다.

이를 위해서 DOM API가 필요하고 가상 테스트환경을 제공할 수 있는 **jsdom**이 필요하다.

`@testing-library/jest-dom` 이 역할을 수행한다.

테스팅 라이브러리는 세가지 역할을 수행한다.

1. UI 컴포넌트 렌더링
2. 렌더링된 요소에서 임의의 자식 요소 취득
   1. → 렌더링된 요소를 js에서 가져올 수 있도록 함.
3. 렌더링된 요소에 인터렉션을 일으킴

실제 검수하기 위한 과정 작성은 `@testing-library/react` 가 역할을 수행한다.

테스트를 작성할때는 **“테스트는 소프트웨어의 사용법과 유사해야한다”** 는 원칙을 가지고 실제 사용 프로세스와 유사하게 작성한다.

이때 `@testing-library/dom` 라이브러리를 코어로 사용하고, 해당 라이브러리는 `@testing-library/react` 에서 내장한다.

### 생각정리

`@testing-library/jest-dom` 과 `@testing-library/dom` 은 뭐가 다른가?

→ `jest-dom`은 DOM 상태를 **체크**하는 역할을 하고 `dom` 은 DOM을 **탐색**하고 **이벤트를 발생**시킨다.

- `@testing-library/jest-dom`
  - dom관련 macher들을 제공
    - toBeInTheDocument
    - toHaveTextContent
    - toBeVisible
- `@testing-library/dom`
  - 브라우저 환경에서 DOM 요소를 선택하고 상호작용하는 함수 제공
    - getByText
    - getByRole
    - queryByTestId
    - fireEvent

## 3. 테스트 작성

- getByText
  - 비효율적이라고 생각함.
  - 국제화 대응은 어떻게 할지? 등 관리하기 힘듦
- getByRole
  - 접근성 테스트시 heading, footer등의 컴포넌트를 간단히 불러와 사용할 수 있음
- fireEvent
- within
  - 리스트 간소화
  ```tsx
  test("items의 수만큼 목록을 표시한다", () => {
    render(<ArticleList items={items} />);
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });
  ```
- queryBy
  - getBy는 “존재”를 검증 했다면, queryBy는 “존재하지 않음”을 검증함
    - getBy는 존재가 없을때 에러를 반환하기 때문
  ```tsx
  test("목록에 표시할 데이터가 없으면 '게재된 기사가 없습니다'를 표시한다", () => {
    // 빈 배열을 items에 할당하여 목록에 표시할 데이터가 없는 상황을 재현한다.
    render(<ArticleList items={[]} />);
    // getByRole 이면 list를 찾지 못했기 때문에 에러 발생
    const list = screen.queryByRole("list");
    expect(list).not.toBeInTheDocument();
    expect(list).toBeNull();
    expect(screen.getByText("게재된 기사가 없습니다")).toBeInTheDocument();
  });
  ```
- dom 요소 취득 API 권장 우선순위
  - getByRole → **제일 자주 사용 예정**
  - getByLabelText
  - getByPlaceholderText
  - getByText
  - getByDisplayValue
  - getByAltText
  - getByTitle
  - getByTestId
    - test-id 를 넣고 테스트하는게 편해서 자주 사용했었음.
    - 접근성을 전혀 고려하지 않은 방향이기 때문에 접근성 테스트가 같이 필요한 경우라면 최후의 수단으로 사용된다고 함.
      → 접근성을 고려해서 코드를 작성하는걸 권장. getByRole을 좀더 깊게 공부할 필요 있음.
- Form 테스트 예시 (fieldset)
  ```tsx
  test("fieldset의 접근 가능한 이름을 legend에서 인용합니다", () => {
    render(<Agreement />);
    expect(
      // Question: 왜 group인가?
      screen.getByRole("group", { name: "이용 약관 동의" })
    ).toBeInTheDocument();
  });
  ```
  - fieldset의 접근성(A11y) 관점에서 암묵적으로 group 역할을 가지게 됨.
  - 따라서 위에서 가져온 group은 fieldset이고, fieldset에 적용된 legend가 해당 group의 name이 됨.
  ```tsx
  // 에러 발생 코드.
  test("비밀번호 입력란", async () => {
    render(<InputAccount />);
    // 의도: <input type="password" /> 가져오기
    const textbox = screen.getByRole("textbox", { name: "비밀번호" });
    expect(textbox).toBeInTheDocument();
  });
  ```
  - input type이 password인 요소는 role이 없기 때문에 가져올 수 없다.
    - https://github.com/w3c/aria/issues/935
      - 요약: 보안 및 접근성 측면에서 더 논의가 필요함.
  - password 요소를 가져오려면 getByPlaceholderText 등의 방법으로 가져와야함.
- checkbox 테스트 예시
  ```tsx
  test("체크 박스가 체크되어 있지 않습니다", () => {
    render(<Agreement />);
    expect(screen.getByRole("checkbox")).not.toBeChecked();
  });
  ```
- Form 테스트 예시 (aria-labelledby)

  - aria-labelledby에 설정한 headingId와 h2의 id로 지정하면 h2를 접근 가능한 이름으로 인용 가능하다.

  ```tsx
  // component
  export const Form = () => {
    const [checked, setChecked] = useState(false);
    const headingId = useId(); // react18에서 추가된 useId로 접근성에 필요한 ID값 발급 및 관리 가능.
    return (
      <form aria-labelledby={headingId}>
        <h2 id={headingId}>신규 계정 등록</h2>
        /** 생략 */
      </form>
    );
  };

  // test
  test("form의 접근 가능한 이름은 heading에서 인용합니다", () => {
    render(<Form />);
    expect(
      screen.getByRole("form", { name: "신규 계정 등록" })
    ).toBeInTheDocument();
  });
  ```

- UserEvent

  - user가 선택해야 하는 행동을 `@testing-library/user-event` 의 userEvent에 저장시키고
    입력, 선택한 값을 그대로 반환하는 패턴

  ```tsx
  const user = userEvent.setup();

  async function inputDeliveryAddress(
    inputValues = {
      postalCode: "16397",
      prefectures: "경기도",
      municipalities: "수원시 권선구",
      streetNumber: "매곡로 67",
    }
  ) {
    // inputValue 그대로 입력
    await user.type(
      screen.getByRole("textbox", { name: "우편번호" }),
      inputValues.postalCode
    );

    /** 생략 */

    // inputValue 그대로 반환
    return inputValues;
  }
  ```

- AAA 패턴
  - 준비, 실행, 검증 → Arrange, Act, Assert 의 줄임말
  - 가독성을 위한 패턴
- 스냅샷 테스트
  - toMatchSnapshot

### 생각정리

- 이번 장은 예시가 많아서 이해하기 편한듯.
- getByRole에 따라 컴포넌트를 접근성 좋게 잘 구성해야 테스트하기도 편하다
- react-query를 사용했을 때 test도 동일하게 함수 mocking해서 진행되면 되는지 궁금해서 찾아봤음

  - [react-query testing 공식 document](https://tanstack.com/query/v4/docs/framework/react/guides/testing)
  - [MSW 사용 예시](https://tkdodo.eu/blog/testing-react-query)
  - 보통 msw 사용해서 api 모팅하고 hook 호출.
    - queryClient 생성해서 provider까지 호출.

  ```tsx
  // user.test.ts

  // msw로 api mokcing
  const server = setupServer(
    rest.get("/api/data", (req, res, ctx) => {
      return res(ctx.json({ message: "데이터 불러옴!" }));
    })
  );

  // 테스트 전후 서버 lifecycle
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  // queryClient 분리 - retry 끄기 가능
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  // provider 분리
  const wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  test("데이터가 화면에 표시되는지", async () => {
    // react-query hook 렌더링 - Arrange
    const { result, waitFor } = renderHook(() => useCustomHook(), { wrapper });

    // hook 완료 기다림 - Act
    await waitFor(() => result.current.isSuccess);

    // 테스트 - Assert
    expect(result.current.data).toEqual("Hello");
  });
  ```

## 4. 암묵적 역할과 접근가능한 이름

- button element → role이 button임.
  - 이런걸 암묵적 역할이라 함
  - 만약 다른 요소에 button role을 부여해야 한다면 role을 명시한다.
  ```tsx
  ...
  <div role="button">버튼이 되고싶다</div>
  ...
  ```

### 생각정리

- 요소를 가져오고 이벤트를 만드는 Arrange, Act 과정이 작성하는데 제일 까다롭다고 생각됨.
- 여기서 가장 자주 사용되는 API는 `getByRole`이라고 여겨짐.
  - `getByRole`에서 잘 사용할 수 있는 코드는 접근성 또한 잘 지켜진 시멘틱한 코드라고 생각됨.
- `getByRole`을 어떻게 하면 잘 사용할 수 있는가?
  - [getByRole API](https://testing-library.com/docs/queries/byrole/#api)
  - 기본 형태: `screen.getByRole(roleName, options);`
  - `roleName` 은 굉장히 많은데 아래 문서에서 볼 수 있다.
    - [w3 document](https://www.w3.org/TR/html-aria/#docconformance)
      - 일부 예시
        - button: `<button>`
        - textbox: `<input type="text">, <textarea>, <input type="password">`
        - combobox: `<select>`
        - link: `<a href=""/>`
        - group: `<fieldset> 등`
    - 수동으로 지정할 수도 있다.
      - `<div role="button">클릭하세요</div>`
  - options는 `aria-*` 에서 `*` 에 해당되는 속성을 의미한다.
    - 예를들어, `current` 는 `aria-current` 를 의미하고, 아래 코드의 요소는 이렇게 가져올 수 있다.
      - `getByRole('link', { current: 'page' })`  → 👍
      - `getByRole('link', { current: false })` → 👎
      ```tsx
      <body>
        <nav>
      	  <!-- current="page" -->
          <a href="current/page" aria-current="page">👍</a>
      	  <!-- current=false -->
          <a href="another/page">👎</a>
        </nav>
      </body>
      ```
