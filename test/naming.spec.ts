import { expect, test, describe } from "vitest";
import { toEnumKey, toEnumValue } from "../src/helpers/naming";

describe("converts a string to a valid enum key", () => {
  test("returns underscore if input and prefix are empty or symbols", () => {
    expect(toEnumKey("", "")).toBe("_");
    expect(toEnumKey("@!%", "$&#")).toBe("_");
  });

  test("replaces a forward slash for a hyphen", () => {
    expect(toEnumKey("a/b/c")).toBe("A_B_C");
  });

  test("prepends an underscore if it starts with a digit", () => {
    expect(toEnumKey("123abc")).toBe("_123ABC");
  });

  test("adds prefix and sanitizes", () => {
    expect(toEnumKey("abc", "123")).toBe("_123_ABC");
  });

  test("handles special characters and multiple spaces", () => {
    expect(toEnumKey("@1/2\\3!%a_B-c")).toBe("_1_2_3_A_B_C");
    expect(toEnumKey("crème brûlée")).toBe("CRÈME_BRÛLÉE");
  });
});

describe("converts a string to a valid enum value", () => {
  test("does not modify a lowercase string", () => {
    expect(toEnumValue("abc")).toBe("abc");
  });

  test("uppercase string is converted to lowercase", () => {
    expect(toEnumValue("ABC")).toBe("abc");
  });

  test("replaces non-alphanumeric characters with a hyphen", () => {
    expect(toEnumValue("a/b@c")).toBe("a-b-c");
  });

  test("handles PascalCase", () => {
    expect(toEnumValue("MyFile")).toBe("my-file");
  });

  test("handles digits adjacent to uppercase characters", () => {
    expect(toEnumValue("version1Final")).toBe("version-1-final");
  });

  test("handles special characters and multiple spaces", () => {
    expect(toEnumValue("@1/2\\3!%a_B-c")).toBe("1-2-3-a-b-c");
    expect(toEnumValue("CRÈME_BRÛLÉE")).toBe("crème-brûlée");
  });
});
