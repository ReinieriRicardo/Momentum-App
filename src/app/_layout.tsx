import { useEffect } from 'react';
import { Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingScreen } from '@/components/LoadingScreen';
import { colores } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { HabitsProvider } from '@/context/HabitsContext';
import { configurarManejadorNotificaciones } from '@/services/notifications';


//crear un tema y exportarlo para usarlo en la app
const tema = {
  dark: false,
  colors: {
    primary: colores.primario,
    background: colores.fondo,
    card: colores.superficie,
    text: colores.texto,
    border: colores.borde,
    notification: colores.peligro,
  },
  fonts: {
    regular: { fontFamily: 'sans-serif', fontWeight: '400' as const },
    medium: { fontFamily: 'sans-serif-medium', fontWeight: '500' as const },
    bold: { fontFamily: 'sans-serif', fontWeight: '700' as const },
    heavy: { fontFamily: 'sans-serif', fontWeight: '800' as const },
  },
};


//crear un navegador y exportarlo para usarlo en la app
function Navegador() {
  const { usuario, cargando } = useAuth();

  if (cargando) return <LoadingScreen />;

  return (
    <HabitsProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colores.superficie },
          headerTintColor: colores.texto,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: colores.fondo },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Protected guard={!usuario}>
          <Stack.Screen name="login" options={{ headerShown: false, title: 'Iniciar sesión' }} />
          <Stack.Screen name="registro" options={{ title: 'Crear cuenta' }} />
        </Stack.Protected>
        <Stack.Protected guard={Boolean(usuario)}>
          <Stack.Screen name="home" options={{ headerShown: false, title: 'Mis hábitos' }} />
          <Stack.Screen name="crear-habito" options={{ title: 'Nuevo hábito' }} />
        </Stack.Protected>
      </Stack>
    </HabitsProvider>
  );
}


//crear un layout y exportarlo para usarlo en la app
export default function RootLayout() {
  useEffect(() => {
    void configurarManejadorNotificaciones();
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={tema}>
        <StatusBar style="dark" />
        <Navegador />
      </ThemeProvider>
    </AuthProvider>
  );
}
