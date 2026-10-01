'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades and slides content in on mount. */
export function FadeIn({ delay = 0, y = 12, ...props }: HTMLMotionProps<'div'> & { delay?: number; y?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease, delay }}
      {...props}
    />
  );
}

/** Children (use <StaggerItem>) animate in one after another. */
export function Stagger({ gap = 0.05, ...props }: HTMLMotionProps<'div'> & { gap?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
      {...props}
    />
  );
}

export function StaggerItem(props: HTMLMotionProps<'div'>) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 14 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
      }}
      {...props}
    />
  );
}

/** Animates in when scrolled into view (landing page sections). */
export function Reveal({ delay = 0, ...props }: HTMLMotionProps<'div'> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, ease, delay }}
      {...props}
    />
  );
}

export const motionEase = ease;
export type MotionDivProps = React.ComponentProps<typeof motion.div>;
