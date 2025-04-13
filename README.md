# Krikkit

> "The people of Krikkit were simple, straightforward people. They were not given to introspection or self-doubt. They knew what they wanted and they went for it."

Like the people of Krikkit, this meta-language knows exactly what it wants to do with your objects. No introspection, no self-doubt - just clean, efficient processing. When it sees boilerplate, it eliminates it with the same single-minded determination that the Krikkit people showed when they saw the rest of the universe. And when it's time to process? Your objects will move with the same straightforward precision that made the Krikkit Wars the most devastating in galactic history.

Simple, powerful, and with a complete lack of self-doubt, Krikkit knows exactly what it wants to do with your objects - and it's going to do it.

## Core Features

- Key-based processing
- Frame-based state management
- Macro expansion support
- Simple but powerful design

## Processing Model

```pseudo
process obj, key-order, key-impls, context = empty-frame
  obj = expand-all(obj, context)  # Macro expansion
  for each key in key-order
    value = resolve(obj[key], context)  # Current state lookup
    context = do(key-impls, key, value, context)  # Impl handles results in context
```

## Usage

Coming soon...
