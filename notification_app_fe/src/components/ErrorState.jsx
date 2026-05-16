import { Alert, Box, Button, Stack, Typography } from '@mui/material';

function ErrorState({ title = 'Something went wrong', message, onRetry }) {
  return (
    <Alert severity="error" sx={{ borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {message || 'We could not load notifications right now. Please try again.'}
          </Typography>
        </Box>

        {onRetry ? (
          <Box>
            <Button variant="contained" color="error" onClick={onRetry}>
              Retry
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Alert>
  );
}

export default ErrorState;