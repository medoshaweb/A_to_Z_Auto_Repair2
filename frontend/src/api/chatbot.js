import api from './config';

export const chatbotAPI = {
  // Chat with AI assistant
  chat: async (message, conversationHistory = []) => {
    const response = await api.post('/chatbot/chat', {
      message,
      conversationHistory,
    });
    return response.data;
  },
};

