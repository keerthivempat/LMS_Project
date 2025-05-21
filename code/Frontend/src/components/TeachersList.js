"use client"

import React from "react"
import { Loader2, Trash2, UserPlus } from 'lucide-react'

const TeachersList = ({ teachers, isLoading, onRemoveTeacher }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-brown/20">
      <h2 className="text-xl font-semibold text-brown mb-4">Current Teachers</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <Loader2 size={32} className="animate-spin text-brown" />
        </div>
      ) : teachers.length > 0 ? (
        <ul className="divide-y divide-brown/10">
          {teachers.map((teacher) => (
            <li key={teacher._id} className="py-3 text-brown flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-brown/20 text-brown flex items-center justify-center mr-3">
                  {teacher.name ? teacher.name.charAt(0).toUpperCase() : "T"}
                </div>
                <div>
                  <p className="font-medium">{teacher.name || "Unnamed Teacher"}</p>
                  <p className="text-sm text-brown/70">{teacher.email}</p>
                </div>
              </div>
              <button onClick={() => onRemoveTeacher(teacher._id)} className="text-red-500 hover:text-red-700">
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-brown/70">
          <UserPlus size={40} className="mx-auto mb-2 text-brown/40" />
          <p>No teachers added yet. Add your first teacher above.</p>
        </div>
      )}
    </div>
  )
}

export default TeachersList
