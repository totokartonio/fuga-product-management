type Props = {
  className?: string;
};

const RecordPlaceholder = ({ className }: Props) => (
  <svg
    viewBox="0 0 100 100"
    role="img"
    aria-label="No cover art"
    className={className}
    style={{ width: "100%", height: "100%", display: "block" }}
  >
    <circle cx="50" cy="50" r="48" fill="var(--color-text)" />
    <circle
      cx="50"
      cy="50"
      r="40"
      fill="none"
      stroke="var(--color-secondary)"
      strokeWidth="0.5"
      opacity="0.35"
    />
    <circle cx="50" cy="50" r="18" fill="var(--color-primary)" />
    <circle cx="50" cy="50" r="3" fill="var(--color-surface)" />
  </svg>
);

export { RecordPlaceholder };
