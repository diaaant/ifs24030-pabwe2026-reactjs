import { describe, it, expect } from "vitest";
import { act, renderHook } from "@testing-library/react";
import useInput from "./useInput";

describe("useInput", () => {
  it("memakai nilai awal kosong secara default", () => {
    const { result } = renderHook(() => useInput());
    expect(result.current[0]).toBe("");
  });

  it("memperbarui nilai lewat onChange dan setValue", () => {
    const { result } = renderHook(() => useInput("a"));
    expect(result.current[0]).toBe("a");
    act(() => result.current[1]({ target: { value: "b" } }));
    expect(result.current[0]).toBe("b");
    act(() => result.current[2]("c"));
    expect(result.current[0]).toBe("c");
  });
});
