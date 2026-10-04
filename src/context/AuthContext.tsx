import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { almacenamiento } from '@/services/storage';
import type { ResultadoAutenticacion } from '@/types';
import { normalizarUsuario, validarCredenciales } from '@/utils/validation';

type AuthContextValue = {
  usuario: string | null;
  cargando: boolean;
  iniciarSesion: (usuario: string, contrasena: string) => Promise<ResultadoAutenticacion>;
  registrar: (usuario: string, contrasena: string) => Promise<ResultadoAutenticacion>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    almacenamiento
      .obtenerSesion()
      .then(setUsuario)
      .finally(() => setCargando(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      cargando,
      async iniciarSesion(nombre, contrasena) {
        const error = validarCredenciales(nombre, contrasena);
        if (error) return { ok: false, mensaje: error };

        const nombreNormalizado = normalizarUsuario(nombre);
        const usuarios = await almacenamiento.obtenerUsuarios();
        const encontrado = usuarios.find(
          (item) => item.nombre === nombreNormalizado && item.contrasena === contrasena,
        );

        if (!encontrado) {
          return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
        }

        await almacenamiento.guardarSesion(nombreNormalizado);
        setUsuario(nombreNormalizado);
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
        setUsuario(nombreNormalizado);
        return { ok: true };
      },
      async cerrarSesion() {
        await almacenamiento.borrarSesion();
        setUsuario(null);
      },
    }),
    [cargando, usuario],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
}
