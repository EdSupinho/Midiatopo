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
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { authenticateUser } from './lib/database'; // <--- Usando SQLite
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const THEME = {
  light: { bg: '#FFFFFF', text: '#1F2937', sec: '#6B7280', primary: '#1F41BB', inputBg: '#F3F4F6', border: '#E5E7EB', error: '#EF4444', card: '#FFFFFF', shadow: '#000' },
  dark: { bg: '#111827', text: '#F9FAFB', sec: '#9CA3AF', primary: '#3B82F6', inputBg: '#374151', border: '#4B5563', error: '#F87171', card: '#1F2937', shadow: '#000' }
};

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert('Atenção', 'Preencha email e senha para entrar.');
    }

    setLoading(true);

    try {
        // Verifica no SQLite
        const user = await authenticateUser(email, password);

        if (user) {
            // Salva sessão simples (pode melhorar depois)
            await AsyncStorage.setItem('currentUser', JSON.stringify(user));
            
            router.replace('/(drawer)/home');
        } else {
            Alert.alert('Erro', 'Email ou senha incorretos.');
        }
    } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao tentar fazer login.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image 
              source={{ uri: 'https://img.freepik.com/free-vector/mobile-login-concept-illustration_114360-83.jpg?t=st=1710345678~exp=1710349278~hmac=...' }} 
              style={styles.heroImage} resizeMode="contain" 
            />
            <Text style={[styles.title, { color: colors.primary }]}>Login here</Text>
            <Text style={[styles.subtitle, { color: colors.sec }]}>Bem-vindo de volta!</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Email" placeholderTextColor={colors.sec}
                        keyboardType="email-address" autoCapitalize="none"
                        style={[styles.input, { color: colors.text }]}
                        value={email} onChangeText={setEmail}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="lock-closed-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Senha" placeholderTextColor={colors.sec}
                        secureTextEntry={!showPassword}
                        style={[styles.input, { color: colors.text }]}
                        value={password} onChangeText={setPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={colors.sec} />
                    </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity onPress={() => router.push('/esqueceu_senha')} style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
                onPress={handleLogin}
                disabled={loading}
            >
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Entrar</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/cadastro')} style={styles.linkButton}>
                <Text style={{ color: colors.sec, textAlign: 'center', fontSize: 14 }}>
                    Criar nova conta
                </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 30, paddingTop: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  heroImage: { width: 280, height: 220, marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: '500', textAlign: 'center', maxWidth: '80%', lineHeight: 24 },
  form: { gap: 16 },
  inputGroup: { marginBottom: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, height: 56, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, height: '100%', fontWeight: '500' },
  eyeButton: { padding: 8 },
  forgotPassword: { alignItems: 'flex-end', marginBottom: 10 },
  forgotPasswordText: { fontWeight: '600', fontSize: 14 },
  button: { height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 10, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#FFF', fontWeight: 'bold', fontSize: 18 },
  linkButton: { marginTop: 20, padding: 10 }
});