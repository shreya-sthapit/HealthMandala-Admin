const API_BASE_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export { API_BASE_URL, apiUrl };
