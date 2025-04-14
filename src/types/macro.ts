// Macro types will be defined here

import type {
  Grammar,
  Language,
  AnyLanguage,
  BindingKey,
  ExtendLanguage,
  LanguageKeys,
} from './language'
import type { Program } from './program'

/**
 * Type alias for macro argument specifications.
 * Can be:
 * - true: No arguments required
 * - string: Single named argument
 * - "...": Merge operator (captures all input fields)
 * - string[]: Array of named arguments
 * - [...string[], "..."]: Array of named arguments plus merge operator
 */
export type NoArgs = true
export type SingleArg = string
export type MergeOperator = '...'
export type NamedArgs = string[]
export type NamedArgsWithMerge = [...args: string[], merge: MergeOperator]

export type MacroArgs = NoArgs | SingleArg | MergeOperator | NamedArgs | NamedArgsWithMerge

/**
 * Extracts the named arguments from a MacroArgs type.
 * Returns:
 * - string[] for SingleArg, NamedArgs, or NamedArgsWithMerge
 * - never for NoArgs or MergeOperator
 */
export type ExtractNamedArgs<T extends MacroArgs> = T extends NoArgs
  ? never
  : T extends MergeOperator
    ? never
    : T extends SingleArg
      ? [T]
      : T extends NamedArgs
        ? T
        : T extends NamedArgsWithMerge
          ? T[0]
          : never

/**
 * Type alias for macro default values.
 * Defaults are defined in terms of the macro's arguments.
 */
export type MacroDefaults<T extends MacroArgs> = Partial<
  T extends true
    ? Record<string, never>
    : T extends string
      ? Record<T, unknown>
      : T extends '...'
        ? Record<string, unknown>
        : T extends string[]
          ? Record<T[number], unknown>
          : T extends [...infer A, '...']
            ? Record<Extract<A[number], string>, unknown>
            : never
>

/**
 * A mapped method defines a pattern with named arguments and a binding form.
 * The binding key is a string that determines how the arguments are bound.
 */
export type MappedMethod<
  BK extends BindingKey,
  L extends Language<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>>,
  MethodArgs extends NamedArgs,
  MacroArgs extends NamedArgs,
> = {
  /**
   * The arguments this method expects.
   * These can be any named arguments, not necessarily from the macro's args.
   */
  readonly args: MethodArgs
} & {
  /**
   * The binding form for this method.
   * Must provide bindings for any macro args not in this method's args.
   * Only keys from MacroArgs that are not in MethodArgs are allowed.
   */
  readonly [K in L['bindingKey']]: {
    readonly [P in Exclude<MacroArgs[number], MethodArgs[number]>]?: unknown
  }
}

/**
 * A macro method can be either a simple array of named arguments
 * or a mapped method with a binding form.
 */
export type MacroMethod<
  BK extends BindingKey,
  L extends Language<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>>,
  MacroArgs extends NamedArgs,
  MethodArgs extends NamedArgs = NamedArgs,
> = MethodArgs | MappedMethod<BK, L, MethodArgs, MacroArgs>

/**
 * Type alias for macro template body.
 */
export type MacroBody = Record<string, unknown>

/**
 * A Macro represents a reusable pattern in the timeline language.
 * It defines how to transform input into expanded output using
 * patterns, defaults, and a template body.
 */
export interface Macro<
  Key extends string,
  BK extends BindingKey,
  L extends Language<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>>,
  Args extends MacroArgs = MacroArgs,
> {
  /**
   * The unique identifier for this macro.
   */
  readonly key: Key

  /**
   * The argument specification for this macro.
   */
  readonly args: Args

  /**
   * Default values for arguments if not provided.
   */
  readonly defaults?: MacroDefaults<Args>

  /**
   * The methods this macro can match against.
   * Each method must either provide all macro args directly
   * or bind them through its binding form.
   */
  readonly methods: MacroMethod<BK, L, ExtractNamedArgs<Args>, NamedArgs>[]

  /**
   * The template body to expand when the macro is matched.
   * Uses %argName for substitutions.
   */
  readonly body: MacroBody
}

/**
 * Represents any macro with some binding key and args.
 * This is a proper existential type that hides the specific
 * binding key and args types, only exposing the operations
 * that can be performed on it.
 */
export type SomeMacro = <R>(
  callback: <
    Key extends string,
    BK extends BindingKey,
    L extends Language<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>>,
    Args extends MacroArgs,
  >(
    macro: Macro<Key, BK, L, Args>
  ) => R
) => R

/**
 * A MacroExpander knows how to expand a macro definition into its
 * final form. This is the core behavior of the macro system.
 */
export interface MacroExpander {
  /**
   * Expands the given input using this macro's definition.
   * The expansion process:
   * 1. Matches the input against the macro's patterns
   * 2. Applies any transformations from the matched pattern
   * 3. Substitutes values into the template body
   * 4. Merges any remaining input fields if specified
   *
   * @param macro The macro to use for expansion
   * @param program The program to expand
   * @returns The expanded result
   */
  expand<BK extends BindingKey, L1 extends AnyLanguage<BK>, L2 extends WithMacro<BK, L1, string>>(
    macro: SomeMacro,
    program: Program<BK, L2>
  ): Program<BK, L1>
}

export type MacroKey = 'args' | 'defaults' | 'methods' | 'body'

export type MacroLanguage<BK extends BindingKey> = Language<
  [...MacroKey[], BK],
  BK,
  Grammar<[...MacroKey[], BK], BK>
>

export interface MacroParser {
  /**
   * Parses a macro definition from a string.
   * @param input The input string to parse
   * @returns The parsed macro definition
   */
  parse<BK extends BindingKey, L extends AnyLanguage<BK>>(
    input: Program<BK, L>
  ): Macro<string, BK, L, string[]>
}

export type WithMacro<
  BK extends BindingKey,
  L extends Language<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>>,
  MacroKey extends string,
> = ExtendLanguage<LanguageKeys<BK>, BK, Grammar<LanguageKeys<BK>, BK>, L, [MacroKey]>
