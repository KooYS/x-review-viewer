import { useEffect } from 'react'
import { CrawlerForm, LogViewer, StatusIndicator } from './components'
import { useCrawlerStore } from './stores'

/**
 * App 컴포넌트
 * - 크롤러 애플리케이션의 메인 컴포넌트
 * - 상태 관리와 IPC 통신을 담당하고, UI는 하위 컴포넌트에 위임
 */
function App(): JSX.Element {
  // Zustand 스토어에서 상태와 액션 가져오기
  const {
    hashtag,
    tweetCount,
    isCrawling,
    status,
    logs,
    setHashtag,
    setTweetCount,
    setIsCrawling,
    setStatus,
    addLog,
    clearLogs,
  } = useCrawlerStore()

  /**
   * IPC 리스너 등록
   * - 메인 프로세스에서 보내는 로그와 상태 업데이트를 수신
   */
  useEffect(() => {
    // 로그 수신 리스너
    const unsubscribeLog = window.electron.on('crawler-log', (log: string) => {
      addLog(log)
    })

    // 상태 수신 리스너
    const unsubscribeStatus = window.electron.on('crawler-status', (newStatus: string) => {
      setStatus(newStatus)
    })

    // 컴포넌트 언마운트 시 리스너 해제
    return () => {
      unsubscribeLog()
      unsubscribeStatus()
    }
  }, [addLog, setStatus])

  /**
   * 크롤링 시작 핸들러
   * - 입력값 검증 후 메인 프로세스에 크롤링 요청
   */
  const handleStartCrawling = async (): Promise<void> => {
    // 이미 크롤링 중이면 중복 실행 방지
    if (isCrawling) {
      alert('이미 크롤링이 진행 중입니다.')
      return
    }

    // 해시태그 검증
    const trimmedHashtag = hashtag.trim()
    if (!trimmedHashtag || trimmedHashtag === '#') {
      alert('해시태그를 입력해주세요.')
      return
    }

    if (!trimmedHashtag.startsWith('#')) {
      alert('해시태그는 #으로 시작해야 합니다.')
      return
    }

    // 트윗 수 검증
    if (tweetCount <= 0) {
      alert('수집할 트윗 수는 양의 정수여야 합니다.')
      return
    }

    // 크롤링 시작 준비
    clearLogs()
    setIsCrawling(true)
    setStatus('크롤링 준비 중...')

    try {
      // 메인 프로세스에 크롤링 요청 (IPC invoke)
      const result = await window.electron.invoke('start-crawling', {
        hashtag: trimmedHashtag,
        tweetCount,
      })

      // 결과 처리
      if (result.success) {
        setStatus('완료!')
        addLog(`완료: ${result.message}`)
      } else {
        setStatus('오류 발생')
        addLog(`오류: ${result.message}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      setStatus('오류 발생')
      addLog(`오류: ${errorMessage}`)
    } finally {
      setIsCrawling(false)
    }
  }

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.title}>
          <svg style={styles.svg} viewBox="0 0 24 24" aria-hidden="true">
            <g>
              <path d="M21.742 21.75l-7.563-11.179 7.056-8.321h-2.456l-5.691 6.714-4.54-6.714H2.359l7.29 10.776L2.25 21.75h2.456l6.035-7.118 4.818 7.118h6.191-.008zM7.739 3.818L18.81 20.182h-2.447L5.29 3.818h2.447z" />
            </g>
          </svg>{' '}
          Review Crawler
        </h1>
      </header>

      {/* 크롤러 입력 폼 */}
      <CrawlerForm
        hashtag={hashtag}
        tweetCount={tweetCount}
        isCrawling={isCrawling}
        onHashtagChange={setHashtag}
        onTweetCountChange={setTweetCount}
        onSubmit={handleStartCrawling}
      />

      {/* 상태 표시 */}
      <StatusIndicator status={status} />

      {/* 로그 뷰어 */}
      <LogViewer logs={logs} />
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    color: '#1da1f2',
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  svg: {
    width: '2rem',
    height: '2rem',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#657786',
    margin: 0,
  },
}

export default App
