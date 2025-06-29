import path from 'path';
import fs from 'fs/promises';

/**
 * Checks if the given path is a valid directory.
 *
 * Safely verifies that the input is a non-empty string and that the path exists
 * and points to a directory. Returns `false` for invalid inputs or inaccessible paths.
 *
 * @param {string} path - Filesystem path to check.
 * @returns {Promise<boolean>} Resolves to `true` if the path is a directory, else `false`.
 *
 * @example
 * const isDir = await isDirectory('./logs');
 */
export async function isDirectory(path: string): Promise<boolean> {
  if (typeof path !== 'string' || path.trim() === '') {
    return false;
  }

  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Ensures the parent directory of the given output path exists and is writable.
 *
 * @param {string} outputPath - Full output file path whose parent directory is validated.
 * @throws {Error} If the directory does not exist or is not writable.
 * @example
 * try {
 *   await assertWritablePath(context, './public/spritesheet.svg');
 * } catch(err) {
 *   // Handle or skip file
 * }
 */
export async function assertWritablePath(outputPath: string): Promise<void> {
  const dir = path.dirname(outputPath);

  if (!(await isDirectory(dir))) {
    throw new Error(`Directory "${dir}" does not exist.`);
  }

  try {
    await fs.access(dir, fs.constants.W_OK);
  } catch {
    throw new Error(
      `Cannot write to directory "${dir}". Check your file system permissions and try again.`
    );
  }
}
