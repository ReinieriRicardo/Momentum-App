import { useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { colores, radios } from '@/constants/theme';
import type { Habito } from '@/types';
import { nombreDiaSemana } from '@/utils/validation';

type HabitItemProps = {
  habito: Habito;
  realizado: boolean;
  onAlternar: () => void;
  onEliminar: () => void;
  onGuardarEvidencia?: (uri: string) => Promise<void>;
};

export function HabitItem({ habito, realizado, onAlternar, onEliminar, onGuardarEvidencia }: HabitItemProps) {
  const [seleccionandoFoto, setSeleccionandoFoto] = useState(false);
  const detalleRecordatorio = habito.horaRecordatorio
    ? habito.frecuencia === 'Diario'
      ? `Todos los días a las ${habito.horaRecordatorio}`
      : `Cada ${nombreDiaSemana(habito.diaSemanaRecordatorio ?? 0)} a las ${habito.horaRecordatorio}`
    : 'Recordatorio programado';

  async function seleccionarFoto(origen: 'camara' | 'galeria') {
    setSeleccionandoFoto(true);
    try {
      if (Platform.OS !== 'web') {
        const permiso = origen === 'camara'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permiso.granted) {
          const recurso = origen === 'camara' ? 'la cámara' : 'la galería de fotos';
          Alert.alert(
            'Permiso rechazado',
            permiso.canAskAgain
              ? `Momentum necesita permiso para acceder a ${recurso} y guardar la evidencia.`
              : `El permiso para acceder a ${recurso} está desactivado. Habilitalo desde la configuración del dispositivo.`,
          );
          return;
        }
      }

      const resultado = origen === 'camara'
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, quality: 0.75 });
      const uri = resultado.canceled ? undefined : resultado.assets[0]?.uri;
      if (uri && onGuardarEvidencia) await onGuardarEvidencia(uri);
    } catch {
      Alert.alert('No se pudo cargar la foto', 'Intentá nuevamente desde la cámara o la galería.');
    } finally {
      setSeleccionandoFoto(false);
    }
  }

  return (
    <View style={[styles.tarjeta, realizado && styles.tarjetaCompletada]}>
      <TouchableOpacity
        accessibilityLabel={realizado ? 'Marcar como pendiente' : 'Marcar como realizado'}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: realizado }}
        onPress={onAlternar}
        style={[styles.check, realizado && styles.checkActivo]}
      >
        <Text style={styles.checkTexto}>{realizado ? '✓' : ''}</Text>
      </TouchableOpacity>

      <View style={styles.contenido}>
        <Text style={[styles.titulo, realizado && styles.textoCompletado]}>
          {habito.titulo}
        </Text>
        <Text style={styles.frecuencia}>Hábito {habito.frecuencia.toLowerCase()}</Text>
        {habito.descripcion ? <Text style={styles.descripcion}>{habito.descripcion}</Text> : null}
        {habito.evidenciaUri ? (
          <Image accessibilityLabel={`Evidencia fotográfica de ${habito.titulo}`} source={{ uri: habito.evidenciaUri }} style={styles.evidencia} />
        ) : null}
        {seleccionandoFoto ? (
          <View style={styles.cargandoFoto}>
            <ActivityIndicator color={colores.primario} size="small" />
            <Text style={styles.ayudaFoto}>Esperando permiso o foto…</Text>
          </View>
        ) : (
          <View style={styles.accionesFoto}>
            <TouchableOpacity accessibilityRole="button" disabled={seleccionandoFoto} onPress={() => void seleccionarFoto('camara')} style={styles.botonFoto}>
              <Text style={styles.textoBotonFoto}>📷 {habito.evidenciaUri ? 'Cambiar' : 'Tomar foto'}</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" disabled={seleccionandoFoto} onPress={() => void seleccionarFoto('galeria')} style={styles.botonFoto}>
              <Text style={styles.textoBotonFoto}>▧ Elegir de galería</Text>
            </TouchableOpacity>
          </View>
        )}
        {habito.recordatorioActivo ? (
          <Text style={styles.recordatorio}>🔔 {detalleRecordatorio}</Text>
        ) : null}
      </View>

      <TouchableOpacity
        accessibilityLabel={`Eliminar ${habito.titulo}`}
        accessibilityRole="button"
        onPress={onEliminar}
        style={styles.eliminar}
      >
        <Text style={styles.eliminarTexto}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tarjeta: {
    backgroundColor: colores.superficie,
    borderColor: colores.borde,
    borderRadius: radios.mediano,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
  },
  tarjetaCompletada: { backgroundColor: colores.exitoSuave, borderColor: '#B9E8D8' },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderColor: colores.primario,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActivo: { backgroundColor: colores.exito, borderColor: colores.exito },
  checkTexto: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  contenido: { flex: 1, gap: 4 },
  titulo: { color: colores.texto, fontSize: 17, fontWeight: '800' },
  textoCompletado: { textDecorationLine: 'line-through', color: colores.textoSecundario },
  frecuencia: { color: colores.primarioOscuro, fontSize: 13, fontWeight: '700' },
  descripcion: { color: colores.textoSecundario, fontSize: 14, lineHeight: 20 },
  evidencia: { width: 150, height: 110, borderRadius: radios.pequeno, marginTop: 7, backgroundColor: colores.primarioSuave },
  accionesFoto: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 6 },
  botonFoto: { backgroundColor: colores.primarioSuave, borderRadius: radios.pequeno, paddingHorizontal: 9, paddingVertical: 7 },
  textoBotonFoto: { color: colores.primarioOscuro, fontSize: 11, fontWeight: '700' },
  cargandoFoto: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 8 },
  ayudaFoto: { color: colores.textoSecundario, fontSize: 12 },
  recordatorio: { color: colores.advertencia, fontSize: 12, marginTop: 3 },
  eliminar: { alignSelf: 'flex-start', paddingVertical: 4 },
  eliminarTexto: { color: colores.peligro, fontSize: 13, fontWeight: '700' },
});
