import { assetUrl } from "../helpers/apiHelper";
import { getInitial } from "../helpers/toolsHelper";

export default function Avatar({
  name,
  photo,
  className = "h-9 w-9",
  decorative = false,
}) {
  const src = assetUrl(photo);
  if (src) {
    return (
      <img
        src={src}
        alt={decorative ? "" : name}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }
  return (
    <span
      {...(decorative ? { "aria-hidden": "true" } : { "aria-label": name })}
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white`}
    >
      {getInitial(name)}
    </span>
  );
}
