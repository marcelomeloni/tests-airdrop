browser.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "openConnectWindow") {
    // Armazena a origem para uso posterior
    const origin = sender.origin || sender.url;
    
    browser.windows.create({
      url: browser.runtime.getURL(`popup/connect.html?origin=${encodeURIComponent(origin)}`),
      type: "popup",
      width: 400,
      height: 600
    }).then(window => {
      // Armazena a origem associada à janela
      browser.storage.local.set({[`windowOrigin_${window.id}`]: origin});
    });
  }
  
  if (request.action === "walletConnected") {
    browser.storage.local.get([`windowOrigin_${sender.tab.windowId}`]).then(result => {
      const origin = result[`windowOrigin_${sender.tab.windowId}`];
      
      if (!origin) {
        console.error("Origin not found for window:", sender.tab.windowId);
        return;
      }

      // Encontra TODAS as tabs com a origem (incluindo localhost)
      browser.tabs.query({}).then(tabs => {
        tabs.forEach(tab => {
          try {
            const tabOrigin = new URL(tab.url).origin;
            if (tabOrigin === origin) {
              browser.tabs.sendMessage(tab.id, {
                action: "walletDataUpdate",
                data: request.data
              }).catch(err => console.debug("Tab não ouvindo:", tab.url));
            }
          } catch(e) {
            console.debug("URL inválida:", tab.url);
          }
        });
      });
    });
  }
});