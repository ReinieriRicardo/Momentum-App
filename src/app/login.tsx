import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { colores } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';


//pantalla de inicio de sesion
export default function LoginScreen() {
  const { iniciarSesion } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);


  //manejador para iniciar sesion
  async function enviar() {
    setError('');
    setEnviando(true);
    try {
      const resultado = await iniciarSesion(usuario, contrasena);
      if (!resultado.ok) {
        setError(resultado.mensaje ?? 'No pudimos iniciar sesión.');
        return;
      }
      router.replace('/home');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={styles.pantalla}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contenedor}
      >
        <View style={styles.marca}>
          <View style={styles.logo}>
            <Text style={styles.logoTexto}>M</Text>
          </View>
          <Text style={styles.titulo}>Momentum</Text>
          <Text style={styles.subtitulo}>Pequeños hábitos, grandes avances.</Text>
        </View>

        <View style={styles.formulario}>
          <FormField
            autoCapitalize="none"
            autoComplete="username"
            etiqueta="Usuario"
            onChangeText={setUsuario}
            onSubmitEditing={enviar}
            placeholder="Ingresá tu usuario"
            returnKeyType="next"
            value={usuario}
          />
          <FormField
            autoComplete="password"
            etiqueta="Contraseña"
            onChangeText={setContrasena}
            onSubmitEditing={enviar}
            placeholder="Ingresá tu contraseña"
            returnKeyType="done"
            secureTextEntry
            value={contrasena}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton cargando={enviando} onPress={enviar} titulo="Iniciar sesión" />
        </View>

        <TouchableOpacity
          accessibilityRole="link"
          onPress={() => router.push('/registro')}
          style={styles.enlace}
        >
          <Text style={styles.enlaceTexto}>
            ¿Todavía no tenés cuenta? <Text style={styles.enlaceDestacado}>Registrate</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenedor: { flex: 1, justifyContent: 'center', paddingHorizontal: 24, gap: 30 },
  marca: { alignItems: 'center', gap: 8 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colores.primario,
    marginBottom: 5,
  },
  logoTexto: { color: '#FFFFFF', fontSize: 38, fontWeight: '900' },
  titulo: { color: colores.texto, fontSize: 32, fontWeight: '900' },
  subtitulo: { color: colores.textoSecundario, fontSize: 15 },
  formulario: { gap: 16 },
  error: { color: colores.peligro, fontSize: 14, textAlign: 'center' },
  enlace: { alignItems: 'center', padding: 10 },
  enlaceTexto: { color: colores.textoSecundario, fontSize: 14 },
  enlaceDestacado: { color: colores.primarioOscuro, fontWeight: '800' },
});
