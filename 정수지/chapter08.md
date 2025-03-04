# 스토리북 기초

- 프론트엔드 개발의 주요 구현 대상은 UI 컴포넌트
- UI 컴포넌트 탐색기는 구현된 UI 컴포넌트를 쉽게 공유할 수 있도록 도와주는 협업도구
- 스토리북은 UI 컴포넌트 탐색기이지만, 테스트 기능도 깅화함
  스토리북의 UI 컴포넌트 테스트는 jsdom을 사용한 단위 테스트 및 통합 테스트, 브라우저를 사용한 E2E 테스트 이 두 가지 테스트의 중간에 위치한 테스트

## 스토리북 설치 및 실행

```bash
$ npx storybook init # Webpack 5, react, Y
$ npm run storybook
```

## 스토리 등록

- 프로젝트에 스토리 파일 추가 (ex. `Button.stories.jsx`)

  ```tsx
  import { Button } from "./";

  export default {
    title: "Example/Button",
    component: Button,
  };
  ```

- 스토리북 에서는 Props에 해당하는 변수명이 props가 아닌 args임

  - size Props를 지정해 다른 이름으로 export 시 서로 다른 스토리로 등록됨

  ```tsx
  export const Default: Story = {};

  export const Large: Story = {
    args: { variant: "large" },
  };

  export const Small: Story = {
    args: { variant: "small" },
  };
  ```

## 깊은 병합

- 모든 스토리에는 Global, Component, Story라는 세 단계의 설정이 깊은 병합 방식으로 적용됨
  - Global : 모든 스토리에 적용할 설정 (.storybook/preview.js)
  - Component : 스토리 파일에 적용할 설정 (export default)
  - Story : 개별 스토리에 적용할 설정 (export const)
- 우선순위는 Story > Component > Global

# 스토리북 필수 애드온

- 스토리북 설치 시 기본적으로 추가되는 @storybook/addon-essentials은 필수 애드온

## Controls를 활용한 디버깅

- Controls : 스토리북 탐색기에서 Props를 변경해 컴포넌트 어떻게 표시되는지 실시간 디버깅 가능한 것
- @storybook/addon-essentials에 포함된 @storybook/addon-controls라는 애드온이 제공하는 기능

## Actions를 활용한 이벤트 핸들러 검증

- Actions : 이벤트 핸들러가 어떻게 호출됐는지 로그를 출력하는 기능
- @storybook/addon-essentials에 포함된 @storybook/addon-actions 패키지에서 제공
- Global 단계 설정 파일인 preview.js 내 `actions: { argTypesRegex: "^on[A-Z].*" }` 설정을 통해 on으로 시작하는 모든 이벤트 핸들러는 자동적으로 Actions 패널에 로그를 출력하게 됨

## 반응형 대응을 위한 뷰포트 설정

- @storybook/addon-viewport 패키지에서 지원해주기 때문에 화면 크기별로 스토리를 등록 할 수 있음
- parameters.viewport를 설정해야함
  - 공통된 설정으로 만드는 방법
    - screenshot은 스토리로 시각적 회귀 테스트를 하기 위한 설정
    ```tsx
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
    ```
    ```tsx
    export const SPNotLogIn: Story = {
      parameters: {
        ...SPStory.parameters,
        ...NotLoggedIn.parameters,
      },
    };
    ```

# Context API에 의존하는 스토리 등록

- 스토리북의 데커레이터(decorator)를 활용하는 것이 편리함
- 초깃값을 주입할 수 있도록 Provider를 만들면 Context의 상태에 의존하는 UI를 간단하게 재현가능

## 스토리북의 데커레이터

- 데커레이터 : 각 스토리의 렌더링 함수에 적용할 wrapper를 의미
  ex) UI 컴포넌트의 바깥쪽에 여백을 만들고 싶은 경우 decorator 함수를 decorators 배열에 추가함

  ```tsx
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

## Provider를 소유한 데커레이터

- Context의 Provider를 설정할 수 있음

```
export const LoginUserInfoProviderDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => (
  <LoginUserInfoProvider>
    <Story />
  </LoginUserInfoProvider>
);
```

## 데커레이터 고차 함수

```tsx
function createDecorator(defaultState?: Partial<ToastState>) {
  return function Decorator() {
    return (
      <ToastProvider defaultState={{ ...defaultState, isShown: true }}>
        {null}
      </ToastProvider>
    );
  };
}

export const Succeed: Story = {
  decorators: [createDecorator({ message: "성공했습니다", style: "succeed" })],
};

export const Failed: Story = {
  decorators: [createDecorator({ message: "실패했습니다", style: "failed" })],
};

export const Busy: Story = {
  decorators: [createDecorator({ message: "통신 중입니다", style: "busy" })],
};
```

# 웹 API에 의존하는 스토리 등록

- 웹 API에 의존하는 스토리의 경우 스토리에도 웹 API가 필요하기 때문에 MSW 사용

## 애드온 설정

- 스토리북에서 MSW를 사용하기 위해 msw, msw-storybook-addon 설치

```bash
$ npm install msw msw-storybook-addon --save-dev
```

- .storybook/preview.js에서 intialize 함수를 실행해 MSW를 활성화

```tsx
import { initialize, mswDecorator } from "msw-storybook-addon";
export const decorators = [mswDecorator];
initialize();
```

- (프로젝트에 처음 MSW 설치하는 경우) public 디렉터리의 경로를 아래 커맨드대로 실행
  커맨드 실행 시 mockServiceWorker.js가 생성됨 → 커밋해야 함

```bash
$ npx msw init <PUBLIC_DIR> # PUBLIC_DIR는 프로젝트의 public 디렉터리명으로 변경
```

- 스토리북에도 public 디렉터리의 경로 명시

```jsx
module.exports = {
  // 생략
  staticDirs: ["../public"],
};
```

## 요청 핸들러 변경

- MSW 핸들러를 알맞은 단계(Global, Component, Story)에 설정
  ex) Global 단계에 세팅 (preview.js)
  ```jsx
  export const parameters = {
    // 생략
    msw: { handlers: [handleGetMyProfile()] },
  };
  ```
  ex) Story 단계에서 목 응답 덮어쓰기
  ```jsx
  export const NotLoggedIn: Story = {
    parameters: {
      msw: {
        handlers: [
          rest.get("/api/my/profile", async (_, res, ctx) => {
            return res(ctx.status(401));
          }),
        ],
      },
    },
  };
  ```

## 고차 함수로 요청 핸들러 리팩터링하기

```jsx
export const NotLoggedIn: Story = {
  parameters: {
    msw: {
      handlers: [
        rest.get("/api/my/profile", async (_, res, ctx) => {
          return res(ctx.status(401));
        }),
      ],
    },
  },
};
```

```jsx
export const NotLoggedIn: Story = {
  parameters: {
    msw: {
      handlers: [handleGetMyProfile({ status: 401 })],
    },
  },
};
```

# Next.js Router에 의존하는 스토리 등록

- 특정 URL에서만 사용할 수 있는 UI 컴포넌트의 스토리를 등록하기 위해서는 storybook-addon-next-router 애드온을 추가해야함, Router 상태를 스토리마다 설정 가능해짐

## 애드온 설정

```bash
$ npm install storybook-addon-next-router --save-dev
```

```jsx
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["storybook-addon-next-router"],
};
```

```jsx
export const parameters = {
  nextRouter: {
    Provider: RouterContext.Provider,
  },
};
```

## Router에 의존하는 스토리 등록 예시

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

# Play function을 활용한 인터랙션 테스트

- Play function을 사용해 인터렉션 할당 상태를 스토리로 등록 가능

## 애드온 설정

```bash
$ npm install @storybook/testing-library @storybook/jest @storybook/addon-interactions --save-dev
```

```tsx
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-interactions"],
  features: {
    interactionsDebugger: true,
  },
};
```

## 인터랙션 할당

```tsx
export const SucceedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
  },
};
```

## 단언문 작성

```tsx
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

```tsx
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
```

# addon-a11y를 활용한 접근성 테스트

- @storybook/addon-a11y 애드온 추가

## 애드온 설정

```bash
$ npm install @storybook/addon-a11y --save-dev
```

- 접근성 검증 도구로 axe를 사용함 (세부설정은 axe-core 공식문서 참고)

```tsx
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-a11y"],
};
```

- 알맞은 단계(Global, Component, Story)에 설정해 사용

## 접근성과 관련한 주의 사항 점검하기

- 애드온 패널에 Accessibility 패널 내 검증 내용이 구분되어 표시됨
  Violations: 접근성 위반, Incomplete: 수정 필요

## 일부 규칙 위반 무효화

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: {
      config: { rules: [{ id: "label", enabled: false }] },
    },
  },
} as ComponentMeta<typeof Switch>;
```

## 접근성 검증 생략하기

- parameters.a11y.disabled를 true로 설정

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: { disable: true },
  },
} as ComponentMeta<typeof Switch>;
```

# 스토리북 테스트 러너

- 스토리를 실행가능한 테스트로 변환함
- 테스트로 변환된 스토리는 제스트와 플레이라이트에서 실행됨

## 테스트 러너를 활용한 일반적인 테스트 자동화

- UI 컴포넌트 구현 변경 시 스토리에도 변경사항을 반영해야 함
- @storybook/test-runner를 사용해 명령줄 인터페이스나 CI에서 테스트 러너를 실행하면 등록된 스토리에 오류가 없는지 검증 가능

```bash
$ npm install @storybook/test-runner --save-dev
```

```tsx
"scripts": {
	"test:storybook": "test-storybook"
}
```

## 테스트 러너를 활용한 접근성 테스트 자동화

- 스토리북의 테스트러너는 플레이라이트와 헤드리스 브라우저에서 실행됨

```bash
$ npm install axe-playwright --save-dev
```

- 테스트 러너 설정파일에 axe-playwright 설정 추가

```tsx
const { getStoryContext } = require("@storybook/test-runner");
const { injectAxe, checkA11y, configureAxe } = require("axe-playwright");

module.exports = {
  async preRender(page, context) {
    if (context.name.startsWith("SP")) {
      page.setViewportSize({ width: 375, height: 667 });
    } else {
      page.setViewportSize({ width: 1280, height: 800 });
    }
    await injectAxe(page);
  },
  async postRender(page, context) {
    const storyContext = await getStoryContext(page, context);
    if (storyContext.parameters?.a11y?.disable) {
      return;
    }
    await configureAxe(page, {
      rules: storyContext.parameters?.a11y?.config?.rules,
    });
    await checkA11y(page, "#root", {
      includedImpacts: ["critical", "serious"],
      detailedReport: false,
      detailedReportOptions: { html: true },
      axeOptions: storyContext.parameters?.a11y?.options,
    });
  },
};
```
