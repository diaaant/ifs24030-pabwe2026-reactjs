import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

URL.createObjectURL = vi.fn(() => "blob:preview");
URL.revokeObjectURL = vi.fn();
