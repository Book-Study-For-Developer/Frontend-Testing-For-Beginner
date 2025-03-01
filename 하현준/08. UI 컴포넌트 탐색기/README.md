## 스토리북 필수 애드온

스토리북은 애드온으로 필요한 기능을 추가할 수 있다.

```tsx
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  // 애드온 설정
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
    "storybook-addon-next-router",
    "storycap",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-webpack5",
  },
  features: {
    interactionsDebugger: true,
  },
  staticDirs: ["../public"],
  previewHead: (head) => `
    ${head}
    <link rel="stylesheet" href="styles/globals.css" />
  `,
  webpackFinal: async (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "../src"),
    };
    return config;
  },
};
```

### Actions를 활용한 이벤트 핸들러 검증

```jsx
export const parameters = {
  // on으로 시작하는 모든 이벤트 핸들러는 자동적으로 Actions 패널에 찍힌다.
  actions: { argTypesRegex: "^on[A-Z].*" },
  // ...
};
```

### 반응형 확인을 위한 설정

```tsx
// src/tests/storybook.tsx

// SmartPhone(SP)를 위한 레이아웃으로 스토리북을 등록
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

// PC 환경을 위한 레이아웃으로 스토리북 등록
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

### Context API에 의존하는 스토리 설정

Context API에 의존하는 스토리는 decorate를 설정하여 주입해주는 것이 편하다.

```tsx
// src/tests/storybook.tsx

export const BasicLayoutDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => BasicLayout(<Story />);

export const LoginUserInfoProviderDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => (
  <LoginUserInfoProvider>
    <Story />
  </LoginUserInfoProvider>
);

// 사용법

export default {
  component: Header,
  decorators: [LoginUserInfoProviderDecorator],
} as ComponentMeta<typeof Header>;
```

❗️ 여기서 만약 tanstack-query도 사용중이라면 QueryProvider도 스토리북에 세팅해줄 수 있다.

```tsx
  decorators: [
    (Story) => {
      return (
       // 필요한 Provider를 설정
        <QueryClientProvider client={queryClient}>
          // ...
        </QueryClientProvider>);
    },
  ],
```

### 웹 API에 의존하는 스토리 등록

msw 를 사용해서 모킹하여 API 호출을 하므로 스토리북에도 msw세팅이 필요

```jsx
export const parameters = {
  // ...
  msw: { handlers: [handleGetMyProfile()] },
  layout: "fullscreen",
  // 여기에 넣어도 됩니다.
  // decorators:  [mswDecorator, withScreenshot],
};

export const decorators = [mswDecorator];
```

스토리에 API 데이터를 주입받아 사용하는 컴포넌트의 경우 스토리 파일에 msw를 추가하여 세팅할 수 있다.

```tsx
// src/components/layouts/BasicLayout/Header/index.stories.tsx

export const NotLoggedIn: Story = {
  parameters: {
    msw: { handlers: [handleGetMyProfile({ status: 401 })] },
  },
};
```

msw 핸들러 함수

```tsx
// src/services/client/MyProfile/__mock__/msw.ts

export function handleGetMyProfile(args?: {
  mock?: jest.Mock<any, any>;
  status?: number;
}) {
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

❗️ 실무에서도 이와 비슷한 형태로 스토리북을 적용 중입니다.

다만 폴더 구조는 `XXComponents/__mock__` 하위에 만들어둔 것이 아닌 mock이라는 폴더에 모든 API 요청에 대한 목함수들을 모아놓고 거기서 가져와서 쓰고 있습니다.

### Next.js Router에 의존하는 스토리 등록

```tsx
export const RouteMyPosts: Story = {
  parameters: {
    nextRouter: { pathname: "/my/posts" },
  },
};

export const RouteMyPostsCreate: Story = {
  parameters: {
    nextRouter: { pathname: "/my/posts/create" },
  },
};
```

![image.png](attachment:62f04426-1db2-4ae4-96f6-cb017c08706e:image.png)

실제 스토리북을 실행시켜 확인해보면 Actions에 어떤 router의 동작이 실행되는지 확인이 가능하다.

❗️ 이 부분은 실무에서 사용해보지 않았던 영역이다. (Actions를 직접적으로 스토리에서 확인하지 않았음)

한번 적용해도 좋을 것 같다. 탭으로 예시를 들었는데 router에 따라 탭 UI가 어떻게 변경되는지 각각 스토리를 등록했는데 좋은 듯 하다.

### Play function을 활용한 인터랙션 테스트

스토리에 유저 액션을 실행시키는 인터랙션을 등록한다.

```tsx
export const SucceedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
  },
};
```

![image.png](attachment:bac28434-ebe5-4ac9-aa32-d0d13b353a1b:image.png)

스토리북을 실행시켜보면 Interactions 부분에 유저의 어떤 인터랙션이 실행됐는지 로그로 남게 된다.

잘못된 요소를 추가하면 인터랙션이 실패하여 로그가 남게된다.

![image.png](attachment:534d94ed-0174-4173-a7ea-bc4124f93c70:image.png)

## addon-a11y를 활용한 접근성 테스트

접근성 테스트를 위해 addon(`"@storybook/addon-a11y"`)을 추가해야 한다.

**주의 사항**

Accessibility 패널에는 Violations(빨강), Passes(초록), Incomplete(노랑)으로 표기하며 Incomplete 의 경우 수정이 필요하다는 의미이다.

물론 이러한 규칙을 무효화 시킬 수 있는 방법도 있다.

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: {
      //
      config: { rules: [{ id: "label", enabled: false }] },
    },
  },
} as ComponentMeta<typeof Switch>;
```

만약 모든 접근성 검증을 생략하고 싶으면 다음과 같이 설정하면 된다.

```tsx
  parameters: {
    a11y: { disabled: true };
  },
```

## 스토리북 테스트 러너

테스트 러너는 스토리를 실행 가능한 테스트로 변환한다. 테스트로 변환된 스토리는 Jest, playwright에서 실행된다.

### 일반적인 테스트 자동화 하기

UI 컴포넌트가 변경되면 스토리도 반영이 되어야 한다. 이를 위해 test-runner를 통해 스토리에도 오류가 없는지 검증할 수 있다.

```json
    "test:storybook": "test-storybook --url http://localhost:6006",
```

![image.png](attachment:3cae35b7-0557-42d5-b4c6-273775ac8df5:image.png)

![image.png](attachment:2f7e4ec9-d330-41cc-8f33-c9fa3899e972:image.png)

### 접근성 테스트 자동화하기

```jsx
const { getStoryContext } = require("@storybook/test-runner");
const { injectAxe, checkA11y, configureAxe } = require("axe-playwright");

module.exports = {
  // 각 스토리가 렌더링되기 전에 실행되는 함수
  async preRender(page, context) {
    if (context.name.startsWith("SP")) {
      page.setViewportSize({ width: 375, height: 667 });
    } else {
      page.setViewportSize({ width: 1280, height: 800 });
    }
    // axe-core를 페이지에 주입
    // 접근성 검사를 실행할 수 있도록 axe-core 라이브러리를 Playwright 페이지에 추가
    await injectAxe(page);
  },

  // 스토리가 렌더링된 후 실행되는 함수
  async postRender(page, context) {
    //현재 렌더링된 Storybook 스토리의 컨텍스트(메타데이터)를 가져옵니다.
    const storyContext = await getStoryContext(page, context);
    // 접근성 테스트가 꺼져있으면 테스트 건너뛴다.
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }
    // axe 접근성 검사 규칙 설정
    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });
    // 접근성 검사 실행
    await checkA11y(page, "#root", {
      // critical: 접근성 심각도 최상
      // serious: 접근성 심각도 높음
      includedImpacts: ["critical", "serious"],
      // 간단한 리포트로 추출
      detailedReport: false,
      // html 리포트로 추출
      detailedReportOptions: { html: true },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};
```

## 스토리를 import해 테스트 대상으로 만들기

```tsx
import { composeStories } from "@storybook/testing-react";
import { render, screen } from "@testing-library/react";
import * as stories from "./index.stories";

// 스토리 파일을 가져와서 렌더링
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

✋ 이렇게 스토리 컴포넌트를 가져오는 것과 실제 컴포넌트를 가져오는 것의 차이가 뭐일까요?

저는 이런 테스트라면 실제 컴포넌트를 가져와서 했었습니다.

### @storybook/test-runner와의 차이점

**제스트에서 스토리를 재사용할 때의 장점**

- 목 모듈 혹은 스파이가 필요한 테스트를 작성할 수 있다.
- 실행 속도가 빠르다 (헤드리스 브라우저를 사용하지 않기 때문)

**테스트 러너의 장점**

- 테스트 파일을 따로 만들지 않아도 된다.
- 실제 환경과 유사성이 높다.
