/**
 * Twitter/X 크롤러 메인 모듈
 *
 * 사용법:
 * import { runCrawler } from './crawler'
 * const result = await runCrawler('#해시태그', 50, logCallback, statusCallback)
 */

import { closeBrowser, createBrowser, createBrowserContext, createPageAndNavigate } from './browser'
import { CONFIG } from './config'
import { scrollAndCaptureTweets } from './tweet-extractor'
import type { CrawlerResult, LogCallback, StatusCallback, TweetData } from './types'
import { buildSearchUrl, formatHashtag, getRandomDelay, sleep } from './utils'

// 타입 re-export
export type { TweetData, CrawlerResult, LogCallback, StatusCallback }

/**
 * 로그인 대기
 * - 사용자가 수동으로 로그인할 때까지 대기
 * - 트윗이 보이면 로그인 성공으로 판단
 */
async function waitForLogin(
  page: Awaited<ReturnType<typeof createPageAndNavigate>>,
  searchUrl: string,
  logCallback?: LogCallback
): Promise<boolean> {
  const maxWaitSeconds = CONFIG.LOGIN_TIMEOUT / 1000
  const checkInterval = 10
  let elapsed = 0

  while (elapsed < maxWaitSeconds) {
    try {
      await page.waitForSelector('article[data-testid="tweet"]', {
        timeout: checkInterval * 1000,
      })
      // 로그인 성공 후 검색 페이지로 다시 이동
      await page.goto(searchUrl)
      return true
    } catch {
      elapsed += checkInterval
      const remaining = maxWaitSeconds - elapsed
      if (remaining > 0) {
        const minutes = Math.floor(remaining / 60)
        const seconds = Math.floor(remaining % 60)
        logCallback?.(`남은 시간: ${minutes}분 ${seconds}초`)
      }
    }
  }

  return false
}

/**
 * 웹훅으로 데이터 전송
 */
async function sendToWebhook(searchQuery: string, data: TweetData[]): Promise<void> {
  const payload = { searchQuery, data }

  const response = await fetch(CONFIG.WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`웹훅 전송 실패: ${response.statusText}`)
  }
}

/**
 * 메인 크롤러 함수
 *
 * @param hashtag - 검색할 해시태그
 * @param tweetCount - 수집할 트윗 수
 * @param logCallback - 로그 콜백 (선택)
 * @param statusCallback - 상태 콜백 (선택)
 * @returns 크롤링 결과
 */
export async function runCrawler(
  hashtag: string,
  tweetCount: number,
  logCallback?: LogCallback,
  statusCallback?: StatusCallback
): Promise<CrawlerResult> {
  // 1. 해시태그 포맷 처리
  const { formatted, encoded } = formatHashtag(hashtag)
  const searchUrl = buildSearchUrl(encoded)

  logCallback?.(`검색어: ${formatted}`)
  logCallback?.(`목표 수집량: ${tweetCount}개`)

  // 2. 브라우저 시작
  statusCallback?.('브라우저 시작 중...')
  const browser = await createBrowser()

  try {
    // 3. 브라우저 컨텍스트 및 페이지 생성
    const context = await createBrowserContext(browser)
    const page = await createPageAndNavigate(context, searchUrl)
    logCallback?.('브라우저가 열렸습니다.')
    logCallback?.(`이동 중: ${searchUrl}`)

    // 4. 로그인 대기
    statusCallback?.('로그인 대기 중... (X에 로그인하세요)')
    logCallback?.('X 로그인을 진행해주세요...')
    logCallback?.('(최대 5분 대기)')

    const loginSuccess = await waitForLogin(page, searchUrl, logCallback)
    if (!loginSuccess) {
      throw new Error('로그인 대기 시간 초과')
    }

    await sleep(getRandomDelay(CONFIG.SCROLL_PAUSE_MIN, CONFIG.SCROLL_PAUSE_MAX))
    logCallback?.('로그인 성공!')

    // 5. 트윗 수집
    statusCallback?.('크롤링 중...')
    const tweetsData = await scrollAndCaptureTweets(page, tweetCount, logCallback)

    logCallback?.(`총 ${tweetsData.length}개 트윗 수집 완료`)
    logCallback?.(`이미지가 있는 트윗: ${tweetsData.length}개`)

    // 6. 웹훅 전송
    statusCallback?.('웹훅 전송 중...')
    logCallback?.(`웹훅 URL로 전송: ${CONFIG.WEBHOOK_URL}`)

    await sendToWebhook(formatted, tweetsData)
    logCallback?.('웹훅 전송 성공!')

    // 7. 완료
    statusCallback?.('완료!')
    await closeBrowser(browser)

    return { success: true, data: tweetsData }
  } catch (error) {
    // 에러 처리
    const errorMessage = error instanceof Error ? error.message : String(error)
    logCallback?.(`오류 발생: ${errorMessage}`)
    statusCallback?.(`오류: ${errorMessage}`)

    await closeBrowser(browser)
    return { success: false, data: [] }
  }
}
