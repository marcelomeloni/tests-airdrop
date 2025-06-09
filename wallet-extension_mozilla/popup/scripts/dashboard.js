document.addEventListener('DOMContentLoaded', () => {
  // UI Elements
  const walletAddressEl = document.getElementById('walletAddress');
  const copyAddressBtn = document.getElementById('copyAddressBtn');
  const balanceAmountEl = document.getElementById('balanceAmount');
  const balanceFiatEl = document.getElementById('balanceFiat');
  const logoutBtn = document.getElementById('logoutBtn');
  const viewAllBtn = document.getElementById('viewAllBtn');
  const navItems = document.querySelectorAll('.nav-item');
  
  // Mock wallet data
  const walletData = {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    balance: 1250.75,
    currency: 'SUN',
    conversionRate: 20
  };
  
  // Helper functions
  function shortenAddress(addr, chars = 4) {
    return `${addr.substring(0, chars + 2)}...${addr.substring(addr.length - chars)}`;
  }
  
  // Update UI with wallet data
  walletAddressEl.textContent = shortenAddress(walletData.address);
  balanceAmountEl.textContent = walletData.balance.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  balanceFiatEl.textContent = `≈ ${(walletData.balance * walletData.conversionRate).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })} KW`;
  
  // Event Listeners
  copyAddressBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(walletData.address)
      .then(() => {
        const originalText = copyAddressBtn.innerHTML;
        copyAddressBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
          copyAddressBtn.innerHTML = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error('Failed to copy address:', err);
        alert('Failed to copy address. Please try again.');
      });
  });
  
  logoutBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to log out?')) {
      alert('Logout successful! Redirecting to login page...');
      setTimeout(() => {
        window.location.href = 'main.html';
      }, 1000);
    }
  });
  
  viewAllBtn.addEventListener('click', () => {
    window.location.href = 'transactions.html';
  });
  
  navItems.forEach(item => {
    item.addEventListener('click', function () {
      const page = this.getAttribute('data-page');
      if (page !== 'dashboard') {
        window.location.href = `${page}.html`;
      }
    });
  });
});