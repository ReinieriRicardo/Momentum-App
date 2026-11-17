import { Platform } from 'react-native';

import type { Habito, UbicacionHabito } from '@/types';

export class PermisoDispositivoRechazado extends Error {
  constructor(public readonly recurso: string, public readonly puedeVolverAPedir: boolean) {
    super(`Se rechazó el permiso para acceder a ${recurso}.`);
    this.name = 'PermisoDispositivoRechazado';
  }
}

export async function obtenerUbicacionActual(): Promise<UbicacionHabito> {
  const Location = await import('expo-location');
  const permiso = await Location.requestForegroundPermissionsAsync();
  if (!permiso.granted) {
    throw new PermisoDispositivoRechazado('la ubicación', permiso.canAskAgain);
  }

  const posicion = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  let direccion: string | undefined;
  try {
    const [resultado] = await Location.reverseGeocodeAsync({
      latitude: posicion.coords.latitude,
      longitude: posicion.coords.longitude,
    });
    direccion = resultado
      ? [resultado.street, resultado.streetNumber, resultado.city, resultado.region]
          .filter(Boolean)
          .join(', ')
      : undefined;
  } catch {
    // La dirección es opcional; las coordenadas siguen siendo suficientes.
  }

  return {
    latitud: posicion.coords.latitude,
    longitud: posicion.coords.longitude,
    direccion,
  };
}

export async function seleccionarContacto(): Promise<{ id: string; nombre: string } | null> {
  if (Platform.OS === 'web') throw new Error('La selección de contactos está disponible en iOS y Android.');
  const { Contact } = await import('expo-contacts');
  const contacto = await Contact.presentPicker();
  if (!contacto) return null;
  return { id: contacto.id, nombre: (await contacto.getFullName()) || 'Contacto sin nombre' };
}

function proximaFechaDelHabito(habito: Habito) {
  const ahora = new Date();
  if (!habito.horaRecordatorio) return new Date(ahora.getTime() + 60 * 60 * 1000);

  const [horas, minutos] = habito.horaRecordatorio.split(':').map(Number);
  const proxima = new Date(ahora);
  proxima.setHours(horas, minutos, 0, 0);
  if (proxima > ahora) return proxima;

  if (habito.frecuencia === 'Diario') {
    proxima.setDate(proxima.getDate() + 1);
  } else {
    const diaObjetivo = (habito.diaSemanaRecordatorio ?? ahora.getDay()) % 7;
    const diasHasta = (diaObjetivo - ahora.getDay() + 7) % 7 || 7;
    proxima.setDate(proxima.getDate() + diasHasta);
  }
  return proxima;
}

export async function crearEventoCalendarioHabito(habito: Habito) {
  if (Platform.OS === 'web') throw new Error('El calendario del dispositivo está disponible en iOS y Android.');
  const Calendar = await import('expo-calendar');

  const permiso = await Calendar.requestCalendarPermissions(Platform.OS === 'ios');
  if (!permiso.granted) {
    throw new PermisoDispositivoRechazado('el calendario', permiso.canAskAgain);
  }

  const calendarios = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
  const calendario = calendarios.find((item) => item.allowsModifications && item.isSynced !== false && (Platform.OS !== 'android' || item.isPrimary))
    ?? calendarios.find((item) => item.allowsModifications && item.isSynced !== false);
  if (!calendario) throw new Error('No encontramos un calendario del dispositivo donde guardar el evento.');

  const inicio = proximaFechaDelHabito(habito);
  const fin = new Date(inicio.getTime() + 30 * 60 * 1000);
  const evento = await calendario.createEvent({
    title: `Hábito: ${habito.titulo}`,
    notes: `Recordatorio de Momentum para el hábito «${habito.titulo}» (ID: ${habito.id}).`,
    startDate: inicio,
    endDate: fin,
    alarms: [{ relativeOffset: -5 }],
  });
  return { id: evento.id, fecha: inicio };
}
