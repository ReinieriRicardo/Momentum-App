import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colores } from '@/constants/theme';

export function LoadingScreen() {
  return (
    <View style={styles.contenedor}>
      <ActivityIndicator color={colores.primario} size="large" />
      <Text style={styles.texto}>Preparando Momentum...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    backgroundColor: colores.fondo,
  },
  texto: { color: colores.textoSecundario, fontSize: 15 },
});
