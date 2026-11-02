import React, { useState } from 'react'
import Head from "next/head";
import DashboardSidebar from '../../components/DashboardSidebar';
import { toast } from 'react-toastify';
import { fetchWithAuth } from '../../lib/fetchWithAuth';
import { verifySSRAuth } from '../../middleware/auth';

export default function AddTeacher() {

  const [teacherDetails, setTeacherDetails] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    address: "",
    phone: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeacherDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  const handleAdd = async () => {

    const teacherInfo = { name: teacherDetails.name, email: teacherDetails.email, role: teacherDetails.role, address: teacherDetails.address, password: teacherDetails.password, phone: teacherDetails.phone };

    try {
      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/addteacher`, {
        method: 'POST',
        body: JSON.stringify(teacherInfo),
      })

      const response = await res.json()

      if (response.success) {

        toast.success(response.message || 'Teacher added successfully!');

        setTeacherDetails({
          name: "",
          email: "",
          password: "",
          role: "",
          address: "",
          phone: "",
        })

      }
      else {
        toast.error(response.error || 'Failed to add teacher');
      }
    } catch (err) {
      toast.error('Network error. Failed to add teacher.');
    }

  }

  return (
    <>
      <Head>
        <title>Add Teacher - ClassScribe</title>
        <meta name="description" content="Add a new teacher" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardSidebar />
      <div className="lg:ml-60 sticky top-0 bg-[#f9fafb] z-10">
        <div className="  p-2 font-semibold md:text-lg text-lg  mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200  mb-8 "><h1 className="text-center mx-auto">Add a teacher</h1></div></div>
      <div className='lg:ml-28 p-6  pt-6 flex justify-center w-full'>

        <div className="block p-6 rounded-lg shadow-lg bg-white w-[50rem]  mb-28">

          <div className=" mb-6">
            <label htmlFor="name" className="formLabel inline-block mb-2 text-gray-700">Name</label>
            <input onChange={handleChange} value={teacherDetails.name} name="name" type="text" className="
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


          <div className=" mb-6">
            <label htmlFor="email" className="formLabel inline-block mb-2 text-gray-700">Email</label>
            <input onChange={handleChange} value={teacherDetails.email} name="email" type="email" className="
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
              placeholder="Enter the mail id" />
          </div>

          <div className=" mb-6">
            <label htmlFor="password" className="formLabel inline-block mb-2 text-gray-700">Password</label>
            <input onChange={handleChange} value={teacherDetails.password} name="password" type="password" className="
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
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="password"
              placeholder="Enter the password" />
          </div>



          <div className=" mb-6">
            <label htmlFor="address" className="formLabel inline-block mb-2 text-gray-700">Address</label>
            <input onChange={handleChange} value={teacherDetails.address} name="address" type="text" className="
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
          focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none" id="address"
              placeholder="Enter the address" />
          </div>

          <div className=" mb-6">
            <label htmlFor="phone" className="formLabel inline-block mb-2 text-gray-700">Phone number</label>
            <input onChange={handleChange} value={teacherDetails.phone} name="phone" type="number" className="
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



          <div className=" mb-6">
            <label htmlFor="role" className="formLabel inline-block mb-2 text-gray-700">Role</label>
            <select className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-600 block w-48 p-2 "
              value={teacherDetails.role || 'default'}
              onChange={(e) => setTeacherDetails((pre) => ({ ...pre, role: e.target.value }))}
            >
              <option value={"default"} className="text-center" disabled>
                Select the Role
              </option>
              <option value={"admin"} className="text-center" >
                admin
              </option>
              <option value={"teacher"} className="text-center" >
                teacher
              </option>

            </select>
          </div>







          <button onClick={handleAdd} type="submit" className="
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
  const authRedirect = verifySSRAuth(context, { requiredRole: 'admin' });
  if (authRedirect) {
    return authRedirect;
  }
  return { props: {} };
}


