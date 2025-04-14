import type { SomeAspect } from '../types/aspect'
import type { Frame } from '../types/frame'
import type { AnyLanguage, BindingKey } from '../types/language'
import type { Program, ProgramResult, ProgramRunner } from '../types/program'

export function createProgramRunner<
  BK extends BindingKey,
  L extends AnyLanguage<BK>,
>(): ProgramRunner<BK, L> {
  return {
    run: (program: Program<BK, L>): ProgramResult => {
      // Create initial frame with program data
      const initialFrame: Frame = {
        value: program.program,
        resolve: <R>(path: string): R => {
          const parts = path.split('.')
          let current: Record<string, unknown> = program.program
          for (const part of parts) {
            if (typeof current !== 'object' || current === null) {
              throw new Error(`Invalid path: ${path}`)
            }
            current = current[part] as Record<string, unknown>
          }
          return current as R
        },
        extend: () => ({ ...initialFrame, value: {} }),
        return: () => undefined,
        bind: (value: Record<string, unknown>) => {
          Object.assign(initialFrame.value, value)
        },
        provide: <T>(path: string, value: T): void => {
          const parts = path.split('.')
          let current: Record<string, unknown> = initialFrame.value
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i]
            if (!(part in current)) {
              current[part] = {}
            }
            current = current[part] as Record<string, unknown>
          }
          current[parts[parts.length - 1]] = value
        },
      }

      // Apply aspects in order
      let currentFrame = initialFrame
      for (const key of program.language.aspectOrder) {
        const aspect = program.language.aspects[key as keyof L['aspects']] as
          | SomeAspect<string>
          | undefined
        if (aspect) {
          aspect(<T>(a: { apply: (value: T, frame: Frame) => Frame }) => {
            currentFrame = a.apply(program.program as T, currentFrame)
          })
        }
      }

      return currentFrame.value
    },
  }
}
