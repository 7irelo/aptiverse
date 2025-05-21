const subjectsData = [
  {
    id: 'mathematics',
    name: 'Mathematics',
    code: 'MAT',
    description: 'Algebra, Calculus, Geometry and Mathematical Literacy',
    progress: 75,
    target: 80,
    averageScore: 72,
    studyHours: 18,
    assignmentsCompleted: 12,
    upcomingDeadlines: 2,
    strength: 'Algebra',
    weakness: 'Calculus',
    lastActivity: '2 days ago',
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [4, 5, 3, 6, 4, 5, 4],
    topicPerformance: [
      { topic: 'Algebra', score: 78, trend: 'up' },
      { topic: 'Calculus', score: 65, trend: 'down' },
      { topic: 'Geometry', score: 82, trend: 'up' },
      { topic: 'Statistics', score: 75, trend: 'stable' },
      { topic: 'Trigonometry', score: 70, trend: 'up' }
    ],
    studyEfficiency: 85,
    predictedScore: 74,
    improvementTips: [
      'Focus on calculus practice problems daily',
      'Review trigonometric identities weekly',
      'Practice past papers under timed conditions',
      'Use graphing calculator for complex functions'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 25,
      afternoon: 45,
      evening: 30
    },
    studyPatterns: {
      consistency: 78,
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      sessionLength: 45
    },
    attendance: {
      classesAttended: 42,
      totalClasses: 48,
      attendanceRate: 87.5
    },
    assessmentBreakdown: {
      tests: { count: 5, average: 74 },
      quizzes: { count: 8, average: 68 },
      assignments: { count: 12, average: 76 },
      projects: { count: 2, average: 82 },
      exams: { count: 1, average: 70 }
    },
    gradeDistribution: {
      A: 2,
      B: 5,
      C: 3,
      D: 1,
      F: 0
    },
    difficultyLevel: 7.2,
    confidenceLevel: 6.8,
    learningResources: {
      textbookUsage: 85,
      videoTutorials: 60,
      practiceProblems: 90,
      groupStudy: 30,
      onlinePlatforms: 75
    },
    engagementMetrics: {
      questionsAsked: 15,
      participationRate: 82,
      resourceDownloads: 8,
      forumActivity: 12
    },
    feedbackData: {
      teacherComments: ['Strong analytical skills', 'Needs more practice with calculus'],
      peerReviews: 4.2,
      selfAssessment: 7.1
    },
    peerComparison: {
      classAverage: 71.5,
      percentile: 65,
      ranking: 15,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.25,
      efficiencyScore: 82,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 15,
        B: 60,
        C: 20,
        D: 5
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Integration Techniques', severity: 'high', lastTested: '2024-01-15' },
      { concept: 'Trigonometric Identities', severity: 'medium', lastTested: '2024-01-10' }
    ],
    learningVelocity: 1.2,
    retentionRate: 78,
    prerequisiteMastery: {
      algebra: 85,
      basicCalculus: 70,
      geometry: 80
    },
    externalFactors: {
      workloadThisWeek: 6.5,
      stressLevel: 5.2,
      sleepQuality: 7.8,
      motivationLevel: 7.1
    },
    careerRelevance: {
      importance: 9,
      interestLevel: 8.5,
      alignment: 'high'
    }
  },
  {
    id: 'physical-sciences',
    name: 'Physical Sciences',
    code: 'PSC',
    description: 'Physics and Chemistry fundamentals',
    progress: 68,
    target: 75,
    averageScore: 65,
    studyHours: 15,
    assignmentsCompleted: 8,
    upcomingDeadlines: 3,
    strength: 'Chemistry',
    weakness: 'Physics',
    lastActivity: '1 day ago',
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    performanceTrend: 'stable',
    weeklyStudyHours: [3, 4, 2, 5, 3, 4, 3],
    topicPerformance: [
      { topic: 'Mechanics', score: 70, trend: 'stable' },
      { topic: 'Electricity & Magnetism', score: 60, trend: 'down' },
      { topic: 'Waves & Optics', score: 68, trend: 'up' },
      { topic: 'Chemical Reactions', score: 62, trend: 'stable' },
      { topic: 'Organic Chemistry', score: 65, trend: 'up' }
    ],
    studyEfficiency: 72,
    predictedScore: 67,
    improvementTips: [
      'Practice physics problem-solving techniques',
      'Focus on chemical equation balancing',
      'Watch demonstration videos for complex concepts',
      'Create formula sheets for quick revision'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 30,
      afternoon: 40,
      evening: 30
    },
    studyPatterns: {
      consistency: 72,
      preferredDays: ['Tuesday', 'Thursday', 'Saturday'],
      sessionLength: 50
    },
    attendance: {
      classesAttended: 40,
      totalClasses: 48,
      attendanceRate: 83.3
    },
    assessmentBreakdown: {
      tests: { count: 4, average: 65 },
      quizzes: { count: 6, average: 62 },
      assignments: { count: 8, average: 68 },
      projects: { count: 1, average: 70 },
      exams: { count: 1, average: 63 }
    },
    gradeDistribution: {
      A: 1,
      B: 3,
      C: 4,
      D: 2,
      F: 0
    },
    difficultyLevel: 8.1,
    confidenceLevel: 5.9,
    learningResources: {
      textbookUsage: 80,
      videoTutorials: 75,
      practiceProblems: 85,
      groupStudy: 40,
      onlinePlatforms: 70
    },
    engagementMetrics: {
      questionsAsked: 12,
      participationRate: 75,
      resourceDownloads: 6,
      forumActivity: 8
    },
    feedbackData: {
      teacherComments: ['Good lab skills', 'Needs improvement in physics concepts'],
      peerReviews: 3.8,
      selfAssessment: 6.2
    },
    peerComparison: {
      classAverage: 67.2,
      percentile: 55,
      ranking: 18,
      trendComparison: 'average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.35,
      efficiencyScore: 68,
      roiTrend: 'stable'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 10,
        B: 45,
        C: 35,
        D: 10
      },
      riskLevel: 'medium',
      interventionNeeded: true
    },
    knowledgeGaps: [
      { concept: 'Electromagnetic Theory', severity: 'high', lastTested: '2024-01-12' },
      { concept: 'Chemical Bonding', severity: 'medium', lastTested: '2024-01-08' }
    ],
    learningVelocity: 0.8,
    retentionRate: 70,
    prerequisiteMastery: {
      mathematics: 72,
      basicPhysics: 65,
      basicChemistry: 68
    },
    externalFactors: {
      workloadThisWeek: 7.2,
      stressLevel: 6.5,
      sleepQuality: 6.8,
      motivationLevel: 6.0
    },
    careerRelevance: {
      importance: 8,
      interestLevel: 7.2,
      alignment: 'medium'
    }
  },
  {
    id: 'life-sciences',
    name: 'Life Sciences',
    code: 'LSC',
    description: 'Biology, Ecology and Human Anatomy',
    progress: 82,
    target: 78,
    averageScore: 79,
    studyHours: 12,
    assignmentsCompleted: 10,
    upcomingDeadlines: 1,
    strength: 'Human Biology',
    weakness: 'Ecology',
    lastActivity: '3 days ago',
    color: 'bg-green-500',
    textColor: 'text-green-600',
    borderColor: 'border-green-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [2, 3, 1, 4, 2, 3, 2],
    topicPerformance: [
      { topic: 'Human Biology', score: 85, trend: 'up' },
      { topic: 'Genetics', score: 78, trend: 'stable' },
      { topic: 'Ecology', score: 72, trend: 'down' },
      { topic: 'Plant Biology', score: 80, trend: 'up' },
      { topic: 'Evolution', score: 76, trend: 'stable' }
    ],
    studyEfficiency: 88,
    predictedScore: 81,
    improvementTips: [
      'Create detailed biological diagrams',
      'Use mnemonics for classification systems',
      'Focus on ecosystem relationships',
      'Practice labeling anatomical structures'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 35,
      afternoon: 35,
      evening: 30
    },
    studyPatterns: {
      consistency: 85,
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      sessionLength: 40
    },
    attendance: {
      classesAttended: 45,
      totalClasses: 48,
      attendanceRate: 93.8
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 79 },
      quizzes: { count: 7, average: 76 },
      assignments: { count: 10, average: 82 },
      projects: { count: 2, average: 85 },
      exams: { count: 1, average: 78 }
    },
    gradeDistribution: {
      A: 3,
      B: 5,
      C: 2,
      D: 0,
      F: 0
    },
    difficultyLevel: 6.5,
    confidenceLevel: 7.8,
    learningResources: {
      textbookUsage: 90,
      videoTutorials: 65,
      practiceProblems: 80,
      groupStudy: 25,
      onlinePlatforms: 70
    },
    engagementMetrics: {
      questionsAsked: 18,
      participationRate: 88,
      resourceDownloads: 10,
      forumActivity: 15
    },
    feedbackData: {
      teacherComments: ['Excellent in human biology', 'Should focus more on ecology'],
      peerReviews: 4.5,
      selfAssessment: 7.9
    },
    peerComparison: {
      classAverage: 74.5,
      percentile: 75,
      ranking: 8,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.18,
      efficiencyScore: 90,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 25,
        B: 65,
        C: 10,
        D: 0
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Ecosystem Dynamics', severity: 'medium', lastTested: '2024-01-14' },
      { concept: 'Photosynthesis Process', severity: 'low', lastTested: '2024-01-09' }
    ],
    learningVelocity: 1.4,
    retentionRate: 82,
    prerequisiteMastery: {
      basicBiology: 85,
      chemistry: 70,
      scientificMethod: 80
    },
    externalFactors: {
      workloadThisWeek: 5.8,
      stressLevel: 4.5,
      sleepQuality: 8.2,
      motivationLevel: 8.0
    },
    careerRelevance: {
      importance: 7,
      interestLevel: 8.8,
      alignment: 'high'
    }
  },
  {
    id: 'english',
    name: 'English Home Language',
    code: 'ENG',
    description: 'Language, Literature and Communication',
    progress: 88,
    target: 85,
    averageScore: 84,
    studyHours: 10,
    assignmentsCompleted: 15,
    upcomingDeadlines: 0,
    strength: 'Literature',
    weakness: 'Creative Writing',
    lastActivity: 'Today',
    color: 'bg-red-500',
    textColor: 'text-red-600',
    borderColor: 'border-red-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [1, 2, 1, 3, 2, 1, 2],
    topicPerformance: [
      { topic: 'Literature Analysis', score: 88, trend: 'up' },
      { topic: 'Comprehension', score: 82, trend: 'stable' },
      { topic: 'Creative Writing', score: 78, trend: 'down' },
      { topic: 'Language Structures', score: 86, trend: 'up' },
      { topic: 'Oral Communication', score: 90, trend: 'up' }
    ],
    studyEfficiency: 92,
    predictedScore: 86,
    improvementTips: [
      'Read diverse literary genres weekly',
      'Practice essay structure templates',
      'Build vocabulary with daily word lists',
      'Record and review oral presentations'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 40,
      afternoon: 30,
      evening: 30
    },
    studyPatterns: {
      consistency: 90,
      preferredDays: ['Tuesday', 'Thursday', 'Sunday'],
      sessionLength: 35
    },
    attendance: {
      classesAttended: 47,
      totalClasses: 48,
      attendanceRate: 97.9
    },
    assessmentBreakdown: {
      tests: { count: 4, average: 84 },
      quizzes: { count: 8, average: 82 },
      assignments: { count: 15, average: 86 },
      projects: { count: 3, average: 88 },
      exams: { count: 1, average: 83 }
    },
    gradeDistribution: {
      A: 5,
      B: 4,
      C: 1,
      D: 0,
      F: 0
    },
    difficultyLevel: 5.8,
    confidenceLevel: 8.5,
    learningResources: {
      textbookUsage: 75,
      videoTutorials: 50,
      practiceProblems: 85,
      groupStudy: 20,
      onlinePlatforms: 60
    },
    engagementMetrics: {
      questionsAsked: 22,
      participationRate: 95,
      resourceDownloads: 12,
      forumActivity: 20
    },
    feedbackData: {
      teacherComments: ['Excellent analytical skills', 'Creative writing needs development'],
      peerReviews: 4.7,
      selfAssessment: 8.3
    },
    peerComparison: {
      classAverage: 78.2,
      percentile: 85,
      ranking: 5,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.15,
      efficiencyScore: 94,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 40,
        B: 55,
        C: 5,
        D: 0
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Creative Writing Techniques', severity: 'medium', lastTested: '2024-01-13' },
      { concept: 'Poetry Analysis', severity: 'low', lastTested: '2024-01-07' }
    ],
    learningVelocity: 1.6,
    retentionRate: 88,
    prerequisiteMastery: {
      grammar: 90,
      vocabulary: 85,
      readingComprehension: 88
    },
    externalFactors: {
      workloadThisWeek: 5.2,
      stressLevel: 4.0,
      sleepQuality: 8.5,
      motivationLevel: 8.7
    },
    careerRelevance: {
      importance: 9,
      interestLevel: 8.2,
      alignment: 'high'
    }
  },
  {
    id: 'afrikaans',
    name: 'Afrikaans FAL',
    code: 'AFR',
    description: 'First Additional Language - Reading and Writing',
    progress: 65,
    target: 70,
    averageScore: 62,
    studyHours: 8,
    assignmentsCompleted: 6,
    upcomingDeadlines: 2,
    strength: 'Reading',
    weakness: 'Writing',
    lastActivity: '4 days ago',
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    borderColor: 'border-orange-200',
    performanceTrend: 'declining',
    weeklyStudyHours: [1, 2, 1, 2, 1, 1, 1],
    topicPerformance: [
      { topic: 'Leesbegrip', score: 68, trend: 'stable' },
      { topic: 'Skryfwerk', score: 55, trend: 'down' },
      { topic: 'Taalstrukture', score: 60, trend: 'stable' },
      { topic: 'Mondeling', score: 70, trend: 'up' },
      { topic: 'Letterkunde', score: 65, trend: 'stable' }
    ],
    studyEfficiency: 65,
    predictedScore: 63,
    improvementTips: [
      'Practice daily conversation in Afrikaans',
      'Read Afrikaans news articles regularly',
      'Focus on verb conjugation patterns',
      'Use language learning apps for vocabulary'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 20,
      afternoon: 35,
      evening: 45
    },
    studyPatterns: {
      consistency: 55,
      preferredDays: ['Monday', 'Wednesday'],
      sessionLength: 30
    },
    attendance: {
      classesAttended: 38,
      totalClasses: 48,
      attendanceRate: 79.2
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 62 },
      quizzes: { count: 5, average: 58 },
      assignments: { count: 6, average: 65 },
      projects: { count: 1, average: 60 },
      exams: { count: 1, average: 59 }
    },
    gradeDistribution: {
      A: 0,
      B: 2,
      C: 4,
      D: 3,
      F: 1
    },
    difficultyLevel: 7.8,
    confidenceLevel: 4.5,
    learningResources: {
      textbookUsage: 70,
      videoTutorials: 80,
      practiceProblems: 65,
      groupStudy: 15,
      onlinePlatforms: 85
    },
    engagementMetrics: {
      questionsAsked: 8,
      participationRate: 60,
      resourceDownloads: 4,
      forumActivity: 6
    },
    feedbackData: {
      teacherComments: ['Good oral skills', 'Writing needs significant improvement'],
      peerReviews: 3.2,
      selfAssessment: 4.8
    },
    peerComparison: {
      classAverage: 65.8,
      percentile: 40,
      ranking: 22,
      trendComparison: 'below_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.45,
      efficiencyScore: 58,
      roiTrend: 'declining'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 5,
        B: 25,
        C: 45,
        D: 25
      },
      riskLevel: 'high',
      interventionNeeded: true
    },
    knowledgeGaps: [
      { concept: 'Sentence Structure', severity: 'high', lastTested: '2024-01-16' },
      { concept: 'Verb Conjugation', severity: 'high', lastTested: '2024-01-11' },
      { concept: 'Vocabulary Building', severity: 'medium', lastTested: '2024-01-08' }
    ],
    learningVelocity: 0.5,
    retentionRate: 62,
    prerequisiteMastery: {
      basicVocabulary: 65,
      grammar: 55,
      pronunciation: 70
    },
    externalFactors: {
      workloadThisWeek: 6.8,
      stressLevel: 7.2,
      sleepQuality: 6.0,
      motivationLevel: 4.5
    },
    careerRelevance: {
      importance: 6,
      interestLevel: 5.0,
      alignment: 'medium'
    }
  },
  // Adding the remaining subjects with their enhanced data...
  {
    id: 'geography',
    name: 'Geography',
    code: 'GEO',
    description: 'Physical and Human Geography',
    progress: 72,
    target: 75,
    averageScore: 70,
    studyHours: 9,
    assignmentsCompleted: 7,
    upcomingDeadlines: 1,
    strength: 'Map Work',
    weakness: 'Climate Studies',
    lastActivity: '2 days ago',
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    performanceTrend: 'stable',
    weeklyStudyHours: [1, 2, 1, 3, 1, 2, 1],
    topicPerformance: [
      { topic: 'Map Work', score: 80, trend: 'up' },
      { topic: 'Climate Studies', score: 62, trend: 'down' },
      { topic: 'Geomorphology', score: 68, trend: 'stable' },
      { topic: 'Population Geography', score: 72, trend: 'up' },
      { topic: 'Economic Geography', score: 70, trend: 'stable' }
    ],
    studyEfficiency: 78,
    predictedScore: 71,
    improvementTips: [
      'Practice topographic map interpretation',
      'Create climate zone flashcards',
      'Study South African case studies',
      'Use GIS tools for spatial analysis'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 25,
      afternoon: 50,
      evening: 25
    },
    studyPatterns: {
      consistency: 70,
      preferredDays: ['Tuesday', 'Thursday', 'Saturday'],
      sessionLength: 40
    },
    attendance: {
      classesAttended: 41,
      totalClasses: 48,
      attendanceRate: 85.4
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 70 },
      quizzes: { count: 6, average: 68 },
      assignments: { count: 7, average: 72 },
      projects: { count: 1, average: 75 },
      exams: { count: 1, average: 69 }
    },
    gradeDistribution: {
      A: 1,
      B: 4,
      C: 3,
      D: 2,
      F: 0
    },
    difficultyLevel: 6.9,
    confidenceLevel: 6.5,
    learningResources: {
      textbookUsage: 80,
      videoTutorials: 70,
      practiceProblems: 75,
      groupStudy: 35,
      onlinePlatforms: 65
    },
    engagementMetrics: {
      questionsAsked: 10,
      participationRate: 78,
      resourceDownloads: 7,
      forumActivity: 9
    },
    feedbackData: {
      teacherComments: ['Excellent map skills', 'Climate concepts need work'],
      peerReviews: 4.0,
      selfAssessment: 6.7
    },
    peerComparison: {
      classAverage: 69.5,
      percentile: 58,
      ranking: 16,
      trendComparison: 'average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.28,
      efficiencyScore: 76,
      roiTrend: 'stable'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 15,
        B: 50,
        C: 30,
        D: 5
      },
      riskLevel: 'medium',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Climate Systems', severity: 'high', lastTested: '2024-01-14' },
      { concept: 'Weather Patterns', severity: 'medium', lastTested: '2024-01-09' }
    ],
    learningVelocity: 0.9,
    retentionRate: 75,
    prerequisiteMastery: {
      basicGeography: 75,
      environmentalScience: 68,
      researchSkills: 72
    },
    externalFactors: {
      workloadThisWeek: 6.0,
      stressLevel: 5.8,
      sleepQuality: 7.2,
      motivationLevel: 6.8
    },
    careerRelevance: {
      importance: 6,
      interestLevel: 7.5,
      alignment: 'medium'
    }
  },
  {
    id: 'accounting',
    name: 'Accounting',
    code: 'ACC',
    description: 'Financial Accounting and Business Principles',
    progress: 79,
    target: 82,
    averageScore: 76,
    studyHours: 14,
    assignmentsCompleted: 9,
    upcomingDeadlines: 2,
    strength: 'Financial Statements',
    weakness: 'Cost Accounting',
    lastActivity: 'Yesterday',
    color: 'bg-indigo-500',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [2, 3, 2, 4, 2, 3, 2],
    topicPerformance: [
      { topic: 'Financial Statements', score: 82, trend: 'up' },
      { topic: 'Cost Accounting', score: 68, trend: 'down' },
      { topic: 'Budgeting', score: 75, trend: 'stable' },
      { topic: 'Partnerships', score: 80, trend: 'up' },
      { topic: 'Companies', score: 78, trend: 'stable' }
    ],
    studyEfficiency: 82,
    predictedScore: 78,
    improvementTips: [
      'Practice ledger entries daily',
      'Master accounting ratios and formulas',
      'Focus on cost allocation methods',
      'Use accounting software for practice'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 35,
      afternoon: 40,
      evening: 25
    },
    studyPatterns: {
      consistency: 80,
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      sessionLength: 50
    },
    attendance: {
      classesAttended: 43,
      totalClasses: 48,
      attendanceRate: 89.6
    },
    assessmentBreakdown: {
      tests: { count: 4, average: 76 },
      quizzes: { count: 7, average: 72 },
      assignments: { count: 9, average: 80 },
      projects: { count: 2, average: 78 },
      exams: { count: 1, average: 74 }
    },
    gradeDistribution: {
      A: 2,
      B: 5,
      C: 3,
      D: 1,
      F: 0
    },
    difficultyLevel: 7.5,
    confidenceLevel: 7.2,
    learningResources: {
      textbookUsage: 85,
      videoTutorials: 60,
      practiceProblems: 90,
      groupStudy: 40,
      onlinePlatforms: 70
    },
    engagementMetrics: {
      questionsAsked: 14,
      participationRate: 84,
      resourceDownloads: 9,
      forumActivity: 11
    },
    feedbackData: {
      teacherComments: ['Strong in financial accounting', 'Cost accounting needs attention'],
      peerReviews: 4.3,
      selfAssessment: 7.4
    },
    peerComparison: {
      classAverage: 72.8,
      percentile: 68,
      ranking: 12,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.22,
      efficiencyScore: 84,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 20,
        B: 60,
        C: 15,
        D: 5
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Cost Allocation Methods', severity: 'high', lastTested: '2024-01-15' },
      { concept: 'Budget Variance Analysis', severity: 'medium', lastTested: '2024-01-10' }
    ],
    learningVelocity: 1.1,
    retentionRate: 79,
    prerequisiteMastery: {
      basicMathematics: 78,
      businessConcepts: 75,
      analyticalSkills: 80
    },
    externalFactors: {
      workloadThisWeek: 6.2,
      stressLevel: 5.5,
      sleepQuality: 7.5,
      motivationLevel: 7.3
    },
    careerRelevance: {
      importance: 8,
      interestLevel: 7.8,
      alignment: 'high'
    }
  },
  {
    id: 'business-studies',
    name: 'Business Studies',
    code: 'BUS',
    description: 'Business Management and Entrepreneurship',
    progress: 85,
    target: 80,
    averageScore: 82,
    studyHours: 11,
    assignmentsCompleted: 11,
    upcomingDeadlines: 1,
    strength: 'Business Management',
    weakness: 'Entrepreneurship',
    lastActivity: 'Today',
    color: 'bg-emerald-500',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [1, 2, 2, 3, 2, 1, 2],
    topicPerformance: [
      { topic: 'Business Management', score: 88, trend: 'up' },
      { topic: 'Entrepreneurship', score: 75, trend: 'stable' },
      { topic: 'Marketing', score: 84, trend: 'up' },
      { topic: 'Human Resources', score: 82, trend: 'stable' },
      { topic: 'Operations Management', score: 80, trend: 'up' }
    ],
    studyEfficiency: 90,
    predictedScore: 84,
    improvementTips: [
      'Analyze real South African business cases',
      'Practice business plan development',
      'Stay updated with economic news',
      'Focus on stakeholder management concepts'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 30,
      afternoon: 45,
      evening: 25
    },
    studyPatterns: {
      consistency: 88,
      preferredDays: ['Tuesday', 'Thursday', 'Saturday'],
      sessionLength: 45
    },
    attendance: {
      classesAttended: 45,
      totalClasses: 48,
      attendanceRate: 93.8
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 82 },
      quizzes: { count: 6, average: 80 },
      assignments: { count: 11, average: 85 },
      projects: { count: 2, average: 88 },
      exams: { count: 1, average: 79 }
    },
    gradeDistribution: {
      A: 4,
      B: 5,
      C: 2,
      D: 0,
      F: 0
    },
    difficultyLevel: 6.2,
    confidenceLevel: 8.0,
    learningResources: {
      textbookUsage: 80,
      videoTutorials: 65,
      practiceProblems: 85,
      groupStudy: 45,
      onlinePlatforms: 75
    },
    engagementMetrics: {
      questionsAsked: 16,
      participationRate: 90,
      resourceDownloads: 11,
      forumActivity: 14
    },
    feedbackData: {
      teacherComments: ['Excellent business acumen', 'Entrepreneurship concepts need practice'],
      peerReviews: 4.6,
      selfAssessment: 8.1
    },
    peerComparison: {
      classAverage: 76.5,
      percentile: 80,
      ranking: 7,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.17,
      efficiencyScore: 92,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 35,
        B: 60,
        C: 5,
        D: 0
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Entrepreneurial Finance', severity: 'medium', lastTested: '2024-01-13' },
      { concept: 'Business Model Innovation', severity: 'low', lastTested: '2024-01-08' }
    ],
    learningVelocity: 1.3,
    retentionRate: 85,
    prerequisiteMastery: {
      economics: 78,
      accounting: 75,
      communication: 85
    },
    externalFactors: {
      workloadThisWeek: 5.5,
      stressLevel: 4.8,
      sleepQuality: 8.0,
      motivationLevel: 8.4
    },
    careerRelevance: {
      importance: 9,
      interestLevel: 8.6,
      alignment: 'high'
    }
  },
  {
    id: 'history',
    name: 'History',
    code: 'HIS',
    description: 'World and South African History',
    progress: 78,
    target: 75,
    averageScore: 76,
    studyHours: 13,
    assignmentsCompleted: 8,
    upcomingDeadlines: 1,
    strength: 'SA History',
    weakness: 'World Wars',
    lastActivity: '2 days ago',
    color: 'bg-amber-500',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    performanceTrend: 'stable',
    weeklyStudyHours: [2, 2, 1, 4, 2, 2, 2],
    topicPerformance: [
      { topic: 'South African History', score: 82, trend: 'up' },
      { topic: 'World Wars', score: 68, trend: 'down' },
      { topic: 'Cold War', score: 75, trend: 'stable' },
      { topic: 'Civil Rights Movements', score: 80, trend: 'up' },
      { topic: 'Ancient Civilizations', score: 78, trend: 'stable' }
    ],
    studyEfficiency: 80,
    predictedScore: 77,
    improvementTips: [
      'Create timeline charts for historical events',
      'Focus on cause-and-effect relationships',
      'Practice source-based questions',
      'Use mind maps for complex topics'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 28,
      afternoon: 42,
      evening: 30
    },
    studyPatterns: {
      consistency: 75,
      preferredDays: ['Monday', 'Wednesday', 'Friday'],
      sessionLength: 55
    },
    attendance: {
      classesAttended: 42,
      totalClasses: 48,
      attendanceRate: 87.5
    },
    assessmentBreakdown: {
      tests: { count: 4, average: 76 },
      quizzes: { count: 5, average: 74 },
      assignments: { count: 8, average: 78 },
      projects: { count: 1, average: 80 },
      exams: { count: 1, average: 75 }
    },
    gradeDistribution: {
      A: 2,
      B: 4,
      C: 3,
      D: 1,
      F: 0
    },
    difficultyLevel: 7.0,
    confidenceLevel: 6.9,
    learningResources: {
      textbookUsage: 85,
      videoTutorials: 70,
      practiceProblems: 75,
      groupStudy: 30,
      onlinePlatforms: 65
    },
    engagementMetrics: {
      questionsAsked: 12,
      participationRate: 82,
      resourceDownloads: 8,
      forumActivity: 10
    },
    feedbackData: {
      teacherComments: ['Strong in SA history', 'World Wars need more focus'],
      peerReviews: 4.1,
      selfAssessment: 7.0
    },
    peerComparison: {
      classAverage: 73.2,
      percentile: 62,
      ranking: 14,
      trendComparison: 'average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.24,
      efficiencyScore: 81,
      roiTrend: 'stable'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 18,
        B: 55,
        C: 22,
        D: 5
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'World War Causes', severity: 'high', lastTested: '2024-01-15' },
      { concept: 'Treaty of Versailles', severity: 'medium', lastTested: '2024-01-10' }
    ],
    learningVelocity: 0.95,
    retentionRate: 77,
    prerequisiteMastery: {
      researchSkills: 78,
      analyticalThinking: 75,
      writingSkills: 80
    },
    externalFactors: {
      workloadThisWeek: 6.5,
      stressLevel: 5.7,
      sleepQuality: 7.3,
      motivationLevel: 6.9
    },
    careerRelevance: {
      importance: 5,
      interestLevel: 7.8,
      alignment: 'medium'
    }
  },
  {
    id: 'economics',
    name: 'Economics',
    code: 'ECO',
    description: 'Micro and Macro Economics Principles',
    progress: 71,
    target: 78,
    averageScore: 69,
    studyHours: 10,
    assignmentsCompleted: 7,
    upcomingDeadlines: 2,
    strength: 'Microeconomics',
    weakness: 'Macroeconomics',
    lastActivity: '3 days ago',
    color: 'bg-pink-500',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [1, 2, 1, 3, 2, 1, 2],
    topicPerformance: [
      { topic: 'Microeconomics', score: 75, trend: 'up' },
      { topic: 'Macroeconomics', score: 62, trend: 'down' },
      { topic: 'International Trade', score: 70, trend: 'stable' },
      { topic: 'Market Structures', score: 72, trend: 'up' },
      { topic: 'Economic Indicators', score: 68, trend: 'stable' }
    ],
    studyEfficiency: 75,
    predictedScore: 70,
    improvementTips: [
      'Practice supply-demand graph analysis',
      'Focus on macroeconomic policy impacts',
      'Study current economic events',
      'Use economic models for predictions'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 32,
      afternoon: 38,
      evening: 30
    },
    studyPatterns: {
      consistency: 68,
      preferredDays: ['Tuesday', 'Thursday'],
      sessionLength: 45
    },
    attendance: {
      classesAttended: 39,
      totalClasses: 48,
      attendanceRate: 81.3
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 69 },
      quizzes: { count: 5, average: 65 },
      assignments: { count: 7, average: 72 },
      projects: { count: 1, average: 70 },
      exams: { count: 1, average: 67 }
    },
    gradeDistribution: {
      A: 1,
      B: 3,
      C: 4,
      D: 2,
      F: 0
    },
    difficultyLevel: 7.8,
    confidenceLevel: 5.8,
    learningResources: {
      textbookUsage: 75,
      videoTutorials: 80,
      practiceProblems: 70,
      groupStudy: 25,
      onlinePlatforms: 85
    },
    engagementMetrics: {
      questionsAsked: 9,
      participationRate: 72,
      resourceDownloads: 6,
      forumActivity: 7
    },
    feedbackData: {
      teacherComments: ['Good microeconomics understanding', 'Macroeconomics needs work'],
      peerReviews: 3.7,
      selfAssessment: 6.0
    },
    peerComparison: {
      classAverage: 67.8,
      percentile: 52,
      ranking: 17,
      trendComparison: 'average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.32,
      efficiencyScore: 70,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 12,
        B: 40,
        C: 35,
        D: 13
      },
      riskLevel: 'medium',
      interventionNeeded: true
    },
    knowledgeGaps: [
      { concept: 'Macroeconomic Policies', severity: 'high', lastTested: '2024-01-14' },
      { concept: 'Fiscal vs Monetary Policy', severity: 'medium', lastTested: '2024-01-09' }
    ],
    learningVelocity: 0.85,
    retentionRate: 69,
    prerequisiteMastery: {
      mathematics: 72,
      businessStudies: 70,
      analyticalSkills: 68
    },
    externalFactors: {
      workloadThisWeek: 6.8,
      stressLevel: 6.2,
      sleepQuality: 6.7,
      motivationLevel: 6.3
    },
    careerRelevance: {
      importance: 7,
      interestLevel: 6.5,
      alignment: 'medium'
    }
  },
  {
    id: 'computer-sciences',
    name: 'Computer Sciences',
    code: 'IT',
    description: 'Programming and Information Technology',
    progress: 81,
    target: 85,
    averageScore: 79,
    studyHours: 16,
    assignmentsCompleted: 10,
    upcomingDeadlines: 1,
    strength: 'Programming',
    weakness: 'Theory',
    lastActivity: 'Today',
    color: 'bg-teal-500',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    performanceTrend: 'improving',
    weeklyStudyHours: [3, 4, 2, 5, 3, 4, 3],
    topicPerformance: [
      { topic: 'Programming', score: 85, trend: 'up' },
      { topic: 'Database Systems', score: 78, trend: 'stable' },
      { topic: 'Computer Theory', score: 72, trend: 'down' },
      { topic: 'Networking', score: 80, trend: 'up' },
      { topic: 'Systems Analysis', score: 76, trend: 'stable' }
    ],
    studyEfficiency: 84,
    predictedScore: 80,
    improvementTips: [
      'Practice coding problems regularly',
      'Focus on algorithm design principles',
      'Build small projects for practical experience',
      'Review computer architecture fundamentals'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 20,
      afternoon: 35,
      evening: 45
    },
    studyPatterns: {
      consistency: 82,
      preferredDays: ['Monday', 'Wednesday', 'Friday', 'Sunday'],
      sessionLength: 60
    },
    attendance: {
      classesAttended: 44,
      totalClasses: 48,
      attendanceRate: 91.7
    },
    assessmentBreakdown: {
      tests: { count: 4, average: 79 },
      quizzes: { count: 6, average: 76 },
      assignments: { count: 10, average: 83 },
      projects: { count: 2, average: 85 },
      exams: { count: 1, average: 77 }
    },
    gradeDistribution: {
      A: 3,
      B: 5,
      C: 2,
      D: 0,
      F: 0
    },
    difficultyLevel: 7.4,
    confidenceLevel: 7.6,
    learningResources: {
      textbookUsage: 70,
      videoTutorials: 90,
      practiceProblems: 95,
      groupStudy: 35,
      onlinePlatforms: 95
    },
    engagementMetrics: {
      questionsAsked: 20,
      participationRate: 88,
      resourceDownloads: 15,
      forumActivity: 25
    },
    feedbackData: {
      teacherComments: ['Excellent programming skills', 'Theory concepts need reinforcement'],
      peerReviews: 4.4,
      selfAssessment: 7.8
    },
    peerComparison: {
      classAverage: 75.5,
      percentile: 72,
      ranking: 10,
      trendComparison: 'above_average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.20,
      efficiencyScore: 86,
      roiTrend: 'improving'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 28,
        B: 62,
        C: 10,
        D: 0
      },
      riskLevel: 'low',
      interventionNeeded: false
    },
    knowledgeGaps: [
      { concept: 'Computer Architecture', severity: 'medium', lastTested: '2024-01-13' },
      { concept: 'Algorithm Complexity', severity: 'medium', lastTested: '2024-01-08' }
    ],
    learningVelocity: 1.25,
    retentionRate: 81,
    prerequisiteMastery: {
      mathematics: 78,
      logicalThinking: 85,
      problemsSolving: 82
    },
    externalFactors: {
      workloadThisWeek: 7.0,
      stressLevel: 5.0,
      sleepQuality: 7.8,
      motivationLevel: 8.2
    },
    careerRelevance: {
      importance: 9,
      interestLevel: 9.0,
      alignment: 'high'
    }
  },
  {
    id: 'tourism',
    name: 'Tourism',
    code: 'TOU',
    description: 'Tourism Industry and Management',
    progress: 69,
    target: 75,
    averageScore: 67,
    studyHours: 8,
    assignmentsCompleted: 6,
    upcomingDeadlines: 1,
    strength: 'SA Tourism',
    weakness: 'Global Tourism',
    lastActivity: '4 days ago',
    color: 'bg-rose-500',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    performanceTrend: 'stable',
    weeklyStudyHours: [1, 2, 1, 2, 1, 1, 1],
    topicPerformance: [
      { topic: 'SA Tourism Attractions', score: 75, trend: 'up' },
      { topic: 'Global Tourism', score: 60, trend: 'down' },
      { topic: 'Tourism Management', score: 68, trend: 'stable' },
      { topic: 'Sustainable Tourism', score: 70, trend: 'up' },
      { topic: 'Tourism Marketing', score: 65, trend: 'stable' }
    ],
    studyEfficiency: 70,
    predictedScore: 68,
    improvementTips: [
      'Research South African tourist destinations',
      'Study global tourism trends',
      'Practice tourism case studies',
      'Focus on sustainable tourism practices'
    ],
    // New analytics fields
    timeOfDay: {
      morning: 25,
      afternoon: 40,
      evening: 35
    },
    studyPatterns: {
      consistency: 60,
      preferredDays: ['Tuesday', 'Thursday'],
      sessionLength: 35
    },
    attendance: {
      classesAttended: 37,
      totalClasses: 48,
      attendanceRate: 77.1
    },
    assessmentBreakdown: {
      tests: { count: 3, average: 67 },
      quizzes: { count: 4, average: 63 },
      assignments: { count: 6, average: 70 },
      projects: { count: 1, average: 68 },
      exams: { count: 1, average: 65 }
    },
    gradeDistribution: {
      A: 0,
      B: 2,
      C: 5,
      D: 2,
      F: 1
    },
    difficultyLevel: 6.5,
    confidenceLevel: 5.5,
    learningResources: {
      textbookUsage: 75,
      videoTutorials: 65,
      practiceProblems: 60,
      groupStudy: 20,
      onlinePlatforms: 70
    },
    engagementMetrics: {
      questionsAsked: 7,
      participationRate: 65,
      resourceDownloads: 5,
      forumActivity: 6
    },
    feedbackData: {
      teacherComments: ['Good knowledge of SA tourism', 'Global perspective needs development'],
      peerReviews: 3.5,
      selfAssessment: 5.8
    },
    peerComparison: {
      classAverage: 66.2,
      percentile: 48,
      ranking: 19,
      trendComparison: 'average'
    },
    effortVsReturn: {
      hoursPerPoint: 0.38,
      efficiencyScore: 65,
      roiTrend: 'stable'
    },
    predictionMetrics: {
      finalGradeProbability: {
        A: 8,
        B: 35,
        C: 42,
        D: 15
      },
      riskLevel: 'medium',
      interventionNeeded: true
    },
    knowledgeGaps: [
      { concept: 'Global Tourism Trends', severity: 'high', lastTested: '2024-01-15' },
      { concept: 'International Tourism Organizations', severity: 'medium', lastTested: '2024-01-10' }
    ],
    learningVelocity: 0.7,
    retentionRate: 66,
    prerequisiteMastery: {
      geography: 68,
      businessStudies: 65,
      researchSkills: 62
    },
    externalFactors: {
      workloadThisWeek: 5.5,
      stressLevel: 6.0,
      sleepQuality: 6.5,
      motivationLevel: 5.7
    },
    careerRelevance: {
      importance: 5,
      interestLevel: 6.2,
      alignment: 'low'
    }
  }
]

export default subjectsData