/**
 * 유틸리티 함수 모음
 */

/**
 * 지정된 시간(ms) 동안 대기
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 최소~최대 사이의 랜덤 지연 시간 반환
 * - 봇 감지 방지를 위해 랜덤 딜레이 사용
 */
export function getRandomDelay(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

/**
 * 해시태그 포맷 처리
 * - # 없으면 추가
 * - URL 인코딩 처리
 */
export function formatHashtag(hashtag: string): { formatted: string; encoded: string } {
  let formatted = hashtag
  if (!formatted.startsWith('#')) {
    formatted = `#${formatted}`
  }
  const encoded = formatted.replace(/#/g, '%23')
  return { formatted, encoded }
}

/**
 * 트위터 검색 URL 생성
 */
export function buildSearchUrl(encodedQuery: string): string {
  return `https://twitter.com/search?q=${encodedQuery}&src=typed_query&f=live`
}
