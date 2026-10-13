const backend = import.meta.env.VITE_BACKEND as string | undefined
const SAFE_ERROR_NAMES = new Set([
  'Error',
  'TypeError',
  'ReferenceError',
  'SyntaxError',
  'RangeError',
  'URIError',
  'EvalError',
  'DOMException',
  'NetworkError',
  'AbortError',
])

function reportClientError(kind: 'client.error' | 'client.unhandled_rejection', value: unknown) {
  if (!backend || !import.meta.env.PROD) return

  const errorName = value instanceof Error && SAFE_ERROR_NAMES.has(value.name) ? value.name : 'Error'
  void fetch(`${backend}/telemetry/client-error`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind, errorName }),
    keepalive: true,
  }).catch(() => {
    console.error("Error while sending client error to server.")
  })
}

window.addEventListener('error', (event) => {
  reportClientError('client.error', event.error)
})

window.addEventListener('unhandledrejection', (event) => {
  reportClientError('client.unhandled_rejection', event.reason)
})
