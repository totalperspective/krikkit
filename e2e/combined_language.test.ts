import { describe, test, expect } from 'vitest';
import { Language, Program } from '../src';

describe('Combined Language Tests', () => {
  // Define a validation DSL with both aspects and macros
  const validationLang = new Language({
    name: 'validation',
    aspects: {
      validation: {
        before: (ctx) => {
          if (ctx.operation === 'validate') {
            console.log(`Validating ${ctx.params[0]}`);
          }
        },
        after: (ctx) => {
          if (ctx.operation === 'validate') {
            console.log(`Validation complete for ${ctx.params[0]}`);
          }
        },
      },
    },
    macros: {
      // Macro to define a validation rule
      rule: {
        pattern: /rule\s+(\w+)\s*{([^}]*)}/,
        transform: (match) => {
          const [_, name, content] = match;
          return `validators.${name} = (value) => { ${content} }`;
        },
      },
      // Macro to create a validation group
      group: {
        pattern: /group\s+(\w+)\s*{([^}]*)}/,
        transform: (match) => {
          const [_, name, content] = match;
          return `validationGroups.${name} = [${content}]`;
        },
      },
    },
    operations: {
      validate: {
        type: 'function',
        params: ['value', 'validator'],
        body: (value, validator) => validator(value),
      },
    },
  });

  test('should use aspects and macros for complex validation', () => {
    const env = new Program().env({
      validators: {},
      validationGroups: {},
    });

    const validation = validationLang.program(`
      rule email {
        return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
      }

      rule password {
        return value.length >= 8 && /[A-Z]/.test(value) && /[0-9]/.test(value);
      }

      group userValidation {
        validate(value.email, validators.email)
        validate(value.password, validators.password)
      }
    `);

    const input = {
      email: 'test@example.com',
      password: 'Password123',
    };

    const result = validation.run(input, env);
    expect(result).toEqual({
      email: true,
      password: true,
    });
  });

  test('should handle validation errors with aspects', () => {
    const env = new Program().env({
      validators: {
        email: (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value),
      },
    });

    const validation = validationLang.program(`
      validate(value.email, validators.email)
    `);

    const input = {
      email: 'invalid-email',
    };

    const result = validation.run(input, env);
    expect(result).toEqual({
      email: false,
    });
  });
}); 