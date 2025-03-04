### UI 컴포넌트 탐색기

프론트엔드 개발의 주요 구현 대상은 **UI 컴포넌트**이다.

기존 프론트엔드 테스트는 아래의 두 가지 테스트를 의미했다.

- `jsdom` 을 사용한 단위, 통합 테스트
- 브라우저를 사용한 E2E 테스트

`스토리북(storybook)` 의 UI 컴포넌트 테스트는 이 두 가지 테스트의 중간에 위치한 테스트이다.

### 3단계 깊은 병합

모든 스토리에는 `Global` , `Component` , `Story` 라는 세 단계의 설정이 `깊은 병합` 방식으로 적용된다.

- `Global` 단계: 모든 스토리에 적용할 설정(`.storybook/preview.js`)
- `Component` 단계: 스토리 파일에 적용할 설정(`export default`)
- `Story` 단계: 개별 스토리에 적용할 설정(`export const`)

### 스토리북 필수 애드온

스토리북은 `애드온(add-on)` 으로 필요한 기능을 추가할 수 있다.

- 스토리북을 설치할 때 기본적으로 추가되는 `@stroybook/addon-essentials` 은 필수 애드온이다.

### Controls를 활용한 디버깅

스토리북 탐색기에서는 `props` 를 변경해 컴포넌트가 어떻게 표시되는지 실시간으로 디버깅할 수 있는데 이를 `Controls` 라고 한다.

- 긴 문자열을 입력했을 때 레이아웃이 깨지지 않고 의도한대로 줄바꿈이 되었는지를 확인할 수도 있다.
- `@storybook/addon-controls` 라는 애드온이 제공하는 기능이며 `@stroybook/addon-essentials` 에 포함되어 있다.

### Actions를 활용한 이벤트 핸들러 검증

이벤트 핸들러가 어떻게 호출되었는지 로그를 출력하는 기능이 `Actions` 이다.

```jsx
// .storybook/preview.js (global setting)
export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
};
```

위 Global 단계 설정으로 인해 `on` 으로 시작하는 모든 이벤트 핸들러는 자동적으로 `Actions` 패널에 로그를 출력하게 된다.

- 만약 프로젝트에 이벤트 핸들러 네이밍 컨벤션이 `on` prefix를 붙이지 않는 경우 설정 파일에서 정규표현식을 수정해야 한다.

### Context API에 의존하는 스토리 등록

React의 Context API에 의존하는 스토리에는 스토리북의 `데커레이터(decorator)` 를 활용하는 것이 편리하다.

- 데커레이터는 각 스토리의 렌더링 함수에 적용할 래퍼이다.

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

export default {
  component: Toast,
} as ComponentMeta<typeof Toast>;

type Story = ComponentStoryObj<typeof Toast>;

export const Succeed: Story = {
  decorators: [createDecorator({ message: "성공했습니다.", style: "succeed" })],
}

export const Failed: Story = {
  decorators: [createDecorator({ message: "실패했습니다.", style: "failed" })],
};
```

### 웹 API에 의존하는 스토리 등록

`.storybook/preview.js` 에 필요한 설정을 추가한다. 예를 들어 모든 스토리에 로그인한 사용자 정보가 필요하다면 로그인한 사용자 정보를 반환하는 `MSW` 핸들러를 Global 단계에 설정하는 것이 좋다.

요청 핸들러가 스토리에 적용되는 순서는 `Story` → `Component` → `Global` 순서이다.

### addon-a11y를 활용한 접근성 테스트

애드온 패널에 추가된 Accessibility 패널을 열어보면 검증한 내용이 `Violations(빨간색)` , `Passes(초록색)`, `Incomplete(노란색)` 으로 구분되어 있다.

- `Violations` 은 접근성을 위반했다는 의미이고, `Incomplete` 는 수정이 필요하다는 의미이다.

각 탭을 열면 주의점과 가이드라인이 적혀 있고 `Highlight results` 라는 체크박스를 체크하면 주의점이 점선으로 표시되면서 강조된다. 해당 내용을 기반으로 접근성을 개선시킬 수 있다.
