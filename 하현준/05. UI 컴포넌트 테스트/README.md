## 테스팅 라이브러리

테스팅 라이브러리는 UI컴포넌트를 테스트하는 라이브러리

- UI 컴포넌트를 렌더링
- 렌더링 된 요소에서 임의의 자식 요소를 취득
- 렌더링 된 요소에 인터렉션을 발생

→ [`@testing-library/react`](https://www.npmjs.com/package/@testing-library/react) 패키지 사용

## UI 컴포넌트 테스트 시작하기

테스트할 리액트 컴포넌트

```tsx
type Props = {
  name: string;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
};
export const Form = ({ name, onSubmit }: Props) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.(event);
      }}
    >
      <h2>계정 정보</h2>
      <p>{name}</p>
      <div>
        <button>수정</button>
      </div>
    </form>
  );
};
```

```tsx
// 렌더링 테스트
test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByText("taro")).toBeInTheDocument();
});
test("버튼을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
// 암묵적 역할을 하는 요소 테스트
test("heading을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("heading")).toHaveTextContent("계정 정보");
});
// 이벤트 헨들러 테스트
test("버튼을 클릭하면 이벤트 핸들러가 실행된다", () => {
  const mockFn = jest.fn();
  render(<Form name="taro" onSubmit={mockFn} />);
  fireEvent.click(screen.getByRole("button"));
  expect(mockFn).toHaveBeenCalled();
});
```

## 리스트 형태의 UI 컴포넌트 테스트

```tsx
type Props = {
  items: ItemProps[];
};

export const ArticleList = ({ items }: Props) => {
  return (
    <div>
      <h2>기사 목록</h2>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <ArticleListItem {...item} key={item.id} />
          ))}
        </ul>
      ) : (
        <p>게재된 기사가 없습니다</p>
      )}
    </div>
  );
};

export const ArticleListItem = ({ id, title, body }: ItemProps) => {
  return (
    <li>
      <h3>{title}</h3>
      <p>{body}</p>
      <a href={`/articles/${id}`}>더 알아보기</a>
    </li>
  );
};
```

🤔 위 컴포넌트를 보고 무엇을 테스트해야 할지 생각해보는 게 중요한 듯 하다.

- 리스트가 개수만큼 재대로 렌더링 된다.
- 콜드 케이스가 제대로 렌더링 된다.
- 클릭했을 때 링크 이동이 잘 된다. ⇒ 책에는 id로 만든 URL을 표시한다로 테스트를 같이 함

```tsx
export const items: ItemProps[] = [
  {
    id: "howto-testing-with-typescript",
    title: "타입스크립트를 사용한 테스트 작성법",
    body: "테스트 작성 시 타입스크립트를 사용하면 테스트의 유지 보수가 쉬워진다",
  },
  {
    id: "nextjs-link-component",
    title: "Next.js의 링크 컴포넌트",
    body: "Next.js는 화면을 이동할 때 링크 컴포넌트를 사용한다",
  },
  {
    id: "react-component-testing-with-jest",
    title: "제스트로 시작하는 리액트 컴포넌트 테스트",
    body: "제스트는 단위 테스트처럼 UI 컴포넌트를 테스트할 수 있다",
  },
];

test("items의 수만큼 목록을 표시한다", () => {
  render(<ArticleList items={items} />);
  const list = screen.getByRole("list");
  expect(list).toBeInTheDocument();
  expect(within(list).getAllByRole("listitem")).toHaveLength(3);
});

test("목록에 표시할 데이터가 없으면 '게재된 기사가 없습니다'를 표시한다", () => {
  // 빈 배열을 items에 할당하여 목록에 표시할 데이터가 없는 상황을 재현한다.
  render(<ArticleList items={[]} />);
  // 존재하지 않을 것으로 예상하는 요소의 취득을 시도한다.
  const list = screen.queryByRole("list");
  // list가 존재하지 않는다.
  expect(list).not.toBeInTheDocument();
  // list가 null이다.
  expect(list).toBeNull();
  // '게재된 기사가 없습니다'가 표시됐는지 확인한다.
  expect(screen.getByText("게재된 기사가 없습니다")).toBeInTheDocument();
});

// 예제 코드 일부 변형
test("링크에 id로 만든 URL을 표시한다", () => {
  render(<ArticleListItem {...items[0]} />);
  expect(screen.getByRole("link", { name: "더 알아보기" })).toHaveAttribute(
    "href",
    `/articles/${items[0].id}`
  );
});
```

## 사용자 인터렉트가 들어간 UI 컴포넌트 테스트

```tsx
export const Form = () => {
  const [checked, setChecked] = useState(false);
  const headingId = useId();
  return (
    <form aria-labelledby={headingId}>
      <h2 id={headingId}>신규 계정 등록</h2>
      <InputAccount />
      <Agreement
        onChange={(event) => {
          setChecked(event.currentTarget.checked);
        }}
      />
      <div>
        <button disabled={!checked}>회원가입</button>
      </div>
    </form>
  );
};
```

🤔  테스트 할 요소 살펴보기

- 컴포넌트가 정상적으로 렌더링되는지 확인
- 동의 여부에 따라 체크 상태가 달라지는지 확인

```tsx
// 체크 상태가 달라지는지 확인
test("이용 약관에 동의하는 체크 박스를 클릭하면 회원가입 버튼은 활성화된다", async () => {
  render(<Form />);
  await user.click(screen.getByRole("checkbox"));
  expect(screen.getByRole("button", { name: "회원가입" })).toBeEnabled();
});
```

메일 주소와 비밀번호 입력하는 컴포넌트

→ 책은 너무 간단해서 메일 주소 형태/비밀번호 조건을 확인하는 것을 추가해보자.

```tsx
import { useState } from "react";

export const InputAccount2 = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const validateEmail = (value: string) => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    setEmailError(isValid ? "" : "올바른 이메일 형식이 아닙니다.");
  };

  const validatePassword = (value: string) => {
    setPasswordError(
      value.length >= 8 ? "" : "비밀번호는 8자 이상이어야 합니다."
    );
  };

  return (
    <fieldset>
      <legend>계정정보 입력</legend>

      <div>
        <label>
          메일주소
          <input
            type="email"
            value={email}
            placeholder="example@test.com"
            onChange={(e) => {
              setEmail(e.target.value);
              validateEmail(e.target.value);
            }}
          />
        </label>
        {emailError && <p style={{ color: "red" }}>{emailError}</p>}
      </div>

      <div>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            placeholder="8자 이상"
            onChange={(e) => {
              setPassword(e.target.value);
              validatePassword(e.target.value);
            }}
          />
        </label>
        {passwordError && <p style={{ color: "red" }}>{passwordError}</p>}
      </div>
    </fieldset>
  );
};
```

```tsx
describe("InputAccount", () => {
  beforeEach(() => {
    // 이전 입력에 영향받지 않도록 전역에 선언하지 않고 매번 세팅
    user = userEvent.setup();
    render(<InputAccount2 />);
  });

  it("이메일 및 비밀번호 입력 필드가 렌더링되어야 한다", () => {
    expect(screen.getByPlaceholderText("example@test.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("8자 이상")).toBeInTheDocument();
  });

  it("올바른 이메일 입력 시 에러 메시지가 표시되지 않아야 한다", async () => {
    const emailInput = screen.getByPlaceholderText("example@test.com");

    await user.type(emailInput, "test@example.com");

    expect(
      screen.queryByText("올바른 이메일 형식이 아닙니다.")
    ).not.toBeInTheDocument();
  });

  it("잘못된 이메일 입력 시 에러 메시지가 나타나야 한다", async () => {
    const emailInput = screen.getByPlaceholderText("example@test.com");

    await user.type(emailInput, "invalid-email");

    expect(
      screen.getByText("올바른 이메일 형식이 아닙니다.")
    ).toBeInTheDocument();
  });

  it("8자 이상 비밀번호 입력 시 에러 메시지가 표시되지 않아야 한다", async () => {
    const passwordInput = screen.getByPlaceholderText("8자 이상");

    await user.type(passwordInput, "password123");

    expect(
      screen.queryByText("비밀번호는 8자 이상이어야 합니다.")
    ).not.toBeInTheDocument();
  });

  it("8자 미만 비밀번호 입력 시 에러 메시지가 나타나야 한다", async () => {
    const passwordInput = screen.getByPlaceholderText("8자 이상");

    await user.type(passwordInput, "short");

    expect(
      screen.queryByText("비밀번호는 8자 이상이어야 합니다.")
    ).toBeInTheDocument();
  });
});
```

## 반복되는 인터렉션을 함수화 하여 테스트하기

테스트할 컴포넌트

```tsx
export type AddressOption = ComponentProps<"option"> & { id: string };
export type Props = {
  deliveryAddresses?: AddressOption[];
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
};
export const Form = (props: Props) => {
  const [registerNew, setRegisterNew] = useState<boolean | undefined>(
    undefined
  );
  return (
    <form onSubmit={props.onSubmit}>
      <h2>배송지 정보 입력</h2>
      <ContactNumber />
      {props.deliveryAddresses?.length ? (
        <>
          <RegisterDeliveryAddress onChange={setRegisterNew} />
          {registerNew ? (
            <DeliveryAddress title="새로운 배송지" />
          ) : (
            <PastDeliveryAddress
              disabled={registerNew === undefined}
              options={props.deliveryAddresses}
            />
          )}
        </>
      ) : (
        <DeliveryAddress />
      )}
      <hr />
      <div>
        <button>주문내용 확인</button>
      </div>
    </form>
  );
};
```

```tsx
// 유저의 입력을 함수화
async function inputContactNumber(
  inputValues = {
    name: "배언수",
    phoneNumber: "000-0000-0000",
  }
) {
  await user.type(
    screen.getByRole("textbox", { name: "전화번호" }),
    inputValues.phoneNumber
  );
  await user.type(
    screen.getByRole("textbox", { name: "이름" }),
    inputValues.name
  );
  return inputValues;
}
async function inputDeliveryAddress(
  inputValues = {
    postalCode: "16397",
    prefectures: "경기도",
    municipalities: "수원시 권선구",
    streetNumber: "매곡로 67",
  }
) {
  await user.type(
    screen.getByRole("textbox", { name: "우편번호" }),
    inputValues.postalCode
  );
  await user.type(
    screen.getByRole("textbox", { name: "시/도" }),
    inputValues.prefectures
  );
  await user.type(
    screen.getByRole("textbox", { name: "시/군/구" }),
    inputValues.municipalities
  );
  await user.type(
    screen.getByRole("textbox", { name: "도로명" }),
    inputValues.streetNumber
  );
  return inputValues;
}

// Submit 클릭하기
async function clickSubmit() {
  await user.click(screen.getByRole("button", { name: "주문내용 확인" }));
}

// 목함수를 활용해 실제 데이터를 전송하는 것 처럼 동작 시키기
function mockHandleSubmit() {
  const mockFn = jest.fn();
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: { [k: string]: unknown } = {};
    formData.forEach((value, key) => (data[key] = value));
    mockFn(data);
  };
  return [mockFn, onSubmit] as const;
}
```

→ 테스트 코드는 `src/05/06/Form.test.tsx` 확인

## 비동기 처리가 포함된 UI 컴포넌트 테스트

```tsx
export const RegisterAddress = () => {
  const [postResult, setPostResult] = useState("");
  return (
    <div>
      <Form
        onSubmit={handleSubmit((values) => {
          try {
            checkPhoneNumber(values.phoneNumber);

            // 비동기 함수 호출
            postMyAddress(values)
              .then(() => {
                setPostResult("등록됐습니다");
              })
              .catch(() => {
                setPostResult("등록에 실패했습니다");
              });
          } catch (err) {
            if (err instanceof ValidationError) {
              setPostResult("올바르지 않은 값이 포함되어 있습니다");
              return;
            }
            setPostResult("알 수 없는 에러가 발생했습니다");
          }
        })}
      />
      {postResult && <p>{postResult}</p>}
    </div>
  );
};
```

🤔  테스트 할 요소 살펴보기

- handleSubmit 함수 호출시 유효성 검사 제대로 하는지 테스트
- 유효성 검사 통과 후 비동기 함수 호출 테스트
- API 에러 발생 시 에러에 따른 로직 테스트

```tsx
// 실제 API 호출하는 대신 mocking하는 함수 만들기
export function mockPostMyAddress(status = 200) {
  if (status > 299) {
    return jest
      .spyOn(Fetchers, "postMyAddress")
      .mockRejectedValueOnce(httpError);
  }
  return jest
    .spyOn(Fetchers, "postMyAddress")
    .mockResolvedValueOnce(postMyAddressMock);
}
```

`fillValuesAndSubmit`, `fillInvalidValuesAndSubmit`은 유저 입력 후 Submit하는 유틸 함수

```tsx
// 성공하는 케이스 확인
test("성공하면 '등록됐습니다'가 표시된다", async () => {
  const mockFn = mockPostMyAddress();
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록됐습니다")).toBeInTheDocument();
});

// 실패하는 케이스 확인
test("실패하면 '등록에 실패했습니다'가 표시된다", async () => {
  // API 실패 호출
  const mockFn = mockPostMyAddress(500);
  render(<RegisterAddress />);
  const submitValues = await fillValuesAndSubmit();
  expect(mockFn).toHaveBeenCalledWith(expect.objectContaining(submitValues));
  expect(screen.getByText("등록에 실패했습니다")).toBeInTheDocument();
});

// 유효성 검사 에러 테스트
test("유효성 검사 에러가 발생하면 '올바르지 않은 값이 포함되어 있습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillInvalidValuesAndSubmit();
  expect(
    screen.getByText("올바르지 않은 값이 포함되어 있습니다")
  ).toBeInTheDocument();
});

// API 에러 테스트
test("원인이 명확하지 않은 에러가 발생하면 '알 수 없는 에러가 발생했습니다'가 표시된다", async () => {
  render(<RegisterAddress />);
  await fillValuesAndSubmit();
  expect(
    screen.getByText("알 수 없는 에러가 발생했습니다")
  ).toBeInTheDocument();
});
```

## 스냅샷 테스트

UI 컴포넌트가 예기치 않게 변경됐는지 검증을 할 수 있다.

`toMatchSnapShot`을 실행하면 `__snapshots__` 폴더에 HTML 문자열로 저장이 된다.

→ 테스트 당시의 html을 저장할 수 있으므로, **회귀 테스트**를 가능하게 해준다.

🤔 실무에서는 이 테스트는 사실 어렵지 않을까하는 생각,,, 정말 UI만 그리는 순수 컴포넌트에는 적용이 될 것 같은데 그건 테스트가 필요할까? 싶다.

## 암묵적 역할과 접근 가능한 이름

> **WAI-ARIA(Web Accessibility Initiative-Accessible Rich Internet Application)란?**

W3C의 WAI(Web Accessibility Initiative) 조직이 제정한 AIRA(Accessible Rich Internet Applications) **_웹 접근성에 대한 표준 기술 규격으로, HTML의 접근성 문제를 보완하는 W3C 명세이다._**

스크린 리더가 브라우저를 읽을 때 각 요소가 어떤 역할을 하는지 알 수 있도록 만들어진 기술

>

- **암묵적 역할이란 명시적으로 role을 지정하지 않아도 처음부터 역할을 가지는 HTML 요소**
  - `button` 은 버튼이라는 역할을 가짐
- **역할과 요소는 1:1 매칭되지 않음**
  - 즉 `input` 태그 요소가 하나의 역할만을 가지진 않는다는 의미
- **역할과 접근 가능한 이름을 `logRoles`를 통해 CLI에서 확인할 수 있다.**
  ```
  test("logRoles: 렌더링 결과로부터 역할과 접근 가능한 이름을 확인한다", () => {
    const { container } = render(<Form name="taro" />);
    logRoles(container);
  });
  ```
  ![image.png](attachment:e2da491f-8cd7-4e44-ac4c-c589573a1549:image.png)
- 암묵적 역할이 부여되는 목록들 확인 (https://www.npmjs.com/package/aria-query)
