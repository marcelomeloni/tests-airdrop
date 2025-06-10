// Função para criar partículas no fundo
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

        // Posição inicial aleatória horizontal
        particle.style.left = `${Math.random() * 100}%`;

        // Duração e atraso aleatórios para animação
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        particle.style.animationDuration = `${duration}s`;
        particle.style.animationDelay = `${delay}s`;

        particlesContainer.appendChild(particle);
    }
}

// Toggle do tema claro/escuro com persistência local
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('sunaryum-theme');
const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Aplica tema inicial conforme preferência salva ou do sistema
if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
} else {
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// Alternar tema ao clicar no botão
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

// Verifica se a wallet da extensão está instalada
async function checkWalletInstalled() {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!window.sunaryumWallet) return false;

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

// Setup e handlers para conexão da wallet
function setupWalletConnection() {
    const connectBtn = document.getElementById('connectWalletBtn');
    const walletAddress = document.getElementById('walletAddress');
    let currentWallet = null;

    // Evento clique no botão conectar
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
            connectBtn.disabled = true;

            // Dispara mensagem para extensão/sistema abrir popup de conexão
            window.postMessage({
                type: 'OPEN_WALLET_CONNECT',
                origin: window.location.origin
            }, '*');
        });
    }

    // Listener para receber mensagem de wallet conectada
    window.addEventListener('message', (event) => {
        // Verifica a origem para segurança
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'WALLET_CONNECTED') {
          handleWalletConnect(event.data.data);
        }
      });

    // Handler para wallet conectada com sucesso
    async function handleWalletConnect(data) {
        if (!data?.address) {
            resetConnectButton();
            return;
        }

        currentWallet = data;

        // Salva dados no localStorage para dashboard
        localStorage.setItem('sunaryumWalletData', JSON.stringify(data));

        // Atualiza UI com endereço curto
        const shortAddress = `${data.address.slice(0, 6)}...${data.address.slice(-4)}`;
        if (walletAddress) {
            walletAddress.textContent = shortAddress;
            walletAddress.style.display = 'block';
        }

        // Mostra efeito visual de confete
        await triggerConfettiEffect();

        // Atualiza botão para ir ao dashboard
        if (connectBtn) {
            const newBtn = connectBtn.cloneNode(true);
            connectBtn.replaceWith(newBtn);

            newBtn.innerHTML = '<i class="fas fa-rocket"></i> Ir para o Dashboard';
            newBtn.disabled = false;

            newBtn.addEventListener('click', () => {
                localStorage.setItem('sunaryumWalletData', JSON.stringify(currentWallet));
                window.location.href = 'dashboard.html';
            });
        }

        // Dispara evento customizado para outras partes do sistema
        document.dispatchEvent(new CustomEvent('walletConnected', { detail: data }));
    }

    // Efeito confete com partículas extras
    async function triggerConfettiEffect() {
        return new Promise(resolve => {
            const particlesContainer = document.getElementById('particles');
            const burstParticles = 50;

            for (let i = 0; i < burstParticles; i++) {
                const particle = document.createElement('div');
                particle.classList.add('particle', 'burst-particle');

                const size = Math.random() * 20 + 5;
                const color = `hsl(${Math.random() * 60 + 30}, 100%, 50%)`; // amarelos/laranjas

                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.backgroundColor = color;
                particle.style.left = `${Math.random() * 100}%`;
                particle.style.top = `${Math.random() * 100}%`;

                const duration = Math.random() * 2 + 1;
                particle.style.animation = `burstAnimation ${duration}s forwards`;

                particlesContainer.appendChild(particle);

                setTimeout(() => particle.remove(), duration * 1000);
            }

            setTimeout(resolve, 1000);
        });
    }

    // Reseta botão caso conexão falhe
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

// Integração com extensão do navegador, se existir
if (typeof browser !== 'undefined') {
    window.addEventListener('message', (event) => {
        if (event.data.type === 'OPEN_WALLET_CONNECT') {
            browser.runtime.sendMessage({
                action: "openConnectWindow",
                origin: event.data.origin
            });
        }
    });

    browser.runtime.onMessage.addListener(async (msg) => {
        if (msg.action === "walletDataUpdate") {
            try {
                const wallet = await window.sunaryumWallet.connect();
                // handleWalletConnect é interno do setup, expor via window para uso aqui
                window.dispatchEvent(new MessageEvent('message', {
                    data: { type: 'WALLET_CONNECTED', data: wallet }
                }));
            } catch (err) {
                console.error('Erro ao conectar carteira:', err);
                // resetConnectButton é interno do setup, expor via window ou outra forma
                const connectBtn = document.getElementById('connectWalletBtn');
                if (connectBtn) {
                    connectBtn.innerHTML = 'Conectar Carteira <i class="fas fa-plug"></i>';
                    connectBtn.disabled = false;
                }
            }
        }
    });
}

// Inicialização principal após DOM carregar
document.addEventListener('DOMContentLoaded', () => {
    const walletModule = setupWalletConnection();

    document.addEventListener('walletConnected', (e) => {
        console.log('Wallet connected:', e.detail);
    });
});

// Inicializa partículas após carregamento completo da página
window.addEventListener('load', createParticles);
