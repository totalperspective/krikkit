import { describe, it, expect } from 'vitest'

import { someAspect } from '../aspect/dsl'

import { language, bindingForm, valueReference, argList } from './dsl'

import type { BindingKey, Frame } from '../types'

describe('language DSL', () => {
  describe('type constants', () => {
    it('should have correct type constants', () => {
      expect(bindingForm).toBe('binding-form')
      expect(valueReference).toBe('value-reference')
      expect(argList).toBe('arg-list')
    })
  })

  describe('language creation', () => {
    it('should create a language with no aspects', () => {
      const bindingKey = 'test' as BindingKey
      const result = language(['test', bindingKey], bindingKey, {})

      expect(result.allowedKeys).toEqual(['test', bindingKey])
      expect(result.bindingKey).toBe(bindingKey)
      expect(result.grammar).toEqual({})
      expect(result.aspects).toEqual({})
      expect(result.aspectOrder).toEqual([])
    })

    it('should create a language with aspects', () => {
      const bindingKey = 'test' as BindingKey
      const aspect = someAspect({
        key: 'aspect1',
        apply: (value: unknown, frame: Frame) => frame,
      })

      const result = language(['aspect1', bindingKey], bindingKey, {}, [aspect])

      expect(result.allowedKeys).toEqual(['aspect1', bindingKey])
      expect(result.bindingKey).toBe(bindingKey)
      expect(result.grammar).toEqual({})
      expect(result.aspects).toEqual({ aspect1: aspect })
      expect(result.aspectOrder).toEqual(['aspect1'])
    })

    it('should not allow binding key in aspects', () => {
      const bindingKey = 'test' as BindingKey
      const aspect = someAspect({
        key: bindingKey,
        apply: (value: unknown, frame: Frame) => frame,
      })

      const result = language([bindingKey], bindingKey, {}, [aspect])

      expect(result.aspects).toEqual({})
      expect(result.aspectOrder).toEqual([])
    })
  })
})
