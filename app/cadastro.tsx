import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { addUser, checkEmailExists } from './lib/database'; // <--- Usando o novo DB
import { Ionicons } from '@expo/vector-icons';


const { width } = Dimensions.get('window');

const THEME = {
  light: {
    bg: '#FFFFFF',
    text: '#1F2937',
    sec: '#6B7280',
    primary: '#1F41BB',
    inputBg: '#F3F4F6',
    border: '#E5E7EB',
    error: '#EF4444',
    card: '#FFFFFF',
    shadow: '#000'
  },
  dark: {
    bg: '#111827',
    text: '#F9FAFB',
    sec: '#9CA3AF',
    primary: '#3B82F6',
    inputBg: '#374151',
    border: '#4B5563',
    error: '#F87171',
    card: '#1F2937',
    shadow: '#000'
  }
};

export default function CadastroScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const [nome, setNome] = useState('');
  const [apelido, setApelido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !password || !confirmPassword) {
      return Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return Alert.alert('Erro', 'Digite um email válido.');
    }

    if (password !== confirmPassword) {
      return Alert.alert('Erro', 'As senhas não coincidem.');
    }

    setLoading(true);

    try {
        // 1. Verifica se email já existe no SQLite
        const exists = await checkEmailExists(email);
        if (exists) {
            setLoading(false);
            return Alert.alert('Erro', 'Este email já está em uso.');
        }

        // 2. Salva no SQLite
        await addUser({ nome, apelido, email, password });

        Alert.alert(
            'Conta Criada!',
            'Seu cadastro foi realizado com sucesso. Faça login para continuar.',
            [
                { 
                text: 'Ir para Login', 
                onPress: () => router.replace('/login') 
                }
            ]
        );
    } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao criar conta no banco de dados.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Criar Conta</Text>
            <Text style={[styles.subtitle, { color: colors.sec }]}>
              Preencha os dados para começar a explorar todas as oportunidades.
            </Text>
          </View>

          <View style={styles.form}>
            
            {/* Nome */}
            <View style={[styles.inputGroup]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="person-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Nome Completo" 
                        placeholderTextColor={colors.sec}
                        style={[styles.input, { color: colors.text }]}
                        value={nome} 
                        onChangeText={setNome}
                    />
                </View>
            </View>

            {/* Apelido */}
            <View style={[styles.inputGroup]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="pricetag-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Apelido (Opcional)" 
                        placeholderTextColor={colors.sec}
                        style={[styles.input, { color: colors.text }]}
                        value={apelido} 
                        onChangeText={setApelido}
                    />
                </View>
            </View>

            {/* Email */}
            <View style={[styles.inputGroup]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Email" 
                        placeholderTextColor={colors.sec}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.input, { color: colors.text }]}
                        value={email} 
                        onChangeText={setEmail}
                    />
                </View>
            </View>

            {/* Senha */}
            <View style={[styles.inputGroup]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Senha" 
                        placeholderTextColor={colors.sec}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                        value={password} 
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.sec} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Confirmar Senha */}
            <View style={[styles.inputGroup]}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Confirmar Senha" 
                        placeholderTextColor={colors.sec}
                        secureTextEntry={!showConfirmPassword}
                        style={[styles.input, { color: colors.text }]}
                        value={confirmPassword} 
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                        <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.sec} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Botão Cadastrar */}
            <TouchableOpacity 
                style={[
                    styles.button, 
                    { backgroundColor: colors.primary, shadowColor: colors.primary }
                ]} 
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#FFF" />
                ) : (
                    <Text style={styles.buttonText}>Cadastrar</Text>
                )}
            </TouchableOpacity>

            {/* Link para Login */}
            <TouchableOpacity 
                onPress={() => router.back()} 
                style={styles.linkButton}
                activeOpacity={0.6}
            >
                <Text style={{ color: colors.sec, textAlign: 'center', fontSize: 14 }}>
                    Já tem uma conta? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Faça Login</Text>
                </Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 30,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '85%',
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    fontWeight: '500',
  },
  eyeButton: {
    padding: 8,
  },
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  },
  linkButton: {
    marginTop: 16,
    padding: 10,
  }
});