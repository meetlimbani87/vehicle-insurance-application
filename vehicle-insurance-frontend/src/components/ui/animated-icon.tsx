import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { LucideIcon } from "lucide-react";

export type AnimationType = "bounce" | "shake" | "spin" | "pulse" | "scale" | "float" | "nudge";

export interface AnimatedIconProps extends Omit<HTMLMotionProps<"div">, "children"> {
  icon: LucideIcon;
  animation?: AnimationType;
  size?: number | string;
  className?: string;
  color?: string;
  active?: boolean;
}

// Animate-UI & Lordicon motion presets
const animationVariants = {
  bounce: {
    rest: { y: 0, scale: 1 },
    hover: { y: [0, -4, 0], scale: [1, 1.15, 1.05], transition: { duration: 0.4, ease: "easeInOut" } },
    tap: { scale: 0.9 },
  },
  shake: {
    rest: { rotate: 0 },
    hover: { rotate: [0, -12, 12, -8, 8, 0], scale: 1.1, transition: { duration: 0.5, ease: "easeInOut" } },
    tap: { scale: 0.9 },
  },
  spin: {
    rest: { rotate: 0 },
    hover: { rotate: 360, scale: 1.1, transition: { duration: 0.6, ease: "easeInOut" } },
    tap: { scale: 0.9 },
  },
  pulse: {
    rest: { scale: 1, filter: "drop-shadow(0 0 0px transparent)" },
    hover: {
      scale: [1, 1.18, 1.08],
      filter: ["drop-shadow(0 0 0px transparent)", "drop-shadow(0 0 6px rgba(14, 156, 136, 0.7))", "drop-shadow(0 0 2px rgba(14, 156, 136, 0.4))"],
      transition: { duration: 0.6, repeat: Infinity, repeatType: "reverse" as const },
    },
    tap: { scale: 0.9 },
  },
  scale: {
    rest: { scale: 1 },
    hover: { scale: 1.2, transition: { type: "spring", stiffness: 400, damping: 15 } },
    tap: { scale: 0.85 },
  },
  float: {
    rest: { y: 0 },
    hover: { y: -5, scale: 1.1, transition: { type: "spring", stiffness: 300, damping: 10 } },
    tap: { scale: 0.9 },
  },
  nudge: {
    rest: { x: 0 },
    hover: { x: 4, scale: 1.1, transition: { type: "spring", stiffness: 400, damping: 12 } },
    tap: { scale: 0.9 },
  },
};

export function AnimatedIcon({
  icon: IconComponent,
  animation = "scale",
  size,
  className = "",
  active = false,
  ...props
}: AnimatedIconProps) {
  const variant = animationVariants[animation] || animationVariants.scale;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      animate={active ? "hover" : "rest"}
      variants={variant}
      className={`inline-flex items-center justify-center shrink-0 cursor-pointer ${className}`}
      {...props}
    >
      <IconComponent size={size} className="lucide-animate-ui" />
    </motion.div>
  );
}

export default AnimatedIcon;
