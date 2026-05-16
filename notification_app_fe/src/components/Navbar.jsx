import { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { NavLink, useLocation } from 'react-router-dom';
import safeLog from '../utils/logger';

const navigationItems = [
  { label: 'All Notifications', path: '/' },
  { label: 'Priority Inbox', path: '/priority' },
];

async function logNavigationChange(message) {
  return safeLog('info', message, 'component');
}

function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/priority') {
      logNavigationChange('Navigation changed to Priority page').catch(() => null);
    }
  }, [location.pathname]);

  function toggleDrawer(open) {
    return () => {
      setDrawerOpen(open);
    };
  }

  function renderLink(item, mobile = false) {
    const baseStyles = {
      color: mobile ? 'text.primary' : '#fff',
      textDecoration: 'none',
      borderRadius: 2,
      width: mobile ? '100%' : 'auto',
      justifyContent: mobile ? 'flex-start' : 'center',
    };

    return (
      <Button
        key={item.path}
        component={NavLink}
        to={item.path}
        onClick={mobile ? toggleDrawer(false) : undefined}
        sx={({ isActive }) => ({
          ...baseStyles,
          px: 2,
          py: 1,
          fontWeight: 700,
          backgroundColor: isActive ? (mobile ? 'action.selected' : 'rgba(255,255,255,0.16)') : 'transparent',
          opacity: isActive ? 1 : mobile ? 0.9 : 0.82,
          '&:hover': {
            backgroundColor: mobile ? 'action.hover' : 'rgba(255,255,255,0.12)',
          },
        })}
      >
        {item.label}
      </Button>
    );
  }

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#16324f' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
            Notification System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Campus alerts and priority view
          </Typography>
        </Box>

        {isMobile ? (
          <>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="open navigation menu"
              onClick={toggleDrawer(true)}
              sx={{ width: 44, height: 44 }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box component="span" sx={{ width: 22, height: 2, borderRadius: 2, bgcolor: 'currentColor' }} />
                <Box component="span" sx={{ width: 22, height: 2, borderRadius: 2, bgcolor: 'currentColor' }} />
                <Box component="span" sx={{ width: 22, height: 2, borderRadius: 2, bgcolor: 'currentColor' }} />
              </Box>
            </IconButton>

            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
              <Box sx={{ width: 260, p: 2 }} role="presentation" onClick={toggleDrawer(false)}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1 }}>
                  Navigate
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <List>
                  {navigationItems.map((item) => (
                    <ListItemButton
                      key={item.path}
                      component={NavLink}
                      to={item.path}
                      sx={({ isActive }) => ({
                        borderRadius: 2,
                        mb: 1,
                        backgroundColor: isActive ? 'action.selected' : 'transparent',
                      })}
                    >
                      <ListItemText primary={item.label} />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {navigationItems.map((item) => renderLink(item))}
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;