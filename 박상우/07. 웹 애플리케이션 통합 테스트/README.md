## 🟢 React Context 통합 테스트

### 💡 방법 1 : 테스트용 컴포넌트를 만들어 인터랙션 실행하기

```tsx
const TestComponent = () => {
  const { showToast } = useToastAction();

  return <button onClick={() => showToast({ message })}>show</button>;
};
```

```tsx
test('showToast를 호출하면 Toast컴포넌트가 표시된다', async () => {
  const message = 'test';

  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>
  );

  // 처음에는 렌더링되지 않는다.
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();

  // 사용자 버튼 클릭 액션 재현
  await user.click(screen.getByRole('button'));

  // 렌더링됐는지 확인한다.
  expect(screen.getByRole('alert')).toHaveTextContent(message);
});
```

<br />

### 💡 방법 2 : 초깃값을 주입해서 랜더링된 내용 확인하기

```tsx
test('Succeed', () => {
  const state: ToastState = {
    isShown: true,
    message: '성공했습니다',
    style: 'succeed',
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent(state.message);
});

test('Failed', () => {
  const state: ToastState = {
    isShown: true,
    message: '실패했습니다',
    style: 'failed',
  };
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>);
  expect(screen.getByRole('alert')).toHaveTextContent(state.message);
});
```

Props를 사용하는 경우 초기 고정값만 넘겨주어 고정값이 잘 랜더링 되는지만 검증한다.

첫번째 방법의 경우 TestComponent 내부에 useToastAction도 포함하여 테스트를 하고 있기 때문에 두번째 방법이 보다 넓은 범위에서 테스트한 케이스가 된다.

<br />

### 💡 🧐 여러가지 테스트 케이스 중에 어떤 것을 선택해야하나?

앞에서 테스트하고자하는 부분은 다음과 같다고 했다.

- Provider의 상태에 따라 랜더링 여부가 변경된다.
- Provider의 갱신 함수로 상태를 갠신할 수 있다.

두가지 모두를 테스트한다고 했을 때는2번 방식은 랜더링만 테스트하고 있기 때문에 두 부분 모두 커버하는 테스트 방식으로는 1번 방식이 더 적절하지 않나? 하는 생각이 들었다.

-> 당연한 소리겠지만, 어떤 방식이 더 맞다기 보다 테스트 케이스, 목적에 따라 테스트하는 방법이 달라지고, 생각보다 주관이 많이 포함되는 부분일 수도 있겠다는 생각을 했다.

<br />

## 🟢 Next.js 라우터와 렌더링 통합 테스트

### 💡 next-router-mock

Next.js에서 라우터 부분 테스트를 위해 목 객체를 사용해야한다. next-router-mock는 라우터 테스트를 위한 목 객체를 제공하는 라이브러리이다.

<Link> 컴포넌트, useRouter()를 활용한 URL 참조, 변경에 대한 테스트를 실행할 수 있다.

<br />

### 💡 라우터와 UI 컴포넌트 통합 테스트

```tsx
test("현재 위치는 'My Posts'이다", () => {
  mockRouter.setCurrentUrl('/my/posts');
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name: 'My Posts' });
  expect(link).toHaveAttribute('aria-current', 'page');
});

test("현재 위치는 'Create Post'이다", () => {
  mockRouter.setCurrentUrl('/my/posts/create');
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name: 'Create Post' });
  expect(link).toHaveAttribute('aria-current', 'page');
});
```

`mockRouter.setCurrentUrl` - 테스트 환경의 URL을 설정할 수 있다.

<br />

### 💡 test.each 활용

매개변수만 다른 다양한 케이스를 반복하여 테스트할 수 있다.

```tsx
test.each([
  { url: '/my/posts', name: 'My Posts' },
  { url: '/my/posts/123', name: 'My Posts' },
  { url: '/my/posts/create', name: 'Create Post' },
])('$url의 현재 위치는 $name이다', ({ url, name }) => {
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole('link', { name });
  expect(link).toHaveAttribute('aria-current', 'page');
});
```

<br />

`({ url, name }) => {}` → 배열의 각 객체가 `{ url, name }` 형태로 들어가고, 개별 테스트에서 `{ url, name }` 을 비구조화 할당해서 사용.

`$url의 현재 위치는 $name이다` → 테스트 설명(`test.each`의 첫 번째 인자)에서 **`$변수명`** 을 사용하면, 각 인자가 해당 위치에 자동으로 삽입됨.

<br />

## 🟢 Next.js 라우터와 입력 통합 테스트

### 💡 인터렉션 테스트

```tsx
const user = userEvent.setup();

function setup(url = '/my/posts?page=1') {
  mockRouter.setCurrentUrl(url);
  render(<Header />);

  const combobox = screen.getByRole('combobox', { name: '공개 여부' });

  // URL 이동 버튼 사용자 클릭 인터렉션 재현
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label);
  }
  return { combobox, selectOption };
}

test('공개 여부를 변경하면 status가 변한다', async () => {
  const { selectOption } = setup();

  expect(mockRouter).toMatchObject({ query: { page: '1' } });

  // '공개'를 선택하면 ?status=public이 된다.
  await selectOption('공개');

  // 기존의 page=1이 그대로 있는지도 함께 검증한다.
  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'public' },
  });

  // '비공개'를 선택하면 ?status=private이 된다.
  await selectOption('비공개');

  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'private' },
  });
});
```

`setup` 함수 처럼 초깃값 설정, 랜더링 인터렉션 같은 부분을 추상화 하면 가독성 높은 테스트 코드를 작성할 수 있다.

<br />

## 🟢 React Hook Form으로 폼 쉽게 다루기

폼은 웹 애플리케이션에서 필수적인 요소이며, 다양한 라이브러리가 존재한다.

폼은 제출하는 시점에서 입력된 내용을 어디서 참조할 것인지가 중요하다. 제어 컴포넌트와 비제어 컴포넌트로 리액트에서 입력 값을 참조하는 방법에 따라 나뉜다.

<br />

### 💡 제어 컴포넌트

useState 등을 통해 컴포넌트 단위로 상태를 관리하는 컴포넌트를 제어 컴포넌트(Controlled Component)라고 한다. 제어 컴포넌트는 관리중인 상태를 필요한 타이밍에 웹 API로 전달한다.

```tsx
const ControlledSearchInput = () => {
	const [ value, setValue ] = useState("");

	return (
		<input
			type="search"
			value={value}
			onChange={(event) => {
				setValue(event.currentTarget.value);
			}}
	)
}
```

제어 컴포넌트의 흐름

- `useState`를 통해 입력 값을 저장할 상태를 만들고 초깃값을 빈문자열을 설정한다.
- `onChange`에 할당된 이벤트를 통해 `setValue`를 trigger하고, 입력된 값을 최신 상태로 갱신한다.
- 해당 input을 form에서 활용할 때, `onSubmit`을 실행하는 시점에서 최신 상태를 state에서 참조하여 활용한다.

<br />

### 💡 비제어 컴포넌트

비제어 컴포넌트는 전송 시에 입력 요소의 값을 직접 참조하기 때문에 상태를 별도로 관리하지 않아도 된다.

```tsx
const UnControlledSearchInput = () => {
  const ref = useRef<HTMLInputElement>(null);

  return <input type='search' name='search' defaultValue='' ref={ref} />;
};
```

비제어 컴포넌트는 `onChange`를 활용하지 않으며, `useState`로 설정했던 초깃값은 `defaultValue`로 대체한다.

<br />

### 💡 React Hook Form과 비제어 컴포넌트

React Hook Form은 비제어 컴포넌트로 고성능 폼을 쉽게 작성할 수 있게 도와준다.

React Hook Form을 적용하기 위해 기본적으로 `useForm` 이라는 훅을 활용하며, 훅의 반환 값인 `register`d와 `handleSubmit` 을 활용한다.

```tsx
const { register, handelSubmit } = useForm({
  defaultValues: { search: q },
});
```

🟨 **register**

기본적으로 입력값을 참조하기 위해 활용한다.

```tsx
<input type='search' {...register('search')} />
```

<div>
  <img src='' width='500px' />
</div>

→ 각 속성을 구조분해 할당을 통해 개별적으로 적용한다. ( [공식 문서](https://react-hook-form.com/docs/useform/register) )

🟨 **handleSubmit**

지정한 콜백함수를 통해 참조한 입력값을 통해 폼을 제출한다.

```tsx
<form
  onSubmit={handleSubmit((value) => {
    // 실행할 폼 제출 로직
  })}
>
  ...
</form>
```

<br />

## 🟢 폼 유효성 검사 테스트

### 💡 테스트할 UI 컴포넌트의 설계 포인트

**유효성 검사**

react hook form의 resolver를 통해 유효성 검사를 실시하고, zod를 통해 유효성 검사 스키마를 작성하여 폼의 각 필드 별 유효성 항목을 정의하여 활용한다.

```tsx
import * as z from 'zod';

export const createMyPostInputSchema = z.object({
  title: z.string().min(1, '한 글자 이상의 문자를 입력해주세요'),
  description: z.string().nullable(),
  body: z.string().nullable(),
  published: z.boolean(),
  imageUrl: z.string({ required_error: '이미지를 선택해주세요' }).nullable(),
});
export type CreateMyPostInput = z.infer<typeof createMyPostInputSchema>;

// -------------------------------------------------------------------

const {
  register,
  setValue,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<PostInput>({
  resolver: zodResolver(createMyPostInputSchema),
});
```

**handleSubmit**

```tsx
const Component = () => {
	 ...

	 return (
		 <form submit={handleSubmit(props.onValid, props.onInValid}>
			 ...
		 </form>
	 )
}
```

handleSubmit을 통해 submit 이벤트를 실행할 때도 resolver로 유효성 검사를 수행하는데, 이때 폼 입력값이 유효하다면 handleSubmit의 첫번째 인자인 onValid가 실행되고, 유효하지 않으면 onInValid가 실행된다.

두 함수는 작성한 바와 같이 인라인으로 작성하지 않고, 외부함수를 지정하여 활용할 수 있다.

<br />

### 💡 인터렉션 테스트 설정

```tsx
// 유저 인터렉션 재현을 위한 설정
const user = userEvent.setup();

function setup() {
  // 이벤트 관련 목 함수(스파이) 생성)
  const onClickSave = jest.fn();
  const onValid = jest.fn();
  const onInvalid = jest.fn();

  // 테스트 컴포넌트 랜더링
  render(
    <PostForm
      title='신규 기사'
      onClickSave={onClickSave}
      onValid={onValid}
      onInvalid={onInvalid}
    />
  );

  // 폼 필드 별 인터렉션 재현
  async function typeTitle(title: string) {
    const textbox = screen.getByRole('textbox', { name: '제목' });
    await user.type(textbox, title);
  }

  async function saveAsPublished() {
    await user.click(screen.getByRole('switch', { name: '공개 여부' }));
    await user.click(screen.getByRole('button', { name: '공개하기' }));
  }

  async function saveAsDraft() {
    await user.click(
      screen.getByRole('button', { name: '비공개 상태로 저장' })
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
```

<br />

### 💡 onInValid가 실행되는 테스트

```tsx
test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 에러가 표시된다", async () => {
  const { saveAsDraft } = setup();

  // 비공개 상태로 저장
  await saveAsDraft();

  // 유효성 검사 에러 표시까지 대기
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: '제목' })).toHaveErrorMessage(
      '한 글자 이상의 문자를 입력해주세요'
    )
  );
});

test("유효하지 않은 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup();

  // 비공개 상태로 저장
  await saveAsDraft();
  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).not.toHaveBeenCalled();
  expect(onInvalid).toHaveBeenCalled();
});
```

- `waitfor()` - 특정 조건이 충족될 때까지 테스트가 자동으로 재시도하면서 기다려줌. 화면 업데이트가 비동깆거으로 변하는 경우 사용. 랜더링이 비동기적으로 실행되기 때문에 즉시 테스트하면 에러가 발생할 가능성이 있다.

<br />

### 💡 onValid가 실행되는 테스트

```tsx
test("유효한 입력 내용으로 '비공개 상태로 저장'을 시도하면 onValid 이벤트 핸들러가 실행된다", async () => {
  mockUploadImage();
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup();
  const { selectImage } = selectImageFile();

  // 유효한 내용 입력
  await typeTitle('나의 기사');
  await selectImage();

  // 비공개 상태 저장
  await saveAsDraft();

  expect(onClickSave).toHaveBeenCalled();
  expect(onValid).toHaveBeenCalled();
  expect(onInvalid).not.toHaveBeenCalled();
});
```

### 💡 접근성 관련 매처

```tsx
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
          aria-invalid={!!error} // 에러가 있으면 aria-invalid 활성화
          aria-errormessage={errorMessageId} // 에러 메시지 연결
          aria-describedby={description ? descriptionId : undefined} // 설명 연결
        />

        {/* 설명 or 에러 메시지 표시 */}
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

```tsx
test('TextboxWithInfo', async () => {
  const args = {
    title: '제목',
    info: '0 / 64',
    description: '영문과 숫자를 조합하여 64자 이내로 입력해주세요',
    error: '유효하지 않은 문자가 포함되어 있습니다',
  };
  render(<TextboxWithInfo {...args} />);
  const textbox = screen.getByRole('textbox');

  // textbox에 title이 설정되었는지 테스트
  expect(textbox).toHaveAccessibleName(args.title);

  // textbox에 description이 적용되었는지 테스트
  expect(textbox).toHaveAccessibleDescription(args.description);
  // textbox에 error가 적용되었는지 테스트
  expect(textbox).toHaveErrorMessage(args.error);
});
```

<br />

## 🟢 웹 API 응답을 목 객체화하는 MSW

### 💡 네트워크 계층의 목 객체를 만드는 MSW

MSW는 네트워크 계층의 목 객체를 만드는 라이브러리이다. MSW를 사용하면 웹 API 요청을 가로채서 임의의 응답 값으로 대체할 수 있다. 이를 활용하여 응답이 오는 상황을 재현하여 테스트할 수 있다.

MSW는 웹 API를 가로채기 위해 요청 핸들러를 만들어 사용한다.

```tsx
import { setupWorker, rest } from 'msw';
const worker = setupWorker(
  rest.post('/login', async (req, res, ctx) => {
    const { userName } = await req.json();

    return res(
      ctx.json({
        userName,
        firstName: 'Jone',
      })
    );
  })
);
worker.start();
```

→ `/login` 경로로 들어오느 `post` 요청을 가로챈다.

<br />

### 💡 Jest에서 사용하기

`setUpServer` 함수를 통해 제스트용 설정 함수를 만든다.

```tsx
export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers); // MSW Mock 서버 생성

  beforeAll(() => server.listen()); // 테스트 시작 전 서버 실행
  afterEach(() => server.resetHandlers()); // 각 테스트 후 핸들러 리셋
  afterAll(() => server.close()); // 모든 테스트 종료 후 서버 종료

  return server;
}
```

각 테스트 파일에서 테스트에 필요한 핸들러 함수를 넘겨 MSW 서버를 통해 테스트되도록 설정할 수 있다.

```tsx
setUpMockServer(...MyPosts.handlers);
```

<br />

## 🟢 웹 API 통합 테스트

### 💡 AlertDialog 렌더링 테스트

```
describe("AlertDialog", () => {
  test("공개를 시도하면 AlertDialog가 표시된다", async () => {
    const { typeTitle, saveAsPublished, selectImage } = await setup();

    // 사용자 인터렉션 재현
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

    // 사용자 인터렉션 재현
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
      expect(
        screen.getByRole("textbox", { name: "제목" })
      ).toBeInvalid()
    );
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
```

<br />

### 💡 Toast 렌더링 테스트

```tsx
describe('Toast', () => {
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 사용자 인터렉션 재현
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('저장 중입니다...')
    );
  });

  test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 사용자 인터렉션 재현
    await typeTitle('hoge');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('공개됐습니다')
    );
  });

  test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();

    // 사용자 인터렉션 재현
    await typeTitle('500'); // -> 오류 응답 반환하도록 재현
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent('공개에 실패했습니다')
    );
  });
});
```

<br />

### 💡 화면 이동 테스트

```tsx
describe('화면이동', () => {
  test('비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다', async () => {
    const { typeTitle, saveAsDraft, selectImage } = await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsDraft();
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: '/my/posts/201' })
    );
  });

  test('공개에 성공하면 화면을 이동한다', async () => {
    const { typeTitle, saveAsPublished, clickButton, selectImage } =
      await setup();
    await typeTitle('201');
    await selectImage();
    await saveAsPublished();
    await clickButton('네');
    await waitFor(() =>
      expect(mockRouter).toMatchObject({ pathname: '/my/posts/201' })
    );
  });
});
```

<br />

## 🟢 이미지 업로드 통합 테스트

### 💡 이미지 업로드 처리 흐름

```tsx
// handleChangeFile 함수는 FileReader 객체를 사용해서 이미지 파일을 취득한다.

export function handleChangeFile(
  onValid: (result: ProgressEvent<FileReader>, file: File) => void,
  onInvalid?: (result: ProgressEvent<FileReader>, file: File) => void
) {
  return (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const file = event.target.files[0];

    if (!file) return;

    const fileReader = new FileReader();

    fileReader.onload = (event) => {
      onValid(event, file);
    };
    fileReader.onerror = (event) => {
      onInvalid?.(event, file);
    };
    fileReader.readAsDataURL(file);
  };
}

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
```

<br />

### 💡 통합 테스트용 목 객체 만들기

테스트 환경에서 제공하지 않는 `이미지 선택하기` , `이미지 업로드 호출하기` 같은 로직등른 목함수를 생성하여 테스트에 사용한다.

**1️⃣ 이미지를 선택하는 Mock 함수**

```tsx
export function selectImageFile(
  inputTestId = 'file',
  fileName = 'hello.png',
  content = 'hello'
) {
  // userEvent를 초기화
  const user = userEvent.setup();

  // 더미 이미지 파일을 작성
  const filePath = [`C:\\fakepath\\${fileName}`];
  const file = new File([content], fileName, { type: 'image/png' });

  // render한 컴포넌트에서 data-testid="file"인 input을 취득
  const fileInput = screen.getByTestId(inputTestId);

  // 이 함수를 실행하면 이미지 선택 인터렉션 재현
  const selectImage = () => user.upload(fileInput, file);

  return { fileInput, filePath, selectImage };
}
```

2️⃣ 이미지 업로드 API 호출하는 목 함수

```tsx
jest.mock('../fetcher');

export function mockUploadImage(status?: ErrorStatus) {
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, 'uploadImage')
      .mockRejectedValueOnce(new HttpError(status).serialize());
  }
  return jest
    .spyOn(UploadImage, 'uploadImage')
    .mockResolvedValueOnce(uploadImageData);
}
```

<br />

### 💡 업로드 성공 테스트

```tsx
test('이미지 업로드에 성공하면 이미지의 src 속성이 변경된다', async () => {
  // 이미지 업로드가 성공하도록 설정한다.
  mockUploadImage();

  // 컴포넌트를 렌더링한다.
  render(<TestComponent />);

  // 이미지의 src 속성이 비었는지 확인한다.
  expect(screen.getByRole('img').getAttribute('src')).toBeFalsy();

  // 이미지를 선택한다.
  const { selectImage } = selectImageFile();

  await selectImage();

  // 이미지의 src 속성이 채워졌는지 확인한다.
  await waitFor(() =>
    expect(screen.getByRole('img').getAttribute('src')).toBeTruthy()
  );
});
```

<br />

### 💡 업로드 실패 테스트

```tsx
test('이미지 업로드에 실패하면 경고창이 표시된다', async () => {
  // 이미지 업로드가 실패하도록 설정
  mockUploadImage(500);

  // 컴포넌트를 렌더링
  render(<TestComponent />);

  // 이미지를 선택
  const { selectImage } = selectImageFile();
  await selectImage();

  // 지정한 문자열이 포함된 Toast가 나타나는지 검증
  await waitFor(() =>
    expect(screen.getByRole('alert')).toHaveTextContent(
      '이미지 업로드에 실패했습니다'
    )
  );
});
```

<br />

## 🥸 7장을 읽고

7장에서는 프론트엔드 개발하는 과정에서 주로 등장하는 다앙한 기능들에 대한 통합테스트 과정을 볼 수 있었다.

목차를 다시보면 각 기능 별로 어떤 것들을 테스트 하는지 소제목을 통해 확인할 수 있다.

- **React Context 테스트** - 초기 값 테스트 → 인터렉션 테스트
- **Next.js 라우터와 랜더링 통합 테스트** - 현재 참조 위치 테스트 → 인터렉션 후 이동한 참조 URL 테스트
- **폼 유효성 검사 테스트** - 인터렉션 테스트 → onInValid / onValid 테스트
- **웹 API 테스트** - 인터렉션 테스트 → AlertDialog/Toast 렌더링 테스트 → 화면 이동 테스트
- **이미지 업로드 통합 테스트** - 업로드 성공 / 업로드 실패 테스트

각 테스트 대상에 따라 **테스트 대상과 시나리오를 구체화 하고, 테스트 요소에 집중하기 위해 Mocking할 대상을 구별하는 것**이 테스트 코드를 보다 수월하게 작성할 수 있는 방법인 것 같다.
