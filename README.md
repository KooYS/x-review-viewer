# X Review Viewer

Electron 기반 데스크톱 애플리케이션

## 기술 스택

| 분류 | 기술 |
|------|------|
| Framework | Electron 39 |
| Frontend | React 18, TypeScript |
| Build Tool | Vite (electron-vite) |
| State Management | Zustand |
| Linter/Formatter | Biome |
| Packaging | electron-builder |

## 프로젝트 구조

```
src/
├── main/           # Electron 메인 프로세스
│   └── index.ts
├── preload/        # Preload 스크립트 (IPC 브릿지)
│   ├── index.ts
│   └── index.d.ts
└── renderer/       # React 렌더러
    ├── index.html
    └── src/
        ├── main.tsx
        ├── App.tsx
        ├── components/   # UI 컴포넌트
        ├── pages/        # 페이지 컴포넌트
        ├── stores/       # Zustand 스토어
        ├── hooks/        # 커스텀 훅
        ├── utils/        # 유틸리티 함수
        └── types/        # TypeScript 타입 정의
```

## 설치

```bash
yarn install
```

## 스크립트

### 개발

```bash
yarn dev          # 개발 서버 실행 (HMR 지원)
yarn preview      # 빌드된 앱 미리보기
```

### 빌드

```bash
yarn build        # 프로덕션 빌드
yarn pack:mac     # macOS 앱 패키징 (.dmg, .zip)
yarn pack:win     # Windows 앱 패키징 (.exe)
```

### 코드 품질

```bash
yarn lint         # 코드 검사
yarn lint:fix     # 코드 자동 수정
yarn typecheck    # TypeScript 타입 검사
```

## 빌드 출력

- `out/` - 개발/프로덕션 빌드 결과물
- `release/` - 패키징된 앱 파일 (.dmg, .exe 등)
