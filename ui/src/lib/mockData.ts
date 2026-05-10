import dayjs from "dayjs";

export type Subject = {
  id: string;
  name: string;
  code: string;
  level: "core" | "elective";
  paper?: string;
  predictedNextTerm: number;
  currentAverage: number;
  trend: "up" | "down" | "flat";
  termAverages: { term: string; mark: number }[];
  topics: { name: string; mastery: number }[];
  upcomingSBA: number;
  teacher: string;
};

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    name: "Mathematics",
    code: "MATH",
    level: "core",
    paper: "P1 + P2",
    predictedNextTerm: 72,
    currentAverage: 68,
    trend: "up",
    termAverages: [
      { term: "T1 '25", mark: 58 },
      { term: "T2 '25", mark: 62 },
      { term: "T3 '25", mark: 65 },
      { term: "T4 '25", mark: 68 },
    ],
    topics: [
      { name: "Algebra", mastery: 78 },
      { name: "Calculus", mastery: 54 },
      { name: "Trigonometry", mastery: 72 },
      { name: "Statistics & Probability", mastery: 64 },
      { name: "Analytical Geometry", mastery: 60 },
    ],
    upcomingSBA: 2,
    teacher: "Ms. Naidoo",
  },
  {
    id: "physci",
    name: "Physical Sciences",
    code: "PHSC",
    level: "core",
    paper: "P1 + P2",
    predictedNextTerm: 65,
    currentAverage: 61,
    trend: "up",
    termAverages: [
      { term: "T1 '25", mark: 52 },
      { term: "T2 '25", mark: 56 },
      { term: "T3 '25", mark: 60 },
      { term: "T4 '25", mark: 61 },
    ],
    topics: [
      { name: "Mechanics", mastery: 68 },
      { name: "Chemical Equilibrium", mastery: 42 },
      { name: "Organic Chemistry", mastery: 56 },
      { name: "Electrostatics", mastery: 64 },
      { name: "Waves, Sound & Light", mastery: 70 },
    ],
    upcomingSBA: 1,
    teacher: "Mr. Dlamini",
  },
  {
    id: "english",
    name: "English HL",
    code: "ENG",
    level: "core",
    paper: "P1 + P2 + P3",
    predictedNextTerm: 76,
    currentAverage: 74,
    trend: "flat",
    termAverages: [
      { term: "T1 '25", mark: 70 },
      { term: "T2 '25", mark: 73 },
      { term: "T3 '25", mark: 74 },
      { term: "T4 '25", mark: 74 },
    ],
    topics: [
      { name: "Essay Writing", mastery: 72 },
      { name: "Comprehension", mastery: 80 },
      { name: "Literature Analysis", mastery: 68 },
      { name: "Poetry", mastery: 64 },
      { name: "Visual Literacy", mastery: 78 },
    ],
    upcomingSBA: 1,
    teacher: "Ms. van der Merwe",
  },
  {
    id: "lifesci",
    name: "Life Sciences",
    code: "LSCI",
    level: "elective",
    paper: "P1 + P2",
    predictedNextTerm: 70,
    currentAverage: 67,
    trend: "up",
    termAverages: [
      { term: "T1 '25", mark: 60 },
      { term: "T2 '25", mark: 63 },
      { term: "T3 '25", mark: 65 },
      { term: "T4 '25", mark: 67 },
    ],
    topics: [
      { name: "DNA & Heredity", mastery: 74 },
      { name: "Evolution", mastery: 58 },
      { name: "Human Reproduction", mastery: 72 },
      { name: "Nervous System", mastery: 66 },
      { name: "Population Ecology", mastery: 60 },
    ],
    upcomingSBA: 1,
    teacher: "Dr. Khumalo",
  },
  {
    id: "afri",
    name: "Afrikaans FAL",
    code: "AFR",
    level: "core",
    predictedNextTerm: 64,
    currentAverage: 60,
    trend: "up",
    termAverages: [
      { term: "T1 '25", mark: 54 },
      { term: "T2 '25", mark: 58 },
      { term: "T3 '25", mark: 60 },
      { term: "T4 '25", mark: 60 },
    ],
    topics: [
      { name: "Begripslees", mastery: 62 },
      { name: "Skryfstuk", mastery: 56 },
      { name: "Letterkunde", mastery: 60 },
      { name: "Taalstrukture", mastery: 64 },
    ],
    upcomingSBA: 1,
    teacher: "Mnr. Botha",
  },
  {
    id: "lo",
    name: "Life Orientation",
    code: "LO",
    level: "core",
    predictedNextTerm: 82,
    currentAverage: 80,
    trend: "flat",
    termAverages: [
      { term: "T1 '25", mark: 78 },
      { term: "T2 '25", mark: 80 },
      { term: "T3 '25", mark: 81 },
      { term: "T4 '25", mark: 80 },
    ],
    topics: [
      { name: "Careers", mastery: 84 },
      { name: "PE", mastery: 88 },
      { name: "Citizenship", mastery: 76 },
      { name: "Health", mastery: 80 },
    ],
    upcomingSBA: 0,
    teacher: "Ms. Pillay",
  },
  {
    id: "geography",
    name: "Geography",
    code: "GEO",
    level: "elective",
    predictedNextTerm: 71,
    currentAverage: 69,
    trend: "up",
    termAverages: [
      { term: "T1 '25", mark: 64 },
      { term: "T2 '25", mark: 66 },
      { term: "T3 '25", mark: 68 },
      { term: "T4 '25", mark: 69 },
    ],
    topics: [
      { name: "Climatology", mastery: 70 },
      { name: "Geomorphology", mastery: 64 },
      { name: "Settlement", mastery: 72 },
      { name: "Mapwork", mastery: 78 },
    ],
    upcomingSBA: 1,
    teacher: "Mr. Ndlovu",
  },
];

export type Assessment = {
  id: string;
  subjectId: string;
  title: string;
  type: "Test" | "Investigation" | "Essay" | "Practical" | "Oral" | "Project" | "Exam";
  weight: number;
  dueDate: string;
  status: "scheduled" | "in_progress" | "submitted" | "graded";
  predictedMark?: number;
  actualMark?: number;
  rubric?: { criterion: string; weight: number; description: string }[];
  tasks?: string[];
};

const today = dayjs();

export const ASSESSMENTS: Assessment[] = [
  {
    id: "a1",
    subjectId: "math",
    title: "Calculus & Trigonometry Test",
    type: "Test",
    weight: 15,
    dueDate: today.add(6, "day").toISOString(),
    status: "scheduled",
    predictedMark: 71,
    tasks: ["Practice 20 derivative problems", "Past paper Q1-3", "Trig identities revision"],
  },
  {
    id: "a2",
    subjectId: "english",
    title: "Argumentative Essay — Social Media",
    type: "Essay",
    weight: 10,
    dueDate: today.add(3, "day").toISOString(),
    status: "in_progress",
    predictedMark: 76,
    rubric: [
      { criterion: "Content & ideas", weight: 30, description: "Originality, depth, relevance" },
      { criterion: "Structure", weight: 25, description: "Intro, body, conclusion" },
      { criterion: "Style & tone", weight: 25, description: "Audience awareness" },
      { criterion: "Language & conventions", weight: 20, description: "Grammar, spelling" },
    ],
  },
  {
    id: "a3",
    subjectId: "physci",
    title: "Chemical Equilibrium SBA",
    type: "Investigation",
    weight: 20,
    dueDate: today.add(12, "day").toISOString(),
    status: "scheduled",
    predictedMark: 58,
    rubric: [
      { criterion: "Hypothesis", weight: 15, description: "Clarity & testability" },
      { criterion: "Method", weight: 25, description: "Reproducible & safe" },
      { criterion: "Data analysis", weight: 35, description: "Calculations & graphs" },
      { criterion: "Conclusion", weight: 25, description: "Linked to theory" },
    ],
  },
  {
    id: "a4",
    subjectId: "lifesci",
    title: "Genetics & Heredity Practical",
    type: "Practical",
    weight: 12,
    dueDate: today.add(9, "day").toISOString(),
    status: "scheduled",
    predictedMark: 70,
  },
  {
    id: "a5",
    subjectId: "math",
    title: "Trial Exam Paper 1",
    type: "Exam",
    weight: 25,
    dueDate: today.add(28, "day").toISOString(),
    status: "scheduled",
    predictedMark: 70,
  },
  {
    id: "a6",
    subjectId: "geography",
    title: "Mapwork Assignment",
    type: "Project",
    weight: 8,
    dueDate: today.subtract(3, "day").toISOString(),
    status: "graded",
    actualMark: 73,
  },
  {
    id: "a7",
    subjectId: "afri",
    title: "Skryfstuk - Argumenterende Opstel",
    type: "Essay",
    weight: 10,
    dueDate: today.add(5, "day").toISOString(),
    status: "scheduled",
    predictedMark: 62,
  },
];

export type Goal = {
  id: string;
  subjectId?: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  status: "active" | "completed" | "verified" | "at_risk";
  dueDate: string;
  category: "academic" | "wellbeing" | "habit" | "career";
  reward?: string;
};

export const GOALS: Goal[] = [
  {
    id: "g1",
    subjectId: "math",
    title: "Lift Calculus mastery to 75%",
    description: "Spend 4 focused sessions per week on calculus drills until June.",
    target: "75% mastery",
    progress: 62,
    status: "active",
    dueDate: today.add(45, "day").toISOString(),
    category: "academic",
    reward: "Free Calculus masterclass with top tutor",
  },
  {
    id: "g2",
    subjectId: "english",
    title: "Write three timed essays this term",
    description: "Practice writing under exam conditions to build stamina.",
    target: "3 / 3",
    progress: 66,
    status: "active",
    dueDate: today.add(30, "day").toISOString(),
    category: "academic",
    reward: "Skip-the-queue tutor pass",
  },
  {
    id: "g3",
    title: "Wellbeing check-in 5 days a week",
    description: "Daily diary + mood check-in to spot stress early.",
    target: "5 / 5",
    progress: 80,
    status: "active",
    dueDate: today.add(7, "day").toISOString(),
    category: "wellbeing",
    reward: "Resilient Learner badge",
  },
  {
    id: "g4",
    subjectId: "physci",
    title: "Master Chemical Equilibrium",
    description: "Get to 60% mastery before the SBA.",
    target: "60% mastery",
    progress: 42,
    status: "at_risk",
    dueDate: today.add(10, "day").toISOString(),
    category: "academic",
  },
  {
    id: "g5",
    title: "Submit NSFAS application",
    description: "Complete the bursary navigator checklist before deadline.",
    target: "All docs uploaded",
    progress: 100,
    status: "verified",
    dueDate: today.subtract(2, "day").toISOString(),
    category: "career",
    reward: "1 free hour with a career counsellor",
  },
];

export type PracticeTest = {
  id: string;
  subjectId: string;
  title: string;
  topics: string[];
  questionCount: number;
  difficulty: "foundation" | "core" | "challenge";
  durationMinutes: number;
  bestScore?: number;
  attempts: number;
  alignedSBA?: string;
  aiGenerated: boolean;
};

export const PRACTICE_TESTS: PracticeTest[] = [
  {
    id: "p1",
    subjectId: "math",
    title: "Calculus Drill — Derivatives",
    topics: ["Differentiation", "Chain rule"],
    questionCount: 20,
    difficulty: "core",
    durationMinutes: 35,
    bestScore: 72,
    attempts: 3,
    alignedSBA: "a1",
    aiGenerated: true,
  },
  {
    id: "p2",
    subjectId: "math",
    title: "Trigonometry Identities Sprint",
    topics: ["Identities", "Equations"],
    questionCount: 15,
    difficulty: "challenge",
    durationMinutes: 25,
    bestScore: 64,
    attempts: 2,
    alignedSBA: "a1",
    aiGenerated: true,
  },
  {
    id: "p3",
    subjectId: "physci",
    title: "Equilibrium Conceptual",
    topics: ["Le Chatelier", "Kc calculations"],
    questionCount: 12,
    difficulty: "foundation",
    durationMinutes: 20,
    bestScore: 48,
    attempts: 1,
    alignedSBA: "a3",
    aiGenerated: true,
  },
  {
    id: "p4",
    subjectId: "english",
    title: "Essay Structure Workout",
    topics: ["Argument", "Cohesion"],
    questionCount: 8,
    difficulty: "core",
    durationMinutes: 40,
    bestScore: 78,
    attempts: 2,
    alignedSBA: "a2",
    aiGenerated: true,
  },
  {
    id: "p5",
    subjectId: "lifesci",
    title: "Genetics Past Paper Mix",
    topics: ["Punnett squares", "Mendelian genetics"],
    questionCount: 18,
    difficulty: "core",
    durationMinutes: 30,
    bestScore: 70,
    attempts: 4,
    alignedSBA: "a4",
    aiGenerated: false,
  },
  {
    id: "p6",
    subjectId: "geography",
    title: "Synoptic Weather Maps",
    topics: ["Climatology", "Mid-latitude cyclones"],
    questionCount: 10,
    difficulty: "core",
    durationMinutes: 25,
    attempts: 0,
    aiGenerated: true,
  },
];

export type Tutor = {
  id: string;
  name: string;
  subjects: string[];
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  bio: string;
  city: string;
  verified: boolean;
  online: boolean;
  avatarColor: string;
};

export const TUTORS: Tutor[] = [
  {
    id: "t1",
    name: "Sipho Mabaso",
    subjects: ["Mathematics", "Physical Sciences"],
    rating: 4.9,
    reviewCount: 124,
    hourlyRate: 250,
    bio: "Wits Engineering graduate. Specialises in lifting calculus marks from 50% to 75%+.",
    city: "Johannesburg",
    verified: true,
    online: true,
    avatarColor: "#1F8079",
  },
  {
    id: "t2",
    name: "Leah van Rooyen",
    subjects: ["English HL", "History"],
    rating: 4.8,
    reviewCount: 87,
    hourlyRate: 220,
    bio: "Published author. Helps students unlock voice in essay writing — past paper specialist.",
    city: "Cape Town",
    verified: true,
    online: false,
    avatarColor: "#F25C2E",
  },
  {
    id: "t3",
    name: "Dr. Anika Pillay",
    subjects: ["Life Sciences", "Physical Sciences"],
    rating: 5.0,
    reviewCount: 56,
    hourlyRate: 350,
    bio: "PhD Biochemistry, UKZN. Patient explainer of the trickiest organic chem concepts.",
    city: "Durban",
    verified: true,
    online: true,
    avatarColor: "#3D9762",
  },
  {
    id: "t4",
    name: "Thabo Modise",
    subjects: ["Mathematics", "Accounting"],
    rating: 4.7,
    reviewCount: 142,
    hourlyRate: 200,
    bio: "CA(SA) candidate. Past-paper drills and exam technique. NSC marker for 4 years.",
    city: "Pretoria",
    verified: true,
    online: true,
    avatarColor: "#FFB733",
  },
  {
    id: "t5",
    name: "Naledi Khumalo",
    subjects: ["Afrikaans FAL", "isiZulu HL"],
    rating: 4.9,
    reviewCount: 73,
    hourlyRate: 180,
    bio: "Multilingual coach. Helps students think in the language they're tested in.",
    city: "Online",
    verified: true,
    online: true,
    avatarColor: "#2C7DCB",
  },
  {
    id: "t6",
    name: "Brent O'Reilly",
    subjects: ["Geography", "History"],
    rating: 4.6,
    reviewCount: 38,
    hourlyRate: 220,
    bio: "Mapwork wizard. Will turn synoptic charts into a story you actually remember.",
    city: "Port Elizabeth",
    verified: true,
    online: false,
    avatarColor: "#5BA3E5",
  },
];

export type Course = {
  id: string;
  title: string;
  tutorId: string;
  subjectId: string;
  duration: string;
  lessons: number;
  rating: number;
  enrolled: number;
  price: number;
  level: "beginner" | "intermediate" | "advanced";
  description: string;
  thumbnail?: string;
};

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Calculus Mastery — Grade 12",
    tutorId: "t1",
    subjectId: "math",
    duration: "8 weeks",
    lessons: 24,
    rating: 4.9,
    enrolled: 412,
    price: 599,
    level: "intermediate",
    description: "From limits to optimisation — past paper drills and rubric-graded mocks.",
  },
  {
    id: "c2",
    title: "Argumentative Essay Bootcamp",
    tutorId: "t2",
    subjectId: "english",
    duration: "4 weeks",
    lessons: 12,
    rating: 4.8,
    enrolled: 287,
    price: 349,
    level: "intermediate",
    description: "Structure, voice, evidence — turn 60% essays into 75%+ pieces.",
  },
  {
    id: "c3",
    title: "Organic Chemistry Decoded",
    tutorId: "t3",
    subjectId: "physci",
    duration: "6 weeks",
    lessons: 18,
    rating: 5.0,
    enrolled: 198,
    price: 549,
    level: "advanced",
    description: "Reactions, mechanisms, naming — the chapter most students dread.",
  },
  {
    id: "c4",
    title: "NSC Maths Past Paper Lab",
    tutorId: "t4",
    subjectId: "math",
    duration: "12 weeks",
    lessons: 36,
    rating: 4.7,
    enrolled: 605,
    price: 449,
    level: "intermediate",
    description: "Three years of past papers, walked through, with marker tips.",
  },
  {
    id: "c5",
    title: "Mapwork Made Memorable",
    tutorId: "t6",
    subjectId: "geography",
    duration: "3 weeks",
    lessons: 9,
    rating: 4.6,
    enrolled: 124,
    price: 249,
    level: "beginner",
    description: "Bearings, gradient, scale, GIS — short, illustrated lessons.",
  },
];

export type DiaryEntry = {
  id: string;
  date: string;
  mood: 1 | 2 | 3 | 4 | 5;
  content: string;
  tags: string[];
};

export const DIARY_ENTRIES: DiaryEntry[] = [
  {
    id: "d1",
    date: today.subtract(0, "day").toISOString(),
    mood: 4,
    content:
      "Got through the calculus practice set faster than last week. Stuck on chain rule when functions are nested twice though. Going to ask Sipho about it tomorrow.",
    tags: ["maths", "progress"],
  },
  {
    id: "d2",
    date: today.subtract(1, "day").toISOString(),
    mood: 2,
    content:
      "Stressed about the chemistry SBA. Feels like I'm learning the same thing over and over without it sticking. Did a 5 min breathing exercise after.",
    tags: ["stress", "chemistry"],
  },
  {
    id: "d3",
    date: today.subtract(3, "day").toISOString(),
    mood: 5,
    content:
      "Wrote my best essay yet. Mom said she's proud. Saved a copy in my workspace.",
    tags: ["essay", "win"],
  },
  {
    id: "d4",
    date: today.subtract(5, "day").toISOString(),
    mood: 3,
    content:
      "Average day. Did two practice tests. Ate lunch with friends.",
    tags: [],
  },
];

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "celebration" | "reminder" | "alert" | "info";
  read: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  {
    id: "n1",
    title: "5-day streak!",
    body: "You completed your study goals 5 days in a row. Treat yourself to a 'Take a break' moment.",
    time: today.subtract(2, "hour").toISOString(),
    kind: "celebration",
    read: false,
  },
  {
    id: "n2",
    title: "English essay due in 3 days",
    body: "Argumentative Essay — Social Media. AI says you're 70% ready.",
    time: today.subtract(5, "hour").toISOString(),
    kind: "reminder",
    read: false,
  },
  {
    id: "n3",
    title: "Chemistry mastery dropped",
    body: "Equilibrium dropped 4% this week. We've recommended a 20-min focus session.",
    time: today.subtract(1, "day").toISOString(),
    kind: "alert",
    read: true,
  },
  {
    id: "n4",
    title: "New course unlocked",
    body: "Because you completed 'Wellbeing 5/5', enjoy 1 free week of Calculus Mastery.",
    time: today.subtract(2, "day").toISOString(),
    kind: "celebration",
    read: true,
  },
];

export type Reward = {
  id: string;
  title: string;
  description: string;
  cost: number;
  category: "course" | "tutor" | "feature" | "badge" | "experience";
  imageColor: string;
  available: boolean;
};

export const REWARDS: Reward[] = [
  {
    id: "r1",
    title: "Free Calculus Masterclass",
    description: "1 hour with Sipho Mabaso, 4.9-rated tutor.",
    cost: 1200,
    category: "tutor",
    imageColor: "#1F8079",
    available: true,
  },
  {
    id: "r2",
    title: "Skip-the-queue tutor pass",
    description: "Book any tutor within 24 hours, even if fully booked.",
    cost: 600,
    category: "feature",
    imageColor: "#F25C2E",
    available: true,
  },
  {
    id: "r3",
    title: "University Insider Q&A",
    description: "Live session with a UCT undergraduate in your dream course.",
    cost: 900,
    category: "experience",
    imageColor: "#FFB733",
    available: true,
  },
  {
    id: "r4",
    title: "Resilient Learner Badge",
    description: "Profile badge that universities can see when you apply.",
    cost: 0,
    category: "badge",
    imageColor: "#3D9762",
    available: true,
  },
  {
    id: "r5",
    title: "Premium Past Paper Vault",
    description: "Unlock 5 years of solved IEB & NSC past papers.",
    cost: 1500,
    category: "feature",
    imageColor: "#5BA3E5",
    available: false,
  },
];

export type StudyGroup = {
  id: string;
  name: string;
  subjectId: string;
  members: number;
  privacy: "open" | "invite";
  description: string;
  nextSession?: string;
};

export const STUDY_GROUPS: StudyGroup[] = [
  {
    id: "sg1",
    name: "Calculus Crew",
    subjectId: "math",
    members: 8,
    privacy: "open",
    description: "Wednesday + Saturday focus sessions on differentiation and integration.",
    nextSession: today.add(2, "day").hour(18).toISOString(),
  },
  {
    id: "sg2",
    name: "Essay Writers Circle",
    subjectId: "english",
    members: 12,
    privacy: "open",
    description: "Peer feedback on argumentative essays. Sunday evening drafts.",
    nextSession: today.add(4, "day").hour(19).toISOString(),
  },
  {
    id: "sg3",
    name: "Chem Equilibrium Squad",
    subjectId: "physci",
    members: 5,
    privacy: "invite",
    description: "Small group cracking Le Chatelier and Kc problems together.",
    nextSession: today.add(1, "day").hour(17).toISOString(),
  },
];

export type Bursary = {
  id: string;
  name: string;
  field: string;
  deadline: string;
  amount: string;
  requirements: string[];
  status: "open" | "closing_soon" | "closed";
  url?: string;
};

export const BURSARIES: Bursary[] = [
  {
    id: "b1",
    name: "NSFAS",
    field: "All NSC subjects",
    deadline: today.add(45, "day").toISOString(),
    amount: "Full tuition + allowance",
    requirements: ["NSC pass", "Household income < R350k", "ID copy", "Proof of residence"],
    status: "open",
  },
  {
    id: "b2",
    name: "Sasol Bursary",
    field: "Engineering, Science",
    deadline: today.add(20, "day").toISOString(),
    amount: "R280,000 / year",
    requirements: ["80%+ in Maths & Physics", "Grade 11 results", "Motivational letter"],
    status: "closing_soon",
  },
  {
    id: "b3",
    name: "Allan Gray Orbis Fellowship",
    field: "Any (entrepreneurship focus)",
    deadline: today.add(60, "day").toISOString(),
    amount: "Full undergrad + leadership programme",
    requirements: ["Top 5% academically", "Entrepreneurial intent", "Two essays"],
    status: "open",
  },
  {
    id: "b4",
    name: "Investec CSI Scholarship",
    field: "Commerce, Finance",
    deadline: today.subtract(5, "day").toISOString(),
    amount: "Full tuition + book allowance",
    requirements: ["75%+ in Maths", "Pass English", "Interview"],
    status: "closed",
  },
];

export type University = {
  id: string;
  name: string;
  city: string;
  apsCutoffs: { course: string; aps: number }[];
  applicationDeadline: string;
  applicationFee: number;
};

export const UNIVERSITIES: University[] = [
  {
    id: "u1",
    name: "University of Cape Town",
    city: "Cape Town",
    apsCutoffs: [
      { course: "BSc Engineering", aps: 41 },
      { course: "BCom Finance", aps: 38 },
      { course: "BA Humanities", aps: 30 },
    ],
    applicationDeadline: dayjs().month(6).date(31).toISOString(),
    applicationFee: 100,
  },
  {
    id: "u2",
    name: "University of the Witwatersrand",
    city: "Johannesburg",
    apsCutoffs: [
      { course: "BSc Eng (Mining)", aps: 40 },
      { course: "BCom Accounting", aps: 38 },
      { course: "BA Law", aps: 36 },
    ],
    applicationDeadline: dayjs().month(8).date(30).toISOString(),
    applicationFee: 200,
  },
  {
    id: "u3",
    name: "Stellenbosch University",
    city: "Stellenbosch",
    apsCutoffs: [
      { course: "BEng Mechatronic", aps: 42 },
      { course: "BCom Management Sciences", aps: 36 },
      { course: "BA Visual Arts", aps: 32 },
    ],
    applicationDeadline: dayjs().month(6).date(30).toISOString(),
    applicationFee: 100,
  },
  {
    id: "u4",
    name: "University of Pretoria",
    city: "Pretoria",
    apsCutoffs: [
      { course: "BSc Veterinary", aps: 38 },
      { course: "BCom (Hons in 4)", aps: 34 },
      { course: "BEd Senior Phase", aps: 28 },
    ],
    applicationDeadline: dayjs().month(5).date(30).toISOString(),
    applicationFee: 350,
  },
];

export type Career = {
  id: string;
  title: string;
  field: string;
  averageSalary: string;
  growth: "high" | "medium" | "low";
  requirements: string[];
  matchScore: number;
};

export const CAREERS: Career[] = [
  {
    id: "career1",
    title: "Software Engineer",
    field: "Tech",
    averageSalary: "R480k - R1.2M",
    growth: "high",
    requirements: ["BSc Computer Science / IT", "Maths >70%"],
    matchScore: 88,
  },
  {
    id: "career2",
    title: "Chemical Engineer",
    field: "Engineering",
    averageSalary: "R520k - R900k",
    growth: "medium",
    requirements: ["BEng Chem", "Maths & Physics >75%"],
    matchScore: 76,
  },
  {
    id: "career3",
    title: "Clinical Psychologist",
    field: "Health",
    averageSalary: "R420k - R780k",
    growth: "high",
    requirements: ["BA Psych → Honours → Masters", "English >70%"],
    matchScore: 71,
  },
  {
    id: "career4",
    title: "Chartered Accountant (CA(SA))",
    field: "Finance",
    averageSalary: "R600k - R1.4M",
    growth: "medium",
    requirements: ["BCom Accounting", "Maths >65%", "SAICA articles"],
    matchScore: 82,
  },
];

export type LiveActivity = {
  id: string;
  studentId: string;
  student: string;
  action: string;
  subject?: string;
  detail?: string;
  ts: string;
};

export const LIVE_ACTIVITY: LiveActivity[] = [
  {
    id: "la1",
    studentId: "s1",
    student: "Thabo M.",
    action: "Started practice test",
    subject: "Mathematics",
    detail: "Calculus Drill — Derivatives",
    ts: today.subtract(30, "second").toISOString(),
  },
  {
    id: "la2",
    studentId: "s3",
    student: "Naledi K.",
    action: "Submitted essay draft",
    subject: "English HL",
    detail: "Argumentative — Social Media",
    ts: today.subtract(2, "minute").toISOString(),
  },
  {
    id: "la3",
    studentId: "s5",
    student: "Lerato P.",
    action: "Completed wellbeing check-in",
    detail: "Mood 4/5",
    ts: today.subtract(4, "minute").toISOString(),
  },
  {
    id: "la4",
    studentId: "s2",
    student: "Sipho D.",
    action: "Asked AI tutor",
    subject: "Physical Sciences",
    detail: "How does Le Chatelier apply when temp drops?",
    ts: today.subtract(7, "minute").toISOString(),
  },
  {
    id: "la5",
    studentId: "s4",
    student: "Aisha M.",
    action: "Joined study group",
    detail: "Calculus Crew",
    ts: today.subtract(11, "minute").toISOString(),
  },
];

export type ClassRecord = {
  id: string;
  name: string;
  grade: 11 | 12;
  subject: string;
  studentCount: number;
  averageMastery: number;
  trend: number; // pp this term
  strugglingTopics: string[];
};

export const CLASSES: ClassRecord[] = [
  {
    id: "cl1",
    name: "12A Mathematics",
    grade: 12,
    subject: "Mathematics",
    studentCount: 28,
    averageMastery: 64,
    trend: 3,
    strugglingTopics: ["Calculus", "Trigonometry"],
  },
  {
    id: "cl2",
    name: "12B Physical Sciences",
    grade: 12,
    subject: "Physical Sciences",
    studentCount: 26,
    averageMastery: 58,
    trend: 1,
    strugglingTopics: ["Chemical Equilibrium", "Organic Chemistry"],
  },
  {
    id: "cl3",
    name: "11A English HL",
    grade: 11,
    subject: "English HL",
    studentCount: 30,
    averageMastery: 72,
    trend: 2,
    strugglingTopics: ["Poetry analysis"],
  },
  {
    id: "cl4",
    name: "12A Life Sciences",
    grade: 12,
    subject: "Life Sciences",
    studentCount: 24,
    averageMastery: 67,
    trend: 4,
    strugglingTopics: ["Evolution"],
  },
];

export type Child = {
  id: string;
  name: string;
  grade: 11 | 12;
  school: string;
  weeklyMinutes: number;
  predictedAverage: number;
  trend: number;
  isStudyingNow: boolean;
  currentActivity?: string;
  moodAvg: number;
};

export const CHILDREN: Child[] = [
  {
    id: "ch1",
    name: "Thandi",
    grade: 12,
    school: "Crawford College Pretoria",
    weeklyMinutes: 412,
    predictedAverage: 71,
    trend: 4,
    isStudyingNow: true,
    currentActivity: "Calculus Drill — Derivatives",
    moodAvg: 3.8,
  },
  {
    id: "ch2",
    name: "Lerato",
    grade: 11,
    school: "Crawford College Pretoria",
    weeklyMinutes: 268,
    predictedAverage: 65,
    trend: -1,
    isStudyingNow: false,
    moodAvg: 3.2,
  },
];

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
};

export const SAMPLE_CHAT: ChatMessage[] = [
  {
    id: "m1",
    role: "assistant",
    content:
      "Hi Thandi! I see you've got the Calculus & Trigonometry test in 6 days. Want me to walk through chain rule with examples, or generate a quick 10-min practice set?",
    ts: today.subtract(8, "minute").toISOString(),
  },
  {
    id: "m2",
    role: "user",
    content: "Quick practice please. Just chain rule, mixed difficulty.",
    ts: today.subtract(7, "minute").toISOString(),
  },
  {
    id: "m3",
    role: "assistant",
    content:
      "Done — generated 8 chain-rule problems escalating from foundation to challenge. Tap *Start* whenever you're ready, you'll have 12 minutes. After, I'll show you which step tripped you up most.",
    ts: today.subtract(7, "minute").toISOString(),
  },
];

export const STREAK_DAYS = 12;
export const TODAY_FOCUS_MINUTES = 38;
export const APS_SCORE = 36;
