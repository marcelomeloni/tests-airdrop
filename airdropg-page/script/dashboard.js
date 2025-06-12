  // Inicialização do Supabase
  
  const supabaseUrl = 'https://fhamhyolyolsirfxxhan.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZoYW1oeW9seW9sc2lyZnh4aGFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk1NjAyMjIsImV4cCI6MjA2NTEzNjIyMn0.iQIDCKWVZpKlmbKXG60J-nUd5lK-S5Nw5GvDSqE_w1Y';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  
  // Estado do usuário
  let currentUser = null;
  let currentSession = null;

  // Elementos DOM
  const elements = {
      walletAddress: document.getElementById('wallet-address'),
      username: document.getElementById('username'),
      greetingUsername: document.getElementById('greeting-username'),
      sunBalance: document.getElementById('sun-balance'),
      totalSun: document.getElementById('total-sun'),
      totalPoints: document.getElementById('total-points'),
      totalMissions: document.getElementById('total-missions'),
      dailyMissions: document.getElementById('daily-missions'),
      weeklyMissions: document.getElementById('weekly-missions'),
      achievementsContainer: document.getElementById('achievements-container'),
      airdropsContainer: document.getElementById('airdrops-container'),
      rankingBody: document.getElementById('ranking-body')
  };

  // Funções para manipulação do DOM quando a página carrega
  document.addEventListener('DOMContentLoaded', async function() {
      // Inicialização do dashboard
      await initAuth();
      
      // Carregar dados do usuário
      await fetchUserData();
      
      // Carregar missões
      await fetchMissions();
      
      // Carregar conquistas
      await fetchAchievements();
      
      // Carregar airdrops
      await fetchAirdrops();
      
      // Carregar ranking
      await fetchRanking();
      
      // Configurar abas
      setupTabs();
      
      // Configurar menu dropdown do usuário
      setupUserDropdown();
      
      // Configurar o botão de edição de username
      setupUsernameEdit();
      
      // Configurar eventos de missões
      setupMissionEvents();
      
      // Configurar evento de streak
      document.getElementById('claim-streak').addEventListener('click', claimStreakReward);
  });

  // Inicializar autenticação Supabase
  async function initAuth() {
    const walletAddress = localStorage.getItem('sunaryumWalletAddress');
    const userId = localStorage.getItem('sunaryumUserId');
    
    if (!walletAddress) {
        // Redirecionar para login se não autenticado
        window.location.href = 'home.html';
        return;
    }
    
    currentSession = { 
        user: { 
            id: userId,
            walletAddress: walletAddress
        } 
    };
    
    await fetchUserData();
}

// Modifique a função fetchUserData para usar o walletAddress
async function fetchUserData() {
    if (!currentSession) return;
    
    const { data: user, error } = await supabaseClient
        .from('users')
        .select('*')
        .eq('wallet_address', currentSession.user.walletAddress)
        .single();
    
    if (error) {
        showToast('Erro ao carregar dados do usuário: ' + error.message, 'error');
        return;
    }
    
    currentUser = user;
      
      // Atualizar UI com dados do usuário
      elements.walletAddress.textContent = user.wallet_address;
      elements.username.textContent = user.username || 'Explorador';
      elements.greetingUsername.textContent = user.username || 'Explorador';
      elements.sunBalance.textContent = user.sun_balance.toFixed(2) + ' SUN';
      elements.totalSun.textContent = user.sun_balance.toFixed(2) + ' SUN';
      elements.totalPoints.textContent = user.total_points + ' pontos';
      elements.totalMissions.textContent = user.total_missions_completed + ' concluídas';
  }

  // Buscar missões
  async function fetchMissions() {
      const { data: missions, error } = await supabaseClient
          .from('missions')
          .select('*')
          .eq('is_active', true);
      
      if (error) {
          showToast('Erro ao carregar missões: ' + error.message, 'error');
          return;
      }
      
      // Filtrar missões diárias
      const dailyMissions = missions.filter(m => m.mission_type === 'daily');
      renderMissions(dailyMissions, elements.dailyMissions);
      
      // Filtrar missões semanais
      const weeklyMissions = missions.filter(m => m.mission_type === 'weekly');
      renderMissions(weeklyMissions, elements.weeklyMissions);
  }

  // Renderizar missões
  function renderMissions(missions, container) {
      container.innerHTML = '';
      
      missions.forEach(mission => {
          const missionElement = document.createElement('div');
          missionElement.className = 'border border-slate-200 rounded-xl p-4 bg-white';
          missionElement.innerHTML = `
              <div class="flex items-start">
                  <div class="w-12 h-12 rounded-lg bg-${mission.mission_type === 'daily' ? 'amber' : 'blue'}-100 flex items-center justify-center mr-4">
                      <i class="${mission.mission_type === 'daily' ? 'fas fa-sun' : 'fas fa-calendar'} text-${mission.mission_type === 'daily' ? 'amber' : 'blue'}-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                      <h3 class="font-bold text-slate-800 text-lg mb-1">${mission.name}</h3>
                      <p class="text-slate-600 text-sm mb-3">${mission.description}</p>
                      <div class="flex justify-between items-center">
                          <div class="flex items-center">
                              <i class="fas fa-coins text-amber-500 mr-1"></i>
                              <span class="font-medium text-slate-700">+${mission.sun_reward} SUN</span>
                              <span class="mx-2 text-slate-300">•</span>
                              <i class="fas fa-star text-blue-500 mr-1"></i>
                              <span class="font-medium text-slate-700">+${mission.points_reward} pontos</span>
                          </div>
                          <button data-mission-id="${mission.id}" class="mission-btn bg-gradient-to-r from-${mission.mission_type === 'daily' ? 'amber' : 'blue'}-500 to-${mission.mission_type === 'daily' ? 'amber' : 'blue'}-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition">
                              Iniciar
                          </button>
                      </div>
                  </div>
              </div>
          `;
          container.appendChild(missionElement);
      });
  }

  // Buscar conquistas
  async function fetchAchievements() {
      const { data: achievements, error } = await supabaseClient
          .from('achievements')
          .select('*')
          .eq('is_active', true);
      
      if (error) {
          showToast('Erro ao carregar conquistas: ' + error.message, 'error');
          return;
      }
      
      renderAchievements(achievements);
  }

  // Renderizar conquistas
  function renderAchievements(achievements) {
      elements.achievementsContainer.innerHTML = '';
      
      achievements.forEach(achievement => {
          const progress = Math.min(Math.floor(Math.random() * 100), 100); // Simular progresso
          
          const achievementElement = document.createElement('div');
          achievementElement.className = 'border border-slate-200 rounded-xl p-5 bg-white';
          achievementElement.innerHTML = `
              <div class="flex items-start mb-4">
                  <div class="w-14 h-14 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center mr-4">
                      <i class="fas fa-trophy text-white text-xl"></i>
                  </div>
                  <div class="flex-1">
                      <h3 class="font-bold text-slate-800 text-lg">${achievement.name}</h3>
                      <p class="text-slate-600 text-sm mt-1 mb-3">${achievement.description}</p>
                      
                      <div class="mb-2">
                          <div class="flex justify-between text-sm text-slate-600 mb-1">
                              <span>Progresso</span>
                              <span>${progress}%</span>
                          </div>
                          <div class="progress-bar">
                              <div class="progress-fill" style="width: ${progress}%"></div>
                          </div>
                      </div>
                      
                      <div class="flex justify-between items-center mt-4">
                          <div class="flex items-center">
                              <i class="fas fa-coins text-amber-500 mr-1"></i>
                              <span class="font-medium">${achievement.sun_reward} SUN</span>
                          </div>
                          ${progress === 100 ? `
                              <button class="claim-btn bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                                  Reivindicar
                              </button>
                          ` : `
                              <span class="text-slate-500 text-sm">Continue progredindo</span>
                          `}
                      </div>
                  </div>
              </div>
          `;
          elements.achievementsContainer.appendChild(achievementElement);
      });
  }

  // Buscar airdrops
  async function fetchAirdrops() {
      if (!currentUser) return;
      
      const { data: airdrops, error } = await supabaseClient
          .from('airdrops')
          .select('*')
          .eq('user_id', currentUser.id);
      
      if (error) {
          showToast('Erro ao carregar airdrops: ' + error.message, 'error');
          return;
      }
      
      renderAirdrops(airdrops);
  }

  // Renderizar airdrops
  function renderAirdrops(airdrops) {
      elements.airdropsContainer.innerHTML = '';
      
      if (airdrops.length === 0) {
          elements.airdropsContainer.innerHTML = `
              <div class="text-center py-12">
                  <div class="w-16 h-16 mx-auto bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-4">
                      <i class="fas fa-gift text-blue-500 text-2xl"></i>
                  </div>
                  <h3 class="text-lg font-medium text-slate-800 mb-2">Nenhum airdrop disponível</h3>
                  <p class="text-slate-600 max-w-md mx-auto">
                      Complete missões e conquistas para receber airdrops de SUN coins!
                  </p>
              </div>
          `;
          return;
      }
      
      airdrops.forEach(airdrop => {
          const airdropElement = document.createElement('div');
          airdropElement.className = 'border border-slate-200 rounded-xl p-4 mb-4 bg-white';
          airdropElement.innerHTML = `
              <div class="flex items-center">
                  <div class="w-12 h-12 rounded-lg bg-gradient-to-r from-amber-100 to-yellow-100 flex items-center justify-center mr-4">
                      <i class="fas fa-coins text-amber-600 text-lg"></i>
                  </div>
                  <div class="flex-1">
                      <div class="flex justify-between items-center mb-1">
                          <h3 class="font-bold text-slate-800">${airdrop.amount} SUN</h3>
                          <span class="px-2 py-1 rounded-full text-xs font-medium ${airdrop.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}">
                              ${airdrop.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                          </span>
                      </div>
                      <p class="text-slate-600 text-sm">
                          ${airdrop.mission_id ? 'Recompensa de missão' : 'Conquista alcançada'}
                      </p>
                  </div>
              </div>
          `;
          elements.airdropsContainer.appendChild(airdropElement);
      });
  }

  // Buscar ranking
  async function fetchRanking() {
      const { data: users, error } = await supabaseClient
          .from('users')
          .select('id, username, wallet_address, total_points, sun_balance')
          .order('total_points', { ascending: false })
          .limit(10);
      
      if (error) {
          showToast('Erro ao carregar ranking: ' + error.message, 'error');
          return;
      }
      
      renderRanking(users);
  }

  // Renderizar ranking
  function renderRanking(users) {
      elements.rankingBody.innerHTML = '';
      
      users.forEach((user, index) => {
          const positionClass = index === 0 ? 
              'from-amber-400 to-orange-500' : 
              index === 1 ? 
              'from-slate-400 to-slate-600' : 
              index === 2 ? 
              'from-amber-700 to-amber-900' : 
              'bg-slate-100 text-slate-800';
          
          const row = document.createElement('tr');
          row.className = 'border-b border-slate-100 hover:bg-slate-50';
          row.innerHTML = `
              <td class="py-4 px-4">
                  ${index < 3 ? `
                      <div class="w-8 h-8 rounded-full bg-gradient-to-r ${positionClass} flex items-center justify-center text-white font-bold">
                          ${index + 1}
                      </div>
                  ` : index + 1}
              </td>
              <td class="py-4 px-4">
                  <div class="flex items-center">
                      <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white mr-3">
                          <i class="fas fa-user"></i>
                      </div>
                      <span class="font-medium">${user.username || user.wallet_address.slice(0, 8)}</span>
                  </div>
              </td>
              <td class="py-4 px-4 font-medium text-blue-600">${user.total_points}</td>
              <td class="py-4 px-4 font-medium text-amber-600">${user.sun_balance.toFixed(2)} SUN</td>
          `;
          elements.rankingBody.appendChild(row);
      });
  }

  // Configurar abas
  function setupTabs() {
      const tabButtons = document.querySelectorAll('[data-tab]');
      const tabPanels = document.querySelectorAll('.tab-panel');
      
      tabButtons.forEach(button => {
          button.addEventListener('click', () => {
              const tabId = button.getAttribute('data-tab');
              
              // Atualizar botões ativos
              tabButtons.forEach(btn => {
                  if (btn === button) {
                      btn.classList.add('tab-active');
                  } else {
                      btn.classList.remove('tab-active');
                  }
              });
              
              // Mostrar painel ativo
              tabPanels.forEach(panel => {
                  if (panel.id === `${tabId}-tab`) {
                      panel.classList.remove('hidden');
                      panel.classList.add('active');
                  } else {
                      panel.classList.add('hidden');
                      panel.classList.remove('active');
                  }
              });
          });
      });
  }

  // Configurar menu dropdown do usuário
  function setupUserDropdown() {
      const userMenuButton = document.getElementById('user-menu-button');
      const userDropdown = document.getElementById('user-dropdown');
      
      userMenuButton.addEventListener('click', function() {
          const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
          userMenuButton.setAttribute('aria-expanded', !isExpanded);
          userDropdown.classList.toggle('hidden');
      });
      
      // Fechar o dropdown ao clicar fora
      document.addEventListener('click', function(event) {
          if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
              userMenuButton.setAttribute('aria-expanded', 'false');
              userDropdown.classList.add('hidden');
          }
      });
  }

  // Configurar edição de nome de usuário
  function setupUsernameEdit() {
    const editButton = document.getElementById('edit-username');
    const usernameSpan = document.getElementById('username');
    
    editButton.addEventListener('click', function() {
        const currentUsername = usernameSpan.textContent;
        
        // Criar container para os elementos de edição
        const editContainer = document.createElement('div');
        editContainer.className = 'flex items-center gap-2';
        
        // Criar input para edição
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentUsername;
        input.className = 'border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 font-medium w-full max-w-[180px]';
        input.maxLength = 20; // Limite de caracteres
        
        // Criar botão de salvar
        const saveButton = document.createElement('button');
        saveButton.className = 'bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-600 transition';
        saveButton.innerHTML = '<i class="fas fa-check"></i>';
        
        // Criar botão de cancelar
        const cancelButton = document.createElement('button');
        cancelButton.className = 'bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-300 transition';
        cancelButton.innerHTML = '<i class="fas fa-times"></i>';
        
        // Adicionar eventos
        saveButton.addEventListener('click', async function() {
            if (input.value.trim() === '') {
                showToast('O nome de usuário não pode estar vazio', 'error');
                return;
            }
            await saveUsername(input.value.trim());
            editContainer.replaceWith(usernameSpan);
            editButton.style.display = 'inline-block';
        });
        
        cancelButton.addEventListener('click', function() {
            editContainer.replaceWith(usernameSpan);
            editButton.style.display = 'inline-block';
        });
        
        // Adicionar elementos ao container
        editContainer.appendChild(input);
        editContainer.appendChild(saveButton);
        editContainer.appendChild(cancelButton);
        
        // Substituir o span pelo container de edição
        usernameSpan.replaceWith(editContainer);
        editButton.style.display = 'none';
        input.focus();
    });
}

async function saveUsername(newUsername) {
    if (!currentUser) {
        showToast('Usuário não identificado', 'error');
        return;
    }
    
    try {
        // Verificar se o username já existe
        const { data: existingUser, error: checkError } = await supabaseClient
            .from('users')
            .select('id')
            .eq('username', newUsername)
            .neq('id', currentUser.id)
            .maybeSingle();
        
        if (checkError) throw checkError;
        
        if (existingUser) {
            showToast('Este nome de usuário já está em uso', 'error');
            return;
        }
        
        // Atualizar APENAS o username no banco de dados
        const { error } = await supabaseClient
            .from('users')
            .update({ 
                username: newUsername  // Removido o updated_at
            })
            .eq('id', currentUser.id);
        
        if (error) throw error;
        
        // Atualizar localmente
        currentUser.username = newUsername;
        document.getElementById('username').textContent = newUsername;
        
        // Atualizar em outros lugares da UI se necessário
        const greetingElements = document.querySelectorAll('.greeting-username');
        greetingElements.forEach(el => {
            el.textContent = newUsername;
        });
        
        showToast('Nome de usuário atualizado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao atualizar username:', error);
        showToast('Erro ao atualizar nome: ' + error.message, 'error');
    }
}

  // Configurar eventos de missões
  function setupMissionEvents() {
      document.addEventListener('click', async function(e) {
          if (e.target.classList.contains('mission-btn')) {
              const missionId = e.target.getAttribute('data-mission-id');
              await completeMission(missionId);
          }
      });
  }

  // Completar missão
  async function completeMission(missionId) {
      if (!currentUser) return;
      
      try {
          // Registrar missão concluída
          const { data: completedMission, error: missionError } = await supabaseClient
              .from('completed_missions')
              .insert([
                  { 
                      user_id: currentUser.id, 
                      mission_id: missionId,
                      reward_claimed: true
                  }
              ]);
          
          if (missionError) throw missionError;
          
          // Atualizar dados do usuário
          const mission = await supabaseClient
              .from('missions')
              .select('sun_reward, points_reward')
              .eq('id', missionId)
              .single();
          
          if (mission.error) throw mission.error;
          
          const { error: userError } = await supabaseClient
              .from('users')
              .update({
                  sun_balance: currentUser.sun_balance + mission.data.sun_reward,
                  total_points: currentUser.total_points + mission.data.points_reward,
                  total_missions_completed: currentUser.total_missions_completed + 1
              })
              .eq('id', currentUser.id);
          
          if (userError) throw userError;
          
          // Atualizar UI
          await fetchUserData();
          showToast(`Missão concluída! +${mission.data.sun_reward} SUN`, 'success');
          
          // Atualizar botão
          const button = document.querySelector(`[data-mission-id="${missionId}"]`);
          button.textContent = 'Concluído';
          button.disabled = true;
          button.classList.remove('hover:shadow-md', 'from-amber-500', 'to-amber-600', 'from-blue-500', 'to-blue-600');
          button.classList.add('bg-slate-200', 'text-slate-500', 'cursor-not-allowed');
          
      } catch (error) {
          showToast('Erro ao completar missão: ' + error.message, 'error');
      }
  }

  // Reivindicar recompensa de streak
  async function claimStreakReward() {
      if (!currentUser) return;
      
      try {
          // Simular reivindicação de streak
          const reward = 50; // Valor fixo para exemplo
          
          // Atualizar saldo do usuário
          const { error: userError } = await supabaseClient
              .from('users')
              .update({
                  total_points: currentUser.total_points + reward
              })
              .eq('id', currentUser.id);
          
          if (userError) throw userError;
          
          // Criar registro de airdrop
          const { error: airdropError } = await supabaseClient
              .from('airdrops')
              .insert([
                  { 
                      user_id: currentUser.id, 
                      amount: reward,
                      status: 'confirmed'
                  }
              ]);
          
          if (airdropError) throw airdropError;
          
          // Atualizar UI
          await fetchUserData();
          await fetchAirdrops();
          
          const button = document.getElementById('claim-streak');
          button.innerHTML = '<i class="fas fa-check mr-2"></i> Reivindicado';
          button.disabled = true;
          button.classList.remove('hover:from-amber-600', 'hover:to-orange-700', 'hover:shadow-xl', 'hover:-translate-y-0.5');
          button.classList.add('bg-gradient-to-r', 'from-green-500', 'to-green-700', 'cursor-not-allowed');
          
          showToast(`Recompensa de streak reivindicada! +${reward} SUN`, 'success');
          
      } catch (error) {
          showToast('Erro ao reivindicar streak: ' + error.message, 'error');
      }
  }

  // Função para logout
  function handleLogout() {
    localStorage.removeItem('sunaryumWalletAddress');
    localStorage.removeItem('sunaryumUserId');
    window.location.href = 'home.html';
}

  // Função para exibir toasts de notificação
  function showToast(message, type) {
      const toast = document.getElementById('toast');
      toast.textContent = message;
      toast.className = `toast show ${type}`;
      
      // Ocultar o toast após 3 segundos
      setTimeout(() => {
          toast.classList.remove('show');
      }, 3000);
  }