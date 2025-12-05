import { Text as ThemedText, View as ThemedView, useThemeColor } from '@/components/Themed';
import Colors from '@/constants/Colors';
import { getUsers } from '@/lib/userStore';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DashboardLayoutProps {
  children: React.ReactNode;
  showTrialBanner?: boolean;
  daysRemaining?: number;
}

// Modal Component
interface TrialDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  onViewPlans: () => void;
  onGoHome: () => void;
  userName: string;
  userEmail?: string;
}

function TrialDetailsModal({ visible, onClose, onViewPlans, onGoHome, userName, userEmail }: TrialDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={modalStyles.overlay} onPress={onClose}>
        <Pressable style={modalStyles.content} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={modalStyles.header}>
            <TouchableOpacity style={modalStyles.headerLeft} onPress={onGoHome}>
              <Text style={modalStyles.title}>Detalhevs do Teste Gratuito</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Text style={modalStyles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Body */}
          <View style={modalStyles.body}>
            <Text style={modalStyles.greeting}>
              Olá, <Text style={modalStyles.userName}>{userName}</Text>!
            </Text>
            {userEmail && (
              <Text style={modalStyles.userEmailText}>{userEmail}</Text>
            )}
            <Text style={modalStyles.description}>
              Você está utilizando a versão de avaliação do sistema. Aproveite para
              conhecer nossas funcionalidades.
            </Text>

            {/* What you can do */}
            <View style={[modalStyles.infoBox, modalStyles.infoBoxBlue]}>
              <View style={modalStyles.infoHeader}>
                <Text style={modalStyles.infoTitle}>O que você pode fazer:</Text>
              </View>
              <View style={modalStyles.bulletList}>
                <Text style={modalStyles.bulletItem}>
                  • Agendar <Text style={modalStyles.bold}>Entrevistas Musicais</Text>
                </Text>
                <Text style={modalStyles.bulletItem}>
                  • Acessar painéis de relatórios básicos.
                </Text>
              </View>
            </View>

            {/* Limitations */}
            <View style={[modalStyles.infoBox, modalStyles.infoBoxYellow]}>
              <View style={modalStyles.infoHeader}>
                <Text style={modalStyles.infoTitle}>Limitações:</Text>
              </View>
              <View style={modalStyles.bulletList}>
                <Text style={modalStyles.bulletItem}>
                  • Você <Text style={modalStyles.bold}>não</Text> pode agendar Spots, Publicidade Comercial ou
                  Transmissões ao Vivo.
                </Text>
                <Text style={modalStyles.bulletItem}>
                  • Sua conta expira em <Text style={modalStyles.bold}>58 dias</Text>.
                </Text>
              </View>
            </View>

            <Text style={modalStyles.footerText}>
              Para desbloquear todas as funcionalidades, considere assinar um dos nossos planos.
            </Text>
          </View>

          {/* Footer */}
          <View style={modalStyles.footer}>
            <TouchableOpacity 
              style={modalStyles.buttonSecondary} 
              onPress={onClose}
            >
              <Text style={modalStyles.buttonSecondaryText}>Fechar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={modalStyles.buttonPrimary} 
              onPress={onViewPlans}
            >
              <Text style={modalStyles.buttonPrimaryText}>Ver Planos Completos</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function DashboardLayout({
  children,
  showTrialBanner = true,
  daysRemaining = 60,
}: DashboardLayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState('Usuário');
  const [userEmail, setUserEmail] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();
  const params = useLocalSearchParams<{ nome: string }>();

  const textColor = useThemeColor(
    { light: Colors.light.text, dark: Colors.light.text },
    'text',
  );
  const backgroundColor = useThemeColor(
    { light: Colors.light.background, dark: Colors.light.background },
    'background',
  );
  const tintColor = useThemeColor(
    { light: Colors.light.tint, dark: Colors.light.tint },
    'tint',
  );
  const cardBackground = useThemeColor(
    { light: '#ffffff', dark: '#ffffff' },
    'background',
  );
  const borderColor = useThemeColor(
    { light: '#e5e7eb', dark: '#e5e7eb' },
    'background',
  );

  useEffect(() => {
    if (params.nome) {
      setUserName(decodeURIComponent(params.nome));
      const users = getUsers();
      const user = users.find((u) => u.nome === decodeURIComponent(params.nome));
      if (user) {
        setUserEmail(user.email);
      }
    }
  }, [params.nome]);

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleViewPlans = () => {
    setModalVisible(false);
    router.push('/planos');
  };

  const handleGoHome = () => {
    setModalVisible(false);
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      {/* Top Bar */}
      <ThemedView
        style={[styles.topBar, { borderBottomColor: borderColor }]}
        lightColor="#ffffff"
        darkColor="#ffffff"
      >
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <ThemedText style={styles.menuButtonText}>☰</ThemedText>
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity style={styles.userButton}>
            <View style={styles.topBarAvatar}>
              <ThemedText style={styles.topBarAvatarText}>{getInitials(userName)}</ThemedText>
            </View>
            <ThemedText style={styles.topBarUserName}>{userName}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* Trial Banner */}
      {showTrialBanner && (
        <View style={styles.trialBanner}>
          <View style={styles.trialBannerLeft}>
            <Text style={styles.trialText}>
              <Text style={styles.trialTextBold}>Modo de Teste Gratuito:</Text> Você tem{' '}
              {daysRemaining} dias restantes.
            </Text>
          </View>
          <View style={styles.trialBannerRight}>
            <TouchableOpacity
              style={styles.trialButtonSecondary}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.trialButtonSecondaryText}>Ver Limitações</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.trialButtonPrimary}
              onPress={() => router.push('/planos')}
            >
              <Text style={styles.trialButtonPrimaryText}>Fazer Upgrade</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content Area */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentArea}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* Sidebar (Mobile) - Fora do ScrollView */}
      {menuOpen && (
        <>
          <View style={styles.sidebarOverlay}>
            <View style={styles.sidebar}>
              <ScrollView style={styles.sidebarScroll} showsVerticalScrollIndicator={false}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                  <TouchableOpacity 
                    style={styles.logoWrapper}
                    onPress={handleGoHome}
                  >
                    <View style={styles.logoIcon}>
                      <Text style={styles.logoText}>M</Text>
                    </View>
                    <View>
                      <Text style={styles.logoTitle}>MÍDIATOPO</Text>
                      <Text style={styles.logoSubtitle}>
                        Marketing Digital & Mídia para todos
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* User Info */}
                <View style={styles.userInfoContainer}>
                  <View style={styles.userInfoWrapper}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{getInitials(userName)}</Text>
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{userName}</Text>
                      {userEmail ? <Text style={styles.userEmail}>{userEmail}</Text> : null}
                    </View>
                  </View>
                </View>

                {/* Menu */}
                <View style={styles.nav}>
                  <TouchableOpacity style={styles.navLink}>
                    <ThemedText style={styles.navText}>Base (todos)</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <ThemedText style={styles.navText}>Sair</ThemedText>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
            <TouchableOpacity
              style={styles.overlay}
              onPress={() => setMenuOpen(false)}
              activeOpacity={1}
            />
          </View>
        </>
      )}

      {/* Modal de Limitações */}
      <TrialDetailsModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onViewPlans={handleViewPlans}
        onGoHome={handleGoHome}
        userName={userName}
        userEmail={userEmail}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  topBar: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
    fontWeight: '600',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
  },
  topBarAvatar: {
    width: 32,
    height: 32,
    backgroundColor: '#475569',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarAvatarText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  topBarUserName: {
    fontSize: 14,
    fontWeight: '500',
  },
  trialBanner: {
    backgroundColor: '#7c3aed',
    paddingHorizontal: SCREEN_WIDTH < 768 ? 12 : 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  trialBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  trialText: {
    fontSize: SCREEN_WIDTH < 768 ? 12 : 14,
    color: '#ffffff',
    flex: 1,
  },
  trialTextBold: {
    fontWeight: '700',
  },
  trialBannerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  trialButtonSecondary: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 12 : 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
  },
  trialButtonSecondaryText: {
    color: '#ffffff',
    fontSize: SCREEN_WIDTH < 768 ? 12 : 14,
    fontWeight: '500',
  },
  trialButtonPrimary: {
    paddingHorizontal: SCREEN_WIDTH < 768 ? 12 : 16,
    paddingVertical: 8,
    backgroundColor: '#eab308',
    borderRadius: 8,
  },
  trialButtonPrimaryText: {
    color: '#581c87',
    fontSize: SCREEN_WIDTH < 768 ? 12 : 14,
    fontWeight: '500',
  },
  contentArea: {
    padding: SCREEN_WIDTH < 768 ? 16 : 24,
    gap: 20,
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
    elevation: 1000,
  },
  sidebar: {
    width: 256,
    backgroundColor: '#1e293b',
    height: '100%',
  },
  sidebarScroll: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  logoContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  logoSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
  },
  userInfoContainer: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  userInfoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 40,
    height: 40,
    backgroundColor: '#475569',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: '#94a3b8',
  },
  nav: {
    flex: 1,
    padding: 16,
  },
  navLink: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    marginBottom: 8,
  },
  logoutButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  navText: {
    fontSize: 14,
    color: '#ffffff',
  },
});

// Modal Styles
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 550,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3b82f6',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#6b7280',
  },
  body: {
    padding: 20,
  },
  greeting: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
  },
  userName: {
    fontWeight: '600',
  },
  userEmailText: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoBox: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoBoxBlue: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  infoBoxYellow: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  bold: {
    fontWeight: '600',
    color: '#1f2937',
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  buttonSecondary: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
  },
  buttonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  buttonPrimary: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#10b981',
    alignItems: 'center',
  },
  buttonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});