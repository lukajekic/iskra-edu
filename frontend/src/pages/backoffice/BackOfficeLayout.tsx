import { Outlet } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';

// Uvoz Mantine CSS stilova isključivo unutar ovog wrappera
import '@mantine/core/styles.css';

const adminTheme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 0
});

export default function BackOfficeLayout() {
  return (
    <MantineProvider theme={adminTheme} defaultColorScheme="light" forceColorScheme="light">
      <div
        className="mantine-admin-root min-h-screen bg-[#ffffff] text-[#212529]"
        style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif' }}
      >
        <Outlet />
      </div>
    </MantineProvider>
  );
}