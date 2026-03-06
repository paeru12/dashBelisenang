
import { Input } from "@/components/ui/input";
export default function InputField({ label, error, onChange, ...props }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <Input
        {...props}
        className={`mt-2 ${error ? "border-red-500" : ""}`}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && (
        <p className="text-xs text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
}