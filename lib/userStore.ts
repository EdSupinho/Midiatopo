export type PackageType = 'trial' | 'basico' | 'premium' | 'enterprise';

export type User = {
  nome: string;
  apelido: string;
  email: string;
  password: string;
  package?: PackageType; // Opcional para manter compatibilidade
};

const users: User[] = [];

export function addUser(user: User) {
  users.push(user);
}

export function emailExists(rawEmail: string) {
  const normalized = rawEmail.trim().toLowerCase();
  return users.some((user) => user.email === normalized);
}

export function authenticate(email: string, password: string) {
  const normalized = email.trim().toLowerCase();
  return users.find(
    (user) => user.email === normalized && user.password === password,
  );
}

export function getUsers() {
  return [...users];
}

export function getUserPackage(email: string): PackageType {
  const normalized = email.trim().toLowerCase();
  const user = users.find((u) => u.email === normalized);
  return user?.package || 'trial';
}

export type PackageLimitations = {
  name: string;
  description: string;
  features: {
    label: string;
    value: string | number;
    unlimited?: boolean;
  }[];
};

export function getPackageLimitations(packageType: PackageType): PackageLimitations {
  const limitations: Record<PackageType, PackageLimitations> = {
    trial: {
      name: 'Modo de Teste Gratuito',
      description: 'Pacote de teste com limitações básicas para experimentar a plataforma',
      features: [
        { label: 'Duração', value: '60 dias' },
        { label: 'Anúncios por mês', value: 5 },
        { label: 'Campanhas simultâneas', value: 2 },
        { label: 'Armazenamento de ficheiros', value: '100 MB' },
        { label: 'Suporte', value: 'Email' },
        { label: 'Relatórios', value: 'Básicos' },
      ],
    },
    basico: {
      name: 'Pacote Básico',
      description: 'Ideal para pequenas empresas que estão começando',
      features: [
        { label: 'Duração', value: 'Mensal' },
        { label: 'Anúncios por mês', value: 20 },
        { label: 'Campanhas simultâneas', value: 5 },
        { label: 'Armazenamento de ficheiros', value: '1 GB' },
        { label: 'Suporte', value: 'Email + Chat' },
        { label: 'Relatórios', value: 'Completos' },
      ],
    },
    premium: {
      name: 'Pacote Premium',
      description: 'Para empresas que precisam de mais recursos e alcance',
      features: [
        { label: 'Duração', value: 'Mensal' },
        { label: 'Anúncios por mês', value: 100 },
        { label: 'Campanhas simultâneas', value: 20 },
        { label: 'Armazenamento de ficheiros', value: '10 GB' },
        { label: 'Suporte', value: 'Prioritário 24/7' },
        { label: 'Relatórios', value: 'Avançados + Analytics' },
      ],
    },
    enterprise: {
      name: 'Pacote Enterprise',
      description: 'Solução completa para grandes empresas com necessidades específicas',
      features: [
        { label: 'Duração', value: 'Personalizado' },
        { label: 'Anúncios por mês', value: 'Ilimitado', unlimited: true },
        { label: 'Campanhas simultâneas', value: 'Ilimitado', unlimited: true },
        { label: 'Armazenamento de ficheiros', value: 'Ilimitado', unlimited: true },
        { label: 'Suporte', value: 'Dedicado + Gerente de conta' },
        { label: 'Relatórios', value: 'Customizados + API' },
      ],
    },
  };

  return limitations[packageType];
}

