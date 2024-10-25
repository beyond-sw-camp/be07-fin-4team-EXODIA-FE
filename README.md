# EXODIA

## 📢 프로젝트 개요
사원들이 보다 효율적으로 업무를 수행할 수 있도록 회사 내 자체 웹 기반 HR 솔루션을 개발하는 것을 목표로 합니다.

근태 관리, 실시간 채팅, 문서 결제 및 버전 관리, 공간 및 차량 대여, 내부 게시판 서비스를 통합하여 다양한 업무를 한 플랫폼에서 관리할 수 있도록 합니다.

사용자는 별도의 외부 시스템을 이용하지 않고도 회사 내부의 모든 HR 관련 절차를 처리할 수 있습니다.

## 📝 요구 사항 명세서
<img src="./img/요구사항정의서.png" alt="요구사항정의서" width="1000" height="500"/>

[요구 사항 명세 보기](https://docs.google.com/spreadsheets/d/1VqdbBtMBag14rsCLODUl4LLlspbeZv8nNFEQy_W30PI/edit?gid=0#gid=0)

<br>

## 📝 WBS

[WBS 보기](https://docs.google.com/spreadsheets/d/1VqdbBtMBag14rsCLODUl4LLlspbeZv8nNFEQy_W30PI/edit?gid=1214013363#gid=1214013363)


<br>

## 🧱 ERD
<img src="./img/ERD.png" alt="ERD" width="1000" height="500"/>

[ERD 보기](https://www.erdcloud.com/d/cw7ygowDortnpZa2h)

<br>

## 🎨 화면 설계서

[화면 설계서 보기](https://www.figma.com/design/OACtwz498qgY2KQcehc7JD/POT?node-id=26-30&node-type=canvas&t=VYPzWBg5kbgZ2mF9-0)


<br>

## 📄 API 명세서

[API 명세서](https://docs.google.com/spreadsheets/d/1VqdbBtMBag14rsCLODUl4LLlspbeZv8nNFEQy_W30PI/edit?gid=234323063#gid=234323063)


<br>

## API단위 테스트 결과서(주요기능)

[API 단위 테스트(세부기능)](https://documenter.getpostman.com/view/38441114/2sAXxLDEz5)

<details>
<summary>로그인</summary>

### 일반 로그인

<img src="./img/api테스트/사원로그인.png"/>

### 관리자 로그인

<img src="./img/api테스트/관리자로그인.png"/>

</details>

<details>
<summary>직원 관리</summary>

### 직원 등록

<img src="./img/api테스트/직원등록.png"/>

### 직원 상세 조회

<img src="./img/api테스트/직원상세조회.png"/>

### 직원 정보 수정

<img src="./img/api테스트/직원정보수정.png"/>

### 직원 정보 조회

<img src="./img/api테스트/직원정보조회.png"/>

</details>

<details>
<summary>출/퇴근 관리</summary>

### 출근

<img src="./img/api테스트/출근.png"/>

### 퇴근

<img src="./img/api테스트/퇴근.png"/>

</details>

<details>
<summary>게시판 관리</summary>

### 게시물 작성

<img src="./img/api테스트/게시물작성.png"/>

### 게시판 상단 고정

<img src="./img/api테스트/게시판상단고정.png"/>

### 게시판 세부 조회

<img src="./img/api테스트/게시판세부조회.png"/>

### 게시판 조회

<img src="./img/api테스트/게시판조회.png"/>

</details>

<details>
<summary>댓글 관리</summary>

### 댓글 생성

<img src="./img/api테스트/댓글생성.png"/>

### 댓글 수정

<img src="./img/api테스트/댓글수정.png"/>

</details>

<details>
<summary>문서 관리</summary>

### 문서 등록

<img src="./img/api테스트/문서등록.png"/>

### 문서 업데이트

<img src="./img/api테스트/문서업데이트.png"/>

### 문서 히스토리

<img src="./img/api테스트/문서히스토리.png"/>

### 전체 문서 조회

<img src="./img/api테스트/전체문서조회.png"/>

### 최근 수정 문서

<img src="./img/api테스트/최근수정문서.png"/>

### 최근 열람 문서

<img src="./img/api테스트/최근열람문서.png"/>

</details>

<details>
<summary>결재 관리</summary>

### 결재 생성

<img src="./img/api테스트/결재생성.png"/>

### 결재 승인 및 거절

<img src="./img/api테스트/결재승인거절.png"/>

</details>

<details>
<summary>부서 관리</summary>

### 부서 목록 조회

<img src="./img/api테스트/부서목록조회.png"/>

### 부서 계층 변경

<img src="./img/api테스트/부서계층변경.png"/>

</details>

<details>
<summary>ES 문서 관리</summary>

### ES 문서 검색

<img src="./img/api테스트/es문서검색.png"/>

### ES 인덱싱 생성

<img src="./img/api테스트/es인덱싱생성.png"/>

</details>

<br>

## 🖥️ UI/UX 단위 테스트 결과서

<details>
  
<summary>로그인</summary>

### 로그인

<img src="./img/ui테스트/로그인.gif"/>

</details>

<details>
  
<summary>마이페이지</summary>

### 근태 관리

<img src="./img/ui테스트/근태관리.gif"/>

### 인사 평가

<img src="./img/ui테스트/인사평가.gif"/>

</details>

<details>
  
<summary>파일 관리</summary>

### 파일 등록

<img src="./img/ui테스트/파일등록.gif"/>

### 댓글 작성

<img src="./img/ui테스트/파일댓글작성.gif"/>

### 파일 버전 관리

<img src="./img/ui테스트/파일업데이트.gif"/>

<img src="./img/ui테스트/파일롤백.gif"/>

</details>

<details>
  
<summary>전자 결재</summary>

### 결재 요청

<img src="./img/ui테스트/결재등록.gif"/>

### 결재 승인/반려

<img src="./img/ui테스트/결재승인.gif"/>

</details>

<details>
  
<summary>예약</summary>

### 회의실 예약

<img src="./img/ui테스트/회의실예약.gif"/>

### 법인 차량 예약

<img src="./img/ui테스트/법인차량예약.gif"/>

</details>

<details>
  
<summary>게시판</summary>

### 공지사항

<img src="./img/ui테스트/공지사항.gif"/>

### 질의 응답(Q&A)

<img src="./img/ui테스트/"/>

### 강의 리스트

<img src="./img/ui테스트/강좌생성.gif"/>

</details>

<details>
  
<summary>화상 회의</summary>
  
### TDB

<img src="./img/ui테스트/"/>

</details>

<details>
  
<summary>직원 관리</summary>

### 직원 생성

<img src="./img/ui테스트/직원생성.gif"/>

### 직원 정보 수정

<img src="./img/ui테스트/직원수정.gif"/>

</details>

<details>
  
<summary>급여 관리</summary>
  
### 급여 명세서 조회(세금)

<img src="./img/ui테스트/급여명세서조회.gif"/>

### 급여일 설정

<img src="./img/ui테스트/급여일관리.gif"/>

</details>

<details>
  
<summary>일정 관리</summary>

### 일정 생성

<img src="./img/ui테스트/일정생성.gif"/>

</details>

<details>
  
<summary>부서 관리</summary>

### 부서 계층 조회

<img src="./img/ui테스트/부서조회.gif"/>

### 부서 추가

<img src="./img/ui테스트/부서추가.gif"/>

### 부서 이동

<img src="./img/ui테스트/부서이동.gif"/>

</details>

<details>
  
<summary>채팅</summary>

### 채팅방 생성
<img src="./img/ui테스트/채팅방생성.gif"/>

### 실시간 채팅
<img src="./img/ui테스트/실시간채팅.gif"/>

### 참여자 초대/나가기

<img src="./img/ui테스트/채팅방초대.gif"/>
<img src="./img/ui테스트/채팅방나가기.gif"/>

</details>

<details>

<summary>달력</summary>

### 권한 별 일정 등록

<img src="./img/ui테스트/달력등록.gif"/>

</details>
