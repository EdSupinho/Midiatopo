import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  useColorScheme,
  useWindowDimensions,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// --- TEMA ---
const THEME = {
  light: {
    text: '#1F2937',
    textLight: '#FFFFFF',
    textSecondary: '#6B7280',
    card: '#FFFFFF',
    shadow: '#000',
    overlay: 'rgba(0,0,0,0.4)',
    primary: '#1F41BB',
    iconBg: '#F3F4F6'
  },
  dark: {
    text: '#F9FAFB',
    textLight: '#FFFFFF',
    textSecondary: '#9CA3AF',
    card: '#1F2937',
    shadow: '#000',
    overlay: 'rgba(0,0,0,0.6)',
    primary: '#3B82F6',
    iconBg: '#374151'
  },
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const bannerImage = 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1000&auto=format&fit=crop';

  const menuItems = [
    { label: 'Novo Anúncio', icon: 'add', route: '/criar-anuncio', color: '#10B981' },
    { label: 'Meus Anúncios', icon: 'list', route: '/(drawer)/lista', color: '#3B82F6' },
    { label: 'Minha Assinatura', icon: 'diamond', route: '/(drawer)/planos', color: '#F59E0B' },
    { label: 'Carregar Ficheiros', icon: 'cloud-upload', route: "/(drawer)/carregar-ficheiros", color: '#8B5CF6' },
    { label: 'Divulgação', icon: 'megaphone', route: null, color: '#EF4444' },
    { label: 'Minhas Campanhas', icon: 'stats-chart', route: '/(drawer)/lista', color: '#EC4899' },
  ];

  return (
    <DashboardLayout>
      <View style={styles.container}>

        {}
        <View style={[styles.heroContainer, { shadowColor: colors.shadow }]}>
          <ImageBackground 
            source={{ uri: bannerImage }} 
            style={styles.heroImage} 
            imageStyle={{ borderRadius: 20 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(15, 23, 42, 0.9)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle}>Bem-vindo ao MídiaTopo</Text>
                <Text style={styles.heroSubtitle}>Gerencie seu marketing de forma simples.</Text>
                <TouchableOpacity style={styles.heroButton} onPress={() => router.push('/(drawer)/planos')}>
                  <Text style={styles.heroButtonText}>Ver Planos Premium</Text>
                  <Ionicons name="arrow-forward" size={16} color="#1F41BB" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </ImageBackground>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>Acesso Rápido</Text>
        
        <View style={styles.grid}>
            {menuItems.map((item, index) => (
                <TouchableOpacity 
                    key={index}
                    style={[
                        styles.card, 
                        { 
                            width: width > 600 ? '31%' : '48%', 
                            backgroundColor: colors.card,
                            shadowColor: colors.shadow
                        }
                    ]}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                        {/* @ts-ignore */}
                        <Ionicons name={item.icon} size={28} color={item.color} />
                    </View>
                    
                    <Text style={[styles.cardText, { color: colors.text }]}>
                        {item.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: 24 },
  
  heroContainer: {
    height: 200,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: { flex: 1, borderRadius: 20, justifyContent: 'flex-end', padding: 20 },
  heroContent: { gap: 4 },
  heroTitle: { color: '#FFF', fontSize: 24, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 12 },
  heroButton: { 
    backgroundColor: '#FFF', 
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20, 
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  heroButtonText: { color: '#1F41BB', fontWeight: '700', fontSize: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  
  card: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
    height: 130, 
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});