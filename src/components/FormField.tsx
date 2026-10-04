import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colores, radios } from '@/constants/theme';

type FormFieldProps = TextInputProps & {
  etiqueta: string;
  error?: string;
};

export function FormField({ etiqueta, error, ...props }: FormFieldProps) {
  return (
    <View style={styles.contenedor}>
      <Text style={styles.etiqueta}>{etiqueta}</Text>
      <TextInput
        accessibilityLabel={etiqueta}
        placeholderTextColor={colores.textoSecundario}
        style={[styles.input, error && styles.inputError]}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { gap: 7 },
  etiqueta: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  input: {
    minHeight: 52,
    borderWidth: 1,
    borderColor: colores.borde,
    borderRadius: radios.mediano,
    backgroundColor: colores.superficie,
    color: colores.texto,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  inputError: { borderColor: colores.peligro },
  error: { color: colores.peligro, fontSize: 13 },
});
