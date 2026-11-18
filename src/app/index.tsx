import { Redirect } from 'expo-router';

import { useAppStore } from '@/stores/useAppStore';


//pantalla principal de la app
export default function IndexScreen() {
  const usuario = useAppStore((estado) => estado.usuario);
  return <Redirect href={usuario ? '/home' : '/login'} />;
}
