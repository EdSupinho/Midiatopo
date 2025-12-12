import DashboardLayout from '@/components/DashboardLayout';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const THEME = {
  light: {
    background: 'transparent',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#1F41BB',
    border: '#E5E7EB',
    success: '#10B981',
    inputBg: '#F3F4F6',
    modalBg: '#FFFFFF',
  },
  dark: {
    background: 'transparent',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    border: '#374151',
    success: '#34D399',
    inputBg: '#374151',
    modalBg: '#111827',
  },
};

interface Plan {
  id: string;
  name: string;
  description: string;
  price: string;
  priceValue: number;
  period: string;
  isCurrent?: boolean;
}


interface SelectPlanModalProps {
  visible: boolean;
  onClose: () => void;
  currentPlan: Plan;
  onSelectPlan: (plan: Plan) => void;
  colors: typeof THEME.light;
}

function SelectPlanModal({ visible, onClose, currentPlan, onSelectPlan, colors }: SelectPlanModalProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    if (!visible) {
      setCurrentStep(1);
      setSelectedPlan(null);
    }
  }, [visible]);

  const plans: Plan[] = [
    { id: 'monthly', name: 'Mensal', description: 'Cobrado mensalmente', price: '195 MZN', priceValue: 195, period: 'mensal' },
    { id: 'semestral', name: 'Semestral', description: 'Cobrado a cada 6 meses (Economize 15%)', price: '650 MZN', priceValue: 650, period: 'semestral' },
    { id: 'annual', name: 'Anual', description: 'Melhor valor (Economize 30%)', price: '990 MZN', priceValue: 990, period: 'anual' },
  ];

  const renderStepIndicator = () => (
    <View style={modalStyles.stepsContainer}>
      {[1, 2, 3].map((step) => {
        const isActive = step <= currentStep;
        return (
          <View key={step} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[
              modalStyles.stepCircle, 
              { backgroundColor: isActive ? colors.primary : colors.inputBg }
            ]}>
              <Text style={[modalStyles.stepNumber, { color: isActive ? '#FFF' : colors.textSecondary }]}>{step}</Text>
            </View>
            {step < 3 && <View style={[modalStyles.stepLine, { backgroundColor: step < currentStep ? colors.primary : colors.inputBg }]} />}
          </View>
        );
      })}
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={[modalStyles.container, { backgroundColor: colors.modalBg }]}>
          
          {/* Header do Modal */}
          <View style={[modalStyles.header, { borderBottomColor: colors.border }]}>
            <Text style={[modalStyles.title, { color: colors.text }]}>
              {currentStep === 1 ? 'Escolher Plano' : currentStep === 2 ? 'Pagamento' : 'Confirmação'}
            </Text>
            <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {renderStepIndicator()}

          <ScrollView style={modalStyles.content} showsVerticalScrollIndicator={false}>
            {/* PASSO 1: SELEÇÃO */}
            {currentStep === 1 && (
              <View style={{ gap: 12 }}>
                <View style={[modalStyles.currentPlanBanner, { backgroundColor: colors.inputBg }]}>
                  <Text style={[modalStyles.currentPlanText, { color: colors.textSecondary }]}>
                    Plano Atual: <Text style={{ fontWeight: 'bold', color: colors.primary }}>{currentPlan.name}</Text>
                  </Text>
                </View>

                {plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  return (
                    <TouchableOpacity
                      key={plan.id}
                      style={[
                        modalStyles.planCard,
                        { 
                          backgroundColor: colors.card, 
                          borderColor: isSelected ? colors.primary : colors.border,
                          borderWidth: isSelected ? 2 : 1
                        }
                      ]}
                      onPress={() => setSelectedPlan(plan)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[modalStyles.planName, { color: colors.text }]}>{plan.name}</Text>
                        <Text style={[modalStyles.planDesc, { color: colors.textSecondary }]}>{plan.description}</Text>
                      </View>
                      <Text style={[modalStyles.planPrice, { color: colors.primary }]}>{plan.price}</Text>
                      <View style={[
                        modalStyles.radio, 
                        { borderColor: isSelected ? colors.primary : colors.textSecondary },
                        isSelected && { backgroundColor: colors.primary }
                      ]}>
                        {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* PASSO 2: PAGAMENTO */}
            {currentStep === 2 && selectedPlan && (
              <View style={{ gap: 16 }}>
                <View style={[modalStyles.summaryCard, { backgroundColor: colors.inputBg }]}>
                  <Text style={[modalStyles.summaryLabel, { color: colors.textSecondary }]}>Total a pagar:</Text>
                  <Text style={[modalStyles.summaryTotal, { color: colors.text }]}>{selectedPlan.price}</Text>
                  <Text style={[modalStyles.summaryDesc, { color: colors.textSecondary }]}>Plano {selectedPlan.name}</Text>
                </View>

                <Text style={[modalStyles.sectionLabel, { color: colors.text }]}>Selecione o método:</Text>
                
                {['M-Pesa', 'Cartão de Crédito', 'Transferência Bancária'].map((method, index) => (
                  <TouchableOpacity key={index} style={[modalStyles.methodCard, { borderColor: colors.border, backgroundColor: colors.card }]}>
                    <View style={[modalStyles.methodIcon, { backgroundColor: colors.inputBg }]}>
                      <Ionicons name={index === 0 ? "phone-portrait-outline" : index === 1 ? "card-outline" : "business-outline"} size={20} color={colors.text} />
                    </View>
                    <Text style={[modalStyles.methodText, { color: colors.text }]}>{method}</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* PASSO 3: CONFIRMAÇÃO */}
            {currentStep === 3 && selectedPlan && (
              <View style={{ alignItems: 'center', paddingVertical: 20, gap: 16 }}>
                <View style={[modalStyles.successIcon, { backgroundColor: colors.success + '20' }]}>
                  <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                </View>
                <Text style={[modalStyles.successTitle, { color: colors.text }]}>Tudo Pronto!</Text>
                <Text style={[modalStyles.successText, { color: colors.textSecondary }]}>
                  Você está prestes a atualizar para o plano <Text style={{ fontWeight: 'bold' }}>{selectedPlan.name}</Text>.
                </Text>
                
                <View style={[modalStyles.warningBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="alert-circle" size={20} color="#D97706" />
                  <Text style={{ color: '#92400E', fontSize: 13, flex: 1 }}>
                    Você será redirecionado para o gateway de pagamento seguro.
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer do Modal */}
          <View style={[modalStyles.footer, { borderTopColor: colors.border }]}>
            {currentStep > 1 && (
              <TouchableOpacity 
                style={[modalStyles.backButton, { backgroundColor: colors.inputBg }]} 
                onPress={() => setCurrentStep((prev) => (prev - 1) as any)}
              >
                <Text style={{ color: colors.text }}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[modalStyles.nextButton, { backgroundColor: colors.primary, flex: 1 }]}
              disabled={currentStep === 1 && !selectedPlan}
              onPress={() => {
                if (currentStep < 3) setCurrentStep((prev) => (prev + 1) as any);
                else {
                  onSelectPlan(selectedPlan!);
                  onClose();
                }
              }}
            >
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                {currentStep === 3 ? 'Confirmar e Pagar' : 'Continuar'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// --- TELA PRINCIPAL ---
export default function PlansScreen() {
  const [showModal, setShowModal] = useState(false);
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;
  const isMobile = width < 768;

  const currentPlan: Plan = {
    id: 'trial',
    name: 'Trial Gratuito',
    description: 'Período de avaliação',
    price: 'Grátis',
    priceValue: 0,
    period: '58 dias',
    isCurrent: true,
  };

  const handleSelectPlan = (plan: Plan) => {
    console.log('Plano selecionado:', plan);
  };

  return (
    <DashboardLayout 
      showTrialBanner={true} 
      daysRemaining={58}
      disableModal={showModal} 
    >
      <View style={{ flex: 1, gap: 24 }}>
        
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Minha Assinatura</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Gerencie seu plano e pagamentos</Text>
        </View>

        {/* Card do Plano Atual */}
        <View style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.planLabel, { color: colors.textSecondary }]}>PLANO ATUAL</Text>
              <Text style={[styles.planTitle, { color: colors.primary }]}>{currentPlan.name}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
              <Text style={[styles.statusText, { color: colors.success }]}>ATIVO</Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Data de Início</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>27/11/2025</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Válido até</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>27/01/2026</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Valor</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{currentPlan.price}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Renovação</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>Manual</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.updateButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowModal(true)}
          >
            <Text style={styles.updateButtonText}>Atualizar Subscrição</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Links de Rodapé
        <View style={styles.footerLinks}>
          <TouchableOpacity><Text style={[styles.link, { color: colors.primary }]}>Suporte</Text></TouchableOpacity>
          <TouchableOpacity><Text style={[styles.link, { color: colors.primary }]}>Termos de Uso</Text></TouchableOpacity>
          <TouchableOpacity><Text style={[styles.link, { color: colors.primary }]}>Política de Privacidade</Text></TouchableOpacity>
        </View> */}

      </View>

      <SelectPlanModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        currentPlan={currentPlan}
        onSelectPlan={handleSelectPlan}
        colors={colors}
      />
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  headerTitle: { fontSize: 28, fontWeight: '700', marginBottom: 4 },
  headerSubtitle: { fontSize: 16, marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1, marginBottom: 4 },
  planTitle: { fontSize: 24, fontWeight: '800' },
  statusBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1, width: '100%', marginBottom: 20 },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 24,
  },
  detailItem: { width: '45%' },
  detailLabel: { fontSize: 13, marginBottom: 4 },
  detailValue: { fontSize: 16, fontWeight: '600' },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  updateButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 'auto', paddingBottom: 20 },
  link: { fontSize: 14, fontWeight: '500' },
});

// --- ESTILOS DO MODAL ---
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end', // No mobile fica em baixo, desktop no meio
  },
  container: {
    width: '100%',
    height: '90%', // Ocupa quase toda a tela
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: { fontSize: 18, fontWeight: '700' },
  closeButton: { padding: 4 },
  
  // Stepper
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  stepCircle: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  stepNumber: { fontSize: 12, fontWeight: '700' },
  stepLine: { width: 40, height: 2, borderRadius: 1 },

  content: { flex: 1, paddingHorizontal: 20 },
  
  // Passo 1
  currentPlanBanner: { padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 8 },
  currentPlanText: { fontSize: 14 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  planName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  planDesc: { fontSize: 12 },
  planPrice: { fontSize: 14, fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },

  // Passo 2
  summaryCard: { padding: 24, borderRadius: 16, alignItems: 'center', gap: 4 },
  summaryLabel: { fontSize: 14 },
  summaryTotal: { fontSize: 32, fontWeight: '800' },
  summaryDesc: { fontSize: 14 },
  sectionLabel: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 16,
  },
  methodIcon: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  methodText: { flex: 1, fontSize: 16, fontWeight: '500' },

  // Passo 3
  successIcon: { padding: 20, borderRadius: 50, marginBottom: 10 },
  successTitle: { fontSize: 24, fontWeight: '700' },
  successText: { textAlign: 'center', fontSize: 16, lineHeight: 24 },
  warningBox: { flexDirection: 'row', padding: 12, borderRadius: 8, gap: 10, alignItems: 'center' },

  footer: {
    padding: 20,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
  backButton: { paddingVertical: 14, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center' },
  nextButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
});