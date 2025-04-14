import { keyOfSomeAspect } from '../aspect'

import type {
  Grammar,
  Language,
  SomeAspect,
  BindingKey,
  BindingFormType,
  ArgListType,
  ValueReferenceType,
} from '../types'

export function language<
  T extends [...string[], BK],
  BK extends BindingKey,
  G extends Grammar<T, BK>,
>(
  allowedKeys: T,
  bindingKey: BK,
  grammar: G,
  aspects: SomeAspect<T[number]>[] = []
): Language<T, BK, G> {
  type AspectsMap = {
    [K in T[number]]?: K extends BK ? never : SomeAspect<K>
  }
  const aspectsMap = aspects.reduce((acc, aspect) => {
    const key = keyOfSomeAspect(aspect)
    return {
      ...acc,
      [key]: aspect,
    }
  }, {} as AspectsMap)

  return {
    allowedKeys,
    bindingKey,
    grammar,
    aspects: aspectsMap,
    aspectOrder: aspects.map(keyOfSomeAspect),
  }
}

export const bindingForm = 'binding-form' as BindingFormType
export const valueReference = 'value-reference' as ValueReferenceType
export const argList = 'arg-list' as ArgListType
