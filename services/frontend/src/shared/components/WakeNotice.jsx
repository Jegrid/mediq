import { useWakeStore } from "../../lib/wakeStore";
import styles from "./WakeNotice.module.css";

//shows while a request is slow, usually the demo server waking up
function WakeNotice() {
  const visible = useWakeStore((state) => state.slowRequests > 0);

  if (!visible) return null;

  return (
    <div className={styles.notice} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <div>
        <p className={styles.title}>Waking up the demo server</p>
        <p className={styles.text}>
          The free hosting sleeps when idle, so the first load can take up to a
          minute. Thanks for waiting.
        </p>
      </div>
    </div>
  );
}

export default WakeNotice;
