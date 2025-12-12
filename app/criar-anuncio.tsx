import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, useColorScheme, useWindowDimensions, SafeAreaView, StatusBar, KeyboardAvoidingView } from 'react-native';
import {
  Alert,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAnuncio } from './lib/database'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- TEMA DE CORES ---
const THEME = {
  light: {
    bg: '#F8F9FA',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    primary: '#1F41BB',
    border: '#E5E7EB',
    inputBg: '#FFFFFF',
    inputBorder: '#E5E7EB',
    success: '#10B981',
    danger: '#EF4444',
    modalBg: '#FFFFFF',
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.5)'
  },
  dark: {
    bg: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#3B82F6',
    border: '#374151',
    inputBg: '#374151',
    inputBorder: '#4B5563',
    success: '#34D399',
    danger: '#F87171',
    modalBg: '#1F2937',
    shadow: '#000000',
    overlay: 'rgba(0,0,0,0.7)'
  }
};

interface UploadedFile {
  name: string;
  type: string;
  uri: string;
}

export default function CriarAnuncioScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { width } = useWindowDimensions();
  
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;

  // Step 1: Anúncio
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tipoProduto, setTipoProduto] = useState('');
  
  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState('');
  const [activeTab, setActiveTab] = useState('imagem');
  const [uploadedFiles, setUploadedFiles] = useState<{
    cover?: UploadedFile;
    produto?: UploadedFile;
    demo?: UploadedFile;
  }>({});

  // Step 2: Campanha
  const [nomeCampanha, setNomeCampanha] = useState('');
  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);
  const [showInicioPicker, setShowInicioPicker] = useState(false);
  const [showFimPicker, setShowFimPicker] = useState(false);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Dropdowns
  const [areaSelecionada, setAreaSelecionada] = useState('');
  const [dropdownAberto, setDropdownAberto] = useState(false);
  const areas = ['Beira', 'Sofala', 'Maputo', 'Nampula'];
  
  const [periodoSelecionado, setPeriodoSelecionado] = useState('');
  const [dropdownPeriodoAberto, setDropdownPeriodoAberto] = useState(false);
  
  const [tipoSelecionado, setTipoSelecionado] = useState('');
  const [dropdownTipoAberto, setDropdownTipoAberto] = useState(false);
  
  // Step 4: Pagamento
  const [metodoPagamento, setMetodoPagamento] = useState('');
  const [dropdownPagamentoAberto, setDropdownPagamentoAberto] = useState(false);
  const [numeroCelular, setNumeroCelular] = useState('');

  const metodosPagamento = ['Mpesa', 'Emola', 'Transferência Bancária', 'POS'];

  const periodos = [
    "Diário (1 dia)", "Semanal (7 dias)", "Quinzenal (15 dias)", 
    "Mensal (30 dias)", "Trimestral (90 dias)", "Indeterminado"
  ];

  const tipos = ['Geral', 'Infantil', 'Tecnologia', 'Moda', 'Imóveis'];

  // Step 3: Planos
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null);
  
  const planos = [
    { id: '1', name: 'RÁDIO CIDADE: AO VIVO (3H)', tipo: 'Geral', periodo: 'diario', preco: 20000 },
    { id: '2', name: 'RÁDIO CIDADE: SPOT', tipo: 'Geral', periodo: 'diario', preco: 5000 },
    { id: '3', name: 'ZOOM POWER', tipo: 'Geral', periodo: 'mensal', preco: 30000 },
    { id: '4', name: 'ZOOM START', tipo: 'Geral', periodo: 'mensal', preco: 20000 },
  ];

  const openUploadModal = (type: string) => {
    setCurrentUploadType(type);
    setActiveTab('imagem');
    setModalVisible(true);
  };

  const handlePickFile = async () => {
    try {
      if (activeTab === 'imagem' || activeTab === 'video') {
        const mediaTypes = activeTab === 'imagem' ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos;
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes, allowsEditing: true, quality: 0.8,
        });

        if (!result.canceled && result.assets?.length) {
          const asset = result.assets[0];
          const newFile: UploadedFile = {
            name: asset.fileName || `midia_${Date.now()}`,
            type: activeTab,
            uri: asset.uri,
          };
          setUploadedFiles((prev) => ({ ...prev, [currentUploadType]: newFile }));
          setModalVisible(false);
        }
      } else {
        const docResult = await DocumentPicker.getDocumentAsync({
          type: activeTab === 'audio' ? ['audio/*'] : ['application/pdf', 'application/msword', '*/*'],
        });

        if (!docResult.canceled && docResult.assets) {
          const file = docResult.assets[0];
          const newFile: UploadedFile = { name: file.name, type: activeTab, uri: file.uri };
          setUploadedFiles((prev) => ({ ...prev, [currentUploadType]: newFile }));
          setModalVisible(false);
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
    }
  };

  const handleFinalizar = async () => {
    if (!titulo.trim()) return Alert.alert('Erro', 'Título é obrigatório');
    if (!planoSelecionado) return Alert.alert('Erro', 'Selecione um plano');
    
    try {
        const jsonValue = await AsyncStorage.getItem('currentUser');
        const user = jsonValue != null ? JSON.parse(jsonValue) : null;

        if (!user?.email) return Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');

        await createAnuncio({
            user_email: user.email,
            titulo,
            descricao,
            tipo_produto: tipoProduto || 'Geral',
            capa: uploadedFiles.cover?.uri || '',
            arquivo_url: uploadedFiles.produto?.uri || '',
            demo_link: uploadedFiles.demo?.uri || ''
        });

        Alert.alert('Sucesso', 'Anúncio criado e salvo no banco de dados!', [
            { text: 'OK', onPress: () => router.replace('/(drawer)/lista') }
        ]);
    } catch (error) {
        Alert.alert('Erro', 'Falha ao salvar anúncio.');
    }
  };

  const renderFileStatus = (type: string) => {
    // @ts-ignore
    const file = uploadedFiles[type];
    if (file) {
      return (
        <View style={[styles.fileStatus, { backgroundColor: colors.success + '20' }]}>
          <Text style={[styles.fileStatusText, { color: colors.success }]}>✓ {file.name}</Text>
        </View>
      );
    }
    return null;
  };

  const modalSelectedFile = useMemo(() => {
    // @ts-ignore
    if (!currentUploadType) return undefined;
    // @ts-ignore
    return uploadedFiles[currentUploadType];
  }, [currentUploadType, uploadedFiles]);

  // Estilos Dinâmicos
  const inputStyle = [styles.input, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }];
  const cardStyle = [styles.formCard, { backgroundColor: colors.card, shadowColor: colors.shadow }];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.bg} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        
        {/* HEADER */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Novo Anúncio</Text>
            <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          
          {/* SEÇÃO 1: DETALHES */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Detalhes do Anúncio</Text>
            <View style={cardStyle}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Título <Text style={styles.required}>*</Text></Text>
                <TextInput style={inputStyle} value={titulo} onChangeText={setTitulo} placeholder="Ex: Publicacao de um anuncio" placeholderTextColor={colors.textSecondary} />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Descrição</Text>
                <TextInput style={[inputStyle, styles.textArea]} value={descricao} onChangeText={setDescricao} placeholder="Descreva o produto..." placeholderTextColor={colors.textSecondary} multiline textAlignVertical="top" />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Categoria</Text>
                <TextInput style={inputStyle} value={tipoProduto} onChangeText={setTipoProduto} placeholder="Ex: Radio de Mocambique..." placeholderTextColor={colors.textSecondary} />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Mídia e Arquivos</Text>
                {['cover', 'produto', 'demo'].map((type) => (
                    <View key={type}>
                        <TouchableOpacity style={[styles.linkButton, { borderColor: colors.border, backgroundColor: colors.bg }]} onPress={() => openUploadModal(type)}>
                            <Ionicons name="cloud-upload-outline" size={20} color={colors.textSecondary} />
                            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
                                Carregar {type === 'cover' ? 'Capa' : type === 'produto' ? 'Arquivo Principal' : 'Demonstração'}
                            </Text>
                        </TouchableOpacity>
                        {renderFileStatus(type)}
                    </View>
                ))}
              </View>
            </View>
          </View>

          {/* SEÇÃO 2: CAMPANHA */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuração da Campanha</Text>
            <View style={cardStyle}>
              <View style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Nome da Campanha</Text>
                <TextInput style={inputStyle} value={nomeCampanha} onChangeText={setNomeCampanha} placeholder="Identificação interna" placeholderTextColor={colors.textSecondary} />
              </View>

              {/* Datas */}
              <View style={styles.rowContainer}>
                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Início</Text>
                    <TouchableOpacity onPress={() => setShowInicioPicker(true)} style={[inputStyle, styles.dateInput]}>
                      <Text style={{ color: dataInicio ? colors.text : colors.textSecondary }}>{dataInicio ? dataInicio.toLocaleDateString() : "dd/mm/aaaa"}</Text>
                      <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showInicioPicker && <DateTimePicker value={dataInicio || today} mode="date" onChange={(e, d) => { setShowInicioPicker(false); if(d) setDataInicio(d); }} />}
                  </View>
                  <View style={{ width: 12 }} />
                  <View style={[styles.fieldContainer, { flex: 1 }]}>
                    <Text style={[styles.label, { color: colors.text }]}>Fim</Text>
                    <TouchableOpacity onPress={() => setShowFimPicker(true)} style={[inputStyle, styles.dateInput]}>
                      <Text style={{ color: dataFim ? colors.text : colors.textSecondary }}>{dataFim ? dataFim.toLocaleDateString() : "dd/mm/aaaa"}</Text>
                      <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {showFimPicker && <DateTimePicker value={dataFim || today} mode="date" onChange={(e, d) => { setShowFimPicker(false); if(d) setDataFim(d); }} />}
                  </View>
              </View>

              {/* Dropdowns */}
              {[
                  { label: 'Região Alvo', state: areaSelecionada, setter: setAreaSelecionada, options: areas, open: dropdownAberto, setOpen: setDropdownAberto },
                  { label: 'Duração', state: periodoSelecionado, setter: setPeriodoSelecionado, options: periodos, open: dropdownPeriodoAberto, setOpen: setDropdownPeriodoAberto },
                  { label: 'Público Alvo', state: tipoSelecionado, setter: setTipoSelecionado, options: tipos, open: dropdownTipoAberto, setOpen: setDropdownTipoAberto }
              ].map((dd, index) => (
                  <View key={index} style={[styles.fieldContainer, { zIndex: 50 - index }]}>
                      <Text style={[styles.label, { color: colors.text }]}>{dd.label}</Text>
                      <TouchableOpacity style={[styles.dropdown, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} onPress={() => dd.setOpen(!dd.open)}>
                          <Text style={{ color: dd.state ? colors.text : colors.textSecondary }}>{dd.state || 'Selecione...'}</Text>
                          <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                      </TouchableOpacity>
                      {dd.open && (
                          <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                              {dd.options.map((opt, i) => (
                                  <TouchableOpacity key={i} style={[styles.dropdownItem, { borderBottomColor: colors.border }]} onPress={() => { dd.setter(opt); dd.setOpen(false); }}>
                                      <Text style={{ color: colors.text }}>{opt}</Text>
                                  </TouchableOpacity>
                              ))}
                          </View>
                      )}
                  </View>
              ))}
            </View>
          </View>

          {/* SEÇÃO 3: PLANOS */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha o Plano</Text>
            <View style={{ gap: 12 }}>
              {planos.map((plano) => {
                  const isSelected = planoSelecionado === plano.id;
                  return (
                    <TouchableOpacity
                      key={plano.id}
                      style={[
                        styles.planoCard,
                        { backgroundColor: colors.card, borderColor: isSelected ? colors.primary : colors.border },
                        isSelected && { borderWidth: 2, backgroundColor: colors.primary + '10' }
                      ]}
                      onPress={() => setPlanoSelecionado(plano.id)}
                    >
                      <View style={{flex: 1}}>
                          <Text style={[styles.planoName, { color: colors.text }]}>{plano.name}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{plano.periodo} • {plano.tipo}</Text>
                      </View>
                      <Text style={{ color: colors.primary, fontWeight: '700' }}>{plano.preco.toLocaleString()} MZN</Text>
                      <View style={[styles.radio, { borderColor: isSelected ? colors.primary : colors.textSecondary }, isSelected && { backgroundColor: colors.primary }]}>
                          {isSelected && <Ionicons name="checkmark" size={12} color="#FFF" />}
                      </View>
                    </TouchableOpacity>
                  );
              })}
            </View>
          </View>

          {/* SEÇÃO 4: PAGAMENTO */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Pagamento</Text>
            <View style={cardStyle}>
                <View style={{ zIndex: 100 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Método de Pagamento</Text>
                    <TouchableOpacity 
                        style={[styles.dropdown, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder }]} 
                        onPress={() => setDropdownPagamentoAberto(!dropdownPagamentoAberto)}
                    >
                        <Text style={{ color: metodoPagamento ? colors.text : colors.textSecondary }}>{metodoPagamento || 'Selecione...'}</Text>
                        <Ionicons name="card-outline" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {dropdownPagamentoAberto && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                            {metodosPagamento.map((opt, i) => (
                                <TouchableOpacity key={i} style={[styles.dropdownItem, { borderBottomColor: colors.border }]} onPress={() => { setMetodoPagamento(opt); setDropdownPagamentoAberto(false); }}>
                                    <Text style={{ color: colors.text }}>{opt}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
                <View style={{ marginTop: 12 }}>
                    <Text style={[styles.label, { color: colors.text }]}>Número de Celular</Text>
                    <TextInput style={inputStyle} value={numeroCelular} onChangeText={setNumeroCelular} placeholder="84/85 XXXXXXX" placeholderTextColor={colors.textSecondary} keyboardType="phone-pad" />
                </View>
            </View>
          </View>
        </ScrollView>

        {/* FOOTER */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TouchableOpacity style={[styles.buttonCancel, { backgroundColor: colors.inputBg }]} onPress={() => router.back()}>
                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.buttonNext, { backgroundColor: colors.primary }]} onPress={handleFinalizar}>
                <Text style={{ color: '#FFF', fontWeight: '600' }}>Finalizar Pedido</Text>
            </TouchableOpacity>
        </View>

        {/* MODAL DE UPLOAD */}
        <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
            <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: colors.overlay }]} activeOpacity={1} onPress={() => setModalVisible(false)}>
                <TouchableOpacity style={[styles.modalContent, { backgroundColor: colors.modalBg }]} activeOpacity={1}>
                    <View style={[styles.tabsContainer, { backgroundColor: colors.inputBg }]}>
                        {['imagem', 'documento', 'video'].map(tab => (
                            <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && { backgroundColor: colors.card }]} onPress={() => setActiveTab(tab)}>
                                <Text style={{ color: activeTab === tab ? colors.text : colors.textSecondary, fontSize: 12, fontWeight: '600' }}>{tab.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.uploadArea}>
                        <View style={[styles.uploadBox, { backgroundColor: colors.bg, borderColor: colors.primary }]}>
                            {modalSelectedFile ? (
                                <>
                                    <Text style={{ color: colors.success, fontWeight: '700', marginBottom: 4 }}>{modalSelectedFile.name}</Text>
                                    <Text style={{ color: colors.textSecondary }}>Tipo: {modalSelectedFile.type}</Text>
                                </>
                            ) : (
                                <Text style={{ color: colors.textSecondary }}>Toque em Selecionar</Text>
                            )}
                        </View>
                    </View>
                    <View style={styles.modalActions}>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.primary }]} onPress={handlePickFile}>
                            <Text style={{color: '#FFF'}}>Selecionar Arquivo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.inputBg }]} onPress={() => setModalVisible(false)}>
                            <Text style={{color: colors.text}}>Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 40 },
  section: { marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  formCard: { borderRadius: 12, padding: 20, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, gap: 16 },
  fieldContainer: { gap: 6 },
  rowContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  required: { color: '#EF4444' },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 14, minHeight: 48 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  dateInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, padding: 12, borderRadius: 8, height: 48 },
  dropdownList: { position: 'absolute', top: '100%', left: 0, right: 0, borderWidth: 1, borderRadius: 8, marginTop: 4, zIndex: 1000, elevation: 5 },
  dropdownItem: { padding: 12, borderBottomWidth: 1 },
  linkButton: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, padding: 12, gap: 10, marginBottom: 8 },
  linkText: { fontSize: 14 },
  fileStatus: { padding: 8, borderRadius: 6, marginBottom: 8 },
  fileStatusText: { fontSize: 12, fontWeight: '600' },
  planoCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  planoName: { fontSize: 14, fontWeight: '700' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  footer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12 },
  buttonCancel: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonNext: { flex: 1, padding: 14, borderRadius: 8, alignItems: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 16, width: '100%', overflow: 'hidden' },
  tabsContainer: { flexDirection: 'row', padding: 6 },
  tab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 6 },
  uploadArea: { padding: 20, alignItems: 'center' },
  uploadBox: { width: '100%', padding: 30, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center' },
  modalActions: { flexDirection: 'row', padding: 16, gap: 12, justifyContent: 'center' },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
});