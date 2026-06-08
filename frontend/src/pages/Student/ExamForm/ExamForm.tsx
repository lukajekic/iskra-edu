import React from 'react'
import TaskExplorer from './TaskExplorer'

const ExamForm = () => {
  return (
    <div className="h-screen min-h-screen max-h-screen w-full">
        <div id="grid" className="h-full w-full flex gap-0 items-start">
             
            <div id="task-explorer" className="h-full w-1/3  overflow-y-auto border-r-1 border-[#cecece]">
            <TaskExplorer></TaskExplorer>
            </div>
            
            <div id="task-explorer" className="h-full w-1/3 bg-red-100 overflow-y-auto border-r-1 border-[#cecece]"></div>

            <div id="task-explorer" className="h-full w-1/3 bg-green-100 overflow-y-auto"></div>

        </div>
    </div>
  )
}

export default ExamForm