import type { Frame } from './frame'

export type AspectFunction<T> = (value: T, frame: Frame) => Frame

/**
 * An Aspect represents a cross-cutting application in the processing model.
 * Aspects are applied to frames in a specific order, each applying its behavior
 * according to its key. This enables consistent processing of objects across
 * different contexts.
 *
 * @template T The type of value that can be applied by this aspect
 */
export interface Aspect<T, K extends string> {
  /**
   * The object property key that this aspect operates on.
   */
  readonly key: K

  /**
   * Creates a new frame with this aspect's behavior applied. The aspect
   * inspects the given value and frame's state, then returns a new frame with
   * the aspect's behavior applied. The original frame remains unchanged.
   *
   * @param value The value to be applied by this aspect
   * @param frame The frame to inspect
   * @returns A new frame with the aspect applied
   */
  apply: AspectFunction<T>
}

/**
 * An existential type that represents an Aspect with an unknown type parameter.
 * This allows working with any Aspect<T> without exposing the specific type T.
 *
 * @example
 * ```typescript
 * const someAspect: SomeAspect = (cb) => cb(new MyAspect<string>())
 * ```
 */
export type SomeAspect<K extends string> = <R>(callback: <T>(aspect: Aspect<T, K>) => R) => R

export type SomeSomeAspect = <R>(callback: <K extends string>(aspect: SomeAspect<K>) => R) => R

export type AnyAspect = SomeSomeAspect
