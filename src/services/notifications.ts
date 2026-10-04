import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types';
import { getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications/build/NotificationPermissions';
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types';
import type { NotificationTriggerInput } from 'expo-notifications/build/Notifications.types';
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler';
import { cancelScheduledNotificationAsync } from 'expo-notifications/build/cancelScheduledNotificationAsync';
import { scheduleNotificationAsync } from 'expo-notifications/build/scheduleNotificationAsync';
import { setNotificationChannelAsync } from 'expo-notifications/build/setNotificationChannelAsync';
import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import type { FrecuenciaHabito } from '@/types';
import { interpretarHora } from '@/utils/validation';

const CANAL_HABITOS = 'habitos';

function usaCanalPropio() {
  return Platform.OS === 'android' && !isRunningInExpoGo();
}

export async function configurarManejadorNotificaciones() {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function prepararNotificaciones() {
  if (usaCanalPropio()) {
    await setNotificationChannelAsync(CANAL_HABITOS, {
      name: 'Recordatorios de hábitos',
      description: 'Avisos para mantener tus hábitos al día.',
      importance: AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 200, 250],
      lightColor: '#6D5EF7',
    });
  }

  const permisoActual = await getPermissionsAsync();
  if (permisoActual.status === 'granted') {
    return true;
  }

  const permisoSolicitado = await requestPermissionsAsync();
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

  const horario = interpretarHora(horaRecordatorio);
  if (!horario) return null;

  const diaSemana = frecuencia === 'Semanal' ? new Date().getDay() + 1 : undefined;
  const canal = usaCanalPropio() ? { channelId: CANAL_HABITOS } : {};
  const trigger: NotificationTriggerInput =
    frecuencia === 'Diario'
      ? {
          type: SchedulableTriggerInputTypes.DAILY,
          hour: horario.hora,
          minute: horario.minuto,
          ...canal,
        }
      : {
          type: SchedulableTriggerInputTypes.WEEKLY,
          weekday: diaSemana!,
          hour: horario.hora,
          minute: horario.minuto,
          ...canal,
        };

  const id = await scheduleNotificationAsync({
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

  await cancelScheduledNotificationAsync(notificacionId);
}
