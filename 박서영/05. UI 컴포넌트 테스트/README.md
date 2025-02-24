# 5. UI 컴포넌트 테스트

## Q1. `getByRole("button")`만 사용해도 버튼 존재 여부를 체크할 수 있는데, `getByRole("button").toBeInTheDocument()`를 사용해야되는 이유가 무엇일까?

```jsx
test("버튼을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByRole("button")).toBeInTheDocument();
});
```

- `screen.getByRole`
    - 특정 DOM 요소의 접근성 역할을 기준으로 요소를 찾는 쿼리
- `toBeInTheDocument`
    - 해당 요소가 DOM에 존재하는지 여부

“이 테스트가 무엇을 검증하려는지” 테스트의 의도와 목적을 명확하게 표현

## Q2.`getByText`와 `getByDisplayValue` 의 차이는 무엇인가?

```jsx
test("이름을 표시한다", () => {
  render(<Form name="taro" />);
  expect(screen.getByText("taro")).toBeInTheDocument();
});
```

- `screen.getByText`
    - 일치하는 문자열을 가진 단 한 개의 텍스트 요소를 찾는 쿼리
    - 여러개의 요소를 찾으면 에러 발생
- `screen.getByDisplayValue`
    - 입력 필드(`input`, `textarea`, `select`)에 표시된 값을 기준으로 요소를 찾는 쿼리
        - input
        
        ```jsx
        //placeholder가 아니라 value를 기준으로 찾음
        test("banana를 표시한다", () => {
          render(<input type="text" readOnly value="banana" />);
        
          screen.getByDisplayValue('banana'); 
        });
        ```
        
        - select
        
        ```jsx
        
        // 선택된 option 요소의 텍스트를 기준으로 찾음
        test("banana가 select의 기본값이다", () => {
          render(
            <select defaultValue="banana">
              <option value="apple">사과</option>
              <option value="banana">바나나</option>
            </select>
          );
          
          screen.getByDisplayValue('바나나'); 
        });
        ```
        

`getByText`는 `select` 요소에서 **`<option>`의 텍스트**를 찾지만, `getByDisplayValue`는 **선택된 값**을 기준으로 찾음.  `getByDisplayValue`는 **현재 선택된 값이 무엇인지 확인하고 싶을 때** 더 적합함.

```jsx
render(
  <select defaultValue="banana">
    <option value="apple">사과</option>
    <option value="banana">바나나</option>
  </select>
);

// `getByText`는 '사과'라는 텍스트를 가진 <option>을 찾음
screen.getByText('사과'); // ✅ 텍스트로 찾을 수 있음

// `getByDisplayValue`는 선택된 값을 기준으로 현재 선택된 '바나나'를 찾음.
screen.getByDisplayValue('바나나'); // ✅ 선택된 값으로 찾을 수 있음

```

## Q3. <input type=”password”/>가 역할을 가지지 않는 이유는 무엇인가?

A. **`role="password"`**를 부여하면, **스크린 리더와 브라우저의 일관성 없는 동작**으로 인해 예상치 못한 보안 문제가 발생할 수 있음. `input type="password"`는 이미 비밀번호 입력을 안전하게 처리하는 방식으로 설계되어 있어, 해당 역할을 추가할 필요가 없고 보안상의 위험을 피하기 위해 **기존 방식**을 유지하는 것이 바람직함.

> `role="password"`**를 사용하면 비밀번호와 관련된 **보안적 고려사항**(예: 화면에서 비밀번호 마스킹, 보조기술에서 비밀번호를 다룰 때 혼동 방지 등)을 제대로 처리하지 못할 수 있다는 점을 지적하고 있습니다
github.com/w3c/aria/issues/935
> 

## Q4. 함수 인자 객체를 검증할 때 expect가 중복으로 사용된 이유는 무엇인가?

```tsx
  test("폼을 제출하면 입력 내용을 전달받는다", async () => {
    const [mockFn, onSubmit] = mockHandleSubmit();
    render(<Form onSubmit={onSubmit} />);
    const contactNumber = await inputContactNumber();
    const deliveryAddress = await inputDeliveryAddress();
    await clickSubmit();
    // expect(mockFn).toHaveBeenCalledWith({ ...contactNumber, ...deliveryAddress }));
    expect(mockFn).toHaveBeenCalledWith(
      expect.objectContaining({ ...contactNumber, ...deliveryAddress })
    );
   }
```

- `expect(mockFn).toHaveBeenCalledWith(...)`: **함수가 호출될 때 특정 인자값이 전달되었는지** 확인하는 검사
- `expect.objectContaining(...)`: 전달된 인자 중에서 **특정 속성만 일치하는지** 확인하는 검사임

```jsx
//정확히 일치하는 객체를 전달받았는지 확인
expect(mockFn).toHaveBeenCalledWith({ ...contactNumber, ...deliveryAddress }));

//주어진 객체가 포함된 객체를 전달받았는지 확인
expect(mockFn).toHaveBeenCalledWith(
  expect.objectContaining({ ...contactNumber, ...deliveryAddress })
);

```