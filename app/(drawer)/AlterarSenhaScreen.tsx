import DashboardLayout from '@/components/DashboardLayout';
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
    danger: '#EF4444',
    success: '#10B981'
  },
  dark: {
    bg: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    border: '#374151',
    inputBg: '#374151',
    danger: '#F87171',
    success: '#34D399'
  }
};

export default function AlterarSenhaScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Validação de Senha Forte
  const validatePassword = (password: string) => {
    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    if (password.length < minLength) return 'A senha deve ter pelo menos 6 caracteres.';
    if (!hasUpperCase) return 'A senha deve ter pelo menos uma letra maiúscula.';
    if (!hasLowerCase) return 'A senha deve ter pelo menos uma letra minúscula.';
    if (!hasNumber) return 'A senha deve ter pelo menos um número.';
    return null;
  };

  const handleSave = () => {
    // 1. Validar campos vazios
    if (!currentPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    }

    // 2. Validar força da nova senha
    const error = validatePassword(newPassword);
    if (error) {
      return Alert.alert('Senha Fraca', error);
    }

    // 3. Validar confirmação
    if (newPassword !== confirmPassword) {
      return Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
    }

    // 4. (Opcional) Validar se a nova é igual a atual
    if (currentPassword === newPassword) {
        return Alert.alert('Erro', 'A nova senha não pode ser igual a atual.');
    }

    // Sucesso
    Alert.alert('Sucesso', 'Sua senha foi alterada com sucesso!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <DashboardLayout showTrialBanner={false}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Header com Botão Voltar */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View>
                <Text style={[styles.title, { color: colors.text }]}>Alterar Senha</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Atualize suas credenciais de segurança</Text>
            </View>
          </View>

          {/* Card do Formulário */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            
            {/* Senha Atual */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Password Actual</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    secureTextEntry={!showCurrent}
                    placeholder="Digite sua senha atual"
                    placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                    <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            {/* Nova Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nova Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNew}
                    placeholder="Digite a nova senha"
                    placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                    <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Senha */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Confirmar a nova Password</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                <TextInput 
                    style={[styles.input, { color: colors.text }]}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    placeholder="Repita a nova senha"
                    placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                    <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Requisitos de Senha */}
            <View style={[styles.requirementsBox, { backgroundColor: colors.inputBg }]}>
                <View style={styles.reqHeader}>
                    <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                    <Text style={[styles.reqTitle, { color: colors.text }]}>Requisitos de segurança:</Text>
                </View>
                <Text style={[styles.reqText, { color: colors.textSecondary }]}>• Mínimo de 6 caracteres</Text>
                <Text style={[styles.reqText, { color: colors.textSecondary }]}>• Pelo menos uma letra maiúscula</Text>
                <Text style={[styles.reqText, { color: colors.textSecondary }]}>• Pelo menos uma letra minúscula</Text>
                <Text style={[styles.reqText, { color: colors.textSecondary }]}>• Pelo menos um número</Text>
            </View>

            {/* Botão Salvar */}
            <TouchableOpacity 
              style={[styles.saveButton, { backgroundColor: colors.primary }]} 
              onPress={handleSave}
            >
              <Text style={styles.saveButtonText}>Atualizar Senha</Text>
            </TouchableOpacity>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 16 },
  backButton: { padding: 8, borderRadius: 8 },
  title: { fontSize: 24, fontWeight: 'bold' },
  subtitle: { fontSize: 14, marginTop: 4 },
  
  formCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputGroup: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600' },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  input: { flex: 1, height: '100%', fontSize: 15 },
  eyeBtn: { padding: 8 },
  
  divider: { height: 1, width: '100%', opacity: 0.5 },

  requirementsBox: {
    padding: 16,
    borderRadius: 8,
    gap: 6,
    marginTop: 8,
  },
  reqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  reqTitle: { fontSize: 13, fontWeight: '700' },
  reqText: { fontSize: 12 },

  saveButton: {
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});