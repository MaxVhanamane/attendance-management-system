import React, { useState } from 'react'
import connectDb from './../middleware/mongoose';
import Student from '../models/students';
import { jsPDF } from "jspdf";
import DatePicker from "react-datepicker";
import autoTable from 'jspdf-autotable';
import "react-datepicker/dist/react-datepicker.css";
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { TbCircle } from "react-icons/tb"
import { TbCircleCheck } from "react-icons/tb"
import { verifySSRAuth } from '../middleware/auth';
import { fetchWithAuth } from '../lib/fetchWithAuth';
import { getIndianDateString } from '../lib/dateUtils';
import { toast } from 'react-toastify';

export default function Attendancerecord({ allStudents, classNameValue }) {

    const router = useRouter();
    const { className, division } = router.query;
    const [attendance, setAttendance] = useState([])
    const [studentDetails, setStudentDetails] = useState(allStudents)
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showAttendace, setShowAttendance] = useState(false)
    const [hideColumns, setHideColumns] = useState({
        srno: false,
        grno: false,
        dob: false,
        caste: false,
        subcaste: false,
        ntdays: false,
    })

    const handleColumnHide = (e) => {

        if (e.currentTarget.name === "srno") {
            setHideColumns({
                ...hideColumns,
                srno: !hideColumns.srno
            })
        }
        if (e.currentTarget.name === "grno") {
            setHideColumns({
                ...hideColumns,
                grno: !hideColumns.grno
            })
        }
        if (e.currentTarget.name === "dob") {
            setHideColumns({
                ...hideColumns,
                dob: !hideColumns.dob
            })
        }
        if (e.currentTarget.name === "caste") {
            setHideColumns({
                ...hideColumns,
                caste: !hideColumns.caste
            })
        }
        if (e.currentTarget.name === "subcaste") {
            setHideColumns({
                ...hideColumns,
                subcaste: !hideColumns.subcaste
            })
        }
        if (e.currentTarget.name === "ntdays") {
            setHideColumns({
                ...hideColumns,
                ntdays: !hideColumns.ntdays
            })
        }
        if (e.currentTarget.name === "all") {
            if (Object.values(hideColumns).every(value => value === true)) {
                setHideColumns({
                    ...hideColumns,
                    srno: false,
                    grno: false,
                    dob: false,
                    caste: false,
                    subcaste: false,
                    ntdays: false
                })
            }
            else {
                setHideColumns({
                    ...hideColumns,
                    srno: true,
                    grno: true,
                    dob: true,
                    caste: true,
                    subcaste: true,
                    ntdays: true
                })
            }

        }
    }

    let dates = (attendance || []).map((item) => {
        return item.date ? getIndianDateString(item.date) : ""
    }).filter(Boolean)

    let uniqueDates = [...new Set(dates)].sort();

    let sortedStudents = [...studentDetails].sort((d, e) => { return d.rollNumber - e.rollNumber })

    let studentAttendance = sortedStudents.map((item) => {
        let studentRecords = attendance?.filter(x => String(x.name) === String(item._id)) || []
        let recordByDate = {}
        studentRecords.forEach(r => {
            if (r.date) {
                let dStr = getIndianDateString(r.date)
                recordByDate[dStr] = r
            }
        })

        return uniqueDates.map(dStr => {
            if (recordByDate[dStr]) {
                return recordByDate[dStr]
            }
            return { _id: uuidv4(), name: item._id, attendance: "", date: dStr }
        })
    })

    const getData = async () => {
        try {
            let sDate = getIndianDateString(startDate)
            let eDate = getIndianDateString(endDate)
            let data = { sDate, eDate, className, division }

            const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/getdatewisedata`, {
                method: 'POST',
                body: JSON.stringify(data),
            })

            let studentsData = await res.json()
            if (studentsData.success) {
                setAttendance(studentsData.studentsAttendanceRecord || [])
                setShowAttendance(true)
            } else {
                toast.error(studentsData.error || 'Failed to retrieve attendance')
            }
        } catch (err) {
            toast.error(err.message || 'Network error. Failed to retrieve attendance records.');
        }
    }

    const getPdf = async () => {
        let doc = new jsPDF("l", "pt", "a3");
        autoTable(doc, { html: "#table_pdf", theme: "grid" })
        let fileName = `class-${classNameValue}-Attendance`
        doc.save(fileName);

    }
    return (
        <>
            <div className='w-full flex items-center justify-center flex-col md:flex-row fixed top-[3.25rem] z-10 bg-gray-50  border-b border-gray-300/90 pb-6 pt-4'>
                <div className="flex gap-1">
                    <div className='flex flex-col md:flex-row gap-2 md:mx-1'>

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
                <div className='flex mt-2 md:mt-auto'>
                    <button className='m-2  text-center bg-teal-500 hover:bg-teal-600 ease-linear transition-all duration-150 text-white rounded p-0.5 px-2' onClick={getData}>Get attendance</button>
                    <button className='m-2  text-center bg-teal-500 hover:bg-teal-600 ease-linear transition-all duration-150 text-white rounded p-0.5 px-2' onClick={getPdf}>Download pdf</button>
                </div>

            </div>
            <div>

                <h1 className='fixed md:top-36 top-52 w-full text-center font-bold  text-gray-800 lg:text-2xl text-xl  '>{`Attendance of grade ${classNameValue}  students`} </h1>
                {(showAttendace && attendance.length > 0) && <div className='fixed md:top-44 top-[14.5rem]  w-full flex items-center justify-center flex-wrap   text-gray-800  mb-1 pb-4 mt-2 gap-2'> <span className="font-semibold">Hide Columns:</span>
                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="srno" onClick={handleColumnHide}> {hideColumns.srno ? <TbCircleCheck className="text-red-500 " /> : <TbCircle className="text-teal-500" />}SR.NO</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="grno" onClick={handleColumnHide}> {hideColumns.grno ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}GR.NO</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="dob" onClick={handleColumnHide}> {hideColumns.dob ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}DOB</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="caste" onClick={handleColumnHide}> {hideColumns.caste ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}CASTE</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="subcaste" onClick={handleColumnHide}> {hideColumns.subcaste ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}SUBCASTE</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="ntdays" onClick={handleColumnHide}> {hideColumns.ntdays ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}NT DAYS</button>

                    <button className="flex items-center justify-center gap-1 md:text-sm text-xs font-semibold" name="all" onClick={handleColumnHide}> {Object.values(hideColumns).every(value => value === true) ? <TbCircleCheck className="text-red-500" /> : <TbCircle className="text-teal-500" />}ALL</button>

                </div>}
            </div>
            {showAttendace ? <div>
                {attendance.length > 0 ? <div className=" fixed md:top-[13.5rem] top-72 h-[calc(100vh-13rem)]  overflow-auto  w-full  lg:px-12 mb-20" >
                    <div className="pb-16">
                        <table className=" w-full overflow-auto md:text-sm text-xs text-left text-gray-500 " id="table_pdf" >

                            <thead className="sticky top-0 text-xs  w-screen text-gray-700 uppercase  bg-gray-50  ">
                                <tr >
                                    <th scope="col" className={`${hideColumns.srno && "hidden"} py-3 px-2 text-center`}>
                                        SR.No
                                    </th>
                                    <th scope="col" className={`${hideColumns.grno && "hidden"} py-3 px-2 text-center`}>
                                        GR.No
                                    </th>
                                    <th scope="col" className={`${hideColumns.dob && "hidden"} py-3 px-2 text-center`}>
                                        DOB
                                    </th>
                                    <th scope="col" className={`${hideColumns.caste && "hidden"} py-3 px-2 text-center`}>
                                        Caste
                                    </th>
                                    <th scope="col" className={`${hideColumns.subcaste && "hidden"} py-3 px-2 text-center`}>
                                        Subcaste
                                    </th>
                                    <th scope="col" className="py-3 px-2 text-center">
                                        R.No
                                    </th>
                                    <th scope="col" className="py-3 px-2 text-center">
                                        Name
                                    </th>

                                    {uniqueDates.map((item) => {
                                        const parts = item.split("-");
                                        const label = parts.length === 3 ? `${parts[2]}/${parts[1]}` : item;
                                        return <th key={item} scope="col" className="py-3 px-2 text-center">{label}</th>
                                    })}

                                    <th scope="col" className="py-3 px-2 text-center">
                                        Present days
                                    </th>
                                    <th scope="col" className="py-3 px-2 text-center">
                                        Absent days
                                    </th>
                                    <th scope="col" className={`${hideColumns.ntdays && "hidden"} py-3 px-2 text-center`}>
                                        NT days
                                    </th>
                                    <th scope="col" className={` py-3 px-2 text-center`}>
                                        Total
                                    </th>

                                </tr>
                            </thead>
                            <tbody className="font-semibold ">

                                {studentDetails.sort((d, e) => { return d.rollNumber - e.rollNumber }).map((item, index) => {
                                    return <tr key={index} className="bg-white border-border-collapse   ">

                                        <td className={`${hideColumns.srno && "hidden"} py-4 px-2 text-center`}>
                                            {index + 1}
                                        </td>
                                        <td className={`${hideColumns.grno && "hidden"} py-4 px-2 text-center`}>
                                            {item.genRegNumber}
                                        </td>
                                        <td className={`${hideColumns.dob && "hidden"} py-4 px-2 text-center`}>
                                            {new Date(item.DOB).toLocaleDateString('en-GB')}
                                        </td>
                                        <td className={`${hideColumns.caste && "hidden"} py-4 px-2 text-center`}>
                                            {item.caste}
                                        </td>
                                        <td className={`${hideColumns.subcaste && "hidden"} py-4 px-2 text-center`}>
                                            {item.subCaste}
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            {item.rollNumber}
                                        </td>
                                        <td className="py-4 px-2 text-center">
                                            {item.name}
                                        </td>


                                        {/* here I am using two find methods and then map method to get desired result, because studentAttendance is an array of arrays.
 and the array that are inside are already according to roll number and the attendace is sorted according to date so find method is doing nothing but helping to achieve the desired result 
 that I want */}

                                        {studentAttendance?.find(array => {
                                            return array?.find(obj => String(obj?.name) === String(item?._id))
                                        })?.map((i) => {
                                            return <td key={i._id} className={`py-4 ${i.attendance === "NT" ? "text-red-600" : null} font-semibold px-2 text-center`}>
                                                {i.attendance}
                                            </td>
                                        })}

                                        <td className="py-4 px-2 text-center">
                                            {
                                                attendance.filter(x => String(x.name) === String(item._id)).filter(item => item.attendance === 'P').length
                                            }
                                        </td>

                                        <td className="py-4 px-2 text-center">
                                            {
                                                attendance.filter(x => String(x.name) === String(item._id)).filter(item => item.attendance === 'A').length
                                            }
                                        </td>
                                        <td className={`${hideColumns.ntdays && "hidden"} py-4 px-2 text-center`}>
                                            {
                                                attendance.filter(x => String(x.name) === String(item._id)).filter(item => item.attendance === 'NT').length
                                            }
                                        </td>
                                        <td className={` py-4 px-2 text-center`}>
                                            {
                                                attendance.filter(x => String(x.name) === String(item._id)).length
                                            }
                                        </td>


                                    </tr>

                                })}

                            </tbody>
                        </table>
                    </div>
                </div> : <div className="flex justify-center items-center font-semibold fixed w-full my-52 py-10 px-4 text-red-500">No attendance records found! </div>}


            </div> : <div className="flex justify-center font-semibold items-center fixed w-full my-52 py-10 px-4 text-teal-600 animate-pulse">Select the date range to view attendance. </div>}
        </>
    )
}


export async function getServerSideProps(context) {
    const authRedirect = verifySSRAuth(context);
    if (authRedirect) {
        return authRedirect;
    }

    await connectDb()
    let classNameValue = (context.query.className);
    let division = (context.query.division);
    let studentNames = await Student.find({ className: classNameValue, division: division }).sort({ rollNumber: 1 })
    return { props: { allStudents: JSON.parse(JSON.stringify(studentNames)), classNameValue: classNameValue || '' } }
}
