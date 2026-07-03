import { useEffect, useRef } from "react";
import styles from "./Modal.module.css";
import { Button } from "../Button/Button";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  variant?: "fullscreen" | "centered";
  headerActions?: React.ReactNode;
  closeLabel?: string;
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  variant = "fullscreen",
  headerActions,
  closeLabel = "Close",
}: Props) => {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  if (!isOpen) return null;

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
          <div className={styles.headerActions}>
            <Button type="button" variant="ghost" onClick={onClose}>
              {closeLabel}
            </Button>
            {headerActions}
          </div>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </dialog>
  );
};

export { Modal };
