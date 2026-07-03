import type { FieldsetHTMLAttributes, ReactNode } from "react";
import styles from "./Fieldset.module.css";

type Props = FieldsetHTMLAttributes<HTMLFieldSetElement> & {
  children: ReactNode;
  disabled: boolean;
};

const Fieldset = ({ children, disabled }: Props) => {
  return (
    <fieldset disabled={disabled} className={styles.fieldset}>
      {children}
    </fieldset>
  );
};

export { Fieldset };
