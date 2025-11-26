interface CrawlerFormProps {
  hashtag: string
  tweetCount: number
  isCrawling: boolean
  onHashtagChange: (value: string) => void
  onTweetCountChange: (value: number) => void
  onSubmit: () => void
}

/**
 * CrawlerForm 컴포넌트
 * - 해시태그 입력
 * - 수집할 트윗 수 설정
 * - 크롤링 시작 버튼
 */
export function CrawlerForm({
  hashtag,
  tweetCount,
  isCrawling,
  onHashtagChange,
  onTweetCountChange,
  onSubmit,
}: CrawlerFormProps): JSX.Element {
  return (
    <div style={styles.container}>
      {/* 입력 필드 그룹 */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>
          해시태그
          <input
            type="text"
            value={hashtag}
            onChange={(e) => onHashtagChange(e.target.value)}
            placeholder="#해시태그"
            style={styles.input}
            disabled={isCrawling}
          />
        </label>

        <label style={styles.label}>
          수집할 트윗 수
          <input
            type="number"
            value={tweetCount}
            onChange={(e) => onTweetCountChange(Number(e.target.value))}
            min={1}
            max={500}
            style={styles.input}
            disabled={isCrawling}
          />
        </label>
      </div>

      {/* 시작 버튼 */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={isCrawling}
        style={{
          ...styles.button,
          backgroundColor: isCrawling ? '#9e9e9e' : '#1da1f2',
          cursor: isCrawling ? 'not-allowed' : 'pointer',
        }}
      >
        {isCrawling ? '크롤링 중...' : '크롤링 시작'}
      </button>

      {/* 주의사항 */}
      <div style={styles.warning}>
        자동로그인이 아니므로 <b>직접 로그인</b>을 5분안에 진행해야합니다. <br />
        계정 로그인 시도 중에 아래(
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="13"
          height="13"
          fill="currentColor"
          viewBox="0 0 16 16"
          aria-hidden="true"
          style={{ top: '2px', position: 'relative', fontWeight: 'bold', opacity: 0.9 }}
        >
          <path
            d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        )와 같은 에러가 발생한다면 <b>구글, 애플 로그인</b>으로 로그인해주세요.
        <div style={styles.problem_code}>
          Could not log you in now. Please try again later.
          g;176396443714400122:-1763964443271:BVxQgTEPXpMAYrxzYfqn48Kd:1
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    marginBottom: '1.5rem',
  },
  inputGroup: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#14171a',
    flex: 1,
    minWidth: '200px',
  },
  input: {
    padding: '0.75rem',
    fontSize: '1rem',
    border: '1px solid #ccd6dd',
    borderRadius: '4px',
    outline: 'none',
  },
  button: {
    padding: '0.75rem 2rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    width: '100%',
  },
  warning: {
    fontSize: '0.8rem',
    color: '#ff0000',
    marginTop: '0.5rem',
    lineHeight: '1.5rem',
  },
  problem_code: {
    fontSize: '0.8rem',
    color: '#000000',
    border: '1px solid #000000',
    padding: '0.5rem',
    borderRadius: '4px',
    marginTop: '0.5rem',
  },
}
