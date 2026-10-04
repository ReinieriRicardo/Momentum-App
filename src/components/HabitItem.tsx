import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colores, radios } from '@/constants/theme';
import type { Habito } from '@/types';
import { nombreDiaSemana } from '@/utils/validation';

type HabitItemProps = {
  habito: Habito;
  realizado: boolean;
  onAlternar: () => void;
  onEliminar: () => void;
};

export function HabitItem({ habito, realizado, onAlternar, onEliminar }: HabitItemProps) {
  const detalleRecordatorio = habito.horaRecordatorio
    ? habito.frecuencia === 'Diario'
      ? `Todos los días a las ${habito.horaRecordatorio}`
      : `Cada ${nombreDiaSemana(habito.diaSemanaRecordatorio ?? 0)} a las ${habito.horaRecordatorio}`
    : 'Recordatorio programado';

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
  recordatorio: { color: colores.advertencia, fontSize: 12, marginTop: 3 },
  eliminar: { alignSelf: 'flex-start', paddingVertical: 4 },
  eliminarTexto: { color: colores.peligro, fontSize: 13, fontWeight: '700' },
});
