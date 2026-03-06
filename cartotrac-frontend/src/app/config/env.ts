const env = {
  appName: import.meta.env.VITE_APP_NAME || 'Cartotrac',
  apiUrl: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1',
};

export default env;