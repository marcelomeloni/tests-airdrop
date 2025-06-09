browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "openConnectWindow") {
    browser.windows.create({
      url: browser.runtime.getURL("popup/connect.html"),
      type: "popup",
      width: 400,
      height: 600
    });
  }

  if (request.action === "walletConnected") {
    // Armazena localmente
    browser.storage.local.set({walletData: request.data});
    
    // Envia apenas para tabs com origem correspondente
    browser.tabs.query({url: `${request.origin}/*`}).then(tabs => {
      tabs.forEach(tab => {
        try {
          browser.tabs.sendMessage(tab.id, {
            action: "walletDataUpdate",
            data: request.data
          }).catch(err => console.debug("Tab não ouvindo:", tab.url));
        } catch (e) {
          console.debug("Erro ao enviar para tab:", e);
        }
      });
    });
  }
});