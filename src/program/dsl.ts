import type { AnyLanguage, BindingKey } from '../types/language';
import type { Program } from '../types/program';
import type { Frame } from '../types/frame';
import { extend, resolve } from '../frame';
import { aspects } from '../language';
import { program as toProgram } from './dsl';
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
  console.debug('[DSL] Creating program with language:', language);
  console.debug('[DSL] Program object:', obj);
  
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
  console.debug('[DSL] Starting program execution');
  console.debug('[DSL] Initial frame:', frame.value);

  // Bind program data to frame
  const initialFrame = extend(frame, {
    '@runner': (subProgram: Program<BK, L>, subFrame: Frame) => run(toProgram<BK, L>(subProgram, program.language), subFrame),
  });
  console.debug('[DSL] Extended frame with runner:', initialFrame.value);

  const someSomeAspects = aspects<BK, L>(program.language);
  console.debug('[DSL] Found aspects:', someSomeAspects.map(keyOfSomeSomeAspect));

  // Apply aspects in order
  return someSomeAspects.reduce((frame, someSomeAspect) => {
    const key = keyOfSomeSomeAspect(someSomeAspect);
    if (!(key in program.program)) {
      return frame;
    }
    const value = program.program[key];
    console.debug(`[DSL] Processing aspect ${someSomeAspect.name} with key ${key}`);
    console.debug(`[DSL] Raw value for ${key}:`, value);
    
    const resolvedValue = resolve(value, frame);
    console.debug(`[DSL] Resolved value for ${key}:`, resolvedValue);
    
    const newFrame = applySomeSomeAspect(someSomeAspect, resolvedValue, frame);
    console.debug(`[DSL] Frame after applying ${someSomeAspect.name}:`, newFrame.value);
    
    return newFrame;
  }, initialFrame);
}
