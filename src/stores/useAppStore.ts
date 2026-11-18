import { create } from 'zustand';

import { cancelarRecordatorio, programarRecordatorioHabito } from '@/services/notifications';
import { almacenamiento } from '@/services/storage';
import type { ContactoAsociado, Habito, NuevoHabito, ResultadoAutenticacion, UbicacionHabito } from '@/types';
import { clavePeriodoActual, normalizarUsuario, validarCredenciales } from '@/utils/validation';

type ActualizacionHabito = Partial<Omit<Habito, 'id' | 'propietario' | 'creadoEn'>>;

type AppStore = {
  usuario: string | null;
  cargandoSesion: boolean;
  cargandoHabitos: boolean;
  habitos: Habito[];
  inicializarSesion: () => Promise<void>;
  iniciarSesion: (usuario: string, contrasena: string) => Promise<ResultadoAutenticacion>;
  registrar: (usuario: string, contrasena: string) => Promise<ResultadoAutenticacion>;
  cerrarSesion: () => Promise<void>;
  agregarHabito: (datos: NuevoHabito) => Promise<{ notificacionProgramada: boolean }>;
  actualizarHabito: (id: string, cambios: ActualizacionHabito) => Promise<void>;
  alternarHabito: (id: string) => Promise<void>;
  guardarEvidencia: (id: string, evidenciaUri: string) => Promise<void>;
  guardarUbicacion: (id: string, ubicacion: UbicacionHabito) => Promise<void>;
  guardarContacto: (id: string, contacto: ContactoAsociado) => Promise<void>;
  guardarEventoCalendario: (id: string, eventoId: string, fecha: string) => Promise<void>;
  eliminarHabito: (id: string) => Promise<void>;
};

export const useAppStore = create<AppStore>((set, get) => ({
  usuario: null,
  cargandoSesion: true,
  cargandoHabitos: false,
  habitos: [],

  async inicializarSesion() {
    set({ cargandoSesion: true });
    try {
      const [usuario, todos] = await Promise.all([
        almacenamiento.obtenerSesion(),
        almacenamiento.obtenerHabitos(),
      ]);
      set({
        usuario,
        habitos: usuario ? todos.filter((habito) => habito.propietario === usuario) : [],
        cargandoHabitos: false,
      });
    } finally {
      set({ cargandoSesion: false });
    }
  },

  async iniciarSesion(nombre, contrasena) {
    const error = validarCredenciales(nombre, contrasena);
    if (error) return { ok: false, mensaje: error };

    const nombreNormalizado = normalizarUsuario(nombre);
    const usuarios = await almacenamiento.obtenerUsuarios();
    const encontrado = usuarios.find(
      (item) => item.nombre === nombreNormalizado && item.contrasena === contrasena,
    );
    if (!encontrado) return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };

    set({ cargandoHabitos: true });
    await almacenamiento.guardarSesion(nombreNormalizado);
    const todos = await almacenamiento.obtenerHabitos();
    set({
      usuario: nombreNormalizado,
      habitos: todos.filter((habito) => habito.propietario === nombreNormalizado),
      cargandoHabitos: false,
    });
    return { ok: true };
  },

  async registrar(nombre, contrasena) {
    const error = validarCredenciales(nombre, contrasena);
    if (error) return { ok: false, mensaje: error };

    const nombreNormalizado = normalizarUsuario(nombre);
    const usuarios = await almacenamiento.obtenerUsuarios();
    if (usuarios.some((item) => item.nombre === nombreNormalizado)) {
      return { ok: false, mensaje: 'Ese usuario ya está registrado.' };
    }

    await almacenamiento.guardarUsuarios([
      ...usuarios,
      { nombre: nombreNormalizado, contrasena },
    ]);
    await almacenamiento.guardarSesion(nombreNormalizado);
    set({ usuario: nombreNormalizado, habitos: [], cargandoHabitos: false });
    return { ok: true };
  },

  async cerrarSesion() {
    await almacenamiento.borrarSesion();
    set({ usuario: null, habitos: [], cargandoHabitos: false });
  },

  async agregarHabito(datos) {
    const usuario = get().usuario;
    if (!usuario) throw new Error('No hay una sesión activa.');

    const recordatorio = datos.recordatorioActivo && datos.horaRecordatorio
      ? await programarRecordatorioHabito(datos.titulo, datos.frecuencia, datos.horaRecordatorio)
      : null;
    const nuevo: Habito = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      propietario: usuario,
      titulo: datos.titulo.trim(),
      descripcion: datos.descripcion.trim(),
      frecuencia: datos.frecuencia,
      realizadosEn: [],
      creadoEn: new Date().toISOString(),
      recordatorioActivo: Boolean(recordatorio),
      horaRecordatorio: recordatorio ? datos.horaRecordatorio : undefined,
      diaSemanaRecordatorio: recordatorio?.diaSemana,
      notificacionId: recordatorio?.id,
    };
    const todos = await almacenamiento.obtenerHabitos();
    const actualizados = [nuevo, ...todos];
    await almacenamiento.guardarHabitos(actualizados);
    set({ habitos: [nuevo, ...get().habitos] });
    return { notificacionProgramada: Boolean(recordatorio) };
  },

  async actualizarHabito(id, cambios) {
    const todos = await almacenamiento.obtenerHabitos();
    const actualizados = todos.map((habito) => habito.id === id ? { ...habito, ...cambios } : habito);
    await almacenamiento.guardarHabitos(actualizados);
    const usuario = get().usuario;
    set({ habitos: usuario ? actualizados.filter((habito) => habito.propietario === usuario) : [] });
  },

  async alternarHabito(id) {
    const habito = get().habitos.find((item) => item.id === id);
    if (!habito) return;
    const clave = clavePeriodoActual(habito.frecuencia);
    const realizadosEn = habito.realizadosEn.includes(clave)
      ? habito.realizadosEn.filter((periodo) => periodo !== clave)
      : [...habito.realizadosEn, clave];
    await get().actualizarHabito(id, { realizadosEn });
  },

  async guardarEvidencia(id, evidenciaUri) {
    await get().actualizarHabito(id, { evidenciaUri });
  },

  async guardarUbicacion(id, ubicacion) {
    await get().actualizarHabito(id, { ubicacion });
  },

  async guardarContacto(id, contacto) {
    await get().actualizarHabito(id, { contacto });
  },

  async guardarEventoCalendario(id, eventoId, fecha) {
    await get().actualizarHabito(id, { eventoCalendarioId: eventoId, eventoCalendarioFecha: fecha });
  },

  async eliminarHabito(id) {
    const elegido = get().habitos.find((habito) => habito.id === id);
    await cancelarRecordatorio(elegido?.notificacionId);
    const todos = await almacenamiento.obtenerHabitos();
    const actualizados = todos.filter((habito) => habito.id !== id);
    await almacenamiento.guardarHabitos(actualizados);
    const usuario = get().usuario;
    set({ habitos: usuario ? actualizados.filter((habito) => habito.propietario === usuario) : [] });
  },
}));
