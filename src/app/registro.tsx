import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { colores, radios } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';

export default function RegistroScreen() {
  const { registrar } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmacion, setConfirmacion] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function enviar() {
    setError('');
    if (contrasena !== confirmacion) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setEnviando(true);
    try {
      const resultado = await registrar(usuario, contrasena);
      if (!resultado.ok) {
        setError(resultado.mensaje ?? 'No pudimos crear la cuenta.');
        return;
      }
      router.replace('/home');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.pantalla}
    >
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.titulo}>Creá tu cuenta</Text>
          <Text style={styles.subtitulo}>
            Tus datos y hábitos se guardarán de forma local en este dispositivo.
          </Text>
        </View>

        <View style={styles.tarjeta}>
          <FormField
            autoCapitalize="none"
            etiqueta="Usuario"
            onChangeText={setUsuario}
            placeholder="Mínimo 3 caracteres"
            value={usuario}
          />
          <FormField
            etiqueta="Contraseña"
            onChangeText={setContrasena}
            placeholder="Mínimo 4 caracteres"
            secureTextEntry
            value={contrasena}
          />
          <FormField
            etiqueta="Repetir contraseña"
            onChangeText={setConfirmacion}
            onSubmitEditing={enviar}
            placeholder="Volvé a escribirla"
            returnKeyType="done"
            secureTextEntry
            value={confirmacion}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton cargando={enviando} onPress={enviar} titulo="Crear cuenta" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 24, gap: 24 },
  intro: { gap: 8 },
  titulo: { color: colores.texto, fontSize: 28, fontWeight: '900' },
  subtitulo: { color: colores.textoSecundario, fontSize: 15, lineHeight: 22 },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderRadius: radios.grande,
    borderWidth: 1,
    borderColor: colores.borde,
    gap: 17,
    padding: 20,
  },
  error: { color: colores.peligro, fontSize: 14, textAlign: 'center' },
});
