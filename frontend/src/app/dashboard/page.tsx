'use client';

import Link from 'next/link';
import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TextGif } from '@/components/ui/text-gif';
import { motion } from 'framer-motion';
import {
  PenSquare, Search, FileText, HandHelping,
  Wrench, Heart, Sparkles, Hospital, UtensilsCrossed, Car,
  ArrowRight, Link2
} from 'lucide-react';

// GIF URL for Hero text
const HERO_GIF_URL = 'https://media.giphy.com/media/4bhs1boql4XVJgmm4H/giphy.gif';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4 },
};

export default function DashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: '发布需求',
      description: '发布您的服务需求，让社区伙伴来帮助您',
      icon: PenSquare,
      href: '/my-needs/create',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: '浏览需求',
      description: '查看社区中的服务需求，提供您的帮助',
      icon: Search,
      href: '/needs',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: '我的需求',
      description: '管理您发布的服务需求',
      icon: FileText,
      href: '/my-needs',
      gradient: 'from-orange-500 to-amber-500',
    },
    {
      title: '我的服务',
      description: '查看您提供的服务响应',
      icon: HandHelping,
      href: '/my-responses',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const serviceTypes = [
    { name: '管道维修', icon: Wrench, color: 'bg-blue-500', hoverColor: 'hover:bg-blue-600' },
    { name: '助老服务', icon: Heart, color: 'bg-pink-500', hoverColor: 'hover:bg-pink-600' },
    { name: '保洁服务', icon: Sparkles, color: 'bg-green-500', hoverColor: 'hover:bg-green-600' },
    { name: '就诊服务', icon: Hospital, color: 'bg-red-500', hoverColor: 'hover:bg-red-600' },
    { name: '营养餐服务', icon: UtensilsCrossed, color: 'bg-orange-500', hoverColor: 'hover:bg-orange-600' },
    { name: '定期接送', icon: Car, color: 'bg-purple-500', hoverColor: 'hover:bg-purple-600' },
  ];

  return (
    <MainLayout>
      <motion.div
        className="space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section
          variants={itemVariants}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-background via-background to-primary/5 border border-border/50"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary/10 via-transparent to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-500/10 via-transparent to-transparent rounded-full blur-3xl" />
          </div>

          <div className="relative px-8 py-16 md:py-24 flex flex-col items-center text-center">
            {/* Logo icon */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.3 }}
              className="mb-6"
            >
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <Link2 className="h-10 w-10 text-primary" />
              </div>
            </motion.div>

            {/* Hero Text with GIF */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
            >
              <TextGif
                gifUrl={HERO_GIF_URL}
                text="Nexus"
                size="xxxl"
                weight="black"
                fallbackColor="hsl(var(--primary))"
                className="tracking-tight"
              />
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-xl md:text-2xl text-muted-foreground max-w-2xl"
            >
              连接服务供需，构建社区纽带
            </motion.p>

            {/* Welcome message */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-6 flex items-center gap-2 text-lg"
            >
              <span className="text-muted-foreground">欢迎回来，</span>
              <span className="font-semibold text-foreground">{user?.full_name}</span>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="mt-8 flex flex-col sm:flex-row gap-4"
            >
              <Button asChild size="lg" className="group">
                <Link href="/my-needs/create">
                  <PenSquare className="mr-2 h-5 w-5" />
                  发布需求
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/needs">
                  <Search className="mr-2 h-5 w-5" />
                  浏览需求
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">快速操作</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.href}
                variants={itemVariants}
                custom={index}
                whileHover="hover"
                initial="rest"
                animate="rest"
              >
                <motion.div variants={cardHoverVariants} transition={{ type: 'spring', stiffness: 400, damping: 17 }}>
                  <Link href={action.href}>
                    <Card className="h-full cursor-pointer border-border/50 hover:border-primary/30 transition-colors">
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${action.gradient} shadow-lg`}>
                            <action.icon className="h-5 w-5 text-white" />
                          </div>
                          <CardTitle className="text-lg">{action.title}</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-sm">{action.description}</CardDescription>
                        <div className="mt-4 flex items-center text-sm font-medium text-primary">
                          前往
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Service Types */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">服务类型</h2>
            <Link href="/needs" className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {serviceTypes.map((service, index) => (
              <motion.div
                key={service.name}
                variants={itemVariants}
                custom={index}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/needs?service_type=${encodeURIComponent(service.name)}`}>
                  <Card className="cursor-pointer border-border/50 hover:border-primary/30 transition-all">
                    <CardContent className="pt-6 pb-4 text-center">
                      <motion.div
                        className={`inline-flex p-3.5 rounded-2xl ${service.color} ${service.hoverColor} mb-3 shadow-lg transition-colors`}
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.4 }}
                      >
                        <service.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <p className="font-medium text-sm">{service.name}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* User Info Card */}
        <motion.section variants={itemVariants}>
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-xl">个人信息</CardTitle>
              <CardDescription>您的基本账户信息</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">用户名</p>
                  <p className="font-medium">{user?.username}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">真实姓名</p>
                  <p className="font-medium">{user?.full_name}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">手机号码</p>
                  <p className="font-medium">{user?.phone || '-'}</p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">用户类型</p>
                  <Badge variant={user?.user_type === 'admin' ? 'default' : 'secondary'}>
                    {user?.user_type === 'admin' ? '管理员' : '普通用户'}
                  </Badge>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-border/50">
                <Button variant="outline" asChild>
                  <Link href="/profile">
                    编辑个人信息
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </motion.div>
    </MainLayout>
  );
}
