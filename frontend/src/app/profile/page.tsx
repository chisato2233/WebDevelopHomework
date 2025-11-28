'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Loader2, Pencil, X, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    phone: user?.phone || '',
    bio: user?.bio || '',
  });
  
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'U';
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditing(false);
      toast.success('个人信息更新成功');
    } catch (error: any) {
      toast.error(error.response?.data?.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('两次输入的密码不一致');
      return;
    }
    
    setLoading(true);
    try {
      await changePassword(passwordData.old_password, passwordData.new_password);
      setIsChangingPassword(false);
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      toast.success('密码修改成功');
    } catch (error: any) {
      toast.error(error.response?.data?.errors?.old_password?.[0] || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getInitials(user?.full_name || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{user?.full_name}</h1>
                <p className="text-muted-foreground">@{user?.username}</p>
                <Badge className="mt-2" variant={user?.user_type === 'admin' ? 'default' : 'secondary'}>
                  {user?.user_type === 'admin' ? '管理员' : '普通用户'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>个人信息</CardTitle>
              <CardDescription>管理您的基本账户信息</CardDescription>
            </div>
            {!isEditing && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                编辑
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>用户名</Label>
                    <Input value={user?.username} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">用户名不可修改</p>
                  </div>
                  <div className="space-y-2">
                    <Label>真实姓名</Label>
                    <Input value={user?.full_name} disabled className="bg-muted" />
                    <p className="text-xs text-muted-foreground">真实姓名不可修改</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号码</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">个人简介</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="mr-2 h-4 w-4" />
                    取消
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                    保存
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">用户名</p>
                    <p className="font-medium">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">真实姓名</p>
                    <p className="font-medium">{user?.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">手机号码</p>
                    <p className="font-medium">{user?.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">注册时间</p>
                    <p className="font-medium">
                      {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">个人简介</p>
                  <p className="font-medium">{user?.bio || '暂无简介'}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>安全设置</CardTitle>
              <CardDescription>修改您的账户密码</CardDescription>
            </div>
            {!isChangingPassword && (
              <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(true)}>
                修改密码
              </Button>
            )}
          </CardHeader>
          {isChangingPassword && (
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="old_password">原密码</Label>
                  <Input
                    id="old_password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                  />
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="new_password">新密码</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">
                    至少6位，包含2个数字，大小写混合
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">确认新密码</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsChangingPassword(false)}>
                    取消
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    确认修改
                  </Button>
                </div>
              </form>
            </CardContent>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
