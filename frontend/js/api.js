const API = {
    baseURL: 'http://localhost:5000',
    token: localStorage.getItem('token'),

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    },

    async request(endpoint, options = {}) {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };
        
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        
        const response = await fetch(this.baseURL + endpoint, {
            ...options,
            headers
        });
        
        if (response.status === 401) {
            this.setToken(null);
            return null;
        }
        
        return response;
    },

    async register(email, password, name) {
        const response = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, name })
        });
        if (response && response.ok) {
            const data = await response.json();
            this.setToken(data.token);
            return data;
        }
        return null;
    },

    async login(email, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (response && response.ok) {
            const data = await response.json();
            this.setToken(data.token);
            return data;
        }
        return null;
    },

    async getCampaigns() {
        const response = await this.request('/campaigns');
        if (response && response.ok) {
            return await response.json();
        }
        return [];
    },

    async createCampaign(title) {
        const response = await this.request('/campaigns', {
            method: 'POST',
            body: JSON.stringify({ title })
        });
        if (response && response.ok) {
            return await response.json();
        }
        return null;
    },

    async deleteCampaign(id) {
        const response = await this.request(`/campaigns/${id}`, {
            method: 'DELETE'
        });
        return response && response.ok;
    },

    async getCampaign(id) {
        const response = await this.request(`/campaigns/${id}`);
        if (response && response.ok) {
            return await response.json();
        }
        return null;
    },

    async saveNotes(id, notes) {
        const response = await this.request(`/campaigns/${id}/notes`, {
            method: 'POST',
            body: JSON.stringify({ notes })
        });
        return response && response.ok;
    },

    async getCharacters(campaignId) {
        const response = await this.request(`/campaigns/${campaignId}/characters`);
        if (response && response.ok) {
            return await response.json();
        }
        return [];
    },

    async createCharacter(campaignId, character) {
        const response = await this.request(`/campaigns/${campaignId}/characters`, {
            method: 'POST',
            body: JSON.stringify(character)
        });
        return response && response.ok;
    },

    async getCharacter(id) {
        const response = await this.request(`/characters/${id}`);
        if (response && response.ok) {
            return await response.json();
        }
        return null;
    },

    async updateCharacter(id, character) {
        const response = await this.request(`/characters/${id}`, {
            method: 'PUT',
            body: JSON.stringify(character)
        });
        return response && response.ok;
    },

    async deleteCharacter(id) {
        const response = await this.request(`/characters/${id}`, {
            method: 'DELETE'
        });
        return response && response.ok;
    }
};