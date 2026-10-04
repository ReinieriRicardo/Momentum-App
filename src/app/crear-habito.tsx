import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';

import { AppButton } from '@/components/AppButton';
import { FormField } from '@/components/FormField';
import { colores, radios } from '@/constants/theme';
import { useHabitos } from '@/context/HabitsContext';
import { esExpoGoAndroid } from '@/services/notifications';
import { nombreDiaSemana, validarHabito } from '@/utils/validation';
import type { FrecuenciaHabito } from '@/types';

const FRECUENCIAS: FrecuenciaHabito[] = ['Diario', 'Semanal'];

export default function CrearHabitoScreen() {
  const { agregarHabito } = useHabitos();
  const recordatoriosDisponibles = !esExpoGoAndroid();
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [frecuencia, setFrecuencia] = useState<FrecuenciaHabito>('Diario');
  const [recordatorioActivo, setRecordatorioActivo] = useState(recordatoriosDisponibles);
  const [horaRecordatorio, setHoraRecordatorio] = useState('09:00');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    const mensaje = validarHabito(titulo, frecuencia, recordatorioActivo, horaRecordatorio);
    if (mensaje) {
      setError(mensaje);
      return;
    }

    setError('');
    setGuardando(true);
    try {
      const resultado = await agregarHabito({
        titulo,
        descripcion,
        frecuencia,
        recordatorioActivo,
        horaRecordatorio,
      });
      const detalle = resultado.notificacionProgramada
        ? ` El recordatorio quedó programado a las ${horaRecordatorio}.`
        : recordatorioActivo
          ? ' El hábito se guardó, pero no se autorizó la notificación.'
          : '';
      Alert.alert('Hábito creado', `Tu hábito se guardó correctamente.${detalle}`, [
        { text: 'Continuar', onPress: () => router.replace('/home') },
      ]);
    } catch {
      setError('No pudimos guardar el hábito. Intentá nuevamente.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.pantalla}
    >
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.titulo}>¿Qué querés convertir en hábito?</Text>
          <Text style={styles.subtitulo}>Elegí si querés realizarlo cada día o una vez por semana.</Text>
        </View>

        <View style={styles.tarjeta}>
          <FormField
            etiqueta="Nombre del hábito"
            maxLength={50}
            onChangeText={setTitulo}
            placeholder="Ej.: Tomar agua"
            value={titulo}
          />
          <FormField
            etiqueta="Descripción (opcional)"
            maxLength={140}
            multiline
            numberOfLines={3}
            onChangeText={setDescripcion}
            placeholder="Ej.: Beber un vaso al comenzar el día"
            textAlignVertical="top"
            value={descripcion}
          />

          <View style={styles.grupo}>
            <Text style={styles.etiqueta}>Frecuencia</Text>
            <View style={styles.opciones}>
              {FRECUENCIAS.map((opcion) => (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ selected: frecuencia === opcion }}
                  key={opcion}
                  onPress={() => setFrecuencia(opcion)}
                  style={[styles.opcion, frecuencia === opcion && styles.opcionActiva]}
                >
                  <Text style={[styles.opcionTexto, frecuencia === opcion && styles.opcionTextoActivo]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            accessibilityRole="switch"
            accessibilityState={{ checked: recordatorioActivo, disabled: !recordatoriosDisponibles }}
            activeOpacity={0.8}
            disabled={!recordatoriosDisponibles}
            onPress={() => setRecordatorioActivo((activo) => !activo)}
            style={[styles.recordatorio, !recordatoriosDisponibles && styles.recordatorioDeshabilitado]}
          >
            <View style={styles.recordatorioTexto}>
              <Text style={styles.recordatorioTitulo}>Recordatorio local</Text>
              <Text style={styles.recordatorioAyuda}>
                {recordatoriosDisponibles
                  ? 'Se mostrará 10 segundos después de crear el hábito.'
                  : 'En Android se prueba con la development build, no dentro de Expo Go.'}
              </Text>
            </View>
            <View style={[styles.interruptor, recordatorioActivo && styles.interruptorActivo]}>
              <View style={[styles.interruptorPunto, recordatorioActivo && styles.interruptorPuntoActivo]} />
            </View>
          </TouchableOpacity>

          {recordatorioActivo && recordatoriosDisponibles ? (
            <View style={styles.horario}>
              <FormField
                autoCapitalize="none"
                etiqueta="Hora del recordatorio"
                maxLength={5}
                onChangeText={(valor) => setHoraRecordatorio(valor.replace(/[^\d:]/g, ''))}
                placeholder="09:00"
                value={horaRecordatorio}
              />
              <Text style={styles.horarioAyuda}>
                {frecuencia === 'Diario'
                  ? 'Se repetirá todos los días a esta hora.'
                  : `Se repetirá cada ${nombreDiaSemana(new Date().getDay() + 1)} a esta hora.`}
              </Text>
            </View>
          ) : null}

          {error ? <Text style={styles.error}>{error}</Text> : null}
          <AppButton cargando={guardando} onPress={guardar} titulo="Guardar hábito" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, gap: 22, paddingBottom: 40 },
  intro: { gap: 7 },
  titulo: { color: colores.texto, fontSize: 25, fontWeight: '900', lineHeight: 31 },
  subtitulo: { color: colores.textoSecundario, fontSize: 15, lineHeight: 22 },
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.grande,
    borderWidth: 1,
    gap: 19,
    padding: 20,
  },
  grupo: { gap: 9 },
  etiqueta: { color: colores.texto, fontSize: 14, fontWeight: '700' },
  opciones: { gap: 8 },
  opcion: {
    borderColor: colores.borde,
    borderRadius: radios.pequeno,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  opcionActiva: { backgroundColor: colores.primarioSuave, borderColor: colores.primario },
  opcionTexto: { color: colores.textoSecundario, fontSize: 14 },
  opcionTextoActivo: { color: colores.primarioOscuro, fontWeight: '800' },
  recordatorio: {
    alignItems: 'center',
    backgroundColor: '#FAFAFD',
    borderRadius: radios.mediano,
    flexDirection: 'row',
    gap: 14,
    padding: 14,
  },
  recordatorioDeshabilitado: { opacity: 0.65 },
  horario: { gap: 7 },
  horarioAyuda: { color: colores.textoSecundario, fontSize: 12, lineHeight: 17 },
  recordatorioTexto: { flex: 1, gap: 3 },
  recordatorioTitulo: { color: colores.texto, fontSize: 15, fontWeight: '800' },
  recordatorioAyuda: { color: colores.textoSecundario, fontSize: 12, lineHeight: 17 },
  interruptor: {
    backgroundColor: colores.borde,
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    padding: 3,
    width: 52,
  },
  interruptorActivo: { backgroundColor: colores.primario },
  interruptorPunto: { backgroundColor: '#FFFFFF', borderRadius: 12, height: 24, width: 24 },
  interruptorPuntoActivo: { alignSelf: 'flex-end' },
  error: { color: colores.peligro, fontSize: 14, textAlign: 'center' },
});
