import { useEffect, useRef, useState } from 'react';
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import NotificationCard from '../components/NotificationCard';
import { getNotifications } from '../api/notificationApi';
import safeLog from '../utils/logger';

const PRIORITY_ORDER = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

const COUNT_OPTIONS = [10, 15, 20];
const TYPE_OPTIONS = ['Placement', 'Result', 'Event'];
const VIEWED_STORAGE_KEY = 'notification_viewed_ids';

function getNotificationId(notification) {
  return String(notification.id || '');
}

function readViewedIds() {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const storedValue = window.localStorage.getItem(VIEWED_STORAGE_KEY);
    const parsedValue = storedValue ? JSON.parse(storedValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeViewedIds(ids) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(VIEWED_STORAGE_KEY, JSON.stringify(ids));
}

function paginateNotifications(notifications, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return notifications.slice(startIndex, startIndex + pageSize);
}

async function logPriorityMessage(level, message) {
  return safeLog(level, message, 'page');
}

function getNotificationType(notification) {
  const normalized = String(notification.type || '').trim();

  if (normalized.includes('Placement')) {
    return 'Placement';
  }

  if (normalized.includes('Result')) {
    return 'Result';
  }

  if (normalized.includes('Event')) {
    return 'Event';
  }

  return normalized || 'Event';
}

function getTimestampValue(notification) {
  const rawValue = notification.timestamp || 0;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue < 1000000000000 ? rawValue * 1000 : rawValue;
  }

  const parsed = Date.parse(rawValue);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortNotifications(items) {
  return [...items].sort((left, right) => {
    const leftType = getNotificationType(left);
    const rightType = getNotificationType(right);
    const leftScore = (PRIORITY_ORDER[leftType] || 1) * 100000000 + getTimestampValue(left);
    const rightScore = (PRIORITY_ORDER[rightType] || 1) * 100000000 + getTimestampValue(right);

    return rightScore - leftScore;
  });
}

function PriorityNotifications() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [count, setCount] = useState(10);
  const [type, setType] = useState('Placement');
  const [viewedIds, setViewedIds] = useState(() => readViewedIds());
  const isFirstRender = useRef(true);

  useEffect(() => {
    logPriorityMessage('info', 'Priority notifications page loaded').catch(() => null);
    loadNotifications();
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    logPriorityMessage('info', 'Priority count changed').catch(() => null);
  }, [count]);

  function handleCountChange(event) {
    setCount(Number(event.target.value));
  }

  function handleTypeChange(event) {
    setType(event.target.value);
  }

  async function handleNotificationClick(notification) {
    const notificationId = getNotificationId(notification);

    if (!notificationId || viewedIds.includes(notificationId)) {
      return;
    }

    const nextViewedIds = [...viewedIds, notificationId];
    setViewedIds(nextViewedIds);
    writeViewedIds(nextViewedIds);

    await logPriorityMessage('info', 'Notification marked viewed');
  }

  useEffect(() => {
    if (allNotifications.length === 0) {
      return;
    }

    const filteredNotifications = sortNotifications(
      allNotifications.filter((notification) => getNotificationType(notification).includes(type)),
    );

    setNotifications(paginateNotifications(filteredNotifications, 1, count));
  }, [allNotifications, count, type]);

  function handleRetry() {
    loadNotifications();
  }

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');

      await logPriorityMessage('info', `Priority API call start for ${type} limit ${count}`);

      const data = await getNotifications(1, 1000);
      setAllNotifications(data);
      const filteredNotifications = sortNotifications(
        data.filter((notification) => getNotificationType(notification).includes(type)),
      );

      setNotifications(paginateNotifications(filteredNotifications, 1, count));

      await logPriorityMessage('info', `Priority API call success for ${type} limit ${count}`);
    } catch (err) {
      setAllNotifications([]);
      setError(err.message || 'Unable to load priority notifications.');
      setNotifications([]);
      await logPriorityMessage('error', `Priority API call failed: ${err.message || 'Unknown error'}`);
      await logPriorityMessage('error', 'Notifications fetch failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Stack spacing={{ xs: 2.5, md: 3.5 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            Priority Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            View top-priority campus alerts with type-based filtering and count control.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel id="priority-count-label">Count</InputLabel>
            <Select labelId="priority-count-label" value={count} label="Count" onChange={handleCountChange}>
              {COUNT_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel id="priority-type-label">Filter</InputLabel>
            <Select labelId="priority-type-label" value={type} label="Filter" onChange={handleTypeChange}>
              {TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {error ? <ErrorState message={error} onRetry={handleRetry} /> : null}

        {loading ? <LoadingState message="Loading priority notifications..." /> : null}

        {!loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(3, minmax(0, 1fr))' },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {notifications.length === 0 ? (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <ErrorState
                  title="No priority notifications found"
                  message="Try another count or filter to see different results."
                  onRetry={handleRetry}
                />
              </Box>
            ) : null}

            {notifications.map((notification, index) => (
              <Box
                key={notification.id || `notification-${index}`}
              >
                <NotificationCard
                  notification={notification}
                  isViewed={viewedIds.includes(getNotificationId(notification))}
                  onClick={() => handleNotificationClick(notification)}
                  showScore
                />
              </Box>
            ))}
          </Box>
        ) : null}

        <Typography variant="caption" color="text.secondary">
          Sort order: Placement &gt; Result &gt; Event
        </Typography>
      </Stack>
    </Container>
  );
}

export default PriorityNotifications;