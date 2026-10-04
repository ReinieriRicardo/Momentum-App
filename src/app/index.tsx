import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';


//pantalla principal de la app
export default function IndexScreen() {
  const { usuario } = useAuth();
  return <Redirect href={usuario ? '/home' : '/login'} />;
}
