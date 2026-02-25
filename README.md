# 🏏 Gully Cricket Scorer

A mobile-first cricket scoring app built with **React + Vite**.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## 📁 Project Structure

```
gully-cricket/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                        # Entry point
    ├── App.jsx                         # Root state machine / screen router
    │
    ├── constants/
    │   └── index.js                    # PHASES, BALL_TYPES, config options
    │
    ├── utils/
    │   └── cricketUtils.js             # Pure functions: RR calc, strike rotation,
    │                                   #   innings-end check, winner logic, factories
    │
    ├── hooks/
    │   └── useInnings.js               # Innings state engine (addBall, selectBowler,
    │                                   #   selectBatsman, checkEnd)
    │
    ├── styles/
    │   └── theme.js                    # CSS-in-JS string (dark cricket aesthetic)
    │
    └── components/
        ├── common/
        │   └── index.jsx               # Modal, Snackbar, Tabs, Card, Input, Select,
        │                               #   WinnerOverlay, useSnackbar
        │
        ├── setup/
        │   └── index.jsx               # HomeScreen, LimitedSetup, TeamSetup, TossScreen
        │
        ├── scoring/
        │   ├── ScoringWidgets.jsx      # Scoreboard, BatsmenPanel, BowlerPanel,
        │   │                           #   OverDisplay, RunButtons,
        │   │                           #   BowlerSelectModal, BatsmanSelectModal
        │   ├── Scorecard.jsx           # Full scorecard (Batting / Bowling / FoW / Overs tabs)
        │   └── ScoringScreen.jsx       # Orchestrator: wires hook + widgets + winner detection
        │
        └── result/
            └── index.jsx               # InningsBetween, MatchResult
```

---

## ✅ Features

### Match Types
- **Test Match** — 2 innings each, no over limit
- **Limited Overs** — Configurable overs (1–50) & max wickets (1–10)

### Team Setup
- Custom team name + individual player names
- 3–11 players per side
- Coin toss decides who bats first

### Live Scoring
| Button | Action |
|--------|--------|
| `·` 0–6 | Normal runs |
| `W` | Wicket — prompts new batsman |
| `WD` | Wide (+1 run, no ball count) |
| `No Ball` | +1 penalty, ball not counted |
| `Leg Bye` | +1 leg bye (legal ball) |

### Cricket Rules Implemented
- **Strike rotation** — automatic on odd runs (1, 3) and at end of every over
- **End of over** — strike always swaps; new bowler required (same bowler can't bowl consecutive overs)
- **Wicket** — new batsman modal appears; innings ends when `maxWickets` fall
- **Target chase** — winner overlay appears the moment target is reached mid-over
- **All-out** — innings ends and winner is declared immediately

### Scoreboard
- Live **Run Rate** and **Required Run Rate** (innings 2)
- Runs needed + balls remaining
- Ball-by-ball colour-coded over display

### Scorecard (4 tabs)
- **Batting** — R / B / 4s / 6s / SR for every batter
- **Bowling** — O / R / W / Economy per bowler
- **Fall of Wickets** — score at each dismissal
- **Overs** — ball-by-ball summary per completed over

### Winner Declaration
- 🏆 Animated overlay when target is chased (mid-over)
- 🏆 Declared when all wickets fall
- 🏆 Declared when overs complete (limited match)
- 🤝 Tie detection

---

## 📱 Mobile Support
- `max-width: 480px` centered layout
- Touch-friendly large run buttons
- Sticky header with backdrop blur
- Responsive font sizes via `clamp()`
