> [!NOTE]
>
> ### 로컬 개발 환경 설정 (246p ~ 249p)
>
> - (1) 프로젝트 설치: `npm i`
> - (2) MinIO Client 설치: `brew install minio/stable/mc`
> - (3) Docker Desktop 설치: https://www.docker.com/products/docker-desktop
> - (4) Docker Compose 실행: `docker compose up -d`
> - (5) 버킷 생성 스크립트 실행: `sh create-image-bucket.sh`
> - (6) 테스트용 초기 데이터 주입: `npm run prisma:migrate`
> - (7) 개발 서버 실행: `npm run dev`

## React Context와 통합 테스트

> `Toast` 컴포넌트

### 테스트용 컴포넌트 만들기

- 테스트용 컴포넌트에서 `useToastAction` 훅의 `showToast`를 사용하여 알림 표시

```jsx
const TestComponent = ({ message }: { message: string }) => {
  const { showToast } = useToastAction() // <Toast>를 표시하기 위한 훅
  return <button onClick={() => showToast({ message })}>show</button>
}
```

- 사용자의 인터랙션을 통해 `showToast`가 호출되는지 테스트

```jsx
test('showToast를 호출하면 Toast컴포넌트가 표시된다', async () => {
  const message = 'test'
  render(
    <ToastProvider>
      <TestComponent message={message} />
    </ToastProvider>,
  )
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button'))
  expect(screen.getByRole('alert')).toHaveTextContent(message)
})
```

### Provider에 초기 값 주입하기

- `ToastProvider`에 `defaultState`를 주입하여 테스트

```jsx
test('Succeed', () => {
  const state: ToastState = {
    isShown: true,
    message: '성공했습니다',
    style: 'succeed',
  }
  render(<ToastProvider defaultState={state}>{null}</ToastProvider>)
  expect(screen.getByRole('alert')).toHaveTextContent(state.message)
})
```

> 🤔 만약 나라면 두 가지 방식 중 첫 번째 방법인 `showToast`를 직접 호출하는 방식으로 테스트할 것 같다.<br />
> 아무래도 클릭 재현까지 확인할 수 있어 `Toast` 컴포넌트를 검증한다고 했을 때 더 적절한 방식으로 보인다.

## Next.js 라우터와 렌더링 통합 테스트

> `Nav` 컴포넌트

- `next-router-mock`: 라우터 모킹
- `aria-current`: 현재 위치 확인
- `test.each`: 반복되는 test 모듈화

```ts
import mockRouter from 'next-router-mock'

test.each([
  { url: '/my/posts', name: 'My Posts' },
  { url: '/my/posts/123', name: 'My Posts' },
  { url: '/my/posts/create', name: 'Create Post' },
])('$url의 현재 위치는 $name이다', ({ url, name }) => {
  mockRouter.setCurrentUrl(url)
  render(<Nav onCloseMenu={() => {}} />)
  const link = screen.getByRole('link', { name })
  expect(link).toHaveAttribute('aria-current', 'page')
})
```

> [!NOTE]
>
> #### `test.each`
>
> - `test.each(table)(name, fn, timeout)` → 배열 방식
> - `test.each`table`(name, fn, timeout)` → 테이블 방식
>
> ```ts
> test.each`
>   url                   | name
>   ${'/my/posts'}        | ${'My Posts'}
>   ${'/my/posts/123'}    | ${'My Posts'}
>   ${'/my/posts/create'} | ${'Create Post'}
> `('$url의 현재 위치는 $name이다', ({ url, name }) => {
>   mockRouter.setCurrentUrl(url)
>   render(<Nav onCloseMenu={() => {}} />)
>   const link = screen.getByRole('link', { name })
>   expect(link).toHaveAttribute('aria-current', 'page')
> })
> ```

## Next.js 라우터와 입력 통합 테스트

> 기사 목록의 `Header` 컴포넌트

- `setup` 함수로 테스트 환경 설정 처리
  - `setCurrentUrl`: url 설정
  - `render` 함수로 테스트할 컴포넌트 화면 렌더링
  - `selectOption`: 셀렉트 박스에서 요소를 선택하는 인터랙션 함수 (비동기)

```tsx
function setup(url = '/my/posts?page=1') {
  mockRouter.setCurrentUrl(url)
  render(<Header />)
  const combobox = screen.getByRole('combobox', { name: '공개 여부' })
  async function selectOption(label: string) {
    await user.selectOptions(combobox, label)
  }
  return { combobox, selectOption }
}
```

### url로 직접 접근 시 테스트

```tsx
test("기본값으로 '모두'가 선택되어 있다", async () => {
  const { combobox } = setup()
  expect(combobox).toHaveDisplayValue('모두')
})

test("status?=public으로 접속하면 '공개'가 선택되어 있다", async () => {
  const { combobox } = setup('/my/posts?status=public')
  expect(combobox).toHaveDisplayValue('공개')
})

test("staus?=private으로 접속하면 '비공개'가 선택되어 있다", async () => {
  const { combobox } = setup('/my/posts?status=private')
  expect(combobox).toHaveDisplayValue('비공개')
})
```

### 셀렉트 박스 선택 시 인터랙션 테스트

> ✨페이지 번호인 `?page`가 보존된 상태로 `?status`가 변경되는지 검증

```tsx
test('공개 여부를 변경하면 status가 변한다', async () => {
  const { selectOption } = setup()
  expect(mockRouter).toMatchObject({ query: { page: '1' } })
  await selectOption('공개')
  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'public' },
  })
  await selectOption('비공개')
  expect(mockRouter).toMatchObject({
    query: { page: '1', status: 'private' },
  })
})
```

> [!NOTE]
>
> #### React Hook Form
>
> - 비제어 컴포넌트로 고성능 폼을 쉽게 작성할 수 있도록 도와주는 라이브러리
> - 입력 요소를 참조하는 ref나 이벤트 핸들러 자동 생성 및 설정
>   - `useForm` 훅으로 폼 생성
>   - `register` 함수로 등록
>   - `handleSubmit`으로 submit 관리

## 폼 유효성 검사 테스트

> - `PostForm` 컴포넌트
>   - 입력폼 제공
>   - 입력 내용 검증(유효성 검사)
>   - 유효성 검사 오류 시 오류 표시
>   - 유효한 내용이 전송되면 `onValid`
>   - 유효하지 않는 내용이 전송되면 `onInvalid` 실행

- 호출을 확인해야 하는 함수 → `onClickSave`, `onValid`, `onInvalid`

### `onInvalid` 테스트

```tsx
test("유효하지 않은 입력 내용을 포함해 '비공개 상태로 저장'을 시도하면 유효성 검사 오류가 표시된다", async () => {
  const { saveAsDraft } = setup()
  await saveAsDraft()
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: '제목' })).toHaveErrorMessage(
      '한 글자 이상의 문자를 입력해주세요',
    ),
  )
})

test("유효하지 않은 입력 내용을 포함해 '비공개 상태로 저장'을 시도하면 onInvalid 이벤트 핸들러가 실행된다", async () => {
  const { saveAsDraft, onClickSave, onValid, onInvalid } = setup()
  await saveAsDraft()
  expect(onClickSave).toHaveBeenCalled()
  expect(onValid).not.toHaveBeenCalled()
  expect(onInvalid).toHaveBeenCalled()
})
```

### `onValid` 테스트

```tsx
test("유효한 입력 내용으로 '비공개 상태로 저장'을 시도하면 onValid 이벤트 핸들러가 실행된다", async () => {
  mockUploadImage() // 이미지 업로드 통신 모킹
  const { typeTitle, saveAsDraft, onClickSave, onValid, onInvalid } = setup()
  const { selectImage } = selectImageFile()

  await typeTitle('나의 기사') // 제목 입력 인터랙션 함수
  await selectImage() // 이미지 선택 인터랙션 함수
  await saveAsDraft()

  expect(onClickSave).toHaveBeenCalled()
  expect(onValid).toHaveBeenCalled()
  expect(onInvalid).not.toHaveBeenCalled()
})
```

- 접근성 관련 매처 → `TextboxWithInfo` 컴포넌트
  - `aria-invalid` → 유효성 검사
  - `aria-errormessage` → 에러 메시지와 매칭
  - `aria-describedby` → 요약 메시지와 매칭
- 접근성 대응이 충분한지 검증하는 매처는 `@testing-library/jest-dom`에서 확인

## 웹 API 응답을 목 객체화하는 MSW

- 네트워크 계층의 **목 객체**를 만드는 목 서버 라이브러리
- 웹 API 요청을 가로채서 임의의 값으로 만든 응답으로 대체 가능
- 웹 API 서버를 실행하지 않아도 응답이 오는 상황을 재현 가능 → 통합 테스트 시 목 서버로 사용 가능
- 요청 핸들러를 통해 웹 API 요청 가로채기

### jest에서 사용하기

- `msw/node`에서 제공하는 `setupServer` 함수로 jest용 설정 함수
- 요청 핸들러를 `setupServer` 함수에 가변 인수로 넘기기
- `setupServer` 함수는 테스트마다 서버를 초기화 → 테스트가 다른 테스트에 영향을 받지 않음
- 공통 설정 함수 → `setupMockServer`

```tsx
export function setupMockServer(...handlers: RequestHandler[]) {
  const server = setupServer(...handlers)
  beforeAll(() => server.listen()) // 서버 연결
  afterEach(() => server.resetHandlers()) // 핸들러 리셋
  afterAll(() => server.close()) // 클린업
  return server
}
```

### Fetch API 폴리필

- `jsdom`에 Fetch API 적용 X
- MSW를 사용해 네트워크 계층을 목 객체화할 때는 문제 발생
- 폴리필 `whatwg-fetch` 사용 ([npm](https://www.npmjs.com/package/whatwg-fetch))
  - 모든 테스트에 적용되도록 설정 파일(`jest.setup.ts`)에서 import

## 웹 API 통합 테스트

> `MyPostsCreate` 컴포넌트
>
> - 비공개 상태로 저장하면 비공개한 기사 화면으로 이동한다.
> - 공개를 시도하면 `AlertDialog`를 띄운다.
>   - `AlertDialog`에서 `아니오`를 선택하면 경고창이 사라진다.
>   - `AlertDialog`에서 `네`를 선택하면 공개된다.

- 인터랙션 테스트 설정
  - `typeTitle`
  - `saveAsPublished`
  - `saveAsDraft`
  - `clickButton`
  - `selectImage`

### `AlertDialog` 렌더링 테스트

```tsx
describe('AlertDialog', () => {
  test('공개를 시도하면 AlertDialog가 표시된다', async () => {
    const { typeTitle, selectImage, saveAsPublished } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsPublished() // 기사 공개
    expect(screen.getByText('기사를 공개합니다. 진행하시겠습니까?')).toBeInTheDocument()
  })

  test('[아니오] 버튼을 누르면 AlertDialog가 사라진다', async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsPublished()
    await clickButton('아니오')
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })

  test('유효하지 않은 내용을 포함한 채로 제출하면 AlertDialog가 사라진다', async () => {
    const { selectImage, saveAsPublished, clickButton } = await setup()
    await selectImage()
    await saveAsPublished()
    await clickButton('네')
    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: '제목' })).toBeInvalid()
    })
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  })
})
```

### `Toast` 렌더링 테스트

```tsx
export function handleCreateMyPosts(spy?: jest.Mock<any, any>) {
  return rest.post(path(), async (req, res, ctx) => {
    const data: ApiMyPosts.PostInput = await req.json()
    spy?.({ body: data, headers: req.headers.get('content-type') })
    if (data.title === '500') {
      const err = new HttpError(500).serialize()
      return res(ctx.status(err.status), ctx.json(err))
    }
    return res(ctx.json(createMyPostsData(data.title)))
  })
}

export const handlers = [handleCreateMyPosts()]
```

- 응답 받은 `title`로 네트워크 응답 성공/실패

```tsx
describe('Toast', () => {
  test("API 통신을 시도하면 '저장 중입니다...'가 표시된다", async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsPublished()
    await clickButton('네')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('저장 중입니다...')
    })
  })

  test("공개에 성공하면 '공개됐습니다'가 표시된다", async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsPublished()
    await clickButton('네')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('공개됐습니다')
    })
  })

  test("공개에 실패하면 '공개에 실패했습니다'가 표시된다", async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } = await setup()
    await typeTitle('500')
    await selectImage()
    await saveAsPublished()
    await clickButton('네')
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('공개에 실패했습니다')
    })
  })
})
```

### 화면 이동 테스트

```tsx
describe('화면이동', () => {
  test('비공개 상태로 저장 시 비공개한 기사 페이지로 이동한다', async () => {
    const { typeTitle, selectImage, saveAsDraft } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsDraft()
    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        pathname: '/my/posts/201',
      })
    })
  })

  test('공개에 성공하면 화면을 이동한다', async () => {
    const { typeTitle, selectImage, saveAsPublished, clickButton } = await setup()
    await typeTitle('201')
    await selectImage()
    await saveAsPublished()
    await clickButton('네')
    await waitFor(() => {
      expect(mockRouter).toMatchObject({
        pathname: '/my/posts/201',
      })
    })
  })
})
```

## 이미지 업로드 통합 테스트

- `Avatar` 컴포넌트
  - 컴퓨터에 저장된 이미지를 선택하여 업로드를 시도한다.
  - 이미지 업로드에 성공하면 프로필 이미지로 적용한다.
  - 이미지 업로드에 실패하면 실패했음을 알린다.

> - 성공 → 프로필 이미지로 적용
> - 실패 → `이미지 업로드에 실패했습니다` 알림

### 이미지 업로드 처리 흐름

- 이미지가 선택되면 `useUploadImage` 훅이 제공하는 `onChangeImage` 실행
  - 브라우저 API인 `FileReader` 객체를 사용해서 컴퓨터에 저장된 이미지 파일의 내용을 비동기로 가져옴
  - 이미지 업로드 API 호출

```tsx
const onChangeImage = handleChangeFile((_, file) => {
  uploadImage({ file })
    .then(data => {
      const imgPath = `${data.url}/${data.filename}` as PathValue<T, Path<T>>
      setImageUrl(imgPath)
      setValue(name, imgPath)
      onResolved?.(data)
    })
    .catch(onRejected)
})
```

### 통합 테스트용 목 객체

- 테스트 환경에서 ‘이미지 선택하기’와 ‘이미지 업로드 API 호출하기’를 사용할 수 있어야 함
- 이미지를 선택하는 목 함수 → `selectImageFile` 함수
  - 더미 이미지 파일 작성하기
  - `user.upload`를 호출해 이미지 선택 인터랙션 재현하기

```tsx
export function selectImageFile(inputTestId = 'file', fileName = 'hello.png', content = 'hello') {
  const user = userEvent.setup()
  const filePath = [`C:\\fakepath\\${fileName}`]
  const file = new File([content], fileName, { type: 'image/png' })
  const fileInput = screen.getByTestId(inputTestId)
  const selectImage = () => user.upload(fileInput, file)
  return { fileInput, filePath, selectImage }
}
```

- 이미지 업로드 API를 호출하는 목 함수 → `mockUploadImage` 함수

```tsx
jest.mock('../fetcher')

export function mockUploadImage(status?: ErrorStatus) {
  if (status && status > 299) {
    return jest
      .spyOn(UploadImage, 'uploadImage')
      .mockRejectedValueOnce(new HttpError(status).serialize())
  }
  return jest.spyOn(UploadImage, 'uploadImage').mockResolvedValueOnce(uploadImageData)
}
```

### 업로드 성공 테스트

- 업로드가 성공하면 `img`의 `src` 속성이 변경되는지 확인

```tsx
test('이미지 업로드에 성공하면 이미지의 src 속성이 변경된다', async () => {
  mockUploadImage() // 이미지 업로드
  render(<TestComponent />)
  // 초기 상태 확인: src 속성이 비어 있어야 함
  expect(screen.getByRole('img').getAttribute('src')).toBeFalsy() // ""
  const { selectImage } = selectImageFile()
  await selectImage() // 이미지 선택
  // 비동기 작업이 완료될 때까지 기다렸다가 src 속성이 변경되는지 확인
  await waitFor(() => {
    expect(screen.getByRole('img').getAttribute('src')).toBeTruthy()
  })
})
```

### 업로드 실패 테스트

- 업로드가 실패하면 경고 메시지가 표시되는지 확인

```tsx
test('이미지 업로드에 실패하면 경고창이 표시된다', async () => {
  mockUploadImage(500) // 이미지 업로드 실패
  render(<TestComponent />)
  const { selectImage } = selectImageFile()
  await selectImage() // 이미지 선택
  await waitFor(() => {
    expect(screen.getByRole('alert')).toHaveTextContent('이미지 업로드에 실패했습니다')
  })
})
```
