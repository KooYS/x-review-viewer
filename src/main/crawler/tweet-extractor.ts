import type { Page } from 'playwright-core'
import { CONFIG } from './config'
import type { LogCallback, TweetData } from './types'
import { getRandomDelay, sleep } from './utils'

/**
 * 트윗 요소에서 데이터 추출
 * - 이미지가 없는 트윗은 null 반환
 */
export async function extractTweetData(tweetElement: unknown): Promise<TweetData | null> {
  try {
    // biome-ignore lint/suspicious/noExplicitAny: Playwright element type
    const tweet = tweetElement as any

    // 이미지 확인 (이미지가 없으면 스킵)
    const images = await tweet.locator('[data-testid="tweetPhoto"] img').all()
    if (images.length === 0) {
      return null
    }

    // 각 요소 선택
    const textElement = await tweet.locator('[data-testid="tweetText"]').first()
    const authorElement = await tweet.locator('[data-testid="User-Name"] a').first()
    const timeElement = await tweet.locator('time').first()
    const likeElement = await tweet.locator('[data-testid="like"]').first()
    const retweetElement = await tweet.locator('[data-testid="retweet"]').first()
    const linkElement = await tweet
      .locator('[data-testid="User-Name"] a[role="link"][dir="ltr"]')
      .first()

    // 데이터 추출
    const text = textElement ? await textElement.innerText() : ''
    const author = authorElement ? await authorElement.innerText() : ''
    const timestamp = timeElement ? await timeElement.getAttribute('datetime') : ''
    const likes = likeElement ? await likeElement.innerText() : '0'
    const retweets = retweetElement ? await retweetElement.innerText() : '0'
    const link = linkElement ? await linkElement.getAttribute('href') : ''

    // 이미지 URL 수집
    const imageUrls: string[] = []
    for (const img of images) {
      const src = await img.getAttribute('src')
      if (src) imageUrls.push(src)
    }

    if (imageUrls.length === 0) {
      return null
    }

    return {
      text,
      author,
      timestamp,
      engagement: { likes, retweets },
      image: imageUrls,
      link,
    }
  } catch {
    return null
  }
}

/**
 * 페이지 스크롤하며 트윗 수집
 */
export async function scrollAndCaptureTweets(
  page: Page,
  targetCount: number,
  logCallback?: LogCallback
): Promise<TweetData[]> {
  const collectedTweets: TweetData[] = []
  const seenTexts = new Set<string>()
  let lastHeight = 0
  let noNewTweetsCount = 0

  while (collectedTweets.length < targetCount) {
    // 현재 페이지의 트윗 요소들 가져오기
    const tweetElements = await page.locator('article[data-testid="tweet"]').all()

    // 새로운 트윗 수집
    let newCount = 0
    for (const tweet of tweetElements) {
      try {
        const textElement = await tweet.locator('[data-testid="tweetText"]').first()
        if (textElement) {
          const text = await textElement.innerText()

          // 중복 체크
          if (!seenTexts.has(text)) {
            seenTexts.add(text)

            const tweetData = await extractTweetData(tweet)
            if (tweetData) {
              collectedTweets.push(tweetData)
              newCount++
            }

            // 목표 달성 시 중단
            if (collectedTweets.length >= targetCount) {
              break
            }
          }
        }
      } catch (error) {
        logCallback?.(`트윗 데이터 추출 중 오류 발생: ${error}`)
      }
    }

    // 진행 상황 로그
    logCallback?.(`수집된 트윗: ${collectedTweets.length}/${targetCount}`)

    // 새 트윗이 없으면 카운트 증가
    if (newCount === 0) {
      noNewTweetsCount++
      if (noNewTweetsCount >= 3) {
        logCallback?.('더 이상 새로운 트윗이 없습니다.')
        break
      }
    } else {
      noNewTweetsCount = 0
    }

    // 스크롤 실행 (브라우저 컨텍스트에서 실행)
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)')
    await sleep(getRandomDelay(CONFIG.SCROLL_PAUSE_MIN, CONFIG.SCROLL_PAUSE_MAX))

    // 스크롤 끝 확인
    const newHeight = await page.evaluate('document.body.scrollHeight')
    if (newHeight === lastHeight) {
      noNewTweetsCount++
    }
    lastHeight = newHeight as number
  }

  return collectedTweets
}
