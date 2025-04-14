import type { AnyLanguage, BindingKey, Language, LanguageKeys } from '../types'

export function createLanguage<BK extends BindingKey>(
  allowedKeys: LanguageKeys<BK>,
  bindingKey: BK,
  grammar: AnyLanguage<BK>['grammar'],
  aspects: AnyLanguage<BK>['aspects'] = {},
  aspectOrder: AnyLanguage<BK>['aspectOrder'] = []
): Language<LanguageKeys<BK>, BK, AnyLanguage<BK>['grammar']> {
  return {
    allowedKeys,
    bindingKey,
    grammar,
    aspects,
    aspectOrder,
  }
}

export function extendLanguage<BK extends BindingKey, L extends AnyLanguage<BK>>(
  language: L,
  newKeys: string[]
): AnyLanguage<BK> {
  return {
    ...language,
    allowedKeys: [...language.allowedKeys, ...newKeys, language.bindingKey],
    grammar: {
      ...language.grammar,
    },
  }
}
