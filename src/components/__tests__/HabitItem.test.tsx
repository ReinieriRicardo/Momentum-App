import { fireEvent, render } from '@testing-library/react-native';

import { HabitItem } from '@/components/HabitItem';
import type { Habito } from '@/types';

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
    const pantalla = await render(
      <HabitItem habito={habito} realizado={false} onAlternar={onAlternar} onEliminar={jest.fn()} />,
    );

    expect(pantalla.getByText('Leer 20 minutos')).toBeTruthy();
    expect(pantalla.getByText('Hábito diario')).toBeTruthy();
    expect(pantalla.getByText('🔔 Todos los días a las 21:30')).toBeTruthy();

    await fireEvent.press(pantalla.getByRole('checkbox'));
    expect(onAlternar).toHaveBeenCalledTimes(1);
  });

  it('permite eliminar el hábito', async () => {
    const onEliminar = jest.fn();
    const pantalla = await render(
      <HabitItem habito={habito} realizado={false} onAlternar={jest.fn()} onEliminar={onEliminar} />,
    );

    await fireEvent.press(pantalla.getByRole('button', { name: 'Eliminar Leer 20 minutos' }));
    expect(onEliminar).toHaveBeenCalledTimes(1);
  });
});
