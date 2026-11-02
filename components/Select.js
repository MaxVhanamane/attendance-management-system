import React, { useState } from 'react'
import { useRouter } from 'next/router'

export default function Select({ allStudents = [], classList, divisionList }) {
  const router = useRouter()

  // Use pre-computed distinct lists if available, otherwise compute from allStudents
  const uniqueClassNames = classList || [
    ...new Set(allStudents.map((s) => s.className)),
  ].sort((a, b) => (isNaN(a) || isNaN(b) ? a.localeCompare(b) : a - b));

  const uniqueDivisionNames = divisionList || [
    ...new Set(allStudents.map((s) => s.division)),
  ].sort();

  const [selectClass, setSelectClass] = useState('');
  const [divisionName, setDivisionName] = useState('');

  const isFormValid = Boolean(selectClass && divisionName && selectClass !== 'default' && divisionName !== 'default');

  const handleNavigate = (path) => {
    if (!isFormValid) return;
    router.push(`${path}?className=${encodeURIComponent(selectClass)}&division=${encodeURIComponent(divisionName)}`);
  };

  return (
    <div className='flex flex-col items-center justify-center'>
      <div className='mt-6'>
        <label htmlFor="select-class" className="block mb-2 text-sm font-medium text-gray-900 text-center">Select the Class</label>
        <div className='mt-2'>
          <select
            id="select-class"
            className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            value={selectClass || 'default'}
            onChange={(e) => setSelectClass(e.target.value)}
          >
            <option value="default" className="text-center" disabled>
              Select the class
            </option>
            {uniqueClassNames.map((cls) => (
              <option key={cls} className="text-center" value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='mt-8'>
        <label htmlFor="select-division" className="block mb-2 text-sm font-medium text-gray-900 text-center">Select the Division</label>
        <div className='mt-2'>
          <select
            id="select-division"
            className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2.5"
            value={divisionName || 'default'}
            onChange={(e) => setDivisionName(e.target.value)}
          >
            <option value="default" className="text-center" disabled>
              Select the division
            </option>
            {uniqueDivisionNames.map((division) => (
              <option key={division} className="text-center" value={division}>{division}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        disabled={!isFormValid}
        onClick={() => handleNavigate('/takeattendance')}
        className='outline-none bg-teal-600 w-32 text-gray-100 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed p-2 text-sm rounded-md mt-8 ease-linear transition-all duration-150'
      >
        Take Attendance
      </button>

      <button
        type="button"
        disabled={!isFormValid}
        onClick={() => handleNavigate('/showattendance')}
        className='outline-none bg-teal-600 w-32 text-gray-100 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed p-2 text-sm rounded-md mt-4 ease-linear transition-all duration-150'
      >
        Show Attendance
      </button>

      <p className="mt-4 text-gray-500 text-sm px-4 text-center">* Select all the above options to enable the buttons.</p>
    </div>
  )
}
