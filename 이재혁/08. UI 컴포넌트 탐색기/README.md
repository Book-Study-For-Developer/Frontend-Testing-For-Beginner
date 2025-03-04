# 8. UI 컴포넌트 탐색기

이전에 한번 만들어봤던 테스트 코드의 일부를 가져와서 책에서 배운 내용을 조금이나마 적용해보는 시간일 가져봤습니다.

스토리북으로도 꽤나 많은 일들을 할수 있었구나 생각했습니다. 저는 단순한 UI Kit 테스트 용도로만 사용했기에 더욱 그랬는지도 모르겠네요

테스트 러너, 다양한 애드온, Actions, 접근성에 대해 알 수 있어서 좋았네요.

뭔가 읽으면 읽을 수록 설계는 물론 구현도 잘 해야겠다는 생각이…

---

## 스토리북

- UI 컴포넌트 테스트 - 단위 및 통합 테스트와 E2E 테스트의 중간에 위치한 테스트
  - 실행 속도나 실제 환경의 유사성이 중간

## 애드온

- 애드온을 통해 필요한 기능을 추가할 수 있다
- 각 프레임워크의 애드온 지원 여부
  - [https://storybook.js.org/docs/configure/integration/frameworks-feature-support](https://storybook.js.org/docs/configure/integration/frameworks-feature-support)

## 비교해보기

멋모르던 시절 무작정 해보고 싶단 생각에 어드민에 도입한 스토리북이다

react + vite 환경에서 세팅했다.

`"@storybook/react": "^8.3.5"`

책의 경우 `"@storybook/react": "^6.3.13"` 을 사용 중이다.

```tsx
// .storybook/main.ts

import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
};
export default config;
```

위 사용된 에드온에 대해 간략하게 정리해보았다.

1. **@storybook/addon-onboarding**
   - Storybook을 처음 사용하는 사용자를 위한 온보딩 가이드를 제공한다
   - 기본적인 Storybook 사용법을 단계별로 안내하는 튜토리얼을 포함한다.
   - 일정 수준 관리가 된다면 제거하는 편이다.
2. **@storybook/addon-links**
   - 다른 스토리 간에 이동할 수 있는 링크 기능을 제공한다
   - 스토리북 내에서 다른 컴포넌트나 스토리로 쉽게 이동할 수 있게 해준다
3. **@storybook/addon-essentials**
   - 필수적인 애드온 모음을 한 번에 설치할 수 있는 패키지이다
   - 다음과 같은 기능들을 포함한다.
     - Controls: 컴포넌트 props를 동적으로 조작할 수 있게 해준다
     - Actions: 이벤트 핸들러 호출을 기록한다
     - Docs: 자동 문서화 기능을 제공한다
     - Viewport: 다양한 화면 크기에서 컴포넌트를 테스트할 수 있다
     - Backgrounds: 다양한 배경색에서 컴포넌트를 테스트할 수 있다
4. **@chromatic-com/storybook**
   - Chromatic 서비스와 연동하여 시각적 회귀 테스트를 수행할 수 있게 해준다
   - 컴포넌트 변경 사항을 시각적으로 확인하고 검토할 수 있다
   - 설치만해두고 사용하고 있지 않았다….
5. **@storybook/addon-interactions**
   - 사용자 상호작용을 테스트하고 시뮬레이션할 수 있는 도구를 제공한다.
   - 클릭, 입력 등의 사용자 동작을 기록하고 재생할 수 있다.
6. **@storybook/addon-themes**
   - 다양한 테마를 적용하여 컴포넌트를 테스트할 수 있는 기능을 제공한다.
   - 라이트 모드, 다크 모드 등 다양한 테마 환경에서 컴포넌트가 어떻게 보이는지 확인할 수 있다.

```tsx
// .storybook/preview.tsx
import type { Preview } from "@storybook/react";
import { Global, css, ThemeProvider } from "@emotion/react";
import { withThemeFromJSXProvider } from "@storybook/addon-themes";
import { theme } from "../src/styles/theme";
import AppProvider from "../src/context/AppProvider";
import "../src/index.css";

const GlobalStyles = () => (
  <Global
    styles={css`
      :root {
        font-size: 10px;
      }
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
    `}
  />
);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [
    withThemeFromJSXProvider({
      themes: {},
      defaultTheme: "light",
      Provider: ({ children }) => (
        <ThemeProvider theme={theme}>
          <AppProvider>{children}</AppProvider>
        </ThemeProvider>
      ),
      GlobalStyles,
    }),
  ],
};

export default preview;
```

## Button.stories.tsx

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import LogoutIcon from "@/assets/svgs/log-out.svg";
import Button from "./Button";

const meta = {
  title: "Example/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: {
        type: "select",
        options: [
          "primary",
          "secondary",
          "intent",
          "unstyled",
          "dashed",
          "outline",
          "text",
          "disabled",
          "withIcon",
        ],
        description: "버튼 스타일",
      },
    },
    disabled: {
      control: "boolean",
      defaultValue: false,
      description: "버튼 비활성화 여부",
    },
    icon: {
      control: "boolean",
      defaultValue: false,
      description: "버튼 아이콘",
    },
    iconPlacement: {
      description: "버튼 아이콘 위치",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Button",
  },
};

export const Intent: Story = {
  args: {
    variant: "intent",
    children: "Button",
    disabled: false,
  },
};
export const Unstyled: Story = {
  args: {
    variant: "unstyled",
    children: "Button",
  },
};
export const Dashed: Story = {
  args: {
    variant: "dashed",
    children: "Button",
  },
};
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Button",
  },
};

export const Text: Story = {
  args: {
    variant: "text",
    children: "Button",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    children: "Button",
    disabled: true,
  },
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    children: "Home",
    icon: <LogoutIcon />,
  },
};

export const OnlyIcon: Story = {
  args: {
    variant: "primary",
    children: null,
    icon: <LogoutIcon />,
  },
};
```

## Toast.stories.tsx

책의 내용과 비교하여 리팩토링할 수 있는 부분을 시도해 보았다.

```tsx
import type { Meta, StoryObj } from "@storybook/react";

import Toast from "./Toast";
import Button from "@/components/shared/Button/Button";
import useToast from "../useToast";
import ToastProvider from "../ToastProvider";
import { useEffect } from "react";
import { ToastProps } from "../ToastContext";

const meta = {
  title: "Example/Toast",
  component: Toast,
  parameters: {
    layout: "centered",
  },
  argTypes: {
    type: {
      control: {
        type: "select",
        options: ["success", "error", "info", "warning"],
      },
    },
    placement: {
      control: {
        type: "select",
        options: ["top", "bottom", "left", "right"],
      },
    },
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

// 버튼 트리거를 통한 토스트 노출
const ToastWithTrigger = (args: { [key: string]: unknown }) => {
  const { open } = useToast();
  return (
    <div>
      <Button
        onClick={() => {
          open(args as ToastProps);
        }}
      >
        Open Toast
      </Button>
    </div>
  );
};

// 바로 노출
const BaseToast = (args: { [key: string]: unknown }) => {
  const { open } = useToast();

  useEffect(() => {
    open(args as ToastProps);
  }, [open, args]);

  return <></>;
};

export const Default: Story = {
  args: {
    message: "Toast",
    type: "success",
    placement: "top",
  },
  render: (args) => (
    <ToastProvider>
      <ToastWithTrigger {...args} />
    </ToastProvider>
  ),
};

export const Success: Story = {
  args: {
    message: "Toast",
    type: "success",
    placement: "top",
  },
  render: (args) => (
    <ToastProvider status="always">
      <BaseToast {...args} />
    </ToastProvider>
  ),
};
export const Error: Story = {
  args: {
    message: "Toast",
    type: "error",
    placement: "top",
  },
  render: (args) => (
    <ToastProvider status="always">
      <BaseToast {...args} />
    </ToastProvider>
  ),
};

export const Info: Story = {
  args: {
    message: "Toast",
    type: "info",
    placement: "top",
  },
  render: (args) => (
    <ToastProvider status="always">
      <BaseToast {...args} />
    </ToastProvider>
  ),
};

export const Warning: Story = {
  args: {
    message: "Toast",
    type: "warning",
    placement: "top",
  },
  render: (args) => (
    <ToastProvider status="always">
      <BaseToast {...args} />
    </ToastProvider>
  ),
};
```

### 1. 각 스토리마다 render 에 적용했던 Provider를 분리하고 기타 초기값들을 받을 수 있도록 ToastProvider를 수정후 별도의 Toast 컴포넌트 없이도 테스트할 수 있도록 수정

```tsx
const withToastProvider = (options = {}) => {
  const {
    status,
    isOpen = true,
    ...args
  } = options as ToastProps & { isOpen?: boolean; status?: "always" | "hover" };

  return () => (
    <ToastProvider status={status} isOpen={isOpen} options={args}>
      {null}
    </ToastProvider>
  );
};
```

### 2. 데코레이터를 설정하고 필요한 값들을 넘겨준다

```tsx
export const Success: Story = {
  decorators: [
    withToastProvider({
      status: "always",
      placement: "top",
      type: "success",
      message: "Toast",
    }),
  ],
};
export const Error: Story = {
  decorators: [
    withToastProvider({
      status: "always",
      placement: "top",
      type: "error",
      message: "Toast",
    }),
  ],
};

export const Info: Story = {
  decorators: [
    withToastProvider({
      status: "always",
      placement: "top",
      type: "info",
      message: "Toast",
    }),
  ],
};

export const Warning: Story = {
  decorators: [
    withToastProvider({
      status: "always",
      placement: "top",
      type: "warning",
      message: "Toast",
    }),
  ],
};
```

> [!INFO]
>
> > 💡 바로 띄워주는 경우는 필요한 값들을 바로 넘겨줄 수 있었지만 트리거를 통한 Toast 노출은 어떻게 관리하는게 효율적일까?
> >
> > 1. Actions를 활용하자면 트리거가 존재하는 컴포넌트가 있어야하며 테스트 러너를 통해 가능하다
> > 2. 테스트만을 위한 컴포넌트를 만든다?
> > 3. 아니면 기존대로 `*.stories.tsx` 내에서 별도로 만든다
