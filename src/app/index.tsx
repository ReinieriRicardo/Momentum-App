import { Redirect } from 'expo-router';

import { useAuth } from '@/context/AuthContext';

export default function IndexScreen() {
  const { usuario } = useAuth();
  return <Redirect href={usuario ? '/home' : '/login'} />;
}
