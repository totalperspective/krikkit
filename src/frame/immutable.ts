import { Map } from 'immutable'

import type { Frame } from '../types'

const notFound = Symbol('not-found')
export class ImmutableFrame implements Frame {
  private readonly parent: Frame | undefined
  private bindings: Map<string, unknown>

  constructor(parent?: Frame) {
    this.parent = parent
    this.bindings = Map()
  }

  bind<T extends Record<string, unknown>>(binding: T): Frame {
    this.bindings = this.bindings.merge(binding)
    return this
  }

  resolve<R>(path: string): R | undefined {
    const value = this.bindings.getIn(path.split('.'), notFound) as R
    if (value === notFound) {
      return this.parent?.resolve<R>(path)
    }
    return value
  }

  extend(): Frame {
    return new ImmutableFrame(this)
  }

  return(): Frame | undefined {
    return this.parent
  }

  provide<T>(path: string, value: T): void {
    const pathParts = path.split('.')
    if (this.bindings.hasIn(pathParts)) {
      this.bindings = this.bindings.setIn(pathParts, value)
      return
    }
    if (!this.parent) {
      throw new Error('Path not found any frame')
    }
    this.parent.provide(path, value)
  }

  private get frameBindings(): Map<string, unknown> {
    let value = Map() as Map<string, unknown>
    if (this.parent) {
      if (this.parent instanceof ImmutableFrame) {
        value = this.parent.frameBindings
      } else {
        value = Map(this.parent.value)
      }
    }
    return value.mergeDeep(this.bindings)
  }

  get value(): Record<string, unknown> {
    return this.frameBindings.toJS()
  }
}
