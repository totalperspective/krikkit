import type { AnyLanguage, BindingKey } from '../types'

// Macro implementations will be exported here

export function macro<BK extends BindingKey, _L extends AnyLanguage<BK>>(
  key: string,
  args: string[] = [],
  body: Record<string, unknown> = {}
): { key: string; args: string[]; body: Record<string, unknown> } {
  return { key, args, body }
}
