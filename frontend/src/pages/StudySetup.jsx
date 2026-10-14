/**
 * StudySetup.jsx
 * Screen 2 — Add classes, assessments and study blocks.
 * Forms genuinely save to the in-memory DataContext.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StudySetup() {
  const navigate = useNavigate()
  const { data, addClass, addAssessment, addStudyBlock, removeItem } = useData()

  // Class form
  const [className, setClassName] = useState('')
  const [classDay, setClassDay] = useState('')
  const [classStart, setClassStart] = useState('')
  const [classEnd, setClassEnd] = useState('')

  // Assessment form
  const [assessName, setAssessName] = useState('')
  const [assessDate, setAssessDate] = useState('')

  // Study block form
  const [studyDay, setStudyDay] = useState('')
  const [studyStart, setStudyStart] = useState('')
  const [studyEnd, setStudyEnd] = useState('')

  function handleAddClass(e) {
    e.preventDefault()
    if (className && classDay && classStart && classEnd) {
      addClass(className.trim(), classDay, classStart, classEnd)
      setClassName(''); setClassDay(''); setClassStart(''); setClassEnd('')
    }
  }

  function handleAddAssessment(e) {
    e.preventDefault()
    if (assessName && assessDate) {
      addAssessment(assessName.trim(), assessDate)
      setAssessName(''); setAssessDate('')
    }
  }

  function handleAddStudy(e) {
    e.preventDefault()
    if (studyDay && studyStart && studyEnd) {
      addStudyBlock(studyDay, studyStart, studyEnd)
      setStudyDay(''); setStudyStart(''); setStudyEnd('')
    }
  }

  return (
    <section className="screen active">
      <div className="container">
        <h2>Study Setup</h2>

        <FormCard title="Add a Class">
          <form onSubmit={handleAddClass}>
            <label>Class Name<input type="text" placeholder="e.g. Business 101" required value={className} onChange={e => setClassName(e.target.value)} /></label>
            <label>Day<select required value={classDay} onChange={e => setClassDay(e.target.value)}><option value="">Select day</option>{DAYS.map(d => <option key={d}>{d}</option>)}</select></label>
            <div className="form-row">
              <label>Start Time<input type="time" required value={classStart} onChange={e => setClassStart(e.target.value)} /></label>
              <label>End Time<input type="time" required value={classEnd} onChange={e => setClassEnd(e.target.value)} /></label>
            </div>
            <Button type="submit" variant="primary">Add Class</Button>
          </form>
          <ul className="item-list">{data.classes.map(cls => <li key={cls.id}><span>{cls.name} — {cls.day} {formatTime(cls.startTime)}–{formatTime(cls.endTime)}</span><button onClick={() => removeItem('classes', cls.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <FormCard title="Add an Assessment">
          <form onSubmit={handleAddAssessment}>
            <label>Assessment Name<input type="text" placeholder="e.g. Individual Assignment" required value={assessName} onChange={e => setAssessName(e.target.value)} /></label>
            <label>Due Date<input type="date" required value={assessDate} onChange={e => setAssessDate(e.target.value)} /></label>
            <Button type="submit" variant="primary">Add Assessment</Button>
          </form>
          <ul className="item-list">{data.assessments.map(a => <li key={a.id}><span>{a.name} — due {formatDate(a.dueDate)}</span><button onClick={() => removeItem('assessments', a.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <FormCard title="Add a Study Block">
          <form onSubmit={handleAddStudy}>
            <label>Day<select required value={studyDay} onChange={e => setStudyDay(e.target.value)}><option value="">Select day</option>{DAYS.map(d => <option key={d}>{d}</option>)}</select></label>
            <div className="form-row">
              <label>Start Time<input type="time" required value={studyStart} onChange={e => setStudyStart(e.target.value)} /></label>
              <label>End Time<input type="time" required value={studyEnd} onChange={e => setStudyEnd(e.target.value)} /></label>
            </div>
            <Button type="submit" variant="primary">Add Study Block</Button>
          </form>
          <ul className="item-list">{data.studyBlocks.map(block => <li key={block.id}><span>{block.day} {formatTime(block.startTime)}–{formatTime(block.endTime)}</span><button onClick={() => removeItem('studyBlocks', block.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <Button variant="primary" full onClick={() => navigate('/work-setup')}>Next</Button>
      </div>
    </section>
  )
}