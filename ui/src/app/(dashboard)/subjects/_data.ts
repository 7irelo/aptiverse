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
    },
    // Enhanced Hyper-Detailed Analytics
    cognitiveAnalytics: {
      problemSolvingSpeed: 7.2,
      conceptualUnderstanding: 6.8,
      applicationSkills: 7.5,
      memoryRetention: 8.1,
      analyticalThinking: 7.9,
      patternRecognition: 8.3
    },
    learningBehavior: {
      studyConsistency: 82,
      peakLearningHours: ['14:00', '16:00', '19:00'],
      preferredLearningStyle: 'visual',
      attentionSpan: 45,
      breakFrequency: 25,
      multiTaskingTendency: 2.1
    },
    emotionalAnalytics: {
      confidenceLevel: 6.8,
      anxietyLevel: 5.2,
      motivation: 7.5,
      frustrationPoints: ['calculus_problems', 'time_pressure'],
      enjoymentFactors: ['geometry_puzzles', 'algebra_solutions']
    },
    skillDevelopment: {
      criticalThinking: 7.8,
      logicalReasoning: 8.2,
      spatialAwareness: 7.5,
      numericalFluency: 8.0,
      abstractThinking: 7.2
    },
    assessmentPatterns: {
      testAnxiety: 6.1,
      timeManagement: 7.8,
      errorAnalysis: {
        carelessMistakes: 15,
        conceptualErrors: 25,
        calculationErrors: 30,
        misunderstanding: 20,
        other: 10
      },
      improvementRate: 1.2
    },
    socialLearning: {
      groupStudyEffectiveness: 6.5,
      peerLearningScore: 7.2,
      teachingOthersScore: 8.1,
      collaborationFrequency: 3
    },
    resourceUtilization: {
      videoTutorials: 85,
      practiceProblems: 92,
      textbook: 78,
      onlinePlatforms: 88,
      teacherSupport: 65,
      peerSupport: 72
    },
    metacognitiveInsights: {
      selfAssessmentAccuracy: 7.1,
      learningStrategyEffectiveness: 8.2,
      goalSettingQuality: 7.8,
      reflectionFrequency: 6.9
    },
    performancePredictors: {
      homeworkCompletion: 88,
      classParticipation: 82,
      revisionConsistency: 75,
      practiceFrequency: 90
    },
    interventionMetrics: {
      recommendedInterventions: [
        'calculus_foundation_bootcamp',
        'time_management_workshop',
        'test_anxiety_reduction'
      ],
      urgencyLevel: 'medium',
      estimatedImprovement: 8
    },
    performanceHistory: {
      weeklyScores: [68, 70, 72, 71, 73, 72, 74],
      monthlyTrend: 'improving',
      seasonalVariation: 2.1,
      volatility: 1.8
    },
    learningGaps: {
      fundamentalGaps: [
        { concept: 'limits_and_continuity', severity: 'high', impact: 15 },
        { concept: 'integration_techniques', severity: 'high', impact: 12 },
        { concept: 'trigonometric_functions', severity: 'medium', impact: 8 }
      ],
      prerequisiteGaps: [
        { concept: 'algebraic_manipulation', severity: 'low', impact: 5 },
        { concept: 'function_analysis', severity: 'medium', impact: 7 }
      ]
    },
    adaptiveLearning: {
      recommendedDifficulty: 'intermediate_advanced',
      learningPath: 'calculus_focused',
      nextTopics: ['differential_equations', 'multivariable_calculus'],
      masteryLevel: 72
    },
    wellnessCorrelation: {
      sleepImpact: 0.42,
      stressImpact: -0.38,
      exerciseCorrelation: 0.28,
      nutritionImpact: 0.19
    },
    careerAlignment: {
      stemRelevance: 9.2,
      requiredSkills: ['analytical_thinking', 'problem_solving', 'logical_reasoning'],
      futureApplications: ['engineering', 'data_science', 'research']
    },
    currentSession: {
      activeTime: 35,
      focusScore: 82,
      distractionCount: 3,
      topicsCovered: ['integration', 'limits'],
      conceptsMastered: 2,
      practiceProblemsAttempted: 15,
      accuracyRate: 73
    },
    predictiveAnalytics: {
      finalExamScore: {
        predicted: 74,
        confidence: 78,
        range: [70, 78]
      },
      universityReadiness: 7.8,
      subjectMasteryTimeline: '12_weeks'
    },
    comparativeAnalytics: {
      schoolPercentile: 65,
      nationalPercentile: 58,
      improvementRatePercentile: 72,
      efficiencyPercentile: 68
    },
    achievementMetrics: {
      streakDays: 12,
      badgesEarned: 8,
      level: 'intermediate',
      pointsThisWeek: 450,
      ranking: 15
    },
    stakeholderInsights: {
      teacherComments: [
        {
          date: '2024-01-15',
          comment: 'Strong analytical skills, needs more calculus practice',
          sentiment: 'positive',
          priority: 'medium'
        }
      ],
      parentObservations: [
        {
          date: '2024-01-14',
          observation: 'Spends adequate time on math homework',
          confidence: 8
        }
      ]
    },
    aiRecommendations: {
      studySchedule: {
        monday: ['calculus', '2 hours'],
        wednesday: ['algebra_review', '1 hour'],
        friday: ['mixed_practice', '2 hours']
      },
      resources: [
        'khan_academy_calculus',
        'patrickJMT_youtube',
        'practice_workbook_chapter_5'
      ],
      techniques: [
        'spaced_repetition',
        'interleaved_practice',
        'retrieval_practice'
      ]
    },
    eqMetrics: {
      resilience: 7.2,
      growthMindset: 8.1,
      selfEfficacy: 6.9,
      learningEnjoyment: 7.5
    },
    environmentFactors: {
      studySpaceQuality: 8.5,
      digitalToolsUsage: 9.2,
      supportSystem: 7.8,
      distractionLevel: 3.2
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
    },
    // Enhanced Hyper-Detailed Analytics
    cognitiveAnalytics: {
      problemSolvingSpeed: 6.5,
      conceptualUnderstanding: 5.8,
      applicationSkills: 6.2,
      memoryRetention: 7.1,
      analyticalThinking: 6.8,
      patternRecognition: 6.4
    },
    learningBehavior: {
      studyConsistency: 68,
      peakLearningHours: ['15:00', '17:00', '20:00'],
      preferredLearningStyle: 'kinesthetic',
      attentionSpan: 40,
      breakFrequency: 30,
      multiTaskingTendency: 3.2
    },
    emotionalAnalytics: {
      confidenceLevel: 5.9,
      anxietyLevel: 6.8,
      motivation: 6.2,
      frustrationPoints: ['physics_calculations', 'abstract_concepts'],
      enjoymentFactors: ['chemistry_experiments', 'practical_applications']
    },
    skillDevelopment: {
      criticalThinking: 6.5,
      logicalReasoning: 6.8,
      spatialAwareness: 7.2,
      numericalFluency: 6.9,
      abstractThinking: 5.8
    },
    assessmentPatterns: {
      testAnxiety: 7.2,
      timeManagement: 6.5,
      errorAnalysis: {
        carelessMistakes: 20,
        conceptualErrors: 35,
        calculationErrors: 25,
        misunderstanding: 15,
        other: 5
      },
      improvementRate: 0.6
    },
    socialLearning: {
      groupStudyEffectiveness: 7.8,
      peerLearningScore: 6.5,
      teachingOthersScore: 6.2,
      collaborationFrequency: 4
    },
    resourceUtilization: {
      videoTutorials: 75,
      practiceProblems: 85,
      textbook: 80,
      onlinePlatforms: 70,
      teacherSupport: 72,
      peerSupport: 68
    },
    metacognitiveInsights: {
      selfAssessmentAccuracy: 6.2,
      learningStrategyEffectiveness: 6.8,
      goalSettingQuality: 6.5,
      reflectionFrequency: 5.8
    },
    performancePredictors: {
      homeworkCompletion: 75,
      classParticipation: 72,
      revisionConsistency: 68,
      practiceFrequency: 80
    },
    interventionMetrics: {
      recommendedInterventions: [
        'physics_foundation_course',
        'concept_visualization_training',
        'anxiety_management'
      ],
      urgencyLevel: 'high',
      estimatedImprovement: 12
    },
    performanceHistory: {
      weeklyScores: [62, 63, 65, 64, 65, 66, 65],
      monthlyTrend: 'stable',
      seasonalVariation: 3.2,
      volatility: 2.5
    },
    learningGaps: {
      fundamentalGaps: [
        { concept: 'quantum_mechanics', severity: 'high', impact: 18 },
        { concept: 'thermodynamics', severity: 'high', impact: 15 },
        { concept: 'organic_chemistry_reactions', severity: 'medium', impact: 10 }
      ],
      prerequisiteGaps: [
        { concept: 'mathematical_modeling', severity: 'high', impact: 12 },
        { concept: 'scientific_methodology', severity: 'medium', impact: 8 }
      ]
    },
    adaptiveLearning: {
      recommendedDifficulty: 'intermediate',
      learningPath: 'physics_remediation',
      nextTopics: ['modern_physics', 'chemical_kinetics'],
      masteryLevel: 65
    },
    wellnessCorrelation: {
      sleepImpact: 0.48,
      stressImpact: -0.52,
      exerciseCorrelation: 0.22,
      nutritionImpact: 0.25
    },
    careerAlignment: {
      stemRelevance: 8.8,
      requiredSkills: ['scientific_method', 'experimental_design', 'data_analysis'],
      futureApplications: ['engineering', 'medicine', 'research']
    },
    currentSession: {
      activeTime: 42,
      focusScore: 75,
      distractionCount: 5,
      topicsCovered: ['electromagnetism', 'chemical_bonding'],
      conceptsMastered: 1,
      practiceProblemsAttempted: 12,
      accuracyRate: 65
    },
    predictiveAnalytics: {
      finalExamScore: {
        predicted: 67,
        confidence: 72,
        range: [62, 72]
      },
      universityReadiness: 6.5,
      subjectMasteryTimeline: '16_weeks'
    },
    comparativeAnalytics: {
      schoolPercentile: 55,
      nationalPercentile: 52,
      improvementRatePercentile: 48,
      efficiencyPercentile: 58
    },
    achievementMetrics: {
      streakDays: 8,
      badgesEarned: 5,
      level: 'beginner_intermediate',
      pointsThisWeek: 320,
      ranking: 22
    },
    stakeholderInsights: {
      teacherComments: [
        {
          date: '2024-01-14',
          comment: 'Struggles with abstract physics concepts, good practical skills',
          sentiment: 'constructive',
          priority: 'high'
        }
      ],
      parentObservations: [
        {
          date: '2024-01-13',
          observation: 'Finds physics challenging but tries hard',
          confidence: 7
        }
      ]
    },
    aiRecommendations: {
      studySchedule: {
        tuesday: ['physics_concepts', '2 hours'],
        thursday: ['chemistry_practice', '1.5 hours'],
        saturday: ['mixed_revision', '2 hours']
      },
      resources: [
        'physics_classroom_videos',
        'virtual_lab_simulations',
        'interactive_periodic_table'
      ],
      techniques: [
        'concept_mapping',
        'experimental_learning',
        'peer_explanation'
      ]
    },
    eqMetrics: {
      resilience: 6.8,
      growthMindset: 7.2,
      selfEfficacy: 5.9,
      learningEnjoyment: 6.5
    },
    environmentFactors: {
      studySpaceQuality: 7.8,
      digitalToolsUsage: 8.5,
      supportSystem: 7.2,
      distractionLevel: 4.5
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
    },
    // Enhanced Hyper-Detailed Analytics
    cognitiveAnalytics: {
      problemSolvingSpeed: 7.8,
      conceptualUnderstanding: 8.2,
      applicationSkills: 7.5,
      memoryRetention: 8.8,
      analyticalThinking: 7.9,
      patternRecognition: 8.1
    },
    learningBehavior: {
      studyConsistency: 88,
      peakLearningHours: ['09:00', '14:00', '18:00'],
      preferredLearningStyle: 'visual_verbal',
      attentionSpan: 50,
      breakFrequency: 20,
      multiTaskingTendency: 1.8
    },
    emotionalAnalytics: {
      confidenceLevel: 7.8,
      anxietyLevel: 3.8,
      motivation: 8.5,
      frustrationPoints: ['ecological_terminology', 'classification_systems'],
      enjoymentFactors: ['human_anatomy', 'genetic_studies']
    },
    skillDevelopment: {
      criticalThinking: 8.2,
      logicalReasoning: 7.8,
      spatialAwareness: 8.5,
      numericalFluency: 7.2,
      abstractThinking: 7.5
    },
    assessmentPatterns: {
      testAnxiety: 4.2,
      timeManagement: 8.5,
      errorAnalysis: {
        carelessMistakes: 10,
        conceptualErrors: 15,
        calculationErrors: 8,
        misunderstanding: 12,
        other: 5
      },
      improvementRate: 1.8
    },
    socialLearning: {
      groupStudyEffectiveness: 6.8,
      peerLearningScore: 7.5,
      teachingOthersScore: 8.2,
      collaborationFrequency: 2
    },
    resourceUtilization: {
      videoTutorials: 65,
      practiceProblems: 80,
      textbook: 90,
      onlinePlatforms: 70,
      teacherSupport: 85,
      peerSupport: 72
    },
    metacognitiveInsights: {
      selfAssessmentAccuracy: 7.9,
      learningStrategyEffectiveness: 8.8,
      goalSettingQuality: 8.2,
      reflectionFrequency: 7.5
    },
    performancePredictors: {
      homeworkCompletion: 92,
      classParticipation: 88,
      revisionConsistency: 85,
      practiceFrequency: 78
    },
    interventionMetrics: {
      recommendedInterventions: [
        'ecology_immersion',
        'classification_systems_workshop'
      ],
      urgencyLevel: 'low',
      estimatedImprovement: 5
    },
    performanceHistory: {
      weeklyScores: [75, 77, 78, 79, 80, 79, 81],
      monthlyTrend: 'improving',
      seasonalVariation: 1.5,
      volatility: 1.2
    },
    learningGaps: {
      fundamentalGaps: [
        { concept: 'population_ecology', severity: 'medium', impact: 8 },
        { concept: 'biogeochemical_cycles', severity: 'low', impact: 5 }
      ],
      prerequisiteGaps: [
        { concept: 'basic_chemistry_concepts', severity: 'low', impact: 3 }
      ]
    },
    adaptiveLearning: {
      recommendedDifficulty: 'advanced',
      learningPath: 'ecology_enhancement',
      nextTopics: ['molecular_biology', 'biotechnology'],
      masteryLevel: 82
    },
    wellnessCorrelation: {
      sleepImpact: 0.35,
      stressImpact: -0.28,
      exerciseCorrelation: 0.32,
      nutritionImpact: 0.42
    },
    careerAlignment: {
      stemRelevance: 8.5,
      requiredSkills: ['scientific_literacy', 'research_methods', 'analytical_thinking'],
      futureApplications: ['medicine', 'biotechnology', 'environmental_science']
    },
    currentSession: {
      activeTime: 38,
      focusScore: 88,
      distractionCount: 2,
      topicsCovered: ['genetics', 'cell_biology'],
      conceptsMastered: 3,
      practiceProblemsAttempted: 18,
      accuracyRate: 82
    },
    predictiveAnalytics: {
      finalExamScore: {
        predicted: 81,
        confidence: 85,
        range: [78, 84]
      },
      universityReadiness: 8.2,
      subjectMasteryTimeline: '8_weeks'
    },
    comparativeAnalytics: {
      schoolPercentile: 75,
      nationalPercentile: 72,
      improvementRatePercentile: 82,
      efficiencyPercentile: 88
    },
    achievementMetrics: {
      streakDays: 15,
      badgesEarned: 12,
      level: 'advanced',
      pointsThisWeek: 520,
      ranking: 6
    },
    stakeholderInsights: {
      teacherComments: [
        {
          date: '2024-01-16',
          comment: 'Excellent grasp of biological concepts, strong in human anatomy',
          sentiment: 'positive',
          priority: 'low'
        }
      ],
      parentObservations: [
        {
          date: '2024-01-15',
          observation: 'Very interested in biology topics, self-motivated',
          confidence: 9
        }
      ]
    },
    aiRecommendations: {
      studySchedule: {
        monday: ['ecology_focus', '1.5 hours'],
        wednesday: ['genetics_review', '1 hour'],
        friday: ['comprehensive_revision', '2 hours']
      },
      resources: [
        'interactive_anatomy_models',
        'genetics_simulations',
        'ecology_field_studies'
      ],
      techniques: [
        'diagram_based_learning',
        'mnemonic_devices',
        'concept_association'
      ]
    },
    eqMetrics: {
      resilience: 8.2,
      growthMindset: 8.8,
      selfEfficacy: 7.9,
      learningEnjoyment: 8.7
    },
    environmentFactors: {
      studySpaceQuality: 8.8,
      digitalToolsUsage: 8.2,
      supportSystem: 8.5,
      distractionLevel: 2.5
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
    },
    // Enhanced Hyper-Detailed Analytics
    cognitiveAnalytics: {
      problemSolvingSpeed: 8.2,
      conceptualUnderstanding: 8.8,
      applicationSkills: 8.5,
      memoryRetention: 8.9,
      analyticalThinking: 8.7,
      patternRecognition: 8.4
    },
    learningBehavior: {
      studyConsistency: 92,
      peakLearningHours: ['10:00', '15:00', '19:00'],
      preferredLearningStyle: 'verbal_linguistic',
      attentionSpan: 55,
      breakFrequency: 15,
      multiTaskingTendency: 1.5
    },
    emotionalAnalytics: {
      confidenceLevel: 8.5,
      anxietyLevel: 3.2,
      motivation: 8.8,
      frustrationPoints: ['creative_writing_blocks', 'poetry_interpretation'],
      enjoymentFactors: ['literary_analysis', 'debate_discussion']
    },
    skillDevelopment: {
      criticalThinking: 8.8,
      logicalReasoning: 8.2,
      spatialAwareness: 7.5,
      numericalFluency: 7.8,
      abstractThinking: 8.5
    },
    assessmentPatterns: {
      testAnxiety: 3.5,
      timeManagement: 9.2,
      errorAnalysis: {
        carelessMistakes: 8,
        conceptualErrors: 12,
        calculationErrors: 5,
        misunderstanding: 10,
        other: 3
      },
      improvementRate: 2.1
    },
    socialLearning: {
      groupStudyEffectiveness: 7.2,
      peerLearningScore: 8.5,
      teachingOthersScore: 8.8,
      collaborationFrequency: 5
    },
    resourceUtilization: {
      videoTutorials: 50,
      practiceProblems: 85,
      textbook: 75,
      onlinePlatforms: 60,
      teacherSupport: 90,
      peerSupport: 82
    },
    metacognitiveInsights: {
      selfAssessmentAccuracy: 8.3,
      learningStrategyEffectiveness: 9.2,
      goalSettingQuality: 8.8,
      reflectionFrequency: 8.5
    },
    performancePredictors: {
      homeworkCompletion: 95,
      classParticipation: 95,
      revisionConsistency: 88,
      practiceFrequency: 85
    },
    interventionMetrics: {
      recommendedInterventions: [
        'creative_writing_workshop',
        'poetry_analysis_practice'
      ],
      urgencyLevel: 'low',
      estimatedImprovement: 4
    },
    performanceHistory: {
      weeklyScores: [80, 82, 83, 84, 85, 84, 86],
      monthlyTrend: 'improving',
      seasonalVariation: 1.2,
      volatility: 0.9
    },
    learningGaps: {
      fundamentalGaps: [
        { concept: 'narrative_techniques', severity: 'medium', impact: 6 },
        { concept: 'poetic_devices', severity: 'low', impact: 3 }
      ],
      prerequisiteGaps: [
        { concept: 'advanced_vocabulary', severity: 'low', impact: 2 }
      ]
    },
    adaptiveLearning: {
      recommendedDifficulty: 'advanced',
      learningPath: 'creative_writing_enhancement',
      nextTopics: ['advanced_rhetoric', 'literary_criticism'],
      masteryLevel: 88
    },
    wellnessCorrelation: {
      sleepImpact: 0.28,
      stressImpact: -0.22,
      exerciseCorrelation: 0.25,
      nutritionImpact: 0.18
    },
    careerAlignment: {
      stemRelevance: 7.2,
      requiredSkills: ['communication', 'critical_analysis', 'creative_expression'],
      futureApplications: ['law', 'journalism', 'education', 'writing']
    },
    currentSession: {
      activeTime: 32,
      focusScore: 92,
      distractionCount: 1,
      topicsCovered: ['essay_writing', 'literary_analysis'],
      conceptsMastered: 4,
      practiceProblemsAttempted: 20,
      accuracyRate: 88
    },
    predictiveAnalytics: {
      finalExamScore: {
        predicted: 86,
        confidence: 90,
        range: [84, 88]
      },
      universityReadiness: 8.8,
      subjectMasteryTimeline: '6_weeks'
    },
    comparativeAnalytics: {
      schoolPercentile: 85,
      nationalPercentile: 82,
      improvementRatePercentile: 88,
      efficiencyPercentile: 92
    },
    achievementMetrics: {
      streakDays: 18,
      badgesEarned: 15,
      level: 'expert',
      pointsThisWeek: 580,
      ranking: 3
    },
    stakeholderInsights: {
      teacherComments: [
        {
          date: '2024-01-17',
          comment: 'Exceptional literary analysis skills, creative writing shows potential',
          sentiment: 'positive',
          priority: 'low'
        }
      ],
      parentObservations: [
        {
          date: '2024-01-16',
          observation: 'Loves reading and discussing literature, very articulate',
          confidence: 9
        }
      ]
    },
    aiRecommendations: {
      studySchedule: {
        tuesday: ['creative_writing', '1 hour'],
        thursday: ['literature_analysis', '1.5 hours'],
        sunday: ['comprehensive_review', '1 hour']
      },
      resources: [
        'writing_prompts_database',
        'literary_analysis_guides',
        'vocabulary_building_apps'
      ],
      techniques: [
        'free_writing_practice',
        'peer_review_circles',
        'rhetorical_analysis'
      ]
    },
    eqMetrics: {
      resilience: 8.5,
      growthMindset: 9.0,
      selfEfficacy: 8.7,
      learningEnjoyment: 9.2
    },
    environmentFactors: {
      studySpaceQuality: 9.2,
      digitalToolsUsage: 8.8,
      supportSystem: 9.0,
      distractionLevel: 1.8
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
    },
    // Enhanced Hyper-Detailed Analytics
    cognitiveAnalytics: {
      problemSolvingSpeed: 5.8,
      conceptualUnderstanding: 5.2,
      applicationSkills: 4.8,
      memoryRetention: 6.2,
      analyticalThinking: 5.5,
      patternRecognition: 6.0
    },
    learningBehavior: {
      studyConsistency: 52,
      peakLearningHours: ['16:00', '20:00'],
      preferredLearningStyle: 'auditory',
      attentionSpan: 25,
      breakFrequency: 35,
      multiTaskingTendency: 4.2
    },
    emotionalAnalytics: {
      confidenceLevel: 4.5,
      anxietyLevel: 7.8,
      motivation: 4.2,
      frustrationPoints: ['grammar_rules', 'writing_tasks'],
      enjoymentFactors: ['oral_practice', 'listening_comprehension']
    },
    skillDevelopment: {
      criticalThinking: 5.2,
      logicalReasoning: 5.8,
      spatialAwareness: 6.5,
      numericalFluency: 7.2,
      abstractThinking: 4.8
    },
    assessmentPatterns: {
      testAnxiety: 8.2,
      timeManagement: 5.2,
      errorAnalysis: {
        carelessMistakes: 25,
        conceptualErrors: 40,
        calculationErrors: 15,
        misunderstanding: 12,
        other: 8
      },
      improvementRate: -0.3
    },
    socialLearning: {
      groupStudyEffectiveness: 6.2,
      peerLearningScore: 5.5,
      teachingOthersScore: 4.8,
      collaborationFrequency: 1
    },
    resourceUtilization: {
      videoTutorials: 80,
      practiceProblems: 65,
      textbook: 70,
      onlinePlatforms: 85,
      teacherSupport: 45,
      peerSupport: 38
    },
    metacognitiveInsights: {
      selfAssessmentAccuracy: 4.8,
      learningStrategyEffectiveness: 5.2,
      goalSettingQuality: 4.5,
      reflectionFrequency: 3.8
    },
    performancePredictors: {
      homeworkCompletion: 60,
      classParticipation: 58,
      revisionConsistency: 45,
      practiceFrequency: 52
    },
    interventionMetrics: {
      recommendedInterventions: [
        'intensive_grammar_bootcamp',
        'writing_foundation_course',
        'confidence_building_workshop'
      ],
      urgencyLevel: 'critical',
      estimatedImprovement: 15
    },
    performanceHistory: {
      weeklyScores: [65, 64, 63, 62, 61, 62, 62],
      monthlyTrend: 'declining',
      seasonalVariation: 4.5,
      volatility: 3.2
    },
    learningGaps: {
      fundamentalGaps: [
        { concept: 'sentence_structure', severity: 'high', impact: 25 },
        { concept: 'verb_conjugation', severity: 'high', impact: 22 },
        { concept: 'vocabulary_building', severity: 'medium', impact: 15 }
      ],
      prerequisiteGaps: [
        { concept: 'basic_grammar', severity: 'high', impact: 20 },
        { concept: 'language_foundation', severity: 'high', impact: 18 }
      ]
    },
    adaptiveLearning: {
      recommendedDifficulty: 'beginner',
      learningPath: 'foundational_remediation',
      nextTopics: ['basic_grammar', 'sentence_construction'],
      masteryLevel: 55
    },
    wellnessCorrelation: {
      sleepImpact: 0.52,
      stressImpact: -0.65,
      exerciseCorrelation: 0.18,
      nutritionImpact: 0.22
    },
    careerAlignment: {
      stemRelevance: 4.5,
      requiredSkills: ['communication', 'cultural_understanding'],
      futureApplications: ['tourism', 'customer_service', 'education']
    },
    currentSession: {
      activeTime: 25,
      focusScore: 58,
      distractionCount: 8,
      topicsCovered: ['basic_grammar'],
      conceptsMastered: 0,
      practiceProblemsAttempted: 8,
      accuracyRate: 55
    },
    predictiveAnalytics: {
      finalExamScore: {
        predicted: 63,
        confidence: 65,
        range: [58, 68]
      },
      universityReadiness: 5.2,
      subjectMasteryTimeline: '20_weeks'
    },
    comparativeAnalytics: {
      schoolPercentile: 40,
      nationalPercentile: 38,
      improvementRatePercentile: 25,
      efficiencyPercentile: 42
    },
    achievementMetrics: {
      streakDays: 3,
      badgesEarned: 2,
      level: 'beginner',
      pointsThisWeek: 180,
      ranking: 28
    },
    stakeholderInsights: {
      teacherComments: [
        {
          date: '2024-01-18',
          comment: 'Needs intensive support in writing and grammar fundamentals',
          sentiment: 'concerned',
          priority: 'critical'
        }
      ],
      parentObservations: [
        {
          date: '2024-01-17',
          observation: 'Finds Afrikaans challenging, avoids practice',
          confidence: 6
        }
      ]
    },
    aiRecommendations: {
      studySchedule: {
        monday: ['grammar_fundamentals', '1 hour'],
        wednesday: ['vocabulary_building', '45 mins'],
        friday: ['writing_practice', '1 hour'],
        sunday: ['oral_practice', '30 mins']
      },
      resources: [
        'language_learning_app',
        'grammar_exercises',
        'audio_comprehension_tools'
      ],
      techniques: [
        'spaced_repetition',
        'immersion_techniques',
        'progressive_learning'
      ]
    },
    eqMetrics: {
      resilience: 4.2,
      growthMindset: 5.0,
      selfEfficacy: 3.8,
      learningEnjoyment: 4.0
    },
    environmentFactors: {
      studySpaceQuality: 6.5,
      digitalToolsUsage: 8.2,
      supportSystem: 5.8,
      distractionLevel: 6.8
    }
  }
  // Note: Remaining subjects (Geography, Accounting, Business Studies, History, Economics, Computer Sciences, Tourism)
  // would follow the same enhanced structure pattern with their specific data
]

// Analytics Helper Functions
export const calculateOverallProgress = (subjects: any) => {
  const totalProgress = subjects.reduce((sum: any, subject: any) => sum + subject.progress, 0);
  return Math.round(totalProgress / subjects.length);
};

export const getSubjectPerformanceTrend = (subject: any) => {
  const scores = subject.performanceHistory?.weeklyScores || [];
  if (scores.length < 2) return 'stable';
  
  const recentTrend = scores.slice(-3);
  const trendValue = (recentTrend[recentTrend.length - 1] - recentTrend[0]) / recentTrend.length;
  
  if (trendValue > 0.5) return 'improving';
  if (trendValue < -0.5) return 'declining';
  return 'stable';
};

export const generateStudyRecommendations = (subject: any) => {
  const recommendations = [];
  
  if (subject.studyEfficiency < 70) {
    recommendations.push('Improve study techniques and focus management');
  }
  
  if (subject.attendance.attendanceRate < 85) {
    recommendations.push('Increase class attendance and participation');
  }
  
  if (subject.knowledgeGaps.some((gap: any) => gap.severity === 'high')) {
    recommendations.push('Focus on addressing high-priority knowledge gaps');
  }
  
  return recommendations;
};

export const calculateLearningEfficiency = (subject: any) => {
  const studyHours = subject.studyHours;
  const scoreImprovement = subject.averageScore - 50; // Assuming 50 as baseline
  return Math.round((scoreImprovement / studyHours) * 10);
};

export default subjectsData;