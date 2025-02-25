# Chapter 7. 웹 애플리케이션 통합 테스트

## 7.3 Next.js 라우터와 렌더링 통합 테스트

> ⚠️page 라우터 기반으로 작성된 테스트이므로, app 라우터에 적용시 사용불가한 테스트가 존재할 수 있다

- 네비게이션 바에서 유저가 선택한 페이지로 정상 이동하는지를 테스트할 것이다
- Next.js에서 라우터 동작을 테스트하려면 Mock 객체를 사용해야 한다. 이를 위해 `next-router-mock`을 사용한다. `next-router-mock`은 Jest에서 Next.js의 라우터를 테스트할 수 있도록 Mock 객체를 제공하는 라이브러리이다. 이 라이브러리를 통해 `useRouter`를 활용한 URL 변경에 대한 통합 테스트를 jsdom에서 실행할 수 있다
- `mockRouter.setCurrentUrl`을 호출하여 테스트 환경에 URL을 설정할 수 있다(렌더링 이전에 호출):
    
    ```tsx
    /* src/.../Header/Nav/index.test.tsx */
    // ✅PASS
    test("현재 위치는 'My Posts'이다", () => {
      mockRouter.setCurrentUrl("/my/posts");
      render(<Nav onCloseMenu={() => {}} />);
      const link = screen.getByRole("link", { name: "My Posts" });
      expect(link).toHaveAttribute("aria-current", "page");
    });
    ```
    
- 파라미터만 변경하여 테스트를 수행하고 싶은 경우, `test.each`를 활용한다:
    
    ```tsx
    /* src/.../Header/Nav/index.test.tsx */
    // ✅PASS
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
    

---

## 7.4 Next.js 라우터와 입력 통합 테스트

- 사용자 입력으로 발생한 영향을 테스트할 수 있다
- 셀렉트 박스에서 선택한 아이템이 query params의 변경을 가져오고, 이로인해 UI가 변경되는지를 테스트 할 것이다
- `user.click`과 마찬가지로 `user.selectOptions(셀렉트 박스 엘리먼트, 선택할 옵션의 value값)`로 셀렉트 박스에서 아이템 선택을 재현할 수 있다:
    
    ```tsx
    /* src/.../Posts/Nav/index.test.tsx */
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
    
- UI 컴포넌트 테스트에서는 테스트용 디폴트 값, 디폴트 렌더링, 디폴트 인터랙션 등을 함수로 추상화(ex. 예제의 `setup` 함수)하면 가독성 높은 테스트 코드를 작성할 수 있다
    
    → 책에서의 setup 함수 대부분은 async/await 방식으로 함수를 정의하고 있음. 이를 통해 "Chapter 3. 처음 시작하는 단위 테스트 - 3.7.3 async/await를 활용한 작성법"이 일관성 있는 테스트 코드 작성에 도움이 될 수 있음을 알게 되었다. 앞으로도 async/await 코드를 주로 사용할 생각이다
    

---

## 7.5 React Hook Form으로 폼 쉽게 다루기

- 리액트에서 폼에 입력된 내용을 참조하는 방법은 제어 컴포넌트일 때와, 비제어 컴포넌트일 때로 나뉜다. 두 방법은 폼을 구현하는 방법보다 `<input />` 등의 입력 엘리먼트를 다루는 방법에 가깝다
- 책의 controlled/uncontrolled component와 리액트 공식 문서의 controlled/uncontrolled components의 개념이 다르다:
    - 책의 개념:
        - **controlled component**: 사용자 입력을 `useState`를 사용하여 컴포넌트가 상태를 직접 관리 및 참조하는 컴포넌트
        - **uncontrolled conponent**: 사용자 입력을 `useRef`로 참조하여 별도의 상태 관리 없이 참조하는 컴포넌트
    - 리액트 공식 문서의 개념(출처: [Controlled and Uncontrolled components](https://react.dev/learn/sharing-state-between-components#controlled-and-uncontrolled-components)):
        - **controlled components**: 로컬 상태가 아닌 props에 의해 제어되는 컴포넌트(즉, 부모 컴포넌트가 제어)
        - **uncontrolled components**: 로컬 상태를 가진 컴포넌트
    
    책에선 "입력 엘리먼트를 다루는 방법"에 초점을 맞추었으므로, 오인하지 않도록 주의할 필요가 있다
    

---

## 7.6 폼 유효성 검사 테스트

- React Hook Form에는 `resolver`라는 하위 패키지가 있다. 여기에 입력 내용을 검증할 유효성 검사 스키마 객체를 할당할 수 있다(1). 이때 유효성 검사 스키마에 맞지않는 입력이 들어오면 해당 `<input />` 엘리먼트에대한 에러 메시지를 `errors`에 저장한다(2):
    
    ```tsx
    /* /src/.../PostForm/index.tsx */
    export const PostForm = (props: Props) => {
      const {
        register,
        setValue,
        handleSubmit,
        control,
        formState: { errors, isSubmitting },
      } = useForm<PostInput>({
        resolver: zodResolver(createMyPostInputSchema),   // (1) 입력 내용의 유효성 검사 스키마
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
                error={errors.imageUrl?.message}   // (2) 유효성 검사 오류 메시지를 표시한다
              />
            </div>
            ...
      );
    };
    
    ```
    
    ```tsx
    /* /src/lib/schema/MyPost.ts */
    export const createMyPostInputSchema = z.object({
      title: z.string().min(1, "한 글자 이상의 문자를 입력해주세요"),
      description: z.string().nullable(),
      body: z.string().nullable(),
      published: z.boolean(),
      imageUrl: z
        .string({ required_error: "이미지를 선택해주세요" })
        .nullable(),
    });
    ```
    
    예를 들어, 제목을 입력하지 않은 입력이 들어오면 `"한 글자 이상의 문자를 입력해주세요"`라는 오류 메시지가 렌더링된다
    
- jest의 Tesing Library 확장 매처중 하나인 `toHaveErrorMessage`는 엘리먼트에 `aria-errormessage` 속성을 사용하여 오류 메시지를 포함하는지를 확인한다:
    
    ```tsx
    import { render, screen } from "@testing-library/react";
    import "@testing-library/jest-dom"; // jest-dom 확장 매처 사용
    
    test("입력 필드에 오류 메시지가 표시됨", () => {
      render(
        <>
          <input aria-invalid="true" aria-errormessage="error-msg" />
          <span id="error-msg">이름을 입력해야 합니다.</span>
        </>
      );
    
      const input = screen.getByRole("textbox");
      expect(input).toHaveErrorMessage("이름을 입력해야 합니다.");
    });
    ```
    
    하지만 이 매처는 deprecated 되었으므로 공식 스펙에 적합한 매처인 [`toHaveAccessibleErrorMessage`](https://github.com/testing-library/jest-dom?tab=readme-ov-file#tohaveaccessibleerrormessage)를 사용해야만 한다(출처: [Testing Library/jest-dom - toHaveErrorMessage](https://github.com/testing-library/jest-dom?tab=readme-ov-file#tohaveerrormessage))
    

---

## 7.7 웹 API 응답을 Mock 객체화하는 MSW

- 지금까지 웹 API 관련 테스트를 작성할 때 사용했던 Mock 객체는 Jest의 Mock 함수였다. 이번 절에서는 MSW라는 Mock Server 라이브러리를 사용하여 웹 API를 Mock 객체화 한다
- MSW는 네트워크 계층의 Mock 객체를 만드는 라이브러리이다. MSW를 사용하여 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체할 수 있다
- 웹 API 요청을 가로채려면 요청 핸들러를 만들어야 한다. 다음 예제에서 `rest.post()` 함수에 인수로 넘겨주는 콜백 함수가 요청 핸들러이다:
    
    ```jsx
    /* JavaScript */
    import { rest } from "msw";
    
    const worker = setupWorker(
      rest.post("/login", async (req, res, ctx) => {
        const { username } = await read.json();
    
        return res(
          ctx.json({
            username,
            firstName: "John"
          })
        )
      })
    )
    
    worker.start()
    ```
    
    요청 핸들러는 로컬 호스트의 `/login` 경로에 대한 POST 요청을 가로챈다. `/login`에 대한 요청은 body에 포함된 `username`을 참조해 `{ username, firstName: "John" }`이라는 JSON 응답을 반환한다
    
- 기본적으로 jest dom에는 fetch API가 구현되어있지 않아, fetch API 사용이 불가하다. 하지만 node v18 부터는 전역적으로 fetch API를 지원하므로, node 버전이 18 이상이라면 별도의 폴리필 라이브러리 없이 configuration을 통해 fetch API 사용이 가능하다:
    
    ```jsx
    /* jest.config.js */
    async function jestConfig() {
      return {
    	  ...
        globals: {
          fetch: globalThis.fetch,
        }
      };
    }
    ```
    

---

## 7.8 웹 API 통합 테스트

- 이번 절에서는 복잡한 인터랙션 분기를 가진 컴포넌트의 테스트 방법을 살펴볼 것이다
- 작성한 기사는 공개 여부를 선택해 저장할 수 있다:
    - 비공개 선택시) 저장은 되지만 로그인한 사용자 외에는 기사 열람 불가
    - 공개 선택시) 로그인한 사용자가 아니어도 기사 열람 가능. 이때 경고창(`AlertDialog`)을 띄워서 공개 선택에 대한 컨펌을 받아야한다

---

## 7.9 이미지 업로드 통합 테스트

- 이미지 업로드 기능을 가진 UI 컴포넌트의 테스트 방법을 살펴보자
- jsdom은 브라우저 API를 제공하지 않기 때문에, Mock 객체를 만들어 더미 이미지 데이터를 읽어와야 한다