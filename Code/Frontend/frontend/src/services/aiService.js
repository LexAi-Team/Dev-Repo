import api from '../api/axios';

export const askLexAI = async (query) => {
  if (!query) throw new Error('Missing query');
  const { data } = await api.post('/ask', { query });
  return data;
};

export default { askLexAI };
