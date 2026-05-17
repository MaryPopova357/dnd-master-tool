const CampaignView = {
    render: async function() {
        const campaign = App.state.currentCampaign;
        const container = document.getElementById('app');
        let activeTab = 'plot';
        let plotNotes = campaign.plot_notes || '';
        let characters = await API.getCharacters(campaign.id);
        let showCharacterForm = false;
        let editingCharacter = null;
        let characterForm = {
            name: '', race: '', class_name: '', level: 1,
            strength: 10, dexterity: 10, constitution: 10,
            intelligence: 10, wisdom: 10, charisma: 10,
            current_hp: 10, max_hp: 10, armor_class: 10, speed: 30, weapon: ''
        };
        
        const savePlot = async () => {
            await API.saveNotes(campaign.id, plotNotes);
            alert('Сюжет сохранён!');
        };
        
        const loadCharacters = async () => {
            characters = await API.getCharacters(campaign.id);
            renderContent();
        };
        
        const saveCharacter = async () => {
            if (editingCharacter) {
                await API.updateCharacter(editingCharacter.id, characterForm);
            } else {
                await API.createCharacter(campaign.id, characterForm);
            }
            showCharacterForm = false;
            editingCharacter = null;
            characterForm = {
                name: '', race: '', class_name: '', level: 1,
                strength: 10, dexterity: 10, constitution: 10,
                intelligence: 10, wisdom: 10, charisma: 10,
                current_hp: 10, max_hp: 10, armor_class: 10, speed: 30, weapon: ''
            };
            await loadCharacters();
        };
        
        const editCharacter = async (id) => {
            const char = await API.getCharacter(id);
            characterForm = char;
            editingCharacter = char;
            showCharacterForm = true;
            renderContent();
        };
        
        const deleteCharacter = async (id) => {
            if (confirm('Удалить персонажа?')) {
                await API.deleteCharacter(id);
                await loadCharacters();
            }
        };
        
        const renderCharacterForm = () => {
            if (!showCharacterForm) return '';
            return `
                <div class="modal">
                    <div class="modal-content">
                        <h3>${editingCharacter ? 'Редактировать персонажа' : 'Новый персонаж'}</h3>
                        <input type="text" id="char-name" placeholder="Имя" value="${characterForm.name || ''}">
                        <input type="text" id="char-race" placeholder="Раса" value="${characterForm.race || ''}">
                        <input type="text" id="char-class" placeholder="Класс" value="${characterForm.class_name || ''}">
                        <input type="number" id="char-level" placeholder="Уровень" value="${characterForm.level || 1}">
                        <h4>Характеристики</h4>
                        <div class="stats-grid">
                            <div>Сила: <input type="number" id="char-strength" value="${characterForm.strength || 10}"></div>
                            <div>Ловкость: <input type="number" id="char-dexterity" value="${characterForm.dexterity || 10}"></div>
                            <div>Телосложение: <input type="number" id="char-constitution" value="${characterForm.constitution || 10}"></div>
                            <div>Интеллект: <input type="number" id="char-intelligence" value="${characterForm.intelligence || 10}"></div>
                            <div>Мудрость: <input type="number" id="char-wisdom" value="${characterForm.wisdom || 10}"></div>
                            <div>Харизма: <input type="number" id="char-charisma" value="${characterForm.charisma || 10}"></div>
                        </div>
                        <h4>Боевые параметры</h4>
                        <div class="stats-grid">
                            <div>Текущие Хиты: <input type="number" id="char-current-hp" value="${characterForm.current_hp || 10}"></div>
                            <div>Макс. Хиты: <input type="number" id="char-max-hp" value="${characterForm.max_hp || 10}"></div>
                            <div>Класс Брони: <input type="number" id="char-ac" value="${characterForm.armor_class || 10}"></div>
                            <div>Скорость: <input type="number" id="char-speed" value="${characterForm.speed || 30}"></div>
                        </div>
                        <input type="text" id="char-weapon" placeholder="Оружие" value="${characterForm.weapon || ''}">
                        <div style="display:flex; gap:10px; margin-top:20px">
                            <button id="save-char-btn" class="btn btn-success">Сохранить</button>
                            <button id="cancel-char-btn" class="btn btn-secondary">Отмена</button>
                        </div>
                    </div>
                </div>
            `;
        };
        
        const renderContent = () => {
            const plotSection = `
                <div>
                    <textarea id="plot-text" rows="20" style="width:100%; padding:15px; font-size:16px; border:1px solid #ddd; border-radius:5px">${plotNotes || ''}</textarea>
                    <button id="save-plot-btn" class="btn btn-success">💾 Сохранить сюжет</button>
                </div>
            `;
            
            const charactersSection = `
                <div>
                    <button id="add-character-btn" class="btn btn-primary">+ Добавить персонажа</button>
                    <div id="characters-list" style="margin-top:20px">
                        ${characters.map(c => `
                            <div class="character-card">
                                <h3>${c.name}</h3>
                                <p>${c.race} ${c.class_name}, уровень ${c.level}</p>
                                <div style="display:flex; gap:10px; margin-top:15px">
                                    <button data-id="${c.id}" class="edit-char-btn btn btn-primary" style="flex:1">✏️ Редактировать</button>
                                    <button data-id="${c.id}" class="delete-char-btn btn btn-danger" style="flex:1">🗑️ Удалить</button>
                                </div>
                            </div>
                        `).join('')}
                        ${characters.length === 0 ? '<div class="empty-state">Пока нет персонажей. Нажмите "+ Добавить персонажа"</div>' : ''}
                    </div>
                </div>
            `;
            
            container.innerHTML = `
                <div>
                    <div class="header">
                        <button id="back-btn" class="btn" style="background:rgba(255,255,255,0.2)">← Назад</button>
                        <h1>${campaign.title}</h1>
                    </div>
                    <div class="tabs">
                        <button id="plot-tab" class="tab ${activeTab === 'plot' ? 'active' : ''}">📖 Сюжет</button>
                        <button id="characters-tab" class="tab ${activeTab === 'characters' ? 'active' : ''}">👥 Персонажи</button>
                    </div>
                    <div class="container">
                        ${activeTab === 'plot' ? plotSection : charactersSection}
                    </div>
                    ${renderCharacterForm()}
                </div>
            `;
            
            document.getElementById('back-btn').onclick = () => {
                App.state.currentCampaign = null;
                App.render();
            };
            
            if (activeTab === 'plot') {
                const textarea = document.getElementById('plot-text');
                if (textarea) {
                    textarea.addEventListener('input', (e) => plotNotes = e.target.value);
                }
                const saveBtn = document.getElementById('save-plot-btn');
                if (saveBtn) saveBtn.onclick = savePlot;
            } else {
                const addBtn = document.getElementById('add-character-btn');
                if (addBtn) {
                    addBtn.onclick = () => {
                        showCharacterForm = true;
                        editingCharacter = null;
                        characterForm = {
                            name: '', race: '', class_name: '', level: 1,
                            strength: 10, dexterity: 10, constitution: 10,
                            intelligence: 10, wisdom: 10, charisma: 10,
                            current_hp: 10, max_hp: 10, armor_class: 10, speed: 30, weapon: ''
                        };
                        renderContent();
                    };
                }
                
                document.querySelectorAll('.edit-char-btn').forEach(btn => {
                    btn.onclick = () => editCharacter(parseInt(btn.dataset.id));
                });
                
                document.querySelectorAll('.delete-char-btn').forEach(btn => {
                    btn.onclick = () => deleteCharacter(parseInt(btn.dataset.id));
                });
            }
            
            const saveCharBtn = document.getElementById('save-char-btn');
            if (saveCharBtn) {
                saveCharBtn.onclick = () => {
                    const newForm = {
                        name: document.getElementById('char-name')?.value || '',
                        race: document.getElementById('char-race')?.value || '',
                        class_name: document.getElementById('char-class')?.value || '',
                        level: parseInt(document.getElementById('char-level')?.value) || 1,
                        strength: parseInt(document.getElementById('char-strength')?.value) || 10,
                        dexterity: parseInt(document.getElementById('char-dexterity')?.value) || 10,
                        constitution: parseInt(document.getElementById('char-constitution')?.value) || 10,
                        intelligence: parseInt(document.getElementById('char-intelligence')?.value) || 10,
                        wisdom: parseInt(document.getElementById('char-wisdom')?.value) || 10,
                        charisma: parseInt(document.getElementById('char-charisma')?.value) || 10,
                        current_hp: parseInt(document.getElementById('char-current-hp')?.value) || 10,
                        max_hp: parseInt(document.getElementById('char-max-hp')?.value) || 10,
                        armor_class: parseInt(document.getElementById('char-ac')?.value) || 10,
                        speed: parseInt(document.getElementById('char-speed')?.value) || 30,
                        weapon: document.getElementById('char-weapon')?.value || ''
                    };
                    characterForm = newForm;
                    saveCharacter();
                };
            }
            
            const cancelCharBtn = document.getElementById('cancel-char-btn');
            if (cancelCharBtn) {
                cancelCharBtn.onclick = () => {
                    showCharacterForm = false;
                    renderContent();
                };
            }
        };
        
        const init = () => {
            container.innerHTML = '<div style="text-align:center; padding:50px">Загрузка...</div>';
            renderContent();
        };
        
        init();
    }
};