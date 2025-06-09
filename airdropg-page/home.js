      // Função para criar partículas
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
            
            currentWallet = data;
            
            // Salva os dados da carteira no localStorage para uso na dashboard
            localStorage.setItem('sunaryumWalletData', JSON.stringify(data));
            
            // Atualiza UI com endereço conectado
            const shortAddress = `${data.address.slice(0, 6)}...${data.address.slice(-4)}`;
            if (walletAddress) {
                walletAddress.textContent = shortAddress;
                walletAddress.style.display = 'block';
            }
            
            // Efeito visual de confirmação
            await triggerConfettiEffect();
            
            // Atualiza botão para dashboard
            if (connectBtn) {
                // Remove todos os listeners antigos
                const newBtn = connectBtn.cloneNode(true);
                connectBtn.replaceWith(newBtn);
                
                // Configura o novo botão
                newBtn.innerHTML = '<i class="fas fa-rocket"></i> Ir para o Dashboard';
                newBtn.disabled = false;
                
                // Adiciona o evento de redirecionamento
                newBtn.addEventListener('click', () => {
                    // Salva os dados novamente antes de redirecionar (redundância para garantir)
                    localStorage.setItem('sunaryumWalletData', JSON.stringify(currentWallet));
                    
                    // Redireciona para a dashboard
                    window.location.href = 'dashboard.html';
                });
            }
    
            // Dispara evento customizado
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