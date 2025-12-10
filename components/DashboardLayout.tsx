import { Text as ThemedText, View as ThemedView, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getUsers } from '@/lib/userStore';
import { useRouter, useNavigation, usePathname } from 'expo-router';
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
  Linking,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail } from '../app/lib/database';

// --- TEMA DE CORES ---
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
  bannerIconColor: '#1F41BB',
  bottomBarBg: '#FFFFFF',
  bottomBarBorder: '#E5E7EB'
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
  bannerIconColor: '#FFFFFF',
  bottomBarBg: '#1F2937',
  bottomBarBorder: '#374151'
};

// --- CÁLCULO DA BARRA DE STATUS ---
// Isso garante que os botões não fiquem embaixo do relógio/bateria
const STATUSBAR_HEIGHT = Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 44;
const HEADER_CONTENT_HEIGHT = 54; // Altura compacta do conteúdo da barra
const TOTAL_HEADER_HEIGHT = STATUSBAR_HEIGHT + HEADER_CONTENT_HEIGHT;

const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Pagamento Aprovado', desc: 'Sua assinatura foi renovada.', time: '2 min', type: 'success', icon: 'checkmark-circle' },
  { id: 2, title: 'Nova Campanha', desc: 'Campanha de Verão disponível.', time: '1h', type: 'info', icon: 'megaphone' },
  { id: 3, title: 'Atualize seu Perfil', desc: 'Adicione um número de telefone.', time: '3h', type: 'warning', icon: 'alert-circle' },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
  showTrialBanner?: boolean;
  daysRemaining?: number;
  hideTopBar?: boolean;
  disableModal?: boolean; 
}

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
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null); 
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  
  const navigation = useNavigation();
  const router = useRouter();
  const pathname = usePathname();
  
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? DARK_THEME : LIGHT_THEME;
  const isMobile = width < 768;

  const bottomNavItems = [
    { label: 'Home', icon: 'grid-outline', activeIcon: 'grid', route: '/(drawer)/home' },
    { label: 'Anúncios', icon: 'list-outline', activeIcon: 'list', route: '/(drawer)/lista' },
    { label: 'Novo', icon: 'add-circle-outline', activeIcon: 'add-circle', route: '/criar-anuncio', isSpecial: true },
    { label: 'Planos', icon: 'card-outline', activeIcon: 'card', route: '/(drawer)/planos' },
    { label: 'Perfil', icon: 'person-outline', activeIcon: 'person', route: '/(drawer)/perfil' },
  ];

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadUserData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('currentUser');
          const sessionUser = jsonValue != null ? JSON.parse(jsonValue) : null;
          if (sessionUser?.email && isActive) {
             const dbUser: any = await getUserByEmail(sessionUser.email);
             if (dbUser) {
                 setUserName(dbUser.nome || 'Usuário');
                 setUserEmail(dbUser.email);
                 setUserImage(dbUser.profile_image && dbUser.profile_image !== "" ? dbUser.profile_image : null);
             } else {
                 setUserName(sessionUser.nome);
                 setUserEmail(sessionUser.email);
                 setUserImage(sessionUser.profile_image || null);
             }
          }
          setIsImageLoading(false);
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
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const openMenu = () => navigation.dispatch(DrawerActions.openDrawer());
  const closeAllMenus = () => { setIsDropdownOpen(false); setIsNotifOpen(false); };
  const toggleUserMenu = () => { if (isNotifOpen) setIsNotifOpen(false); setIsDropdownOpen(!isDropdownOpen); };
  const toggleNotifMenu = () => { if (isDropdownOpen) setIsDropdownOpen(false); setIsNotifOpen(!isNotifOpen); };

  const handleLogout = async () => {
    Alert.alert("Sair", "Deseja sair?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: async () => {
            try { await AsyncStorage.removeItem('currentUser'); closeAllMenus(); router.replace('/login'); } 
            catch (e) { console.error("Erro logout", e); }
        }}
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={theme.topBarBg} />
      
      {(isDropdownOpen || isNotifOpen) && <Pressable style={styles.dropdownOverlay} onPress={closeAllMenus} />}

      {/* --- CABEÇALHO FIXO --- */}
      <View style={[styles.fixedHeaderContainer, { backgroundColor: theme.background, shadowColor: theme.shadow }]}>
          
          {/* TopBar (Botões e Perfil) */}
          {!hideTopBar && (
            <View style={[styles.topBar, { backgroundColor: theme.topBarBg, borderBottomWidth: showTrialBanner ? 0 : 1, borderBottomColor: theme.border }]}>
              
              <View style={styles.leftSection}>
                <TouchableOpacity style={styles.iconButton} onPress={openMenu}>
                    <Ionicons name="menu" size={28} color={theme.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.rightSection}>
                <View style={{ position: 'relative', zIndex: 2005 }}>
                    <TouchableOpacity style={styles.iconButton} onPress={toggleNotifMenu}>
                        <Ionicons name="notifications-outline" size={24} color={theme.text} />
                        <View style={[styles.badge, { borderColor: theme.topBarBg }]} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity 
                    style={[styles.profilePill, { backgroundColor: theme.inputBg, borderColor: theme.border }]} 
                    onPress={toggleUserMenu}
                    activeOpacity={0.7}
                >
                  <View style={[styles.avatar, { backgroundColor: userImage ? 'transparent' : theme.primary, overflow: 'hidden' }]}>
                    {isImageLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : userImage ? (
                        <Image source={{ uri: userImage }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                    ) : (
                        <Text style={styles.avatarText}>{getInitials(userName)}</Text>
                    )}
                  </View>
                  {!isMobile && (
                    <Text style={[styles.profileName, { color: theme.text }]} numberOfLines={1}>{userName}</Text>
                  )}
                  <Ionicons name={isDropdownOpen ? "chevron-up" : "chevron-down"} size={12} color={theme.muted} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Banner Compacto */}
          {showTrialBanner && !hideTopBar && (
            <View style={[styles.bannerContainer, { backgroundColor: theme.bannerBg, borderTopColor: theme.border }]}>
                <View style={styles.trialContent}>
                    <View style={[styles.trialIcon, { backgroundColor: theme.bannerIconBg }]}>
                        <Ionicons name="gift-outline" size={16} color={theme.bannerIconColor} />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.trialTitle, { color: theme.muted }]}>Teste Premium</Text>
                        <Text style={[styles.trialText, { color: theme.text }]}>
                            Restam <Text style={{fontWeight: '700', color: theme.primary}}>{daysRemaining} dias</Text>.
                        </Text>
                    </View>
                </View>
                <View style={styles.trialActions}>
                    <TouchableOpacity style={[styles.detailsButton, { borderColor: theme.border }]} onPress={() => setModalVisible(true)}>
                        <Text style={[styles.detailsButtonText, { color: theme.text }]}>Detalhes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.upgradeButton, { backgroundColor: theme.warning }]} onPress={() => router.push('/(drawer)/planos')}>
                        <Text style={styles.upgradeButtonText}>Upgrade</Text>
                    </TouchableOpacity>
                </View>
            </View>
          )}

          {/* --- DROPDOWNS --- */}
          {isNotifOpen && (
              <View style={[styles.notifDropdown, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
                  <View style={[styles.notifHeader, { borderBottomColor: theme.border }]}>
                      <Text style={[styles.notifTitle, { color: theme.text }]}>Notificações</Text>
                      <TouchableOpacity><Text style={{ fontSize: 12, color: theme.primary }}>Lidas</Text></TouchableOpacity>
                  </View>
                  <ScrollView style={{ maxHeight: 300 }} showsVerticalScrollIndicator={true}>
                      {MOCK_NOTIFICATIONS.map((notif) => {
                          const iconColor = notif.type === 'success' ? theme.success : notif.type === 'warning' ? theme.warning : theme.primary;
                          return (
                              <TouchableOpacity key={notif.id} style={[styles.notifItem, { borderBottomColor: theme.border }]}>
                                  <View style={[styles.notifIcon, { backgroundColor: iconColor + '15' }]}>
                                      <Ionicons name={notif.icon as any} size={16} color={iconColor} />
                                  </View>
                                  <View style={{ flex: 1 }}>
                                      <Text style={[styles.notifItemTitle, { color: theme.text }]}>{notif.title}</Text>
                                      <Text style={[styles.notifItemDesc, { color: theme.muted }]}>{notif.desc}</Text>
                                      <Text style={[styles.notifTime, { color: theme.muted }]}>{notif.time}</Text>
                                  </View>
                                  <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                              </TouchableOpacity>
                          );
                      })}
                  </ScrollView>
              </View>
          )}

          {isDropdownOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.shadow }]}>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeAllMenus(); router.push('/(drawer)/perfil'); }}>
                        <Ionicons name="person-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Perfil do usuário</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeAllMenus(); router.push('/(drawer)/AlterarSenhaScreen'); }}>
                        <Ionicons name="settings-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Alterar Senha</Text>
                    </TouchableOpacity>
                    <View style={[styles.divider, { backgroundColor: theme.border }]} />
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeAllMenus(); router.push('/(drawer)/planos'); }}>
                        <Ionicons name="arrow-up-circle-outline" size={18} color={theme.text} />
                        <Text style={[styles.dropdownText, { color: theme.text }]}>Subscrição do usuário</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dropdownItem} onPress={() => { closeAllMenus(); Linking.openURL('https://midiatopo.com/ajuda'); }}>
                        <View style={{width: 18}}><Ionicons name="help-circle-outline" size={18} color={theme.text} /></View>
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
      {/* --- FIM HEADER FIXO --- */}

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.contentContainer, { paddingBottom: 100 }]} 
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {!hideTopBar && (
        <View style={[styles.bottomBar, { backgroundColor: theme.bottomBarBg, borderTopColor: theme.bottomBarBorder, shadowColor: theme.shadow }]}>
          {bottomNavItems.map((item, index) => {
            const isActive = pathname === item.route;
            if (item.isSpecial) {
                return (
                    <TouchableOpacity key={index} style={styles.bottomTabSpecial} onPress={() => router.push(item.route as any)} activeOpacity={0.8}>
                        <View style={[styles.specialButton, { backgroundColor: theme.primary }]}>
                            <Ionicons name="add" size={32} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                )
            }
            return (
                <TouchableOpacity key={index} style={styles.bottomTab} onPress={() => router.push(item.route as any)}>
                    <Ionicons name={isActive ? item.activeIcon as any : item.icon as any} size={24} color={isActive ? theme.primary : theme.muted} />
                    <Text style={[styles.bottomTabLabel, { color: isActive ? theme.primary : theme.muted }]}>{item.label}</Text>
                </TouchableOpacity>
            );
          })}
        </View>
      )}

      <TrialDetailsModal visible={modalVisible && !disableModal} onClose={() => setModalVisible(false)} onViewPlans={() => { setModalVisible(false); router.push('/(drawer)/planos'); }} theme={theme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  
  // CONTAINER: Garante que nada suba para a status bar (paddingTop)
  fixedHeaderContainer: {
    zIndex: 1000,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    paddingBottom: 0,
    // Corrigido: Não colocamos padding aqui, e sim na TopBar para controle total
  },

  topBar: {
    height: TOTAL_HEADER_HEIGHT, // Altura total calculada
    paddingTop: STATUSBAR_HEIGHT, // Empurra o conteúdo para baixo da Status Bar
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 1001, 
  },
  
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  rightSection: { flexDirection: 'row', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1001 },
  
  iconButton: { padding: 6, borderRadius: 12, backgroundColor: 'transparent' },
  badge: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1 },
  
  profilePill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingLeft: 4, paddingRight: 10, borderRadius: 30, gap: 6, borderWidth: 1 },
  avatar: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontWeight: '700', fontSize: 10 },
  profileName: { fontSize: 13, fontWeight: '600', maxWidth: 100 },
  
  dropdownOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 900, backgroundColor: 'transparent' },
  
  // DROPDOWNS: Posição calculada para começar logo após a barra (Status Bar + Altura da barra)
  dropdownMenu: { position: 'absolute', top: TOTAL_HEADER_HEIGHT, right: 0, width: 240, borderRadius: 12, paddingVertical: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 30, zIndex: 9000, borderWidth: 1 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 16, gap: 12 },
  dropdownText: { fontSize: 13, fontWeight: '500' },
  divider: { height: 1, marginVertical: 4 },

  notifDropdown: { position: 'absolute', top: TOTAL_HEADER_HEIGHT, right: 40, width: 300, borderRadius: 12, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 30, zIndex: 9000, borderWidth: 1 },
  notifHeader: { padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  notifTitle: { fontWeight: '700', fontSize: 14 },
  notifItem: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, gap: 10, alignItems: 'flex-start' },
  notifIcon: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  notifItemTitle: { fontWeight: '600', fontSize: 13, marginBottom: 2 },
  notifItemDesc: { fontSize: 11, lineHeight: 14 },
  notifTime: { fontSize: 10, marginTop: 4, opacity: 0.7 },
  unreadDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  notifFooter: { padding: 10, alignItems: 'center', borderTopWidth: 1 },

  // BANNER COMPACTO
  bannerContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 6, 
    borderTopWidth: 1,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  trialContent: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 200 },
  trialIcon: { padding: 4, borderRadius: 6 },
  trialTitle: { fontSize: 9, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  trialText: { fontSize: 11, fontWeight: '500', marginTop: 0 },
  trialActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailsButton: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1 },
  detailsButtonText: { fontSize: 11, fontWeight: '600' },
  upgradeButton: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 2 },
  upgradeButtonText: { fontSize: 11, fontWeight: 'bold', color: '#3F2C05' },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 70, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, elevation: 20, shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  bottomTab: { alignItems: 'center', justifyContent: 'center', padding: 8 },
  bottomTabSpecial: { top: -20 },
  specialButton: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8 },
  bottomTabLabel: { fontSize: 10, marginTop: 4, fontWeight: '600' },

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