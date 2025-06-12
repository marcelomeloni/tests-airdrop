// No topo do seu arquivo home.js
console.log('Antes da importação do Supabase');
import { supabase } from './supabase.js';
console.log('Supabase importado:', supabase ? 'OK' : 'FALHOU');

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');

        // Tamanho aleatório
        const size = Math.random() * 15 + 5;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Posição inicial aleatória
        particle.style.left = `${Math.random() * 100}%`;

        // Duração e atraso aleatórios para animação
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }
}
async function registerOrUpdateUser(walletAddress) {
    try {
      console.log('Tentando registrar/atualizar:', walletAddress);
      const username = walletAddress.slice(-4);
      const now = new Date().toISOString();
  
      // Usa maybeSingle em vez de single
      const { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .maybeSingle();
      if (selectError) throw selectError;
  
      if (existingUser) {
        console.log('Usuário existente, atualizando...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ last_login: now })
          .eq('id', existingUser.id);
        if (updateError) throw updateError;
        console.log('Usuário atualizado com sucesso');
        return existingUser.id;
      } else {
        console.log('Criando novo usuário...');
        const { data: inserted, error: insertError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            username,
            created_at: now,
            last_login: now
          })
          .select('id')
          .maybeSingle();
        if (insertError) throw insertError;
        console.log('Novo usuário criado com sucesso');
        return inserted.id;
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      return null;
    }
  }
  
// Toggle de tema claro/escuro
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Verificar se há preferência salva ou do sistema
const savedTheme = localStorage.getItem('sunaryum-theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Definir tema inicial
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
}

// Alternar tema
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');

    if (body.classList.contains('dark-theme')) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('sunaryum-theme', 'dark');
    } else {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('sunaryum-theme', 'light');
    }
});
async function checkWalletInstalled() {
    // Espera um pouco para garantir que a extensão foi injetada
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!window.sunaryumWallet) {
        return false;
    }

    try {
        return await Promise.race([
            window.sunaryumWallet.isInstalled(),
            new Promise(resolve => setTimeout(() => resolve(false), 300))
        ]);
    } catch (e) {
        console.error('Erro ao verificar extensão:', e);
        return false;
    }
}

// Conexão da Wallet - Setup e Handlers
function setupWalletConnection() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletAddress = document.getElementById('walletAddress');
    let currentWallet = null;

    // Configura listener para o botão de conexão
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            // Efeito visual durante o carregamento
            connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            connectBtn.disabled = true;

            // Dispara mensagem para a extensão ou sistema de wallet
            window.postMessage({
                type: 'OPEN_WALLET_CONNECT',
                origin: window.location.origin
            }, '*');
        });
    }

    // Listener para resposta da conexão
    window.addEventListener('message', (event) => {
        if (event.data.type === 'WALLET_CONNECTED') {
            handleWalletConnect(event.data.data);
        }
    });

    // Handler para conexão bem-sucedida
    async function handleWalletConnect(data) {
        if (!data?.address) {
            resetConnectButton();
            return;
        }
    
        // REGISTRA NO SUPABASE e obtém o userId, se quiser:
        // Supondo que registerOrUpdateUser retorne o id do usuário:
        const userId = await registerOrUpdateUser(data.address);
        // Se não retornar id, ignore este valor e use só o walletAddress.
    
        // Salva em localStorage para “sessão”
        localStorage.setItem('sunaryumWalletAddress', data.address);
        if (userId) {
          localStorage.setItem('sunaryumUserId', userId);
        }
    
        currentWallet = data;
    
        // Atualiza UI com endereço conectado
        const shortAddress = `${data.address.slice(0, 6)}...${data.address.slice(-4)}`;
        const walletAddressEl = document.getElementById('walletAddress');
        if (walletAddressEl) {
            walletAddressEl.textContent = shortAddress;
            walletAddressEl.style.display = 'block';
        }
    
        // Efeito de confete
        await triggerConfettiEffect();
    
        // Configura botão para ir ao dashboard
        if (connectBtn) {
            const newBtn = connectBtn.cloneNode(true);
            connectBtn.replaceWith(newBtn);
            newBtn.innerHTML = '<i class="fas fa-rocket"></i> Ir para o Dashboard';
            newBtn.disabled = false;
            newBtn.addEventListener('click', () => {
                // Já salvamos a sessão; basta redirecionar:
                window.location.href = 'dashboard.html';
            });
        }
    
        document.dispatchEvent(new CustomEvent('walletConnected', { detail: data }));
    }
    
    // Efeito de confete/partículas para feedback visual
    async function triggerConfettiEffect() {
        return new Promise(resolve => {
            // Cria partículas extras para o efeito
            const particlesContainer = document.getElementById('particles');
            const burstParticles = 50;

            for (let i = 0; i < burstParticles; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle', 'burst-particle');

                // Configuração aleatória para o efeito
                const size = Math.random() * 20 + 5;
                const color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; // Tons de amarelo/laranja

                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;

                // Animação especial para o burst
                const duration = Math.random() * 2 + 1;
                particle.style.animation = `burstAnimation ${duration}s forwards`;

                particlesContainer.appendChild(particle);

                // Remove após a animação
                setTimeout(() => {
                    particle.remove();
                }, duration * 1000);
            }

            setTimeout(resolve, 1000);
        });
    }

    // Reseta o botão se a conexão falhar
    function resetConnectButton() {
        if (connectBtn) {
            connectBtn.innerHTML = 'Conectar Carteira <i class="fas fa-plug"></i>';
            connectBtn.disabled = false;
        }
    }

    return {
        getWalletState: () => currentWallet
    };
}

// Integração com Extensão (se aplicável)
if (typeof browser !== 'undefined') {
    window.addEventListener('message', (event) => {
        if (event.data.type === 'OPEN_WALLET_CONNECT') {
            browser.runtime.sendMessage({
                action: "openConnectWindow",
                origin: event.data.origin
            });
        }
    });

    browser.runtime.onMessage.addListener((msg) => {
        if (msg.action === "walletDataUpdate") {
            window.postMessage({
                type: 'WALLET_CONNECTED',
                data: msg.data
            }, '*');
        }
    });
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const walletModule = setupWalletConnection();

    // Exemplo de como outras partes do sistema podem acessar o estado
    document.addEventListener('walletConnected', (e) => {
        console.log('Wallet connected:', e.detail);
    });
});

// Inicializar partículas quando a página carregar
window.addEventListener('load', createParticles);