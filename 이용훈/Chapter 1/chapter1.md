# Chapter 1. 테스트 목적과 장애물

## 1.1 이 책의 구성

이 책은 두 개의 예제를 사용한다:

1. 중반부까지의 예제) [https://github.com/frontend-testing-book-kr/unittest](https://github.com/frontend-testing-book-kr/unittest)
2. 후반에서 사용하는 예제) [https://github.com/frontend-testing-book-kr/nextjs](https://github.com/frontend-testing-book-kr/nextjs)

### 1.1.1 다양한 테스트 방법

이 책은 JavaScript로 테스트 코드를 작성하는 방법뿐만 아니라 언제, 어떤 테스트를 실시해야 하는지 알아본다. 배워볼 테스트는 다음과 같다:

- **함수 단위 테스트**
    
    프론트 애플리케이션은 여러 함수의 조합으로 만들어진 것이다. 단위 테스트를 통해 신뢰할 수 있는 함수를 하나씩 만드는 것으로 코드에서 발생할 수 있는 문제를 빠르게 발견할 수 있다. 함수마다 단위 테스트를 작성하며 테스트 자동화 방법까지 배워본다
    
- **UI 컴포넌트와 단위 테스트**
    
    가상의 폼을 대상으로 코드를 작성하며 UI 컴포넌트를 테스트하는 방법을 배워본다
    
- **UI 컴포넌트와 통합 테스트**
    
    UI 컴포넌트는 데이터를 화면에 그리는 일 외에도 많은 일을 한다(ex. 입력이 발생하면 비동기 처리를 하고, 비동기 응답이 오면 화면을 갱신하는 등…). 통합 테스트는 이와 같은 외부 요인을 포함한 테스트이다. mock 서버를 통합 테스트에서 활용하는 방법도 배워본다
    
- **UI 컴포넌트와 시각적 회귀 테스트**
    
    CSS가 적용된 출력 결과를 검증하려면 시각적 회귀 테스트(=특정 시점을 기준으로 전후의 차이를 비교하여 예상하지 못한 버그가 발생하는지 검증하는 테스트)가 필요하다. 시각적 회귀 테스트는 UI 컴포넌트 단위로 실행할 때 더욱 세밀한 검증이 가능하다
    
- **E2E 테스트**
    
    헤드리스 브라우저(=GUI가 없는 브라우저)로 E2E 테스트를 하면 실제 애플리케이션에 가까운 테스트가 가능하다. E2E 테스트는 브라우저 고유의 API를 사용하거나 화면 간 테스트가 필요할 때 적합하다. 실제 애플리케이션은 DB, 외부 스토리즈 서버 등에 접속한다. E2E 테스트는 실제 애플리케이션에 가깝게 상황을 재현해 더욱 광범위한 테스트를 실시한다
    

### 1.1.2 라이브러리와 도구

테스트 코드 중 일부는 특정 라이브러리를 알아야 이해할 수 있다. 테스팅 라이브러리로 작성한 테스트 코드는 UI 컴포넌트 라이브러리(ex. React, Vue)가 변경되어도 그대로 사용할 수 있다. 사용할 라이브러리와 도구는 다음과 같다:

- **TypeScript**
- **프론트엔드 라이브러리 및 프레임워크**
    - React
    - Zod: 유효성 검사(validation) 라이브러리
    - React Hook Form
    - Next.js
    - Prisma: DB에 접속하는 객체 관계 매핑 라이브러리
- **테스트 프레임워크 및 도구**
    - Jest: CLI 기반 테스트 프레임 워크 및 테스트 러너(=테스트 실행기)
    - PlayWright: 헤드리스 브라우저를 포함한 테스트 프레임 워크 및 테스트 러너
    - reg-suit: 시각적 회귀 테스트 프레임워크
    - StoryBook: UI 컴포넌트 탐색기

---

## 1.2 테스트를 작성해야 하는 이유

테스트 작성이 왜 필요한지 살펴보자

### 1.2.1 사업의 신뢰성

일례로 BFF는 인증, 인가와 같은 보안 기능을 주로 담당한다. 그리고 이 기능들은 버그가 있을 경우 치명적이다. 테스트 코드를 작성하는 습관을 들이면 버그를 사전에 발견할 수 있다

### 1.2.2 높은 유지 보수성

미리 작성한 테스트 코드가 있다면 이미 구현이 끝난 기능을 리팩토링 할 때, 문제가 생겼는지 반복적으로 확인할 수 있어 안정감을 느끼게 해준다

뿐만 아니라 라이브러리가 업데이트 되며 코드를 수정할 때에도 문제가 생겼는지 미리 확인할 수 있다

### 1.2.3 코드 품질 향상

어떤 구현 코드의 테스트 작성이 어렵다면 해당 코드가 너무 많은 역할을 한다는 신호일 수 있다. 이 경우 일부 책임을 더 작은 부분으로 나눌 수 있는지 재검토해 더 좋은 코드를 작성할 수 있다

예를 들어 렌더링 분기, 유효성 검사, 비동기 처리 등 많은 책임을 가진 UI 컴포넌트가 있다고 가정해보자. 해당 컴포넌트를 테스트하려면 어디서부터 어떻게 테스트를 작성해야할지 결정하기 어렵다. 이럴 때 한 컴포넌트가 하나의 책임만 가지도록 여러 개의 컴포넌트로 분리하면 테스트 작성이 쉬운 것은 물론 구현 코드의 책임을 파악하기도 쉬워진다

테스트 코드는 웹 접근성을 높이는 데에도 기여한다(왜 높이는지 설명하는 부분은 이해하지 못하였다. 추후 웹 접근성 개발이 익숙해질 때 다시 보도록 하자)

### 1.2.4 원활한 협업

테스트 코드는 글로 작성된 문서보다 우수한 사양서다. 각 테스트에는 제목이 있어 테스트할 구현 코드가 어떤 기능을 제공하고, 어떤 방식으로 작동하는지 파악할 수 있다

기술적인 오류뿐만 아니라 사양서대로 구현됐는지 테스트 코드로 확인할 수도 있다. 사양서와 테스트 코드를 비교하며 코드를 확인하면 리뷰어의 부담은 줄어든다

### 1.2.5 회귀 테스트 줄이기

테스트 자동화는 회귀 테스트를 줄이는 최적의 방법이다

모듈이 많아지면 나눠진 모듈을 다시 조합하는 과정에서 모듈간 의존 관계가 생긴다. 이로인해 의존중인 모듈이 변경됐을 때 미치는 영향을 검증하고자 회귀 테스트를 자주 해야한다. 이는 모던 프론트엔드 개발에서도 자주 발생하는 문제이다

이러한 모듈(=UI 컴포넌트)의 조합으로 만들어진 기능의 테스트는 7장에서 자세히 알아볼 것이다

UI 컴포넌트는 기능 뿐만 아니라 시각적 결과물도 제공한다. 시각적 결과물에는 회귀 테스트가 필요하다. 시각적 결과물 테스트는 9장에서 알아볼 것이다

---

## 1.3 테스트 작성의 장벽

(팀내 개발 문화에 관한 내용. 정리 생략)