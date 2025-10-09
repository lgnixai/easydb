// 简化的 Teable SDK 包装器，避免复杂的依赖问题
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_TEABLE_BASE_URL || "http://127.0.0.1:8080";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  user: any;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

interface Space {
  id: string;
  name: string;
  description?: string;
  status: string;
}

interface Base {
  id: string;
  space_id: string;
  name: string;
  description?: string;
  status: string;
}

interface Table {
  id: string;
  base_id: string;
  name: string;
  description?: string;
}

interface Field {
  id: string;
  table_id: string;
  name: string;
  type: string;
  options?: any;
}

interface RecordItem {
  id: string;
  table_id: string;
  [key: string]: any;
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

class SimpleTeableClient {
  private accessToken: string | null = null;
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // ========== Auth ==========
  async getProfile(): Promise<{ id: string; email: string } | null> {
    try {
      const resp = await axios.get(`${this.baseURL}/api/users/profile`, { headers: this.getHeaders() });
      return { id: resp.data?.data?.id, email: resp.data?.data?.email };
    } catch {
      return null;
    }
  }

  // ========== Permissions ==========
  async grantTableEditPermission(params: { user_id: string; table_id: string }): Promise<boolean> {
    try {
      const resp = await axios.post(`${this.baseURL}/api/permissions/grant`, {
        user_id: params.user_id,
        resource_type: 'table',
        resource_id: params.table_id,
        role: 'editor',
      }, { headers: this.getHeaders() });
      return !!resp.data;
    } catch (e) {
      return false;
    }
  }

  // ========== Tables ==========
  async getTable(params: { table_id: string }): Promise<{ data: Table & { fields?: Field[] } }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tables/${params.table_id}`, {
        headers: this.getHeaders(),
      });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`获取数据表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  // ========== Fields ==========
  async listFields(params: { table_id: string; limit?: number; offset?: number }): Promise<PaginatedResponse<Field>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/fields`, {
        headers: this.getHeaders(),
        params,
      });
      const backendData = response.data.data;
      return {
        data: backendData.list,
        total: backendData.pagination.total,
        limit: backendData.pagination.limit,
        offset: backendData.pagination.page * backendData.pagination.limit,
      };
    } catch (error: any) {
      throw new Error(`获取字段列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async createField(body: { 
    table_id: string; 
    name: string; 
    type: string; 
    required?: boolean;
    is_unique?: boolean;
    is_primary?: boolean;
    field_order?: number;
    description?: string;
    default_value?: string;
    options?: any 
  }): Promise<{ data: Field }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/fields`, body, { headers: this.getHeaders() });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`创建字段失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async updateField(field_id: string, updates: Partial<{ name: string; type: string; description: string; options: any }>): Promise<{ data: Field }> {
    try {
      // 确保options对象被序列化为JSON字符串
      const payload = { ...updates };
      if (payload.options && typeof payload.options === 'object') {
        payload.options = JSON.stringify(payload.options);
      }
      
      const response = await axios.put(
        `${this.baseURL}/api/fields/${field_id}`,
        payload,
        { headers: this.getHeaders() }
      );
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`更新字段失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteField(field_id: string, table_id?: string): Promise<void> {
    try {
      const params = table_id ? { table_id } : {};
      console.log('[deleteField] 删除字段请求:', { field_id, table_id, params, url: `${this.baseURL}/api/fields/${field_id}` });
      await axios.delete(`${this.baseURL}/api/fields/${field_id}`, { 
        headers: this.getHeaders(),
        params 
      });
      console.log('[deleteField] 删除成功');
    } catch (error: any) {
      console.error('[deleteField] 删除失败:', error.response?.data || error);
      throw new Error(`删除字段失败: ${error.response?.data?.message || error.message}`);
    }
  }

  // ========== Records ==========
  async listRecords(params: { table_id: string; limit?: number; offset?: number }): Promise<PaginatedResponse<RecordItem>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/records`, {
        headers: this.getHeaders(),
        params,
      });
      const backendData = response.data.data;
      // 后端常用结构 { list, pagination }
      if (backendData?.list && backendData?.pagination) {
        return {
          data: backendData.list,
          total: backendData.pagination.total,
          limit: backendData.pagination.limit,
          offset: backendData.pagination.page * backendData.pagination.limit,
        };
      }
      // 兜底：直接返回 data
      return backendData as PaginatedResponse<RecordItem>;
    } catch (error: any) {
      throw new Error(`获取记录列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async createRecord(body: { table_id: string; fields: Record<string, any> }): Promise<{ data: RecordItem }> {
    try {
      // 后端期望 { table_id, data }
      const response = await axios.post(
        `${this.baseURL}/api/records`,
        { table_id: body.table_id, data: body.fields },
        { headers: this.getHeaders() }
      );
      return { data: response.data.data };
    } catch (error: any) {
      // 提取详细的错误信息
      let errorMessage = error.message;
      if (error.response?.data?.error?.details) {
        errorMessage = error.response.data.error.details;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(`创建记录失败: ${errorMessage}`);
    }
  }

  async updateRecord(body: { table_id: string; record_id: string; fields: Record<string, any> }): Promise<{ data: RecordItem }> {
    try {
      // 后端期望 { data }，路径带 record_id
      const response = await axios.put(
        `${this.baseURL}/api/records/${body.record_id}`,
        { data: body.fields },
        { headers: this.getHeaders() }
      );
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`更新记录失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteRecord(body: { table_id: string; record_id: string }): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/records/${body.record_id}`, { headers: this.getHeaders() });
    } catch (error: any) {
      throw new Error(`删除记录失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async deleteTable(table_id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/api/tables/${table_id}`, { headers: this.getHeaders() });
    } catch (error: any) {
      throw new Error(`删除表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  private getHeaders() {
    const headers: any = {
      'Content-Type': 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.baseURL}/api/auth/login`, credentials);
      // 后端返回的数据结构是 { code, data: { user, access_token, ... } }
      const authData = response.data.data;
      this.accessToken = authData.access_token;
      return authData;
    } catch (error: any) {
      throw new Error(`登录失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async createSpace(params: { name: string; description?: string }): Promise<{ data: Space }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/spaces`, params, { headers: this.getHeaders() });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`创建空间失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async listSpaces(params?: { limit?: number; offset?: number }): Promise<PaginatedResponse<Space>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/spaces`, {
        headers: this.getHeaders(),
        params: { limit: 50, ...params }
      });
      // 后端返回的数据结构是 { code, data: { list, pagination } }
      const backendData = response.data.data;
      return {
        data: backendData.list,
        total: backendData.pagination.total,
        limit: backendData.pagination.limit,
        offset: backendData.pagination.page * backendData.pagination.limit
      };
    } catch (error: any) {
      throw new Error(`获取空间列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async createBase(params: { space_id: string; name: string; description?: string }): Promise<{ data: Base }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/bases`, params, { headers: this.getHeaders() });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`创建数据库失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async listBases(params?: { limit?: number; offset?: number; space_id?: string }): Promise<PaginatedResponse<Base>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/bases`, {
        headers: this.getHeaders(),
        params: { limit: 100, ...params }
      });
      // 后端返回的数据结构是 { code, data: { list, pagination } }
      const backendData = response.data.data;
      return {
        data: backendData.list,
        total: backendData.pagination.total,
        limit: backendData.pagination.limit,
        offset: backendData.pagination.page * backendData.pagination.limit
      };
    } catch (error: any) {
      throw new Error(`获取基础表列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async getBase(base_id: string): Promise<{ data: Base }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/bases/${base_id}`, {
        headers: this.getHeaders(),
      });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`获取数据库失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async getField(field_id: string): Promise<{ data: Field }> {
    try {
      const response = await axios.get(`${this.baseURL}/api/fields/${field_id}`, {
        headers: this.getHeaders(),
      });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`获取字段失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async createTable(params: { base_id: string; name: string; description?: string }): Promise<{ data: Table }> {
    try {
      const response = await axios.post(`${this.baseURL}/api/tables`, params, { headers: this.getHeaders() });
      return { data: response.data.data };
    } catch (error: any) {
      throw new Error(`创建数据表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  async listTables(params?: { limit?: number; offset?: number; base_id?: string }): Promise<PaginatedResponse<Table>> {
    try {
      const response = await axios.get(`${this.baseURL}/api/tables`, {
        headers: this.getHeaders(),
        params: { limit: 200, ...params }
      });
      // 后端返回的数据结构是 { code, data: { list, pagination } }
      const backendData = response.data.data;
      return {
        data: backendData.list,
        total: backendData.pagination.total,
        limit: backendData.pagination.limit,
        offset: backendData.pagination.page * backendData.pagination.limit
      };
    } catch (error: any) {
      throw new Error(`获取数据表列表失败: ${error.response?.data?.message || error.message}`);
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  async logout(): Promise<void> {
    this.accessToken = null;
  }
}

const teable = new SimpleTeableClient(BASE_URL);

let loginPromise: Promise<void> | null = null;

export const ensureLogin = (creds?: LoginRequest): Promise<void> => {
  if (teable.isAuthenticated()) return Promise.resolve();
  if (loginPromise) return loginPromise;

  const credentials: LoginRequest = creds ?? {
    email: "admin@126.com",
    password: "Pmker123",
  };

  loginPromise = teable
    .login(credentials)
    .then(() => {})
    .finally(() => {
      loginPromise = null;
    });

  return loginPromise;
};

export default teable;
