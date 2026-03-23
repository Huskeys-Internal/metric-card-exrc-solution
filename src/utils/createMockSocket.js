/**
 * Creates a mock socket that mimics the EventSource addEventListener interface.
 * Emits a new metric snapshot at a random interval between 1 and 4 seconds.
 *
 * Usage:
 *   const socket = createMockSocket()
 *   socket.addEventListener('message', (e) => {
 *     const data = JSON.parse(e.data)
 *     // { value, trendDelta, trend, status, timestamp }
 *   })
 *   socket.close() // stop emissions
 */
export const createMockSocket = () => {
  let timeoutId = null
  const listeners = {}
  let closed = false

  const STATUSES = ['healthy', 'warning', 'critical']

  const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

  const generateSnapshot = () => {
    const trend = Array.from({ length: 7 }, () => randomInt(10, 100))
    return {
      value: randomInt(0, 1_500_000),
      trendDelta: parseFloat((Math.random() * 40 - 20).toFixed(1)),
      trend,
      status: STATUSES[randomInt(0, 2)],
      timestamp: Date.now(),
    }
  }

  const emit = (event, payload) => {
    if (!listeners[event]) return
    listeners[event].forEach((fn) => fn(payload))
  }

  const scheduleNext = () => {
    if (closed) return
    const delay = randomInt(1000, 4000)
    timeoutId = setTimeout(() => {
      emit('message', { data: JSON.stringify(generateSnapshot()) })
      scheduleNext()
    }, delay)
  }

  scheduleNext()

  return {
    addEventListener(event, fn) {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(fn)
    },
    removeEventListener(event, fn) {
      if (!listeners[event]) return
      listeners[event] = listeners[event].filter((l) => l !== fn)
    },
    close() {
      closed = true
      clearTimeout(timeoutId)
    },
  }
}
