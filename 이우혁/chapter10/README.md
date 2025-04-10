### E2E 테스트

- 브라우저 고유 기능과 연동된 UI 테스트

- 데이터베이스 및 하위 시스템과 연동된 E2E 테스트

E2E 테스트에서는 위 시스템들을 포함한 전체 구조에서 얼마나 실제와 유사한 상황을 재현할 것인지가 중요한 기준점이 된다.

### 브라우저 고유 기능과 연동한 UI 테스트

웹 애플리케이션은 브라우저 고유 기능을 사용한다. 아래와 같은 상황들은 `jsdom`에서 제대로 된 테스트를 할 수 없다.

- 화면 간의 이동

- 화면 크기를 측정해서 실행되는 로직
- CSS 미디어쿼리를 활용한 반응형 처리
- 스크롤 위치에 따른 이벤트 발생
- 쿠키나 로컬 저장소 등에 데이터를 저장

UI 테스트(피처 테스트)

- 브라우저로 실제 상황과 최대한 유사하게 테스트

### 데이터베이스 및 서브 시스템과 연동한 E2E 테스트

E2E 테스트 프레임워크는 UI 자동화 기능으로 실제 애플리케이션을 브라우저 너머에서 조작한다.

- DB 서버와 연동하여 데이터를 불러오거나 저장한다.

- 외부 저장소 서비스와 연동하여 이미지 등을 업로드한다.
- 레디스와 연동하여 세션을 관리한다.

E2E 테스트는 표현, 응용, 영속 계층을 연동하여 검증하므로 실제 상황과 유사성이 높은 테스트로 자리매김했다.

반대로 많은 시스템과 연동하기 때문에 실행시간이 길고 불안정하다.

### 플레이라이트

마이크로소프트가 공개한 E2E 테스트 프레임워크이다.

크로스 브라우징을 지원하며 `디버깅 테스트`, `리포터`, `트레이스 뷰어`, `테스트 코드 생성기` 등 다양한 기능이 있다.

### 로케이터

플레이라이트의 핵심 API이며 현재 페이지에서 특정 요소를 가져온다.

플레이라이트도 테스팅 라이브러리의 쿼리와 마찬가지로 신체적, 정신적 특성에 따른 차이 없이 동등하게 정보에 접근할 수 있도록 접근성 기반 로케이터를 우선적으로 사용하는 것을 권장한다.

**차이점**

- 대기 시간이 필요한지에 따라 `findByRole` 등을 구분해서 사용하지 않아도 된다는 것이다.

- 인터랙션은 비동기 함수이기 때문에 `await` 로 인터랙션이 완료될 때까지 기다린 후 다음 인터랙션을 실행하는 방식으로 작동한다.

### 플레이라이트 검사 도구를 활용한 디버깅

E2E 테스트를 작성하다 보면 생각한 것과 다르게 테스트가 통과되지 않을 때가 있다.

이럴 때 `플레이라이트 검사 도구` 로 원인을 파악해야 한다.

테스트를 실행하는 커맨드에 `--debug` 옵션을 붙이면 `headed` 모드로 테스트가 시작된다.

- `headed` 모드: 브라우저를 열어서 육안으로 자동화된 UI 테스트를 확인할 수 있는 모드

### 불안정한 테스트 대처 방법

- `실행할 때 마다 데이터베이스 재설정하기`: 일관성있는 결과를 얻으려면 테스트 시작 시점의 상태를 항상 동일해야 한다.

- `테스트마다 사용자를 새로 만들기`: 테스트에서는 각 테스트를 위해 생성한 사용자를 사용해야 하고 테스트 후에는 테스트용 사용자를 삭제해야 한다.
- `테스트 간 리소스가 경합하지 않도록 주의하기` : 각 테스트에서 매번 새로운 리소스를 작성하도록 해야 한다.
- `빌드한 애플리케이션 서버로 테스트하기` : 빌드한 Next.js 애플리케이션은 개발 서버와 다르게 작동하기 때문에 빌드한 결과물을 테스트해야 한다.
- `비동기 처리 대기하기` : 만약 조작할 요소가 존재하고 문제없이 인터랙션이 할당됐음에도 테스트가 실패한다면 비동기 처리를 제대로 대기하는 확인해야 한다.
- `--debug 로 테스트 실패 원인 조사하기` : 플레이라이트는 실행할 때 `--debug` 옵션을 붙이면 디버거를 실행할 수 있다. 직접 디버거에서 한 줄씩 작동을 확인하면 테스트가 실패하는 원인을 빠르게 찾을 수 있다.
- `CI 환경과 CPU 코어 수 맞추기` : 플레이라이트는 제스트는 코어 수를 명시적으로 지정하지 않으면 실행 환경에서 실행 가능한 만큼 테스트 스위트를 병렬 처리한다. 따라서 병렬 처리되는 숫자는 실행 환경의 CPU 코어 수 때문에 변동된다.
