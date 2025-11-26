import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
        reset: () => set({ count: 0 }),
      }),
      { name: 'app-store' }
    ),
    { name: 'AppStore' }
  )
)

// Crawler Store
interface CrawlerState {
  hashtag: string
  tweetCount: number
  isCrawling: boolean
  status: string
  logs: string[]
  setHashtag: (hashtag: string) => void
  setTweetCount: (count: number) => void
  setIsCrawling: (isCrawling: boolean) => void
  setStatus: (status: string) => void
  addLog: (log: string) => void
  clearLogs: () => void
}

export const useCrawlerStore = create<CrawlerState>()(
  devtools(
    (set) => ({
      hashtag: '',
      tweetCount: 50,
      isCrawling: false,
      status: '대기 중',
      logs: [],
      setHashtag: (hashtag) => set({ hashtag }),
      setTweetCount: (tweetCount) => set({ tweetCount }),
      setIsCrawling: (isCrawling) => set({ isCrawling }),
      setStatus: (status) => set({ status }),
      addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
      clearLogs: () => set({ logs: [] }),
    }),
    { name: 'CrawlerStore' }
  )
)
