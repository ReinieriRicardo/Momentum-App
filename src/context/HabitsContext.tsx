import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { cancelarRecordatorio, programarRecordatorioHabito } from '@/services/notifications';
import { almacenamiento } from '@/services/storage';
import type { Habito, NuevoHabito } from '@/types';
import { clavePeriodoActual } from '@/utils/validation';

//crear un contexto

type HabitsContextValue = {
  habitos: Habito[];
  cargandoHabitos: boolean;
  agregarHabito: (datos: NuevoHabito) => Promise<{ notificacionProgramada: boolean }>;
  alternarHabito: (id: string) => Promise<void>;
  eliminarHabito: (id: string) => Promise<void>;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);


export function HabitsProvider({ children }: React.PropsWithChildren) {
  const { usuario } = useAuth();
  const [habitos, setHabitos] = useState<Habito[]>([]);
  const [cargandoHabitos, setCargandoHabitos] = useState(true);

  useEffect(() => {
    let activo = true;

    almacenamiento.obtenerHabitos().then((todos) => {
      if (!activo) return;
      setHabitos(usuario ? todos.filter((habito) => habito.propietario === usuario) : []);
      setCargandoHabitos(false);
    });

    return () => {
      activo = false;
    };
  }, [usuario]);

  const value = useMemo<HabitsContextValue>(
    () => ({
      habitos,
      cargandoHabitos,
      async agregarHabito(datos) {
        if (!usuario) throw new Error('No hay una sesión activa.');

        const recordatorio = datos.recordatorioActivo && datos.horaRecordatorio
          ? await programarRecordatorioHabito(
              datos.titulo,
              datos.frecuencia,
              datos.horaRecordatorio,
            )
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
        await almacenamiento.guardarHabitos([nuevo, ...todos]);
        setHabitos((actuales) => [nuevo, ...actuales]);
        return { notificacionProgramada: Boolean(recordatorio) };
      },
      async alternarHabito(id) {
        const todos = await almacenamiento.obtenerHabitos();
        const alternar = (habito: Habito) => {
          if (habito.id !== id) return habito;
          const clave = clavePeriodoActual(habito.frecuencia);
          const yaRealizado = habito.realizadosEn.includes(clave);
          return {
            ...habito,
            realizadosEn: yaRealizado
              ? habito.realizadosEn.filter((periodo) => periodo !== clave)
              : [...habito.realizadosEn, clave],
          };
        };
        const actualizados = todos.map(alternar);
        await almacenamiento.guardarHabitos(actualizados);
        setHabitos((actuales) => actuales.map(alternar));
      },
      async eliminarHabito(id) {
        const todos = await almacenamiento.obtenerHabitos();
        const elegido = todos.find((habito) => habito.id === id);
        await cancelarRecordatorio(elegido?.notificacionId);
        await almacenamiento.guardarHabitos(todos.filter((habito) => habito.id !== id));
        setHabitos((actuales) => actuales.filter((habito) => habito.id !== id));
      },
    }),
    [cargandoHabitos, habitos, usuario],
  );

  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabitos() {
  const context = useContext(HabitsContext);
  if (!context) throw new Error('useHabitos debe usarse dentro de HabitsProvider.');
  return context;
}
