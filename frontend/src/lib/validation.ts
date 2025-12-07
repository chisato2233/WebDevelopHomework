import { z } from 'zod';

// 密码验证规则：不少于6位，至少2个数字，大小写混合
export const passwordSchema = z.string()
  .min(6, '密码不少于6位')
  .refine(
    (pwd) => (pwd.match(/\d/g) || []).length >= 2,
    '密码必须包含至少2个数字'
  )
  .refine(
    (pwd) => /[A-Z]/.test(pwd) && /[a-z]/.test(pwd),
    '密码不能全部为大写或小写'
  );

// 手机号验证
export const phoneSchema = z.string()
  .length(11, '手机号必须为11位')
  .regex(/^1[3-9]\d{9}$/, '请输入有效的手机号');

// 用户注册表单验证
export const registerSchema = z.object({
  username: z.string()
    .min(3, '用户名至少3个字符')
    .max(50, '用户名最多50个字符'),
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: z.string()
    .max(100, '姓名最多100个字符')
    .optional()
    .or(z.literal('')),
  phone: phoneSchema,
  bio: z.string().max(500, '简介最多500个字符').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 登录表单验证
export const loginSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
});

// 需求表单验证
export const needSchema = z.object({
  region_id: z.number({ message: '请选择地域' }),
  service_type: z.string().min(1, '请选择服务类型'),
  title: z.string()
    .min(5, '标题至少5个字符')
    .max(200, '标题最多200个字符'),
  description: z.string()
    .min(10, '描述至少10个字符'),
});

// 响应表单验证
export const responseSchema = z.object({
  need_id: z.number({ message: '需求ID不能为空' }),
  description: z.string()
    .min(10, '描述至少10个字符'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type NeedFormData = z.infer<typeof needSchema>;
export type ResponseFormData = z.infer<typeof responseSchema>;

