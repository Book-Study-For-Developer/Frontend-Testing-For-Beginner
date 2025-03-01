7장 부터는 새로운 레포지토리에서 테스트 코드를 작성하는데 로컬을 돌리려면 서버를 추가 세팅해야해서 테스트가 안되네요

## React Context와 통합 테스트

Toast 컴포넌트를 테스트하는 코드

```tsx
// src/components/providers/ToastProvider/index.test.tsx
// #### 1.테스트용 컴포넌트를 만들어 인터랙션 실행하기

const user = userEvent.setup();

const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction(); // <Toast>를 표시하기 위한 훅
  return <button onClick={() => showToast({ message })}>show</button>;
};

test("showToast를 호출하면 Toast컴포넌트가 표시된다", async () => {
  const message = "test";
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );
  // 처음에는 렌더링되지 않는다.
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button"));
  // 렌더링됐는지 확인한다.
  expect(screen.getByRole("alert")).toHaveTextContent(message);
});

// ### 2.초기값을 주입해서 렌더링된 내용 확인하기

test("Succeed", () => {
  const state: ToastState = {
    isShown: true,
    message: "성공했습니다",
    style: "succeed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});

test("Failed", () => {
  const state: ToastState = {
    isShown: true,
    message: "실패했습니다",
    style: "failed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});

// 여러개의 테스트를 한번에 처리한다.
test.each([
  { isShown: true, message: "성공했습니다", style: "succeed" },
  { isShown: true, message: "실패했습니다", style: "failed" },
  { isShown: true, message: "통신 중입니다", style: "busy" },
] as ToastState[])("$message", (state) => {
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});
```

→ 어찌보면 토스트 공통 모듈을 개발하였으니 이를 위한 테스트코드를 만들고, 토스트 공통 모듈이 수정되었을 때 이 테스트 코드를 돌기 때문에 리팩토링에 안전성을 보장한다.

## Next.js 라우터와 렌더링 통합 테스트

테스트 환경에서는 실제로 Router 동작을 실행할 수 없으니 `next-router-mock`을 통해 테스트 해야 한다.

```tsx
// src/components/layouts/BasicLayout/Header/Nav/index.test.tsx

test("현재 위치는 'My Posts'이다", () => {
  // 현재 라우터를 세팅한다.
  mockRouter.setCurrentUrl("/my/posts");
  render(<Nav onCloseMenu={() => {}} />);
  // 네비게이션을 클릭하면 현재 페이지가 잘 설정되었는지 체크한다.
  const link = screen.getByRole("link", { name: "My Posts" });
  expect(link).toHaveAttribute("aria-current", "page");
});

test("현재 위치는 'Create Post'이다", () => {
  mockRouter.setCurrentUrl("/my/posts/create");
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name: "Create Post" });
  expect(link).toHaveAttribute("aria-current", "page");
});

// 각 페이지별로 선택후 제대로 페이지 이동이 되는지 체크한다.
test.each([
  { url: "/my/posts", name: "My Posts" },
  { url: "/my/posts/123", name: "My Posts" },
  { url: "/my/posts/create", name: "Create Post" },
])("$url의 현재 위치는 $name이다", ({ url, name }) => {
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

## Next.js 라우터와 입력 통합 테스트

```tsx
// src/components/templates/MyPosts/Posts/Header/index.test.tsx

const user = userEvent.setup();

/**
 * 입력 통합 테스트 전에 필요한 함수를 만들어 놓는다.
 * url에 따라 콤보 박스의 선택 값이 달라지도록 하는 함수
 */
function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption };
}

test("기본값으로 '모두'가 선택되어 있다", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue("모두");
});

test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=public");
  expect(combobox).toHaveDisplayValue("공개");
});

test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=private");
  expect(combobox).toHaveDisplayValue("비공개");
});

// 최종적으로 url을 변경을 하도록 하고 모든 테스트를 한번에 할 수 있도록 구성할 수도 있다.
test("공개 여부를 변경하면 status가 변한다", async () => {
  const { selectOption } = setup();
  expect(mockRouter).toMatchObject({ query: { page: "1" } });
  // '공개'를 선택하면 ?status=public이 된다.
  await selectOption("공개");
  // 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "public" },
  });
  // '비공개'를 선택하면 ?status=private이 된다.
  await selectOption("비공개");
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "private" },
  });
});
```

## 폼 유효성 검사 테스트

제어 컴포넌트 vs 비제어 컴포넌트

https://ko.react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components

제어 컴포넌트

- 제어 컴포넌트는 React의 상태(state)를 사용하여 데이터를 관리한다.
- 컴포넌트의 상태(state)를 업데이트하고, 이를 컴포넌트의 속성(props)로 전달하여 UI를 제어한다.

비제어 컴포넌트

- 비제어 컴포넌트는 React의 상태(state)를 사용하지 않고, DOM을 직접 조작하여 데이터를 관리한다.
- 컴포넌트가 자체적으로 상태(state)를 가지지 않으며, 사용자 입력에 대한 DOM 이벤트를 직접 처리한다.

여러 테스트 환경에 필요한 함수들이다.

`MSW`를 사용하여 네트워크 응답을 가로채어 프론트엔드 테스트/개발 환경에 쉽게 사용할 수 있는 것이다.

```tsx
// src/tests/jest.ts

// msw를 통해 목 서버환경을 구성한다.
export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
}

// 이미지를 가져오는 유틸 함수
export function selectImageFile(
  inputTestId = "file",
  fileName = "hello.png",
  content = "hello"
) {
  // userEvent를 초기화한다.
  const user = userEvent.setup();
  // 더미 이미지 파일을 작성한다.
  const filePath = [`C:\\fakepath\\${fileName}`];
  const file = new File([content], fileName, { type: "image/png" });
  // render한 컴포넌트에서 data-testid="file"인 input을 취득한다.
  const fileInput = screen.getByTestId(inputTestId);
  // 이 함수를 실행하면 이미지 선택이 재현된다.
  const selectImage = () => user.upload(fileInput, file);
  return { fileInput, filePath, selectImage };
}
```

[`waitFor`](https://testing-library.com/docs/dom-testing-library/api-async/#waitfor)이라는 비동기 함수는 재시도를 위해 사용한다.

→ 유효성 검사 오류가 나타나는 데 시간이 걸려 단언문을 계속 시도하도록 처리한다.

```tsx
// src/components/templates/MyPostsCreate/PostForm/index.test.tsx

const user = userEvent.setup();

function setup() {
  /**
   * form에 쓰이는 이벤트 핸들러들을 목 함수로 만든다.
   * 즉, form 컴포넌트 내에서 목 함수들이 실행되었는지 체크가 가능하다.
   */
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <PostForm
      title="신규 기사"
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInvalid}
    />
  );
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
  }
  async function saveAsDraft() {
    await user.click(
      screen.getByRole("button", { name: "비공개 상태로 저장" })
    );
  }
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    onClickSave,
    onValid,
    onInvalid,
  };
}

setupMockServer(handleGetMyProfile());

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();
  await saveAsDraft();
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "제목" })).toHaveErrorMessage(
      "한 글자 이상의 문자를 입력해주세요"
    )
  );
});

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  await saveAsDraft();
  // Form의 함수들이 호출되었는지도 같이 체크
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});

test("유효한 입력 내용으로 '비공개 상태로 저장'을 시도하면 onValid 이벤트 핸들러가 실행된다", async () => {
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();
  // 제목 입력
  await typeTitle("나의 기사");
  // 이미지 선택
  await selectImage();
  // 비공개 상태로 저장
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});

test("유효한 입력 내용으로 '공개하기'를 시도하면 onClickSave 이벤트 핸들러만 실행된다", async () => {
  const { typeTitle, saveAsPublished, onClickSave, onValid, onInvalid } =
    setup();
  await typeTitle("나의 기사");
  await saveAsPublished();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});
```

### 💡 접근성 관련 매치

입력 상태에 따라 ARIA 속성으로 접근성 표기를 해 오류를 알려주는 처리가 있다.

⇒ `aria-invalid`, `aria-errormessage` 접근성 속성을 통해 오류를 알 수 있다.

```tsx
// src/components/molecules/TextboxWithInfo/index.test.tsx

test("TextboxWithInfo", async () => {
  render(<FullProps />);
  expect(screen.getByRole("textbox")).toHaveAccessibleName("제목");
  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    "영문과 숫자를 조합하여 64자 이내로 입력해주세요"
  );
  expect(screen.getByRole("textbox")).toHaveErrorMessage(
    "유효하지 않은 문자가 포함되어 있습니다"
  );
});

test("TextboxWithInfo", async () => {
  const args = {
    title: "제목",
    info: "0 / 64",
    description: "영문과 숫자를 조합하여 64자 이내로 입력해주세요",
    error: "유효하지 않은 문자가 포함되어 있습니다",
  };
  render(<TextboxWithInfo {...args} />);
  const textbox = screen.getByRole("textbox");
  // label의 htmlFor와 연관돼 있다.
  expect(textbox).toHaveAccessibleName(args.title);
  // aria-describedby와 연관돼 있다.
  expect(textbox).toHaveAccessibleDescription(args.description);
  // aria-errormessage와 연관돼 있다.
  expect(textbox).toHaveErrorMessage(args.error);
});
```

## 웹 API 통합 테스트

컴포넌트 동작 방식

- 비공개 상태로 저장하면 비공개한 기사 화면으로 이동
- 공개를 시도하면 Dialog를 띄운다.
  - 아니오 선택 시 경고창이 사라진다.
  - 네 선택 시 공개로 변경된다.

```tsx
// src/components/templates/MyPostsCreate/index.test.tsx

// 스토리북에서 기본 값의 컴포넌트를 불러온다.
const { Default } = composeStories(stories);
const user = userEvent.setup();

async function setup() {
  const { container } = render(<Default />);
  const { selectImage } = selectImageFile();
  async function typeTitle(title: string) {
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
    await screen.findByRole("alertdialog");
  }
  async function saveAsDraft() {
    await user.click(
      screen.getByRole("button", { name: "비공개 상태로 저장" })
    );
  }
  async function clickButton(name: "네" | "아니오") {
    await user.click(screen.getByRole("button", { name }));
  }
  return {
    container,
    typeTitle,
    saveAsPublished,
    saveAsDraft,
    clickButton,
    selectImage,
  };
}
```

```tsx
// src/components/templates/MyPostsCreate/index.test.tsx

setupMockServer(...MyPosts.handlers, ...MyProfile.handlers);

// 매 테스트마다 이미지를 업로드하고, 현재 경로를 생성하는 곳으로 위치시킨다.
beforeEach(() => {
  mockUploadImage();
  mockRouter.setCurrentUrl("/my/posts/create");
});

describe("AlertDialog", () => {
  test("공개를 시도하면 AlertDialog가 표시된다", async () => {
    const { typeTitle, saveAsPublished, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    expect(
      screen.getByText("기사를 공개합니다. 진행하시겠습니까?")
    ).toBeInTheDocument();
  });

  test("[아니오] 버튼을 누르면 AlertDialog가 사라진다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("아니오");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다", async () => {
    const { saveAsPublished, clickButton, selectImage } = await setup();
    // await typeTitle("201");　제목을 입력하지 않은 상태
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    // 제목 입력란이 invalid 상태가 된다.
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "제목" })).toBeInvalid()
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});

describe("Toast", () => {
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("저장 중입니다...")
    );
  });

  test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("hoge");
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("공개됐습니다")
    );
  });

  test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("500");
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("공개에 실패했습니다")
    );
  });
});

describe("화면이동", () => {
  test("비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다", async () => {
    const { typeTitle, saveAsDraft, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsDraft();
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });

  test("공개에 성공하면 화면을 이동한다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });
});
```

테스트 하는 코드를 살펴보면 기획에서 요구하는 사항들을 TC로 만들어서 정확히동작하는지 체크하는게 대부분인 것 같다.

## 이미지 업로드 통합 테스트

- 컴퓨터에 저장된 이미지를 선택하여 업로드를 시도
- 이미지 업로드에 성공하면 프로필 이미지로 적용
- 이미지 업로드에 실패하면 실패했음을 알린다.

```tsx
// src/components/templates/MyProfileEdit/Avatar/index.test.tsx

function TestComponent() {
  const { register, setValue } = useForm<PutInput>();
  return BasicLayout(
    <Avatar register={register} setValue={setValue} name="imageUrl" />
  );
}

setupMockServer(handleGetMyProfile());

test("'이미지 변경하기'버튼이 있다", async () => {
  render(<TestComponent />);
  expect(
    await screen.findByRole("button", { name: "이미지 변경하기" })
  ).toBeInTheDocument();
});

test("이미지 업로드에 성공하면 이미지의 src 속성이 변경된다", async () => {
  // 이미지 업로드가 성공하도록 설정한다.
  mockUploadImage();
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지의 src 속성이 비었는지 확인한다.
  expect(screen.getByRole("img").getAttribute("src")).toBeFalsy();
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 이미지의 src 속성이 채워졌는지 확인한다.
  await waitFor(() =>
    expect(screen.getByRole("img").getAttribute("src")).toBeTruthy()
  );
});

test("이미지 업로드에 실패하면 경고창이 표시된다", async () => {
  // 이미지 업로드가 실패하도록 설정한다.
  mockUploadImage(500);
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 지정한 문자열이 포함된 Toast가 나타나는지 검증한다.
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "이미지 업로드에 실패했습니다"
    )
  );
});
```
