import { isNativeError } from "util/types";

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

export function normalizeError(error: unknown): Error {
  if (isNativeError(error)) {
    return error;
  }

  if (typeof error === "string") {
    return new Error(error);
  }

  if (isObject(error) && typeof error.message === "string") {
    return new Error(error.message);
  }

  try {
    return new Error(JSON.stringify(error));
  } catch {
    return new Error(String(error));
  }
}
