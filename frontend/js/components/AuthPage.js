const AuthPage = {
    render: function() {
        const container = document.getElementById('app');
        let isLogin = true;
        
        const renderForm = () => {
            container.innerHTML = `
                <div class="auth-container">
                    <div class="auth-card">
                        <h1 style="text-align:center">🎲 D&D Master's Notebook</h1>
                        <h2>${isLogin ? 'Вход' : 'Регистрация'}</h2>
                        <div id="auth-error" class="error-message" style="display:none"></div>
                        <form id="auth-form">
                            ${!isLogin ? '<input type="text" id="name" placeholder="Имя" required>' : ''}
                            <input type="email" id="email" placeholder="Email" required>
                            <input type="password" id="password" placeholder="Пароль" required>
                            <button type="submit" class="btn btn-primary" style="width:100%">${isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
                        </form>
                        <button id="toggle-auth" style="margin-top:10px; background:none; border:none; color:#667eea; cursor:pointer">
                            ${isLogin ? 'Нет аккаунта? Зарегистрируйтесь' : 'Уже есть аккаунт? Войдите'}
                        </button>
                    </div>
                </div>
            `;
            
            document.getElementById('auth-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const name = !isLogin ? document.getElementById('name').value : '';
                
                let result;
                if (isLogin) {
                    result = await API.login(email, password);
                } else {
                    result = await API.register(email, password, name);
                }
                
                if (result && result.user) {
                    App.state.user = result.user;
                    App.render();
                } else {
                    const errorDiv = document.getElementById('auth-error');
                    errorDiv.textContent = 'Неверный email или пароль';
                    errorDiv.style.display = 'block';
                }
            });
            
            document.getElementById('toggle-auth').addEventListener('click', () => {
                isLogin = !isLogin;
                renderForm();
            });
        };
        
        renderForm();
    }
};