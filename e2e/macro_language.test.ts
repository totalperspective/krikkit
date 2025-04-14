import { describe, test, expect } from 'vitest';
import { Language, Program } from '../src';

describe('Macro-Based Language Tests', () => {
  // Define a configuration DSL with macros
  const configLang = new Language({
    name: 'config',
    macros: {
      // Macro to create a nested configuration section
      section: {
        pattern: /section\s+(\w+)\s*{([^}]*)}/,
        transform: (match) => {
          const [_, name, content] = match;
          return `config.${name} = { ${content} }`;
        },
      },
      // Macro to create a repeated configuration pattern
      repeat: {
        pattern: /repeat\s+(\d+)\s+times\s*{([^}]*)}/,
        transform: (match) => {
          const [_, count, content] = match;
          return Array(parseInt(count))
            .fill(content)
            .join('\n');
        },
      },
    },
    operations: {
      set: {
        type: 'function',
        params: ['key', 'value'],
        body: (config, key, value) => {
          config[key] = value;
          return config;
        },
      },
    },
  });

  test('should use section macro to create nested configuration', () => {
    const env = new Program().env({});
    const config = configLang.program(`
      section database {
        set host "localhost"
        set port 5432
      }
      section api {
        set endpoint "/v1"
        set timeout 5000
      }
    `);

    const result = config.run({}, env);
    expect(result).toEqual({
      database: {
        host: "localhost",
        port: 5432,
      },
      api: {
        endpoint: "/v1",
        timeout: 5000,
      },
    });
  });

  test('should use repeat macro to generate multiple configurations', () => {
    const env = new Program().env({});
    const config = configLang.program(`
      repeat 3 times {
        set service "service_${index}"
        set port ${8000 + index}
      }
    `);

    const result = config.run({}, env);
    expect(result).toEqual({
      service: "service_0",
      port: 8000,
      service_1: "service_1",
      port_1: 8001,
      service_2: "service_2",
      port_2: 8002,
    });
  });
}); 