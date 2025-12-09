import { useState, useEffect } from 'react';
import { ModelConfig } from '../components/types';
import { loadModelsFromStorage, saveModelsToStorage } from '../utils/storage';

interface UseModelsReturn {
  models: ModelConfig[];
  selectedModel: string;
  setModels: (models: ModelConfig[]) => void;
  setSelectedModel: (model: string) => void;
  handleAddModel: (model: ModelConfig) => void;
  handleUpdateModel: (updatedModel: ModelConfig) => void;
  handleDeleteModel: (modelId: string) => void;
  showNotification: (message: string, type?: 'success' | 'error') => void;
  notification: { message: string; type: 'success' | 'error' } | null;
}

/**
 * 模型管理Hook
 */
export const useModels = (): UseModelsReturn => {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // 显示通知
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // 添加模型
  const handleAddModel = (model: ModelConfig) => {
    const newModels = [...models, model];
    setModels(newModels);
    // 自动选择新添加的模型
    setSelectedModel(model.name);
    showNotification(`模型 "${model.name}" 添加成功`, 'success');
  };

  // 更新模型
  const handleUpdateModel = (updatedModel: ModelConfig) => {
    setModels(models.map(model => 
      model.id === updatedModel.id ? updatedModel : model
    ));
    showNotification(`模型 "${updatedModel.name}" 更新成功`, 'success');
  };

  // 删除模型
  const handleDeleteModel = (modelId: string) => {
    const modelToDelete = models.find(model => model.id === modelId);
    const remainingModels = models.filter(model => model.id !== modelId);
    setModels(remainingModels);
    
    // 如果删除的是当前选中的模型，自动选择第一个剩余模型
    if (modelToDelete && selectedModel === modelToDelete.name && remainingModels.length > 0) {
      setSelectedModel(remainingModels[0].name);
    } else if (remainingModels.length === 0) {
      // 如果没有剩余模型，清空选择
      setSelectedModel('');
    }
    
    if (modelToDelete) {
      showNotification(`模型 "${modelToDelete.name}" 删除成功`, 'success');
    }
  };

  // 组件加载时从localStorage读取模型配置
  useEffect(() => {
    const storedModels = loadModelsFromStorage();
    console.log('从localStorage加载的模型:', storedModels);
    if (storedModels.length > 0) {
      setModels(storedModels);
      // 自动选择第一个模型
      if (!selectedModel) {
        setSelectedModel(storedModels[0].name);
        console.log('自动选择模型:', storedModels[0].name);
      }
    } else {
      console.log('没有找到存储的模型配置');
    }
  }, []);

  // 模型配置变化时保存到localStorage
  useEffect(() => {
    saveModelsToStorage(models);
  }, [models]);

  return {
    models,
    selectedModel,
    setModels,
    setSelectedModel,
    handleAddModel,
    handleUpdateModel,
    handleDeleteModel,
    showNotification,
    notification
  };
};