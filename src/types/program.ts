import type { AnyLanguage, BindingKey } from './language'
import type { Macro } from './macro'

export type Program<BK extends BindingKey, L extends AnyLanguage<BK>> = {
  language: L
  program: Record<string, unknown>
  macros?: Macro<string, BK, L>[]
}

export type ProgramResult = unknown

export type ProgramRunner<BK extends BindingKey, L extends AnyLanguage<BK>> = {
  run: (program: Program<BK, L>) => ProgramResult
}
