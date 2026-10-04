import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import type { FrecuenciaHabito } from '@/types';
import { interpretarHora } from '@/utils/validation';

const CANAL_HABITOS = 'habitos';
type ModuloNotificaciones = typeof import('expo-notifications');

let cargaNotificaciones: Promise<ModuloNotificaciones> | null = null;

export function esExpoGoAndroid() {
  return Platform.OS === 'android' && isRunningInExpoGo();
}

async function obtenerNotificaciones() {
  if (esExpoGoAndroid()) return null;

  cargaNotificaciones ??= import('expo-notifications');
  return cargaNotificaciones;
}

export async function configurarManejadorNotificaciones() {
  const Notifications = await obtenerNotificaciones();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function prepararNotificaciones() {
  const Notifications = await obtenerNotificaciones();
  if (!Notifications) return false;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CANAL_HABITOS, {
      name: 'Recordatorios de hábitos',
      description: 'Avisos para mantener tus hábitos al día.',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#6D5EF7',
    });
  }

  const permisoActual = await Notifications.getPermissionsAsync();
  if (permisoActual.status === 'granted') {
    return true;
  }

  const permisoSolicitado = await Notifications.requestPermissionsAsync();
  return permisoSolicitado.status === 'granted';
}

export async function programarRecordatorioHabito(
  titulo: string,
  frecuencia: FrecuenciaHabito,
  horaRecordatorio: string,
) {
  const permitido = await prepararNotificaciones();
  if (!permitido) {
    return null;
  }

  const Notifications = await obtenerNotificaciones();
  const horario = interpretarHora(horaRecordatorio);
  if (!Notifications || !horario) return null;

  const diaSemana = frecuencia === 'Semanal' ? new Date().getDay() + 1 : undefined;
  const trigger =
    frecuencia === 'Diario'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: horario.hora,
          minute: horario.minuto,
          channelId: CANAL_HABITOS,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: diaSemana!,
          hour: horario.hora,
          minute: horario.minuto,
          channelId: CANAL_HABITOS,
        };

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: '¡Momento de mantener tu impulso!',
      body: `Recordá completar: ${titulo}`,
      data: { ruta: '/home' },
    },
    trigger,
  });

  return { id, diaSemana };
}

export async function cancelarRecordatorio(notificacionId?: string) {
  if (!notificacionId) return;

  const Notifications = await obtenerNotificaciones();
  await Notifications?.cancelScheduledNotificationAsync(notificacionId);
}
