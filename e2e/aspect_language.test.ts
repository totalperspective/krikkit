/**
 * This test implements a pipeline language with aspect-oriented processing.
 * 
 * Language Structure:
 * {
 *   config: {  // Expression library (binding-form)
 *     math: {
 *       square: 'a * a',
 *       double: 'a * 2',
 *       add: 'a + b',
 *       identity: 'a'
 *     },
 *     predicates: {
 *       isEven: 'a % 2 == 0',
 *       isOdd: 'a % 2 != 0',
 *       greaterThan: 'a > b'
 *     },
 *     threshold: 10
 *   },
 *   steps: [          // Sequence of operations
 *     {
 *       transform: {  // Transform operation
 *         expression: '@config.math.square'
 *       }
 *     },
 *     {
 *       filter: {     // Filter operation
 *         expression: '@config.predicates.isEven'
 *       }
 *     },
 *     {
 *       when: {       // Conditional processing
 *         condition: '@config.predicates.greaterThan',
 *         args: ['@input', '@config.threshold'],
 *         consequent: '@config.math.double',
 *         antecedent: '@config.math.identity'
 *       }
 *     }
 *   ]
 * }
 * 
 * Expected Behavior:
 * Given input [1, 2, 3, 4, 5, 6]:
 * 
 * The pipeline will:
 * 1. Square all numbers: [1, 4, 9, 16, 25, 36]
 * 2. Keep only the even numbers: [4, 16, 36]
 * 3. For each number, compare it with threshold (10):
 *    - Numbers ≤ 10 (4) are kept as is
 *    - Numbers > 10 (16, 36) are doubled
 * 
 * Final output: [4, 32, 72]
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
          console.log('exprStr', exprStr);
          const expr = parser.parse(exprStr);
          const fn = expr.toJSFunction('a');
          
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
          console.log('exprStr', exprStr);
          const expr = parser.parse(exprStr);
          const fn = expr.toJSFunction('a');
          
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
          
          const conditionFn = conditionExpr.toJSFunction('a,b');
          const consequentFn = consequentExpr.toJSFunction('a');
          const antecedentFn = antecedentExpr.toJSFunction('a');
          
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
          square: 'a * a',
          double: 'a * 2',
          add: 'a + b',
          identity: 'a'
        },
        predicates: {
          isEven: 'a % 2 == 0',
          isOdd: 'a % 2 != 0',
          greaterThan: 'a > b'
        },
        threshold: 10
      },
      steps: [
        {
          transform: { expression: '@config.math.square' }
        },
        {
          filter: { expression: '@config.predicates.isEven' }
        },
        {
          when: {
            condition: '@config.predicates.greaterThan',
            args: ['@input', '@config.threshold'],
            consequent: '@config.math.double',
            antecedent: '@config.math.identity'
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
    expect(pipeline).toHaveLength(3);
    const input = [1, 2, 3, 4, 5, 6];
    const output = input
      .map(x => pipeline.reduce((value, step) => value === undefined ? undefined : step(value), x))
      .filter((x): x is number => x !== undefined);

    expect(output).toEqual([4, 32, 72]);
  });
});
