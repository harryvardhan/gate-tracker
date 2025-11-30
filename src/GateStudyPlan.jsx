import React, { useState, useEffect, useMemo } from "react";
import {
  CheckCircle2,
  Circle,
  Calendar as CalIcon,
  AlertCircle,
  Youtube,
  Trophy,
  Clock,
  Edit3,
} from "lucide-react";

/* =========================
   Helper functions
   ========================= */

const START_DATE_ISO = "2025-11-27";
const MOCK_START_ISO = "2025-12-22";

function toISO(d) {
  // Normalizes a Date to YYYY-MM-DD (local date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
}

function dateToMonthLabel(y, m) {
  return new Date(y, m, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function abbrev(name, len = 18) {
  if (!name) return "";
  return name.length > len ? name.slice(0, len - 3) + "..." : name;
}

/* =========================
   Default mocks builder
   ========================= */
function buildDefaultMocks() {
  const res = [];
  let id = 1;

  // Warm-up (every 3 days, 4 mocks)
  let d = new Date(MOCK_START_ISO + "T00:00:00");
  for (let i = 0; i < 4; i++) {
    res.push({ id: id++, dateISO: toISO(d), done: false, note: "" });
    d.setDate(d.getDate() + 3);
  }

  // Main: 1 Jan - 19 Jan every 2 days
  let jan = new Date("2026-01-01T00:00:00");
  while (jan <= new Date("2026-01-19T00:00:00")) {
    res.push({ id: id++, dateISO: toISO(jan), done: false, note: "" });
    jan.setDate(jan.getDate() + 2);
  }

  // Final push: 20 Jan - 05 Feb every 2 days
  let fin = new Date("2026-01-20T00:00:00");
  while (fin <= new Date("2026-02-05T00:00:00")) {
    res.push({ id: id++, dateISO: toISO(fin), done: false, note: "" });
    fin.setDate(fin.getDate() + 2);
  }

  return res;
}

/* =========================
   CombinedProgressGraph component (Option D)
   - Donut shows overall progress
   - Two bars show subjects & mocks separately
   ========================= */
const CombinedProgressGraph = ({ subjectPercent = 0, mockPercent = 0 }) => {
  const overall = Math.round((subjectPercent * 0.6 + mockPercent * 0.4) * 100) / 100;
  // donut math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const filled = (overall / 100) * circumference;
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col md:flex-row items-center gap-4">
      <div className="flex items-center gap-4">
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform">
          <defs>
            <linearGradient id="g1" x1="0%" x2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#f43f5e" />
            </linearGradient>
          </defs>
          <g transform="translate(60,60)">
            <circle r={radius} fill="#f3f4f6" />
            <circle
              r={radius}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="12"
            />
            <circle
              r={radius}
              fill="transparent"
              stroke="url(#g1)"
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${filled} ${circumference - filled}`}
              transform="rotate(-90)"
            />
            <text x="0" y="6" textAnchor="middle" className="text-gray-800 font-semibold" style={{ fontSize: 16 }}>
              {Math.round(overall)}%
            </text>
            <text x="0" y="28" textAnchor="middle" className="text-gray-500" style={{ fontSize: 11 }}>
              Overall
            </text>
          </g>
        </svg>
        <div>
          <div className="text-sm text-gray-600">Subjects</div>
          <div className="w-48 bg-gray-200 h-3 rounded overflow-hidden mt-1">
            <div style={{ width: `${subjectPercent}%` }} className="h-3 bg-orange-500" />
          </div>
          <div className="text-xs text-gray-700 mt-1">{Math.round(subjectPercent)}%</div>

          <div className="text-sm text-gray-600 mt-3">Mocks</div>
          <div className="w-48 bg-gray-200 h-3 rounded overflow-hidden mt-1">
            <div style={{ width: `${mockPercent}%` }} className="h-3 bg-rose-500" />
          </div>
          <div className="text-xs text-gray-700 mt-1">{Math.round(mockPercent)}%</div>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Main component
   ========================= */
const GateStudyPlan = () => {
  // States
  const [completedSubjects, setCompletedSubjects] = useState([]);
  const [completedTopics, setCompletedTopics] = useState({});
  const [completedDays, setCompletedDays] = useState({});
  const [topicNotes, setTopicNotes] = useState({});
  const [notesOpen, setNotesOpen] = useState({});
  const [calendarOpen, setCalendarOpen] = useState(true);
  const [mocks, setMocks] = useState([]);

  // Load once (safe parse)
  useEffect(() => {
    try {
      const cs = JSON.parse(localStorage.getItem("completedSubjects")) || [];
      const ct = JSON.parse(localStorage.getItem("completedTopics")) || {};
      const cd = JSON.parse(localStorage.getItem("completedDays")) || {};
      const tn = JSON.parse(localStorage.getItem("topicNotes")) || {};
      const mk = JSON.parse(localStorage.getItem("mocks"));

      setCompletedSubjects(cs);
      setCompletedTopics(ct);
      setCompletedDays(cd);
      setTopicNotes(tn);
      if (Array.isArray(mk) && mk.length) setMocks(mk);
      else setMocks(buildDefaultMocks());
    } catch (e) {
      setMocks(buildDefaultMocks());
    }
  }, []);

  // Save effects (each separately to avoid accidental overwrite)
  useEffect(() => {
    try { localStorage.setItem("completedSubjects", JSON.stringify(completedSubjects)); } catch (e) {}
  }, [completedSubjects]);

  useEffect(() => {
    try { localStorage.setItem("completedTopics", JSON.stringify(completedTopics)); } catch (e) {}
  }, [completedTopics]);

  useEffect(() => {
    try { localStorage.setItem("completedDays", JSON.stringify(completedDays)); } catch (e) {}
  }, [completedDays]);

  useEffect(() => {
    try { localStorage.setItem("topicNotes", JSON.stringify(topicNotes)); } catch (e) {}
  }, [topicNotes]);

  useEffect(() => {
    try { localStorage.setItem("mocks", JSON.stringify(mocks)); } catch (e) {}
  }, [mocks]);

  // Toggles & updates
  const toggleSubject = (num) =>
    setCompletedSubjects((p) => (p.includes(num) ? p.filter((x) => x !== num) : [...p, num]));

  const toggleTopic = (s, idx) => {
    const key = `${s}-${idx}`;
    setCompletedTopics((p) => ({ ...p, [key]: !p[key] }));
  };

  const toggleDay = (iso) => {
    setCompletedDays((p) => {
      const next = { ...p, [iso]: !p[iso] };
      if (!next[iso]) delete next[iso];
      return next;
    });
  };

  const toggleNoteOpen = (k) => setNotesOpen((p) => ({ ...p, [k]: !p[k] }));
  const updateTopicNote = (k, t) => setTopicNotes((p) => ({ ...p, [k]: t }));

  const toggleMockDone = (id) => setMocks((prev) => prev.map((m) => (m.id === id ? { ...m, done: !m.done } : m)));
  const saveMockNote = (id, txt) => setMocks((prev) => prev.map((m) => (m.id === id ? { ...m, note: txt } : m)));

  // Study plan (durations are numbers of days)
  const studyPlan = [
    { num: 1, subject: "DBMS", duration: 4, topics: ["ER Model", "Keys & Constraints", "SQL Queries", "Normalization", "Transactions", "Indexing"] },
    { num: 2, subject: "Computer Organization (COA)", duration: 4, topics: ["Number Systems", "Addressing Modes", "Pipelining", "Cache", "I/O"] },
    { num: 3, subject: "Operating Systems", duration: 4, topics: ["Scheduling", "Deadlocks", "Paging", "Page Replacement", "Disk Scheduling"] },
    { num: 4, subject: "Computer Networks", duration: 7, topics: ["OSI/TCPIP", "Encoding/CRC", "Subnetting", "Routing", "TCP/UDP", "Congestion", "App Layer"] },
    { num: 5, subject: "C Programming", duration: 3, topics: ["Loops", "Arrays", "Pointers", "Functions", "Structs"] },
    { num: 6, subject: "Data Structures", duration: 4, topics: ["Linked Lists", "Trees", "Heaps", "Graphs", "Hashing"] },
    { num: 7, subject: "Algorithms", duration: 6, topics: ["Complexity", "Sorting", "Divide&Conquer", "Greedy", "DP", "Graph Algos"] },
    { num: 8, subject: "Discrete Mathematics", duration: 4, topics: ["Logic", "Sets", "Graph Theory", "P&C"] },
    { num: 9, subject: "Linear Algebra", duration: 2, topics: ["Matrices", "Rank", "Eigenvalues", "Systems"] },
    { num: 10, subject: "Probability & Stats", duration: 2, topics: ["Bayes", "Random Variables", "Distributions", "Variance"] },
    { num: 11, subject: "TOC", duration: 3, topics: ["DFA/NFA", "Regex", "PDA", "Turing Machines"] },
    { num: 12, subject: "Digital Logic", duration: 3, topics: ["Boolean Algebra", "K-Maps", "Combinational", "Sequential"] },
  ];

  // Progress calculations
  const subjectPercent = (completedSubjects.length / studyPlan.length) * 100;
  const mockPercent = (mocks.filter((m) => m.done).length / (mocks.length || 1)) * 100;
  const overallPercent = Math.round(((subjectPercent * 0.6) + (mockPercent * 0.4)) * 100) / 100;

  // Build schedule list day-by-day
  const schedule = useMemo(() => {
    const out = [];
    let d = new Date(START_DATE_ISO + "T00:00:00");
    for (let i = 0; i < studyPlan.length; i++) {
      const s = studyPlan[i];
      for (let k = 1; k <= s.duration; k++) {
        out.push({
          dateISO: toISO(d),
          dateObj: new Date(d),
          subjectNum: s.num,
          subjectName: s.subject,
          dayIndex: k,
        });
        d.setDate(d.getDate() + 1);
      }
    }
    return out;
  }, [studyPlan]);

  const scheduleMap = useMemo(() => {
    const m = {};
    schedule.forEach((it) => (m[it.dateISO] = it));
    return m;
  }, [schedule]);

  /* -----------------------------------------------------------
     MONTH-WISE CALENDAR (fixed slicing)
  ----------------------------------------------------------- */
  const calendarGrid = useMemo(() => {
    if (!schedule.length) return [];

    const first = schedule[0].dateObj;
    const last = schedule[schedule.length - 1].dateObj;

    let cur = new Date(first.getFullYear(), first.getMonth(), 1);
    const end = new Date(last.getFullYear(), last.getMonth(), 1);

    const months = [];
    while (cur <= end) {
      const year = cur.getFullYear();
      const month = cur.getMonth();

      const firstOfMonth = new Date(year, month, 1);
      const lastOfMonth = new Date(year, month + 1, 0);

      const cells = [];
      const offset = firstOfMonth.getDay(); // 0..6

      // leading blanks
      for (let i = 0; i < offset; i++) cells.push(null);

      for (let day = 1; day <= lastOfMonth.getDate(); day++) {
        const d = new Date(year, month, day);
        const iso = toISO(d);
        cells.push({ iso, dateObj: d, scheduleEntry: scheduleMap[iso] || null });
      }

      // trailing blanks
      while (cells.length % 7 !== 0) cells.push(null);

      // chunk into weeks
      const weeks = [];
      for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

      months.push({ year, month, monthLabel: dateToMonthLabel(year, month), weeks });
      cur = new Date(year, month + 1, 1);
    }

    return months;
  }, [schedule, scheduleMap]);

  const totalScheduledDays = schedule.length;

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">⚡ GATE Study Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Local save for subjects, topics, notes, calendar & mocks.</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-xs text-gray-500">Overall</div>
                <div className="text-xl font-semibold text-gray-800">{overallPercent}%</div>
              </div>
              <CalIcon className="w-12 h-12 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Combined Graph */}
        <CombinedProgressGraph subjectPercent={subjectPercent} mockPercent={mockPercent} />

        {/* Daily timetable */}
        <div className="bg-white rounded-2xl shadow p-6 mt-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Daily Time Table</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            <div className="bg-blue-50 p-3 rounded border border-blue-200">
              <div className="font-semibold text-blue-900">6:00 – 9:00 AM</div>
              <div className="text-sm text-gray-700">Main subject lectures (2x) + running notes</div>
            </div>
            <div className="bg-purple-50 p-3 rounded border border-purple-200">
              <div className="font-semibold text-purple-900">9:30 AM – 1:00 PM</div>
              <div className="text-sm text-gray-700">Continue lectures + 5–10 PYQs topic-wise</div>
            </div>
            <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
              <div className="font-semibold text-yellow-900">2:00 – 4:30 PM</div>
              <div className="text-sm text-gray-700">Dedicated PYQ solving</div>
            </div>
            <div className="bg-green-50 p-3 rounded border border-green-200">
              <div className="font-semibold text-green-900">4:45 – 6:30 PM</div>
              <div className="text-sm text-gray-700">Revision & error log</div>
            </div>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="font-semibold text-red-900">7:00 – 9:00 PM</div>
              <div className="text-sm text-gray-700">Aptitude (1–1.5 hr daily)</div>
            </div>
            <div className="bg-gray-100 p-3 rounded border border-gray-300">
              <div className="font-semibold text-gray-900">9:30 – 11:00 PM</div>
              <div className="text-sm text-gray-700">Light revision & next day plan</div>
            </div>
          </div>
        </div>

        {/* Calendar toggle */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <CalIcon className="w-5 h-5 text-orange-600" />
            <div>
              <div className="font-semibold text-gray-800">45-Day Schedule (start {START_DATE_ISO})</div>
              <div className="text-xs text-gray-500">{totalScheduledDays} days scheduled</div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => setCalendarOpen((v) => !v)} className="px-3 py-2 bg-white rounded border shadow-sm text-sm">
              {calendarOpen ? "Hide Calendar" : "Show Calendar"}
            </button>
            <button onClick={() => { setCompletedDays({}); localStorage.removeItem("completedDays"); }} className="px-3 py-2 bg-white rounded border shadow-sm text-sm">
              Clear Day Marks
            </button>
          </div>
        </div>

        {/* Calendar */}
        {calendarOpen && (
          <div className="bg-white rounded-2xl shadow p-4 mb-6">
            {calendarGrid.map((month) => (
              <div key={month.monthLabel} className="mb-6">
                <div className="text-sm font-semibold mb-2">{month.monthLabel}</div>

                <div className="grid grid-cols-7 gap-1 text-xs">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="text-center font-medium text-gray-500 py-1">{d}</div>
                  ))}

                  {month.weeks.flat().map((cell, idx) => {
                    if (!cell) return <div key={idx} className="h-20 bg-gray-50 border rounded" />;

                    const done = !!completedDays[cell.iso];
                    const scheduled = cell.scheduleEntry;

                    return (
                      <div
                        key={cell.iso}
                        onClick={() => scheduled && toggleDay(cell.iso)}
                        title={scheduled ? `${cell.iso} — ${cell.scheduleEntry.subjectName}` : cell.iso}
                        className={`h-20 p-2 border rounded cursor-pointer flex flex-col justify-between
                          ${scheduled ? "border-orange-200" : "border-gray-200"}
                          ${done ? "bg-green-50" : "bg-white"}
                        `}
                      >
                        <div className="text-gray-700">{cell.iso.slice(8)}</div>
                        {scheduled ? (
                          <div className="text-xs text-gray-600">{abbrev(scheduled.subjectName)} (Day {scheduled.dayIndex})</div>
                        ) : (
                          <div className="text-xs text-gray-300">—</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-600 mt-2">Click a scheduled day to mark it complete. Completed days are saved locally.</div>
          </div>
        )}

        {/* Mock plan */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="font-semibold">Mock Test Plan (start {MOCK_START_ISO})</div>
              <div className="text-xs text-gray-500">Click done after each mock. Write quick analysis below each mock.</div>
            </div>
            <div className="text-sm text-gray-600">{mocks.filter(m => m.done).length} done • {mocks.length} planned</div>
          </div>

          <div className="space-y-2">
            {mocks.map((m) => (
              <div key={m.id} className={`${m.done ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-100"} border rounded p-3`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">Mock {m.id} — {m.dateISO}</div>
                    <div className="text-xs text-gray-600">Simulate exact exam conditions (3 hrs). Analyze afterwards.</div>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={m.done} onChange={() => toggleMockDone(m.id)} />
                    <span className="text-gray-700">Done</span>
                  </label>
                </div>

                <textarea
                  placeholder="Write quick mock mistakes / weak topics..."
                  value={m.note || ""}
                  onChange={(e) => saveMockNote(m.id, e.target.value)}
                  rows={3}
                  className="mt-2 w-full p-2 border rounded text-sm bg-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Subjects grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {studyPlan.map((s) => (
            <div key={s.num} className="bg-white rounded-2xl shadow border">
              <div
                onClick={() => toggleSubject(s.num)}
                className={`p-4 cursor-pointer ${completedSubjects.includes(s.num) ? "bg-green-50" : "bg-orange-50"}`}
              >
                <div className="flex items-start gap-3">
                  {completedSubjects.includes(s.num) ? <CheckCircle2 className="w-7 h-7 text-green-600" /> : <Circle className="w-7 h-7 text-gray-400" />}
                  <div>
                    <div className="font-semibold text-gray-800">{s.num}. {s.subject}</div>
                    <div className="text-xs text-gray-600">{s.duration} days</div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {s.topics.map((t, idx) => {
                  const key = `${s.num}-${idx}`;
                  return (
                    <div key={key} className="mb-3 p-3 bg-gray-50 border rounded">
                      <div className="flex justify-between items-start">
                        <label className="flex items-start gap-2">
                          <input type="checkbox" checked={!!completedTopics[key]} onChange={() => toggleTopic(s.num, idx)} />
                          <span className={completedTopics[key] ? "line-through text-gray-400" : ""}>{t}</span>
                        </label>

                        <button onClick={() => toggleNoteOpen(key)} className="text-gray-600 p-1 rounded hover:bg-gray-100">
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>

                      {notesOpen[key] && (
                        <textarea
                          className="w-full mt-2 p-2 border rounded bg-white text-sm"
                          placeholder="Write notes / issues for this topic..."
                          value={topicNotes[key] || ""}
                          onChange={(e) => updateTopicNote(key, e.target.value)}
                          rows={3}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-white p-6 rounded-xl shadow-md text-center">
          <Trophy className="w-10 h-10 text-orange-600 mx-auto mb-2" />
          <div className="font-semibold">You're Building Momentum!</div>
          <div className="text-sm text-gray-600">Stick to the plan. Revise, take mocks & improve.</div>
        </div>
      </div>
    </div>
  );
};

export default GateStudyPlan;

