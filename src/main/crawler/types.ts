/**
 * 트윗 데이터 타입 정의
 */
export interface TweetData {
  /** 트윗 본문 */
  text: string
  /** 작성자 정보 */
  author: string
  /** 작성 시간 (ISO 8601) */
  timestamp: string
  /** 참여 지표 */
  engagement: {
    likes: string
    retweets: string
  }
  /** 첨부 이미지 URL 목록 */
  image: string[]
  /** 트윗 링크 */
  link: string
}

/**
 * 크롤러 설정 타입
 */
export interface CrawlerConfig {
  /** 웹훅 URL */
  WEBHOOK_URL: string
  /** 기본 수집 트윗 수 */
  DEFAULT_TWEET_COUNT: number
  /** 스크롤 대기 최소 시간 (ms) */
  SCROLL_PAUSE_MIN: number
  /** 스크롤 대기 최대 시간 (ms) */
  SCROLL_PAUSE_MAX: number
  /** 로그인 대기 시간 (ms) */
  LOGIN_TIMEOUT: number
}

/**
 * 크롤러 콜백 타입
 */
export type LogCallback = (log: string) => void
export type StatusCallback = (status: string) => void

/**
 * 크롤러 실행 결과 타입
 */
export interface CrawlerResult {
  success: boolean
  data: TweetData[]
}
