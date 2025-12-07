// 用户类型
export interface User {
  id: number;
  username: string;
  full_name: string;
  phone: string;
  bio: string;
  user_type: 'normal' | 'admin';
  date_joined: string;
  last_login: string | null;
}

// 地域类型
export interface Region {
  id: number;
  name: string;
  city: string;
  province: string;
  full_name: string;
}

// 服务类型枚举
export type ServiceType = 
  | '管道维修'
  | '助老服务'
  | '保洁服务'
  | '就诊服务'
  | '营养餐服务'
  | '定期接送服务'
  | '其他';

// 需求状态
export type NeedStatus = 0 | -1; // 0: 已发布, -1: 已取消

// 响应状态
export type ResponseStatus = 0 | 1 | 2 | 3; // 0: 待接受, 1: 已同意, 2: 已拒绝, 3: 已取消

// 需求类型
export interface Need {
  id: number;
  user: User;
  region: Region;
  service_type: ServiceType;
  title: string;
  description: string;
  images: string[];
  videos: string[];
  status: NeedStatus;
  response_count?: number;
  accepted_count?: number;
  can_edit?: boolean;
  can_delete?: boolean;
  created_at: string;
  updated_at: string;
}

// 响应类型
export interface ServiceResponse {
  id: number;
  need: Need;
  user: User;
  description: string;
  images: string[];
  videos: string[];
  status: ResponseStatus;
  created_at: string;
  updated_at: string;
}

// 分页响应
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API 响应格式
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 登录响应
export interface LoginResponse {
  token: string;
  user: User;
}

// 统计数据
export interface MonthlyStats {
  month: string;
  region_name: string;
  service_type: string;
  total_needs: number;
  total_accepted: number;
}

// 图表数据
export interface ChartData {
  labels: string[];
  needs: number[];
  accepted: number[];
}

