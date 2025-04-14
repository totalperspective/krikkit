import type { AnyLanguage, BindingKey } from '../types/language';
import type { Program } from '../types/program';
import type { Frame } from '../types/frame';
import { extend, resolve } from '../frame';
import { aspects } from '../language';
import { applySomeSomeAspect, keyOfSomeSomeAspect } from '../aspect/dsl';

/**
 * Creates a program from an object and language definition.
 * @param obj The program object
 * @param language The language definition
 * @returns A program that can be run with a frame
 */
export function program<BK extends BindingKey, L extends AnyLanguage<BK>>(
  obj: Record<string, unknown>,
  language: L
): Program<BK, L> {
  return {
    language,
    program: obj
  };
}

/**
 * Runs a program with the given frame.
 * @param program The program to run
 * @param frame The frame to run the program with
 * @returns The resulting frame
 */
export function run<BK extends BindingKey, L extends AnyLanguage<BK>>(
  program: Program<BK, L>,
  frame: Frame
): Frame {
  // Bind program data to frame
  const initialFrame = extend(frame, {
    '@runner': run,
  });

  const someSomeAspects = aspects<BK, L>(program.language);
  // Apply aspects in order
  return someSomeAspects.reduce((frame, someSomeAspect) => {
    const key = keyOfSomeSomeAspect(someSomeAspect);
    const value = program.program[key];
    const resolvedValue = resolve(value, frame) 
    return applySomeSomeAspect(someSomeAspect, resolvedValue, frame);
  }, initialFrame);
}
