'use client';

import { useState, type MouseEvent } from 'react';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Button,
  MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const pages = [
  { name: 'Home', path: '/' },
  { name: 'Broski&apos;s Kitchen', path: '/broskis' },
  { name: 'OTW Service', path: '/otw' },
  { name: 'Tier Membership', path: '/tier' },
  { name: 'Track', path: '/track' },
  { name: 'Partners', path: '/partners' },
  { name: 'Volunteers', path: '/volunteers' },
  { name: 'Hall of Hustle', path: '/hall-of-hustle' },
];

export default function Navigation() {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);
  const pathname = usePathname();

  const handleOpenNavMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo for desktop */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            OTW
          </Typography>

          {/* Mobile menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: 'block', md: 'none' },
              }}
            >
              {pages.map((page) => (
                <MenuItem key={page.name} onClick={handleCloseNavMenu}>
                  <Link
                    href={page.path}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <Typography textAlign="center">{page.name}</Typography>
                  </Link>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Logo for mobile */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
              textDecoration: 'none',
            }}
          >
            OTW
          </Typography>

          {/* Desktop menu */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              justifyContent: 'center',
              gap: 2,
            }}
          >
            {pages.map((page) => (
              <Button
                key={page.name}
                component={Link}
                href={page.path}
                onClick={handleCloseNavMenu}
                sx={{
                  color: 'white',
                  display: 'block',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    width: pathname === page.path ? '100%' : '0%',
                    height: '2px',
                    bottom: 0,
                    left: 0,
                    backgroundColor: 'primary.main',
                    transition: 'width 0.3s ease-in-out',
                  },
                  '&:hover::after': {
                    width: '100%',
                  },
                }}
              >
                {page.name}
              </Button>
            ))}
          </Box>

          {/* Auth buttons */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button
              variant="outlined"
              className="hover:bg-otw-gold/20 transition-colors"
              component={Link}
              href="/signin"
            >
              Sign In
            </Button>
            <Button
              variant="contained"
              className="hover:bg-otw-gold-dark transition-colors"
              component={Link}
              href="/signup"
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
