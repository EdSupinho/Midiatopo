import { Text as ThemedText, View as ThemedView, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getUsers } from '@/lib/userStore';
import { useRouter, useNavigation } from 'expo-router';
import { DrawerActions, useFocusEffect } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  StatusBar,
  Pressable,
  useColorScheme,
  useWindowDimensions,
  Image,
  ActivityIndicator,
  Alert,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail } from '@/app/lib/database'; // <--- Importar função do SQLite

// --- TEMAS DE CORES ---
const LIGHT_THEME = {
  primary: '#1F41BB',
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  warning: '#F59E0B',
  success: '#10B981',
  danger: '#EF4444',
  topBarBg: '#FFFFFF',
  shadow: '#000000',
  inputBg: '#F3F4F6',
  bannerBg: '#FFFFFF',
  bannerBorder: '#E5E7EB',
  bannerIconBg: '#EFF6FF',
  bannerIconColor: '#1F41BB'
};

const DARK_THEME = {
  primary: '#3B82F6',
  background: '#111827',
  card: '#1F2937',
  text: '#F9FAFB',
  muted: '#9CA3AF',
  border: '#374151',
  warning: '#FBBF24',
  success: '#34D399',
  danger: '#F87171',
  topBarBg: '#1F2937',
  shadow: '#000000',
  inputBg: '#374151',
  bannerBg: '#1E293B',
  bannerBorder: '#374151',
  bannerIconBg: 'rgba(255,255,255,0.1)',
  bannerIconColor: '#FFFFFF'
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  showTrialBanner?: boolean;
  daysRemaining?: number;
  hideTopBar?: boolean;
  disableModal?: boolean; 
}

// --- MODAL MODERNO ---
function TrialDetailsModal({ visible, onClose, onViewPlans, theme }: any) {
    if (!visible) return null;
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
             <View style={modalStyles.overlay}>
                <View style={[modalStyles.content, { backgroundColor: theme.card }]}>
                    <View style={[modalStyles.headerDecoration, { backgroundColor: theme.primary }]} />
                    <View style={modalStyles.body}>
                        <View style={[modalStyles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
                            <Ionicons name="diamond" size={32} color={theme.primary} />
                        </View>
                        <Text style={[modalStyles.title, { color: theme.text }]}>Versão de Avaliação</Text>
                        <Text style={[modalStyles.description, { color: theme.muted }]}>
                            Você está no período de testes. Desbloqueie todo o potencial da plataforma fazendo o upgrade hoje.
                        </Text>
                        <View style={modalStyles.featuresContainer}>
                            <View style={[modalStyles.featureRow, { backgroundColor: theme.inputBg }]}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.success} />
                                <Text style={[modalStyles.featureText, { color: theme.text }]}>Acesso ao painel básico</Text>
                            </View>
                            <View style={[modalStyles.featureRow, { backgroundColor: theme.inputBg }]}>
                                <Ionicons name="lock-closed" size={20} color={theme.warning} />
                                <Text style={[modalStyles.featureText, { color: theme.text }]}>Agendamentos ilimitados</Text>
                            </View>
                        </View>
                        <View style={modalStyles.footer}>
                            <TouchableOpacity onPress={onClose} style={[modalStyles.buttonSecondary, { backgroundColor: theme.inputBg }]}>
                                <Text style={[modalStyles.buttonSecondaryText, { color: theme.muted }]}>Talvez depois</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onViewPlans} style={[modalStyles.buttonPrimary, { backgroundColor: theme.primary }]}>
                                <Text style={modalStyles.buttonPrimaryText}>Ver Planos Premium</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
             </View>
        </Modal>
    )
}

export default function DashboardLayout({
  children,
  showTrialBanner = true,
  daysRemaining = 60,
  disableModal = false,
  hideTopBar = false,
}: DashboardLayoutProps) {
  const [userName, setUserName] = useState('Usuário');
  const [userImage, setUserImage] = useState<string | null>(null); 
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const navigation = useNavigation();
  const router = useRouter();
  
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const isMobile = width < 768;

  // Carrega dados do usuário do SQLite sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUserData = async () => {
        try {
          // 1. Pega o email da sessão atual (salvo no login)
          const jsonValue = await AsyncStorage.getItem('currentUser');
          const sessionUser = jsonValue != null ? JSON.parse(jsonValue) : null;

          if (sessionUser?.email && isActive) {
             // 2. Busca dados atualizados do SQLite usando o email
             // "any" é usado aqui pois o tipo de retorno do DB pode variar
             const dbUser: any = await getUserByEmail(sessionUser.email);
             
             if (dbUser) {
                 setUserName(dbUser.nome);
                 setUserImage(dbUser.profile_image || null);
             }
             setIsImageLoading(false);
          }
        } catch (error) {
          console.log('Erro ao carregar dados do dashboard:', error);
          if (isActive) setIsImageLoading(false);
        }
      };

      loadUserData();

      return () => { isActive = false; };
    }, [])
  );

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const openMenu = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleLogout = async () => {
    Alert.alert(
        "Sair do Sistema",
        "Tem a certeza que deseja terminar a sessão?",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Sair", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        await AsyncStorage.removeItem('currentUser');
                        setIsDropdownOpen(false);
                        router.replace('/login');
                    } catch (e) {
                        console.error("Erro ao fazer logout", e);
                    }
                }
            }
        ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />
      
      {isDropdownOpen && (
        <Pressable 
            style={styles.dropdownOverlay} 
            onPress={() => setIsDropdownOpen(false)} 
        />
      )}

      {!hideTopBar && (
        <View style={[styles.topBar, { backgroundColor: theme.topBarBg, shadowColor: theme.shadow }]}>
          
          <View style={styles.leftSection}>
            <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
                <Ionicons name="grid-outline" size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.rightSection}>
            <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="notifications-outline" size={24} color={theme.text} />
                <View style={[styles.badge, { borderColor: theme.topBarBg }]} />
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.profilePill, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
                onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: userImage ? 'transparent' : theme.primary, overflow: 'hidden' }]}>
                {isImageLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                ) : userImage ? (
                    <Image 
                        source={{ uri: userImage }} 
                        style={{ width: '100%', height: '100%' }} 
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                )}
              </View>
              {!isMobile && (
                <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>{userName}</Text>
              )}
              <Ionicons 
                name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={12} 
                color={theme.muted} 
              />
            </TouchableOpacity>

            {isDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
                    
                    <TouchableOpacity 
                        style={styles.dropdownItem} 
                        onPress={() => {
                            setIsDropdownOpen(false);
                            router.push('/(drawer)/perfil');
                        }}
                    >
                        <Ionicons name="person-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Perfil do usuário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.dropdownItem} 
                        onPress={() => {
                            setIsDropdownOpen(false);
                            router.push('/(drawer)/AlterarSenhaScreen');
                        }}
                    >
                        <Ionicons name="settings-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Alterar Senha</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity 
                        style={styles.dropdownItem} 
                        onPress={() => {
                            setIsDropdownOpen(false);
                            router.push('/(drawer)/planos');
                        }}
                    >
                        <Ionicons name="arrow-up-circle-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Subscrição do usuário</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={styles.dropdownItem} 
                        onPress={() => {
                            setIsDropdownOpen(false);
                            Linking.openURL('https://midiatopo.com/ajuda');
                        }}
                    >
                        <View style={{width: 18}}>
                             <Ionicons name="help-circle-outline" size={18} color={theme.text} />
                        </View>
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Help Center</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                    <TouchableOpacity style={styles.dropdownItem} onPress={handleLogout}>
                        <Ionicons name="power-outline" size={18} color={theme.danger} />
                        <Text style={[styles.dropdownText, { color: theme.danger }]}>Sair</Text>
                    </TouchableOpacity>
                </View>
            )}
          </View>
        </View>
      )}

      {showTrialBanner && !hideTopBar && (
        <View style={[styles.bannerContainer, { backgroundColor: theme.background }]}>
            <View style={[
                styles.trialBanner, 
                { 
                    backgroundColor: theme.bannerBg, 
                    borderColor: theme.bannerBorder,
                    borderWidth: isDark ? 0 : 1, 
                    shadowColor: theme.shadow 
                }
            ]}>
                <View style={styles.trialContent}>
                    <View style={[styles.trialIcon, { backgroundColor: theme.bannerIconBg }]}>
                        <Ionicons name="gift-outline" size={18} color={theme.bannerIconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.trialTitle, { color: theme.muted }]}>Teste Premium</Text>
                        <Text style={[styles.trialText, { color: theme.text }]}>
                            Restam <Text style={{fontWeight: '700', color: theme.primary}}>{daysRemaining} dias</Text> de teste.
                        </Text>
                    </View>
                </View>
            
                <View style={styles.trialActions}>
                    <TouchableOpacity 
                        style={[styles.detailsButton, { borderColor: theme.border }]}
                        onPress={() => setModalVisible(true)}
                    >
                        <Text style={[styles.detailsButtonText, { color: theme.text }]}>Detalhes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.upgradeButton, { backgroundColor: theme.warning }]}
                        onPress={() => router.push('/(drawer)/planos')}
                    >
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      )}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <TrialDetailsModal
        visible={modalVisible && !disableModal}
        onClose={() => setModalVisible(false)}
        onViewPlans={() => {
            setModalVisible(false);
            router.push('/(drawer)/planos');
        }}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10, 
    zIndex: 1000, 
  },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1001 },
  iconButton: { padding: 8, borderRadius: 12, backgroundColor: 'transparent' },
  badge: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1 },
  profilePill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingLeft: 6, paddingRight: 12, borderRadius: 30, gap: 8, borderWidth: 1 },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 12 },
  profileName: { fontSize: 14, fontWeight: '600', maxWidth: 100 },
  dropdownOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 900, backgroundColor: 'transparent' },
  dropdownMenu: { position: 'absolute', top: 60, right: 0, width: 240, borderRadius: 12, paddingVertical: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 20, zIndex: 2000, borderWidth: 1 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, gap: 12 },
  dropdownText: { fontSize: 14, fontWeight: '500' },
  divider: { height: 1, marginVertical: 4 },
  bannerContainer: { paddingHorizontal: 20, paddingTop: 20, zIndex: 1 },
  trialBanner: { borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, flexWrap: 'wrap', gap: 10 },
  trialContent: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 200 },
  trialIcon: { padding: 8, borderRadius: 10 },
  trialTitle: { fontSize: 11, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  trialText: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  trialActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailsButton: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1 },
  detailsButtonText: { fontSize: 12, fontWeight: '600' },
  upgradeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },
  upgradeButtonText: { fontSize: 12, fontWeight: 'bold', color: '#3F2C05' },
  scrollView: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 40 },
});

const modalStyles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 5000, elevation: 5000 },
    content: { borderRadius: 24, width: '100%', maxWidth: 400, overflow: 'hidden', shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
    headerDecoration: { height: 8, width: '100%' },
    body: { padding: 24, alignItems: 'center' },
    iconContainer: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
    description: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
    featuresContainer: { width: '100%', gap: 12, marginBottom: 24 },
    featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderRadius: 8 },
    featureText: { fontSize: 13, fontWeight: '500', flex: 1 },
    footer: { width: '100%', gap: 12 },
    buttonSecondary: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    buttonSecondaryText: { fontWeight: '600', fontSize: 14 },
    buttonPrimary: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    buttonPrimaryText: { color: '#ffffff', fontWeight: '700', fontSize: 15 }
});