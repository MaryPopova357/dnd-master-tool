const CampaignsPage = {
    render: async function() {
        const container = document.getElementById('app');
        const campaigns = await API.getCampaigns();
        
        const showCreateModal = () => {
            const modal = document.createElement('div');
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>Создать кампанию</h3>
                    <input type="text" id="campaign-title" placeholder="Название кампании">
                    <button id="create-btn" class="btn btn-success">Создать</button>
                    <button id="cancel-btn" class="btn btn-secondary">Отмена</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            document.getElementById('create-btn').onclick = async () => {
                const title = document.getElementById('campaign-title').value;
                if (title.trim()) {
                    await API.createCampaign(title);
                    modal.remove();
                    CampaignsPage.render();
                }
            };
            document.getElementById('cancel-btn').onclick = () => modal.remove();
        };
        
        container.innerHTML = `
            <div>
                <div class="header">
                    <h1>🎲 D&D Master's Notebook</h1>
                    <div>
                        <span style="margin-right:15px">Привет, ${App.state.user ? App.state.user.name : ''}!</span>
                        <button id="logout-btn" class="btn" style="background:rgba(255,255,255,0.2)">Выйти</button>
                    </div>
                </div>
                <div class="container">
                    <button id="new-campaign-btn" class="btn btn-primary">+ Новая кампания</button>
                    <div id="campaigns-list" class="cards-grid"></div>
                </div>
            </div>
        `;
        
        const listContainer = document.getElementById('campaigns-list');
        if (campaigns.length === 0) {
            listContainer.innerHTML = '<div class="empty-state">У вас пока нет кампаний. Нажмите "+ Новая кампания" чтобы начать!</div>';
        } else {
            listContainer.innerHTML = campaigns.map(c => `
                <div class="card">
                    <h3>${c.title}</h3>
                    <p style="color:#999; font-size:12px; margin:10px 0">${formatDate(c.created_at)}</p>
                    <div style="display:flex; gap:10px">
                        <button data-id="${c.id}" class="open-campaign-btn btn btn-primary" style="flex:1">Открыть</button>
                        <button data-id="${c.id}" class="delete-campaign-btn btn btn-danger">🗑️</button>
                    </div>
                </div>
            `).join('');
            
            document.querySelectorAll('.open-campaign-btn').forEach(btn => {
                btn.onclick = async () => {
                    const id = parseInt(btn.dataset.id);
                    const campaign = await API.getCampaign(id);
                    App.state.currentCampaign = campaign;
                    CampaignView.render();
                };
            });
            
            document.querySelectorAll('.delete-campaign-btn').forEach(btn => {
                btn.onclick = async () => {
                    if (confirm('Удалить кампанию? Все данные будут потеряны!')) {
                        const id = parseInt(btn.dataset.id);
                        await API.deleteCampaign(id);
                        CampaignsPage.render();
                    }
                };
            });
        }
        
        document.getElementById('new-campaign-btn').onclick = showCreateModal;
        document.getElementById('logout-btn').onclick = () => {
            API.setToken(null);
            App.state.user = null;
            App.render();
        };
    }
};