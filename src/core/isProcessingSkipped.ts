import type { SvgSpritesheetPluginContext, SpriteMapEntry } from '../types';

export function isProcessingSkipped(
  context: SvgSpritesheetPluginContext,
  entry: SpriteMapEntry | undefined,
  currentHash: string,
  layerIndex: number
): boolean {
  if (!entry) {
    return false;
  }

  // Skip processing as it is overwritten by another layer
  if (entry.layerIndex > layerIndex) {
    context.logger.warn(
      `Skipping processing, as it is overwritten by another layer: ${entry.spriteId}`
    );
    return true;
  }

  // Skip processing as its contents are the same
  if (entry.hash === currentHash) {
    context.logger.warn(
      `Skipping processing, as its contents are the same: ${entry.spriteId}`
    );
    return true;
  }

  return false;
}
