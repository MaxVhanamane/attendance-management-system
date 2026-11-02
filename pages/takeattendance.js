import Head from 'next/head'
import { useState,useEffect} from 'react'
import Student from './../models/students';
import connectDb from './../middleware/mongoose';
import { toast } from 'react-toastify';
import {BiRadioCircleMarked} from "react-icons/bi"
import {HiCheckCircle} from "react-icons/hi"
import { verifySSRAuth } from '../middleware/auth';
import { fetchWithAuth } from '../lib/fetchWithAuth';

export default function TakeAttendance({studentList,className}) {


const studentInformation=studentList.map((student)=>{
  student.status="pending"
  return student
})

const [data,setData]=useState(studentInformation)

useEffect(()=>{
  localStorage.setItem("localData",JSON.stringify(studentInformation))
  // eslint-disable-next-line react-hooks/exhaustive-deps
},[])

const handleClick=async(attendance,studentInfo)=>{
//update status 
let getStatus=JSON.parse(localStorage.getItem("localData")) || []
   const index = getStatus.findIndex(item => item._id === studentInfo._id);
   if(index !== -1) {
    getStatus[index] = { ...getStatus[index], status:"done" };
    localStorage.setItem("localData",JSON.stringify(getStatus))
    setData([...getStatus])
  }

// add attendance
const istTime = new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata' });
const studentInformation = {_id:studentInfo._id,email:studentInfo.email,className:studentInfo.className,division:studentInfo.division,rollNumber:studentInfo.rollNumber,attendance:attendance,date:new Date().toISOString(),time:istTime,
  genRegNumber:studentInfo.genRegNumber,caste:studentInfo.caste,subCaste:studentInfo.subCaste,DOB:studentInfo.DOB,phone:studentInfo.phone};
     
   try {
     const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/addattendance`, {
       method: 'POST',
       body: JSON.stringify(studentInformation),
     })
     const fresponse = await response.json()
     if (fresponse.success) {
       toast.success(`Marked ${studentInfo.name} as ${attendance === 'P' ? 'Present' : 'Absent'}`)
     }
   } catch (err) {
     toast.error('Failed to save attendance record')
   }

// send mail asynchronously in background without blocking attendance
    try {
      let emailData={name:studentInfo.name,email:studentInfo.email,attendance:attendance}
      fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/sendmail`, { 
        method: 'POST',
        body: JSON.stringify(emailData),
      })
    } catch (mailErr) {
      // Do not block attendance if mail fails
    }
  }

  return (
    <div >
      <Head>
        <title>Attendance</title>
        <meta name="description" content="Student attendance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className=' flex items-center justify-center flex-col'>
        
        <h1 className= "w-full fixed mt-36 text-center p-2 text-white font-bold text-lg bg-teal-500">Student list for class {className}</h1>
     
        {data.length>0?<div className="fixed top-[6.5rem]  h-[calc(100vh-6.5rem)] overflow-auto lg:w-3/4 w-full ">
          <div className="mb-16">
    <table className="w-full text-sm text-left text-gray-500   ">
        <thead className="text-xs sticky top-0 text-center md:text-left text-gray-700 uppercase  border-collapse bg-gray-50 ">
            <tr >
                <th scope="col" className="py-3 px-2 text-center">
                    R.No.
                </th>
                <th scope="col" className="py-3 px-2">
                    Name
                </th>
                <th scope="col" className="hidden sm:block py-3 px-2">
                    Email
                </th>
                <th scope="col" className="py-3 px-2">
                    Present
                </th>
                <th scope="col" className="py-3 px-2">
                    Absent
                </th>
                <th scope="col" className="py-3 px-2 text-center">
                    Status
                </th>
             
            </tr>
        </thead>
        <tbody>
            { data.sort((d,e)=>{return d.rollNumber-e.rollNumber }).map((item,index)=>{
                return <tr key={index} className="bg-white">
           
                 <td className="py-4 px-2 ">
                 <div className="flex items-center justify-center ">{item.rollNumber}</div>
                </td>
                <td className="py-4 px-2">
                    {item.name}
                </td>
                <td className="py-4 px-2 hidden sm:block">
                    {item.email}
                </td>
                <td className="py-4 px-2">
                <button onClick={(e)=>{handleClick(e.target.value,item)} }className=" bg-emerald-600 hover:bg-emerald-700 text-white rounded p-1 px-2 hover:shadow" value="P" >Present</button>
                </td>
                <td className="py-4 px-2">
                <button onClick={(e)=>{handleClick(e.target.value,item)} } className="bg-red-500 hover:bg-red-600 hover:shadow text-white rounded p-1 px-2" value="A">Absent</button>
                </td>
                <td className="py-4 px-2 ">
                    {/* <div  > */}
                      {item.status==="done"?<HiCheckCircle className={`w-4 h-4  text-emerald-600 rounded-full mx-auto`}/>:<BiRadioCircleMarked className={`w-5 h-5 text-red-600 rounded-full mx-auto`}/>}
                    {/* </div> */}
                </td>
            </tr>
            })}
           
        </tbody>
    </table>
    </div>
</div>:<div className="fixed top-36 flex justify-center items-center font-semibold my-20 p-10 text-red-500">No Student records found! Please add Students. </div>}

      </main>

    </div>
  )
}




export async function getServerSideProps(context) {
    const authRedirect = verifySSRAuth(context);
    if (authRedirect) {
        return authRedirect;
    }

    await connectDb()
    let className = (context.query.className);
    let division = (context.query.division);

    let studentList = await Student.find({className:className,division:division}).sort({ rollNumber: 1 })
    return { props: { studentList:JSON.parse(JSON.stringify(studentList)),className:className || '' } }
  }
  
