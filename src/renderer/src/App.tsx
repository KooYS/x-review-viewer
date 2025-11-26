import { useAppStore } from './stores'

function App(): JSX.Element {
  const { count, increment, decrement } = useAppStore()

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>X Review Viewer</h1>
      <p>Electron + React + TypeScript + Zustand</p>
      <div style={{ marginTop: '1rem' }}>
        <p>Count: {count}</p>
        <button type="button" onClick={decrement} style={{ marginRight: '0.5rem' }}>
          -
        </button>
        <button type="button" onClick={increment}>
          +
        </button>
      </div>
    </div>
  )
}

export default App
