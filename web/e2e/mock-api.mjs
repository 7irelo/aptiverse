// Minimal stand-in for the Aptiverse API used by Playwright. Pages fetch on
// the server, so browser route interception cannot see those requests;
// instead Next.js is started with API_INTERNAL_URL pointing here.
//
// Auth accounts (password for all: "correct horse battery"):
// - student@example.test: student, onboarding done
// - busy@example.test: student with a practice test in progress
// - new@example.test: student, onboarding not done
// - parent@example.test: parent, onboarding done
// - locked@example.test: always answers 429 with Retry-After: 900
//
// Each login gets its own study state (units, tests, attempts, chats), so
// tests running in parallel never see each other's data.

import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";

const port = Number(process.env.MOCK_API_PORT ?? 5199);
const faqs = readFileSync(
  new URL("../tests/fixtures/faqs.json", import.meta.url),
  "utf8",
);

const PASSWORD = "correct horse battery";
const ACCOUNTS = {
  "student@example.test": {
    roles: ["student"],
    onboarded: true,
    name: "Thandi Mokoena",
  },
  "busy@example.test": {
    roles: ["student"],
    onboarded: true,
    name: "Ayanda Khumalo",
    busy: true,
  },
  "new@example.test": {
    roles: ["student"],
    onboarded: false,
    name: "Lwazi Dube",
  },
  "parent@example.test": {
    roles: ["parent"],
    onboarded: true,
    name: "Sipho Mokoena",
  },
};

// access token -> { email, sid }; refresh token -> { email, sid } (one use each)
const accessTokens = new Map();
const refreshTokens = new Map();
const onboarding = new Map();
// sid -> study state
const states = new Map();

const UNIT_ID = "11111111-1111-4111-8111-111111111111";
const ENROLMENT_ID = "22222222-2222-4222-8222-222222222222";
const ASSESSMENT_ID = "33333333-3333-4333-8333-333333333333";

const QUESTIONS = [
  {
    stem: "Solve $x^2 = 9$ for $x > 0$.",
    options: ["$x = 3$", "$x = -3$", "$x = 9$", "$x = 81$"],
    correctIndex: 0,
    topic: "Algebra",
  },
  {
    stem: "What is $2^3$?",
    options: ["6", "8", "9", "12"],
    correctIndex: 1,
    topic: "Exponents",
  },
];

function newState(busy) {
  const state = {
    tests: new Map(),
    attempts: new Map(),
    conversations: new Map(),
    statusPolls: new Map(),
  };
  if (busy) {
    const test = makeTest(state, { format: "quiz", mode: "timed" }, "ready");
    test.durationMinutes = 30;
    startAttempt(state, test);
  }
  return state;
}

function issue(email, sid = randomUUID()) {
  // "eyJ" prefix like a real JWT, so the exposure checks have something to find.
  const accessToken = `eyJmock.${randomUUID()}.access`;
  const refreshToken = `refresh-${randomUUID()}`;
  accessTokens.set(accessToken, { email, sid });
  refreshTokens.set(refreshToken, { email, sid });
  const account = ACCOUNTS[email];
  if (!states.has(sid)) states.set(sid, newState(account.busy));
  return {
    accessToken,
    accessTokenExpiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
    refreshToken,
    refreshTokenExpiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    user: {
      id: randomUUID(),
      name: account.name,
      email,
      emailConfirmed: true,
      roles: account.roles,
      onboardingRequired: !(onboarding.get(email) ?? account.onboarded),
    },
  };
}

function me(email) {
  const account = ACCOUNTS[email];
  const done = onboarding.get(email) ?? account.onboarded;
  return {
    id: "6f1c1b3e-7a52-4c1e-9d3c-1f0e2a3b4c5d",
    name: account.name,
    email,
    emailConfirmed: true,
    pendingEmail: null,
    hasPassword: true,
    phoneNumber: null,
    dateOfBirth: null,
    adultConfirmedAt: null,
    roles: account.roles,
    primaryRole: account.roles[0],
    permissions: [],
    entitlements: [],
    isMinor: null,
    onboarding: {
      required: !done,
      completedAt: done ? "2026-10-01T00:00:00Z" : null,
      educationLevel: done ? "high_school" : null,
      grade: done ? 11 : null,
      curriculum: done ? "nsc" : null,
      studyLevel: null,
      yearOfStudy: null,
      programme: null,
      institutionName: null,
      dateOfBirth: null,
    },
    consent: {
      termsVersion: "2026-10",
      privacyVersion: "2026-10",
      reconsentRequired: false,
    },
    deletionRequest: null,
    createdAt: "2026-10-01T00:00:00Z",
  };
}

const weighting = {
  currentPercent: null,
  predictedPercent: null,
  gradedWeightPercent: 0,
  weightTotalPercent: 25,
  gradedCount: 0,
  assessmentCount: 1,
  warnings: [],
};

function dueAt() {
  return new Date(Date.now() + 10 * 86_400_000).toISOString();
}

function unit() {
  return {
    enrolmentId: ENROLMENT_ID,
    unitId: UNIT_ID,
    kind: "caps_subject",
    name: "Mathematics",
    code: "MATH",
    level: "grade_11",
    grade: 11,
    curriculum: "nsc",
    institutionName: null,
    isShared: false,
    teacherName: null,
    status: "active",
    startedOn: "2026-01-15",
    duration: null,
    expectedEndOn: null,
    isFinished: false,
    colourToken: null,
    displayOrder: 0,
    nextDue: {
      assessmentId: ASSESSMENT_ID,
      title: "June exam",
      dueAt: dueAt(),
    },
    weighting,
    topicCount: 2,
  };
}

function assessmentItem() {
  return {
    id: ASSESSMENT_ID,
    enrolmentId: ENROLMENT_ID,
    unitName: "Mathematics",
    title: "June exam",
    type: "exam",
    state: "scheduled",
    dueAt: dueAt(),
    weightPercent: 25,
    percent: null,
    predictedPercent: null,
    isOverdue: false,
  };
}

function makeTest(state, body, status = "generating") {
  const id = randomUUID();
  const test = {
    id,
    title: "Mathematics practice quiz",
    studyUnitId: UNIT_ID,
    assessmentId: body.assessmentId ?? ASSESSMENT_ID,
    format: body.format ?? "quiz",
    mode: body.mode ?? "untimed",
    durationMinutes: body.durationMinutes ?? null,
    questionCount: QUESTIONS.length,
    totalMarks: QUESTIONS.length,
    topics: ["Algebra", "Exponents"],
    difficulty: body.difficulty ?? "core",
    status,
    createdAt: new Date().toISOString(),
    questions: QUESTIONS.map((q, i) => ({
      id: randomUUID(),
      position: i + 1,
      kind: "mcq",
      stem: q.stem,
      options: q.options,
      marks: 1,
      topic: q.topic,
      section: null,
      flashcardBack: null,
      correctIndex: q.correctIndex,
    })),
    attemptId: null,
  };
  state.tests.set(id, test);
  return test;
}

function startAttempt(state, test) {
  const now = Date.now();
  const attempt = {
    id: randomUUID(),
    testId: test.id,
    status: "in_progress",
    startedAt: new Date(now).toISOString(),
    deadlineAt:
      test.mode === "timed" && test.durationMinutes
        ? new Date(now + test.durationMinutes * 60_000).toISOString()
        : null,
    answers: new Map(),
    focusLossCount: 0,
    submittedAt: null,
  };
  state.attempts.set(attempt.id, attempt);
  test.attemptId = attempt.id;
  return attempt;
}

function publicQuestion(q) {
  const copy = { ...q };
  delete copy.correctIndex;
  return copy;
}

function attemptState(state, attempt) {
  const test = state.tests.get(attempt.testId);
  const active =
    attempt.status === "in_progress" || attempt.status === "paused";
  return {
    attemptId: attempt.id,
    testId: attempt.testId,
    status: attempt.status,
    mode: test.mode,
    startedAt: attempt.startedAt,
    deadlineAt: attempt.deadlineAt,
    serverNow: new Date().toISOString(),
    remainingSeconds: attempt.deadlineAt
      ? Math.max(
          0,
          Math.floor((Date.parse(attempt.deadlineAt) - Date.now()) / 1000),
        )
      : null,
    paused: attempt.status === "paused",
    pausedSecondsTotal: 0,
    focusLossCount: attempt.focusLossCount,
    questions: active ? test.questions.map(publicQuestion) : [],
    answers: [...attempt.answers.entries()].map(([questionId, a]) => ({
      questionId,
      selectedIndex: a.selectedIndex ?? null,
      textAnswer: a.textAnswer ?? null,
      selfRating: a.selfRating ?? null,
      revision: a.revision,
      savedAt: a.savedAt,
    })),
    resultsUrl: active ? null : `/practice/attempts/${attempt.id}/results`,
  };
}

function activeAttempt(state) {
  for (const attempt of state.attempts.values()) {
    if (attempt.status === "in_progress" || attempt.status === "paused") {
      return attempt;
    }
  }
  return null;
}

function testSummary(state, test) {
  const attempt = test.attemptId ? state.attempts.get(test.attemptId) : null;
  return {
    id: test.id,
    title: test.title,
    studyUnitId: test.studyUnitId,
    assessmentId: test.assessmentId,
    format: test.format,
    mode: test.mode,
    durationMinutes: test.durationMinutes,
    questionCount: test.questionCount,
    totalMarks: test.totalMarks,
    status: test.status,
    createdAt: test.createdAt,
    latestAttempt: attempt
      ? {
          attemptId: attempt.id,
          status: attempt.status,
          scorePercent: attempt.scorePercent ?? null,
          submittedAt: attempt.submittedAt,
        }
      : null,
  };
}

function results(state, attempt) {
  const test = state.tests.get(attempt.testId);
  const questions = test.questions.map((q) => {
    const answer = attempt.answers.get(q.id);
    const correct = answer?.selectedIndex === q.correctIndex;
    return {
      id: q.id,
      position: q.position,
      kind: q.kind,
      section: null,
      topic: q.topic,
      stem: q.stem,
      options: q.options,
      marks: q.marks,
      yourSelectedIndex: answer?.selectedIndex ?? null,
      yourAnswer: null,
      yourSelfRating: null,
      correctIndex: q.correctIndex,
      correctAnswer: null,
      memo: "",
      explanation: "Check each option against the question.",
      isCorrect: answer ? correct : null,
      awardedMarks: answer ? (correct ? q.marks : 0) : 0,
      feedback: null,
      needsReview: false,
      markingStatus: "marked",
    };
  });
  const score = questions.reduce((sum, q) => sum + (q.awardedMarks ?? 0), 0);
  const topics = [...new Set(questions.map((q) => q.topic))].map((topic) => {
    const rows = questions.filter((q) => q.topic === topic);
    return {
      topic,
      questionsTotal: rows.length,
      questionsCorrect: rows.filter((q) => q.isCorrect).length,
      marksAvailable: rows.reduce((s, q) => s + q.marks, 0),
      marksAwarded: rows.reduce((s, q) => s + (q.awardedMarks ?? 0), 0),
    };
  });
  return {
    attemptId: attempt.id,
    testId: test.id,
    title: test.title,
    format: test.format,
    status: "graded",
    scoreMarks: score,
    maxMarks: test.totalMarks,
    scorePercent: (score / test.totalMarks) * 100,
    markedMarks: test.totalMarks,
    markedScore: score,
    partiallyGraded: false,
    submittedAt: attempt.submittedAt,
    submitSource: "student",
    secondsOnTask: 95,
    focusLossCount: attempt.focusLossCount,
    topics,
    questions,
  };
}

function conversationView(c) {
  return {
    id: c.id,
    title: c.title,
    mode: "standard",
    messageCount: c.messages.length,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

function send(res, status, body, headers = {}) {
  const isProblem = status >= 400;
  res
    .writeHead(status, {
      "content-type": isProblem
        ? "application/problem+json"
        : "application/json",
      ...headers,
    })
    .end(body === undefined ? undefined : JSON.stringify(body));
}

function paged(items) {
  return {
    items,
    page: 1,
    pageSize: 50,
    totalCount: items.length,
    totalPages: 1,
    hasNextPage: false,
  };
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function caller(req) {
  const auth = req.headers.authorization ?? "";
  return accessTokens.get(auth.replace(/^Bearer /, ""));
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamTutor(res, conversation, message) {
  res.writeHead(200, {
    "content-type": "text/event-stream",
    "cache-control": "no-cache",
  });
  const event = (name, data) =>
    res.write(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
  event("route", { intent: "explain", gradedWork: false });
  await wait(30);
  event("tool_call", { name: "search_curriculum", ok: true });
  const reply =
    "To solve $x^2 = 9$, take the square root of both sides. Since $x > 0$, the answer is $x = 3$.";
  for (const piece of reply.match(/.{1,12}/g) ?? []) {
    event("token", { text: piece });
    await wait(15);
  }
  event("citation", {
    chunkId: "caps-math-11-algebra",
    title: "CAPS Mathematics Grade 11",
    page: 24,
    headingPath: ["Algebra", "Quadratic equations"],
    licence: null,
    displayRule: null,
    private: false,
  });
  const messageId = randomUUID();
  conversation.messages.push(
    {
      id: randomUUID(),
      role: "user",
      content: message,
      status: "complete",
      createdAt: new Date().toISOString(),
    },
    {
      id: messageId,
      role: "assistant",
      content: reply,
      status: "complete",
      createdAt: new Date().toISOString(),
    },
  );
  conversation.updatedAt = new Date().toISOString();
  event("done", { messageId, route: "explain" });
  res.end();
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  const route = `${req.method} ${url.pathname}`;

  switch (route) {
    case "GET /health":
      res.writeHead(200, { "content-type": "text/plain" }).end("ok");
      return;
    case "GET /support/faqs":
      res.writeHead(200, { "content-type": "application/json" }).end(faqs);
      return;
    case "GET /legal/versions":
      send(res, 200, {
        termsVersion: "2026-10",
        privacyVersion: "2026-10",
        termsUrl: "https://aptiverse.test/terms",
        privacyUrl: "https://aptiverse.test/privacy",
        effectiveFrom: "2026-10-01",
      });
      return;
    case "POST /auth/login": {
      const { email, password } = await readJson(req);
      if (email === "locked@example.test") {
        send(
          res,
          429,
          {
            title: "Too many attempts",
            status: 429,
            code: "identity.too_many_attempts",
            retryAfterSeconds: 900,
          },
          { "retry-after": "900" },
        );
        return;
      }
      if (!ACCOUNTS[email] || password !== PASSWORD) {
        send(res, 401, {
          title: "Unauthorized",
          status: 401,
          code: "identity.invalid_credentials",
        });
        return;
      }
      send(res, 200, issue(email));
      return;
    }
    case "POST /auth/forgot-password":
      await readJson(req);
      res.writeHead(202).end();
      return;
    case "POST /auth/refresh": {
      const { refreshToken } = await readJson(req);
      const entry = refreshTokens.get(refreshToken);
      if (!entry) {
        send(res, 401, { status: 401, code: "identity.refresh_token_invalid" });
        return;
      }
      refreshTokens.delete(refreshToken);
      send(res, 200, issue(entry.email, entry.sid));
      return;
    }
    case "GET /academics/catalog":
      send(res, 200, { curriculum: "nsc", grade: 11, subjects: [] });
      return;
    default:
      break;
  }

  // Everything below needs a signed-in caller.
  const who = caller(req);
  if (!who) {
    send(res, 401, { status: 401 });
    return;
  }
  const state = states.get(who.sid);

  switch (route) {
    case "POST /auth/logout":
      res.writeHead(204).end();
      return;
    case "GET /me":
      send(res, 200, me(who.email));
      return;
    case "POST /me/onboarding/complete": {
      onboarding.set(who.email, true);
      const summary = me(who.email).onboarding;
      send(res, 200, { ...summary, missing: [] });
      return;
    }
    case "POST /me/consents":
      res.writeHead(204).end();
      return;
    case "GET /academics/units":
      send(res, 200, [unit()]);
      return;
    case "GET /academics/assessments":
      send(res, 200, paged([assessmentItem()]));
      return;
    case "GET /progress/dashboard": {
      const attempt = activeAttempt(state);
      send(res, 200, {
        activeAttempt: attempt
          ? {
              attemptId: attempt.id,
              testId: attempt.testId,
              deadlineAt: attempt.deadlineAt,
              paused: false,
            }
          : null,
        nextAssessments: [
          {
            assessmentId: ASSESSMENT_ID,
            title: "June exam",
            studyUnitId: UNIT_ID,
            unitName: "Mathematics",
            dueAt: dueAt(),
          },
        ],
        activeGoals: [],
        weakestTopics: [],
        masteryScore: null,
        recentPractice: {
          attemptsGraded: 0,
          averageScorePercent: null,
          bestScorePercent: null,
          minutesOnTask: 0,
        },
        activityLast7Days: [],
      });
      return;
    }
    case "GET /progress/mastery":
      send(res, 200, {
        units: [
          {
            studyUnitId: UNIT_ID,
            name: "Mathematics",
            score: null,
            band: null,
            earlyRead: false,
            evidenceQuestions: 0,
            marks: null,
            topics: [],
          },
        ],
      });
      return;
    case "GET /progress/goals":
      send(res, 200, paged([]));
      return;
    case "POST /practice/tests/generate": {
      const body = await readJson(req);
      if (activeAttempt(state)) {
        send(res, 409, {
          title: "Conflict",
          status: 409,
          code: "practice.attempt_active",
        });
        return;
      }
      const test = makeTest(state, body);
      state.statusPolls.set(test.id, 0);
      send(res, 202, {
        testId: test.id,
        jobId: randomUUID(),
        status: "queued",
        statusUrl: `/practice/tests/${test.id}/status`,
      });
      return;
    }
    case "GET /practice/generations/active":
      res.writeHead(204).end();
      return;
    case "GET /practice/attempts/active": {
      const attempt = activeAttempt(state);
      if (!attempt) {
        res.writeHead(204).end();
        return;
      }
      const test = state.tests.get(attempt.testId);
      send(res, 200, {
        attemptId: attempt.id,
        testId: attempt.testId,
        testTitle: test.title,
        mode: test.mode,
        deadlineAt: attempt.deadlineAt,
        remainingSeconds: attemptState(state, attempt).remainingSeconds,
        paused: attempt.status === "paused",
        serverNow: new Date().toISOString(),
      });
      return;
    }
    case "GET /practice/tests":
      send(
        res,
        200,
        paged([...state.tests.values()].map((t) => testSummary(state, t))),
      );
      return;
    case "GET /ai/conversations":
      send(
        res,
        200,
        paged([...state.conversations.values()].map(conversationView)),
      );
      return;
    case "POST /ai/conversations": {
      const body = await readJson(req);
      const now = new Date().toISOString();
      const c = {
        id: randomUUID(),
        title: body.title ?? "New chat",
        messages: [],
        createdAt: now,
        updatedAt: now,
      };
      state.conversations.set(c.id, c);
      send(res, 201, conversationView(c));
      return;
    }
    default:
      break;
  }

  // Routes with ids.
  let m;
  if ((m = url.pathname.match(/^\/practice\/tests\/([^/]+)\/status$/))) {
    const test = state.tests.get(m[1]);
    if (!test) return send(res, 404, { status: 404 });
    const polls = (state.statusPolls.get(test.id) ?? 0) + 1;
    state.statusPolls.set(test.id, polls);
    if (polls >= 2) test.status = "ready";
    send(res, 200, {
      testId: test.id,
      status: test.status === "ready" ? "ready" : "running",
      attemptsMade: 1,
      errorCode: null,
      readyAt: test.status === "ready" ? new Date().toISOString() : null,
    });
    return;
  }
  if ((m = url.pathname.match(/^\/practice\/tests\/([^/]+)\/attempts$/))) {
    const test = state.tests.get(m[1]);
    if (!test) return send(res, 404, { status: 404 });
    if (test.attemptId) {
      return send(res, 409, {
        status: 409,
        code: "practice.attempt_exists",
        attemptId: test.attemptId,
      });
    }
    send(res, 201, attemptState(state, startAttempt(state, test)));
    return;
  }
  if ((m = url.pathname.match(/^\/practice\/tests\/([^/]+)$/))) {
    const test = state.tests.get(m[1]);
    if (!test) return send(res, 404, { status: 404 });
    const attempt = test.attemptId ? state.attempts.get(test.attemptId) : null;
    const active =
      attempt &&
      (attempt.status === "in_progress" || attempt.status === "paused");
    send(res, 200, {
      id: test.id,
      title: test.title,
      studyUnitId: test.studyUnitId,
      assessmentId: test.assessmentId,
      format: test.format,
      mode: test.mode,
      durationMinutes: test.durationMinutes,
      questionCount: test.questionCount,
      totalMarks: test.totalMarks,
      topics: test.topics,
      difficulty: test.difficulty,
      pauseAllowed: test.mode !== "timed",
      status: test.status,
      serverNow: new Date().toISOString(),
      attempt: attempt
        ? { attemptId: attempt.id, status: attempt.status }
        : null,
      activeAttempt: active ? attemptState(state, attempt) : null,
    });
    return;
  }
  if (
    (m = url.pathname.match(
      /^\/practice\/attempts\/([^/]+)\/answers\/([^/]+)$/,
    ))
  ) {
    const attempt = state.attempts.get(m[1]);
    if (!attempt) return send(res, 404, { status: 404 });
    const body = await readJson(req);
    const current = attempt.answers.get(m[2]);
    const revision = current?.revision ?? 0;
    if (body.baseRevision !== revision) {
      return send(res, 409, {
        status: 409,
        code: "practice.revision_conflict",
        currentRevision: revision,
      });
    }
    const saved = {
      selectedIndex: body.selectedIndex,
      textAnswer: body.textAnswer,
      selfRating: body.selfRating,
      revision: revision + 1,
      savedAt: new Date().toISOString(),
    };
    attempt.answers.set(m[2], saved);
    send(res, 200, {
      questionId: m[2],
      revision: saved.revision,
      savedAt: saved.savedAt,
    });
    return;
  }
  if ((m = url.pathname.match(/^\/practice\/attempts\/([^/]+)\/focus-loss$/))) {
    const attempt = state.attempts.get(m[1]);
    if (!attempt) return send(res, 404, { status: 404 });
    attempt.focusLossCount += 1;
    send(res, 200, { focusLossCount: attempt.focusLossCount });
    return;
  }
  if ((m = url.pathname.match(/^\/practice\/attempts\/([^/]+)\/submit$/))) {
    const attempt = state.attempts.get(m[1]);
    if (!attempt) return send(res, 404, { status: 404 });
    attempt.status = "graded";
    attempt.submittedAt = new Date().toISOString();
    attempt.scorePercent = results(state, attempt).scorePercent;
    send(res, 200, {
      attemptId: attempt.id,
      status: "graded",
      resultsUrl: `/practice/attempts/${attempt.id}/results`,
    });
    return;
  }
  if ((m = url.pathname.match(/^\/practice\/attempts\/([^/]+)\/results$/))) {
    const attempt = state.attempts.get(m[1]);
    if (!attempt) return send(res, 404, { status: 404 });
    if (attempt.status === "in_progress" || attempt.status === "paused") {
      return send(res, 409, {
        status: 409,
        code: "practice.results_not_ready",
      });
    }
    send(res, 200, results(state, attempt));
    return;
  }
  if ((m = url.pathname.match(/^\/ai\/conversations\/([^/]+)\/messages$/))) {
    const conversation = state.conversations.get(m[1]);
    if (!conversation) return send(res, 404, { status: 404 });
    const body = await readJson(req);
    if (activeAttempt(state)) {
      return send(res, 409, {
        title: "Conflict",
        status: 409,
        code: "ai.blocked_during_attempt",
        detail:
          "The tutor is unavailable while you have a practice test in progress. Submit the test to chat again.",
      });
    }
    await streamTutor(res, conversation, body.message ?? "");
    return;
  }
  if ((m = url.pathname.match(/^\/ai\/conversations\/([^/]+)$/))) {
    const conversation = state.conversations.get(m[1]);
    if (!conversation) return send(res, 404, { status: 404 });
    send(res, 200, {
      ...conversationView(conversation),
      messages: conversation.messages,
    });
    return;
  }
  if ((m = url.pathname.match(/^\/academics\/units\/([^/]+)\/topics$/))) {
    send(res, 200, [
      { id: randomUUID(), name: "Algebra", slug: "algebra" },
      { id: randomUUID(), name: "Exponents", slug: "exponents" },
    ]);
    return;
  }

  send(res, 404, { title: "Not Found", status: 404 });
});

server.listen(port, "127.0.0.1", () => {
  console.log(`mock API listening on http://127.0.0.1:${port}`);
});
