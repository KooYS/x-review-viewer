import type { CrawlerConfig } from './types'

/**
 * 크롤러 설정
 */
export const CONFIG: CrawlerConfig = {
  /** 수집된 데이터를 전송할 웹훅 URL */
  WEBHOOK_URL: 'https://shop.duckzill.com/api/twitter_scrap_webhook.php',

  /** 기본 수집 트윗 수 */
  DEFAULT_TWEET_COUNT: 50,

  /** 스크롤 간 최소 대기 시간 (ms) - 봇 감지 방지용 */
  SCROLL_PAUSE_MIN: 2000,

  /** 스크롤 간 최대 대기 시간 (ms) - 봇 감지 방지용 */
  SCROLL_PAUSE_MAX: 5000,

  /** 로그인 대기 최대 시간 (ms) - 5분 */
  LOGIN_TIMEOUT: 300000,
}

/**
 * 브라우저 User-Agent
 */
export const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'

/**
 * 브라우저 실행 옵션
 */
export const BROWSER_ARGS = [
  '--disable-blink-features=AutomationControlled',
  '--disable-dev-shm-usage',
  '--disable-web-security',
  '--disable-features=IsolateOrigins,site-per-process',
  '--disable-site-isolation-trials',
]

/**
 * 브라우저 컨텍스트 설정
 */
export const BROWSER_CONTEXT_OPTIONS = {
  viewport: { width: 1024, height: 768 },
  locale: 'ko-KR',
  timezoneId: 'Asia/Seoul',
  colorScheme: 'light' as const,
}
