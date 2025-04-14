import * as lang from '../language/dsl'

import type { MacroLanguage, CreateBindingKey, MacroKey, Grammar } from '../types'

export function macroLanguage<K extends string>(
  bindingKeyName: K
): MacroLanguage<CreateBindingKey<K>> {
  const bindingKey = bindingKeyName as CreateBindingKey<K>
  return {
    allowedKeys: [...(['args', 'defaults', 'methods', 'body'] as MacroKey[]), bindingKey],
    bindingKey,
    grammar: {
      [bindingKey]: lang.bindingForm,
      args: lang.argList,
      defaults: [{}],
    } as Grammar<[...MacroKey[], CreateBindingKey<K>], CreateBindingKey<K>>,
    aspects: {},
    aspectOrder: [],
  }
}
