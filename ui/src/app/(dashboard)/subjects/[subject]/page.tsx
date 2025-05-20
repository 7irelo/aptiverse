"use client"
import { useState, useEffect } from 'react'
import { 
  ArrowLeft, 
  Save, 
  BookOpen, 
  Calendar, 
  Target, 
  BarChart3, 
  Clock, 
  Users, 
  FileText,
  Upload,
  X,
  Plus,
  Trash2,
  Edit3,
  Menu
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// Mock data - replace with your actual data source
const mockSubjectData = {
  id: '1',
  name: 'Mathematics',
  code: 'MAT',
  color: 'bg-blue-500',
  description: 'Advanced mathematics including algebra, calculus, and geometry',
  targetGrade: 85,
  currentGrade: 78,
  progress: 65,
  studyHours: 120,
  assignmentsCompleted: 12,
  upcomingDeadlines: 3,
  teacher: 'Dr. Sarah Johnson',
  room: 'Room 301',
  schedule: 'Mon, Wed, Fri - 9:00 AM',
  resources: [
    { id: 1, name: 'Course Syllabus.pdf', type: 'pdf', size: '2.4 MB', uploaded: '2024-01-15' },
    { id: 2, name: 'Algebra Textbook.pdf', type: 'pdf', size: '15.2 MB', uploaded: '2024-01-20' },
    { id: 3, name: 'Practice Problems Set 1.docx', type: 'doc', size: '1.1 MB', uploaded: '2024-02-01' },
  ],
  goals: [
    { id: 1, text: 'Complete calculus chapter', completed: true },
    { id: 2, text: 'Score 90% on next test', completed: false },
    { id: 3, text: 'Finish all practice problems', completed: false },
  ]
}

const EditSubject = () => {
  const params = useParams()
  const router = useRouter()
  const subjectId = params.id as string

  const [formData, setFormData] = useState(mockSubjectData)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [newResource, setNewResource] = useState({ name: '', type: 'pdf' })
  const [newGoal, setNewGoal] = useState('')
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  useEffect(() => {
    // In a real app, you would fetch the subject data here
    // fetchSubjectData(subjectId).then(setFormData)
  }, [subjectId])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  const handleAddResource = () => {
    if (newResource.name.trim()) {
      const resource = {
        id: Date.now(),
        name: newResource.name,
        type: newResource.type,
        size: '0 MB',
        uploaded: new Date().toISOString().split('T')[0]
      }
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, resource]
      }))
      setNewResource({ name: '', type: 'pdf' })
    }
  }

  const handleRemoveResource = (resourceId: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter(r => r.id !== resourceId)
    }))
  }

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const goal = {
        id: Date.now(),
        text: newGoal,
        completed: false
      }
      setFormData(prev => ({
        ...prev,
        goals: [...prev.goals, goal]
      }))
      setNewGoal('')
    }
  }

  const handleRemoveGoal = (goalId: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g.id !== goalId)
    }))
  }

  const toggleGoalCompletion = (goalId: number) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.map(goal => 
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
      )
    }))
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: BookOpen },
    { id: 'details', label: 'Course Details', icon: Target },
    { id: 'resources', label: 'Resources', icon: FileText },
    { id: 'goals', label: 'Learning Goals', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Header */}
          <div className="lg:hidden py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Link
                  href="/subjects"
                  className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <ArrowLeft size={20} />
                </Link>
                <div>
                  <h1 className="text-lg font-bold text-gray-900">Edit Subject</h1>
                  <p className="text-xs text-gray-600 mt-0.5">Manage subject details</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  <span className="hidden sm:inline">{isLoading ? 'Saving...' : 'Save'}</span>
                </button>
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <Menu size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/subjects"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <ArrowLeft size={20} />
                  Back to Subjects
                </Link>
                <div className="w-px h-6 bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Edit Subject</h1>
                  <p className="text-sm text-gray-600 mt-1">Manage subject details and configuration</p>
                </div>
              </div>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Success Message */}
          {isSaved && (
            <div className="mb-4 lg:mb-6 p-3 lg:p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Changes saved successfully!
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex space-x-4 lg:space-x-8 overflow-x-auto pb-2 lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-3 lg:py-4 px-2 lg:px-1 border-b-2 text-xs lg:text-sm font-medium whitespace-nowrap transition-colors duration-200 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={16} className="lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Basic Information</h2>
                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter subject name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter subject code"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter subject description"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color Theme</label>
                    <select
                      value={formData.color}
                      onChange={(e) => handleInputChange('color', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                    >
                      <option value="bg-blue-500">Blue</option>
                      <option value="bg-green-500">Green</option>
                      <option value="bg-purple-500">Purple</option>
                      <option value="bg-red-500">Red</option>
                      <option value="bg-yellow-500">Yellow</option>
                      <option value="bg-indigo-500">Indigo</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Course Details Tab */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 lg:mb-6">Course Details</h2>
                <div className="grid grid-cols-1 gap-4 lg:gap-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Grade</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.targetGrade}
                        onChange={(e) => handleInputChange('targetGrade', parseInt(e.target.value))}
                        className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Grade</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.currentGrade}
                        onChange={(e) => handleInputChange('currentGrade', parseInt(e.target.value))}
                        className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                    <input
                      type="text"
                      value={formData.teacher}
                      onChange={(e) => handleInputChange('teacher', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter teacher name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                    <input
                      type="text"
                      value={formData.room}
                      onChange={(e) => handleInputChange('room', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter room number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Schedule</label>
                    <input
                      type="text"
                      value={formData.schedule}
                      onChange={(e) => handleInputChange('schedule', e.target.value)}
                      className="w-full px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                      placeholder="Enter class schedule"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Course Resources</h2>
                  <span className="text-sm text-gray-500">{formData.resources.length} files</span>
                </div>

                {/* Add Resource Form */}
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Resource</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={newResource.name}
                      onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Resource name"
                      className="flex-1 px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                    />
                    <select
                      value={newResource.type}
                      onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                      className="px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                    >
                      <option value="pdf">PDF</option>
                      <option value="doc">Document</option>
                      <option value="video">Video</option>
                      <option value="link">Link</option>
                    </select>
                    <button
                      onClick={handleAddResource}
                      className="px-4 py-3 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>

                {/* Resources List */}
                <div className="space-y-3">
                  {formData.resources.map((resource) => (
                    <div key={resource.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText size={16} className="text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">{resource.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {resource.type.toUpperCase()} • {resource.size} • {resource.uploaded}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveResource(resource.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 flex-shrink-0 ml-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Goals Tab */}
            {activeTab === 'goals' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Learning Goals</h2>
                  <span className="text-sm text-gray-500">
                    {formData.goals.filter(g => g.completed).length}/{formData.goals.length}
                  </span>
                </div>

                {/* Add Goal Form */}
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Add New Goal</h3>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newGoal}
                      onChange={(e) => setNewGoal(e.target.value)}
                      placeholder="Enter learning goal"
                      className="flex-1 px-3 py-3 lg:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base lg:text-sm"
                    />
                    <button
                      onClick={handleAddGoal}
                      className="px-4 py-3 lg:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Goals List */}
                <div className="space-y-3">
                  {formData.goals.map((goal) => (
                    <div key={goal.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <button
                        onClick={() => toggleGoalCompletion(goal.id)}
                        className={`w-6 h-6 border-2 rounded flex items-center justify-center transition-colors duration-200 flex-shrink-0 ${
                          goal.completed
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-500'
                        }`}
                      >
                        {goal.completed && '✓'}
                      </button>
                      <span className={`flex-1 text-sm ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {goal.text}
                      </span>
                      <button
                        onClick={() => handleRemoveGoal(goal.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200 flex-shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Subject Overview */}
          <div className={`lg:block space-y-6 ${showMobileSidebar ? 'fixed inset-0 bg-white z-50 p-6 overflow-y-auto' : 'hidden'}`}>
            {/* Mobile Sidebar Header */}
            {showMobileSidebar && (
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Subject Overview</h2>
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
            )}

            {/* Subject Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-lg flex items-center justify-center ${formData.color}`}>
                  <BookOpen size={20} className="text-white lg:w-6 lg:h-6" />
                </div>
                <div>
                  <h3 className="text-base lg:text-lg font-semibold text-gray-900">{formData.name}</h3>
                  <p className="text-xs lg:text-sm text-gray-500 font-mono">{formData.code}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{formData.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${formData.color} transition-all duration-300`}
                    style={{ width: `${formData.progress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-3 lg:gap-4 text-sm">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 text-xs">Current</div>
                    <div className="font-semibold text-gray-900">{formData.currentGrade}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 text-xs">Target</div>
                    <div className="font-semibold text-gray-900">{formData.targetGrade}%</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 text-xs">Study Hours</div>
                    <div className="font-semibold text-gray-900">{formData.studyHours}h</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 text-xs">Assignments</div>
                    <div className="font-semibold text-gray-900">{formData.assignmentsCompleted}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2 lg:space-y-3">
                <button className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <Calendar size={18} />
                  <span>View Schedule</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <BarChart3 size={18} />
                  <span>View Analytics</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <FileText size={18} />
                  <span>Add Assignment</span>
                </button>
              </div>
            </div>

            {/* Mobile Save Button */}
            {showMobileSidebar && (
              <div className="lg:hidden pt-6 border-t border-gray-200">
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditSubject