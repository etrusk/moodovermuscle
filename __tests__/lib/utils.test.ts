import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('joins multiple class names into a single string', () => {
    expect(cn('foo', 'bar', 'baz')).toBe('foo bar baz')
  })

  it('removes falsy values', () => {
    expect(cn(false && 'foo', 'bar')).toBe('bar')
  })

  it('merges Tailwind classes and removes duplicates', () => {
    const result = cn('p-2', 'p-4', 'p-2', 'text-center', 'text-left')
    // Tailwind-merge should keep the last conflicting utility
    expect(result).toBe('p-2 text-left')
  })
})