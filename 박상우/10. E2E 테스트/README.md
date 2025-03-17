## 🟢 E2E 테스트란?

- 브라우저를 활용할 수 있기 때문에 실제 애플리케이션에 가까운 테스트가 가능
    
    → 브라우저 고유 API를 사용하는 상황이나 화면을 이동하며 테스트하는 경우 적합
    
- E2E 테스트에서는 브라우저 고유 기능이나 데이터베이스 및 하위 기능과 연동된 상황을 모두 포함하기 때문에 테스트의 목적을 정확하게 세우는 것이 중요
    
    → 하위 시스템들을 포함한 전체 구조에서 얼마나 유사한 상황을 재연할 것인지가 중요
    

### 💡 브라우저 고유 기능과 연동한 UI 테스트

- 화면 간의 이동
- 화면 크기를 측정해서 실행되는 로직
- CSS의 미디어 쿼리를 사용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소 등에 데이터를 저장

jsdom으로는 브라우저의 고유 기능을 활용할 수 없기 때문에, 브라우저 실제 상황과 유사하게 테스트하기 위해서 브라우저 고유 기능과 인터렉션이 가능한 UI 테스트를 수행 ( 피처 테스트 )

### 💡 데이터 베이스 및 서브 시스템과 연동한 E2E 테스트

E2E 테스트에서는 아래와 같이 실제와 유사하게 재현해 검증하는 기능을 제공

- 데이터베이스 서버와 연동하여 데이터 요칭 및 저장
- 외부 저장소 서비스와 연동하여 이미지 업로드
- 레디스와 연동하여 세션 관리

이러처럼 E2E 테스트는 표현 계층, 응용 계층, 영속 계층을 연동해서 실제 상황과 유사성이 높다는 장점이 있지만 그만큼 많은 시스템과의 연동으로 인해 실행 시간이 길고, 불안정 하다는 단점이 있다.

<br />

## 🟢 처음 시작하는 E2E 테스트

### 💡 [로케이터(locator)](https://playwright.dev/docs/locators)

현재 페이지의 특정 요소를 가져오는 핵심 API. 플레이 라이트에서도 정보에 동등하게 접근 가능할 수 있도록 접근성 기반 로케이터를 우선적으로 사용하는 것을 권장한다.

```tsx
// 연관된 레이블의 텍스트로 요소 찾기
await page.getByLabel('User Name').fill('john');
await page.getByLabel('Password').fill('secret-password');

//  명시적 및 암시적 접근성 속성을 기준으로 요소 찾기
await page.gegByRole('button', { name : 'Sign in'}).click();
```

### 💡 단언문

expect에 로케이터나 페이지를 넣어 검증에 필요한 매처를 함께 작성

```tsx
import { expect } from '@playwright/test';

test("Locator를 사용한 단언문 작성법", async ({ page }) => {
	// 특정 문자열이 포함된 요소가 화면에 보이는지 검증
	await expect(page.getByText('Welcome, John!')).toBeVisible();
	// 체크 박스 요소가 체크되었는지 검증
	await expect(page.getByRole("checkbox")).toBeChecked();
	// not으로 진릿값을 반전해서 검증
	await expect(page.getByRole("heading")).not.toContainText('some text');
});

test("페이지를 사용한 단언문 작성법", async ({ page }) => {
	// 페이지 URL에 'intro'가 포함되었는지 검증
	await expect(page).toHaveURL(/.*intro/);
	
	// 페이지 제목에 'Playwright'가 포함되었는지 검증
	await expect(page).toHaveTitle(/Playwright/);
})
```

## 🟢 개발 환경에서 E2E 테스트 실행하기

### 💡 E2E 테스트 설정

```tsx
// 빌드된 프로젝트 실행
npm run build && npm start

// 데이터베이스 테스트 데이터 초기화
// E2E 테스트 시에 데이터가 변경되어 테스트에 영향을 줄 수 있기 때문에 테스트 실행시에 해당 커맨드 활용
npm run prisma:reset
```

### 💡 E2E 테스트 실행

```tsx
// E2E 테스트 실행 ( cli로 결과 확인 )
npx playwright test

// 테스트 리포트 확인 ( http://localhost:9223/ )
npx playwright show-report

// 특정 파일만 테스트 실행
npx playwirght test Login.spec.ts
```

### 💡 플레이라이트 검사 도구를 활용한 디버깅

```tsx
npx playwright test Login.spec.ts --debug
```

`--debug` 옵션을 통해 테스트를 실행하면 아래와 같이 브라우저와 플레이라이트 검사 도구 실행

<img width="1000" alt="image" src="https://github.com/user-attachments/assets/91d064d3-4f56-4384-adb8-dd4250f8c840" />

검사 도구를 실행하면서 UI가 어떻게 조작되는지 확인 가능. 플레이라이트 검사 도구의 상단 녹색 화살표나 화살표 아이콘(스탭 오버)을 통해서 테스트 실행 가능.

### 💡 도커 컴포즈를 사용하는 E2E 테스트

도커 컴포즈를 사용해서 E2E를 실행할 때는 아래의 커맨드를 입력하여 실행

```tsx
npm run docker:e2e:build && npm run docker:e2e:ci
```

<br/>

## 🟢 프리즈마를 활용한 테스트

### 💡 프리즈마 스키마 ( Prisma Schema )

- 프리즈마는 프리즈마 스키마라는 엔티티 간의 관계를 나타내는 도메인 특화 언어를 통해 데이터베이스를 정의.
- 스키마 파일이 마이그레이션 스크립트로 변환되는 동시에 프리즈마 클라이언트가 실행
    
    → 프리즈마 클라이언트는 애플리케이션 코드에서 데이터베이스에 쿼리를 날리는 클라이언트를 의미
    
    → 프리즈마 클라이언트를 사용할때는 인스턴스화 한 상태에서 export 하여 사용한다.
    
    ```tsx
    import { PrismaClient } from '@prisma/client'
    
    export const prisma = new PrismaClient();
    ```
    
    → 프리즈마는 프리스마 스키마에 정의로 타입스크립트 타입으로 변환이 가능하기 때문에 호환성이 좋다.
    
    → 
    

### 💡 시드 스크립트 등록

`package.json` 에 시드 스크립트를 적용할 커맨드를 작성. 해당 커멘드를 통해 트랜스파일링을 하지 않고 ts-node를 통해 시드 스크립트를 실행할 수 있음.

```json
// package.json
{
	"prisma" : {
		"seed" : "ts-node --compiler-options {\"modul\":\"CommonJS\"} prisma/seed/index.ts"
	}
}
```

매번 E2E 테스트 이전에 `npm run prisma:reset` 을 통해 DB를 초기화 해주어야하는데, 이때 등록한 시드 스크립트가 실행된다.

### 💡 시드 스크립트 실행 파일

```tsx
// seed/index.ts
const main = async () => {
  console.log(`Start seeding ...`);
  // 초기데이터를 일괄적으로 추가
  // 각 데이터는
  await prisma.$transaction([...users(), ...posts(), ...likes()]);
  console.log(`Seeding finished.`);
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

// seed/Likes.ts
// 각 시드 데이터는 하드 코딩 된 데이터나 스트립트 또는 CSV등을 활용하여 주입할 수 있음
import { likesFixture } from "../fixtures/like";

export const likes = () => {
  const likes: PrismaPromise<Like>[] = [];
  for (const data of likesFixture()) {
    const like = prisma.like.create({ data });
    likes.push(like);
  }
  return likes;
};
```
<br/>

## 🟢 불안정한 테스트 대처 방법
- 실패할 때 마다 데이터 베이스 재설정하기
- 테스트마다 사용자를 새로 만들기
- 테스트 간 리소스가 경합하지 않도록 주의하기
- 빌드한 애플리케이션 서버로 테스트하기
- 비동기 처리 대기하기
- `--debug`로 테스트 실패 원인 조사하기
- CI 환경과 CPU 코어 수 맞추기
- 테스트 범위 최적화

<br/>

## 🧐 얻고 싶은 걸 얻었을까?

1주차에 책을 읽기 전 테스트 코드에 대한 모호한 점과 스터디에서 얻고 싶은 부분들을 먼저 생각해보았었다.

1. 테스트 코드에 대한 확신이 없음.
2. 테스트 코드 작성에 시간이 너무 많이 걸림.
3. 테스트 코드 작성에 대한 목적이 희미해짐.

이런 점들을 꼽았었는데, 그때에 비해 지금은 각 부분들을 어떻게 생각하고 있는지 돌아보았다.

1. 테스트 코드에 대한 확신이 없음  
   -> 이 부분에 대해서는 가장 기억에 남는 책 내용은 다른 코드를을 공부한 것 처럼 다른 사람들이 작성한 테스트 코드를 많이 보는 것이 도움이 많이 된다는 부분이었다. 그런 의미에서 인지 책에 다양한 테스트 케이스들을 접할 수 있었다. 이번에는 예제만 따라가보았지만 앞으로 직접 테스트 코드를 작성하게 될때 이 책의 필요한 부분들을 다시 보게 되지 않을까 싶다.
2. 테스트 코드 작성에 시간이 많이 걸림
3. -> 우선 절대적인 테스트 코드 작성 시간이 부족해서 이렇게 느끼는 것 같다. 앞으로 실제 테스트 코드를 작성해보면서 점차 익숙해지는 시간이 필요한 것 같다.
4. 테스트 코드 작성에 대한 목적이 희미해짐  
   -> 목적이 희미해진다는 느낌을 받은 이유가 작성하기 전에 어떤 부분을 어떻게 테스트 할 것인지 제대로 생각하지 않고, 최대한 모든 테스트 케이스를 하려고 했던 것 같다. 책에서도 테스트의 목적, 대상에 따라 테스트 방식이 달라진다는 점을 언급한 만큼 사전 작업이 중요하다는 생각을 했다.

예제 코드 위주로만 실습해서 실제 프로젝트나 실무에 적용했을 때 또 다른 느낌일 수 있겠지만,
6주간 테스트 코드 책을 읽으면서 이전보다 테스트 코드를 어떻게 짜야겠다는 막연함을 없어진 것 같다.
