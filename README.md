# ShiftFit

ShiftFit helps university students decide whether to accept an offered work shift based on their academic commitments and existing work. This repository currently contains the **Assessment 2 MVP** — a dependency-free HTML/CSS/JavaScript application.

## User Journey (7 screens)

1. **Welcome** — introduction and "Get Started".
2. **Study Setup** — add classes, assessments and planned study blocks.
3. **Work Setup** — add existing work shifts.
4. **Home** — summary of all commitments.
5. **Check a Shift** — enter a proposed shift (employer, date, start/end time).
6. **Shift Result** — verdict with a summary and explanation bullets.
7. **Confirmation** — the shift is added to the work schedule.

## Shift Results

| Result | Meaning |
|---|---|
| **Good Fit** | The shift does not overlap any scheduled commitments. |
| **Tight Fit** | The shift may affect study time or an assessment deadline (assessment due the same day, or planned study time reduced). |
| **Conflict** | The shift directly overlaps a class or an existing work shift. |

Decision precedence: **Conflict > Tight Fit > Good Fit**. Full rules live in `js/check.js`.

## Running Locally

No build step or dependencies are required.

- **Quick:** open `index.html` directly in a web browser, or
- **Local server:**

```bash
cd shiftfit-app
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project Structure

```
index.html        # All seven screens
css/style.css     # Design tokens and styles
js/components.js  # Reusable UI components (sf-button, sf-form-card, sf-summary-card, sf-notice-alert)
js/data.js        # Data model stored in sessionStorage
js/check.js       # Shift-checking decision logic
js/app.js         # Navigation, rendering and form handling
```

## Notes

- Data is stored in `sessionStorage` and lasts for the browser tab session only.
- This commit is tagged `assessment-2-baseline` to preserve the working Assessment 2 MVP before development of Assessment 3 (React, FastAPI, Supabase, authentication and deployment) begins.
