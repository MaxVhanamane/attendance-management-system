import React, { useState } from 'react'
import Head from 'next/head';
import DashboardSidebar from '../../components/DashboardSidebar';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from "next/router"
import { fetchWithAuth } from '../../lib/fetchWithAuth';
import { getIndianDateString } from '../../lib/dateUtils';
import { verifySSRAuth } from '../../middleware/auth';

const Viewattendance = () => {

  const router = useRouter()
  const { _id, className, division, name } = router.query
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [studentAttendance, setStudentAttendance] = useState([])
  const [noRecordsFound, setNoRecordsFound] = useState(false)


  const handleSubmit = async (event, _id) => {
    event.preventDefault()
    const attendanceValue = studentAttendance.find((item) => item._id === _id)?.attendance

    if (attendanceValue === "P" || attendanceValue === "A" || attendanceValue === "NT") {
      try {
        const data = { _id, attendance: attendanceValue }

        const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/editattendance`, {
          method: 'POST',
          body: JSON.stringify(data),
        })

        const response = await res.json()

        if (response.success) {
          toast.success('Attendance updated successfully!')
        } else {
          toast.error(response.error || 'Failed to update attendance')
        }
      } catch (err) {
        toast.error(err.message || 'Network error. Failed to update attendance.')
      }
    }
    else {
      toast.warning('The value for attendance should be one of the following: P, A, or NT.', {
        autoClose: 4000,
      })
    }
  }

  const handleChange = (e, index) => {
    const updatedStudentAttendance = [...studentAttendance];
    updatedStudentAttendance[index].attendance = e.target.value;
    setStudentAttendance(updatedStudentAttendance);
  };

  const getData = async () => {
    try {
      let sDate = getIndianDateString(startDate)
      let eDate = getIndianDateString(endDate)
      let data = { _id, sDate, eDate, className, division }

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/getstudentwiseattendance`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      let studentsData = await res.json()

      setStudentAttendance(studentsData.studentsAttendance || [])

      if (!studentsData.studentsAttendance || studentsData.studentsAttendance.length <= 0) {
        setNoRecordsFound(true)
      } else {
        setNoRecordsFound(false)
      }
    } catch (err) {
      toast.error('Failed to retrieve student attendance records');
    }
  }

  return (
    <>
      <Head>
        <title>Student Attendance - ClassScribe</title>
        <meta name="description" content="Student attendance details" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardSidebar />

      <div className="lg:ml-60 sticky top-0  z-10">
        <div className="  p-2 font-bold md:text-lg text-lg  mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200  mb-8 "><h1 className="text-center mx-auto">Attendance</h1></div></div>
      <div className="flex items-center justify-center">
        <div className="lg:ml-60 flex gap-1">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
            <div className="flex gap-2">
              <div className='flex flex-col md:flex-row gap-2 md:mx-2'>
                <p className='my-auto mx-2 md:mx-auto'>Start Date:</p>

                <div>
                  <DatePicker dateFormat="dd/MM/yyyy" className='bg-gray-100 text-center w-32 md:w-40 border-2 rounded border-gray-700' selected={startDate} onChange={(date) => setStartDate(date)} />
                </div>
              </div>

              <div className='flex flex-col md:flex-row gap-2'>
                <p className='my-auto mx-2 md:mx-auto'>End Date:</p>
                <div>
                  <DatePicker dateFormat="dd/MM/yyyy" className='bg-gray-100  text-center w-32 md:w-40 border-2 rounded border-gray-700' selected={endDate} onChange={(date) => setEndDate(date)} />
                </div>
              </div>
            </div>
            <div className=" flex ">
              <button className='  text-center bg-teal-500 hover:bg-teal-600 ease-linear transition-all duration-150 text-white rounded p-0.5 px-1' onClick={getData}>Get attendance</button></div>
          </div>
        </div>
      </div>
      <div className="lg:ml-60 flex items-center justify-center mt-4 flex-col">
        <h1 className="font-bold text-gray-800 text-md lg:text-lg "> {`Student Name: ${name} `}</h1>
        {noRecordsFound && <p className="text-red-500 font-semibold mt-6"> No attendance record found!</p>}
      </div>


      <div className='lg:ml-64  p-6  pt-6 flex justify-center  items-center  gap-4 flex-wrap mx-auto'>
        {studentAttendance.map((i, index) => {
          return <form key={i._id} onSubmit={(event) => handleSubmit(event, i._id)} className="shadow-md p-2 lg:p-4 bg-gray-200">
            <div>

              <div className="mb-2">
                <p>Date: {getIndianDateString(i.date).split("-").reverse().join("-")}</p>
              </div>

              <div className="mb-2">
                <label htmlFor="present">Attendance: </label>
                <input className="border border-teal-500 w-10 text-center"
                  id="attendance"
                  name="attendance"
                  onChange={(e) => handleChange(e, index)}
                  value={i.attendance}
                />
              </div>
            </div>
            <button className="bg-teal-500 px-1 py-0.5 rounded text-gray-50 text-sm w-full" type="submit">Update</button>
          </form>
        })}
      </div>
    </>
  )
}

export default Viewattendance

export async function getServerSideProps(context) {
  const authRedirect = verifySSRAuth(context, { allowedRoles: ['admin', 'teacher'] });
  if (authRedirect) {
    return authRedirect;
  }
  return { props: {} };
}


