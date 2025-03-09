# Chapter 8. UI 컴포넌트 탐색기

- 기존의 프론트엔드 테스트는 다음의 두 가지 테스트를 의미했다:
    - jsdom을 사용한 단위 테스트 및 통합 테스트
    - 브라우저를 사용한 E2E 테스트
    
    → 스토리북의 UI 컴포넌트 테스트는 이 두 가지 테스트의 중간에 위치한 테스트이다
    
- 모든 스토리에는 세 단계의 설정이 깊은 병합 방식(단순히 덮어쓰는 것이 아니라 하위 속성들을 유지하며 병합하는 방식)으로 적용된다:
    - 글로벌 설정
        - Storybook 전체에서 공통으로 적용되는 설정(모든 스토리에 적용되는 설정)
        - `.storybook/preview.js`에서 정의됨
        
        ```jsx
        export const parameters = {
          backgrounds: { default: "light", values: [{ name: "light", value: "#fff" }] }},
          controls: { expanded: true },
        };
        ```
        
    - 컴포넌트별 설정
        - 특정 컴포넌트에 적용되는 설정(스토피 파일에 적용되는 설정)
        - `export default` 객체 내부에 정의됨
        
        ```jsx
        export default {
          title: "Components/Button",
          component: Button,
          parameters: {
            backgrounds: { default: "dark" }, // 컴포넌트별 설정
          },
        };
        ```
        
    - 스토리별 설정
        - 개별 스토리에 적용되는 설정
        
        ```jsx
        export const Primary = () => <Button primary>Primary Button</Button>;
        Primary.parameters = {
          backgrounds: { default: "blue" }, // 이 스토리에서만 적용
        };
        ```
        
    
    → 이러한 방식을 통해 **기본 설정을 유지한채 각 스토리에서 필요한 설정만 변경할 수 있다**
    
- UI 컴포넌트는 props에 전달된 값에 따라 다른 스타일과 기능을 제공한다. 스토리북 탐색기에서는 props를 변경해 컴포넌트가 어떻게 렌더링되는지 실시간으로 디버깅할 수 있다. 이를 Controls라 한다. `@storybook/addon-controls`라는 애드온에서 제공한다
- UI 컴포넌트는 props로 이벤트를 전달받아 이를 호출하기도 한다. 이벤트 핸들러가 어떻게 호출됐는지 로그를 출력하는 기능이 Actions이며, `@storybook/addon-actions` 패키지에서 제공한다
- 반응형으로 구현한 UI 컴포넌트는 화면 크기별로 스토리를 등록할 수 있다. `@storybook/addon-viewport` 패키지에서 지원한다
- Context API에 의존하는 스토리에는 스토리북의 데코레이터를 활용하는 것이 편리하다. 또한 초기값을 주입할 수 있도록 Provider를 만들면 Context의 상태에 의존하는 UI를 간단하게 재현할 수 있다
- 데코레이터는 각 스토리의 렌더링 함수에 적용할 Wrapper이다. 예를 들어 UI 컴포넌트 외곽에 padding을 주고 싶다면 다음과 같이 데코레이터 함수를 `decorators` 배열에 추가한다:
    
    ```jsx
    export default {
      title: "ChildCompoent",
      component: ChildCompoent,
      decorators: [
        (Story) => {
          <div style={{ padding: "8px" }}>
            <Story />
          </div>
        }
      ]
    }
    ```
    
- 데코레이터에 Context의 Provier를 설정할 수 있다. 예를 들어 로그인한 사용자의 정보가 있는 `Provider(LoginUserInfoProvider)`를 데코레이터가 소유했다면, Context의 Provider에 의존하는 UI 컴포넌트의 스토리에서도 로그인한 사용자의 정보를 표시할 수 있다:
    
    ```tsx
    export const LoginUserInfoProviderDecorator = (
      Story: PartialStoryFn<ReactFramework, Args>
    ) => (
      <LoginUserInfoProvider>
        <Story />  {/* 스토리가 LoginUserInfoProvider를 통해 LoginUserInfo를 참조 */}
      </LoginUserInfoProvider>
    );
    ```
    
- 스토리북의 기능인 play function을 사용하면 인터랙션 할당 상태를 스토리로 등록할 수 있다
- 스토리북의 테스트 러너는 스토리를 실행 가능한 테스트로 변환한다. 이렇게 변환된 스토리는 Jest와 PlayWright에서 실행된다. 이 기능을 활용하여 UI 컴포넌트 테스트로도 활용할 수 있다