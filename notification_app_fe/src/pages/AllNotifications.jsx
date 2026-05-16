import { useEffect, useRef, useState } from 'react';
import safeLog from '../utils/logger';
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ErrorState from '../components/ErrorState';
import LoadingState from '../components/LoadingState';
import NotificationCard from '../components/NotificationCard';
import { getNotifications } from '../api/notificationApi';

const PAGE_SIZE = 10;
const FILTER_OPTIONS = ['All', 'Placement', 'Result', 'Event'];
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

function getNotificationType(notification) {
  return String(notification.type || '').trim();
}

function filterNotifications(notifications, filter) {
  if (!filter || filter === 'All') {
    return notifications;
  }

  return notifications.filter((notification) => getNotificationType(notification).includes(filter));
}

function paginateNotifications(notifications, page, pageSize) {
  const startIndex = (page - 1) * pageSize;
  return notifications.slice(startIndex, startIndex + pageSize);
}

function AllNotifications() {
  const [allNotifications, setAllNotifications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState('All');
  const [viewedIds, setViewedIds] = useState(() => readViewedIds());
  const [totalCount, setTotalCount] = useState(0);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    safeLog('info', 'Notification filter changed', 'page');
  }, [filter]);

  const paginationCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  function handleFilterChange(event) {
    setPage(1);
    setFilter(event.target.value);
  }

  async function handleNotificationClick(notification) {
    const notificationId = getNotificationId(notification);

    if (!notificationId || viewedIds.includes(notificationId)) {
      return;
    }

    const nextViewedIds = [...viewedIds, notificationId];
    setViewedIds(nextViewedIds);
    writeViewedIds(nextViewedIds);

    await safeLog('info', 'Notification marked viewed', 'component');
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  useEffect(() => {
    if (allNotifications.length === 0) {
      setNotifications([]);
      setTotalCount(0);
      return;
    }

    const filteredNotifications = filterNotifications(allNotifications, filter);
    setTotalCount(filteredNotifications.length);
    setNotifications(paginateNotifications(filteredNotifications, page, PAGE_SIZE));
  }, [allNotifications, filter, page]);

  function handleRetry() {
    loadNotifications();
  }

  async function loadNotifications() {
    try {
      setLoading(true);
      setError('');

      const data = await getNotifications(1, 1000);
      setAllNotifications(data);
      setTotalCount(data.length);

      const filteredNotifications = filterNotifications(data, filter);
      setNotifications(paginateNotifications(filteredNotifications, page, PAGE_SIZE));
    } catch (err) {
      setAllNotifications([]);
      setNotifications([]);
      setTotalCount(0);
      setError(err.message || 'Unable to load notifications.');
      safeLog('error', 'Notifications fetch failed', 'component');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2.5, md: 4 } }}>
      <Stack spacing={{ xs: 2.5, md: 3.5 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, mb: 1 }}>
            All Notifications
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Browse campus notifications with filtering and pagination.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="notification-filter-label">Filter</InputLabel>
            <Select
              labelId="notification-filter-label"
              value={filter}
              label="Filter"
              onChange={handleFilterChange}
            >
              {FILTER_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            Page {page}
          </Typography>
        </Stack>

        {error ? <ErrorState message={error} onRetry={handleRetry} /> : null}

        {loading ? <LoadingState message="Loading notifications..." /> : null}

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
                  title="No notifications found"
                  message="Try a different filter or check back later."
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
                />
              </Box>
            ))}
          </Box>
        ) : null}

        <Stack alignItems="center" spacing={1} sx={{ pt: 1 }}>
          <Pagination
            count={paginationCount}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            disabled={loading || notifications.length === 0}
          />
          <Typography variant="caption" color="text.secondary">
            Showing up to {PAGE_SIZE} notifications per page
          </Typography>
        </Stack>
      </Stack>
    </Container>
  );
}

export default AllNotifications;