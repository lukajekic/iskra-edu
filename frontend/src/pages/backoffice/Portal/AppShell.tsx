import {
  AppShell,
  Burger,
  Stack,
  Text,
  Group,
  Badge,
  Avatar,
  Menu,
  UnstyledButton,
  Box,
  NavLink,
  Button,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { BookOpen, ChevronDownIcon, ClipboardCheck, Home, LogOutIcon, SettingsIcon, Users } from 'lucide-react';
import PageTitle from './core_components/PageTitle';
import ActionButtonsBlock from './core_components/ActionButtonsBlock';

type PortalRole = 'super_admin' | 'district' | 'school_main' | 'school_tenant';
type PortalMenuItem = { id: string; label: string; icon: string };
type PortalSessionData = {
  user: { id: string; name: string; username: string; role: PortalRole };
  menu: PortalMenuItem[];
};

const roleLabels: Record<PortalRole, string> = {
  super_admin: 'Super administrator portala',
  district: 'Okružna uprava',
  school_main: 'Koordinator samostalno registrovane škole',
  school_tenant: 'Školski koordinator',
};

const menuIcons = {
  users: Users,
  courses: BookOpen,
  reports: ClipboardCheck,
  settings: SettingsIcon,
};

export function PortalAppShell() {
  const [opened, { toggle }] = useDisclosure();
  const [session, setSession] = useState<PortalSessionData | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState('');

  useEffect(() => {
    let mounted = true;
    axios.get<PortalSessionData>(`${import.meta.env.VITE_BACKEND}/user/portal-session`, { withCredentials: true })
      .then(({ data }) => {
        if (mounted) {
          setSession(data);
          setActiveItem(data.menu[0]?.id ?? '');
        }
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const responseMessage = axios.isAxiosError(error)
          ? error.response?.data?.toast_message || error.response?.data?.message
          : undefined;
        setSessionError(
          typeof responseMessage === 'string'
            ? responseMessage
            : 'Portal sesija nije mogla biti potvrđena. Proverite vezu sa serverom.'
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND}/user/portal-logout`, {}, { withCredentials: true });
    } finally {
      window.location.replace('/portal/login');
    }
  };

  if (sessionError) {
    return (
      <Stack align="center" gap="md" py="xl">
        <Text c="red" ta="center">{sessionError}</Text>
        <Button onClick={() => window.location.replace('/portal/login')}>Nazad na prijavu</Button>
      </Stack>
    );
  }

  if (!session) {
    return <Text ta="center" py="xl">Provera pristupa portal konzoli…</Text>;
  }

  return (
    <AppShell
      padding="md"
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
    >
      <AppShell.Header px="md">
        <Group h="100%" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />

            <Group gap="xs">
              <img
                src="/favicon.png"
                alt="Iskra Logo"
                style={{ height: 28, width: 28, objectFit: 'contain' }}
              />
              <Text fw={800} size="xl" lh={1}>
                Iskra
              </Text>
            </Group>

            <Badge variant="light" color="blue" size="sm" radius="xs" visibleFrom="xs">
              Administrativni portal
            </Badge>
          </Group>

          <Group>
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton
                  p="xs"
                  style={{
                    borderRadius: 'var(--mantine-radius-xs)',
                    transition: 'background-color 150ms ease',
                  }}
                  className="hover:bg-gray-100 dark:hover:bg-dark-6"
                >
                  <Group gap="xs">
                    <Avatar radius="xl" size="sm" color="blue">
                      {session.user.name.slice(0, 1).toUpperCase()}
                    </Avatar>
                    <Box visibleFrom="xs">
                      <Text size="sm" fw={600} lh={1}>
                        {session.user.name}
                      </Text>
                      <Text size="xs" c="dimmed" lh={1} mt={3}>
                        {roleLabels[session.user.role]}
                      </Text>
                    </Box>
                    <ChevronDownIcon size={14}  />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>


                <Menu.Item
                  color="red"
                  leftSection={<LogOutIcon size={14} />}
                  onClick={handleLogout}
                >
                  Odjavi se
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar>
        {session.menu.map((item) => {
          const Icon = menuIcons[item.id as keyof typeof menuIcons] ?? Home;
          return (
            <NavLink
              key={item.id}
              active={activeItem === item.id}
              className={`${activeItem === item.id ? "!border-[#228be6] !border-l-2" : ""}`}
              label={item.label}
              leftSection={<Icon size={20} />}
              variant="light"
              onClick={() => setActiveItem(item.id)}
            />
          );
        })}
      </AppShell.Navbar>

      <AppShell.Main>
        <PageTitle text={session.menu.find((item) => item.id === activeItem)?.label ?? 'Portal'}></PageTitle>
        <ActionButtonsBlock title={`Dobro došli, ${session.user.name}`}>
                <Button onClick={()=>{console.log("1")}}>Prvo dugme</Button>
                <Button onClick={()=>{console.log("2")}} variant='light'>Drugo dugme</Button>
        </ActionButtonsBlock>
      </AppShell.Main>
    </AppShell>
  );
}