import type {
  AllowedKeysOf,
  AnyLanguage,
  Aspect,
  AspectFunction,
  BindingKey,
  Frame,
  SomeAspect,
  SomeSomeAspect,
} from '../types'

export function aspect<
  BK extends BindingKey,
  L extends AnyLanguage<BK>,
  K extends AllowedKeysOf<BK, L>[number],
  T,
>(key: K, apply: AspectFunction<T>): Aspect<T, K> {
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

export function applySomeAspect<T, K extends string>(someAspect: SomeAspect<K>, value: T, frame: Frame): Frame {
  return someAspect(<A>(aspect: Aspect<A, K>) => aspect.apply(value as unknown as A, frame))
}

export function applySomeSomeAspect<T>(someSomeAspect: SomeSomeAspect, value: T, frame: Frame): Frame {
  return someSomeAspect(<K extends string>(someAspect: SomeAspect<K>) => applySomeAspect(someAspect, value, frame))
}
