'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useRef, useEffect } from 'react';

// Navigation order for direction-aware transitions
// Index determines position: lower index = left, higher index = right
const NAV_ORDER = [
  '/dashboard',
  '/needs',
  '/my-needs',
  '/my-responses',
  '/admin',
] as const;

// Get the base path for matching (handles nested routes like /needs/[id])
function getBasePath(pathname: string): string {
  // Check each nav path to find a match
  for (const navPath of NAV_ORDER) {
    if (pathname === navPath || pathname.startsWith(navPath + '/')) {
      return navPath;
    }
  }
  return pathname;
}

// Get navigation index for a path (-1 if not found)
function getNavIndex(pathname: string): number {
  const basePath = getBasePath(pathname);
  return NAV_ORDER.indexOf(basePath as typeof NAV_ORDER[number]);
}

// Determine slide direction based on navigation
function getDirection(prevPath: string | null, currentPath: string): 'left' | 'right' | 'none' {
  if (!prevPath) return 'none';

  const prevIndex = getNavIndex(prevPath);
  const currentIndex = getNavIndex(currentPath);

  // If either path is not in nav order, no directional animation
  if (prevIndex === -1 || currentIndex === -1) return 'none';

  // Same page (e.g., /needs to /needs/[id])
  if (prevIndex === currentIndex) return 'none';

  // Moving to higher index = slide left (content comes from right)
  // Moving to lower index = slide right (content comes from left)
  return currentIndex > prevIndex ? 'left' : 'right';
}

// Animation variants
const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  },
  slideRight: {
    initial: { opacity: 0, x: -30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.05 },
  },
  blur: {
    initial: { opacity: 0, filter: 'blur(8px)' },
    animate: { opacity: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, filter: 'blur(8px)' },
  },
  scaleBlur: {
    initial: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
    animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
    exit: { opacity: 0, scale: 0.95, filter: 'blur(4px)' },
  },
} as const;

export type TransitionVariant = keyof typeof variants;

// Transition presets
const transitions = {
  spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
  smooth: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  fast: { duration: 0.15, ease: 'easeOut' },
  slow: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
} as const;

export type TransitionType = keyof typeof transitions;

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit'> {
  children: React.ReactNode;
  /** Animation variant (ignored when directionAware is true) */
  variant?: TransitionVariant;
  /** Transition timing preset */
  transition?: TransitionType;
  /** Disable page transition animation */
  disabled?: boolean;
  /** Enable direction-aware sliding based on nav position */
  directionAware?: boolean;
  /** Fallback variant when direction cannot be determined */
  fallbackVariant?: TransitionVariant;
  className?: string;
}

// Store for tracking previous pathname across renders
let globalPrevPath: string | null = null;

export function PageTransition({
  children,
  variant = 'scaleBlur',
  transition = 'smooth',
  disabled = false,
  directionAware = false,
  fallbackVariant = 'scaleBlur',
  className = '',
  ...props
}: PageTransitionProps) {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(globalPrevPath);

  // Update previous path after render
  useEffect(() => {
    globalPrevPath = pathname;
    prevPathRef.current = pathname;
  }, [pathname]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  // Determine which variant to use
  let selectedVariant = variants[variant];

  if (directionAware) {
    const direction = getDirection(prevPathRef.current, pathname);

    if (direction === 'left') {
      selectedVariant = variants.slideLeft;
    } else if (direction === 'right') {
      selectedVariant = variants.slideRight;
    } else {
      selectedVariant = variants[fallbackVariant];
    }
  }

  const selectedTransition = transitions[transition];

  return (
    <motion.div
      key={pathname}
      initial={selectedVariant.initial}
      animate={selectedVariant.animate}
      exit={selectedVariant.exit}
      transition={selectedTransition}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Export variants for custom use
export { variants, transitions, NAV_ORDER, getDirection, getNavIndex };
