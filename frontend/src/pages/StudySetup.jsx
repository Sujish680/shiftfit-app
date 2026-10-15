/**
 * StudySetup.jsx
 * Screen 2 — Add classes, assessments and study blocks.
 * Now uses async API calls via DataContext.
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext.jsx'
import { formatTime, formatDate } from '../lib/format.js'
import Button from '../components/Button.jsx'
import FormCard from '../components/FormCard.jsx'
import NoticeAlert from '../components/NoticeAlert.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function StudySetup() {
  const navigate = useNavigate()
  const { data, loading, error, addClass, addAssessment, addStudyBlock, removeItem } = useData()

  const [className, setClassName] = useState('')
  const [classDay, setClassDay] = useState('')
  const [classStart, setClassStart] = useState('')
  const [classEnd, setClassEnd] = useState('')
  const [assessName, setAssessName] = useState('')
  const [assessDate, setAssessDate] = useState('')
  const [studyDay, setStudyDay] = useState('')
  const [studyStart, setStudyStart] = useState('')
  const [studyEnd, setStudyEnd] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleAddClass(e) {
    e.preventDefault()
    if (className && classDay && classStart && classEnd) {
      setSaving(true)
      const success = await addClass(className.trim(), classDay, classStart, classEnd)
      setSaving(false)
      if (success) {
        setClassName(''); setClassDay(''); setClassStart(''); setClassEnd('')
      }
    }
  }

  async function handleAddAssessment(e) {
    e.preventDefault()
    if (assessName && assessDate) {
      setSaving(true)
      const success = await addAssessment(assessName.trim(), assessDate)
      setSaving(false)
      if (success) {
        setAssessName(''); setAssessDate('')
      }
    }
  }

  async function handleAddStudy(e) {
    e.preventDefault()
    if (studyDay && studyStart && studyEnd) {
      setSaving(true)
      const success = await addStudyBlock(studyDay, studyStart, studyEnd)
      setSaving(false)
      if (success) {
        setStudyDay(''); setStudyStart(''); setStudyEnd('')
      }
    }
  }

  if (loading) {
    return (
      <section className="screen active">
        <div className="container">
          <h2>Study Setup</h2>
          <p>Loading your data...</p>
        </div>
      </section>
    )
  }

  return (
    <section className="screen active">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0 }}>Study Setup</h2>
          <Button variant="secondary" onClick={() => navigate('/home')}>Home</Button>
        </div>

        {error && <NoticeAlert variant="destructive" title="Error" description={error} />}

        <FormCard title="Add a Class">
          <form onSubmit={handleAddClass}>
            <label>Class Name<input type="text" placeholder="e.g. Business 101" required value={className} onChange={e => setClassName(e.target.value)} disabled={saving} /></label>
            <label>Day<select required value={classDay} onChange={e => setClassDay(e.target.value)} disabled={saving}><option value="">Select day</option>{DAYS.map(d => <option key={d}>{d}</option>)}</select></label>
            <div className="form-row">
              <label>Start Time<input type="time" required value={classStart} onChange={e => setClassStart(e.target.value)} disabled={saving} /></label>
              <label>End Time<input type="time" required value={classEnd} onChange={e => setClassEnd(e.target.value)} disabled={saving} /></label>
            </div>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Adding...' : 'Add Class'}</Button>
          </form>
          <ul className="item-list">{data.classes.map(cls => <li key={cls.id}><span>{cls.name} — {cls.day} {formatTime(cls.startTime)}–{formatTime(cls.endTime)}</span><button onClick={() => removeItem('classes', cls.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <FormCard title="Add an Assessment">
          <form onSubmit={handleAddAssessment}>
            <label>Assessment Name<input type="text" placeholder="e.g. Individual Assignment" required value={assessName} onChange={e => setAssessName(e.target.value)} disabled={saving} /></label>
            <label>Due Date<input type="date" required value={assessDate} onChange={e => setAssessDate(e.target.value)} disabled={saving} /></label>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Adding...' : 'Add Assessment'}</Button>
          </form>
          <ul className="item-list">{data.assessments.map(a => <li key={a.id}><span>{a.name} — due {formatDate(a.dueDate)}</span><button onClick={() => removeItem('assessments', a.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <FormCard title="Add a Study Block">
          <form onSubmit={handleAddStudy}>
            <label>Day<select required value={studyDay} onChange={e => setStudyDay(e.target.value)} disabled={saving}><option value="">Select day</option>{DAYS.map(d => <option key={d}>{d}</option>)}</select></label>
            <div className="form-row">
              <label>Start Time<input type="time" required value={studyStart} onChange={e => setStudyStart(e.target.value)} disabled={saving} /></label>
              <label>End Time<input type="time" required value={studyEnd} onChange={e => setStudyEnd(e.target.value)} disabled={saving} /></label>
            </div>
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Adding...' : 'Add Study Block'}</Button>
          </form>
          <ul className="item-list">{data.studyBlocks.map(block => <li key={block.id}><span>{block.day} {formatTime(block.startTime)}–{formatTime(block.endTime)}</span><button onClick={() => removeItem('studyBlocks', block.id)}>Remove</button></li>)}</ul>
        </FormCard>

        <Button variant="primary" full onClick={() => navigate('/work-setup')}>Next</Button>
      </div>
    </section>
  )
}