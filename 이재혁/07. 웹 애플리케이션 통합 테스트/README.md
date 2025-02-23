# 7. 웹 애플리케이션 통합 테스트

## 1. React Context와 통합 테스트

> 반복적으로 사용하는 전역 UI 테스트

`onSubmit` 를 통해 API 통신 결과에 따른 Toast 호출을 테스트 한다.

- 성공시 - `succeed` style의 `저장됐습니다` 노출
- 실패시 - `failed` style의`오류가 발생했습니다` 오출

### 실제 사용 코드

```tsx
const { showToast } = useToastAction();
const onSubmit = handleSubmit(async (input) => {
  try {
    showToast({ message: "저장중입니다...", style: "busy" });
    await updateMyProfileEdit({ input });
    await router.push("/my/posts");
    showToast({ message: "저장됐습니다", style: "succeed" }); // <--- test
    updateProfile();
  } catch (err) {
    showToast({ message: "저장에 실패했습니다", style: "failed" }); // <--- test
  }
});
```

전역 UI 대상 테스트 중점 사항

1. `Provider`의 상태에 따라 렌더링 여부 결정
2. `Provider`의 갱신 함수로 상태 갱신 가능

### 테스트 코드 작성

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider } from "./";
import { useToastAction } from "./hooks";
import { ToastState } from "./ToastContext";

// #### 1.테스트용 컴포넌트를 만들어 인터랙션 실행하기

const user = userEvent.setup();

const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction(); // <Toast>를 표시하기 위한 훅
  // 🔵 액션에 의한 정상적인 노출만 확인하면 되니 message만 전달, showToast 실행 여부 판단
  return <button onClick={() => showToast({ message })}>show</button>;
};

test("showToast를 호출하면 Toast컴포넌트가 표시된다", async () => {
  // 1️⃣ GiVEN
  const message = "test";
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );
  // 처음에는 렌더링되지 않는다.
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();

  // 2️⃣ WHEN
  await user.click(screen.getByRole("button"));

  // 3️⃣ THEN
  // 렌더링됐는지 확인한다.
  expect(screen.getByRole("alert")).toHaveTextContent(message);
});

// ============================================================

// ### 2.초기값을 주입해서 렌더링된 내용 확인하기

test("Succeed", () => {
  // 1️⃣ GiVEN
  const state: ToastState = {
    isShown: true,
    message: "성공했습니다",
    style: "succeed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);

  // 2️⃣ THEN
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});

test("Failed", () => {
  // 1️⃣ GiVEN
  const state: ToastState = {
    isShown: true,
    message: "실패했습니다",
    style: "failed",
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);

  // 2️⃣ THEN
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});
```

---

## 2. Next.js 라우터와 렌더링 통합 테스트

> 라우터와 연관된 UI 컴포넌트 통합 테스트

### 테스트할 컴포넌트

![Screenshot 2025-02-23 at 8.42.00 PM.png](7%20%E1%84%8B%E1%85%B0%E1%86%B8%20%E1%84%8B%E1%85%A2%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%B5%E1%84%8F%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B8%20%E1%84%90%E1%85%A6%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%201a38c7b909f280e8b1c3cd1ba05b5365/Screenshot_2025-02-23_at_8.42.00_PM.png)

1. `My Posts` 를 클릭하면 `/my/posts` 로 이동한다.
2. `Create Post` 를 클릭하면 `/my/posts/create` 로 이동한다.
3. 현재 페이지와 일치하는 요소(a tag)에 `aria-current` 속성을 추가한다.

### 실제 HTML 출력물

- `My posts` 페이지에 진입한 경우

```html
<ul class="styles_list__SZsGi">
  <li>
    <a href="/my/posts" aria-current="page">My Posts</a>
  </li>
  <li>
    <a href="/my/posts/create">Create Post</a>
  </li>
</ul>
```

### 테스트 코드 작성

```tsx
import mockRouter from "next-router-mock"; // <-- 목업용 라이브러리가 있다!

test("현재 위치는 'My Posts'이다", () => {
  // 1️⃣ GiVEN
  mockRouter.setCurrentUrl("/my/posts");
  render(<Nav onCloseMenu={() => {}} />);

  // 2️⃣ THEN
  const link = screen.getByRole("link", { name: "My Posts" });
  expect(link).toHaveAttribute("aria-current", "page");
});

test("현재 위치는 'Create Post'이다", () => {
  // 1️⃣ GiVEN
  mockRouter.setCurrentUrl("/my/posts/create");
  render(<Nav onCloseMenu={() => {}} />);

  // 2️⃣ THEN
  const link = screen.getByRole("link", { name: "Create Post" });
  expect(link).toHaveAttribute("aria-current", "page");
});

// 매개변수만 바꿔서 반복 테스트를 하고 싶다면 each를 활용하자!

test.each([
  { url: "/my/posts", name: "My Posts" },
  { url: "/my/posts/123", name: "My Posts" },
  { url: "/my/posts/create", name: "Create Post" },
])("$url의 현재 위치는 $name이다", ({ url, name }) => {
  // 1️⃣ GiVEN
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);

  // 2️⃣ THEN
  const link = screen.getByRole("link", { name });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

![image.png](7%20%E1%84%8B%E1%85%B0%E1%86%B8%20%E1%84%8B%E1%85%A2%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%B5%E1%84%8F%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B8%20%E1%84%90%E1%85%A6%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%201a38c7b909f280e8b1c3cd1ba05b5365/image.png)

> [!INFO]
>
> > `next-router-mock` 라이브러리의 경우 13.5 까지는 지원되는 듯 하다
> > 24년 5월 28일 마지막 릴리즈로 변동 없음
> > 근데 예제의 router 위치가 next/navigation가 아닌 next/router 인것으로 보아 app router에 대한 지원은 라이브러리 공식문서에는 없는 듯하다.
> > [github-How to test next/navigation?](https://github.com/vercel/next.js/discussions/42527)
> > 여길보니 mock 함수로 한번 래핑해서 쓰는 듯하다?

---

## 3. Next.js 라우터와 입력 통합 테스트

> 라우터와 연관된 UI 컴포넌트 통합 테스트 + 사용자 입력 테스트

쿼리 파라미터에 따른 리스트 필터링 테스트

1. 없는 경우 or `?status=all` - 모든 리스트
2. `?status=public` - 공개 리스트
3. `?status=private` - 비공개 리스트

### 테스트할 컴포넌트

```tsx
const options = [
  { value: "all", label: "모두" },
  { value: "public", label: "공개" },
  { value: "private", label: "비공개" },
];

export const Header = () => {
  const { query, push } = useRouter();
  const defaultValue = parseAsNonEmptyString(query.status) || "all";
  return (
    <header className={styles.header}>
      <h2 className={styles.heading}>기사 목록</h2>
      <SelectFilterOption
        title="공개 여부"
        options={options} // <- 셀렉트 박스 내용
        selectProps={{
          defaultValue, // <- 초기값 설정
          onChange: (event) => {
            const status = event.target.value;
            push({ query: { ...query, status } }); // <- 선택에 따른 state query 변경
          },
        }}
      />
    </header>
  );
};
```

### 테스트 코드

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockRouter from "next-router-mock";
import { Header } from "./";

const user = userEvent.setup();

function setup(url = "/my/posts?page=1") {
  // 1️⃣ GiVEN
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption }; // <- select 요소와, change함수 제공
}

test("기본값으로 '모두'가 선택되어 있다", async () => {
  // 1️⃣ GiVEN
  const { combobox } = setup();

  // 2️⃣ THEN
  expect(combobox).toHaveDisplayValue("모두");
});

test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  // 1️⃣ GiVEN
  const { combobox } = setup("/my/posts?status=public");

  // 2️⃣ THEN
  expect(combobox).toHaveDisplayValue("공개");
});

test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  // 1️⃣ GiVEN
  const { combobox } = setup("/my/posts?status=private");

  // 2️⃣ THEN
  expect(combobox).toHaveDisplayValue("비공개");
});

test("공개 여부를 변경하면 status가 변한다", async () => {
  // 1️⃣ GiVEN
  const { selectOption } = setup();
  expect(mockRouter).toMatchObject({ query: { page: "1" } });

  // ====================================

  // 2️⃣ WHEN - '공개'를 선택하면 ?status=public이 된다.
  await selectOption("공개");

  // 3️⃣ THEN - 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "public" },
  });

  // ====================================

  // 2️⃣ WHEN - '비공개'를 선택하면 ?status=private이 된다.
  await selectOption("비공개");

  // 3️⃣ THEN
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "private" },
  });
});
```

보통은 필터링 조건이 변경되었을 때 페이지네이션도 초기화 되는 편이니 해당 조건도 추가해주면 좋을 것 같다.

구현 코드에서 status가 바뀌면 page가 1로 초기화되는 코드도 추가해보자

```tsx
push({ query: { ...query, status, page: "1" } }); // 매우 간단
```

이렇게만 작성해줘도 되지 않을까? 하는 생각이다.

```tsx
test("[공개 여부] 변경 시 페이지는 1로 초기화 된다", async () => {
  // 1️⃣ GiVEN
  const { selectOption } = setup();
  expect(mockRouter).toMatchObject({ query: { page: "4" } });

  // 2️⃣ WHEN
  await selectOption("공개");

  // 3️⃣ THEN
  expect(mockRouter).toMatchObject({
    query: { page: "1", status: "public" },
  });
});
```

---

## 4. React Hook Form으로 폼 쉽게 다루기

> 비제어 컴포넌트 기반 라이브러리인 React Hook Form 간단하게 알아보기

- 제어 컴포넌트 - state를 이용한 상태 관리 → 동적인 UI 변화가 필요하다면?
- 비제어 컴포넌트 - DOM 요소에 접근하여 값 참조

### 간단한 데모

`register`는 `ref, name, onChange, onBlur`를 `return` 하며 `validation` 적용이 가능하다

`handleSubmit`를 통해 최종적인 data를 전달 받을 수 있다.

이외에도 `useForm` 훅이 제공하는 메소드는 많다!

만약 `form`을 관리하는 자식 요소들이 분리 되어 있다면 이를 위한 `Context API`+ 기반의 컴포넌트, 훅도 제공한다.

```tsx
import { useState } from "react";
import { useForm } from "react-hook-form";

export function App() {
  const { register, handleSubmit } = useForm();
  const [data, setData] = useState("");

  return (
    <form onSubmit={handleSubmit((data) => setData(JSON.stringify(data)))}>
      <input {...register("firstName")} placeholder="First name" />
      <select {...register("category", { required: true })}>
        <option value="">Select...</option>
        <option value="A">Option A</option>
        <option value="B">Option B</option>
      </select>
      <textarea {...register("aboutYou")} placeholder="About you" />
      <p>{data}</p>
      <input type="submit" />
    </form>
  );
}
```

## 5. 폼 유효성 검사 테스트

> React Hook Form 기반 컴포넌틀 유효성 검사 로직 테스트 하기

### 테스트할 컴포넌트

![image.png](7%20%E1%84%8B%E1%85%B0%E1%86%B8%20%E1%84%8B%E1%85%A2%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%B5%E1%84%8F%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B8%20%E1%84%90%E1%85%A6%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%201a38c7b909f280e8b1c3cd1ba05b5365/image%201.png)

```tsx
type Props<T extends FieldValues = PostInput> = {
  title: string;
  children?: React.ReactNode;
  onClickSave: (isPublish: boolean) => void;
  onValid: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
};

export const PostForm = (props: Props) => {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PostInput>({
    resolver: zodResolver(createMyPostInputSchema),
  });
  return (
    <form
      aria-label={props.title}
      className={styles.module}
      onSubmit={handleSubmit(props.onValid, props.onInvalid)}
    >
      <div className={styles.content}>
        <div className={styles.meta}>
          <PostFormInfo register={register} control={control} errors={errors} />
          <PostFormHeroImage
            register={register}
            setValue={setValue}
            name="imageUrl"
            error={errors.imageUrl?.message}
          />
        </div>
        <TextareaWithInfo
          {...register("body")}
          title="본문"
          rows={20}
          error={errors.body?.message}
        />
      </div>
      <PostFormFooter
        isSubmitting={isSubmitting}
        register={register}
        control={control}
        onClickSave={props.onClickSave}
      />
      {props.children}
    </form>
  );
};

// ====================================
// 유효성 검사를 위한 zod 스키마

import * as z from "zod";

export const createMyPostInputSchema = z.object({
  title: z.string().min(1, "한 글자 이상의 문자를 입력해주세요"),
  description: z.string().nullable(),
  body: z.string().nullable(),
  published: z.boolean(),
  imageUrl: z.string({ required_error: "이미지를 선택해주세요" }).nullable(),
});
export type CreateMyPostInput = z.infer<typeof createMyPostInputSchema>;
```

form 설계

- 입력폼 제공
- 유효성 검사
- 오류 표시
- `onSubmit` 호출 시
  - 유효성 검사 `통과`시 → `onValid` 실행
  - 유효성 검사 `실패`시 → `onInvalid` 실행

### 테스트 코드 작성

```tsx
const user = userEvent.setup();

// 여기서도 효율적인 테스트를 위한 반복 수행 함수 분리

function setup() {
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <PostForm
      title="신규 기사"
      onClickSave={onClickSave} // type 상관없이 실행
      onValid={onValid} // submit 일 때만
      onInvalid={onInvalid} // submit 일 때만
    />
  );
  async function typeTitle(title: string) {
    // 제목 입력
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    // 공개 저장 -> type='button'
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
  }
  async function saveAsDraft() {
    // 비공개 저장 -> type='submit'
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

setupMockServer(handleGetMyProfile()); // <- 글쓰기는 로그인된 유저만 가능하니 목 데이터로 세팅

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  // 1️⃣ GiVEN
  const { saveAsDraft } = setup();

  // 2️⃣ WHEN
  await saveAsDraft(); // <- 비공개 저장 -> type='submit'

  // 3️⃣ THEN
  await waitFor(() =>
    // 유효성 검사 오류가 표기될 떄까지 재시도
    expect(screen.getByRole("textbox", { name: "제목" })).toHaveErrorMessage(
      "한 글자 이상의 문자를 입력해주세요"
    )
  );
});

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  // 1️⃣ GiVEN
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();

  // 2️⃣ WHEN
  await saveAsDraft(); // <- 비공개 저장 -> type='submit'

  // 3️⃣ THEN
  expect(onClickSave).toHaveBeenCalled(); // <-상관없이 무조건 호출
  expect(onValid).not.toHaveBeenCalled(); // <- 유효성 검사 성공시에만 호출
  expect(onInvalid).toHaveBeenCalled(); // <- 검사 실패했으니 호출
});

test("유효한 입력 내용으로 '비공개 상태로 저장'을 시도하면 onValid 이벤트 핸들러가 실행된다", async () => {
  // 1️⃣ GiVEN
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();

  // 2️⃣ WHEN
  await typeTitle("나의 기사"); // <- 제목 유효성 통과
  await selectImage(); // <- 더미 이미지 선택하는 함수
  await saveAsDraft(); // <- 비공개 저장 -> type='submit'

  // 3️⃣ THEN
  expect(onClickSave).toHaveBeenCalled(); // <-상관없이 무조건 호출
  expect(onValid).toHaveBeenCalled(); // <- 유효성 검사 성공했으니 호출
  expect(onInvalid).not.toHaveBeenCalled(); // <- 유효성 검사 실패시에만 호출
});

test("유효한 입력 내용으로 '공개하기'를 시도하면 onClickSave 이벤트 핸들러만 실행된다", async () => {
  // 1️⃣ GiVEN
  const { typeTitle, saveAsPublished, onClickSave, onValid, onInvalid } =
    setup();

  // 2️⃣ WHEN
  await typeTitle("나의 기사");
  await saveAsPublished(); // 공개 저장 -> type='button'

  // 3️⃣ THEN
  expect(onClickSave).toHaveBeenCalled(); // <-상관없이 무조건 호출
  expect(onValid).not.toHaveBeenCalled(); // <- type='button'이여서 호출 안됨
  expect(onInvalid).not.toHaveBeenCalled(); // <- type='button'이여서 호출 안됨
});
```

## 6. 웹 API 응답을 목 객체화하는 MSW

> 목 서버 구축을 위한 MSW, 기존 API 요청을 인터셉트 → 목 응답 데이터 전달 가능

### API 요청 입터셉트를 위한 handler 작성

```tsx
setupMockServer(handleGetMyProfile()); // <- 위에 있던 handler를 보자

// ===================================
// handleGetMyProfile.ts

// MSW의 rest API 핸들러를 가져옵니다
import { rest } from "msw";
// 미리 정의된 목 데이터를 가져옵니다
import { getMyProfileData } from "./fixture";

// API 엔드포인트 경로를 생성하는 함수입니다
const path = () => host(`/my/profile`);

// 프로필 조회 API 요청을 가로채는 핸들러 함수입니다
export function handleGetMyProfile(args?: {
  mock?: jest.Mock<any, any>; // 목 함수 (테스트에서 호출 여부 확인용)
  status?: number; // 응답 상태 코드
}) {
  // GET /my/profile 요청을 인터셉트합니다
  return rest.get(path(), async (_, res, ctx) => {
    // mock 함수가 전달되었다면 실행합니다
    args?.mock?.();

    // status가 전달되었다면 해당 상태 코드로 응답합니다
    if (args?.status) {
      return res(ctx.status(args.status));
    }

    // 정상 응답: 200 상태 코드와 함께 목 데이터를 반환합니다
    return res(ctx.status(200), ctx.json(getMyProfileData));
  });
}

// MSW에서 사용할 핸들러 배열을 정의합니다
export const handlers = [handleGetMyProfile()];

// ===================================
// getMyProfileData fixture

const getMyProfileData: ApiMyProfile.GetReturn = {
  id: 1,
  name: "EonsuBae",
  bio: "프런트엔드 엔지니어. 타입스크립트와 UI 컴포넌트 테스트에 관심이 있습니다.",
  twitterAccount: "eonsu-bae",
  githubAccount: "eonsu-bae",
  imageUrl: "/__mocks__/images/img01.jpg",
  email: "eonsubae@example.com",
  likeCount: 1,
};
```

`handler`를 매개변수로 시용하는 목서버 셋업 함수를 보자

```tsx
// 테스트용 목 서버를 설정하는 함수를 정의합니다
export function setupMockServer(...handlers: RequestHandler[]) {
  // setupServer 함수를 호출하여 MSW 서버 인스턴스를 생성합니다
  // handlers는 스프레드 연산자(...)를 통해 전달된 모든 요청 핸들러들입니다
  const server = setupServer(...handlers);

  // Jest의 beforeAll 훅: 모든 테스트가 시작되기 전에 실행됩니다
  // server.listen()을 호출하여 요청 인터셉터를 시작합니다
  beforeAll(() => server.listen());

  // Jest의 afterEach 훅: 각각의 테스트가 완료된 후 실행됩니다
  // server.resetHandlers()를 호출하여 핸들러들을 초기 상태로 리셋합니다
  // 이는 테스트 간의 독립성을 보장합니다
  afterEach(() => server.resetHandlers());

  // Jest의 afterAll 훅: 모든 테스트가 완료된 후 실행됩니다
  // server.close()를 호출하여 목 서버를 종료합니다
  afterAll(() => server.close());

  // 생성된 서버 인스턴스를 반환합니다
  // 이를 통해 테스트 코드에서 서버를 직접 제어할 수 있습니다
  return server;
}
```

## 6-1. GPT쿤에게 물어본 whatwg-fetch의 필요성

### **whatwg-fetch가 지금도 필요한가? (2025년 2월 기준)**

---

### **1. whatwg-fetch란?**

- `whatwg-fetch`는 Fetch API를 폴리필하여 구형 브라우저에서 `window.fetch()` 메서드를 사용할 수 있게 해주는 라이브러리입니다.
- 주로 **Internet Explorer (특히 IE 11 이하)**에서 `fetch`가 기본적으로 지원되지 않기 때문에 사용되었습니다.

---

### **2. 현재 Fetch API 지원 현황 (2025년 2월 기준)**

- **모던 브라우저 (Chrome, Firefox, Safari, Edge, Opera)**: Fetch API를 기본적으로 완전 지원.
- **Internet Explorer (IE 11 이하)**: Fetch API 미지원.

---

### **3. 그렇다면 현재 시점에 whatwg-fetch가 필요한 경우는?**

- **IE 11 이하 버전을 반드시 지원해야 하는 경우**에만 필요합니다.
- 하지만 **IE 11은 대부분의 서비스에서 공식 지원 종료**되었으며, MS는 Edge로의 전환을 권장하고 있습니다.
- **B2B 서비스**나 **내부 인트라넷 시스템** 등 특수한 환경에서 **IE 11을 여전히 사용하는 경우**가 아니라면, 굳이 `whatwg-fetch`를 사용하지 않아도 됩니다.

---

### **4. 결론: 사용 권장 여부**

- **일반적인 웹 서비스**에서는 더 이상 필요하지 않습니다.
- **IE 11 이하를 지원할 필요가 없는 경우**라면 `whatwg-fetch`를 설치하거나 유지할 이유가 없습니다.
- **IE 11을 완전히 드롭하거나, ES5 호환성만 신경 쓴다면 `axios`나 `native fetch`를 사용하는 것을 권장**합니다.

---

### **5. 대안 및 권장 사항**

- **Polyfill 미사용**: 대상 브라우저가 `fetch`를 기본 지원한다면 그대로 사용.
- **IE 11 이하 지원 필요 시**:
  - `whatwg-fetch` 대신 `core-js` 같은 더 광범위한 폴리필 사용 고려.
  - 또는 `axios`와 같은 HTTP 클라이언트 라이브러리 사용 (axios는 내부적으로 XMLHttpRequest를 사용).

---

### **6. 추가 참고 사항**

- 프로젝트에서 지원해야 하는 브라우저 버전을 **정확히 확인한 후** 결정하세요.
- **사용자 통계**에 기반해 IE 사용 비율이 극히 적다면, 과감히 지원을 드롭하는 것도 성능 및 유지보수 측면에서 유리합니다.

---

### **최종 결론**

👉 **2025년 2월 기준, `whatwg-fetch`는 거의 사용하지 않아도 됩니다.**

👉 **IE 11 이하 버전만 예외적으로 필요한 경우에만 사용을 고려하세요.**

---

## 7. 웹 API 통합 테스트

> 복잡한 인터랙션 분기를 가진 컴포넌트 테스트

위에서 테스트했던 `PostForm` 컴포넌트를 사용하는 `MyPostsCreate` 로 테스트를 진행한다.

```tsx
export const MyPostsCreate = () => {
  const router = useRouter();
  const { showToast } = useToastAction();
  const { showAlertDialog, hideAlertDialog } = useAlertDialogAction();
  return (
    <PostForm
      title="신규 기사"
      onClickSave={(isPublish) => {
        if (!isPublish) return;
        // 공개를 시도하면 AlertDialog를 띄운다.
        showAlertDialog({ message: "기사를 공개합니다. 진행하시겠습니까?" });
      }}
      onValid={async (input) => {
        // 유효한 내용으로 제출한 경우
        const status = input.published ? "공개" : "저장";
        if (input.published) {
          hideAlertDialog();
        }
        try {
          // API 통신을 시작하면 '저장 중입니다...'가 표시된다.
          showToast({ message: "저장 중입니다...", style: "busy" });
          const { id } = await createMyPosts({ input });
          // 공개(혹은 저장)에 성공하면 화면을 이동한다.
          await router.push(`/my/posts/${id}`);
          // 공개(혹은 저장)에 성공하면 '공개(혹은 저장)됐습니다'가 표시된다.
          showToast({ message: `${status}됐습니다`, style: "succeed" });
        } catch (err) {
          // 공개(혹은 저장)에 실패하면 '공개(혹은 저장)에 실패했습니다'가 표시된다.
          showToast({ message: `${status}에 실패했습니다`, style: "failed" });
        }
      }}
      onInvalid={() => {
        // 유효하지 않은 내용으로 제출하면 AlertDialog를 닫는다.
        hideAlertDialog();
      }}
    >
      <AlertDialog />
    </PostForm>
  );
};
```

![image.png](7%20%E1%84%8B%E1%85%B0%E1%86%B8%20%E1%84%8B%E1%85%A2%E1%84%91%E1%85%B3%E1%86%AF%E1%84%85%E1%85%B5%E1%84%8F%E1%85%A6%E1%84%8B%E1%85%B5%E1%84%89%E1%85%A7%E1%86%AB%20%E1%84%90%E1%85%A9%E1%86%BC%E1%84%92%E1%85%A1%E1%86%B8%20%E1%84%90%E1%85%A6%E1%84%89%E1%85%B3%E1%84%90%E1%85%B3%201a38c7b909f280e8b1c3cd1ba05b5365/image%202.png)

### 설계

- 비공개 상태로 저장 → 비공개한 기사 화면으로 이동
- 공개 시도 → `AlertDialog` 노출
- `AlertDialog` → [아니오] 클릭 → 경고창이 사라짐
- `AlertDialog` → [네] 클릭 → 공개됨

### 테스트 코드 작성 - AlertDialog

```tsx
const { Default } = composeStories(stories);
const user = userEvent.setup();

async function setup() {
  const { container } = render(<Default />);
  const { selectImage } = selectImageFile(); // <- 이미지 선택 함수

  async function typeTitle(title: string) {
    // 제목 입력
    const textbox = screen.getByRole("textbox", { name: "제목" });
    await user.type(textbox, title);
  }
  async function saveAsPublished() {
    // 공개 저장 -> type='button'
    await user.click(screen.getByRole("switch", { name: "공개 여부" }));
    await user.click(screen.getByRole("button", { name: "공개하기" }));
    await screen.findByRole("alertdialog"); // <- 추가
  }
  async function saveAsDraft() {
    // 비공개 저장 -> type='submit'
    await user.click(
      screen.getByRole("button", { name: "비공개 상태로 저장" })
    );
  }

  async function clickButton(name: "네" | "아니오") {
    // AlertDialog 버튼 클릭
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

// API handler 목 셋업
setupMockServer(...MyPosts.handlers, ...MyProfile.handlers);

beforeEach(() => {
  mockUploadImage();
  mockRouter.setCurrentUrl("/my/posts/create");
});

describe("AlertDialog", () => {
  test("공개를 시도하면 AlertDialog가 표시된다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, selectImage } = await setup();

    // 2️⃣ WHEN
    await typeTitle("201");
    await selectImage();
    await saveAsPublished();

    // 3️⃣ THEN
    expect(
      screen.getByText("기사를 공개합니다. 진행하시겠습니까?")
    ).toBeInTheDocument();
  });

  test("[아니오] 버튼을 누르면 AlertDialog가 사라진다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 2️⃣ WHEN
    await typeTitle("201");
    await selectImage();
    await saveAsPublished(); // Dialog 노출
    await clickButton("아니오"); // Dialog -> 아니오!

    // 3️⃣ THEN
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다", async () => {
    // 1️⃣ GiVEN
    const { saveAsPublished, clickButton, selectImage } = await setup();

    // 2️⃣ WHEN
    // await typeTitle("201");　제목을 입력하지 않은 상태 // 필수값임
    await selectImage();
    await saveAsPublished();
    await clickButton("네");

    // 3️⃣ THEN - 제목 입력란이 invalid 상태가 된다.
    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "제목" })).toBeInvalid()
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
```

### 테스트 코드 작성 - Toast

공개 or 저장 요청 → `저장 중입니다...` Toast 노출

```tsx
describe("Toast", () => {
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 2️⃣ WHEN
    await typeTitle("201");
    await selectImage();
    await saveAsPublished(); // 공개 저장 -> type='button', AlertDialog 노출
    await clickButton("네");

    // 3️⃣ THEN
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("저장 중입니다...")
    );
  });

  test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 2️⃣ WHEN
    await typeTitle("hoge");
    await selectImage();
    await saveAsPublished(); // 공개 저장 -> type='button', AlertDialog 노출
    await clickButton("네");

    // 3️⃣ THEN
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("공개됐습니다")
    );
  });

  test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 2️⃣ WHEN
    await typeTitle("500");
    await selectImage();
    await saveAsPublished(); // 공개 저장 -> type='button', AlertDialog 노출
    await clickButton("네");

    // 3️⃣ THEN
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("공개에 실패했습니다")
    );
  });
});
```

중간에 title 값을 “500”으로 넘기면 공개에 실패하는 테스트 코드가 동작을 하는데 내부적으로 handler에 아래와 같이 정의 되어있다.

```tsx
// 1. 핸들러 넘기기
setupMockServer(...MyPosts.handlers, ...MyProfile.handlers);

// 2. 핸들러는 여기에
import * as MyPosts from "@/services/client/MyPosts/__mock__/msw";

// 3. 내부적으로 string 500 넘기면 에러 발생하는 분기 로직이 있음
export function handleCreateMyPosts(spy?: jest.Mock<any, any>) {
  return rest.post(path(), async (req, res, ctx) => {
    const data: ApiMyPosts.PostInput = await req.json();
    spy?.({ body: data, headers: req.headers.get("content-type") });
    if (data.title === "500") {
      const err = new HttpError(500).serialize();
      return res(ctx.status(err.status), ctx.json(err));
    }
    return res(ctx.json(createMyPostsData(data.title)));
  });
}

export const handlers = [handleCreateMyPosts()];
```

### 테스트 코드 작성 - 화면 이동

```tsx
describe("화면이동", () => {
  test("비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsDraft, selectImage } = await setup();

    // 2️⃣ WHEN
    await typeTitle("201");
    await selectImage();
    await saveAsDraft(); // 비공개 저장 -> type='submit'

    // 3️⃣ THEN - 정상적으로 동작시 페이지 이동
    await waitFor(() =>
      // mockRouter === pathname이 일치할 떄까지 재시도
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });

  test("공개에 성공하면 화면을 이동한다", async () => {
    // 1️⃣ GiVEN
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 2️⃣ WHEN
    await typeTitle("201");
    await selectImage();
    await saveAsPublished(); // 공개 저장 -> type='button', AlertDialog 노출
    await clickButton("네");

    // 3️⃣ THEN - 정상적으로 동작시 페이지 이동
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });
});
```

## 8. 이미지 업로드 통합 테스트

> 이미지 업로드 UI 컴포넌트 테스트

### 테스트할 컴포넌트

```tsx
type Props<T extends FieldValues = PutInput> = {
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  name: Path<T>;
  defaultImageUrl?: string;
};

export const Avatar = (props: Props) => {
  const { showToast } = useToastAction();
  const { onChangeImage, imageUrl } = useUploadImage({
    ...props,
    onRejected: () => {
      showToast({
        message: `이미지 업로드에 실패했습니다`,
        style: "failed",
      });
    },
  });
  return (
    <div className={styles.module}>
      <p className={styles.avatar}>
        <img src={imageUrl || ""} alt="" />
      </p>
      <InputFileButton
        buttonProps={{
          children: "이미지 변경하기",
          type: "button",
        }}
        inputProps={{
          "data-testid": "file",
          accept: "image/png, image/jpeg",
          onChange: onChangeImage,
        }}
      />
    </div>
  );
};
```

### 설계

- 이미지 선택 → 업로드 시도 (FileReader로 처리 후 바로 API 호출)
  - 업로드 성공 → 프로필 이미지 적용
  - 업로드 실패 → 실패 Toast 노출

### 테스트 코드 작성

1. 업로드 관련

- 테스트를 위해서는 이미지 로드시 previewUrl를 받고, 이후 호출을 위해서는 목 함수가 필요하다.

- 이미지 로드시 이미지 파일에서 데이터 전송 시 필요한 데이터 받기

```tsx
export function selectImageFile(
  inputTestId = "file", // 테스트할 input 요소의 testid
  fileName = "hello.png", // 테스트용 파일 이름
  content = "hello" // 테스트용 파일 내용
) {
  // userEvent를 사용해 실제 사용자 동작을 시뮬레이션
  const user = userEvent.setup();

  // 브라우저에서 파일 선택시 보여지는 경로를 모방
  const filePath = [`C:\\fakepath\\${fileName}`];

  // 테스트용 가상 File 객체 생성
  const file = new File([content], fileName, {
    type: "image/png",
  });

  // 실제 DOM에서 파일 input 요소를 찾음
  const fileInput = screen.getByTestId(inputTestId);

  // 파일 선택 동작을 시뮬레이션하는 함수
  const selectImage = () => user.upload(fileInput, file);

  return { fileInput, filePath, selectImage };
}
```

- 이후 이미지 업로드 API 호출을 위한 목함수

```tsx
import { ErrorStatus, HttpError } from "@/lib/error";
import * as UploadImage from "../fetcher";
import { uploadImageData } from "./fixture";

// 실제 API 호출을 목(mock)으로 대체
jest.mock("../fetcher"); // HTTP multipart/form-data

export function mockUploadImage(status?: ErrorStatus) {
  // 에러 상태코드가 존재하고 300 이상인 경우 (에러 케이스)
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, "uploadImage") // uploadImage 함수를 감시
      .mockRejectedValueOnce(
        // 에러 응답을 모사
        new HttpError(status).serialize() // 에러 객체 생성 및 직렬화
      );
  }

  // 성공 케이스
  return jest
    .spyOn(UploadImage, "uploadImage") // uploadImage 함수를 감시
    .mockResolvedValueOnce(uploadImageData); // 성공 응답 데이터 반환
}

// =================================================
// uploadImageData fixture
export const uploadImageData: UploadImageData = {
  url: "http://127.0.0.1:9000/images",
  filename: "pic00001.jpg",
  fields: {
    Policy:
      "eyJleHBpcmF0aW9uIjoiMjAyMi0wOC0zMVQxMzoyODozN1oiLCJjb25kaXRpb25zIjpbWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsMCwxMDQ4NTc2XSx7ImtleSI6InBpYzAwMDAxLmpwZyJ9LHsiQ29udGVudC1UeXBlIjoiaW1hZ2UvanBlZyJ9LHsiYnVja2V0IjoiaW1hZ2VzIn0seyJYLUFtei1BbGdvcml0aG0iOiJBV1M0LUhNQUMtU0hBMjU2In0seyJYLUFtei1DcmVkZW50aWFsIjoicm9vdC8yMDIyMDgzMS91cy1lYXN0LTEvczMvYXdzNF9yZXF1ZXN0In0seyJYLUFtei1EYXRlIjoiMjAyMjA4MzFUMTMyNzM3WiJ9XX0=",
    "X-Amz-Signature":
      "419d0e078d94d7beb7793395ae9c046e73b5df2aa2a32e1cb59c0ec8d48ede5e",
  },
};
```

```tsx
function TestComponent() {
  const { register, setValue } = useForm<PutInput>();
  return BasicLayout(
    <Avatar register={register} setValue={setValue} name="imageUrl" />
  );
}

setupMockServer(handleGetMyProfile());

test("'이미지 변경하기'버튼이 있다", async () => {
  // 1️⃣ GiVEN
  render(<TestComponent />);

  // 2️⃣ THEN
  expect(
    await screen.findByRole("button", { name: "이미지 변경하기" })
  ).toBeInTheDocument();
});

test("이미지 업로드에 성공하면 이미지의 src 속성이 변경된다", async () => {
  // 1️⃣ GiVEN
  // 이미지 업로드가 성공하도록 설정한다.
  mockUploadImage();
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지의 src 속성이 비었는지 확인한다.
  expect(screen.getByRole("img").getAttribute("src")).toBeFalsy();
  // 이미지를 선택한다.

  // 2️⃣ WHEN
  const { selectImage } = selectImageFile();
  await selectImage();

  // 3️⃣ THEN - 이미지의 src 속성이 채워졌는지 확인한다.
  await waitFor(() =>
    expect(screen.getByRole("img").getAttribute("src")).toBeTruthy()
  );
});

test("이미지 업로드에 실패하면 경고창이 표시된다", async () => {
  // 1️⃣ GiVEN
  // 이미지 업로드가 실패하도록 설정한다.
  mockUploadImage(500);
  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);
  // 이미지를 선택한다.

  // 2️⃣ WHEN
  const { selectImage } = selectImageFile();
  await selectImage();

  // 3️⃣ THEN - 지정한 문자열이 포함된 Toast가 나타나는지 검증한다.
  await waitFor(() =>
    expect(screen.getByRole("alert")).toHaveTextContent(
      "이미지 업로드에 실패했습니다"
    )
  );
});
```
