import { ModelConfig } from "../components/types";

// localStorage 键名常量
const STORAGE_KEY = "shaderchat_models_config";

// 简单的加密/解密函数
const ENCRYPTION_KEY = "shaderchat_secure_key_2026";

/**
 * 加密文本
 */
export const encrypt = (text: string): string => {
	try {
		let result = "";
		for (let i = 0; i < text.length; i++) {
			result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
		}
		return btoa(result); // Base64编码
	} catch (error) {
		console.error("加密失败:", error);
		return text;
	}
};

/**
 * 解密文本
 */
export const decrypt = (encryptedText: string): string => {
	try {
		const decoded = atob(encryptedText); // Base64解码
		let result = "";
		for (let i = 0; i < decoded.length; i++) {
			result += String.fromCharCode(decoded.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
		}
		return result;
	} catch (error) {
		console.error("解密失败:", error);
		return encryptedText;
	}
};

/**
 * 从localStorage加载模型配置
 */
export const loadModelsFromStorage = (): ModelConfig[] => {
	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsedModels = JSON.parse(stored);
			// 验证数据格式
			if (Array.isArray(parsedModels)) {
				return parsedModels.filter((model) => {
					if (
						!model ||
						typeof model.id !== "string" ||
						typeof model.name !== "string" ||
						typeof model.address !== "string" ||
						typeof model.model !== "string" ||
						typeof model.apiKey !== "string"
					) {
						return false;
					}

					// 解密API密钥
					try {
						model.apiKey = decrypt(model.apiKey);
					} catch (error) {
						console.error("解密API密钥失败:", error);
						model.apiKey = "";
					}

					return true;
				});
			}
		}
	} catch (error) {
		console.error("从localStorage加载模型配置失败:", error);
	}
	return [];
};

/**
 * 保存模型配置到localStorage
 */
export const saveModelsToStorage = (models: ModelConfig[]): void => {
	try {
		// 创建要保存的模型副本，对API密钥进行加密
		const modelsToSave = models.map((model) => ({
			...model,
			apiKey: encrypt(model.apiKey),
		}));

		localStorage.setItem(STORAGE_KEY, JSON.stringify(modelsToSave));
	} catch (error) {
		console.error("保存模型配置到localStorage失败:", error);
	}
};

/**
 * 清除本地存储的模型配置
 */
export const clearModelsFromStorage = (): void => {
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.error("清除模型配置失败:", error);
	}
};
