import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import { X } from "lucide-react";
import { IconButton } from "../IconButton/IconButton";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "fullscreen" | "centered";
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  variant = "fullscreen",
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      className={`${styles.dialog} ${styles[variant]}`}
      onClose={onClose}
      onClick={(e) => {
        if (variant === "centered" && e.target === dialogRef.current) onClose();
      }}
    >
      <div className={styles.content}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <IconButton onClick={onClose} aria-label="Close" tone="danger">
            <X size={20} />
          </IconButton>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
};

export { Modal };
