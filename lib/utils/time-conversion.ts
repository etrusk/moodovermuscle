/**
 * Time Conversion Utilities
 * 
 * Shared utilities for converting between 12-hour and 24-hour time formats.
 * Used across booking forms and API validation.
 */

/**
 * Convert 12-hour format time (e.g., "10:00 AM") to 24-hour format (e.g., "10:00")
 * 
 * @param time12 - Time string in 12-hour format with AM/PM
 * @returns Time string in 24-hour HH:MM format
 * 
 * @example
 * convertTo24HourFormat("10:00 AM") // "10:00"
 * convertTo24HourFormat("02:30 PM") // "14:30"
 * convertTo24HourFormat("12:00 PM") // "12:00"
 * convertTo24HourFormat("12:00 AM") // "00:00"
 */
export function convertTo24HourFormat(time12: string): string {
  // If already in 24-hour format, return as-is
  if (!time12.includes('AM') && !time12.includes('PM')) {
    return time12
  }
  
  const [time, period] = time12.split(' ')
  const [hoursNum, minutes] = time.split(':').map(Number)
  let hours = hoursNum
  
  if (period === 'AM' && hours === 12) {
    hours = 0
  } else if (period === 'PM' && hours !== 12) {
    hours += 12
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}