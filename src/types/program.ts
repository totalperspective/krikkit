import type { BindingFormType, Grammar, Language, Statement, ValueReferenceType } from './language'

type ValueReference = string
type BindingForm = {
  [K in string]: BindingForm | ValueReference
}

export type ProgramStatement<
  L extends Language<string[], string, Grammar<string[], never>>,
  S extends Statement<L['allowedKeys'], L['bindingKey']>,
> = S extends ValueReferenceType
  ? ValueReference
  : S extends BindingFormType
    ? BindingForm
    : S extends Grammar<L['allowedKeys'], L['bindingKey']>
      ? {
          [K in keyof S]: S[K] extends Statement<L['allowedKeys'], L['bindingKey']>
            ? ProgramStatement<L, S[K]>
            : never
        }
      : never

type ProgramGrammar<L extends Language<string[], string, Grammar<string[], never>>> = {
  [K in L['allowedKeys'][number]]: K extends L['bindingKey']
    ? BindingForm
    : L['grammar'][K] extends Statement<L['allowedKeys'], L['bindingKey']>
      ? ProgramStatement<L, L['grammar'][K]>
      : never
}

export interface Program<L extends Language<string[], string, Grammar<string[], never>>> {
  language: L
  program: ProgramGrammar<L>
}

export interface ProgramParser<L extends Language<string[], string, Grammar<string[], never>>> {
  parse: (input: object) => Program<L>
}
