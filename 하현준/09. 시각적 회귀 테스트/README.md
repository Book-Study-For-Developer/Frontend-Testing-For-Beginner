## 시각적 회귀 테스트의 필요성

### 스타일 변경 검증의 어려움

CSS는 Cascading Style Sheet 로 말그대로 상위 요소의 스타일을 자손 요소에 상속시키는 구조이다.

그렇기 때문에 전역에 정의된 스타일에 따라 영향을 받기가 쉽다.

리액트로 개발하면 컴포넌트 기반 개발을 하고, 이 컴포넌트가 공통으로 사용되고 수정에 따라서 사용하고 있는 쪽에도 영향을 끼칠 수 있다.

→ 물론 module.scss를 사용하면 영향도가 적다.

### 시각적 회귀 테스트의 선택지

가장 신뢰도 높은 테스트 방법은 실제 브라우저에 렌더링 된 화면을 비교하는 것이고 이를 확인하는 방법을 시각적 회귀 테스트라고 한다. 스타일 변경 전후의 차이점을 캡처를 통해 비교할 수 있다.

ex)

Header 컴포넌트의 여백이 변경되고 하단 Content 컴포넌트는 그대로라면 **헤더의 여백이 커짐에 따라서 Content도 같이 변경되었다고 인지**하게 된다.

그래서 세세한 변경사항을 검증하기 위해서는 컴포넌트 단위로 시각적 회귀 테스트를 하는 것이 영향도를 최소화할 수 있다.

## reg-cli로 이미지 비교하기

시각적 회귀 테스트 프레임워크 `reg-suit`를 사용하여 비교한다.

---

`reg-suit`가 무슨 역할을 하는지 살펴보았다.

**주요 기능:**

1. **이미지 비교 (Compare Images)**

- reg-suit는 스냅샷 테스트에서 영감을 받아 현재 이미지와 이전 이미지를 비교합니다.
- 차이점을 보여주는 HTML 리포트를 생성합니다.
- 사용자는 비교할 이미지만 제공하면 됩니다.

2. **스냅샷 저장 (Store Snapshots)**

- reg-suit는 스냅샷 이미지를 자동으로 클라우드 스토리지(AWS S3, Google Cloud Storage 등)에 저장합니다.
- 언제든지 비교 결과와 차이를 확인할 수 있습니다.

3. **어디서든 작동 (Work Everywhere)**

- reg-suit는 CLI 도구이므로 프로젝트에 쉽게 통합할 수 있습니다.
- 모든 CI/CD 서비스 및 로컬 환경에서도 실행할 수 있습니다.

https://github.com/reg-viz/reg-puppeteer-demo

여기서 데모 페이지를 확인할 수 있다.

✋ 보고 든 생각

그럼 비교할 이미지를 매번 제공해야하는데 이렇게 할바엔 디자인 QA를 하는게 더 효율적인 방법이 아닐까 한다.

## 스토리캡 도입

[`storycap`](https://www.npmjs.com/package/storycap) 이란?

> Storycap crawls your Storybook and takes screenshot images. It is primarily responsible for image generation necessary for Visual Testing such as [**reg-suit**](https://github.com/reg-viz/reg-suit).

Storycap은 스토리북을 크롤링하고 스크린샷 이미지를 찍습니다. `reg-suit`와 같은 시각적 테스트에 필요한 이미지 생성을 주로 담당합니다.

>

쉽게 말하면, 스토리북에 있는 스크린샷들로 테스트하는 것이다.

## reg-suit 와 같이 사용하기

위에서 말했듯이 결국 비교할 이미지가 있어야 테스트가 가능한 것인데, 이를 스토리북과 함께 사용하면 효율적인 방법이 되는 것이다.

**진행 흐름**

- 저장소에 푸시 → 스토리북 빌드 → 스토리북 캡처 → 비교할 이미지 가져오기(S3에서 가져오기) → 이미지 비교→ 새로 캡쳐한 이미지 (S3에 업로드) → 커밋 해시를 이름으로 새로 캡쳐한 이미지 저장

→ 이미지는 https://www.npmjs.com/package/reg-suit 에 있다.

![image](https://github.com/user-attachments/assets/24bc4e2a-d760-4049-af9e-55f1f56e4e68)

reg-suit와 연동하면 다음과 같이 파일이 생성된다.

```json
{
  "core": {
    // Reg-Suit가 내부적으로 사용할 작업 디렉터리
    "workingDir": ".reg",
    // 실제 테스트 스크린샷이 저장될 디렉터리
    "actualDir": "__screenshots__",
    // 허용 가능한 이미지 차이 임계값(3%)
    "thresholdRate": 0.03,
    // 자동으로 .gitignore에 Reg-Suit 관련 파일을 추가
    "addIgnore": true,
    "ximgdiff": {
      // 이미지 비교(diff) 처리를 클라이언트에서 실행
      "invocationType": "client"
    }
  },
  "plugins": {
    // - Git 커밋 해시 기반으로 스냅샷을 관리하는 플러그인
    // - 설정 값이 {}인 것은 기본 옵션을 사용한다는 의미
    "reg-keygen-git-hash-plugin": {},
    "reg-notify-github-plugin": {
      // PR에 시각적 변경 사항을 코멘트로 남김
      "prComment": true,
      // 기본적인 PR 코멘트 스타일 사용
      "prCommentBehavior": "default",
      // 환경 변수 $REG_NOTIFY_CLIENT_ID를 사용하여 GitHub 인증
      "clientId": "$REG_NOTIFY_CLIENT_ID"
    },
    // AWS S3에 회귀 테스트 결과를 업로드하는 플러그인
    "reg-publish-s3-plugin": {
      //  **"$AWS_BUCKET_NAME"** → 환경 변수 $AWS_BUCKET_NAME에서 S3 버킷 이름을 가져옴
      "bucketName": "$AWS_BUCKET_NAME"
    }
  }
}
```

## 책에서 설명하는 시각적 회귀 테스트의 활용

- 반응형 디자인에 활용하기
  - 디자인의 실수를 줄일 수 있다.
- 릴리스 직전의 리팩터링에 활용하기
  - 레거시 코드를 리팩토링 할 때 전역 CSS로 인해 영향 받는 부분을 시각적 회귀 테스트를 통해 영향도 파악이 가능하다.
- 스토리 커밋 습관화로 시작하는 시각적 회귀 테스트
  - 등록된 스토리만큼 세밀한 검증이 가능하다.

🤔 저자가 말하는 것들에 사실 크게 의미가 있는지 모르겠다.
