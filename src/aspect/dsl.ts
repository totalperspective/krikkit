import type {
  AllowedKeysOf,
  AnyLanguage,
  Aspect,
  AspectFunction,
  SomeAspect,
  SomeSomeAspect,
} from '../types'

export function aspect<L extends AnyLanguage, K extends AllowedKeysOf<L>[number], T>(
  key: K,
  apply: AspectFunction<T>
): Aspect<T, K> {
  return {
    key,
    apply,
  }
}

export function someAspect<K extends string>(aspect: Aspect<unknown, K>): SomeAspect<K> {
  return (cb) => cb(aspect)
}

export function someSomeAspect<K extends string>(aspect: SomeAspect<K>): SomeSomeAspect {
  return (cb) => cb(aspect)
}

export function keyOfSomeAspect<K extends string>(someAspect: SomeAspect<K>): K {
  return someAspect((aspect) => aspect.key)
}

export function keyOfSomeSomeAspect(someSomeAspect: SomeSomeAspect): string {
  return someSomeAspect(keyOfSomeAspect)
}
