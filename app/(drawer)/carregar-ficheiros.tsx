import DashboardLayout from '@/components/DashboardLayout';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  useColorScheme,
  useWindowDimensions,
  Platform,
  Alert,
  ProgressBarAndroid, // Para Android
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';

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
    success: '#10B981',
    warning: '#F59E0B',
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
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171'
  }
};

interface FileStat {
  name: string;
  size: number;
  uri: string;
}

export default function CarregarFicheirosScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = isDark ? THEME.dark : THEME.light;
  
  const [selectedFile, setSelectedFile] = useState<FileStat | null>(null);
  const [files, setFiles] = useState<FileStat[]>([]);
  
  // Estatísticas Mockadas
  const maxStorage = 5 * 1024 * 1024 * 1024; // 5GB
  const usedStorage = files.reduce((acc, file) => acc + file.size, 0);
  const usagePercentage = usedStorage / maxStorage;

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setSelectedFile({
        name: asset.name,
        size: asset.size || 0,
        uri: asset.uri
      });

    } catch (err) {
      Alert.alert("Erro", "Falha ao selecionar arquivo");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
        return Alert.alert("Atenção", "Nenhum arquivo selecionado.");
    }
    
    // Simulação de upload
    setFiles(prev => [...prev, selectedFile]);
    setSelectedFile(null);
    Alert.alert("Sucesso", "Arquivo carregado com sucesso!");
  };

  // Barra de progresso customizada (Cross-platform)
  const ProgressBar = ({ progress }: { progress: number }) => (
    <View style={[styles.progressContainer, { backgroundColor: colors.border }]}>
      <View style={[
          styles.progressBar, 
          { 
              width: `${Math.min(progress * 100, 100)}%`,
              backgroundColor: progress > 0.9 ? colors.danger : progress > 0.7 ? colors.warning : colors.success 
          }
      ]} />
    </View>
  );

  return (
    <DashboardLayout>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
            <Text style={[styles.pageTitle, { color: colors.text }]}>Gerenciador de Arquivos</Text>
            <Text style={[styles.pageSubtitle, { color: colors.textSecondary }]}>Faça upload e gerencie seus documentos</Text>
        </View>

        {/* Área de Upload */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.uploadRow, { borderColor: colors.border }]}>
                <TouchableOpacity 
                    style={[styles.chooseBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                    onPress={pickDocument}
                >
                    <Text style={{ color: colors.text }}>Choose File</Text>
                </TouchableOpacity>
                
                <Text 
                    style={[styles.fileName, { color: colors.textSecondary }]}
                    numberOfLines={1}
                >
                    {selectedFile ? selectedFile.name : "No file chosen"}
                </Text>

                <TouchableOpacity 
                    style={[styles.uploadBtn, { backgroundColor: colors.primary }]}
                    onPress={handleUpload}
                >
                    <Text style={styles.uploadBtnText}>Upload</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Filtros */}
        <View style={styles.filterRow}>
            <Text style={[styles.label, { color: colors.text }]}>Filtrar por tipo:</Text>
            <View style={[styles.dropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={{ color: colors.text }}>Todos</Text>
                <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </View>
        </View>

        {/* Lista de Arquivos */}
        <View style={styles.listContainer}>
            {files.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Nenhum arquivo encontrado.</Text>
            ) : (
                files.map((file, index) => (
                    <View key={index} style={[styles.fileItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                        <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                        <Text style={[styles.fileItemName, { color: colors.text }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{(file.size / 1024).toFixed(2)} KB</Text>
                    </View>
                ))
            )}
        </View>

        {/* Estatísticas */}
        <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsHeader}>
                <Ionicons name="stats-chart" size={18} color={colors.primary} />
                <Text style={[styles.statsTitle, { color: colors.primary }]}>Estatísticas</Text>
            </View>

            <View style={styles.statsGrid}>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>Total de arquivos: <Text style={{fontWeight:'bold', color: colors.text}}>{files.length}</Text></Text>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>Espaço usado: <Text style={{fontWeight:'bold', color: colors.text}}>{(usedStorage / 1024 / 1024).toFixed(2)} MB</Text></Text>
                <Text style={[styles.statText, { color: colors.textSecondary }]}>Ativos: <Text style={{fontWeight:'bold', color: colors.text}}>{files.length}</Text> — Eliminados: 0</Text>
            </View>

            <Text style={[styles.statLabel, { color: colors.text, marginTop: 12 }]}>Uso da conta (máx. 5 GB)</Text>
            <ProgressBar progress={usagePercentage} />
            
            <View style={styles.legendContainer}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Espaço seguro (até 70%)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Atenção (71% a 90%)</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.danger }]} />
                    <Text style={[styles.legendText, { color: colors.textSecondary }]}>Quase cheio (+90%)</Text>
                </View>
            </View>
        </View>

        {/* Paginação */}
        <View style={styles.pagination}>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: colors.inputBg }]}>
                <Text style={{ color: colors.textSecondary }}>Anterior</Text>
            </TouchableOpacity>
            <Text style={{ color: colors.textSecondary }}>Página 1 de 1</Text>
            <TouchableOpacity style={[styles.pageBtn, { backgroundColor: colors.inputBg }]}>
                <Text style={{ color: colors.textSecondary }}>Próximo</Text>
            </TouchableOpacity>
        </View>

      </View>
    </DashboardLayout>
  );
}

const styles = StyleSheet.create({
  container: { gap: 20, paddingBottom: 40 },
  header: { marginBottom: 10 },
  pageTitle: { fontSize: 24, fontWeight: '700' },
  pageSubtitle: { fontSize: 14 },
  
  card: { padding: 20, borderRadius: 12, borderWidth: 1 },
  uploadRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 6, overflow: 'hidden' },
  chooseBtn: { paddingVertical: 10, paddingHorizontal: 12, borderRightWidth: 1 },
  fileName: { flex: 1, paddingHorizontal: 10 },
  uploadBtn: { paddingVertical: 10, paddingHorizontal: 20 },
  uploadBtnText: { color: '#FFF', fontWeight: '600' },

  filterRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontWeight: '600' },
  dropdown: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, borderWidth: 1 },

  listContainer: { minHeight: 100, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 14 },
  fileItem: { flexDirection: 'row', alignItems: 'center', width: '100%', padding: 12, borderRadius: 8, borderWidth: 1, gap: 10 },
  fileItemName: { flex: 1, fontWeight: '500' },

  statsCard: { padding: 20, borderRadius: 12, borderWidth: 1 },
  statsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  statsTitle: { fontSize: 16, fontWeight: '600' },
  statsGrid: { gap: 4 },
  statText: { fontSize: 13 },
  statLabel: { fontSize: 13, marginBottom: 6 },
  
  progressContainer: { height: 10, borderRadius: 5, overflow: 'hidden', width: '100%', marginBottom: 12 },
  progressBar: { height: '100%', borderRadius: 5 },

  legendContainer: { gap: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 2 },
  legendText: { fontSize: 11 },

  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 10 },
  pageBtn: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6 },
});