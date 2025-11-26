interface StatusIndicatorProps {
  status: string
}

/**
 * 상태별 색상 반환
 */
function getStatusColor(status: string): string {
  if (status.includes('완료') || status.includes('성공')) return '#4caf50'
  if (status.includes('오류') || status.includes('실패')) return '#f44336'
  if (status.includes('대기')) return '#9e9e9e'
  return '#2196f3' // 진행 중
}

/**
 * StatusIndicator 컴포넌트
 * - 현재 크롤링 상태를 시각적으로 표시
 * - 상태에 따라 색상이 변경됨
 */
export function StatusIndicator({ status }: StatusIndicatorProps): JSX.Element {
  const color = getStatusColor(status)

  return (
    <div style={styles.container}>
      <span
        style={{
          ...styles.indicator,
          backgroundColor: color,
        }}
      />
      <span style={styles.text}>{status}</span>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  indicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  text: {
    fontSize: '0.9rem',
    fontWeight: 500,
  },
}
