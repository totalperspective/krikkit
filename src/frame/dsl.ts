import { ImmutableFrame } from './immutable';
import type { Frame } from '../types/frame';

/**
 * Creates a new frame with optional initial bindings.
 * @param bindings Optional initial bindings for the frame
 * @returns A new frame with the given bindings
 */
export function frame(bindings: Record<string, unknown> = {}): Frame {
  const f = new ImmutableFrame();
  f.bind(bindings);
  return f;
}

export function resolve<T>(value: T, frame: Frame): unknown {
  if (typeof value === 'string') {
    return frame.resolve(value)
  }
  if (Array.isArray(value)) {
    return value.map(v => resolve(v, frame))
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, resolve(v, frame)]))
  }
  return value
}

export function extend<T extends Record<string, unknown>>(frame: Frame, value: T): Frame {
  return frame.extend().bind(value)
}
