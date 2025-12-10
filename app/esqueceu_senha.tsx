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
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const THEME = {
  light: {
    bg: '#FFFFFF',
    text: '#1F2937',
    sec: '#6B7280',
    primary: '#1F41BB',
    inputBg: '#F3F4F6',
    border: '#E5E7EB',
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
    card: '#1F2937',
    shadow: '#000'
  }
};

export default function EsqueceuSenhaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const [email, setEmail] = useState('');

  const handleResetPassword = () => {
    if (!email.trim()) {
      return Alert.alert('Erro', 'Por favor, digite seu email.');
    }

    // Simulação de envio de email
    // Aqui você conectaria com sua API ou Firebase auth().sendPasswordResetEmail(email)
    Alert.alert(
      'Email Enviado!',
      `Enviamos um link de recuperação para ${email}. Verifique sua caixa de entrada.`,
      [
        { text: 'Voltar ao Login', onPress: () => router.back() }
      ]
    );
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
          {/* Botão Voltar */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.inputBg }]}>
                 <Ionicons name="lock-open" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>Esqueceu a Senha?</Text>
            <Text style={[styles.subtitle, { color: colors.sec }]}>
              Não se preocupe! Insira seu email abaixo e enviaremos instruções para recuperar sua conta.
            </Text>
          </View>

          <View style={styles.form}>
            
            {/* Email Input */}
            <View style={styles.inputGroup}>
                <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                    <Ionicons name="mail-outline" size={20} color={colors.sec} style={styles.inputIcon} />
                    <TextInput 
                        placeholder="Digite seu email" 
                        placeholderTextColor={colors.sec}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        style={[styles.input, { color: colors.text }]}
                        value={email} 
                        onChangeText={setEmail}
                    />
                </View>
            </View>

            {/* Botão Enviar */}
            <TouchableOpacity 
                style={[
                    styles.button, 
                    { backgroundColor: colors.primary, shadowColor: colors.primary }
                ]} 
                onPress={handleResetPassword}
                activeOpacity={0.8}
            >
                <Text style={styles.buttonText}>Enviar Link</Text>
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
    padding: 30,
    paddingTop: 20,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: 'flex-start',
    padding: 8,
    marginLeft: -8
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 10,
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
  button: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 18,
  }
});