// Lightweight browser-safe logger that attempts to POST to remote logging endpoint
// Falls back to console logging and never throws.
const LOGGING_ENDPOINT = 'http://4.224.186.213/evaluation-service/logs';

function getToken() {
  // Support both CRA and Vite env names
  if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_TOKEN) {
    return process.env.REACT_APP_TOKEN;
  }

  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env.VITE_NOTIFICATION_TOKEN || import.meta.env.VITE_BEARER_TOKEN || '';
  }

  return '';
}

export async function safeLog(level, message, packageName = 'frontend') {
  try {
    const token = getToken();
    const payload = { stack: 'frontend', level, package: packageName, message };

    // Try sending to remote logging endpoint if token is available
    if (token) {
      try {
        await fetch(LOGGING_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        // ignore network errors and fall through to console
      }
    }

    // Always emit console logs locally for developer visibility
    if (level === 'error' || level === 'fatal') {
      console.error('[safeLog]', message);
    } else if (level === 'warn') {
      console.warn('[safeLog]', message);
    } else {
      console.info('[safeLog]', message);
    }
  } catch (ignore) {
    // Never throw from logger
  }
}

export default safeLog;
