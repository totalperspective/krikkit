import type { SomeAspect } from './aspect'

export type BindingFormType = 'binding-form' & {
  __brand: 'binding-form'
}

export type ValueReferenceType = 'value-reference' & {
  __brand: 'value-reference'
}

export type ArgListType = 'arg-list' & {
  __brand: 'arg-list'
}

export type KeyType = BindingFormType | ValueReferenceType | ArgListType

export type BindingKey = string & {
  __brand: 'binding-key'
}

export type CreateBindingKey<T extends string> = T & { __brand: 'binding-key' }

export type LanguageKeys<BK extends BindingKey> = [...string[], BK]

export type AnyGrammar<BK extends BindingKey> = Grammar<LanguageKeys<BK>, BK>

export type Statement<T extends LanguageKeys<BK>, BK extends BindingKey> =
  | Grammar<T, BK>
  | ['sequence-of', Grammar<T, BK>]
  | ['union-of', Grammar<T, BK>, Grammar<T, BK>]
  | KeyType

export type Grammar<T extends LanguageKeys<BK>, BK extends BindingKey> = {
  [K in Exclude<T[number], BK>]?: K extends 'args' ? ArgListType : Statement<T, BK>
} & {
  [K in BK]?: BindingFormType
}

export interface Language<
  T extends LanguageKeys<BK>,
  BK extends BindingKey,
  G extends Grammar<T, BK>,
> {
  allowedKeys: T
  bindingKey: BK
  grammar: G
  aspects: {
    [K in T[number]]?: K extends BK ? never : SomeAspect<K>
  }
  aspectOrder: (keyof this['aspects'])[]
}

export type ExtendLanguage<
  T extends LanguageKeys<BK>,
  BK extends BindingKey,
  G extends Grammar<T, BK>,
  L extends Language<T, BK, G>,
  _K extends string[],
> = {
  allowedKeys: [...L['allowedKeys'], ..._K, BK]
  bindingKey: L['bindingKey']
  grammar: Grammar<[...L['allowedKeys'], ..._K, BK], BK>
  aspects: L['aspects']
  aspectOrder: L['aspectOrder']
}

// Add utility types for macro support
export type ExtractBindingKey<T extends string[]> = T extends [infer BK, ...infer _Rest]
  ? BK extends string
    ? BK & { __brand: 'binding-key' }
    : never
  : never

export type ExtractGrammarKeys<T extends string[], BK extends T[number]> = Exclude<T, BK>

export type AnyLanguage<BK extends BindingKey> = Language<LanguageKeys<BK>, BK, AnyGrammar<BK>>

export type AllowedKeysOf<BK extends BindingKey, L extends AnyLanguage<BK>> = L['allowedKeys']
export type AllowedKeyOf<
  BK extends BindingKey,
  L extends AnyLanguage<BK>,
> = L['allowedKeys'][number]
export type BindingKeyOf<BK extends BindingKey, L extends AnyLanguage<BK>> = L['bindingKey']
export type GrammarOf<BK extends BindingKey, L extends AnyLanguage<BK>> = L['grammar']
