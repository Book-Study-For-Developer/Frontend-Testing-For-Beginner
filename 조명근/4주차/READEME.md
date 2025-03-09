# 스토리북

## 필수 addons인 `@storybook/addon-essentials` 는 어떤 역할을 할까?

- https://storybook.js.org/docs/essentials
- **Actions (**@storybook/addon-actions**)**
  - 컴포넌트에서 발생하는 이벤트(예: 버튼 클릭)를 Storybook UI에서 확인할 수 있도록 합니다.
- **Backgrounds (**@storybook/addon-backgrounds**)**
  - 다양한 배경색을 설정하여 컴포넌트를 테스트할 수 있도록 합니다.
- **Controls (**@storybook/addon-controls**)**
  - Storybook UI에서 Props(컴포넌트의 속성)을 동적으로 변경하여 테스트할 수 있도록 합니다.
- **Docs (**@storybook/addon-docs**)**
  - 컴포넌트의 문서를 자동으로 생성해주는 기능을 제공합니다.
- **Highligh**(@storybook/addon-highlight)
  - 접근성 등의 확인하기 위해 설정된 컴포넌트를 하이라이팅한다.
- **Viewport (**@storybook/addon-viewport**)**
  - 다양한 화면 크기에서 컴포넌트를 테스트할 수 있도록 합니다.
- **Toolbars & Globals (**@storybook/addon-toolbars**)**
  - UI에서 전역 설정(예: 다크 모드, 언어 설정 등)을 쉽게 변경할 수 있도록 도와줍니다.
- **Measure (**@storybook/addon-measure**)**
  - UI 요소의 크기를 측정할 수 있는 도구를 제공합니다.
- **Outline (**@storybook/addon-outline**)**
  - HTML 요소의 레이아웃을 시각적으로 확인할 수 있도록 테두리를 표시해 줍니다.

## 스토리 작성하기

### 테스트할 컴포넌트를 정의

```tsx
export default {
  component: Header,
  // Header컴포넌트를 테스트하려면 Provider가 필요함.
  // decorator는 모든 story를 감싸는 wrapper임
  decorators: [LoginUserInfoProviderDecorator],
} as ComponentMeta<typeof Header>;
```

### msw 사용

- [공식문서](https://storybook.js.org/docs/writing-stories/mocking-data-and-modules/mocking-network-requests#set-up-the-msw-addon)
- `msw-storybook-addon` 설치해서 사용

  - preview 설정 후 parameter에서 사용

    ```tsx
    // 비로그인 상태를 테스트
    export const NotLoggedIn: Story = {
      parameters: {
        msw: { handlers: [handleGetMyProfile({ status: 401 })] },
      },
    };

    // 로그인한 유저를 테스트
    export const LoggedIn: Story = {
      parameters: {
        msw: { handlers: [handleGetMyProfile()] },
      },
    };
    ```

### Next.js Router

- `storybook-addon-next-router` 로 테스트 가능

### Play Action

- 유저의 이벤트를 스토리북에서 테스트 가능
  - `@storybook/testing-library, @storybook/jest, @storybook/addon-interactions`
    - vitest가 등장하면서 `testing-library, jest` 는 `@storybook/test` 로 통합됨
    - `@storybook/test` `@storybook/addon-interactions` 두개 설치로 유저 액션 테스트 가능
      - [공식문서](https://storybook.js.org/docs/writing-tests/component-testing)
  ```tsx
  export const SPLoggedInClosedMenu: Story = {
    storyName: "SP 레이아웃에서 드로어 메뉴를 닫는다",
    parameters: {
      ...SPStory.parameters,
      screenshot: {
        ...SPStory.parameters.screenshot,
        delay: 200,
      },
    },
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const buttonOpen = await canvas.findByRole("button", {
        name: "메뉴 열기",
      });
      await user.click(buttonOpen);
      const buttonClose = await canvas.findByRole("button", {
        name: "메뉴 닫기",
      });
      await expect(buttonClose).toBeInTheDocument();
      await user.click(buttonClose);
    },
  };
  ```

### a11y test

- `@storybook/addon-a11y`
- 접근성 위반사항 테스트 가능
  - 설치해서 보는 것 만으로 웹 콘텐츠 접근성 지침(Web Content Accessibility Guidelines, WCAG)의 57% 체크가 가능하다고 함
    ![image.png](https://file.notion.so/f/f/33b5e265-5ea7-4b27-ac53-3a8616b64ce4/5bc78f4d-3298-44d4-bd51-138f27193f4d/image.png?table=block&id=1ab9dabe-b9c7-8073-9e42-d0634224bf61&spaceId=33b5e265-5ea7-4b27-ac53-3a8616b64ce4&expirationTimestamp=1741039200000&signature=owIOJcFVoarLa83_XYZ1ZnASdKmq8ojWpYE2TYBfCGQ&downloadName=image.png)

### test runner

- Storybook에 등록된 Story가 정상 동작하는지 체크
- story를 실행가능한 “테스트”로 변경하고 실제 위반사항 없는지 체크
- 위에서 등록한 접근성 테스트, play 테스트 자동화 가능

## 생각정리

- 우리가 쓰고있던 control, Action 등 기본 기능이라고 생각했던게 사실 addon이었다.
- 어떻게 테스트를 나눌까?
  - Control을 사용하는게 아닌, 행동별로 나눠서 테스트를 만드는게 인상적임
    ![image.png](https://file.notion.so/f/f/33b5e265-5ea7-4b27-ac53-3a8616b64ce4/6926fc8b-07d9-4b47-acfc-7d706e70b32f/image.png?table=block&id=1ab9dabe-b9c7-8034-8f33-f20e21d78c10&spaceId=33b5e265-5ea7-4b27-ac53-3a8616b64ce4&expirationTimestamp=1741039200000&signature=H64wuMOrppn5ouPpD0gu98ZbZwdNwg35ru8aeF50BkI&downloadName=image.png)
  - msw도 같이 사용해서 스토리북 테스트를 한다면 좀 더 동적인 UI 테스트가 가능해질듯.
- 스토리북을 단순한 UI 테스트로만 썼었는데 접근성 테스트, 유저 액션 테스트 등 할 수 있는게 굉장히 많은듯.
  - 유저 액션 테스트를 스토리북에서 해야하는가?
    - 지금까지 앞에서 공부했던 UI 행동 테스트와 교집합처럼 겹치는 부분이 생기는듯.
    - 같이 사용한다면 테스트가 필요한 컴포넌트들을 스토리북에서 테스트 하는 등 컨벤션을 정하는게 필요해 보임.
    - 스토리북에서 테스트하는게 테스트러너도 사용할 수 있고 관리 측면에서 더 나은 선택이 아닐지?
  - 접근성 테스트는 한번 살펴보기 좋을듯.
- 스토리북 테스트를 적극적으로 활용해서 개발했을때 얼마나 추가 리소스가 소모될지 모르겠음. 잘 사용할 수만 있다면 안정성과 정확성, 접근성은 보장될듯.
