# 7. 웹 어플리케이션 통합 테스트

## **React Context와 통합 테스트**

### **테스트 목적**

- `ToastProvider`를 사용하여 `showToast` 함수가 정상적으로 동작하는지 검증한다.
- 초기 상태를 주입하여 렌더링된 내용을 검증하는 방식을 활용한다.
- `test.each`를 사용하여 여러 케이스를 한 번에 검증하고 코드 중복을 줄인다.

### **테스트 코드**

```tsx

import { render, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastProvider";

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

```

## **Next.js 라우터와 테스트**

### **테스트 목적**

- `next-router-mock`을 활용하여 테스트 환경에서 라우팅 동작을 모킹(mocking)한다.
- 특정 URL에서 올바른 네비게이션이 활성화되는지 검증한다.
- `test.each`를 사용하여 다양한 URL 테스트를 효율적으로 수행한다.

### **테스트 코드**

```tsx

import { render, screen } from "@testing-library/react";
import { useRouter } from "next/router";
import mockRouter from "next-router-mock";

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

## **입력 값 변경 테스트**

### **테스트 목적**

- 특정 URL에 따라 콤보박스의 기본 선택값이 달라지는지 검증한다.
- 사용자가 선택을 변경했을 때 `status` 쿼리 파라미터가 올바르게 업데이트되는지 확인한다.
- `mockRouter` 객체를 활용하여 URL 변경을 테스트한다.

### **테스트 코드**

```tsx
import { render, screen, fireEvent } from "@testing-library/react";
import mockRouter from "next-router-mock";

function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption };
}

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

## **네트워크 요청과 테스트**

### **테스트 목적**

- `MSW(Mock Service Worker)`를 활용해 네트워크 응답을 가로채어 테스트 환경을 구성한다.
- 테스트에서 API 요청을 모킹하여 실제 서버 없이도 데이터 처리가 가능하도록 한다.

### **테스트 코드**

```tsx

import { rest } from "msw";
import { setupServer } from "msw/node";
import { render, screen } from "@testing-library/react";

export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers);
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  return server;
}

setupMockServer(...MyPosts.handlers, ...MyProfile.handlers);
```

## **폼 유효성 검사 테스트**

### **테스트 목적**

- 입력값이 유효하지 않을 때 적절한 오류 메시지가 표시되는지 확인한다.
- `waitFor`를 활용하여 비동기적으로 오류 메시지가 뜨는 타이밍까지 기다린다.
- `jest.fn()`을 활용해 폼 이벤트 핸들러를 모킹하여 실행 여부를 검증한다.

### **테스트 코드**

```tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MyForm from "./MyForm";

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();
  await saveAsDraft();
  await waitFor(() =>
    expect(
      screen.getByRole("textbox", { name: "제목" })
    ).toHaveErrorMessage("한 글자 이상의 문자를 입력해주세요")
  );
});

```

## **이미지 업로드 테스트**

### **테스트 목적**

- 사용자가 파일을 선택하면 올바르게 미리보기가 표시되는지 확인한다.
- `fireEvent.change`를 사용하여 파일 업로드 이벤트를 모킹한다.
- `getByAltText`를 활용하여 이미지가 렌더링되는지 검증한다.

### **테스트 코드**

```tsx
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

export function mockUploadImage(status?: ErrorStatus) {
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, "uploadImage")
      .mockRejectedValueOnce(new HttpError(status).serialize());
  }
  return jest
    .spyOn(UploadImage, "uploadImage")
    .mockResolvedValueOnce(uploadImageData);
}

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

```

## 번외)켄트도즈의 테크닉

인터랙션 테스트 파트에서는 Kent C. Dodds의 블로그에서 소개된 설정 함수(setup function) 테크닉을 사용하고 있다. 이외에도 블로그에서 소개된 다른 테크닉이 있는지 살펴보자.

### **1️⃣ 테스트 중첩(Nesting) 피하기**

describe 안에 describe를 너무 많이 쓰면 가독성이 떨어짐.
중첩 없이 독립적인 테스트로 작성하는 것을 권장함.
****

❌ **나쁜 예시 (불필요한 중첩)**

```jsx
describe("Counter", () => {
  describe("when clicking the button", () => {
    it("increases the count", () => {
      render(<Counter />);
      fireEvent.click(screen.getByText("Increase"));
      expect(screen.getByText("Count: 1")).toBeInTheDocument();
    });
  });
});
```

✅ **좋은 예시 (단순한 구조)**

```jsx
test("increases the count when clicking the button", () => {
  render(<Counter />);
  fireEvent.click(screen.getByText("Increase"));
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

### **2️⃣ 불필요한 헬퍼 함수 만들지 않기**

작은 테스트에서는 clickButton(), changeInput() 같은 함수를 만들 필요 없음!

❌ **나쁜 예시 (불필요한 함수화)**

```jsx
const clickButton = (text) => fireEvent.click(screen.getByText(text));

it("increases the count", () => {
  render(<Counter />);
  clickButton("Increase");
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

✅ **좋은 예시 (직접 실행)**

```jsx
it("increases the count", () => {
  render(<Counter />);
  fireEvent.click(screen.getByText("Increase"));
  expect(screen.getByText("Count: 1")).toBeInTheDocument();
});
```

### **3️⃣ `beforeEach` 남용하지 않기**

AHA (Avoid Hasty Abstractions) 원칙에 따라 성급한 추상화를 피하고 중복되는 코드를 작성함.

`beforeEach`를 사용하면 변수 재할당이 발생하고, 값이 어디서 할당되었는지 찾기 어려움

대신 함수로 공용 셋업/액션을 관리하면 가독성과 유지보수성이 향상됨
****

❌ **나쁜 예시 (`beforeEach`를 불필요하게 사용)**

```jsx

describe("Login", () => {
//변수 재할당 발생
  let input, button;

  beforeEach(() => {
    render(<Login />);
    input = screen.getByPlaceholderText("Enter username");
    button = screen.getByText("Login");
  });

  test("logs in successfully", () => {
    fireEvent.change(input, { target: { value: "user123" } });
    fireEvent.click(button);
    expect(screen.getByText("Welcome, user123!")).toBeInTheDocument();
  });

  test("shows error on empty input", () => {
    fireEvent.click(button);
    expect(screen.getByText("Username is required")).toBeInTheDocument();
  });
});
```

✅ **좋은 예시 (`beforeEach` 없이 개별 테스트마다 초기화)**

```jsx

const setup = () => {
  render(<Login />);
  return {
    input: screen.getByPlaceholderText("Enter username"),
    button: screen.getByText("Login"),
  };
};

test("logs in successfully", () => {
  const { input, button } = setup();
  fireEvent.change(input, { target: { value: "userPark" } });
  fireEvent.click(button);
  expect(screen.getByText("Welcome, userPark!")).toBeInTheDocument();
});

test("shows error on empty input", () => {
  const { button } = setup();
  fireEvent.click(button);
  expect(screen.getByText("Username is required")).toBeInTheDocument();
});
```