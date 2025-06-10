// Comunicação: recebe clique da página
console.log("[Sunaryum] Script injetado com sucesso!"); 
window.addEventListener('message', (event) => {
  if (event.data.type === 'OPEN_WALLET_CONNECT') {
      browser.runtime.sendMessage({ action: "openConnectWindow" });
  }
});

browser.runtime.onMessage.addListener((msg) => {
  if (msg.action === "walletDataUpdate") {
    // Envia apenas para a PRÓPRIA página
    window.postMessage({
      type: 'WALLET_CONNECTED',
      data: msg.data
    }, window.location.origin); // Origem específica
  }
});