'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterFormData } from '@/lib/validation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, Check, X } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password', '');

  const passwordChecks = {
    length: password.length >= 6,
    digits: (password.match(/\d/g) || []).length >= 2,
    mixed: /[A-Z]/.test(password) && /[a-z]/.test(password),
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError('');
    setLoading(true);
    try {
      await registerUser({
        username: data.username,
        password: data.password,
        confirm_password: data.confirmPassword,  // 添加确认密码字段
        full_name: data.full_name || '',
        phone: data.phone,
        bio: data.bio,
      });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('注册错误:', err.response?.data || err.message || err);
      
      const data = err.response?.data;
      const errors = data?.errors;
      
      if (errors) {
        // 收集所有字段的错误信息
        const errorMessages: string[] = [];
        for (const [field, messages] of Object.entries(errors)) {
          if (Array.isArray(messages)) {
            errorMessages.push(...messages);
          } else if (typeof messages === 'string') {
            errorMessages.push(messages);
          }
        }
        setError(errorMessages.join('；') || '注册失败');
      } else {
        setError(data?.message || err.message || '注册失败，请稍后重试');
      }
    } finally {
      setLoading(false);
    }
  };

  const PasswordCheck = ({ passed, text }: { passed: boolean; text: string }) => (
    <div className="flex items-center gap-2 text-sm">
      {passed ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-muted-foreground" />
      )}
      <span className={passed ? 'text-green-600' : 'text-muted-foreground'}>{text}</span>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <span className="text-4xl">🤝</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            好服务平台
          </h1>
          <p className="text-muted-foreground mt-2">加入我们，共建美好社区</p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">注册账号</CardTitle>
            <CardDescription className="text-center">
              填写以下信息创建您的账号
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">
                  用户名 <Badge variant="destructive" className="ml-1 text-xs">必填</Badge>
                </Label>
                <Input
                  id="username"
                  placeholder="请输入用户名"
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-sm text-destructive">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">
                  密码 <Badge variant="destructive" className="ml-1 text-xs">必填</Badge>
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="请输入密码"
                  {...register('password')}
                />
                <div className="space-y-1 pt-1">
                  <PasswordCheck passed={passwordChecks.length} text="至少6位字符" />
                  <PasswordCheck passed={passwordChecks.digits} text="包含至少2个数字" />
                  <PasswordCheck passed={passwordChecks.mixed} text="包含大写和小写字母" />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  确认密码 <Badge variant="destructive" className="ml-1 text-xs">必填</Badge>
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="请再次输入密码"
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  手机号码 <Badge variant="destructive" className="ml-1 text-xs">必填</Badge>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="请输入11位手机号码"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">真实姓名</Label>
                <Input
                  id="full_name"
                  placeholder="请输入真实姓名（选填）"
                  {...register('full_name')}
                />
                {errors.full_name && (
                  <p className="text-sm text-destructive">{errors.full_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">个人简介</Label>
                <Textarea
                  id="bio"
                  placeholder="介绍一下自己（选填）"
                  rows={3}
                  {...register('bio')}
                />
                {errors.bio && (
                  <p className="text-sm text-destructive">{errors.bio.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? '注册中...' : '立即注册'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              已有账号？{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                立即登录
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
