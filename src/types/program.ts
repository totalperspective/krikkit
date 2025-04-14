import { Frame } from './frame'
import type { AnyLanguage, BindingKey } from './language'
import type { Macro } from './macro'

export type Program<BK extends BindingKey, L extends AnyLanguage<BK>> = {
  language: L
  program: Record<string, unknown>
  macros?: Macro<string, BK, L>[]
}

export type AnyProgram = Program<BindingKey, AnyLanguage<BindingKey>>

export type ProgramRunner = (program: AnyProgram, frame: Frame) => Frame
