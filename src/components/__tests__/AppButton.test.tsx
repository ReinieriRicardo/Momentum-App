import { fireEvent, render } from '@testing-library/react-native';

import { AppButton } from '@/components/AppButton';

describe('AppButton', () => {
  it('renderiza el título y responde al toque', async () => {
    const onPress = jest.fn();
    const pantalla = await render(<AppButton onPress={onPress} titulo="Guardar" />);

    await fireEvent.press(pantalla.getByRole('button', { name: 'Guardar' }));

    expect(pantalla.getByText('Guardar')).toBeTruthy();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('no responde mientras está deshabilitado', async () => {
    const onPress = jest.fn();
    const pantalla = await render(<AppButton deshabilitado onPress={onPress} titulo="Guardar" />);

    await fireEvent.press(pantalla.getByRole('button', { name: 'Guardar' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
