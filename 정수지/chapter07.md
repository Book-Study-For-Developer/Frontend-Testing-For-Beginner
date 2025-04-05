# React Context와 통합 테스트

사용자에게 애플리케이션의 응답 결과를 통지하는 <Toast> 컴포넌트 테스트

→ 모든 화면에서 호출 가능한 전역 UI

→ UI 테마나 전역 UI를 다를 때는 한 곳에서 관리중인 값이나 갱신 함수에 접근해야해 Props만으로는 구현이 어려움

→ 리액트 공식 API인 Context API를 활용해 해결

Context API 사용 시 Props에 명시적으로 값을 전달할 필요가 없어 하위 컴포넌트에서 최상위 컴포넌트가 소유한 값과 갱신 함수에 직접 접근할 수 있음

# Context API 사용 방법

```tsx
export const initialState: ToastState = {
  isShown: false,
  message: "",
  style: "succeed",
};
```

## Context 객체 생성

상태를 소유할 ToastStateContext, 상태 갱신 함수를 소유할 ToastActionContext 작성

```tsx
import { createContext } from "react";

export const ToastStateContext = createContext(initialState);

export const ToastActionContext = createContext(initialAction);
```

## ToastProvider

```tsx
export const ToastProvider = ({
  children,
  defaultState,
}: {
  children: ReactNode;
  defaultState?: Partial<ToastState>;
}) => {
  const { isShown, message, style, showToast, hideToast } =
    useToastProvider(defaultState);
  return (
    <ToastStateContext.Provider value={{ isShown, message, style }}>
      {" "}
      {/* 하위 컴포넌트에서 isShown, message, style을 참조할 수 있다 */}
      <ToastActionContext.Provider value={{ showToast, hideToast }}>
        {" "}
        {/* 하위 컴포넌트에서 showToast, hideToast를 참조할 수 있다 */}
        {children}
        {isShown && <Toast message={message} style={style} />} {/* isShown이 true가 되면 표시된다 */}
      </ToastActionContext.Provider>
    </ToastStateContext.Provider>
  );
};
```

## 하위 컴포넌트 사용법

```tsx
const { showToast } = useToastAction();
const onSubmit = handleSubmit(async () => {
  try {
    // ...웹 API에 값을 제출한다.
    showToast({ message: "저장됐습니다", style: "succeed" });
  } catch (err) {
    showToast({ message: "에러가 발생했습니다", style: "failed" });
  }
});
```

# Context 테스트 방법

**[테스트의 중점]**

- Provider의 상태에 따라 렌더링 여부가 변경된다.
- Provider의 갱신 함수로 상태를 갱신할 수 있다.

## 방법 1. 테스트용 컴포넌트를 만들어 인터렉션 실행하기

```tsx
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

- 테스트에서 사용하는 render 함수로 최상위 컴포넌트인 <ToastProvider>와 <TestComponent> 렌더
- await user.click을 통해 메세지 렌더링 확인

## 방법 2. 초깃값을 주입해서 렌더링된 내용 확인하기

```tsx
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

test.each([
  { isShown: true, message: "성공했습니다", style: "succeed" },
  { isShown: true, message: "실패했습니다", style: "failed" },
  { isShown: true, message: "통신 중입니다", style: "busy" },
] as ToastState[])("$message", (state) => {
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole("alert")).toHaveTextContent(state.message);
});
```

- ToastProvider에 defaultState 초깃값을 주입해 검증

# Next.js 라우터와 렌더링 통합 테스트

- 라우터와 연관된 UI 컴포넌트의 통합 테스트 방법
  참고) pages directory 기반으로 작성됨
- 헤더 내비게이션을 담당하는 UI 컴포넌트를 테스트

```tsx
import Link from "next/link";
import { useRouter } from "next/router";
import { AnchorHTMLAttributes } from "react";
import styles from "./styles.module.css";

function isCurrent(flag: boolean): AnchorHTMLAttributes<HTMLAnchorElement> {
  if (!flag) return {};
  return { "aria-current": "page" };
}

type Props = { onCloseMenu: () => void };

export const Nav = ({ onCloseMenu }: Props) => {
  const { pathname } = useRouter();
  return (
    // "내비게이션"을 "메뉴"로 변경하고 테스트 러너를 실행(코드 8-31)
    <nav aria-label="내비게이션" className={styles.nav}>
      <button
        aria-label="메뉴 닫기"
        className={styles.closeMenu}
        onClick={onCloseMenu}
      ></button>
      <ul className={styles.list}>
        <li>
          <Link href={`/my/posts`} legacyBehavior>
            <a
              {...isCurrent(
                pathname.startsWith("/my/posts") &&
                  pathname !== "/my/posts/create"
              )}
            >
              My Posts
            </a>
          </Link>
        </li>
        <li>
          <Link href={`/my/posts/create`} legacyBehavior>
            <a {...isCurrent(pathname === "/my/posts/create")}>Create Post</a>
          </Link>
        </li>
      </ul>
    </nav>
  );
};
```

## next-router-mock 설치

```bash
$ npm install --save-dev next-router-mock
```

- Next.js에서 라우터 부분을 테스트하려면 목 객체를 사용해야함
- next-router-mock : 제스트에서 Next.js의 라우터를 테스트할 수 있도록 목 객체를 제공하는 라이브러리

## 라우터와 UI 컴포넌트 통합 테스트

```tsx
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl("/my/posts");
});
```

- mockRouter.setCurrentUrl : 현재 URL을 설정한 URL로 가정함

```tsx
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl("/my/posts");
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name: "My Posts" });
  expect(link).toHaveAttribute("aria-current", "page");
});

test("현재 위치는 'Create Post'이다", () => {
  mockRouter.setCurrentUrl("/my/posts/create");
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name: "Create Post" });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

- aria-current 속성을 검증해 테스트

```tsx
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

- test.each : 동일한 테스트를 매개변수만 변경해 반복하고 싶을때 사용

# Next.js 라우터와 입력 통합 테스트

- 기사 목록의 헤더 컴포넌트를 테스트
- 셀렉트 버튼으로 Next.js의 라우터를 조작해 URL 매개변수를 변경함

```tsx
import { SelectFilterOption } from "@/components/molecules/SelectFilterOption";
import { parseAsNonEmptyString } from "@/lib/util";
import { useRouter } from "next/router";
import styles from "./styles.module.css";

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
        options={options}
        selectProps={{
          defaultValue,
          onChange: (event) => {
            const status = event.target.value;
            push({ query: { ...query, status } });
          },
        }}
      />
    </header>
  );
};
```

## 초기 화면 테스트

- UI 컴포넌트의 통합 테스트는 설정 함수를 사용하는 것이 편리함
  설정 함수 : 테스팅 라이브러리를 만든 [켄트 도즈가 블로그](https://kentcdodds.com/blog/avoid-nesting-when-youre-testing)에서 소개한 테크닉

```tsx
import { render, screen } from "@testing-library/react";
import mockRouter from "next-router-mock";

function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  return { combobox };
}
```

```tsx
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
```

## 인터랙션 테스트

```tsx
function setup(url = "/my/posts?page=1") {
  mockRouter.setCurrentUrl(url);
  render(<Header />);
  const combobox = screen.getByRole("combobox", { name: "공개 여부" });
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption };
}
```

```tsx
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

# React Hook Form으로 폼 쉽게 다루기

- React Hook Form :
  - 비제어 컴포넌트로 고성능 폼을 쉽게 작성할 수 있도록 도와주는 라이브러리
  - ref나 이벤트 핸들러를 자동으로 생성하고 설정해줌
  - useForm 훅 사용 (반환값 register 함수와 handleSubmit 함수 활용)
    handleSubmit 함수의 인수는 함수를 직접 인라인으로 작성하지 않고, Props에서 취득한 이벤트 핸들러를 지정할 수도 있음, 두번째 인수에는 유효성 검사 오류가 발생했을 때 사용할 이벤트 핸들러 지정도 가능
  - resolver 하위 패키지로 유효성 검사 스키마 객체 할당 가능
    오류 메세지는 errors에 자동으로 저장됨

```tsx
const { register, handleSubmit } = useForm({
	defaultValues: { search: q },
})

<form onSubmit={handleSubmit((values) => {}}>
	<input type="search" {...register("search")} />
</form>
```

# 폼 유효성 검사 테스트

- 신규 기사 작성 폼, 전송 전 유효성 검사 실시하며 React Hook Form 사용

```tsx
export const PostForm = (props: Props) => {
  const {
    register,
    setValue,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PutInput>({
    defaultValues: props.defaultValues,
    resolver: zodResolver(updateMyPostInputSchema),
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
            defaultImageUrl={props.defaultValues?.imageUrl}
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
        onClickDelete={props.onClickDelete}
      />
      {props.children}
    </form>
  );
};
```

```tsx
import * as z from "zod";

export const updateMyPostInputSchema = z.object({
  title: z.string().min(1, "한 글자 이상의 문자를 입력해주세요"),
  description: z.string().nullable(),
  body: z.string().nullable(),
  published: z.boolean(),
  imageUrl: z.string({ required_error: "이미지를 선택해주세요" }).nullable(),
});
export type UpdateMyPostInput = z.infer<typeof updateMyPostInputSchema>;
```

## 설계 포인트

```tsx
type Props<T extends FieldValues = PutInput> = {
  title: string;
  defaultValues?: Partial<T>;
  children?: React.ReactNode;
  onValid: SubmitHandler<T>;
  onInvalid?: SubmitErrorHandler<T>;
  onClickSave: (isPublish: boolean) => void;
  onClickDelete?: () => void;
};
```

## 인터랙션 테스트 설정

```tsx
function setup() {
  const onClickSave = jest.fn();
  const onClickDelete = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();
  render(
    <Default
      onClickSave={onClickSave}
      onClickDelete={onClickDelete}
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
  async function clickDelete() {
    await user.click(screen.getByRole("button", { name: "삭제하기" }));
  }
  return {
    typeTitle,
    saveAsDraft,
    saveAsPublished,
    clickDelete,
    onClickSave,
    onClickDelete,
    onValid,
    onInvalid,
  };
}
```

```tsx
test("유효하지 않은 내용을 포함해 제출하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();
  await saveAsDraft();
  await waitFor(() =>
    expect(screen.getByRole("textbox", { name: "제목" })).toHaveErrorMessage(
      "한 글자 이상의 문자를 입력해주세요"
    )
  );
});

test("유효하지 않은 내용을 포함해 제출하면 onInvalid라는 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  await saveAsDraft(); // 비공개 상태로 저장
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});
```

- waitFor : 비동기 함수, 재시도를 위해 사용

```tsx
test("유효한 내용으로 '비공개 상태로 저장'을 시도하면 onValid라는 이벤트 핸들러가 실행된다", async () => {
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();
  await typeTitle("나의 기사");
  await selectImage();
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});
```

## TIP : 접근성 관련 매처

```tsx
import { DescriptionMessage } from "@/components/atoms/DescriptionMessage";
import { ErrorMessage } from "@/components/atoms/ErrorMessage";
import { Textbox } from "@/components/atoms/Textbox";
import clsx from "clsx";
import { ComponentProps, forwardRef, ReactNode, useId } from "react";
import styles from "./styles.module.css";

type Props = ComponentProps<typeof Textbox> & {
  title: string;
  info?: ReactNode;
  description?: string;
  error?: string;
};

export const TextboxWithInfo = forwardRef<HTMLInputElement, Props>(
  function TextboxWithInfo(
    { title, info, description, error, className, ...props },
    ref
  ) {
    const componentId = useId();
    const textboxId = `${componentId}-textbox`;
    const descriptionId = `${componentId}-description`;
    const errorMessageId = `${componentId}-errorMessage`;
    return (
      <section className={clsx(styles.module, className)}>
        <header className={styles.header}>
          <label className={styles.label} htmlFor={textboxId}>
            {title}
          </label>
          {info}
        </header>
        <Textbox
          {...props}
          ref={ref}
          id={textboxId}
          aria-invalid={!!error}
          aria-errormessage={errorMessageId}
          aria-describedby={description ? descriptionId : undefined}
        />
        {(error || description) && (
          <footer className={styles.footer}>
            {description && (
              <DescriptionMessage id={descriptionId}>
                {description}
              </DescriptionMessage>
            )}
            {error && (
              <ErrorMessage id={errorMessageId} className={styles.error}>
                {error}
              </ErrorMessage>
            )}
          </footer>
        )}
      </section>
    );
  }
);
```

- 현재 상태를 ARIA 속성으로 판단함
- aria-invalid와 aria-errormessage는 입력 내용에 오류가 있다는 것을 알리는 속성
- Props의 error가 undefined가 아닌 경우 오류로 판단

접근성 대응이 충분한지 검증하는 매처는 @testing-library/jest-dom에 있음

```tsx
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

# 웹 API 응답을 목 객체화하는 MSW

## MSW란?

- 네트워크 계층의 목 계층을 만드는 라이브러리
- 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체할 수 있음
- API를 실행하지 않아도 응답이 오는 상황을 재현할 수 있어 통합 테스트 시 목 서버로 사용 가능

### 요청 핸들러 만들기

```tsx
import { rest, setupWorker } from "msw";
const worker = setupWorker(
  rest.get("https://myapi.dev/csr", (req, res, ctx) => {
    return res(
      ctx.json({
        title: "CSR Source",
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
      })
    );
  })
);
worker.start();
```

### 제스트에서 사용하기

- msw/node에서 제공하는 setupServer 함수로 제스트용 설정함수 만들기

  - 요청 핸들러를 setupServer 함수에 가변 인수로 넘기면 요청을 가로챌 수 있음
  - setupServer 함수는 테스트마다 서버를 초기화하기 때문에 한 테스트에서 가로챈 요청이 다른 테스트에 영향을 미치지 않음
  - 공통으로 사용할 설정 함수는 아래와 같이 setupMockServer 같은 함수를 만들면 편함

    ```tsx
    import type { RequestHandler } from "msw";
    import { setupServer } from "msw/node";

    export function setupMockServer(...handlers: RequestHandler[]) {
      const server = setupServer(...handlers);
      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());
      return server;
    }
    ```

- 각 테스트 파일은 테스트에 필요한 핸들러 함수를 넘겨서 MSW 서버를 설정할 수 있음
  ```jsx
  import * as MyPosts from "@/services/client/MyPosts/__mock__/msw";
  setupMockServer(...MyPosts.handlers);
  ```

### Fetch API의 폴리필

- 집필 시점에는 테스트 환경인 jsdom에 Fetch API가 적용되지 않았기 때문에 Fetch API를 사용한 코드가 테스트 대상에 포함되면 테스트가 실패함 → 테스트 환경을 위해 만든 Fetch API의 폴리필인 `whatwg-fetch` 를 설치해 모든 테스트에 적용되도록 설정 파일에서 불러와 해결 가능

# 웹 API 통합 테스트

복잡한 인터렉션 분기를 가진 컴포넌트의 테스트 방법

→ 신규 기사 작성 폼을 담당하는 UI 컴포넌트 테스트

- 작성한 기사 공개 여부 선택해 저장
  - 비공개 시 저장은 되지만 로그인한 사용자 외 열람 불가
  - 공개 선택 시 로그인 하지 않은 사용자도 기사 열람 가능
    - 공개 전 AlertDialog를 띄워 비공개하고 싶은 기사가 공개되지 않도록 재차 확인

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

## 인터랙션 테스트 설정

- typeTitle : 제목 입력 함수
- saveAsPublished : 공개 상태로 저장하는 함수
- saveAsDraft : 비공개 상태로 저장하는 함수
- clickButton : AlertDialog의 네, 아니오 선택하는 함수
- selectImage : 기사의 메인 이미지 선택 함수

```jsx
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

## AlertDialog 렌더링 테스트

```tsx
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
```

## Toast 렌더링 테스트

```tsx
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
```

## 화면 이동 테스트

```tsx
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

# 이미지 업로드 통합 테스트

- 컴퓨터에 저장된 이미지를 선택해 업로드 시도
- 이미지 업로드 성공 시 프로필 이미지로 적용
- 이미지 업로드 실패 시 실패 알림

```tsx
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

## 이미지 업로드 처리 흐름

- 이미지 선택 시 useUploadImage 커스텀 훅이 제공하는 onChangeImage 실행
- onChangeImage
  - 브라우저 API인 FileReader 객체를 사용해 컴퓨터에 저장된 이미지 파일의 내용을 비동기로 취득
  - 취득이 끝나면 이미지 업로드 API 호출

```tsx
export function useUploadImage<T extends FieldValues>({
  name,
  defaultImageUrl,
  register,
  setValue,
  onResolved,
  onRejected,
}: {
  name: Path<T>;
  defaultImageUrl?: string | null;
  register: UseFormRegister<T>;
  setValue: UseFormSetValue<T>;
  onResolved?: (data: UploadImageData) => void;
  onRejected?: (err: unknown) => void;
}) {
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  useEffect(() => {
    register(name);
  }, [register, name]);

  // handleChangeFile 함수는 FileReader 객체를 사용해서 이미지 파일을 취득한다.
  const onChangeImage = handleChangeFile((_, file) => {
    // 취득한 이미지의 내용을 file에 저장한다.
    // uploadImage 함수는 API Route로 구현된 이미지 업로드 API를 호출한다.
    uploadImage({ file })
      .then((data) => {
        const imgPath = `${data.url}/${data.filename}` as PathValue<T, Path<T>>;
        // API 응답에 포함된 이미지 URL을 경로로 지정한다.
        setImageUrl(imgPath);
        setValue(name, imgPath);
        onResolved?.(data);
      })
      .catch(onRejected);
  });
  return { onChangeImage, imageUrl } as const;
}
```

## 통합 테스트용 목 객체 만들기

- jsdom은 브라우저 API를 제공하지 않고, 이미지 업로드 API도 Next.js 서버 없이 사용할 수 있어야 함 → 목 함수를 사용해 해결

### 이미지를 선택하는 목 함수

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
```

### 이미지 업로드 API를 호출하는 목 함수

```tsx
import { ErrorStatus, HttpError } from "@/lib/error";
import * as UploadImage from "../fetcher";
import { uploadImageData } from "./fixture";

jest.mock("../fetcher");

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
```

### 업로드 성공/실패 테스트

```tsx
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
