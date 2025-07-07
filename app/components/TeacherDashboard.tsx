'use client'

import { useState } from 'react'
import { ClassroomManager } from './ClassroomManager'
import { GradeManager } from './GradeManager'

export function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState<'classrooms' | 'grades'>('classrooms')

  const tabs = [
    { id: 'classrooms', label: 'Manage Classrooms', icon: '🏫' },
    { id: 'grades', label: 'Manage Grades', icon: '📊' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'classrooms' | 'grades')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'classrooms' && <ClassroomManager />}
          {activeTab === 'grades' && <GradeManager />}
        </div>
      </div>
    </div>
  )
}
