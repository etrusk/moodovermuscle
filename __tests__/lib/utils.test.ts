import { cn } from '@/lib/utils'

describe('cn utility', () => {
  it('joins multiple class names into a single string', () => {
    // Arrange
    const classNames = ['foo', 'bar', 'baz']

    // Act
    const result = cn('foo', 'bar', 'baz')

    // Assert
    expect(result).toBe('foo bar baz')
  })

  it('removes falsy values', () => {
    // Arrange
    const falsyValue = false && 'foo'
    const validValue = 'bar'

    // Act
    const result = cn(falsyValue, validValue)

    // Assert
    expect(result).toBe('bar')
  })

  it('merges Tailwind classes and removes duplicates', () => {
    // Arrange
    const conflictingClasses = ['p-2', 'p-4', 'p-2', 'text-center', 'text-left']

    // Act
    const result = cn('p-2', 'p-4', 'p-2', 'text-center', 'text-left')

    // Assert
    // Tailwind-merge should keep the last conflicting utility
    expect(result).toBe('p-2 text-left')
  })
})