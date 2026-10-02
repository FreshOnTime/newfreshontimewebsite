import "./spinner.css";

interface SpinnerProps {
  color?: string;
}

export default function Spinner({ color = "#173F2A" }: SpinnerProps) {
  return (
    <div
      className="w-12 h-12 spinner"
      style={{ borderTopColor: color }}
      role="status"
      aria-label="Loading"
    />
  );
}
