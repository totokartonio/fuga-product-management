import type { ButtonHTMLAttributes } from "react";
import styles from "./IconButton.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  size?: "md" | "sm";
  tone?: "default" | "danger";
};

const IconButton = ({
  children,
  tone = "default",
  size = "md",
  className,
  ...props
}: Props) => {
  return (
    <button
      className={`${styles.iconButton} ${size === "md" ? styles.md : styles.sm} ${tone === "danger" ? styles.danger : ""} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { IconButton };
