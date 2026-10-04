import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colores, radios } from '@/constants/theme';

type AppButtonProps = {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  cargando?: boolean;
  deshabilitado?: boolean;
  icono?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  titulo,
  onPress,
  variante = 'primario',
  cargando = false,
  deshabilitado = false,
  icono,
  style,
}: AppButtonProps) {
  const inactivo = cargando || deshabilitado;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ disabled: inactivo }}
      activeOpacity={0.82}
      disabled={inactivo}
      onPress={onPress}
      style={[
        styles.base,
        styles[variante],
        inactivo && styles.inactivo,
        style,
      ]}
    >
      {cargando ? (
        <ActivityIndicator color={variante === 'secundario' ? colores.primario : '#FFFFFF'} />
      ) : (
        <>
          {icono}
          <Text style={[styles.texto, variante === 'secundario' && styles.textoSecundario]}>
            {titulo}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radios.mediano,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primario: { backgroundColor: colores.primario },
  secundario: {
    backgroundColor: colores.primarioSuave,
    borderColor: colores.primario,
    borderWidth: 1,
  },
  peligro: { backgroundColor: colores.peligro },
  inactivo: { opacity: 0.55 },
  texto: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  textoSecundario: { color: colores.primarioOscuro },
});
