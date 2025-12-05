import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { initDatabase } from './lib/database'; // <--- Importe aqui

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'login', 
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Inicializa o Banco de Dados SQLite ao carregar o app
      initDatabase()
        .then(() => console.log('Banco de dados SQLite inicializado'))
        .catch(err => console.log('Erro no DB:', err));
        
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" options={{ animation: 'fade' }} />
        <Stack.Screen name="cadastro" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
        <Stack.Screen 
            name="criar-anuncio" 
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }} 
        />
      </Stack>
    </ThemeProvider>
  );
}