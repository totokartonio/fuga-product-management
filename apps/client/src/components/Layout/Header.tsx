import logo from "../../assets/FUGA_logo_white.svg";
import styles from "./Layout.module.css";

const Header = () => {
  return (
    <header className={styles.header}>
      <img src={logo} alt="FUGA" className={styles.logo} />
    </header>
  );
};

export { Header };
