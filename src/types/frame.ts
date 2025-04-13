/**
 * A Frame represents a processing context with a value and aspects that can be
 * applied to it. Frames are immutable - all operations return new frames.
 */
export interface Frame {
  /**
   * The value contained in this frame.
   */
  readonly value: Record<string, unknown>

  /**
   * Resolves a value from the frame's context using a dot-notation path.
   * The path is used to traverse nested objects in the context.
   *
   * @param path The dot-notation path to resolve (e.g. 'user.profile.name')
   * @returns The value at the specified path, cast to type T
   *
   * @example
   * ```typescript
   * const name = frame.resolve<string>('user.profile.name')
   * const age = frame.resolve<number>('user.profile.age')
   * ```
   */
  resolve<R>(path: string): R

  /**
   * Creates a new frame that shadows this one. The new frame starts empty
   * but can access all state from its parent frames through shadowing.
   * @returns A new empty frame that shadows this one
   */
  extend(): Frame

  /**
   * Returns the parent frame in the shadowing hierarchy. Returns undefined
   * for the root frame.
   * @returns The parent frame or undefined if this is the root frame
   */
  return(): Frame | undefined

  /**
   * Binds an object to this frame, making it available for processing.
   * The object becomes part of the frame's state and can be accessed
   * by aspects during processing.
   * @param value The object to bind to this frame
   */
  bind<T extends Record<string, unknown>>(value: T): void

  /**
   * Provides a value at a specific path in the frame's state. This is
   * the only way to mutate a frame's state. The path is used to
   * locate the value during processing.
   * @param path The path where the value should be stored
   * @param value The value to store at the path
   */
  provide<T>(path: string, value: T): void
}
