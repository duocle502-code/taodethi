export type ApiKeyInfo = {
  key: string;
  name: string;
  status: 'active' | 'cooldown' | 'error';
  errorCount: number;
  cooldownUntil?: number;
};

const STORAGE_API_KEYS = 'gemini_api_keys';
const STORAGE_SELECTED_MODEL = 'gemini_selected_model';

class ApiKeyManager {
  private keys: ApiKeyInfo[] = [];
  
  constructor() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      // Migrate old key if exists
      const oldKey = localStorage.getItem('gemini_api_key');
      const savedKeys = localStorage.getItem(STORAGE_API_KEYS);
      
      if (savedKeys) {
        try {
          const parsed = JSON.parse(savedKeys);
          this.keys = Array.isArray(parsed) ? parsed : [];
        } catch(e) {
          this.keys = [];
        }
      } else if (oldKey) {
        this.keys = [{
          key: oldKey,
          name: 'Default Key',
          status: 'active',
          errorCount: 0
        }];
        this.saveToStorage();
      } else {
        this.keys = [];
      }
    } catch (e) {
      console.error('Error loading API keys', e);
      this.keys = [];
    }
  }

  saveToStorage() {
    localStorage.setItem(STORAGE_API_KEYS, JSON.stringify(this.keys));
  }

  getAllKeys(): ApiKeyInfo[] {
    return this.keys;
  }

  addKey(key: string, name: string = 'Key mới'): boolean {
    if (!this.keys.find(k => k.key === key)) {
      this.keys.push({
        key,
        name,
        status: 'active',
        errorCount: 0
      });
      this.saveToStorage();
      return true;
    }
    return false;
  }

  removeKey(key: string) {
    this.keys = this.keys.filter(k => k.key !== key);
    this.saveToStorage();
  }
  
  updateKeyStatus(key: string, status: ApiKeyInfo['status']) {
    const k = this.keys.find(i => i.key === key);
    if(k) {
      k.status = status;
      this.saveToStorage();
    }
  }

  getActiveKey(): string | null {
    const now = Date.now();
    // Khôi phục các key hết cooldown (5 phút)
    let needsSave = false;
    this.keys.forEach(k => {
      if (k.status === 'cooldown' && k.cooldownUntil && now > k.cooldownUntil) {
        k.status = 'active';
        k.errorCount = 0;
        k.cooldownUntil = undefined;
        needsSave = true;
      }
    });
    if (needsSave) this.saveToStorage();

    const activeKey = this.keys.find(k => k.status === 'active');
    return activeKey ? activeKey.key : null;
  }

  markKeyError(keyString: string, isQuotaError: boolean = true) {
    const keyObj = this.keys.find(k => k.key === keyString);
    if (!keyObj) return this.rotateToNextKey();

    keyObj.errorCount++;
    if (isQuotaError || keyObj.errorCount >= 3) {
      keyObj.status = 'cooldown';
      keyObj.cooldownUntil = Date.now() + 5 * 60 * 1000; // 5 phút cooldown
      console.warn(`API Key [${keyObj.name}] bị đánh dấu lỗi/hết quota -> Chuyển sang Cooldown mode 5 phút.`);
    }
    
    this.saveToStorage();
    return this.rotateToNextKey();
  }

  rotateToNextKey() {
    const newKey = this.getActiveKey();
    return {
      success: !!newKey,
      newKey: newKey,
      message: newKey ? 'Đã tìm thấy Key dự phòng khả dụng.' : 'Tất cả các API Key đều bị vô hiệu hóa hoặc hết Quota.'
    };
  }

  resetAllKeys() {
    this.keys.forEach(k => {
      k.status = 'active';
      k.errorCount = 0;
      k.cooldownUntil = undefined;
    });
    this.saveToStorage();
  }
}

export const apiKeyManager = new ApiKeyManager();

// Model Selection exports
export const MODELS = [
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite (Tốc độ cao)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (Cân bằng)' },
  { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash-Preview (Thông minh)' },
] as const;

export type SupportedModels = typeof MODELS[number]['id'];

export const getSelectedModel = (): SupportedModels => {
  const m = localStorage.getItem(STORAGE_SELECTED_MODEL);
  return (m as SupportedModels) || 'gemini-2.5-flash';
};

export const setSelectedModel = (model: SupportedModels) => {
  localStorage.setItem(STORAGE_SELECTED_MODEL, model);
};
