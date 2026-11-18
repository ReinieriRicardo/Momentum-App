import { fireEvent, render } from '@testing-library/react-native';
import { Alert } from 'react-native';

import { HabitItem } from '@/components/HabitItem';
import { useAppStore } from '@/stores/useAppStore';
import type { Habito } from '@/types';

jest.mock('@react-native-async-storage/async-storage', () =>
  // Jest necesita resolver este mock dentro de la fábrica.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('@/services/notifications', () => ({
  cancelarRecordatorio: jest.fn(),
  programarRecordatorioHabito: jest.fn(),
}));

const habito: Habito = {
  id: '1',
  propietario: 'ana',
  titulo: 'Leer 20 minutos',
  descripcion: 'Antes de dormir',
  frecuencia: 'Diario',
  realizadosEn: [],
  creadoEn: '2026-10-03T00:00:00.000Z',
  recordatorioActivo: true,
  horaRecordatorio: '21:30',
};

describe('HabitItem', () => {
  it('muestra la información del hábito y permite completarlo', async () => {
    const onAlternar = jest.fn();
    useAppStore.setState({ alternarHabito: onAlternar });
    const pantalla = await render(
      <HabitItem habito={habito} realizado={false} />,
    );

    expect(pantalla.getByText('Leer 20 minutos')).toBeTruthy();
    expect(pantalla.getByText('Hábito diario')).toBeTruthy();
    expect(pantalla.getByText('🔔 Todos los días a las 21:30')).toBeTruthy();

    await fireEvent.press(pantalla.getByRole('checkbox'));
    expect(onAlternar).toHaveBeenCalledTimes(1);
  });

  it('permite eliminar el hábito', async () => {
    const onEliminar = jest.fn();
    useAppStore.setState({ eliminarHabito: onEliminar });
    const alerta = jest.spyOn(Alert, 'alert').mockImplementation((_titulo, _mensaje, botones) => {
      botones?.find((boton) => boton.text === 'Eliminar')?.onPress?.();
    });
    const pantalla = await render(
      <HabitItem habito={habito} realizado={false} />,
    );

    await fireEvent.press(pantalla.getByRole('button', { name: 'Eliminar Leer 20 minutos' }));
    expect(onEliminar).toHaveBeenCalledTimes(1);
    alerta.mockRestore();
  });
});
