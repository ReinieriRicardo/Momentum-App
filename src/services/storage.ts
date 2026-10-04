import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Habito, Usuario } from '@/types';

const CLAVES = {
  usuarios: '@momentum/usuarios',
  sesion: '@momentum/sesion',
  habitos: '@momentum/habitos',
} as const;

async function leerJson<T>(clave: string, valorInicial: T): Promise<T> {
  const valor = await AsyncStorage.getItem(clave);
  return valor ? (JSON.parse(valor) as T) : valorInicial;
}

async function guardarJson<T>(clave: string, valor: T) {
  await AsyncStorage.setItem(clave, JSON.stringify(valor));
}

export const almacenamiento = {
  obtenerUsuarios: () => leerJson<Usuario[]>(CLAVES.usuarios, []),
  guardarUsuarios: (usuarios: Usuario[]) => guardarJson(CLAVES.usuarios, usuarios),
  obtenerSesion: () => AsyncStorage.getItem(CLAVES.sesion),
  guardarSesion: (usuario: string) => AsyncStorage.setItem(CLAVES.sesion, usuario),
  borrarSesion: () => AsyncStorage.removeItem(CLAVES.sesion),
  obtenerHabitos: () => leerJson<Habito[]>(CLAVES.habitos, []),
  guardarHabitos: (habitos: Habito[]) => guardarJson(CLAVES.habitos, habitos),
};
