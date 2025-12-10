import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useColorScheme } from 'react-native';

const THEME = {
  light: {
    bg: '#FFFFFF',
    activeBg: '#EEF2FF', 
    activeTint: '#312E81', 
    inactiveTint: '#64748B', 
  },
  dark: {
    bg: '#0F172A', 
    activeBg: '#1E293B', 
    activeTint: '#818CF8', 
    inactiveTint: '#94A3B8', 
  },
};

export default function DrawerLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          
          drawerStyle: { 
            backgroundColor: colors.bg, 
            width: 260 
          },
          
          drawerActiveBackgroundColor: colors.activeBg,
          drawerActiveTintColor: colors.activeTint,
          drawerInactiveTintColor: colors.inactiveTint,
          
          drawerLabelStyle: { 
            marginLeft: 12, 
            fontSize: 14,   
            fontWeight: '600',
            letterSpacing: 0.5
          },
          
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 12,
            marginVertical: 2, 
            paddingVertical: 0, 
          }
        }}
      >
        
        <Drawer.Screen 
          name="home" 
          options={{
            drawerLabel: 'Dashboard',
          }} 
        />

        <Drawer.Screen 
          name="lista" 
          options={{
            drawerLabel: 'Meus Anúncios',
          }} 
        />

        <Drawer.Screen 
          name="planos" 
          options={{
            drawerLabel: 'Planos & Assinatura',
          }} 
        />
        
        <Drawer.Screen 
          name="perfil" 
          options={{ 
            drawerItemStyle: { display: 'none' },
            drawerLabel: 'Perfil'
          }} 
        />
        
        <Drawer.Screen 
          name="AlterarSenhaScreen" 
          options={{ 
            drawerItemStyle: { display: 'none' },
            drawerLabel: 'Alterar Senha' 
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}