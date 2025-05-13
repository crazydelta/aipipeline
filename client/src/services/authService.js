import axios from 'axios';

const API_URL = 'https://aipipeline-server.onrender.com/api/auth';

const authService = {
  register: ({ name, email, password }) =>
    axios.post(`${API_URL}/register`, { name, email, password }),

  login: ({ email, password }) =>
    axios.post(`${API_URL}/login`, { email, password })
};

export default authService;

