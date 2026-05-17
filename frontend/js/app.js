const App = {
    state: {
        user: null,
        currentCampaign: null
    },
    
    render: function() {
        if (!this.state.user) {
            AuthPage.render();
        } else if (this.state.currentCampaign) {
            CampaignView.render();
        } else {
            CampaignsPage.render();
        }
    }
};

// Проверяем сохранённую сессию
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
        API.token = token;
        App.state.user = JSON.parse(savedUser);
    }
    App.render();
});