import { useState, useCallback } from 'react';
import { OllamaConfig, OllamaMessage, OllamaResponse } from '../types';

export const useOllama = (config: OllamaConfig) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (messages: OllamaMessage[]): Promise<string> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${config.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.model,
          messages,
          temperature: config.temperature ?? 0.7,
          stream: config.stream ?? false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API 错误: ${response.status} ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.message.content;
    } catch (err: any) {
      const errorMessage = err.message || '连接 Ollama 服务失败';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [config]);

  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${config.baseUrl}/api/tags`);
      return response.ok;
    } catch {
      return false;
    }
  }, [config.baseUrl]);

  return {
    sendMessage,
    checkHealth,
    loading,
    error,
  };
};

