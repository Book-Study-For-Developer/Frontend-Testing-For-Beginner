### React Context와 통합 테스트

Toast 컴포넌트 테스트 하기 - Context를 테스트 하는 방법

1. 테스트용 컴포넌트를 만들어 인터랙션 실행하기

```jsx
const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction();
  return <button onClick={() => showToast({ message })}>show</button>;
};

// showToast 실행 시, Toast가 정상적으로 렌더링되는지 확인
test("showToast를 호출하면 Toast컴포넌트가 표시된다", async () => {
  const message = "test";
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );
  // 처음에는 Toast가 보이지 않아야 함
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  await user.click(screen.getByRole("button")); //유저 버튼 클릭
  // 버튼을 클릭하면 Toast가 나타나야 함
  expect(screen.getByRole("alert")).toHaveTextContent(message);
});
```

1. 초깃값을 주입해서 렌더링된 내용 확인하기
   `defaultState` 를 `Provider` 에 주입하여 초기 상태에 따라 Toast가 렌더링 되는지 확인

```jsx
test("Succeed", () => {
  const state: ToastState = {
    isShown: true,
    message: "성공했습니다",
    style: "succeed",
  }; // isShown: true => 렌더링 직후 Toast가 표시되어야 함 => 성공
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});

test("Failed", () => {
  const state: ToastState = {
    isShown: true,
    message: "실패했습니다",
    style: "failed",
  }; //isShown: true => 렌더링 직후 Toast가 표시되어야 함 => 실패
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});
```

첫번째 테스트가 useToastAction도 포함하므로 두번째보다 더 넓은 범위의 통합 테스트라고 할 수 있다.

### Next.js 라우터와 렌더링 통합 테스트

```jsx
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl("/my/posts"); // 현재 라우터를 특정 URL로 설정
  render(<Nav onCloseMenu={() => {}} />);
  // 현재 활성화된 페이지가 'My Posts'인지 확인
  const link = screen.getByRole("link", { name: "My Posts" });
  // aria-current="page" 속성이 있는지 확인
  expect(link).toHaveAttribute("aria-current", "page");
});

// 위와 동일
test("현재 위치는 'Create Post'이다", () => {
  mockRouter.setCurrentUrl("/my/posts/create");
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name: "Create Post" });
  expect(link).toHaveAttribute("aria-current", "page");
});

// 매개변수만 변경해 반복적으로 테스트하기
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

### Next.js 라우터와 입력 통합 테스트

```jsx
test("기본값으로 '모두'가 선택되어 있다", async () => {
  const { combobox } = setup();
  expect(combobox).toHaveDisplayValue("모두");
});
// URL 쿼리가 'status=public'이면 '공개'가 기본값으로 설정되는지 확인
test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=public");
  expect(combobox).toHaveDisplayValue("공개");
});

// URL 쿼리가 'status=private'이면 '비공개'가 기본값으로 설정되는지 확인
test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  const { combobox } = setup("/my/posts?status=private");
  expect(combobox).toHaveDisplayValue("비공개");
});

test("공개 여부를 변경하면 status가 변한다", async () => {
  const { selectOption } = setup();
  // 초기 URL 상태 확인 (쿼리에는 `page=1`만 있음)
  expect(mockRouter).toMatchObject({ query: { page: "1" } });
  // '공개'를 선택하면 '?status=public'이 추가되어야 함
  await selectOption("공개");
  // 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "public" },
  });
  // '비공개'를 선택하면 '?status=private'으로 변경되어야 함
  await selectOption("비공개");
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "private" },
  });
});
```

1. 라우터의 URL 쿼리에 따라 초기 상태가 올바르게 설정되는지 확인한다
2. 사용자가 입력(콤보 박스 선택)했을 때 URL이 변경되는지 확인한다
3. Next.js 라우터를 직접 사용할 수 없으므로 `next-router-mock`을 활용해야 한다.
4. 테스트에서는 `mockRouter.setCurrentUrl()`을 사용해 URL을 설정한다.

### 폼 유효성 검사 테스트

### React Hook Form

폼을 전송하기 전에 입력된 내용을 참조하기 때문에 폼을 구현할 때 먼저 `어디에서 입력 내용을 참조할 것인지` 를 정해야 한다. <br>
리액트에서 입력 내용을 참조하는 방법은 제어 컴포넌트일 때와 비제어 컴포넌트일 때로 나뉜다.

### 제어 컴포넌트 & 비제어 컴포넌트

`제어 컴포넌트`

useState 등을 사용해 컴포넌트 단위로 상태를 관리하는 컴포넌트이다.
제어 컴포넌트로 구현된 폼은 관리 중인 상태를 필요한 타이밍에 웹 API 로 보낸다.

`비제어 컴포넌트`

폼을 전송할 때 `<input>`등의 입력 요소에 브라우저 고유 기능을 사용해 값을 참조하도록 구현한다.<br>
상태를 관리하지 않아도 되고, ref를 통해 DOM의 값을 참조한다.

React Hook Form 은 비제어 컴포넌트로 고성능 폼을 쉽게 작성할 수 있도록 도와주는 라이브러리이다.

**TIP: 접근성 관련 매치**

현재 상태를 ARIA 속성으로 판단한다.

`aria-invalid`, `aria-errormessage` 는 입력 내용에 오류가 있다는 것을 알리는 속성이다.

Props의 error가 undefined가 아닌 경우에는 오류로 판단한다.

```jsx
test("TextboxWithInfo", async () => {
  render(<FullProps />);
  // 제목이 aria-labelledby 속성으로 올바르게 설정되었는지
  expect(screen.getByRole("textbox")).toHaveAccessibleName("제목");
  // 설명이 aria-describedby 속성으로 올바르게 설정되었는지
  expect(screen.getByRole("textbox")).toHaveAccessibleDescription(
    "영문과 숫자를 조합하여 64자 이내로 입력해주세요"
  );
  // 오류 메시지가 aria-errormessage 속성으로 올바르게 설정되었는지
  expect(screen.getByRole("textbox")).toHaveErrorMessage(
    "유효하지 않은 문자가 포함되어 있습니다"
  );
});
//➡️ aria 속성을 검증함으로서 프로젝트 전체의 접근성 향상가능하다.

test("TextboxWithInfo", async () => {
  const args = {
    title: "제목",
    info: "0 / 64",
    description: "영문과 숫자를 조합하여 64자 이내로 입력해주세요",
    error: "유효하지 않은 문자가 포함되어 있습니다",
  };
  render(<TextboxWithInfo {...args} />);
  const textbox = screen.getByRole("textbox");
  expect(textbox).toHaveAccessibleName(args.title);
  expect(textbox).toHaveAccessibleDescription(args.description);
  expect(textbox).toHaveErrorMessage(args.error);
});
```

### 웹 API 응답을 목 객체화하는 MSW

**MSW**

네트워크 계층의 목 객체를 만드는 라이브러리

MSW를 사용하면 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체할 수 있다.

웹 API 서버를 실행하지 않아도 응답이 오는 상황을 재현할 수 있기 때문에 통합 테스트를 할 때 목 서버로 사용할 수 있다.

- 웹 API 요청을 가로채려면 요청 핸들러를 이용해야 한다.

**Fetch API 폴리필**

- `jsdom`에 Fetch API 적용이 안된다.
  ⇒ Fetch API를 사용한 코드가 테스트 대상에 포함되면 테스트는 실패
- MSW를 사용해 네트워크 계층을 목 객체화할 때는 문제 발생
  ➡️ 폴리필인 `whatwg-fetch` 사용
  - 모든 테스트에 적용되도록 설정 파일에서 불러오면 해결 가능

### 웹 API 통합 테스트

테스트 대상: `MyPostsCreate` 컴포넌트

- 비공개 상태로 저장 시 → 비공개한 기사 페이지로 이동
- 공개하기를 시도 시 → `AlertDialog`가 표시됨
- 공개 실패 시 → 실패 메시지가 표시됨
- API 응답에 따라 UI가 정상적으로 동작하는지 확인

**`AlertDialog` 렌더링 테스트**

공개 직전에만 렌더링되는 컴포넌트

```jsx
describe("AlertDialog", () => {
  test("공개를 시도하면 AlertDialog가 표시된다", async () => {
    const { typeTitle, selectImage, saveAsPublished } = await setup();
    await typeTitle("201"); //제목을 입력
    await selectImage();
    await saveAsPublished();
    //AlertDialog가 표시가 되는지 확인
    expect(
      screen.getByText("기사를 공개합니다. 진행하시겠습니까?")
    ).toBeInTheDocument();
  });

  test("[아니오] 버튼을 누르면 AlertDialog가 사라진다", async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } =
      await setup();
    await typeTitle("201"); //제목을 입력
    await selectImage();
    await saveAsPublished();
    await clickButton("아니오");
    //AlertDialog가 닫혔는지 확인
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다", async () => {
    const { selectImage, saveAsPublished, clickButton } = await setup();
    await selectImage();
    await saveAsPublished();
    await clickButton("네");
    await waitFor(() => {
      //제목이 유효하지 않아야 함
      expect(screen.getByRole("textbox", { name: "제목" })).toBeInvalid();
    });
    // AlertDialog가 닫혔는지 확인
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
```

**`Toast` 렌더링 테스트**

컴포넌트가 올바른 메시지를 표시하는지 테스트

```jsx
test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
  const { typeTitle, selectImage, saveAsPublished, clickButton } =
    await setup();

  await typeTitle("201");
  await selectImage();
  await saveAsPublished(); // "공개하기" 버튼 클릭
  await clickButton("네"); // "네" 버튼 클릭

  // API 요청 중 "저장 중입니다..." 메시지가 표시되는지 확인하기
  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("저장 중입니다...");
  });
});

test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
  const { typeTitle, selectImage, saveAsPublished, clickButton } =
    await setup();

  await typeTitle("201");
  await selectImage();
  await saveAsPublished();
  await clickButton("네");

  // API 요청이 성공하면 "공개됐습니다" 메시지가 표시되는지 확인
  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("공개됐습니다");
  });
});

test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
  const { typeTitle, selectImage, saveAsPublished, clickButton } =
    await setup();

  await typeTitle("500"); //제목을 "500"으로 설정해 API 요청 실패
  await selectImage();
  await saveAsPublished();
  await clickButton("네");

  // API 요청 실패 시 "공개에 실패했습니다" 메시지가 표시되는지 확인
  await waitFor(() => {
    expect(screen.getByRole("alert")).toHaveTextContent("공개에 실패했습니다");
  });
});
```

**화면 이동 테스트**

게시물을 저장하거나 공개한 후, 적절한 페이지로 이동하는지 검사

```jsx
test("비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다", async () => {
  const { typeTitle, selectImage, saveAsDraft } = await setup();

  await typeTitle("201");
  await selectImage();
  await saveAsDraft(); // "비공개 상태로 저장" 버튼 클릭

  // API 요청 후 라우팅이 변경되었는지 확인
  await waitFor(() => {
    expect(mockRouter).toMatchObject({
      pathname: "/my/posts/201",
    });
  });
});

test("공개에 성공하면 화면을 이동한다", async () => {
  const { typeTitle, selectImage, saveAsPublished, clickButton } =
    await setup();

  await typeTitle("201");
  await selectImage();
  await saveAsPublished();
  await clickButton("네"); // 공개

  // API 요청 후 라우팅이 변경되었는지 확인
  await waitFor(() => {
    expect(mockRouter).toMatchObject({
      pathname: "/my/posts/201",
    });
  });
});
```

### 이미지 업로드 통합 테스트

이미지 업로드 기능을 가진 UI 컴포넌트 테스트 방법 살펴보기

Avatar 컴포넌트가 수행하는 작업

- 컴퓨터에 저장된 이미지를 선택하여 업로드를 시도한다.
- 이미지 업로드에 성공하면 프로필 이미지로 적용한다.
- 이미지 업로드에 실패하면 실패했음을 알린다.

```jsx
//이미지 업로드 API를 Mocking하는 함수
export function mockUploadImage(status?: number) {
  if (status && status > 299) {
    // 실패 시 uploadImage 요청을 Mocking하여 에러 반환
    return jest
      .spyOn(UploadImage, "uploadImage")
      .mockRejectedValueOnce(new HttpError(status).serialize());
  }
  // 성공 시 uploadImage가 정상적으로 응답
  return jest.spyOn(UploadImage, "uploadImage").mockResolvedValueOnce({
    url: "/uploads/avatar.png",
    filename: "avatar.png",
  });
}
```

```jsx
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

// 이미지가 정상적으로 업로드되었는지 검증
test("이미지 업로드에 성공하면 이미지의 src 속성이 변경된다", async () => {
  // 업로드 성공 시 Mocking 설정
  mockUploadImage();
  // 컴포넌트를 렌더링
  render(<TestComponent />);
  // 초기 상태 확인 : 이미지 없음
  expect(screen.getByRole("img").getAttribute("src")).toBeFalsy();
  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();
  await selectImage();
  // 이미지가 업로드된 후 `src` 속성이 변경되었는지 확인
  await waitFor(() =>
    expect(screen.getByRole("img").getAttribute("src")).toBeTruthy()
  );
});

test("이미지 업로드에 실패하면 경고창이 표시된다", async () => {
  // 업로드 실패를 Mocking (500 에러)
  mockUploadImage(500);
  render(<TestComponent />);
  const { selectImage } = selectImageFile();
  await selectImage();
  // 실패 메시지가 표시되는지 확인
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "이미지 업로드에 실패했습니다"
    )
  );
});
```
