const urlParams = new URLSearchParams(window.location.search);
const origin = urlParams.get('origin');

document.getElementById('confirmConnect').addEventListener('click', async () => {
  try {
    const walletData = await getWalletData();
    
    // Envia para o BACKGROUND, não diretamente para o runtime
    browser.runtime.sendMessage({
      action: "walletConnected",
      data: {
        ...walletData,
        origin: origin  // Inclui a origem nos dados
      }
    });
    
    window.close();
  } catch (error) {
    console.error('Connection error:', error);
  }
});

async function getWalletData() {
  // Tenta primeiro do localStorage (importação via web)
  const localData = localStorage.getItem('walletData');
  if (localData) return JSON.parse(localData);

  // Se não encontrar, tenta da API de armazenamento da extensão
  const result = await browser.storage.local.get('walletData');
  return result.walletData;
}