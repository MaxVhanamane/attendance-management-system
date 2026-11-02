import Head from 'next/head'
import { useState } from 'react'
import User from './../../models/users';
import connectDb from './../../middleware/mongoose';
import { toast } from 'react-toastify';
import DashboardSidebar from '../../components/DashboardSidebar';
import { verifySSRAuth } from '../../middleware/auth';
import { fetchWithAuth } from '../../lib/fetchWithAuth';


export default function ViewAllTeachers({ allTeachers }) {

  const [allTeachersInfo, setAllTeachersInfo] = useState(allTeachers)
  const [openTeacherDetailsEditModal, setOpenTeacherDetailsEditModal] = useState(false);

  let roleNamesWithDuplicates = allTeachers.map((teacher) => { return teacher.role })
  let uniqueRoleNames = [...new Set(roleNamesWithDuplicates)]

  const [roleName, setRoleName] = useState();
  const [teacherDetails, setTeacherDetails] = useState({
    _id: "",
    name: "",
    email: "",
    role: "",
    address: "",
    phone: "",
  })

  // handle Search
  const handleSearch = async () => {
    try {
      let data = { role: roleName }

      let response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/getteachers`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      let foundTeachers = await response.json()
      setAllTeachersInfo(foundTeachers.teachers || [])
    } catch (err) {
      toast.error('Failed to search teachers');
    }
  }

  // view all teachers
  const handleViewAll = async () => {
    try {
      let response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/getteachers`, {
        method: 'GET',
      })

      let foundTeachers = await response.json()
      setAllTeachersInfo(foundTeachers.teachers || [])
    } catch (err) {
      toast.error('Failed to load teachers');
    }
  }

  const handleDeleteTeacher = async (item) => {
    try {
      let data = { _id: item._id }

      let response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/deleteteacher`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      let result = await response.json()

      if (result.success) {
        toast.success('Teacher details deleted successfully!');
        if (!roleName) {
          handleViewAll()
        }
        else {
          handleSearch()
        }
      }
      else {
        toast.error(result.error || 'Teacher details not found!');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Failed to delete teacher.');
    }
  }

  const handleEditTeacherDetails = async () => {
    try {
      const data = { _id: teacherDetails._id, name: teacherDetails.name, email: teacherDetails.email, role: teacherDetails.role, phone: teacherDetails.phone, address: teacherDetails.address };

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/editteacherdetails`, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      const response = await res.json()

      if (response.success) {
        toast.success('Teacher details updated successfully!');
        setOpenTeacherDetailsEditModal(false);

        if (!roleName) {
          handleViewAll()
        }
        else {
          handleSearch()
        }
      }
      else {
        toast.error(response.error || 'Some error occurred, please try again later!');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Failed to update teacher details.');
    }
  }


  const handleChange = (e) => {

    if (e.target.name === "name") {
      setTeacherDetails({
        ...teacherDetails,
        name: e.target.value
      })
    }

    else if (e.target.name === "email") {
      setTeacherDetails({
        ...teacherDetails,
        email: e.target.value
      })
    }

    else if (e.target.name === "role") {
      setTeacherDetails({
        ...teacherDetails,
        role: e.target.value
      })
    }

    else if (e.target.name === "address") {
      setTeacherDetails({
        ...teacherDetails,
        address: e.target.value
      })
    }


    else if (e.target.name === "phone") {
      setTeacherDetails({
        ...teacherDetails,
        phone: e.target.value
      })
    }

  }

  return (
    <>
      <div >
        <style jsx global>{`
       footer{
        display:none;
       }
       nav{
        display:none;
       }
      `}</style>
        <Head>
          <title>Attendance</title>
          <meta name="description" content="Student attendance" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <DashboardSidebar />
        {!openTeacherDetailsEditModal && <div className="lg:ml-60 sticky top-0  z-10">
          <div className="  p-2 font-semibold md:text-lg text-lg  mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200   "><h1 className="text-center mx-auto">List of Teachers</h1></div></div>}
        <main className=' flex items-center justify-center flex-col lg:ml-60 '>



          <div className='flex flex-row gap-2 items-center justify-center px-1'>

            <div className='mt-6'>

              <div className='mt-2'>
                <select className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2 "
                  value={roleName}
                  defaultValue={"default"}
                  onChange={(e) => setRoleName(e.target.value)}
                >
                  <option value={"default"} className="text-center" disabled>
                    Select the Role

                  </option>
                  {uniqueRoleNames.map((role) => { return <option key={role} className="text-center" value={role}>{role}</option> })}

                </select>
              </div>

            </div>

            <div className=" flex mt-6 gap-2 ">

              <button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 p-1.5 rounded text-white mt-2 ease-linear transition-all duration-150"  >
                Search
              </button>

              <button onClick={handleViewAll} className="hidden md:block bg-teal-600 hover:bg-teal-700 p-1.5 rounded text-white mt-2 ease-linear transition-all duration-150"  >
                View All
              </button>

            </div>


          </div>
          <p onClick={handleViewAll} className="md:hidden text-right pr-2 text-blue-700 mt-4 hover:text-blue-600"  >
            View All teachers
          </p>

          {allTeachersInfo.length > 0 ? <div className="overflow-x-auto relative  w-full p-1 lg:p-4">


            <table className="w-full text-sm text-left text-gray-500  mt-2 md:mt-4">
              <thead className="text-xs text-gray-700 uppercase border-b border-r-0 border-collapse bg-gray-50 ">
                <tr >
                  <th scope="col" className="py-3 px-2 md:px-2  text-center ">
                    Name
                  </th>
                  <th scope="col" className="py-3 px-1 md:px-2  text-center">
                    Email
                  </th>
                  <th scope="col" className="py-3 px-1 md:px-2 text-center ">
                    Phone
                  </th>
                  <th scope="col" className="py-3 px-1 md:px-2 text-center">
                    Role
                  </th>
                  <th scope="col" className="py-3 px-1 md:px-2 text-center">
                    Address
                  </th>

                  <th scope="col" className="py-3 px-1 md:px-2 text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>

                {allTeachersInfo.map((item) => {
                  return <tr key={item.email} className="bg-white border-border-collapse">

                    <td className="py-4 px-2 md:px-2 text-center">
                      {item.name}
                    </td>

                    <td className="py-4 px-1 md:px-2 text-center">
                      {item.email}
                    </td>

                    <td className="py-4 px-1 md:px-2 text-center">
                      {item.phone}
                    </td>

                    <td className="py-4 px-1 md:px-2 text-center">
                      {item.role}
                    </td>

                    <td className="py-4 px-1 md:px-2 text-center">
                      {item.address}
                    </td>

                    <td className="py-4 px-2 md:px-2 text-center">
                      <div className="flex space-x-2 items-center justify-center">

                        <button onClick={(e) => {
                          setTeacherDetails((prev) => {
                            return {
                              ...prev,
                              _id: item._id,
                              name: item.name,
                              email: item.email,
                              role: item.role,
                              address: item.address,
                              phone: item.phone,
                            }
                          })

                          setOpenTeacherDetailsEditModal(true)

                        }} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded py-0.5 px-1  md:px-2 md:py-1 ease-linear transition-all duration-150" >Edit</button>

                        <button onClick={(e) => {
                          let confirmVal = confirm("Do you really want to delete?")
                          if (confirmVal) {
                            handleDeleteTeacher(item)
                          }
                        }} className="bg-red-500 hover:bg-red-600 text-white rounded py-0.5 px-1  md:px-2 md:py-1 ease-linear transition-all duration-150" >Delete</button>
                      </div>
                    </td>

                  </tr>
                })}

              </tbody>
            </table>
          </div> : <div className="flex justify-center items-center shadow-sm my-20 p-10 text-red-500">No Teacher records found! Please add Teachers. </div>}


          {openTeacherDetailsEditModal && (

            <div className=" bg-gray-50 h-screen fixed inset-0 flex items-start md:items-center lg:items-start justify-center overflow-y-auto z-50 lg:z-auto ">

              <div className="bg-teal-500  rounded-lg mb-10  lg:ml-60 mt-4 md:mt-0 lg:mt-4">
                <div className="text-center font-bold text-xl mt-4 border-b border-solid border-slate-200">
                  <h2 className="mb-2 text-gray-100">Edit the teacher details</h2>
                </div>
                <div>

                  <div className='p-6  pt-6 flex justify-center w-full'>

                    <div className="block p-6 rounded-lg shadow-lg bg-white lg:w-[50rem] w-80 md:w-[40rem]  mb-1">

                      <div className="form-group mb-6">
                        <label htmlFor="name" className="formLabel inline-block mb-2 text-gray-700">Name</label>
                        <input onChange={handleChange} value={teacherDetails.name} name="name" type="text" className="form-control
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
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="name"
                          placeholder="Enter a name" />
                      </div>


                      <div className="form-group mb-6">
                        <label htmlFor="email" className="formLabel inline-block mb-2 text-gray-700">Email</label>
                        <input onChange={handleChange} value={teacherDetails.email} name="email" type="email" className="form-control
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
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="email"
                          placeholder="Enter the mail id" />
                      </div>

                      <div className="form-group mb-6">
                        <label htmlFor="address" className="formLabel inline-block mb-2 text-gray-700">Address</label>
                        <input onChange={handleChange} value={teacherDetails.address} name="address" type="text" className="form-control
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
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="address"
                          placeholder="Enter the address" />
                      </div>

                      <div className="form-group mb-6">
                        <label htmlFor="phone" className="formLabel inline-block mb-2 text-gray-700">Phone number</label>
                        <input onChange={handleChange} value={teacherDetails.phone} name="phone" type="number" className="form-control
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
          focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="phone"
                          placeholder="Enter the phone number" />
                      </div>



                      <div className="form-group mb-6">
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
                    </div></div>
                </div>
                <div className="flex items-center justify-end p-4 border-t border-solid border-slate-200 rounded-b">
                  <button
                    className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setOpenTeacherDetailsEditModal(false)}
                  >
                    Close
                  </button>
                  <button

                    className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => {
                      handleEditTeacherDetails()
                    }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </>


  )
}

export async function getServerSideProps(context) {
  const authRedirect = verifySSRAuth(context, { requiredRole: 'admin' });
  if (authRedirect) {
    return authRedirect;
  }

  await connectDb()

  // CRITICAL: Exclude password from SSR props to prevent password leakage in __NEXT_DATA__
  let users = await User.find({}).select('-password')

  return { props: { allTeachers: JSON.parse(JSON.stringify(users)) } }
}
