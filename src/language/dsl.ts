import { keyOfSomeAspect } from '../aspect'

import type { Grammar, Language, SomeAspect } from '../types'

export function language<
  T extends string[],
  BK extends T[number],
  G extends Grammar<Exclude<T, BK>, never>,
>(
  allowedKeys: T,
  bindingKey: BK,
  grammar: G,
  aspects: SomeAspect<T[number]>[] = []
): Language<T, BK, G> {
  const aspectsMap = aspects.reduce(
    (acc, aspect) => {
      const key = keyOfSomeAspect(aspect)
      return {
        ...acc,
        [key]: aspect,
      }
    },
    {} as {
      [K in T[number]]?: K extends BK ? SomeAspect<K> : never
    }
  )

  return {
    allowedKeys,
    bindingKey,
    grammar,
    aspects: aspectsMap,
    aspectOrder: aspects.map(keyOfSomeAspect),
  }
}
