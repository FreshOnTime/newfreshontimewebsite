import "./spinner.css";

interface SpinnerProps {
  color?: string;
}

export default function Spinner({ color = "#22C55E" }: SpinnerProps) {
  return (
    <div
      className="w-12 h-12 spinner"
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Loading"
    />
  );
}
