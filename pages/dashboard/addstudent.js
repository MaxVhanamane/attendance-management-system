import React, { useState } from 'react'
import Head from "next/head";
import DashboardSidebar from '../../components/DashboardSidebar';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../lib/fetchWithAuth';
import { verifySSRAuth } from '../../middleware/auth';

export default function AddStudent() {

  const [studentDetails, setStudentDetails] = useState({
    name: "",
    email: "",
    phone: "",
    className: "",
    division: "",
    rollNumber: "",
    genRegNumber: "",
    DOB: "",
    caste: "",
    subCaste: ""
  })

  const handleStudentInfoChange = (e) => {
    const { name, value } = e.target;
    setStudentDetails((prev) => ({
      ...prev,
      [name]: name === "division" ? value.toUpperCase() : value,
    }));
  }

  const handleAddStudent = async () => {

    const studentData = { name: studentDetails.name, email: studentDetails.email, className: studentDetails.className, division: studentDetails.division, rollNumber: studentDetails.rollNumber, phone: studentDetails.phone, genRegNumber: studentDetails.genRegNumber, DOB: new Date(studentDetails.DOB), caste: studentDetails.caste, subCaste: studentDetails.subCaste };

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/addstudent`, {
        method: 'POST',
        body: JSON.stringify(studentData),
      })

      const response = await res.json()

      if (response.success) {

        toast.success(response.message || 'Student added successfully!');

        setStudentDetails({
          name: "",
          email: "",
          phone: "",
          className: "",
          division: "",
          rollNumber: "",
          genRegNumber: "",
          DOB: "",
          caste: "",
          subCaste: ""
        })

      }
      else {
        toast.error(response.error || 'Some error occurred! Please try again later.');
      }
    } catch (err) {
      toast.error('Network error. Failed to add student.');
    }
  }

  return (
    <>
      <style jsx global>{`
       footer{
        display:none;
       }
       nav{
        display:none;
       }
      `}</style>


      <Head>
        <title>Dashboard - Add Students</title>
        <meta name="description" content="Add a food item" />
      </Head>
      <DashboardSidebar />

      <div className="lg:ml-60 sticky top-0  z-10">
        <div className="  p-2 font-semibold md:text-lg text-lg  mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200  mb-8 "><h1 className="text-center mx-auto">Add a student</h1></div></div>
      <div className='lg:ml-28 p-6  pt-6 flex justify-center w-full'>

        <div className="block p-6 rounded-lg shadow-lg bg-white w-[50rem]  mb-28">

          <div className="form-group mb-6">
            <label htmlFor="name" className="formLabel inline-block mb-2 text-gray-700">Name</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.name} name="name" type="text" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="name"
              placeholder="Enter a name" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="email" className="formLabel inline-block mb-2 text-gray-700">Email</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.email} name="email" type="email" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="email"
              placeholder="Enter a parent's mail id" />
          </div>

          <div className="form-group mb-6">
            <label htmlFor="phone" className="formLabel inline-block mb-2 text-gray-700">Phone</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.phone} name="phone" type="number" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="phone"
              placeholder="Enter the phone number" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="classname" className="formLabel inline-block mb-2 text-gray-700">Class Name</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.className} name="className" type="number" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="classname"
              placeholder="Enter a class name" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="division" className="formLabel inline-block mb-2 text-gray-700">Division</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.division} name="division" type="text" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="division"
              placeholder="Enter a division name" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="rollnumber" className="formLabel inline-block mb-2 text-gray-700">Roll Number</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.rollNumber} name="rollNumber" type="number" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="rollnumber"
              placeholder="Enter a roll number" />
          </div>



          <div className="form-group mb-6">
            <label htmlFor="genRegNumber" className="formLabel inline-block mb-2 text-gray-700">General register number</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.genRegNumber} name="genRegNumber" type="number" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="genRegNumber"
              placeholder="Enter general register number" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="DOB" className="formLabel inline-block mb-2 text-gray-700">Date of birth</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.DOB} name="DOB" type="date" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="DOB"
              placeholder="Enter date of birth" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="caste" className="formLabel inline-block mb-2 text-gray-700">Caste</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.caste} name="caste" type="text" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="caste"
              placeholder="Enter caste" />
          </div>


          <div className="form-group mb-6">
            <label htmlFor="subCaste" className="formLabel inline-block mb-2 text-gray-700">Subcast</label>
            <input onChange={handleStudentInfoChange} value={studentDetails.subCaste} name="subCaste" type="text" className="form-control
          block
          w-full
          px-3
          py-1.5
          text-base
          font-normal
          text-gray-700
          bg-white bg-clip-padding
          border border-solid border-gray-300
          rounded
          transition
          ease-in-out
          m-0
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="subCaste"
              placeholder="Enter subcaste" />
          </div>

          <button onClick={handleAddStudent} type="submit" className="
        px-6
        py-2.5
        bg-teal-600
        text-white
        font-medium
        text-xs
        leading-tight
        uppercase
        rounded
        shadow-md
        hover:bg-teal-700 hover:shadow-lg
        active:bg-teal-800 active:shadow-lg
        transition
        duration-150
        ease-in-out">Add</button>
        </div></div></>
  )
}

export async function getServerSideProps(context) {
  const authRedirect = verifySSRAuth(context, { allowedRoles: ['admin', 'teacher'] });
  if (authRedirect) {
    return authRedirect;
  }
  return { props: {} };
}


