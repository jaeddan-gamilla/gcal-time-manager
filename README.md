# Google Calendar Time Manager

A clean React app that **imports your Google Calendar (.ics)**, visualizes your day with a **timeline** and **pie chart**, and lets you **plan tasks** seamlessly in a modern interface.

---

##  Features

- **ICS Import (Google Calendar)**  
  Drag and drop your `.ics` export. Recurring events expand into individual real-time events.

- **Date Picker**  
  Jump to any date in your calendar and view the full schedule.

- **12-Hour Timeline**  
  Pink bars = calendar events; Blue bars = your planned tasks overlaid.

- **Allocation Pie Chart**  
  Displays proportions of Busy (calendar), Tasks (planned), and Free time.

- **Task Planning**  
  Add custom tasks using a **12-hour AM/PM clock** and **hour/minute duration**.

- **Modern UI**  
  White cards, soft shadows, subtle borders, and responsive Tailwind design inspired by Apple aesthetics.

---

##  Demo Video

https://github.com/user-attachments/assets/10e73ea9-6f31-46ba-a756-ea269ee353c9

---

##  Tech Stack

| Tool | Description |
|------|-------------|
| [React](https://react.dev/) | JavaScript library for building user interfaces |
| [Vite](https://vitejs.dev/) | Lightning-fast build tool and dev server |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [Recharts](https://recharts.org/en-US/) | Data visualization library for charts |
| [ical.js](https://github.com/mozilla-comm/ical.js) | Parses and expands `.ics` calendar files |

---

##  Installation

Requires [Node.js](https://nodejs.org/) (v18+ recommended).

1. Clone the repository  
   ```bash
   git clone https://github.com/jaeddan-gamilla/gcal-time-manager.git

2. Navigate to the directory  
   ```bash
   cd gcal-time-manager
   ```

3. Install dependencies  
   ```bash
   npm install
   ```

4. Start the app  
   ```bash
   npm run dev
   ```

5. Open your browser  
   Visit: `http://localhost:5173`

---

##  Usage

1. **Export your Google Calendar**  
   - Google Calendar → **Settings** → **Import & export** → **Export**  
   - Download and unzip the `.ics` file for your calendar.  
   - In this app, click **Import Calendar** and upload your `.ics`.

2. **Pick a date** to view that day’s schedule.

3. **Add tasks**  
   - Enter a task name, **12-hour** start time (AM/PM), and **hours + minutes** duration.  
   - Tasks appear on the timeline in **blue**; calendar events are **pink**.

4. **Read the overview**  
   - **Pink** — Calendar busy time  
   - **Blue** — Tasks  
   - **Green** — Remaining free time

---

##  Project Structure

```
src/
 ┣ App.jsx
 ┣ Header.jsx
 ┣ Footer.jsx
 ┣ components/
 ┃ ┣ DayTimeline.jsx
 ┃ ┣ TasksPanel.jsx
 ┃ ┗ AllocationPie.jsx
 ┣ ImportCard/
 ┃ ┗ import.jsx
```

---

##  Author

**Jaeddan Gamilla**  
University of Michigan — Computer Engineering, Men's Swimming and Diving Team

Connect with me on [LinkedIn](https://www.linkedin.com/in/jaeddan-gamilla/)!

---
