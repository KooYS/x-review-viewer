import { useEffect, useRef } from 'react'

interface LogViewerProps {
  logs: string[]
}

/**
 * 로그 타입 감지
 * - 로그 메시지 내용에 따라 성공/오류/경고/정보 타입 반환
 */
function getLogType(log: string): 'success' | 'error' | 'warning' | 'info' {
  if (log.includes('완료') || log.includes('성공')) return 'success'
  if (log.includes('오류') || log.includes('실패')) return 'error'
  if (log.includes('경고')) return 'warning'
  return 'info'
}

/**
 * 로그 타입별 색상
 */
const LOG_COLORS = {
  success: '#4caf50',
  error: '#f44336',
  warning: '#ff9800',
  info: '#333',
} as const

/**
 * LogViewer 컴포넌트
 * - 크롤링 로그를 실시간으로 표시
 * - 새 로그 추가 시 자동 스크롤
 */
export function LogViewer({ logs }: LogViewerProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)

  // 로그 추가 시 자동 스크롤
  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <div ref={containerRef} style={styles.container}>
      {logs.length === 0 ? (
        <p style={styles.placeholder}>로그가 여기에 표시됩니다...</p>
      ) : (
        logs.map((log, index) => {
          const logType = getLogType(log)
          return (
            <p
              key={`log-${index}-${log.substring(0, 10)}`}
              style={{
                ...styles.entry,
                color: LOG_COLORS[logType],
              }}
            >
              {log}
            </p>
          )
        })
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#f5f8fa',
    border: '1px solid #e1e8ed',
    borderRadius: '8px',
    padding: '1rem',
    height: '300px',
    overflowY: 'auto',
  },
  placeholder: {
    color: '#aab8c2',
    fontStyle: 'italic',
    margin: 0,
  },
  entry: {
    margin: '0.25rem 0',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
  },
}
