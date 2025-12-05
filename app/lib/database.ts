import * as SQLite from 'expo-sqlite';

// Abre o banco de dados
const db = SQLite.openDatabaseSync('midiatopo.db');

export const initDatabase = async () => {
  try {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      -- Cria a tabela básica se não existir
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        apelido TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      -- Tabela de Anúncios
      CREATE TABLE IF NOT EXISTS anuncios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT,
        tipo_produto TEXT,
        capa TEXT,
        arquivo_url TEXT,
        demo_link TEXT,
        status TEXT DEFAULT 'pendente',
        views INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // --- MIGRAÇÕES (Adicionar colunas se não existirem) ---
    // Tenta adicionar as colunas novas. Se já existirem, o erro é ignorado.
    await safeAddColumn('users', 'telefone', 'TEXT');
    await safeAddColumn('users', 'bio', 'TEXT');
    await safeAddColumn('users', 'profile_image', 'TEXT');

    console.log('Banco de dados inicializado e atualizado.');
  } catch (error) {
    console.error('Erro ao iniciar DB:', error);
  }
};

// Função auxiliar para adicionar colunas com segurança
const safeAddColumn = async (table: string, column: string, type: string) => {
  try {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
  } catch (error) {
    // Ignora erro se a coluna já existir
    // console.log(`Coluna ${column} já existe ou erro ao adicionar.`);
  }
};

// --- USUÁRIOS ---

export const addUser = async (user: any) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO users (nome, apelido, email, password, telefone, bio, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.nome, user.apelido, user.email, user.password, '', 'Administrador.', null] // Valores padrão
    );
    return result;
  } catch (error) {
    console.error('Erro ao adicionar usuário:', error);
    throw error;
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    return user;
  } catch (error) {
    console.error('Erro ao autenticar:', error);
    throw error;
  }
};

export const checkEmailExists = async (email: string) => {
  try {
    const user = await db.getFirstAsync('SELECT id FROM users WHERE email = ?', [email]);
    return !!user;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string) => {
  try {
    const user = await db.getFirstAsync('SELECT * FROM users WHERE email = ?', [email]);
    return user;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
};

// Atualizar perfil do usuário
export const updateUserProfile = async (email: string, data: { nome: string; telefone: string; bio: string; profile_image: string | null }) => {
  try {
    await db.runAsync(
      'UPDATE users SET nome = ?, telefone = ?, bio = ?, profile_image = ? WHERE email = ?',
      [data.nome, data.telefone, data.bio, data.profile_image, email]
    );
    return true;
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    throw error;
  }
};

// --- ANÚNCIOS ---

export const createAnuncio = async (data: { user_email: string; titulo: string; descricao: string; tipo_produto: string; capa: string; arquivo_url: string; demo_link: string }) => {
  try {
    const result = await db.runAsync(
      `INSERT INTO anuncios (user_email, titulo, descricao, tipo_produto, capa, arquivo_url, demo_link, status, views) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pendente', 0)`,
      [data.user_email, data.titulo, data.descricao, data.tipo_produto, data.capa, data.arquivo_url, data.demo_link]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Erro ao criar anúncio:', error);
    throw error;
  }
};

export const getUserAnuncios = async (email: string) => {
  try {
    const anuncios = await db.getAllAsync('SELECT * FROM anuncios WHERE user_email = ? ORDER BY created_at DESC', [email]);
    return anuncios;
  } catch (error) {
    console.error('Erro ao buscar anúncios:', error);
    return [];
  }
};

export const deleteAnuncio = async (id: number) => {
    try {
        await db.runAsync('DELETE FROM anuncios WHERE id = ?', [id]);
        return true;
    } catch (error) {
        console.error('Erro ao deletar:', error);
        throw error;
    }
}