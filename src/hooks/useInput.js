import { useState } from "react";

// Two-way binding: const [value, onChange, setValue] = useInput("")
export default function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);
  const onChange = (event) => setValue(event.target.value);
  return [value, onChange, setValue];
}
