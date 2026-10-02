import {
  Paper,
  TextInput,
  PasswordInput,
  PinInput,
  Button,
  Text,
  Container,
  Stack,
  Image,
  Box,    // <-- PROMENJENO: Dodat Box
  Center, // <-- PROMENJENO: Dodat Center
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';

type PortalOtpSetup = { secret: string; otpauthUrl: string };

export default function PortalLogin() {
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [otpSetup, setOtpSetup] = useState<PortalOtpSetup | null>(null);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      otp: '',
    },

    validate: {
      username: (val) => (val.trim().length < 3 ? 'Korisničko ime je prekratko' : null),
      password: (val) => (val.length === 0 ? 'Unesite lozinku' : null),
    },
  });

  useEffect(() => {
    let mounted = true;
    axios.get(`${import.meta.env.VITE_BACKEND}/user/portal-session`, { withCredentials: true })
      .then(() => {
        if (mounted) window.location.replace('/portal/dashboard');
      })
      .catch(() => {
        //Ovi neprijavljeni ostaju na stranici
      })
      .finally(() => {
        if (mounted) setCheckingSession(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setErrorMessage(null);

    const { username, password, otp } = values;

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND}/user/portal-login`,
        { username: username.trim(), password, otp },
        { withCredentials: true }
      );

      if (res.status === 200) {
        window.location.href = '/portal/dashboard';
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 428) {
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_BACKEND}/user/portal-otp/setup`,
            { username: username.trim(), password },
            { withCredentials: true }
          );
          setOtpSetup(data.otp);
          setErrorMessage('Prvo skenirajte QR kod autentifikatorom, pa unesite šestocifreni kod.');
          return;
        } catch (setupError: unknown) {
          const setupMessage = axios.isAxiosError(setupError)
            ? setupError.response?.data?.toast_message || setupError.response?.data?.message
            : undefined;
          setErrorMessage(
            typeof setupMessage === 'string' ? setupMessage : 'Podešavanje OTP autentifikatora nije uspelo.'
          );
          return;
        }
      }

      const responseMessage = axios.isAxiosError(err)
        ? err.response?.data?.toast_message || err.response?.data?.message
        : undefined;
      setErrorMessage(
        typeof responseMessage === 'string' ? responseMessage : 'Došlo je do greške prilikom prijave.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      // <-- PROMENJENO: Centriranje loading ekrana
      <Center style={{ minHeight: '100vh' }}>
        <Text ta="center">Provera portal sesije…</Text>
      </Center>
    );
  }

  const bgImageUrl = '/tvrdjava-2.jpg';

  return (
    <Box
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55)), url(${bgImageUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
      }}
    >
      <Container size={420} style={{ width: '100%' }}>
        <Paper
          withBorder
          shadow="xl"
          p={30}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.96)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Image src="/favicon.png" w={50} m="auto" />
          <Text size="lg" fw={700} ta="center" mt={15}>
            Iskra - administrativni portal
          </Text>

          <form onSubmit={form.onSubmit(handleSubmit)} style={{ marginTop: '20px' }}>
            <Stack gap="md">
              <TextInput
                label="Korisničko ime"
                autoComplete="username"
                autoFocus
                required
                {...form.getInputProps('username')}
              />

              <PasswordInput
                label="Lozinka"
                autoComplete="current-password"
                required
                {...form.getInputProps('password')}
              />

              <Text size="sm" fw={500}>Portal verifikacioni kod</Text>
              <PinInput
                length={6}
                type="number"
                oneTimeCode
                size="md"
                aria-label="Šestocifreni portal OTP kod"
                {...form.getInputProps('otp')}
              />

              {otpSetup && (
                <Paper withBorder p="md" radius={0}>
                  <Stack align="center" gap="sm">
                    <Text size="sm" ta="center">
                      Skenirajte kod aplikacijom kao što su Google Authenticator, Microsoft Authenticator ili 1Password.
                    </Text>
                    <QRCodeSVG value={otpSetup.otpauthUrl} size={180} aria-label="QR kod za podešavanje autentifikatora" />
                    <Text size="xs" ta="center" c="dimmed">Rezervni ključ — sačuvajte ga na sigurnom mestu:</Text>
                    <Text size="sm" ff="monospace" ta="center" style={{ overflowWrap: 'anywhere' }}>
                      {otpSetup.secret}
                    </Text>
                  </Stack>
                </Paper>
              )}

              {errorMessage && (
                <Text c={otpSetup ? 'blue' : 'red'} size="sm" ta="center">
                  {errorMessage}
                </Text>
              )}

              <Button type="submit" fullWidth mt="md" loading={loading}>
                Prijavi se
              </Button>
            </Stack>
          </form>
        </Paper>

        {/* PROMENJENO: Boja teksta promenjena u belu radi uočljivosti na tamnijoj pozadini */}
        <Text c="white" size="xs" fs="italic" ta="center" mt={15} style={{ opacity: 0.85 }}>
          Svaki neovlašćeni pristup portalu kažnjiv je po odredbama Krivičnog Zakonika Republike Srbije
        </Text>
      </Container>
    </Box>
  );
}