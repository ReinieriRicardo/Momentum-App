import { Alert, Button, FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/AppButton';
import { HabitItem } from '@/components/HabitItem';
import { LoadingScreen } from '@/components/LoadingScreen';
import { colores, radios } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useHabitos } from '@/context/HabitsContext';
import { estaRealizadoEnPeriodoActual } from '@/utils/validation';

//pantalla principal de la app
export default function HomeScreen() {
  const { usuario, cerrarSesion } = useAuth();
  const { habitos, cargandoHabitos, alternarHabito, eliminarHabito } = useHabitos();
  const completados = habitos.filter((habito) =>
    estaRealizadoEnPeriodoActual(habito.frecuencia, habito.realizadosEn),
  ).length;

  function confirmarEliminacion(id: string, titulo: string) {
    Alert.alert('Eliminar hábito', `¿Querés eliminar “${titulo}”?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => void eliminarHabito(id) },
    ]);
  }

  if (cargandoHabitos) return <LoadingScreen />;

  //mostrar la pantalla principal de la app
  return (
    <SafeAreaView edges={['top']} style={styles.pantalla}>
      <FlatList
        contentContainerStyle={[styles.contenido, habitos.length === 0 && styles.contenidoVacio]}
        data={habitos}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <View style={styles.filaSuperior}>
              <View style={styles.saludo}>
                <Text style={styles.marca}>MOMENTUM</Text>
                <Text style={styles.titulo}>Hola, {usuario}</Text>
              </View>
              <Button color={colores.peligro} onPress={() => void cerrarSesion()} title="Salir" />
            </View>

            <View style={styles.resumen}>
              <Text style={styles.resumenNumero}>{completados}/{habitos.length}</Text>
              <Text style={styles.resumenTexto}>hábitos realizados en su período actual</Text>
            </View>

            <View style={styles.seccionTitulo}>
              <View>
                <Text style={styles.tituloLista}>Mis hábitos</Text>
                <Text style={styles.ayuda}>Tocá el círculo para marcar un avance.</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.vacio}>
            <Text style={styles.vacioIcono}>◎</Text>
            <Text style={styles.vacioTitulo}>Empezá con un hábito</Text>
            <Text style={styles.vacioTexto}>
              Creá tu primer hábito y activá un recordatorio local para mantener el ritmo.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <HabitItem
            habito={item}
            realizado={estaRealizadoEnPeriodoActual(item.frecuencia, item.realizadosEn)}
            onAlternar={() => void alternarHabito(item.id)}
            onEliminar={() => confirmarEliminacion(item.id, item.titulo)}
          />
        )}
      />

      <View style={styles.accionFlotante}>
        <AppButton onPress={() => router.push('/crear-habito')} titulo="+ Crear hábito" />
      </View>
    </SafeAreaView>
  );
}


//exportar los estilos para usarlo en la app
const styles = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: colores.fondo },
  contenido: { padding: 20, paddingBottom: 110 },
  contenidoVacio: { flexGrow: 1 },
  cabecera: { gap: 22, marginBottom: 18 },
  filaSuperior: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  saludo: { gap: 4 },
  marca: { color: colores.primario, fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  titulo: { color: colores.texto, fontSize: 27, fontWeight: '900' },
  resumen: {
    backgroundColor: colores.primario,
    borderRadius: radios.grande,
    padding: 22,
  },
  resumenNumero: { color: '#FFFFFF', fontSize: 34, fontWeight: '900' },
  resumenTexto: { color: '#EDEAFF', fontSize: 15, marginTop: 2 },
  seccionTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  tituloLista: { color: colores.texto, fontSize: 21, fontWeight: '900' },
  ayuda: { color: colores.textoSecundario, fontSize: 13, marginTop: 3 },
  separador: { height: 12 },
  vacio: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 10 },
  vacioIcono: { color: colores.primario, fontSize: 56 },
  vacioTitulo: { color: colores.texto, fontSize: 20, fontWeight: '900' },
  vacioTexto: { color: colores.textoSecundario, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  accionFlotante: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 82,
  },
});
