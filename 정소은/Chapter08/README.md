# Chapter08: UI 컴포넌트 탐색기

모든 스토리에는 `Global, Component, Story` 라는 세 단계의 설정이 깊은 병합 방식으로 적용된다.
공통으로 적용할 항목을 적절한 스코프에 설정하여 스토리마다 개별적으로 설정해야 하는 작업을 최소화할 수 있다.

- Global단계 : 모든 스토리에 적용할 설정이다 (.storybook/preview.js)
  - 모든 컴포넌트에서 사용할 API 핸들러, 스타일, 라우팅 설정 등을 한 곳에서 관리
- Component단계: 스토리 파일에 적용할 설정(export default)
- Story단계: 개별 스토리에 적용할 설정(export const)

```jsx
//.storybook/preview.js
//handleGetMyProfile: API 응답을 가짜(Mock)로 제공하는 함수
import { handleGetMyProfile } from "@/services/client/MyProfile/__mock__/msw";
import { INITIAL_VIEWPORTS } from "@storybook/addon-viewport"; //여러 기기 크기에서 UI를 테스트
//mswDecorator: 모든 스토리에 대해 MSW를 적용하는 역할
//initialize : MSW를 활성화하는 함수
import { initialize, mswDecorator } from "msw-storybook-addon";
import { RouterContext } from "next/dist/shared/lib/router-context";
import { withScreenshot } from "storycap";

//parameters 부분은 스토리북 관련한 Global 설정 -> Component, Story 단계에서 parameters를 덮어 씌울 수 있음
export const parameters = {
  //이벤트 핸들러를 자동 추적해서 Action 패널에서 볼 수 있음
  actions: { argTypesRegex: "^on[A-Z].*" },

  //Props가 color 또는 Date 형식이면, 스토리북 컨트롤에서 자동으로 UI를 제공해 쉽게 변경할 수 있도록 도와주는 역할
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  nextRouter: {
    Provider: RouterContext.Provider,
  },
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
  // 핸들러 적용
  msw: { handlers: [handleGetMyProfile()] },
  layout: "fullscreen",
};

export const decorators = [mswDecorator, withScreenshot];

initialize();
```

### 스토리북 필수 애드온

스토리북은 애드온으로 필요한 기능을 추가할 수 있다. 설치할 때 기본적으로 추가되는 @storybook/addon-essentials 은 필수 애드온이다.

---

**Controls를 활용한 디버깅**

Props 값을 실시간으로 변경하면서 UI가 어떻게 변화하는지 확인할 수 있는 기능이다. <br>
Props 값을 조정하면, 즉각적으로 컴포넌트의 변화를 확인할 수 있다.

```jsx
import { ComponentMeta, ComponentStoryObj } from "@storybook/react";
import { AnchorButton } from "./";

export default {
  component: AnchorButton,
  args: { children: "제출" }, // 기본 값 설정
} as ComponentMeta<typeof AnchorButton>;

type Story = ComponentStoryObj<typeof AnchorButton>;

// 기본 버튼
export const Default: Story = {};

// Large 버튼 (Props 변경)
export const Large: Story = {
  args: { variant: "large" },
};

// Small 버튼
export const Small: Story = {
  args: { variant: "small" },
};
```

---

**Action을 활용한 이벤트 핸들러 검증**

이벤트 핸들러가 어떻게 호출됐는지 로그를 출력하는 기능이다. @storybook/addon-action 패키지에서 제공한다.

```jsx
//Global에서 설정했던 것
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
```

**반응형 대응을 위한 뷰포트 설정**
반응형 UI를 테스트할 때 사용하는 기능, 화면 크기별로 스토리를 등록할 수 있다. <br>
@storybook/addon-viewport 애드온 사용

```jsx
export const SPLoggedIn: Story = {
  parameters: {
    ...SPStory.parameters, // 기존 SPStory 설정을 가져온다
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const navigation = canvas.queryByRole("navigation", {
      name: "내비게이션",
    });
    await expect(navigation).not.toBeInTheDocument(); // 어떤 뷰포트에서 네비게이션이 존재하는지 확인
  },
};
```

### Context API에 의존하는 스토리 등록

Context API에 의존하는 UI 컴포넌트는 직접 사용하면 에러가 발생할 수 있다. 그래서 스토리북에서는 Context Provider를 데코레이터를 활용하여 적용하는 것이 좋다.

**데커레이터란?**
각 스토리의 렌더링 함수에 적용할 래퍼 역할을 하는 함수<br>
공통 스타일을 적용하거나, Cotext Provider를 감쌀 때 사용

```jsx
//UI 컴포넌트 바깥쪽에 여백을 만들고 싶다면 아래와 같이 데커레이터를 decorators배열에 추가
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

**Provider를 소유한 데커레이터**

Context Provider를 데코레이터로 설정하여 Context에 의존하는 UI를 정상적으로 표시할 수도 있다.
예를 들어 로그인한 사용자의 정보가 있는 Provider를 데커레이터가 소유했다면, Context의 Provider에 의존하는 UI컴포넌트의 스토리에서도 로그인한 사용자의 정보를 표시할 수 있다.

```jsx
export const LoginUserInfoProviderDecorator = (
  Story: PartialStoryFn<ReactFramework, Args>
) => (
  <LoginUserInfoProvider>
    <Story /> //스토리가 Context를 통해 LoginUserInfo**를 참조**
  </LoginUserInfoProvider>
);
```

- 스토리북 전용 Provider를 만들기
  ```jsx
  export const BasicLayoutDecorator = (
    Story: PartialStoryFn<ReactFramework, Args>
  ) => BasicLayout(<Story />);
  ```

---

**데커레이터를 함수로 만들어 재사용하기**

```jsx
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

각 스토리는 createDecorator 라는 고차 함수를 사용해 설정을 최소화한다.

```jsx
function createDecorator(defaultState?: Partial<ToastState>) {
  return function Decorator() {
    return (
      <ToastProvider defaultState={{ ...defaultState, isShown: true }}>
        {null}
      </ToastProvider>
    );
  };
}
```

<ToastProvider> 가 제공하는 정보를 <Toast> 컴포넌트가 표시한다.
⇒ 고차함수를 통해 defaultState를 쉽게 주입 가능

### 웹 API에 의존하는 스토리 등록 -> MSW 사용하기

**애드온 설정**

MSW 사용

```bash
npm install msw msw-storybook-addon --save-dev
```

```jsx
export const decorators = [mswDecorator];

initialize(); // MSW 활성화
```

**요청 핸들러 설정**

다른 parameters와 동일하게 Global, Component, Story 설정을 통해 스토리에 사용할 요청 핸들러가 결정된다. MSW핸들러는 Global 단계에 설정하는 것이 좋다.(하지만 Component 또는 Story 단계에서 덮어씌울 수 있음)

```bash
  msw: { handlers: [handleGetMyProfile()] },
  layout: "fullscreen",
```

요청 핸들러가 스토리에 적용되는 우선순위

1. Story
2. Component
3. Global

따라서 동일한 URL을 가진 요청 핸들러를 Story 단계에 설정하면 설정이 적용된다.

**고차 함수로 요청 핸들러 리팩터링하기**
고차 함수를 활용하면 요청 핸들러를 재사용 가능하도록 리팩터링할 수 있다(공통적인 요청 핸들러 로직을 분리하여 코드 중복을 줄일 수 있다
)

### Next.js Router에 의존하는 스토리 등록

useRouter()를 사용하는 컴포넌트는 특정 URL에서만 동작하는 경우가 있다. 이런 컴포넌트를 테스트하기 위해선 라우터 상태를 모킹하는 기능이 필요하다. <br>
➡️ storybook-addon-next-router 애드온을 통해 Router상태를 스토리마다 설정할 수 있다.

**애드온 설정**

```
//main.js
module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [    "storybook-addon-next-router",],
```

```jsx
 //preview.js
 nextRouter: {
    Provider: RouterContext.Provider, // Next.js의 useRouter() 훅을 정상적으로 동작하게 설정
  },
```

**Router에 의존하는 스토리 등록 예시**

```jsx
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

➡️ 쿼리 스트링도 설정 가능하여 검색 페이지나 필터링 기능을 테스트에 수월할 것 같다.

### Play function 을 활용한 인터랙션 테스트

텍스트 입력, 버튼 클릭, 마우스 이벤트 등의 동작을 자동화하여 UI의 동작을 검증하는 기능이다.<br>
인터랙션 테스트를 자동화하여 UI가 정상적으로 동작하는지 확인, 실제 이벤트가 발생하는 것처럼 동작하여 유저 경험을 테스트 하는데 유용

```jsx
export const SucceedSaveAsDraft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(canvas.getByRole("textbox", { name: "제목" }), "나의 기사");
  },
};
```

인터렉션에 유저의 어떤 인터랙션이 실행됐는지 로그로 남는다. 인터랙션을 제대로 할당하지 않으면 도중에 인터랙션이 중단된다.

### addon-a11y를 활용한 접근성 테스트

스토리북은 컴포넌트 단위로 접근성을 검증하는 용도로 활용된다. 스토리북을 확인하면서 코드를 작성하면 접근성에 문제가 있는지 조기에 발견할 수 있다.

@storybook/addon-a11y

Accessibility 패널

- Violations(빨강) : 접근성 위반, 수정해야됨
- Passes(초록)
- Incomplete(노랑)

→ 해당 내용을 기반으로 접근성을 개선시킬 수 있다.

**일부 규칙 위반을 무효화 하기**

규칙이 너무 엄격하다하면 일부 내용을 무효화할 수 있다. 무효화 기능은 3단계 설정이 가능하다.(전체, 스토리 파일, 개별 스토리)

```jsx
export default {
  component: Switch,
  parameters: {
    a11y: {
      //설정 추가, 접근성 규칙 무효화 시키기
      config: { rules: [{ id: "label", enabled: false }] }, // label 규칙 무효화
    },
  },
} as ComponentMeta<typeof Switch>;
```

**접근성 검증 생략하기**

접근성 검증 자체를 생략하고 싶을 경우, export default에 parameters를 설정해주면된다.
접근성 자체를 검증 대상에서 제외 시키므로 신중하게 사용해야 한다.

```jsx
  parameters: {
    a11y: { disabled: true };
  },
```

### 스토리북 테스트 러너

**테스트 러너**
: 스토리를 실행 가능한 테스트로 변환하여 테스트로 변환된 스토리는 제스트와 플레이라이트에서 스토리를 실행하고 검증한다.

---

**테스트 러너를 활용한 일반적인 테스트 자동화**

UI 컴포넌트 구현이 변경되면 등록된 스토리에도 변경 사항을 반영해야 한다.

`@storybook/test-runner` 를 사용해서 명령줄 인터페이스나 CI에서 테스트 러너를 실행하면 등록된 스토리에 오류가 없는지 검증할 수 있다.

---

**테스트 러너를 활용한 Play function 테스트 자동화**

UI가 변경되었을 때 스토리북에 등록된 모든 컴포넌트가 정상적으로 렌더링되는지 확인하는 자동화된 테스트 과정

---

**테스트 러너를 활용한 접근성 테스트 자동화**

```jsx
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

### 스토리를 통합 테스트에 재사용하기

**@storybook/test-runner와의 차이점**

- 제스트에서 스토리를 재사용할 때의 장점
  - 목 모듈 혹은 스파이가 필요한 테스트를 작성할 수 있다.
  - 실행 속도가 빠르다
- 테스트 러너의 장점
  - 테스트 파일을 따로 만들지 않아도 된다.
  - 실제 환경과 유사성이 높다
