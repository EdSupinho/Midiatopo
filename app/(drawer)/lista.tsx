import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  useWindowDimensions,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// --- TEMA DE CORES (Consistente com o resto do app) ---
const THEME = {
  light: {
    bg: 'transparent',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#1F41BB',
    border: '#E5E7EB',
    inputBg: '#F3F4F6',
    shadow: '#000',
    success: '#10B981',
    danger: '#EF4444',
    modalBg: 'rgba(0,0,0,0.5)'
  },
  dark: {
    bg: 'transparent',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    border: '#374151',
    inputBg: '#374151',
    shadow: '#000',
    success: '#34D399',
    danger: '#F87171',
    modalBg: 'rgba(0,0,0,0.7)'
  }
};

interface Anuncio {
  id: string;
  titulo: string;
  descricao: string;
  tipoProduto: string;
  capa: string;
  arquivoUrl: string;
  demoLink: string;
  status: 'ativo' | 'pendente';
}

export default function ListaScreen() {
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  // Responsividade do Grid (1 coluna no mobile, 2 no tablet)
  const isMobile = width < 768;
  const cardWidth = isMobile ? '100%' : '48%';

  const [anuncios, setAnuncios] = useState<Anuncio[]>([
    // Dados de exemplo
  ]);
  
  const [modalVisible, setModalVisible] = useState(false);

  // Campos do formulário
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoProduto, setTipoProduto] = useState('');
  const [capa, setCapa] = useState('');
  const [arquivoUrl, setArquivoUrl] = useState('');
  const [demoLink, setDemoLink] = useState('');

  // Dropdown manual para substituir o Picker (mais fácil de estilizar)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const types = ['Digital', 'Físico', 'Misto'];

  const handleAdicionarAnuncio = () => {
    if (!titulo.trim()) {
      Alert.alert('Erro', 'O título é obrigatório');
      return;
    }

    const novoAnuncio: Anuncio = {
      id: Date.now().toString(),
      titulo,
      descricao,
      tipoProduto: tipoProduto || 'Não especificado',
      capa,
      arquivoUrl,
      demoLink,
      status: 'pendente'
    };

    setAnuncios([novoAnuncio, ...anuncios]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setTipoProduto('');
    setCapa('');
    setArquivoUrl('');
    setDemoLink('');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Excluir', 'Tem certeza que deseja apagar este anúncio?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => setAnuncios(anuncios.filter(a => a.id !== id)) }
    ]);
  };

  return (
    <DashboardLayout>
      <View style={styles.container}>
        
        {/* Header da Página */}
        <View style={styles.headerRow}>
            <View>
                <Text style={[styles.pageTitle, { color: colors.text }]}>Meus Anúncios</Text>
                <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Gerencie suas publicações</Text>
            </View>
            <TouchableOpacity
                style={[styles.buttonNovo, { backgroundColor: colors.primary }]}
                onPress={() => setModalVisible(true)}
            >
                <Ionicons name="add" size={20} color="#FFF" />
                <Text style={styles.buttonNovoText}>Novo</Text>
            </TouchableOpacity>
        </View>

        {anuncios.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="documents-outline" size={64} color={colors.textSecondary} />
            <Text style={[styles.semAnuncios, { color: colors.textSecondary }]}>Não foram encontrados anúncios...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.gridContainer} showsVerticalScrollIndicator={false}>
            {anuncios.map((a) => (
              <View
                key={a.id}
                style={[
                    styles.card, 
                    { backgroundColor: colors.card, width: cardWidth as any, borderColor: colors.border }
                ]}
              >
                {/* Cabeçalho do Card */}
                <View style={styles.cardHeader}>
                    <View style={[styles.iconBox, { backgroundColor: colors.inputBg }]}>
                        <Ionicons name="pricetag" size={20} color={colors.primary} />
                    </View>
                    <View style={[
                        styles.statusBadge, 
                        { backgroundColor: a.status === 'ativo' ? colors.success + '20' : colors.textSecondary + '20' }
                    ]}>
                        <Text style={[
                            styles.statusText, 
                            { color: a.status === 'ativo' ? colors.success : colors.textSecondary }
                        ]}>
                            {a.status.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{a.titulo}</Text>
                <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>
                    {a.descricao || 'Sem descrição.'}
                </Text>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <View style={styles.metaContainer}>
                    <View style={styles.metaRow}>
                        <Ionicons name="cube-outline" size={14} color={colors.textSecondary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>{a.tipoProduto}</Text>
                    </View>
                    {a.demoLink ? (
                        <View style={styles.metaRow}>
                            <Ionicons name="link-outline" size={14} color={colors.primary} />
                            <Text style={[styles.metaText, { color: colors.primary }]}>Demo disponível</Text>
                        </View>
                    ) : null}
                </View>

                <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => handleDelete(a.id)}
                >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* --- MODAL DE CRIAÇÃO --- */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={[styles.modalOverlay, { backgroundColor: colors.modalBg }]}
          >
            <View style={[styles.modalContent, { backgroundColor: colors.card, shadowColor: colors.shadow }]}>
              
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Novo Anúncio</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <Text style={[styles.label, { color: colors.text }]}>Título</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={titulo}
                  onChangeText={setTitulo}
                  placeholder="Ex: Venda de Imóvel"
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border, height: 80 }]}
                  value={descricao}
                  onChangeText={setDescricao}
                  placeholder="Detalhes do anúncio..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  textAlignVertical="top"
                />

                <Text style={[styles.label, { color: colors.text }]}>Tipo de Produto</Text>
                <View style={{ zIndex: 10 }}>
                    <TouchableOpacity 
                        style={[styles.input, styles.dropdownBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                        onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                    >
                        <Text style={{ color: tipoProduto ? colors.text : colors.textSecondary }}>
                            {tipoProduto || 'Selecione o tipo'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    
                    {showTypeDropdown && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {types.map((t) => (
                                <TouchableOpacity 
                                    key={t} 
                                    style={[styles.dropdownItem, { borderBottomColor: colors.border }]}
                                    onPress={() => { setTipoProduto(t); setShowTypeDropdown(false); }}
                                >
                                    <Text style={{ color: colors.text }}>{t}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>

                <Text style={[styles.label, { color: colors.text }]}>Link da Capa</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={capa}
                  onChangeText={setCapa}
                  placeholder="https://..."
                  placeholderTextColor={colors.textSecondary}
                />

                <Text style={[styles.label, { color: colors.text }]}>Link de Demonstração</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text, borderColor: colors.border }]}
                  value={demoLink}
                  onChangeText={setDemoLink}
                  placeholder="https://..."
                  placeholderTextColor={colors.textSecondary}
                />

                <View style={styles.modalActions}>
                    <TouchableOpacity
                        style={[styles.buttonFechar, { backgroundColor: colors.inputBg }]}
                        onPress={() => setModalVisible(false)}
                    >
                        <Text style={[styles.buttonFecharText, { color: colors.text }]}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                        style={[styles.buttonSalvar, { backgroundColor: colors.primary }]}
                        onPress={handleAdicionarAnuncio}
                    >
                        <Text style={styles.buttonSalvarText}>Salvar</Text>
                    </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 4 },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: { fontSize: 24, fontWeight: '700' },
  pageSubtitle: { fontSize: 14 },
  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    paddingBottom: 40,
  },
  
  // Card Styles
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center'
  },
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6
  },
  statusText: { fontSize: 10, fontWeight: '700' },
  
  title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: 13, marginBottom: 12, height: 36 },
  
  divider: { height: 1, width: '100%', marginBottom: 12 },
  
  metaContainer: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '500' },
  
  deleteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    padding: 4,
  },

  // Empty State
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60, gap: 16 },
  semAnuncios: { fontSize: 16 },

  // Botão Novo
  buttonNovo: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 6,
  },
  buttonNovoText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    maxHeight: '85%',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalBody: { padding: 20 },
  
  label: { fontSize: 14, fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, borderWidth: 1, borderRadius: 8, marginTop: 4 },
  dropdownItem: { padding: 12, borderBottomWidth: 1 },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
  },
  buttonFechar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonFecharText: { fontWeight: '600' },
  buttonSalvar: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonSalvarText: { color: '#FFF', fontWeight: '600' },
});