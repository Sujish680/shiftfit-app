/**
 * checkShift.test.js
 * Golden-master parity tests for the ShiftFit decision logic.
 *
 * Strategy: load the ORIGINAL Assessment 2 implementation (js/check.js) via
 * Node's vm module (no modifications to the original file) and run it against
 * the same inputs as the React port (src/lib/checkShift.js).  Every test
 * asserts that verdict, summary and explanations are identical.
 *
 * Run: npm test  (or: npx vitest run)
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { createContext, runInNewContext } from 'vm'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { checkShift } from './checkShift.js'

// Load the ORIGINAL Assessment 2 implementation without modifying it.
const __dirname = dirname(fileURLToPath(import.meta.url))
const originalCode = readFileSync(join(__dirname, '../../../js/check.js'), 'utf8')
const sandbox = { console }
createContext(sandbox)
runInNewContext(originalCode, sandbox)
const originalCheckShift = sandbox.checkShift

const empty = { classes: [], assessments: [], studyBlocks: [], workShifts: [] }
const DASH = '\u2013'
const FRI = '2026-10-16' // Friday

function expectParity(result, original) {
  expect(result.verdict).toBe(original.verdict)
  expect(result.summary).toBe(original.summary)
  expect(result.explanations).toEqual(original.explanations)
}

describe('checkShift parity with Assessment 2 original', () => {

  it('1. Good Fit with no overlapping commitments', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '17:00' }
    const result = checkShift(proposed, empty)
    const original = originalCheckShift(proposed, empty)
    expect(result.verdict).toBe('Good Fit')
    expect(result.summary).toBe('This shift does not overlap any of your scheduled commitments.')
    expect(result.explanations).toEqual([
      'No scheduled class overlaps this shift',
      'No existing work shift overlaps this shift'
    ])
    expectParity(result, original)
  })

  it('2. Conflict with an existing class', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '13:00' }
    const data = { ...empty, classes: [{ id: 1, name: 'Business 101', day: 'Friday', startTime: '10:00', endTime: '12:00' }] }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Conflict')
    expect(result.summary).toBe('This shift has direct time conflicts with your commitments.')
    expect(result.explanations[0]).toBe("Your class 'Business 101' overlaps this shift (Friday 10:00" + DASH + "12:00)")
    expectParity(result, original)
  })

  it('3. Conflict with an existing work shift', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '17:00' }
    const data = { ...empty, workShifts: [{ id: 1, employer: 'Library', date: FRI, startTime: '08:00', endTime: '12:00' }] }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Conflict')
    expect(result.explanations).toContain("Your existing shift at 'Library' overlaps this shift (08:00" + DASH + "12:00)")
    expectParity(result, original)
  })

  it('4. Tight Fit with assessment due on proposed date', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '17:00' }
    const data = { ...empty, assessments: [{ id: 1, name: 'Individual Assignment', dueDate: FRI }] }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Tight Fit')
    expect(result.summary).toBe('This shift may affect your study or assessment deadlines.')
    expect(result.explanations).toContain('Individual Assignment is due on Friday')
    expect(result.explanations).toContain('Weekly work hours will increase; an assessment is due the same day')
    expectParity(result, original)
  })

  it('5. Tight Fit with overlapping study block', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '13:00' }
    const data = { ...empty, studyBlocks: [{ id: 1, day: 'Friday', startTime: '10:00', endTime: '14:00' }] }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Tight Fit')
    expect(result.explanations).toContain('Your planned study time on Friday would be reduced')
    expectParity(result, original)
  })

  it('6. Conflict takes precedence over Tight Fit when both apply', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '09:00', endTime: '13:00' }
    const data = {
      classes: [{ id: 1, name: 'Business 101', day: 'Friday', startTime: '10:00', endTime: '12:00' }],
      assessments: [{ id: 2, name: 'Group Report', dueDate: FRI }],
      studyBlocks: [],
      workShifts: []
    }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Conflict')
    expect(result.summary).toBe('This shift has direct time conflicts with your commitments.')
    expect(result.explanations[0]).toContain('overlaps this shift')
    expect(result.explanations).toContain('Group Report is due on Friday')
    expect(result.explanations).toContain('Weekly work hours will increase; an assessment is due the same day')
    expectParity(result, original)
  })

  it('7. Back-to-back commitments touching at boundaries do not overlap', () => {
    const proposed = { employer: 'Campus Cafe', date: FRI, startTime: '12:00', endTime: '17:00' }
    const data = { ...empty, classes: [{ id: 1, name: 'Business 101', day: 'Friday', startTime: '09:00', endTime: '12:00' }] }
    const result = checkShift(proposed, data)
    const original = originalCheckShift(proposed, data)
    expect(result.verdict).toBe('Good Fit')
    expect(result.explanations[0]).toBe('No scheduled class overlaps this shift')
    expectParity(result, original)
  })
})