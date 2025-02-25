### 현재 페이지인지 속성 부여하기

```jsx
function isCurrent(flag: boolean): AnchorHTMLAttributes<HTMLAnchorElement> {
  if (!flag) return {};

  return { "aria-current" : "page" };
}

// aria 속성 부여
<a {...isCurrent(pathname === "/my/posts/create")}>Create Post</a>

// 스타일링
.list a[aria-current="page"] {
  border-color: var(--orange);
}
```

→ `pathname === "/my/posts/create"` 조건식이 맞다면 `aria-current` 속성을 부여하고 해당 속성에 맞게 스타일링을 한다.

> 현재 페이지인지 체크하고 스타일링 할 때 클래스 네임으로 컨트롤 했었는데 `aria-current` 같은 속성 사용해서 웹 접근성 챙기는 것도 좋은 것 같다!

---

### next-router-mock

`<Link/>` 컴포넌트에서 발생한 라우터 변환, `useRouter` 를 활용한 URL 참조 혹은 변경에 대한 통합 테스트를 `jsdom` 에서 실행할 수 있다.

---

### test.each 활용

동일한 테스트에 매개변수만 변경해 반복하고 싶을 때 사용한다.

```jsx
test.each([
  { url: "/my/posts", name: "My Posts" },
  { url: "/my/posts/123", name: "My Posts" },
  { url: "/my/posts/create", name: "Create Post" },
])("$url의 현재 위치는 $name 이다.", ({ url, name }) => {
  mockRouter.setCurrentUrl(url);
  render(<Nav onCloseMenu={() => {}} />);
  const link = screen.getByRole("link", { name });
  expect(link).toHaveAttribute("aria-current", "page");
});
```

---

### 웹 접근성 대응 매처

**toHaveAccessibleName**

- 요소가 적절한 접근 가능한 이름을 가지고 있는지 테스트
- 이미지의 alt 텍스트, 버튼의 레이블, 폼 요소의 레이블 등

```jsx
expect(getByTestId("img-alt")).toHaveAccessibleName("Test alt");
expect(getByTestId("button")).toHaveAccessibleName("Submit");
```

**toHaveAccessibleDescription**

- 요소가 적절한 접근성 설명을 가지고 있는지 테스트
- `aria-describedby` 나 `title` 속성으로 제공되는 추가 설명 확인

**toHaveAccessibleErrorMessage**

- 폼 요소가 적절한 에러 메세지를 가지고 있는지 테스트
- `aria-errormessage`와 `aria-invalid` 속성을 통해 제공되는 에러 메시지 확인

이 밖에도 <a href="https://github.com/testing-library/jest-dom">여러 웹 접근성을 확인할 수 있는 매처들</a>이 있다.

---

### Fetch API의 폴리필

23년 3월 기준 - `jsdom` 에 Fetch API가 적용되지 않아 Fetch API를 사용한 코드가 테스트 대상에 포함되면 테스트는 실패한다.

→ 테스트 환경을 위해 만든 Fetch API의 폴리필인 `whatwg-fetch` 를 설치해 모든 테스트에 적용하면 해결할 수 있다.

---

> 7장에서는 갑자기 프레임워크, 라이브러리들이 많이 나와서 어지러웠던 것 같다..
> 실용적인건 좋지만 너무 7장에 몰아서 설명하려는 느낌..?

> 이제 책의 반 정도 읽은 것 같은데 막상 테스트 코드를 짜는 스킬이 그정도로 발전한 것 같지 않은 것 같다..
> 더 열심히 실습해봐야 할 것 같다~~..
