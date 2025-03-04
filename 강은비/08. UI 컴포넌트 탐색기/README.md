# UI 컴포넌트 탐색기

- UI 컴포넌트 탐색기는 구현된 UI 컴포넌트를 쉽게 공유할 수 있도록 도와주는 협업 도구이다.
- 최근에는 협업 도구가 아닌 테스트에 활용하는 사례가 많아졌다. 대표적으로 스토리북이 있다.

  - 단위 테스트 (`jest` 등): 실행 속도 빠름, 실제 환경과의 유사성 낮음
  - E2E 테스트 (`playwright` 등): 실행 속도 느림, 실제 환경과의 유사성 높음
  - 스토리북을 이용한 UI 컴포넌트 테스트는 위 두가지 테스트의 중간에 위치한다.
  - https://storybook.js.org/tutorials/intro-to-storybook/react/ko/test/

## 스토리북 기초

### 스토리북 설치

```shell
# 스토리북 설치
npx storybook init

# 스토리북 실행
npm run storybook
```

### 스토리 등록

```js
// Button.stories.jsx
import { Button } from "./Button";

export default {
  component: Button,
  args: { children: "제출" },
};

export const Default = {};

export const Large = {
  args: { variant: "large" },
};

export const Small = {
  args: { variant: "small" },
};

export const Disabled = {
  args: { disabled: true },
};

export const Error = {
  args: { theme: "error" },
};
```

### 3단계 깊은 병합

- 모든 스토리에는 Global, Component, Story라는 세 단계의 설정이 깊은 병합 방식으로 적용된다.
  - Global: 모든 스토리에 적용할 설정 (`.storybook/preview.js`)
  - Component: 스토리 파일에 적용할 설정 (`export default`)
  - Story: 개별 스토리에 적용할 설정 (`export const`)
- 공통으로 적용할 항목을 적절한 스코프에 설정하여 스토리마다 개별적으로 설정해야 하는 작업을 최소화할 수 있다.

## 스토리북 필수 애드온

- 애드온으로 필용한 기능을 추가할 수 있다.

### Controls를 활용한 디버깅

- Controls 기능을 사용해 UI 컴포넌트의 `props`를 변경하여 컴포넌트가 어떻게 표시되는지 실시간으로 디버깅할 수 있다.
- `@storybook/addon-controls`이라는 애드온에서 제공하는 기능하여, 스토리북을 설치할 때 적용되는 `@storybook/addon-essentials`에 포함되어 있다.

### Actions를 활용한 이벤트 핸들러 검증

- Actions: 이벤트 핸들러가 어떻게 호출됐는지 로그를 출력하는 기능이다.
- 이벤트 핸들러의 이름으로 사용하는 다른 네이밍 컨벤션이 있다면 해당 컨벤션에 따라 스토리북 글로벌 설정의 정규표현식을 수정해야 한다.

```js
// .storybook/preview.js
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
```

### 반응형 대응을 위한 뷰포트 설정

- 반응형으로 구현한 UI 컴포넌트는 화면 크기별로 스토리를 등록할 수 있다.
- `@storybook/addon-viewport` 패키지에서 지원한다.

```tsx
// src/tests/storybook.tsx
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport";

export const SPStory = {
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: "iphone6",
    },
    screenshot: {
      viewport: {
        width: 375,
        height: 667,
        deviceScaleFactor: 1,
      },
      fullPage: false,
    },
  },
};

export const PCStory = {
  parameters: {
    screenshot: {
      viewport: {
        width: 1280,
        height: 800,
      },
      fullPage: false,
    },
  },
};
```

```tsx
// Header.stories.tsx
import { SPStory } from "@/tests/storybook";

export const SPLoggedIn: Story = {
  parameters: {
    ...SPStory.parameters,
  },
};
```

## Context API에 의존하는 스토리 등록

- 리액트의 Context API에 의존하는 스토리에는 스토리북의 **decorator**를 활용하는 것이 편리하다.
- 초기값을 주입할 수 있도록 `Provider`를 만들면 `Context`의 상태에 의존하는 UI를 간단하게 재현할 수 있다.

### 스토리북의 데코레이터

- 데코레이터: 각 스토리의 렌더링 함수에 적용할 레퍼(wrapper)이다.
- 각 단계의 설정(Global, Component, Story)에 추가할 수 있다.

```ts
import { ChildComponent } from "./";

export default {
  title: "ChildComponent",
  component: ChildComponent,
  decorators: [
    (Story) => (
      <div style={{ padding: "60px" }}>
        <Story />
      </div>
    ),
  ],
};
```

### Provider를 소유한 데코레이터

```tsx
import { LoginUserInfoProvider } from "@/components/providers/LoginUserInfo";
import { Args, PartialStoryFn } from "@storybook/csf";
import { ReactFramework } from "@storybook/react";

export const LoginUserInfoProviderDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => (
  <LoginUserInfoProvider>
    <Story />
  </LoginUserInfoProvider>
);
```

## 웹 API에 의존하는 스토리

```js
// .storybook/preview.js
import { handleGetMyProfile } from "@/services/client/MyProfile/__mock__/msw";
import { initialize, mswDecorator } from "msw-storybook-addon";

export const parameters = {
  // 모든 스토리에 적용되는 요청 핸들러 (3단계 설저 가능)
  msw: { handlers: [handleGetMyProfile()] },
};

export const decorators = [mswDecorator]; // 모든 스토리에 필요

initialize(); // MSW 활성화
```

## Play function을 활용한 인터랙션 테스트

사용자와 UI 컴포넌트의 상호작용 테스트를 작성할 수 있다.

#### 예시: 게시글 생성 폼 상호작용 테스트

```tsx
import { BasicLayoutDecorator, PCStory } from "@/tests/storybook";
import { expect } from "@storybook/jest";
import { ComponentMeta, ComponentStoryObj } from "@storybook/react";
import { userEvent as user, waitFor, within } from "@storybook/testing-library";
import { PostForm } from "./PostForm";

export default {
  component: PostForm,
  decorators: [BasicLayoutDecorator],
  parameters: {
    ...PCStory.parameters,
  },
  args: {
    title: "신규 기사",
    description: "공개 여부가 변경될 때까지 기사는 공개되지 않는다",
    onClickSave: () => {},
  },
} as ComponentMeta<typeof PostForm>;

type Story = ComponentStoryObj<typeof PostForm>;

export const Default: Story = {};

export const SucceedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
  },
};

export const FailedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.click(
      canvas.getByRole("button", { name: "비공개 상태로 저장" })
    );
    const textbox = canvas.getByRole("textbox", { name: "제목" });
    await waitFor(() =>
      expect(textbox).toHaveErrorMessage("한 글자 이상의 문자를 입력해주세요")
    );
  },
};

export const SavePublish: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
    await user.click(canvas.getByRole("switch", { name: "공개 여부" }));
    await expect(
      canvas.getByRole("button", { name: "공개하기" })
    ).toBeInTheDocument();
  },
};
```

## addon-a11y를 활용한 접근성 테스트

- 컴포넌트 단위로 접근성을 검증하는 용도로 활용할 수 있다.
- Accessibility 패널을 보면 검증한 내용이 Violotions (빨간색), Passes (초록색), Incomplete (노란색)으로 구분돼 있다.
  - Violotions: 접근성 위반
  - Incomplete: 수정 필요
- 규칙이 지나치게 엄격하다고 느끼거나 원하지 않는 보고 내용이 있으면 일부 내용을 무효화할 수 있다. 무효화 기능도 3단계 설정이 가능하다.

#### 예시: 컴포넌트 단위에서 접근성 규칙 무효화하기

`Switch.tsx` / `Switch.stories.tsx`

- "Form elements must have lables"라는 규칙 위반 경고가 나옴.
- 실제 애플리케이션에서 사용할 때는 `label` 요소와 함께 사용해 접근성을 지키더라도, 작은 컴포넌트의 스토리에서는 규칙을 무효화하고 싶을 수도 있다. 이를 위해 스토리에서 규칙을 무효화시킬 수 았다.
- 접근성 검증 자체를 생략하고 싶다면 `parameters.a11y.disable`을 `true`로 설정하면 된다. 접근성 자체를 검증 대상에서 제외시키므로 신중하게 사용해야 한다.

```tsx
export const Switch = forwardRef<HTMLInputElement, Props>(function Switch(
  { className, ...props },
  ref
) {
  return (
    <span className={clsx(className, styles.module)}>
      <input {...props} ref={ref} type="checkbox" role="switch" />
      <span />
    </span>
  );
});
```

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: {
      config: { rules: [{ id: "label", enabled: false }] },
    },
  },
} as ComponentMeta<typeof Switch>;

type Story = ComponentStoryObj<typeof Switch>;

export const Default: Story = {};
```

## 스토리북 테스트 러너

- 스토리북의 테스트 러너는 스토리를 실행가능한 테스트로 변환한다.
- 테스트로 변환된 스토리는 jest와 playwright에서 실행된다.
- 앞서 살펴본 play 함수가 정상적으로 종료되는지와 접근성 위반 사항이 있는지 테스트할 수 있다.

## 스토리를 통합 테스트에 재사용하기

테스트를 스토리에 `import` 하려면 `@storybook/testing-react`를 사용해야 함.

```tsx
import { composeStories } from "@storybook/testing-react";
import { render, screen } from "@testing-library/react";
import * as stories from "./index.stories";

const { Default, CustomButtonLabel, ExcludeCancel } = composeStories(stories);

describe("AlertDialog", () => {
  test("Default", () => {
    render(<Default />);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
  });

  test("CustomButtonLabel", () => {
    render(<CustomButtonLabel />);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
  });

  test("ExcludeCancel", () => {
    render(<ExcludeCancel />);
    expect(screen.getByRole("button", { name: "OK" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "CANCEL" })
    ).not.toBeInTheDocument();
  });
});
```

### 스토리북 테스트 러너와의 차이점

- 스토리 재사용: 목 모듈 혹은 스파이가 필요한 테스트를 작성할 수 있다. 헤드리스 브라우저를 사용하지 않기 때문에 실행 속도가 빠르다.
- 테스트 러너: 테스트 파일을 따로 만들지 않아도 된다. 브라우저를 사용해 CSS가 적용된 상황을 재현할 수 있는 등 실제 환경과 유사성이 높다.
