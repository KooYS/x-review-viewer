/**
 * ============================================================================
 * Electron 메인 프로세스 (Main Process)
 * ============================================================================
 *
 * Electron 앱은 크게 2가지 프로세스로 구성됩니다:
 *
 * 1. 메인 프로세스 (Main Process) - 이 파일
 *    - Node.js 환경에서 실행됨
 *    - 앱의 생명주기 관리 (시작, 종료 등)
 *    - 네이티브 OS 기능 접근 (파일 시스템, 메뉴, 알림 등)
 *    - BrowserWindow 생성 및 관리
 *    - 렌더러 프로세스와 IPC 통신
 *
 * 2. 렌더러 프로세스 (Renderer Process) - src/renderer 폴더
 *    - 브라우저 환경에서 실행됨 (Chromium)
 *    - React/Vue 등 프론트엔드 코드 실행
 *    - 사용자 인터페이스 담당
 *
 * [실행 순서]
 * 1. 앱 시작 → app.whenReady() 호출
 * 2. createWindow()로 BrowserWindow 생성
 * 3. preload 스크립트 로드 (보안 브릿지 역할)
 * 4. 렌더러 프로세스에서 HTML/React 로드
 * 5. IPC를 통해 메인-렌더러 간 통신
 */

import { join } from 'node:path'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { BrowserWindow, app, ipcMain, shell } from 'electron'
import { runCrawler } from './crawler/index'

/**
 * ============================================================================
 * [1단계] BrowserWindow 생성 함수
 * ============================================================================
 *
 * BrowserWindow는 앱의 창(Window)을 나타냅니다.
 * 하나의 앱에서 여러 개의 창을 생성할 수 있습니다.
 */
function createWindow(): BrowserWindow {
  // 새로운 브라우저 창 생성
  const mainWindow = new BrowserWindow({
    width: 1200, // 창 너비 (픽셀)
    height: 800, // 창 높이 (픽셀)
    show: false, // 처음에는 숨김 (ready-to-show 이벤트에서 보여줌)
    autoHideMenuBar: true, // 메뉴바 자동 숨김

    /**
     * webPreferences: 렌더러 프로세스의 보안 및 기능 설정
     */
    webPreferences: {
      /**
       * preload: 렌더러가 로드되기 전에 실행되는 스크립트
       * - 메인 프로세스와 렌더러 프로세스 사이의 "다리" 역할
       * - 렌더러에서 사용할 안전한 API를 노출함
       * - Node.js API에 접근 가능하지만, 렌더러에는 제한적으로 노출
       */
      preload: join(__dirname, '../preload/index.js'),

      /**
       * contextIsolation: 컨텍스트 격리 (보안상 매우 중요!)
       * - true: preload 스크립트와 렌더러의 JavaScript 컨텍스트를 분리
       * - 렌더러에서 Node.js API에 직접 접근 불가 (보안 강화)
       * - contextBridge를 통해서만 안전하게 API 노출
       */
      contextIsolation: true,

      /**
       * sandbox: 샌드박스 모드 (추가 보안)
       * - true: 렌더러 프로세스를 샌드박스 환경에서 실행
       * - 악성 코드가 시스템에 접근하는 것을 방지
       */
      sandbox: true,
    },
  })

  /**
   * ready-to-show 이벤트
   * - 창의 콘텐츠가 완전히 로드된 후 발생
   * - 이때 창을 보여주면 빈 화면(깜빡임)을 방지할 수 있음
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  /**
   * 외부 링크 처리
   * - 렌더러에서 <a href="..."> 클릭 시 새 창이 열리는 것을 방지
   * - 대신 시스템 기본 브라우저에서 열림
   */
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url) // 시스템 기본 브라우저로 열기
    return { action: 'deny' } // Electron 내에서 새 창 열기 거부
  })

  /**
   * 렌더러 콘텐츠 로드
   * - 개발 모드: Vite 개발 서버 URL 사용 (HMR 지원)
   * - 프로덕션: 빌드된 HTML 파일 로드
   */
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    // 개발 모드: http://localhost:5173 같은 개발 서버에서 로드
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    // 프로덕션: 빌드된 index.html 파일 로드
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

/**
 * ============================================================================
 * [2단계] 앱 초기화 - app.whenReady()
 * ============================================================================
 *
 * app.whenReady()는 Electron이 초기화를 완료하고
 * BrowserWindow를 생성할 준비가 되었을 때 resolve되는 Promise입니다.
 *
 * 이것이 앱의 실질적인 시작점입니다!
 */
app.whenReady().then(() => {
  // Windows 작업표시줄/시작메뉴에서 앱을 식별하는 ID 설정
  electronApp.setAppUserModelId('com.example.x-review-viewer')

  /**
   * 새 창이 생성될 때마다 실행
   * - optimizer.watchWindowShortcuts: 개발 모드에서 단축키 최적화
   *   (예: F12로 DevTools 열기)
   */
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 메인 윈도우 생성!
  createWindow()

  /**
   * macOS 전용: 앱 활성화 이벤트
   * - macOS에서는 Dock 아이콘 클릭 시 창이 없으면 새로 생성해야 함
   * - Windows/Linux에서는 창을 모두 닫으면 앱이 종료됨
   */
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

/**
 * ============================================================================
 * [3단계] 앱 종료 처리 - window-all-closed
 * ============================================================================
 *
 * 모든 창이 닫혔을 때 발생하는 이벤트
 * - Windows/Linux: 앱 종료
 * - macOS: 앱은 계속 실행 (Dock에 남아있음) - macOS 관례
 */
app.on('window-all-closed', () => {
  // darwin = macOS
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * ============================================================================
 * [4단계] IPC 통신 (Inter-Process Communication)
 * ============================================================================
 *
 * 렌더러 프로세스와 메인 프로세스는 서로 다른 프로세스이므로
 * 직접 함수를 호출할 수 없습니다. 대신 IPC를 사용합니다.
 *
 * IPC 통신 방식:
 *
 * 1. ipcMain.handle() / ipcRenderer.invoke()
 *    - 양방향 통신 (요청-응답)
 *    - 렌더러가 요청 → 메인이 처리 → 결과 반환
 *    - Promise 기반으로 async/await 사용 가능
 *
 * 2. ipcMain.on() / ipcRenderer.send()
 *    - 단방향 통신 (렌더러 → 메인)
 *    - 응답이 필요 없는 경우 사용
 *
 * 3. mainWindow.webContents.send() / ipcRenderer.on()
 *    - 단방향 통신 (메인 → 렌더러)
 *    - 메인에서 렌더러로 이벤트 푸시
 *
 * [통신 흐름 예시 - 크롤링]
 *
 *   렌더러 (React)                    메인 (Node.js)
 *        │                                │
 *        │ invoke('start-crawling')       │
 *        │ ─────────────────────────────► │
 *        │                                │ runCrawler() 실행
 *        │                                │
 *        │      send('crawler-log')       │
 *        │ ◄───────────────────────────── │ 로그 전송
 *        │                                │
 *        │      send('crawler-status')    │
 *        │ ◄───────────────────────────── │ 상태 전송
 *        │                                │
 *        │      return { success: true }  │
 *        │ ◄───────────────────────────── │ 최종 결과 반환
 *        │                                │
 */

// 크롤링 시작 핸들러
ipcMain.handle(
  'start-crawling', // 채널 이름 (렌더러에서 이 이름으로 호출)
  async (_event, { hashtag, tweetCount }: { hashtag: string; tweetCount: number }) => {
    // 현재 열려있는 첫 번째 윈도우 가져오기
    const mainWindow = BrowserWindow.getAllWindows()[0]

    try {
      // 크롤러 실행
      const result = await runCrawler(
        hashtag,
        tweetCount,
        // 로그 콜백: 크롤링 중 로그를 렌더러로 전송
        (log: string) => {
          if (mainWindow) {
            // 메인 → 렌더러로 메시지 전송
            mainWindow.webContents.send('crawler-log', log)
          }
        },
        // 상태 콜백: 크롤링 상태를 렌더러로 전송
        (status: string) => {
          if (mainWindow) {
            mainWindow.webContents.send('crawler-status', status)
          }
        }
      )

      // invoke의 결과로 반환 (렌더러에서 await로 받음)
      return { success: result.success, message: result.success ? '크롤링 완료!' : '크롤링 실패' }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Crawler error:', errorMessage)
      return { success: false, message: errorMessage }
    }
  }
)
