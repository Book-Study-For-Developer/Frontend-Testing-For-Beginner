### 테스트를 작성해야 하는 이유

> 일반적으로 안 좋은 일이 벌어질 확률은 ‘또는’ 조건으로 연결되어 있을 때 더 높아집니다. 앞에서도 이야기했지만, ‘또는’ 조건은 하나라도 문제가 생기면 전체에 문제가 생기는 상황입니다. 한 사람이라도 실수하면 전체 조직에 구멍이 뚫리는 거죠.
>
> 반대로 ‘그리고’ 조건은 모든 변수에 문제가 생겨야 전체에 문제가 되는 상황이고, 이 경우 전체에 문제가 생길 확률은 기하급수적으로 낮아집니다. 모든 사람이 실수해야지만 구멍이 뚫리는 경우입니다.
>
> 결과적으로, 애자일은 서로의 업무를 공유하고 상호 검토하는 협력을 통해 불행한 일을 ‘또는’ 조건에서 ‘그리고’ 조건으로 바꾸게 합니다.
>
> _-_ _함께 자라기, 김창준_

- 사업의 신뢰성 → 버그를 조기에 발견 → 서비스 이미지를 지켜주는 역할
- 높은 유지보수성 → 기존 기능에 문제가 생겼는지 테스트 코드로 반복적 확인 → 적극적 리팩터링 가능
- 코드 품질 향상 → 지속적으로 구현 코드 반추 가능 → 단 하나의 책임만! + 웹 접근성 확보
- 원활한 협업 → 테스트 코드는 글로 작성된 문서보다 우수한 사양서 → 리뷰어의 부담 감소
- 회귀 테스트 줄이기 → 테스트 자동화는 회귀 테스트를 줄이는 최적의 방법

### 테스트 작성의 장벽

- 어려운 테스트 방법 → 샘플 코드 참고하기
- 테스트 작성 시간의 부족 → 습관적으로 작성한 테스트 코드는 오히려 개발 속도를 높여준다!
- 테스트를 작성하면 시간이 절약되는 이유 → 장기적으로 봤을 때 시간을 절약해주는 도구
- 팀원들을 설득하는 방법
  - _다음부터 테스트를 작성하자_ → 어찌보면 결국 해야하는 일을 미루는 것
  - 되도록이면 프로젝트 초기 단계에서 테스트를 도입하는 게 테스트 코드 문화 정착 가능성이 높다.
