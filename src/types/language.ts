import type { SomeAspect } from './aspect'

export type BindingFormType = 'binding-form'
export type ValueReferenceType = 'value-reference'
export type KeyType = BindingFormType | ValueReferenceType

export type Statement<T extends string[], BK extends T[number]> =
  | Grammar<T, BK>
  | [Grammar<T, BK>]
  | KeyType

export type Grammar<T extends string[], BK extends T[number]> = {
  [K in T[number]]?: K extends BK ? BindingFormType : Statement<T, BK>
}

export interface Language<
  T extends string[],
  BK extends T[number],
  G extends Grammar<Exclude<T, BK>, never>,
> {
  allowedKeys: T
  bindingKey: BK
  grammar: G
  aspects: {
    [K in T[number]]?: K extends BK ? SomeAspect<K> : never
  }
  aspectOrder: (keyof this['aspects'])[]
}

export type ExtendLanguage<
  T extends string[],
  BK extends T[number],
  G extends Grammar<Exclude<T, BK>, never>,
  L extends Language<T, BK, G>,
  K extends string[],
> = {
  allowedKeys: [...L['allowedKeys'], ...K]
  bindingKey: L['bindingKey']
  grammar: Grammar<[...Exclude<L['allowedKeys'], L['bindingKey']>, ...K], never>
  aspects: L['aspects'] & {
    [A in K[number]]: A extends BK ? SomeAspect<A> : never
  }
  aspectOrder: [...L['aspectOrder'], ...K][number][]
}

// Add utility types for macro support
export type ExtractBindingKey<T extends string[]> = T extends [infer BK, ...infer _Rest]
  ? BK extends string
    ? BK
    : never
  : never

export type ExtractGrammarKeys<T extends string[], BK extends T[number]> = Exclude<T, BK>

export type AnyLanguage = Language<string[], string, Grammar<string[], never>>

export type AllowedKeysOf<L extends AnyLanguage> = L['allowedKeys']
export type BindingKeyOf<L extends AnyLanguage> = L['bindingKey']
export type GrammarOf<L extends AnyLanguage> = L['grammar']
