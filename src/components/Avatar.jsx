import { initialsOf, resolveMediaUrl } from "../helpers/toolsHelper";

const SIZE_DEFAULT = "h-9 w-9";

export default function Avatar({ name = "", photo = null, className = "" }) {
  const initials = initialsOf(name);
  const sizeClass = className || SIZE_DEFAULT;
  const baseClass =
    "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full";

  if (photo) {
    return (
      <img
        src={resolveMediaUrl(photo)}
        alt={`Foto ${name}`}
        className={`${baseClass} object-cover ${sizeClass}`}
      />
    );
  }

  return (
    <span
      aria-label={`Inisial ${name}`}
      className={`${baseClass} bg-amber-300 font-bold text-indigo-950 ${sizeClass}`}
    >
      {initials}
    </span>
  );
}