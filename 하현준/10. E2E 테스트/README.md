## E2E 테스트란?

브라우저 고유의 API를 사용하는 상황이나 화면을 이동하며 테스트해야 하는 상황에 쓰인다.

### 브라우저 고유 기능과 연동한 UI 테스트

- 화면 간의 이동
- 화면 크기를 측정해서 실행되는 로직
- CSS의 미디어 쿼리를 사용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소 등에 데이터를 저장

### 데이터베이스 및 서브 시스템과 연동한 E2E 테스트

최대한 실제와 유사하게 재현해 검증하는 테스트를 E2E 테스트라고 한다.

E2E 테스트는 표현 계층, 응용 계층, 영속(persistence) 계층을 연동하여 검증하기 때문에 유사성이 높은 테스트, 그러나 실행 시간이 길고 불안정한 단점이 있음

## 플레이라이트란?

https://playwright.dev/

웹 브라우저 기반 E2E 테스트 자동화 도구

![image.png](attachment:e6a6cbd9-7982-497c-8e92-5e6e460068f0:image.png)

### Locators 란?

[Locators](https://playwright.dev/docs/api/class-locator) are the central piece of Playwright's auto-waiting and retry-ability. In a nutshell, locators represent a way to find element(s) on the page at any moment.

로케이터는 언제든지 페이지에서 요소를 찾는 방법을 나타냅니다.

```tsx
await page.getByLabel("User Name").fill("John");
await page.getByLabel("Password").fill("secret-password");
await page.getByRole("button", { name: "Sign in" }).click();
await expect(page.getByText("Welcome, John!")).toBeVisible();
```

### Assertions 란?

Playwright includes test assertions in the form of `expect` function. To make an assertion, call `expect(value)` and choose a matcher that reflects the expectation. **There are many [generic matchers](https://playwright.dev/docs/api/class-genericassertions) like `toEqual`, `toContain`, `toBeTruthy` that can be used to assert any conditions.**

## 로컬에서 E2E 테스트 하기

prisma 데이터를 초기화해야 테스트를 할 수 있음 ..🥹

![image.png](attachment:a8241f6e-52f7-432e-b496-7937f2a0599f:image.png)

## 프리즈마란?

**프리즈마 스키마**

프리즈마 스키마는 엔티티 간 관계를 나타내 데이터베이스를 정의

```tsx
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id             Int    @id @default(autoincrement())
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  name           String
  bio            String
  githubAccount  String
  twitterAccount String
  imageUrl       String
  email          String @unique
  password       String
  posts          Post[]
  likes          Like[]
}

model Post {
  id          Int     @id @default(autoincrement())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  title       String
  description String?
  body        String?
  imageUrl    String?
  published   Boolean @default(false)
  author      User    @relation(fields: [authorId], references: [id])
  authorId    Int
  likes       Like[]
}

model Like {
  id        Int  @id @default(autoincrement())
  createdAt DateTime @default(now())
  user      User @relation(fields: [userId], references: [id])
  userId    Int
  post      Post @relation(fields: [postId], references: [id])
  postId    Int
  authorId  Int
}

```

### 프리즈마 클라이언트

프리즈마 스키마를 기반으로 만들어낸 클라이언트.

타입스크립트와 호환성이 좋아서 정확한 타입추론이 가능

```tsx
import { BadRequestError, InternalServerError } from "@/lib/error";
import { PrismaClient } from "@prisma/client";
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from "@prisma/client/runtime";

export const prisma = new PrismaClient();
if (process.env.NODE_ENV === "development") {
  // MEMO: HMR 対応　https://www.prisma.io/docs/guides/performance-and-optimization/connection-management#prevent-hot-reloading-from-creating-new-instances-of-prismaclient
  (global as any).prisma = prisma;
}

export function handlePrismaError(err: unknown): never {
  if (err instanceof PrismaClientValidationError) {
    throw new BadRequestError();
  }
  if (err instanceof PrismaClientKnownRequestError) {
    throw new BadRequestError();
  }
  if (err instanceof PrismaClientUnknownRequestError) {
    throw new BadRequestError();
  }
  if (err instanceof PrismaClientInitializationError) {
    throw new InternalServerError();
  }
  throw err;
}
```

### 시드 스크립트

시드 스크립트를 실행하여 데이터 베이스의 초기값을 설정한다.

```tsx
import { PrismaClient } from "@prisma/client";
// 각 데이터들 가져오기
import { likes } from "./like";
import { posts } from "./post";
import { users } from "./user";

export const prisma = new PrismaClient();

const main = async () => {
  console.log(`Start seeding ...`);
  // 해당 데이터들을 넣어줌
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
```

## E2E 테스트 코드 작성하기

테스트 코드는 실제 코드를 보는게 더 좋을 듯하여 따로 작성하지 않았고, 거기에 사용되는 메소드가 무엇인지 적었습니다.

**`injectAxe`**

This will inject the axe-core® runtime into the page under test. You must run this after a call to **page.goto()** and before you run the **checkA11y** command.

axe-core를 사용하기 위해 실행시켜줘야 하는 함수

**`checkA11y`**

This will run axe against the document at the point in which it is called. This means you can call this after interacting with your page and uncover accessibility issues introduced as a result of rendering in response to user actions.

접근성을 테스트하는데 사용되는 메소드

## 불안정한 테스트 대처 방법

- 실행할 때마다 데이터베이스 재설정하기
  - 테스트 시점에 상태는 동일해야 한다.
- 테스트마다 사용자를 새로 만들기
  - 테스트를 위해 기존 사용자 정보를 변경하면 안 된다.
- 테스트 간 리소스가 경합하지 않도록 주의하기
  - 테스트 실행 순서가 보장되지 않기 때문에 리소스 경합이 되지 않도록 해야 한다.
- 빌드한 애플리케이션 서버로 테스트하기
- 비동기 처리 대기하기
- —debug로 테스트 실패 원인 조사하기
- CI 환경과 CPU 코어 수 맞추기
- 테스트 범위 최적화
