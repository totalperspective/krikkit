import { aspect, keyOfSomeAspect, someAspect, someSomeAspect } from '../aspect'

import type {
  Grammar,
  Language,
  SomeAspect,
  BindingKey,
  BindingFormType,
  ArgListType,
  ValueReferenceType,
  AspectFunction,
  ProgramRunner,
  Aspect,
  AnyLanguage,
  SomeSomeAspect,
  NamespaceType,
  SequenceOfType,
} from '../types'
import { resolve, extend } from '../frame'
import type { AnyProgram } from '../types'

const bindingFormAspectFn: AspectFunction<Record<string, unknown>> = (value, frame) => {
  const resolvedValue = resolve(value, frame) as Record<string, unknown>
  return extend(frame, resolvedValue)
}

const sequenceAspectFn: AspectFunction<AnyProgram[]> = (value, frame) => {
  const resolvedValue = resolve('@runner', frame) as ProgramRunner | undefined
  if (!resolvedValue) {
    throw new Error('@runner is not defined')
  }
  return value.reduce((frame, program) => {
    return resolvedValue(program, frame)
  }, frame)
}

const namespaceAspectFn: AspectFunction<Record<string, unknown>> = (value, frame) => {
  const { key } = this as unknown as {key: string}
  const ns = `@${key}`
  return extend(frame, {
    [ns]: value,
  })
}

function isObject(term: unknown): term is object {
  return typeof term === 'object' && term !== null
}

function isSequeceTerm(term: unknown): term is object {
  return Array.isArray(term) && term.length === 2 && term[0] === sequenceOf
}

function isBindingFormTerm(term: unknown): term is object {
  return typeof term === 'string' && term === bindingForm
}

function isNamespaceTerm(term: unknown): term is object {
  return typeof term === 'string' && term === namespace
}

function keysOf(predicate: <T>(term: T) => boolean, grammar: object): string[] {
  let keys: string[] = []
  if (Array.isArray(grammar)) {
    return grammar.filter(isObject).flatMap((grammar) => keysOf(predicate, grammar))
  }
  if (isObject(grammar)) {
    keys = Object.entries(grammar).filter(([, value]) => predicate(value)).map(([key]) => key)
    const otherKeys = Object.keys(grammar).filter(key => !keys.includes(key))
    for (const key of otherKeys) {
      const value = grammar[key as keyof typeof grammar]
      if (isObject(value)) {
        keys.push(...keysOf(predicate, value))
      }
    }
  }
  return keys
}

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
  const sequeceKeys = keysOf(isSequeceTerm, grammar)
  const bindingFormKeys = keysOf(isBindingFormTerm, grammar)
  const namespaceKeys = keysOf(isNamespaceTerm, grammar)

  const sequeceAspects = sequeceKeys.map(key => aspect(key, sequenceAspectFn.bind({key}))).map((aspect) => someAspect(aspect as Aspect<unknown, string>))
  const bindingFormAspects = [bindingKey, ...bindingFormKeys].map(key => aspect(key, bindingFormAspectFn.bind({key}))).map((aspect) => someAspect(aspect as Aspect<unknown, string>))
  const namespaceAspects = namespaceKeys.map(key => aspect(key, namespaceAspectFn.bind({key}))).map((aspect) => someAspect(aspect as Aspect<unknown, string>))

  const aspectsMap = [
    ...namespaceAspects,
    ...bindingFormAspects,
    ...aspects,
    ...sequeceAspects,
  ].reduce((acc, aspect) => {
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
    aspectOrder: [...aspects.map(keyOfSomeAspect), ...sequeceKeys, ...bindingFormKeys],
  }
}

export const bindingForm = 'binding-form' as BindingFormType
export const sequenceOf = 'sequence-of' as SequenceOfType
export const namespace = 'namespace' as NamespaceType
export const valueReference = 'value-reference' as ValueReferenceType
export const argList = 'arg-list' as ArgListType

export function aspects<BK extends BindingKey, L extends AnyLanguage<BK>>(language: L): SomeSomeAspect[] {
  const aspectMap = language.aspects as Record<string, SomeAspect<string>>
  return language.aspectOrder.map(key => aspectMap[key as keyof typeof aspectMap]).map(someSomeAspect)
}
