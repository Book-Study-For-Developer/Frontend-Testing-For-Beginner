# 6장. 커버리지 리포트

테스트 프레임워크가 구현된 코드가 얼마나 테스트됐는지 측정해서 리포트를 작성해주는 기능.

구성요소

- stmts (구문 커버리지)
  - 구현 파일의 구문이 적어도 한 번 이상 테스트 되었는가?
- Branch(분기 커버리지)
  - 구현 파일에 있는 모든 조건 분기가 적어도 한 번 이상 실행되었는가?
  - 커버리지를 정량 지표로 활용 할 때 중점적으로 사용해야하는 핵심 지표
- Funcs(함수 커버리지)
  - 구현 파일에 있는 함수가 적어도 한번 이상 호출 되었는가?
- LInes (라인 커버리지)
  - 구현 파일에 포함된 모든 라인이 적어도 한 번 이상 통과 되었는가?

## 생각정리

커버리지를 채우기 위한 테스트코드 작성은 지양해야함.  
커버리지의 퍼센트가 Application의 안정성과 반드시 비례하지는 않음.  
테스트가 필요한 구간, 필요없는 구간을 개발자가 적절히 판단해서 작성할 것.

# 7장. 웹 애플리케이션 통합 테스트

**✅ → 책의 내용과 달리 제가 적은 생각 정리 주석 표기 입니다.**

- navigation test

  - `useRouter` 와 `aria-current` 를 사용한 테스트

    ```
    import mockRouter from "next-router-mock";

    test("현재 위치는 'My Posts'이다", () => {
      mockRouter.setCurrentUrl("/my/posts");
      render(<Nav onCloseMenu={() => {}} />);
      const link = screen.getByRole("link", { name: "My Posts" });
      // ✅ aria-current 로 실제 mocking한 대로
      // ✅ router의 값을 잘 불러왔는지 확인
      expect(link).toHaveAttribute("aria-current", "page");
    });
    ```

- App Router의 `next/navigation` 의 `useRouter` 를 mocking하려면?
  - 직접 mocking
    ```tsx
    jest.mock("next/navigation", () => ({
      useRouter: jest.fn(),
      usePathname: jest.fn(() => "/test-path"),
      useSearchParams: jest.fn(() => new URLSearchParams("?query=test")),
    }));
    ```
- selector 테스트

  - 아래가 핵심 코드

    ```tsx
    // ✅ 초기 세팅
    function setup(url = "/my/posts?page=1") {
      mockRouter.setCurrentUrl(url);
      render(<Header />);
      // ✅ screen의 selector를 받아온다.
      const combobox = screen.getByRole("combobox", { name: "공개 여부" });

      // ✅ selector를 선택하는 함수
      async function selectOption(label: string) {
        await user.selectOptions(combobox, label);
      }
      return { combobox, selectOption };
    }

    test("기본값으로 '모두'가 선택되어 있다", async () => {
      const { combobox } = setup();
      // ✅ combobox의 선택된 label로 검증한다.
      expect(combobox).toHaveDisplayValue("모두");
    });

    test("공개 여부를 변경하면 status가 변한다", async () => {
      const { selectOption } = setup();
      expect(mockRouter).toMatchObject({ query: { page: "1" } });
      // '공개'를 선택하면 ?status=public이 된다.
      await selectOption("공개");
      // ✅ query string으로 선택 여부를 검증한다
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

- react-hook-form 테스트

  - hook form은 주로 비제어 컴포넌트들을 다룬다.
  - 비제어 컴포넌트는 아래와 같이 테스트할 수 있다.

    - 재사용이 가능한 유저 행동 함수들은 따로 분리하고, 사용자 행동 결과를 테스트한다.

    ```tsx
    // ✅ **actor 지정**
    const user = userEvent.setup();

    // ✅ 테스트에 필요한 함수 및 mock객체 세팅
    // ✅ user의 행동을 함수로서 지정해둠
    function setup() {
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

    test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
      const { saveAsDraft } = setup();
      // ✅ 함수 호출
      await saveAsDraft();
      // ✅ validation check 테스트
      // ✅ validation이 화면에 나타나기까지 걸리는 시간이 있기 때문에 waitFor 사용
      await waitFor(() =>
        expect(
          screen.getByRole("textbox", { name: "제목" })
        ).toHaveErrorMessage("한 글자 이상의 문자를 입력해주세요")
      );
    });
    ```

- 접근성 테스트

  - 아래와 같은 코드는 이렇게 접근성을 테스트할 수 있다.

    ```tsx
    // ✅ textbox 테스트 컴포넌트
    ...
    <label htmlFor={textboxId}>
    	{title}
    </label>
    <input
        {...props}
        ref={ref}
        id={textboxId}
        aria-invalid={!!error}
        aria-errormessage={errorMessageId}
        aria-describedby={description ? descriptionId : undefined}
    />
    ...

    ---

    // ✅ 위 컴포넌트 테스트
    // ✅ aria나 label의 htmlFor같은 접근성을 테스트할 수 있다.
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

- MSW

  - 실제 개발단에서 사용할 수도 있고, test시에도 사용할 수 있다.

    ```tsx
    // ✅ MSW mocking server setup
    export function setupMockServer(...handlers: RequestHandler[]) {
      const server = setupServer(...handlers);
      beforeAll(() => server.listen());
      afterEach(() => server.resetHandlers());
      afterAll(() => server.close());
      return server;
    }

    ---

    // ✅ MSW mocking 예시
    import { rest } from "msw";
    import { path } from "..";
    import { getMyProfileData } from "./fixture";

    // ✅ 함수 세팅
    export function handleGetMyProfile(args?: {
      mock?: jest.Mock<any, any>;
      status?: number;
    }) {
    	// ✅ 왜 클로저로 함수를 선언하는걸까?
    	// ✅ 테스트 유연성을 높이기 위함이라고 보임. status 테스트 등
      return rest.get(path(), async (_, res, ctx) => {
        args?.mock?.();
        if (args?.status) {
          return res(ctx.status(args.status));
        }
        return res(ctx.status(200), ctx.json(getMyProfileData));
      });
    }

    export const handlers = [handleGetMyProfile()];

    ```

- jsdom 에서의 fetch polyfill
  - 현재는 fetch api 지원함
  - 구형 브라우저에서만 사용하거나, Node 18 미만 버전에서는 node-fetch 등 fetch api polyfill 사용해야함.
  - https://github.com/jsdom/jsdom/releases/tag/23.0.0 jsdom에는 23버전부터 node 18이 minimum surpport 가 되면서 fetch api polyfill 사용이 불필요해진게 아닐지..
- 화면 이동 테스트
  ```tsx
  test("비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다", async () => {
    const { typeTitle, saveAsDraft, selectImage } = await setup();
    await typeTitle("201");
    await selectImage();
    await saveAsDraft();
    // ✅ 화면 이동 테스트시 waitFor로 mockRouter 이동 확인
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: "/my/posts/201" })
    );
  });
  ```
- 복잡한 API 로직 테스트
  - spyOn 을 잘 활용한다.
    ```tsx
    export function mockUploadImage(status?: ErrorStatus) {
      if (status && status > 299) {
    	  // ✅ uploadImage가 실제 file upload api
        return jest
          .spyOn(UploadImage, "uploadImage")
          .mockRejectedValueOnce(new HttpError(status).serialize());
      }
      return jest
        .spyOn(UploadImage, "uploadImage")
        .mockResolvedValueOnce(uploadImageData);
    }
    ---
      test("이미지를 선택하면 imageUrl값이 truty가 된다", async () => {
    	  // ✅ API 활동 mocking
        mockUploadImage();
        const mock = jest.fn();
        render(<TestComponent onChange={mock} />);
        const { filePath, selectImage } = selectImageFile();
        // ✅ 이미지 선택 (업로드 API 까지 실행)
        await selectImage();
        expect(mock).toHaveBeenCalledWith(filePath);
        await waitFor(() =>
          expect(screen.getByText("selected")).toBeInTheDocument()
        );
      });
    ```
- hook 테스트는 테스트용 컴포넌트를 만들어서 할 수도 있다.
  ```tsx
  function TestComponent({
    onChange,
    onResolved,
    onRejected,
  }: {
    onChange?: (path: string[]) => void;
    onResolved?: (data: UploadImageData) => void;
    onRejected?: (err: unknown) => void;
  }) {
    const { register, setValue } = useForm();
    const { onChangeImage, imageUrl } = useUploadImage({
      register,
      setValue,
      onResolved,
      onRejected,
      name: "image",
    });
    return (
      <>
        {imageUrl && <p>selected</p>}
        <input
          type={"file"}
          data-testid="file"
          onChange={(event) => {
            onChangeImage(event);
            onChange?.([event.target.value]);
          }}
        />
      </>
    );
  }

  ---

    test("이미지를 선택하면 imageUrl값이 truty가 된다", async () => {
      mockUploadImage();
      const mock = jest.fn();
      render(<TestComponent onChange={mock} />);
      const { filePath, selectImage } = selectImageFile();
      await selectImage();
      expect(mock).toHaveBeenCalledWith(filePath);

      await waitFor(() =>
        expect(screen.getByText("selected")).toBeInTheDocument()
      );
    });
  ```

## 생각정리

- 복잡한 API들은 모두 spyOn으로 먼저 떼어 내고 UI 로직만 먼저 테스트하자.
  - 너무 큰 덩어리들은 이렇게 나눠보는건 어떨까?
    - UI 시멘틱 로직 테스트
      - select 선택, checkbox 선택, 렌더링 테스트 등
    - 비즈니스 로직 테스트
      - unit test
    - custom hook 테스트
      - `renderHook`을 사용하거나 위 예시처럼 커스텀 컴포넌트로 테스트
    - API Mocking 통합 테스트
      - 전반적인 통합 테스트
