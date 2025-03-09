## 🟢 스토리북 기초

UI 컴포넌트 탐색기 - 프론트엔드 개발의 주요 구현 대상인 UI 컴포넌트에 대해서 다른 개발자 뿐만 아니라 디자이너 또는 프로젝트 리들 사이 협업 능률을 높이는데 도움을 주는 도구

### 💡 Story Book

- UI 컴포넌트 탐색기의 역할을 하지만 테스트 기능도 강화.
  → 스토리북의 테스트는 jsdom을 통한 단위 테스트 및 강화테스트와 브라우저를 통한 E2E 테스트 사이에 위치한 테스트

### 💡 Story 등록

```tsx
// Button 컴포넌트를 테스트하는 스토리 파일
export default {
  component: Button,
  args: { children: '제출' },
} as ComponentMeta<typeof Button>;
// ComponentMeta<T> -> 스토리북이 특정 컴포넌트(Button)의 메타데이터를 인식하도록 도와주는 타입

// 스토리 객체 타입을 Button 컴포넌트에 맞게 지정
type Story = ComponentStoryObj<typeof Button>;

// args에 따라 컴포넌트의 다양한 형태 정의 가능
export const Default: Story = {};

export const Large: Story = {
  args: { variant: 'large' },
};

export const Small: Story = {
  args: { variant: 'small' },
};
```

### 💡 3단계 깊은 병합

공통으로 적용할 항목에 대해서 스토프별로 설정 가능하다.

- Global 단계 - 모든 스토리에 적용할 단계 ( .storybook/preview.js )
- Component 단계 : 스토리 파일에 적용할 설정 ( export default 구문 )
- Story 단계 : 개별 스토리에 적용할 설정 ( export const )

<br />

## 🟢 스토리북 필수 애드온

### 💡 Controls를 활용한 디버깅

- 스토리북을 실행하면 props에 따라 여러 스타일과 기능을 사용해볼 수 있음
- 각 컴포넌트에는 `Controls` 탭이 존재히며 Controls에서는 여러 props를 지정하여 어떻게 컴포넌트가 변화하는지 확인할 수 있음.

<div align='center'>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/0a54d574-effa-44fc-8150-2781a8e4a95b" />
</div>

### 💡 Actions를 활용한 이벤트 핸들러 검증

이벤트 핸들러가 어떻게 호출되었는지 Action 탭을 통해 로그를 확인할 수 있는 기능을 제공

<div align='center'>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/aab5dfa6-b467-462f-bd9f-28aab74d9a09" />
</div>

### 반응형 대응을 위한 뷰포트 설정

반응형 컴포넌트에 대해서 뷰포트의 크기에 따라 다른 스토리를 설정할 수 있다.

레이아웃 등록을 위해서 `parameters.viewport` 에 대한 설정이 필요하다.

```tsx
export const SPStory = {
  // 스마트폰 사이즈
  parameters: {
    viewport: {
      viewports: INITIAL_VIEWPORTS,
      defaultViewport: 'iphone6',
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
  // PC 사이즈
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
export const SPNotLogIn: Story = {
  parameters: {
    ...SPStory.parameters, // SP 레이아웃을 적용
    ...NotLoggedIn.parameters,
  },
};
```

<br />

## 🟢 Context API에 의존하는 스토리 등록

Context API에 의존적은 스토리는 스토리 북의 데커레이터(Decorator)를 활용하는 것이 편리함.

초깃값 주입을 위해 Provider를 만들면 Context 상태에 의존하는 UI를 재현할 수 있음.

### 💡  스토리북의 데커레이터

데커레이터 - 각 스토리의 랜더링 함수에 적용한 Wrapper를 의미

```tsx
export default {
  title: 'ChildComponent',
  component: ChildComponent,
  decorators: [
    (Story) => (
      <div style={{ padding: '10px' }}>
        <Story />
      </div>
    ),
  ],
};
```

→ 이렇게 설정하는 경우 Component 단게에서 설정했기 때문에 모든 스토리에 대해서 적용

### 💡 Provider를 소유한 데커레이터

데커레이터에 Context Provider를 설정하여 공통으로 활용

```tsx
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
```

스토리 내에서 decorators를 전달하여 각 컴포넌트에 적용

```tsx
export default {
  component: Header,
  decorators: [LoginUserInfoProviderDecorator],
} as ComponentMeta<typeof Header>;
```

### 💡 데커레이터 고차 함수

데커레이터를 만드는 고차함수(HOF)를 통해 데커레이터를 쉽게 만들 수 있음.

```tsx
function createDecorator(defaultState?: Partial<AlertDialogState>) {
  return function Decorator(Story: PartialStoryFn<ReactFramework, Args>) {
    return (
      <AlertDialogProvider defaultState={{ ...defaultState, isShown: true }}>
        <Story />
      </AlertDialogProvider>
    );
  };
}

// 실제로 등록할 스토리
export const Default: Story = {
  decorators: [createDecorator({ message: '성공했습니다' })],
};

export const CustomButtonLabel: Story = {
  decorators: [
    createDecorator({
      message: '기사를 공개합니다. 진행하시겠습니까?',
      cancelButtonLabel: 'CANCEL',
      okButtonLabel: 'OK',
    }),
  ],
};
```

createDecorator를 통해 props 값만 바꾸면서 컴포넌트를 표시할 수 있음

<br />

## 🟢 웹 API에 의존하는 스토리 등록

웹 API에 의존하는 컴포넌트의 경우 스토리북에서도 웹 API가 필요함.

웹 API를 그대로 활용해도 되지만 네트워크 환경에 영향을 받는다. MSW를 활용하여 Mock API를 만들어 사용하는 방법을 택할 수도 있다.

### 💡 애드온 설정

- `npm installl msw msw-storybook-addon --save-dev` 로 애드온 설치
- 애드온 활성화
  ```jsx
  export const decorators = [mswDecorator];

  initialize();
  ```
- public 폴더 경로 설정
  `npx msw init <PUBLIC_DIR>`
- storyBook의 public 디렉토리 경로 설정
  ```tsx
  module.exports = {
    staticDirs: ['../public'],
  };
  ```

### 💡 요청 핸들러 변경

`Global` , `Component` , `Story` 각 단계 설정을 통해 msw를 활용한 핸들러의 범위를 결정할

- Global
  ```tsx
  // .storybook/preview.js
  export const parameters = {
  	...
    msw: { handlers: [handleGetMyProfile()] },
    ...
  };
  ```
- Component
  ```tsx
  export default {
    parameters: {
  		...
  	  msw: { handlers: [handleGetMyProfile()] },
  	  ...
  	},
  } as ComponentMeta<typeof Header>;
  ```
- Story
  ```tsx
  export const NotLoggedIn: Story = {
    parameters: {
      msw: {
        handlers: [
          rest.get('/api/my/profile', async (_, res, ctx) => {
            return res(ctx.status(401));
          }),
        ],
      },
    },
  };
  ```

<br />

## 🟢 Next.js Router에 의존하는 스토리 등록

### 💡 애드온 설정

- `npm install storybook-addon-next-router --save-dev`
- .storybook/main.js 설정
  ```tsx
  module.exports = {
    stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
    addons: [
  		...
      "storybook-addon-next-router",
  		...
    ],
  };
  ```
- `.storybook/preview.js` 설정
  ```tsx
  export const parameters = {
  	...
    nextRouter: {
      Provider: RouterContext.Provider,
    },
  	...
  };
  ```

### 💡 Router에 의존하는 스토리 등록 예시

```tsx
export const RouteMyPosts: Story = {
  parameters: {
    nextRouter: { pathname: '/my/posts' },
  },
};
```

<br />

## 🟢 Play function을 활용한 인터렉션 테스트

### 💡 애드온 설정

- `npm install @storybook/testing-library @storybook/jest @storybook/addon-interactions --save-dev`
- .storybook/main.js 설정
  ```tsx
  module.exports = {
  	...
    addons: [
      "@storybook/addon-interactions",
    ],
    features: {
      interactionsDebugger: true,
    },
  };
  ```

### 💡 인터렉션 할당

- 인터렉션 할당을 위해 스토리에 play 함수를 설정.
- userEvent를 사용해서 UI 컴포넌트에 인터렉션 설정
  ```tsx
  import {
    userEvent as user,
    waitFor,
    within,
  } from '@storybook/testing-library';

  export const SucceedSaveAsDraft: Story = {
    play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await user.type(
        canvas.getByRole('textbox', { name: '제목' }),
        '나의 기사'
      );
    },
  };
  ```
- 인터렉션을 제대로 할당하지 않으면 중간에 중단된다.

### 💡 단언문 작성

인터렉션 할당한 상태에서 단언문을 작성할 수 있음

```tsx
export const SavePublish: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await user.type(
      canvas.getByRole('textbox', { name: '머릿말' }),
      '나의 기사'
    );
    await user.click(canvas.getByRole('switch', { name: '공개 여부' }));

    await expect(
      canvas.getByRole('button', { name: '공개하기' })
    ).toBeInTheDocument();
  },
};
```

작성한 단언문의 결과도 스토리북의 Interaction 탭에서 함께 확인할 수 있다.

<div align='center'>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/b86fe87d-d1d2-4c20-a4d7-7b72c75b0da9" />
</div>

<br />

## 🟢 addon-a11y를 활용한 접근성 테스트

스토리 북은 컴포넌트 단위로 접근성을 검증하는 용도로도 활용

### 💡 애드온 설정

- `npm install @stroybook/addon-a11y --save-dev` 로 설치
- 원하는 단계에 맞춰 `addons` 속성으로 전달.
  ```tsx
  // .storybook/main.js
  module.exports = {
    addons: ['@storybook/addon-a11y'],
  };
  ```
  ```tsx
  export default {
  	parameters: {
      a11y: { ... },
    }
  }
  ```
  ```tsx
  export const RouteMyPosts: Story = {
    parameters: {
      a11y: {...},
      nextRouter: { pathname: "/my/posts" },
    },
  };
  ```

### 💡 접근성 관련 주의 사항 점검하기

<div align='center'>
  <img src='https://github.com/user-attachments/assets/86172ca3-d001-4946-b7b0-babf5740802a' width='800' />
</div>

- Accessiblity 패널에 접근성에 대해 검증한 내용을 확인할 수 있음
  → 각 검증 내용은 Violations(접근성 위반), Passes, Incomplete(수정 필요)로 구분

### 💡 일부 규칙 위반을 무효화하기

아래와 같이 스토리 수준에서 접근성 관련 테스트를 비활성화 할 수 있음

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: {
      config: { rules: [{ id: 'label', enabled: false }] },
    },
  },
} as ComponentMeta<typeof Switch>;
```

→ 해당 애드온에서 검증 도구로서 axe를 사용.

### 💡 접근성 검증 생략하기

접근성 검증 자체를 생략하고 싶은 경우 아래와 같이 a11y속성을 수정.

규칙 무효화와 달리 검증 단계 자체를 건너뛰기 때문에 신중하게 사용해야함.

```tsx
export default {
  component: Switch,
  parameters: {
    a11y: { disable: true },
  },
} as ComponentMeta<typeof Switch>;
```

<br />

## 🟢 스토리북 테스트 러너

- 스토리북의 테스트 러너는 스토리를 실행가능한 테스트로 변환
- 테스트로 변환된 스토리는 Jest, Playwright에서 실행
- 해당 기능을 통해 play function이 제대로 종료 되었는지, 접근성 위반 사항은 없는지, UI 테스트로도 활용할 수 있음

### 💡 테스트 러너를 활용한 일반적인 테스트 자동화

테스터 러너를 통해 CLI나 CI 내에서 등록된 스토리의 오류를 확인할 수 있음

- `npm install @storybook/test-runner --save-dev` 설치
- 실행 스크립트 등록
  ```json
  {
    "scripts": {
      "test:storybook": "test-storybook"
    }
  }
  ```

### 💡 테스트 러너를 활용한 Play function 테스트 자동화

작성한 스크립트를 `npm run test:storybook` 으로 실행하면 CLI로 각 테스트의 결과를 확인할 수 있고, 실패하는 경우 아래와 같이 실패 에러 케이스에 대한 설명을 볼 수 있음

<div align='center'>
  <img width="800" alt="image" src="https://github.com/user-attachments/assets/a6af8871-ae89-4bce-a6fb-2dc5640b0bed" />
</div>

### 💡 테스트 러너를 활용한 접근성 테스트 자동화

- axe-playwright를 활용하면 접근성 검증 도구인 axe를 활용하여 접근성 관련 문제점을 찾을 수 있음
- `npm install axe-playwright --save-dev` 로 설치
- .storybook/test-runner.js 파일을 통해 axe-playwright 설정

  ```
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

      // axe를 통한 접근성 관련 검증
      await checkA11y(page, "#root", {
  	    // Violation에 대한 오류만 검증
        includedImpacts: ["critical", "serious"],
        detailedReport: false,
        detailedReportOptions: { html: true },
        axeOptions: storyContext.parameters?.a11y?.options,
      });
    },
  };

  ```

  → includeImpacts 속성을 통해서 오류 수준을 조절하여 검출 수준을 조절할 수 있음

    <br />
    
    ## 🟢 스토리를 통합 테스트에 재사용하기
    
    ### 💡 스토리 재사용
    
    다른 컴포넌트의 스토리를 데커레이터를 통해 재사용할 수 있다.
    
    ```tsx
    function createDecorator(defaultState?: Partial<AlertDialogState>) {
      return function Decorator(Story: PartialStoryFn<ReactFramework, Args>) {
        return (
          <AlertDialogProvider defaultState={{ ...defaultState, isShown: true }}>
            <Story />
          </AlertDialogProvider>
        );
      };
    }
    ```
    
    ### 💡 스토리를 Import하여 테스트 대상으로 만들기
    
    `@storybook/testing-react` 를 통해 테스트 코드 내부에서 스토리를 호출하여 활용할 수 있다,
    
    - `npm install --save-dev @storybook/testing-react` 설치
    - 스토리를 import하는 테스트 코드에서 스토리를 선언
        
        ```tsx
        import { composeStories } from '@storybook/testing-react';
        import { render } from '@testing-library/react';
        
        const { Default, CustomButtonLabel, ExculdeCancel } = composeStories(stories)
        
        test("testing with stroy", () => {
        	render(<Default />); // 스토리 랜더링
        	...
        })
        ```


### 💡 @storybook/test-runner와의 차이점

- Jest에서 스토리를 사용할때의 장점
  - 목 모듈 혹은 스파이가 필요한 테스트를 작성할 수 있다.
  - 실행 속도가 빠르다 ( 헤드리스 브라우저를 사용하지 않음 )
- 테스트 러너의 장점
  - 테스트 파일을 따로 만들지 않아도 된다.
  - 실제 환경과 유사성이 높다. ( 브라우저를 통해 CSS가 적용된 상황 까지 재현 가능 )
