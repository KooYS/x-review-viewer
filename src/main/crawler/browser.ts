import type { Browser, BrowserContext, Page } from 'playwright-core'
import { chromium } from 'playwright-core'
import { BROWSER_ARGS, BROWSER_CONTEXT_OPTIONS, USER_AGENT } from './config'

/**
 * 브라우저 인스턴스 생성
 */
export async function createBrowser(): Promise<Browser> {
  return chromium.launch({
    headless: false,
    args: BROWSER_ARGS,
    channel: 'chrome',
  })
}

/**
 * 봇 감지 방지 스크립트
 * - navigator.webdriver 제거
 * - plugins, languages 위장
 */
function getAntiDetectionScript(): () => void {
  return () => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    })

    Object.defineProperty(navigator, 'plugins', {
      get: () => [1, 2, 3, 4, 5],
    })

    Object.defineProperty(navigator, 'languages', {
      get: () => ['ko-KR', 'ko', 'en-US', 'en'],
    })
  }
}

/**
 * 브라우저 컨텍스트 생성
 * - User-Agent 설정
 * - 봇 감지 방지 스크립트 주입
 */
export async function createBrowserContext(browser: Browser): Promise<BrowserContext> {
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    ...BROWSER_CONTEXT_OPTIONS,
  })

  // 봇 감지 방지 스크립트 주입
  await context.addInitScript(getAntiDetectionScript())

  return context
}

/**
 * 새 페이지 생성 및 URL 이동
 */
export async function createPageAndNavigate(context: BrowserContext, url: string): Promise<Page> {
  const page = await context.newPage()
  await page.goto(url)
  return page
}

/**
 * 브라우저 안전하게 종료
 */
export async function closeBrowser(browser: Browser): Promise<void> {
  try {
    await browser.close()
  } catch {
    // 이미 닫혀있어도 무시
  }
}
