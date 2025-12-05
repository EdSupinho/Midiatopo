/**
 * CONFIGURAÇÕES DE REDE
 * Aqui você define o endereço do seu servidor/computador.
 */

// 1. Se estiver no Emulador do Android, use:
const SERVER_URL = 'http://10.0.2.2:3000';

// 2. Se estiver no iPhone (Simulador), use:
// const SERVER_URL = 'http://localhost:3000';

// 3. Se estiver no Dispositivo Físico (Seu telemóvel via Wi-Fi):
// Abra o terminal do PC, digite 'ipconfig' (Windows) ou 'ifconfig' (Mac/Linux)
// e pegue o endereço IPv4 (ex: 192.168.1.5)
const SEU_IP_LOCAL = '192.168.0.122'; // <--- ALTERE AQUI O SEU IP

export const API_URL = `http://${SEU_IP_LOCAL}:3000`; // Porta do seu servidor

export const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};