import { getWalletData, logout } from './auth.js';

// dashboard.js
// Inicialização do dashboard: usar dados reais da wallet e lógica centralizada de autenticação

document.addEventListener('DOMContentLoaded', () => {
  // Checar autenticação
  const walletData = getWalletData();
  if (!walletData) {
    // Redireciona para login se não autenticado
    logout();
    return;
  }

  // UI Elements
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const balanceAmountEl = document.getElementById('balanceAmount');
  const balanceFiatEl = document.getElementById('balanceFiat');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const navItems = document.querySelectorAll('.nav-item');

  // Função utilitária para encurtar endereço
  function shortenAddress(addr, chars = 4) {
    return `${addr.substring(0, chars + 2)}...${addr.substring(addr.length - chars)}`;
  }

  // Atualiza UI com dados da wallet real
  walletAddressEl.textContent = shortenAddress(walletData.address);
  if (balanceAmountEl) {
    balanceAmountEl.textContent = Number(walletData.balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  if (balanceFiatEl) {
    const rate = walletData.conversionRate || 1;
    const balance = Number(walletData.balance || 0) * rate;
    balanceFiatEl.textContent = `≈ ${balance.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} KW`;
  }

  // Event Listeners
  if (copyAddressBtn) {
    copyAddressBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(walletData.address)
        .then(() => {
          const originalHtml = copyAddressBtn.innerHTML;
          copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
          setTimeout(() => {
            copyAddressBtn.innerHTML = originalHtml;
          }, 2000);
        })
        .catch((err) => {
          console.error('Failed to copy address:', err);
          alert('Failed to copy address. Please try again.');
        });
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Tem certeza que deseja sair?')) {
        // Limpa e redireciona
        logout();
      }
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      window.location.href = 'transactions.html';
    });
  }

  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const page = this.getAttribute('data-page');
      if (page && page !== 'dashboard') {
        window.location.href = `${page}.html`;
      }
    });
  });
});
