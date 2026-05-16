import { Box, CircularProgress, Stack, Typography } from '@mui/material';

function LoadingState({ message = 'Loading notifications...' }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress />
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      </Stack>
    </Box>
  );
}

export default LoadingState;