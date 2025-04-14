/**
 * This test implements a pipeline language with aspect-oriented processing.
 * 
 * Language Structure:
 * {
 *   config: {  // Expression library (binding-form)
 *     math: {
 *       double: '$0 * 2',
 *       square: '$0 * $0',
 *       add: '$0 + $1',
 *       identity: '$0'
 *     },
 *     predicates: {
 *       isEven: '$0 % 2 === 0',
 *       isOdd: '$0 % 2 !== 0',
 *       greaterThan: '$0 > $1'
 *     },
 *     threshold: 10
 *   },
 *   steps: [          // Sequence of operations
 *     {
 *       transform: {  // Transform operation
 *         expression: 'config.math.double'
 *       }
 *     },
 *     {
 *       filter: {     // Filter operation
 *         expression: 'config.predicates.isEven'
 *       }
 *     },
 *     {
 *       when: {       // Conditional processing
 *         condition: 'config.predicates.greaterThan',
 *         args: ['@input', 'config.threshold'],
 *         consequent: 'config.math.double',
 *         antecedent: 'config.math.identity'
 *       }
 *     }
 *   ]
 * }
 * 
 * Expected Behavior:
 * Given input [1, 2, 3, 4, 5, 6]:
 * 
 * The pipeline will:
 * 1. Double all numbers: [2, 4, 6, 8, 10, 12]
 * 2. Keep only the even numbers: [4, 6, 8, 10, 12]
 * 3. For each number, compare it with threshold (10):
 *    - Numbers ≤ 10 (4, 6, 8, 10) are kept as is
 *    - Numbers > 10 (12) are doubled
 * 
 * Final output: [4, 6, 8, 10, 24]
 */

import { describe, test, expect } from 'vitest';
import krikkit from '../src';

import type { CreateBindingKey, Frame } from '../src/types';
import { Parser } from 'expr-eval';

type Step<T> = (input: T) => T | undefined;
type Pipeline<T> = Step<T>[];

describe('Aspect-Oriented Language Tests', () => {
  // Create a shared expression parser
  const parser = new Parser();

  // Define a pipeline DSL with aspects
  const bindingKey = 'bind' as CreateBindingKey<'config'>;
  const pipelineLang = krikkit.language(
    ['config', 'steps', 'transform', 'filter', 'when', bindingKey],
    bindingKey,
    {
      config: krikkit.namespace,
      steps: [krikkit.sequenceOf, {
        transform: krikkit.bindingForm,
        filter: krikkit.bindingForm,
        when: krikkit.bindingForm,
      }],
    },
    [
      // Transform aspect - handles resolved values
      krikkit.someAspect(
        krikkit.aspect('transform', (value: { expression: string }, frame: Frame) => {
          const pipeline = frame.resolve<Pipeline<number>>('@pipeline');
          const exprStr = frame.resolve<string>(value.expression);
          const expr = parser.parse(exprStr);
          const fn = expr.toJSFunction('$0');
          
          const newPipeline = [...pipeline, fn];
          frame.provide('@pipeline', newPipeline);
          return frame;
        })
      ),

      // Filter aspect - handles resolved values
      krikkit.someAspect(
        krikkit.aspect('filter', (value: { expression: string }, frame: Frame) => {
          const pipeline = frame.resolve<Pipeline<number>>('@pipeline');
          const exprStr = frame.resolve<string>(value.expression);
          const expr = parser.parse(exprStr);
          const fn = expr.toJSFunction('$0');
          
          const newPipeline = [...pipeline, (input) => fn(input) ? input : undefined];
          frame.provide('@pipeline', newPipeline);
          return frame;
        })
      ),

      // When aspect - handles resolved values
      krikkit.someAspect(
        krikkit.aspect('when', (value: { 
          condition: string;
          args: string[];
          consequent: string;
          antecedent: string;
        }, frame: Frame) => {
          const pipeline = frame.resolve<Pipeline<number>>('@pipeline');
          
          const conditionStr = frame.resolve<string>(value.condition);
          const consequentStr = frame.resolve<string>(value.consequent);
          const antecedentStr = frame.resolve<string>(value.antecedent);
          
          const conditionExpr = parser.parse(conditionStr);
          const consequentExpr = parser.parse(consequentStr);
          const antecedentExpr = parser.parse(antecedentStr);
          
          const conditionFn = conditionExpr.toJSFunction('$0,$1');
          const consequentFn = consequentExpr.toJSFunction('$0');
          const antecedentFn = antecedentExpr.toJSFunction('$0');
          
          // Resolve all args except @input
          const resolvedArgs = value.args.map(arg => 
            arg === '@input' ? arg : frame.resolve<number>(arg)
          );
          
          const newPipeline = [...pipeline, (input) => {
            // Replace @input with actual input value
            const args = resolvedArgs.map(arg => 
              arg === '@input' ? input : arg
            );
            return conditionFn(...args) 
              ? consequentFn(input)
              : antecedentFn(input);
          }];
          
          frame.provide('@pipeline', newPipeline);
          return frame;
        })
      ),
    ]
  );

  test('should create pipeline with transform, filter, and conditional processing', () => {
    // Create the program
    const prog = krikkit.program<CreateBindingKey<'config'>, typeof pipelineLang>({
      config: {
        math: {
          double: '$0 * 2',
          square: '$0 * $0',
          add: '$0 + $1',
          identity: '$0'
        },
        predicates: {
          isEven: '$0 % 2 === 0',
          isOdd: '$0 % 2 !== 0',
          greaterThan: '$0 > $1'
        },
        threshold: 10
      },
      steps: [
        {
          transform: { expression: 'config.math.double' }
        },
        {
          filter: { expression: 'config.predicates.isEven' }
        },
        {
          when: {
            condition: 'config.predicates.greaterThan',
            args: ['@input', 'config.threshold'],
            consequent: 'config.math.double',
            antecedent: 'config.math.identity'
          }
        }
      ]
    }, pipelineLang);

    // Create initial frame with empty pipeline
    const initFrame = krikkit.frame({ '@pipeline': [] });

    // Run the program
    const resultFrame = krikkit.run(prog, initFrame);

    // Get the pipeline and run it on test input
    const pipeline = resultFrame.resolve<Pipeline<number>>('@pipeline');
    const input = [1, 2, 3, 4, 5, 6];
    const output = input
      .map(x => pipeline.reduce((value, step) => value === undefined ? undefined : step(value), x))
      .filter((x): x is number => x !== undefined);

    expect(output).toEqual([4, 6, 8, 10, 24]);
  });
});
