import DashboardLayout from '@/components/DashboardLayout';
import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserByEmail, updateUserProfile } from '../lib/database'; // Funções do SQLite

// --- TEMA ---
const THEME = {
  light: {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#1F41BB',
    border: '#E5E7EB',
    inputBg: '#FFFFFF',
    danger: '#EF4444'
  },
  dark: {
    bg: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    border: '#374151',
    inputBg: '#374151',
    danger: '#F87171'
  }
};

export default function PerfilScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  // Estados do Formulário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [bio, setBio] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Carregar dados ao abrir a tela
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Recupera o email da sessão atual (AsyncStorage)
      const jsonValue = await AsyncStorage.getItem('currentUser');
      const sessionUser = jsonValue != null ? JSON.parse(jsonValue) : null;

      if (sessionUser?.email) {
        // Busca os dados completos e atualizados no SQLite usando o email
        const dbUser: any = await getUserByEmail(sessionUser.email);
        
        if (dbUser) {
            setNome(dbUser.nome || '');
            setEmail(dbUser.email || '');
            setTelefone(dbUser.telefone || '');
            setBio(dbUser.bio || 'Administrador do sistema.');
            setImage(dbUser.profile_image || null);
        }
      }
    } catch (error) {
      console.log('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Escolher Foto da Galeria
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para mudar a foto.');
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5, // Qualidade média para não pesar no banco de dados
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // 3. Salvar Alterações no SQLite
  const handleSave = async () => {
    if (!nome.trim()) {
        return Alert.alert('Erro', 'O nome não pode estar vazio.');
    }

    setLoading(true);
    try {
      // Atualiza no Banco de Dados
      await updateUserProfile(email, {
        nome,
        telefone,
        bio,
        profile_image: image
      });
      
      // Atualiza a sessão local (AsyncStorage) para que o Dashboard veja a mudança imediatamente
      // Mantemos o email e atualizamos nome e imagem
      const currentUser = { nome, email, profile_image: image };
      await AsyncStorage.setItem('currentUser', JSON.stringify(currentUser));

      Alert.alert(
        'Sucesso', 
        'Perfil atualizado com sucesso!',
        [{ text: 'OK', onPress: () => router.replace('/(drawer)/home') }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <DashboardLayout>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Meu Perfil</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Gerencie suas informações pessoais</Text>
          </View>

          {/* Seção da Foto de Perfil */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.avatarContainer}>
              {image ? (
                <Image source={{ uri: image }} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarInitial}>{nome.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.cameraButton} onPress={pickImage}>
                <Ionicons name="camera" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.name, { color: colors.text }]}>{nome}</Text>
            <Text style={[styles.role, { color: colors.textSecondary }]}>{email}</Text>
          </View>

          {/* Formulário */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nome Completo</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={nome}
                onChangeText={setNome}
                placeholder="Seu nome"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.textSecondary, borderColor: colors.border }]}
                value={email}
                editable={false} // Email geralmente não se altera aqui para não quebrar a chave do DB
              />
              <Text style={{fontSize: 12, color: colors.textSecondary, marginTop: 4}}>O email não pode ser alterado.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Telefone</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                placeholder="+258 84..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                placeholder="Conte um pouco sobre você..."
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 4 },
  
  profileCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  avatarContainer: { position: 'relative', marginBottom: 16 },
  avatarImage: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: { fontSize: 40, color: '#FFF', fontWeight: 'bold' },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1F41BB',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  name: { fontSize: 20, fontWeight: 'bold' },
  role: { fontSize: 14, marginTop: 4 },

  formCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    paddingVertical: 12,
  },
  saveButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});