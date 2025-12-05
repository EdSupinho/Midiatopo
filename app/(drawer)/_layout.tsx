import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Drawer } from 'expo-router/drawer';
import CustomDrawerContent from '@/components/CustomDrawerContent';
import { useColorScheme } from 'react-native';

// --- TEMA REFINADO (Mais Minimalista) ---
const THEME = {
  light: {
    bg: '#FFFFFF',
    // Estilo "Tint": Fundo suave com texto colorido para o item ativo
    activeBg: '#EEF2FF', 
    activeTint: '#312E81', // Indigo escuro
    inactiveTint: '#64748B', // Slate 500
  },
  dark: {
    bg: '#0F172A', // Slate 950 (Mais profundo que antes)
    activeBg: '#1E293B', // Slate 800
    activeTint: '#818CF8', // Indigo 400
    inactiveTint: '#94A3B8', // Slate 400
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
          
          // Cores do Layout
          drawerStyle: { 
            backgroundColor: colors.bg, 
            width: 260 // Levemente mais estreito para ficar mais elegante
          },
          
          // Cores dos Itens
          drawerActiveBackgroundColor: colors.activeBg,
          drawerActiveTintColor: colors.activeTint,
          drawerInactiveTintColor: colors.inactiveTint,
          
          // Tipografia (Sem ícones, aumentamos o espaçamento das letras)
          drawerLabelStyle: { 
            marginLeft: 12, // Margem ajustada pois não há ícones
            fontSize: 14,   // Fonte um pouco menor para elegância
            fontWeight: '600',
            letterSpacing: 0.5 // Espaçamento sutil
          },
          
          // Formato do Botão
          drawerItemStyle: {
            borderRadius: 8,
            marginHorizontal: 12,
            marginVertical: 2, // Mais compacto verticalmente
            paddingVertical: 0, // Remove padding extra interno
          }
        }}
      >
        {/* --- ITENS VISÍVEIS (SEM ÍCONES) --- */}
        
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

        {/* --- ITENS OCULTOS --- */}
        
        <Drawer.Screen 
          name="perfil" 
          options={{ 
            drawerItemStyle: { display: 'none' },
            drawerLabel: 'Perfil'
          }} 
        />
        
        <Drawer.Screen 
          name="alterar-senha" 
          options={{ 
            drawerItemStyle: { display: 'none' },
            drawerLabel: 'Alterar Senha' 
          }} 
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}