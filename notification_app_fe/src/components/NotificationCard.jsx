import { Card, CardContent, Chip, Stack, Typography, CardActionArea } from '@mui/material';

function formatTimestamp(value) {
  if (!value) return '';

  const dateValue = typeof value === 'number'
    ? new Date(value < 1000000000000 ? value * 1000 : value)
    : new Date(value);

  if (Number.isNaN(dateValue.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(dateValue);
}

function NotificationCard({ notification, onClick, isViewed = false, showScore = false }) {
  const type = notification.type || 'Unknown';
  const message = notification.message || 'No message';
  const timestamp = notification.timestamp || null;
  const formattedTimestamp = formatTimestamp(timestamp);

  const viewedStyles = isViewed
    ? { borderColor: 'divider', bgcolor: 'grey.50', opacity: 0.9 }
    : { borderColor: 'primary.light', bgcolor: 'rgba(25, 118, 210, 0.04)', boxShadow: '0 14px 34px rgba(22, 50, 79, 0.10)' };

  const content = (
    <CardContent sx={{ p: 2.5 }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap">
          <Chip label={type} color={isViewed ? 'default' : 'primary'} size="small" sx={{ fontWeight: 700 }} />
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: 0.4 }}>
            {isViewed ? 'Read' : 'Unread'}
          </Typography>
        </Stack>

        <Stack spacing={0.75}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Message
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.65, fontWeight: isViewed ? 400 : 600, color: isViewed ? 'text.secondary' : 'text.primary' }}>
            {message}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.25}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Timestamp
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formattedTimestamp}
            </Typography>
          </Stack>

          {showScore && typeof notification.score === 'number' ? (
            <Chip label={`Score: ${notification.score}`} size="small" color="secondary" variant="outlined" />
          ) : null}
        </Stack>
      </Stack>
    </CardContent>
  );

  return (
    <Card
      elevation={isViewed ? 1 : 4}
      sx={{
        borderRadius: 4,
        border: '1px solid',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease',
        '&:hover': onClick ? { transform: 'translateY(-3px)', boxShadow: '0 18px 38px rgba(22, 50, 79, 0.12)' } : {},
        ...viewedStyles,
      }}
    >
      {onClick ? <CardActionArea onClick={onClick} sx={{ borderRadius: 4 }}>{content}</CardActionArea> : content}
    </Card>
  );
}

export default NotificationCard;