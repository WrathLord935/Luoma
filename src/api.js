const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const user = localStorage.getItem('user');
    if (user) {
        const parsed = JSON.parse(user);
        // Sometimes text based user might be saved differently, so be careful. 
        // We will store just the token separately or inside the user object.
        // Let's assume we store the token separately or adapt the login response.
        return parsed.token ? { 'Authorization': `Bearer ${parsed.token}` } : {};
    }
    return {};
};

// Generic Fetch Wrapper
const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
    const headers = isFormData ? {} : { 'Content-Type': 'application/json' };

    // Add Auth
    Object.assign(headers, getAuthHeaders());

    const config = {
        method,
        headers: isFormData ? getAuthHeaders() : headers, // FormData shouldn't have Content-Type set manually
    };

    if (body) {
        config.body = isFormData ? body : JSON.stringify(body);
    }

    try {
        const res = await fetch(`${API_URL}${endpoint}`, config);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'API Request Failed');
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export default {
    get: (endpoint) => apiRequest(endpoint, 'GET'),
    post: (endpoint, body, isFormData) => apiRequest(endpoint, 'POST', body, isFormData),
    put: (endpoint, body) => apiRequest(endpoint, 'PUT', body),
    delete: (endpoint) => apiRequest(endpoint, 'DELETE'),
    API_URL
};
