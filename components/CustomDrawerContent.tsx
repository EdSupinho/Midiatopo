import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, useColorScheme, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native'; 
const THEME = {
  light: {
    bg: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    danger: '#EF4444',
    iconBg: '#EEF2FF',
    iconColor: '#312E81'
  },
  dark: {
    bg: '#0F172A', // Slate 950
    text: '#F9FAFB',
    textSecondary: '#94A3B8',
    border: '#1E293B',
    danger: '#F87171',
    iconBg: '#1E293B',
    iconColor: '#818CF8'
  }
};

export default function CustomDrawerContent(props: any) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  // Estado do Usuário
  const [user, setUser] = useState({ 
    name: "Visitante", 
    email: "Faça login para acessar", 
    initials: "VI",
    image: null as string | null
  });

  // Carregar dados do usuário sempre que o menu for focado/aberto
  useFocusEffect(
    useCallback(() => {
      const loadUser = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem('currentUser');
          const storedUser = jsonValue != null ? JSON.parse(jsonValue) : null;

          if (storedUser) {
            setUser({
              name: storedUser.nome || "Usuário",
              email: storedUser.email || "",
              initials: getInitials(storedUser.nome || "U"),
              image: storedUser.profile_image || null
            });
          }
        } catch (e) {
          console.log("Erro ao carregar perfil no drawer", e);
        }
      };
      loadUser();
    }, [])
  );

  const getInitials = (name: string) => {
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('currentUser');
    router.replace('/login');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <DrawerContentScrollView 
        {...props} 
        contentContainerStyle={{ paddingTop: 0 }}
      >
        {/* --- HEADER (Perfil do Usuário) --- */}
        <View style={[
            styles.headerContainer, 
            { 
                paddingTop: insets.top + 20, 
                borderBottomColor: colors.border,
                backgroundColor: isDark ? '#0F172A' : '#F9FAFB' // Fundo levemente diferente para destaque
            }
        ]}>
          <View style={styles.profileRow}>
            {/* Foto ou Iniciais */}
            <View style={[styles.avatar, { backgroundColor: colors.iconBg, borderColor: colors.border }]}>
                {user.image ? (
                    <Image 
                        source={{ uri: user.image }} 
                        style={styles.avatarImage} 
                        resizeMode="cover"
                    />
                ) : (
                    <Text style={[styles.avatarText, { color: colors.iconColor }]}>{user.initials}</Text>
                )}
            </View>
            
            {/* Infos */}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                {user.name}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                {user.email}
              </Text>
            </View>
          </View>
        </View>

        {/* --- LISTA DE MENUS (Gerado pelo DrawerLayout) --- */}
        <View style={styles.menuItemsContainer}>
            <DrawerItemList {...props} />
        </View>
      </DrawerContentScrollView>

      {/* --- FOOTER (Sair) --- */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20, borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: isDark ? 'rgba(248, 113, 113, 0.1)' : '#FEF2F2' }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    borderBottomWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden', 
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: { 
    fontWeight: 'bold', 
    fontSize: 18 
  },
  profileInfo: { 
    flex: 1 
  },
  profileName: { 
    fontWeight: '700', 
    fontSize: 16,
    marginBottom: 2
  },
  profileEmail: { 
    fontSize: 12 
  },

  menuItemsContainer: {
    paddingVertical: 10,
  },

  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  logoutText: { 
    fontSize: 14, 
    fontWeight: '600' 
  }
});