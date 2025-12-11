'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Search, FileText, HandHelping, Shield, User, LogOut, Settings, Link2 } from 'lucide-react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

// Spring transition config
const springTransition = { type: 'spring' as const, stiffness: 500, damping: 30 };

function NavItem({ href, icon, label, isActive }: NavItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Show label when active OR hovered
  const showLabel = isActive || isHovered;

  return (
    <motion.div
      layout="position"
      transition={springTransition}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      <Link
        href={href}
        className={cn(
          'relative flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground'
        )}
      >
        <div className="flex items-center gap-2">
          <motion.span
            className="flex-shrink-0"
            animate={{ scale: isHovered && !isActive ? 1.15 : 1 }}
            transition={springTransition}
          >
            {icon}
          </motion.span>
          <AnimatePresence initial={false} mode="popLayout">
            {showLabel && (
              <motion.span
                key="label"
                initial={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.8, filter: 'blur(4px)' }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="whitespace-nowrap origin-left"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </Link>
      <AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 rounded-md bg-accent -z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springTransition}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Navigation items configuration
const navItems = [
  { href: '/dashboard', icon: Home, label: '首页' },
  { href: '/needs', icon: Search, label: '浏览需求' },
  { href: '/my-needs', icon: FileText, label: '我需要' },
  { href: '/my-responses', icon: HandHelping, label: '我服务' },
];

const adminNavItem = { href: '/admin', icon: Shield, label: '管理控制台' };

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name?.slice(0, 2).toUpperCase() || 'U';
  };

  // Check if a nav item is active based on pathname
  const isNavActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
          <Link2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Nexus
          </span>
        </Link>

        {/* Navigation */}
        {isAuthenticated && (
          <LayoutGroup>
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={<item.icon className="h-4 w-4" />}
                  label={item.label}
                  isActive={isNavActive(item.href)}
                />
              ))}
              {isAdmin && (
                <NavItem
                  href={adminNavItem.href}
                  icon={<adminNavItem.icon className="h-4 w-4" />}
                  label={adminNavItem.label}
                  isActive={isNavActive(adminNavItem.href)}
                />
              )}
            </nav>
          </LayoutGroup>
        )}

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(user?.full_name || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  个人信息
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings className="mr-2 h-4 w-4" />
                  设置
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">登录</Link>
              </Button>
              <Button asChild>
                <Link href="/register">注册</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
