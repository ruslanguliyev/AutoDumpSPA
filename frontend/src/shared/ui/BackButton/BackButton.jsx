import { useNavigate } from "react-router-dom";
import styles from "./BackButton.module.scss";

export default function BackButton({ fallback = "/" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  };

  return (
    <button
      className={styles.back}
      onClick={handleBack}
      aria-label="Go back"
    >
      ← Back
    </button>
  );
}
