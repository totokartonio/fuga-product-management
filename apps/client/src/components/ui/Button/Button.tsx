import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
  children: React.ReactNode;
};

const Button = ({
  variant = "ghost",
  className,
  children,
  ...props
}: Props) => {
  return (
    <button
      className={`${styles.button} ${styles[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </button>
  );
};

export { Button };
