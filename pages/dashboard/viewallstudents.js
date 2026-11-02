import Head from 'next/head'
import { useState } from 'react'
import Student from './../../models/students';
import connectDb from './../../middleware/mongoose';
import { toast } from 'react-toastify';
import DashboardSidebar from '../../components/DashboardSidebar';
import { verifySSRAuth } from '../../middleware/auth';
import { fetchWithAuth } from '../../lib/fetchWithAuth';

export default function ViewAllStudents({ allStudents }) {

  const [data, setData] = useState([])
  const [dataToSortClassNameAndDiv, setDataToSortClassNameAndDiv] = useState(allStudents)
  const [openStudentDetailsEditModal, setOpenStudentDetailsEditModal] = useState(false);

  let classNamesWithDuplicates = dataToSortClassNameAndDiv.map((student) => { return student.className })
  let uniqueClassNames = [...new Set(classNamesWithDuplicates)].sort(function (a, b) { return a - b; });

  // Edit student details
  const [studentDetails, setStudentDetails] = useState({
    _id: "",
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


  const [selectClass, setSelectClass] = useState();
  const [selectDivisionName, setselectDivisionName] = useState();
  const [checkStudents, setCheckStudents] = useState(false)

  let division = dataToSortClassNameAndDiv.map((div) => { return div.division })
  let uniqueDivisionName = [...new Set(division)].sort()

  const handleSearch = async () => {

    let foundStudents = dataToSortClassNameAndDiv.filter((data) => {
      if (data.className === selectClass && data.division === selectDivisionName) {
        return data
      }
    })

    if (foundStudents.length > 0) {
      setCheckStudents(false)
    }
    else {
      setCheckStudents(true)
    }
    setData(foundStudents)
    setselectDivisionName("default")
    setSelectClass("default")
  }


  const handleDeleteStudent = async (item) => {
    try {
      let studentInfo = item

      let response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/deletestudent`, {
        method: 'POST',
        body: JSON.stringify(studentInfo),
      })

      let result = await response.json()

      if (result.success) {
        const newData = dataToSortClassNameAndDiv.filter((student) => student._id !== studentInfo._id)
        setDataToSortClassNameAndDiv(newData)

        const newData2 = data.filter((student) => student._id !== studentInfo._id)
        setData(newData2)
        toast.success(result.message || 'Student deleted successfully');
      }
      else {
        toast.error(result.error || result.message || 'Failed to delete student');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Failed to delete student.');
    }
  }

  // Edit student details

  const handleChange = (e) => {
    if (e.target.name === "name") {
      setStudentDetails({
        ...studentDetails,
        name: e.target.value
      })
    }

    else if (e.target.name === "email") {
      setStudentDetails({
        ...studentDetails,
        email: e.target.value
      })
    }

    else if (e.target.name === "className") {
      setStudentDetails({
        ...studentDetails,
        className: e.target.value
      })
    }

    else if (e.target.name === "division") {
      setStudentDetails({
        ...studentDetails,
        division: e.target.value.toUpperCase()
      })
    }

    else if (e.target.name === "rollNumber") {
      setStudentDetails({
        ...studentDetails,
        rollNumber: e.target.value
      })
    }

    else if (e.target.name === "phone") {
      setStudentDetails({
        ...studentDetails,
        phone: e.target.value
      })
    }


    else if (e.target.name === "genRegNumber") {
      setStudentDetails({
        ...studentDetails,
        genRegNumber: e.target.value
      })
    }

    else if (e.target.name === "DOB") {
      setStudentDetails({
        ...studentDetails,
        DOB: e.target.value
      })
    }

    else if (e.target.name === "caste") {
      setStudentDetails({
        ...studentDetails,
        caste: e.target.value
      })
    }

    else if (e.target.name === "subCaste") {
      setStudentDetails({
        ...studentDetails,
        subCaste: e.target.value
      })
    }


  }
  const handleEditStudentDetails = async () => {
    try {
      const studentInfo = { _id: studentDetails._id, name: studentDetails.name, email: studentDetails.email, className: studentDetails.className, division: studentDetails.division, rollNumber: studentDetails.rollNumber, phone: studentDetails.phone, genRegNumber: studentDetails.genRegNumber, DOB: new Date(studentDetails.DOB), caste: studentDetails.caste, subCaste: studentDetails.subCaste };

      const res = await fetchWithAuth(`${process.env.NEXT_PUBLIC_HOST}/api/editstudentdetails`, {
        method: 'POST',
        body: JSON.stringify(studentInfo),
      })
      const response = await res.json()

      if (response.success) {
        toast.success('Student details updated successfully!');
        let index = data.findIndex(student => student._id === studentDetails._id);
        let newData = [...data]
        newData.splice(index, 1, response.data)
        let student = data[index]
        setData(newData)
        if (student && (student.className != response.data?.className || student.division != response.data?.division)) {
          let newFoundStudents = newData.filter((data) => {
            if (data.className === student.className && data.division === student.division) {
              return data
            }
          })
          setData(newFoundStudents)
        }

        let index2 = dataToSortClassNameAndDiv.findIndex(obj => obj._id === studentDetails._id);
        let newDataToSortClassNameAndDiv = [...dataToSortClassNameAndDiv]
        newDataToSortClassNameAndDiv.splice(index2, 1, response.data)
        setDataToSortClassNameAndDiv(newDataToSortClassNameAndDiv)
      }
      else {
        toast.error(response.error || 'Some error occurred, please try again later!');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Failed to update student details.');
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
        <title>Attendance</title>
        <meta name="description" content="Student attendance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardSidebar />
      {!openStudentDetailsEditModal && <div className="lg:ml-60 sticky top-0  z-10">
        <div className="  p-2 font-semiboldmd:text-lg text-lg  mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200 "><h1 className="text-center mx-auto">List of students</h1></div></div>}
      <main className=' flex items-center justify-center flex-col lg:ml-60 '>
        <div className='flex flex-row gap-2 items-center justify-center px-1'>

          <div className='mt-6'>

            <div className='mt-2'>
              <select className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2 "
                value={selectClass}
                defaultValue={"default"}
                onChange={(e) => setSelectClass(e.target.value)}
              >
                <option value={"default"} className="text-center" disabled>
                  Select the class

                </option>
                {uniqueClassNames.map((cls) => { return <option key={cls} className="text-center" value={cls}>{cls}</option> })}

              </select>
            </div>

          </div>

          <div className='mt-6'>

            <div className='mt-2'>
              <select className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-teal-500 focus:border-teal-500 block w-full p-2 "
                value={selectDivisionName}
                defaultValue={"default"}
                onChange={(e) => setselectDivisionName(e.target.value)}
              >
                <option value={"default"} className="text-center" disabled>
                  Select the division

                </option>
                {uniqueDivisionName && uniqueDivisionName.map((div, ind) => { return <option key={div} className="text-center" value={div}>{div}</option> })}

              </select>
            </div>
          </div>
          <div className=" flex mt-6 gap-2 ">
            <button onClick={handleSearch} className="bg-teal-600 hover:bg-teal-700 p-1.5 rounded text-white mt-2 ease-linear transition-all duration-150"  >
              Search
            </button>
            {/* 
            <button onClick={handleViewAll} className="hidden md:block bg-teal-600 hover:bg-teal-700 p-1.5 rounded text-white mt-2 ease-linear transition-all duration-150"  >
              View All
            </button> */}

          </div>
        </div>

        {data.length > 0 ? <div className="overflow-x-auto relative  w-full p-1 lg:p-4">

          {/* <p onClick={handleViewAll} className="md:hidden text-right pr-2 text-blue-700 mt-2 hover:text-blue-600"  >
              View All students
            </p> */}
          <table className="w-full text-sm text-left text-gray-500  mt-4">
            <thead className="text-xs text-gray-700 uppercase border-b border-r-0 border-collapse bg-gray-50 ">
              <tr >
                <th scope="col" className="py-3 px-2 md:px-2  text-center ">
                  GR No.
                </th>
                <th scope="col" className="py-3 px-2 md:px-2  text-center ">
                  DOB
                </th>
                <th scope="col" className="py-3 px-1 md:px-2  text-center">
                  Caste
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center ">
                  Subcast
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Name
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  R.No
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Class
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Division
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Email
                </th>
                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Phone
                </th>

                <th scope="col" className="py-3 px-1 md:px-2 text-center">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {data.sort((d, e) => { return d.rollNumber - e.rollNumber }).map((item, index) => {
                return <tr key={index} className="bg-white border-border-collapse">

                  <td className="py-4 px-2 md:px-2 text-center">
                    {item.genRegNumber}
                  </td>

                  <td className="py-4 px-2 md:px-2 text-center">
                    {new Date(item.DOB).toLocaleDateString('en-GB')}
                  </td>

                  <td className="py-4 px-2 md:px-2 text-center">
                    {item.caste}
                  </td>

                  <td className="py-4 px-2 md:px-2 text-center">
                    {item.subCaste}
                  </td>

                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.name}
                  </td>

                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.rollNumber}
                  </td>
                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.className}
                  </td>

                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.division}
                  </td>

                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.email}
                  </td>

                  <td className="py-4 px-1 md:px-2 text-center">
                    {item.phone}
                  </td>

                  <td className="py-4 px-2 md:px-2 text-center">
                    <div className="flex space-x-2 items-center justify-center">
                      <button onClick={(e) => {
                        let DateVal = new Date(item.DOB).toISOString().split("T")[0]
                        setStudentDetails((prev) => {
                          return {
                            ...prev,
                            _id: item._id,
                            name: item.name,
                            email: item.email,
                            phone: item.phone,
                            className: item.className,
                            division: item.division,
                            rollNumber: item.rollNumber,
                            genRegNumber: item.genRegNumber,
                            DOB: DateVal,
                            caste: item.caste,
                            subCaste: item.subCaste
                          }
                        })

                        setOpenStudentDetailsEditModal(true)

                      }} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded py-0.5 px-1  md:px-2 md:py-1 ease-linear transition-all duration-150" >Edit</button>

                      <button onClick={(e) => {
                        let confirmVal = confirm("Do you really want to delete?")
                        if (confirmVal) {
                          handleDeleteStudent(item)
                        }
                      }} className="bg-red-500 hover:bg-red-600 text-white rounded py-0.5 px-1  md:px-2 md:py-1 ease-linear transition-all duration-150" >Delete</button>
                    </div>
                  </td>

                </tr>
              })}

            </tbody>
          </table>
        </div> : <div className="flex justify-center items-center font-bold my-12 p-10 text-teal-500">{checkStudents ? <p className="text-red-500">No student records found! Please add students</p> : <p>Please select classname and division</p>} </div>}

        {openStudentDetailsEditModal && (
          <div className="bg-gray-50 h-screen fixed inset-0 flex items-start justify-center overflow-y-auto z-50 lg:z-auto ">
            <div className="bg-teal-500  rounded-lg mb-10  lg:ml-60 mt-4  ">
              <div className="text-center font-bold text-xl mt-4 border-b border-solid border-slate-200">
                <h2 className="mb-2 text-gray-100">Edit the student details</h2>
              </div>
              <div>
                <div className='p-6  pt-6 flex justify-center w-full'>
                  <div className="block p-6 rounded-lg shadow-lg bg-white lg:w-[50rem] w-80 md:w-[40rem]  mb-1">
                    <div className=" mb-6">
                      <label htmlFor="name" className="formLabel inline-block mb-2 text-gray-700">Name</label>
                      <input onChange={handleChange} value={studentDetails.name} name="name" type="text" className="form-control
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
                    <div className=" mb-6">
                      <label htmlFor="email" className="formLabel inline-block mb-2 text-gray-700">Email</label>
                      <input onChange={handleChange} value={studentDetails.email} name="email" type="email" className="form-control
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
                        placeholder="Enter a parent's mail id" />
                    </div>

                    <div className=" mb-6">
                      <label htmlFor="phone" className="formLabel inline-block mb-2 text-gray-700">Phone</label>
                      <input onChange={handleChange} value={studentDetails.phone} name="phone" type="number" className="form-control
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


                    <div className=" mb-6">
                      <label htmlFor="classname" className="formLabel inline-block mb-2 text-gray-700">Class Name</label>
                      <input onChange={handleChange} value={studentDetails.className} name="className" type="number" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="classname"
                        placeholder="Enter a class name" />
                    </div>


                    <div className=" mb-6">
                      <label htmlFor="division" className="formLabel inline-block mb-2 text-gray-700">Division</label>
                      <input onChange={handleChange} value={studentDetails.division} name="division" type="text" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="division"
                        placeholder="Enter a division name" />
                    </div>


                    <div className=" mb-6">
                      <label htmlFor="rollnumber" className="formLabel inline-block mb-2 text-gray-700">Roll Number</label>
                      <input onChange={handleChange} value={studentDetails.rollNumber} name="rollNumber" type="number" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="rollnumber"
                        placeholder="Enter a roll number" />
                    </div>



                    <div className=" mb-6">
                      <label htmlFor="genRegNumber" className="formLabel inline-block mb-2 text-gray-700">General register number</label>
                      <input onChange={handleChange} value={studentDetails.genRegNumber} name="genRegNumber" type="number" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="genRegNumber"
                        placeholder="Enter general register number" />
                    </div>


                    <div className=" mb-6">
                      <label htmlFor="DOB" className="formLabel inline-block mb-2 text-gray-700">Date of birth</label>
                      <input onChange={handleChange} value={studentDetails.DOB} name="DOB" type="date" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="DOB"
                        placeholder="Enter date of birth" />
                    </div>


                    <div className=" mb-6">
                      <label htmlFor="caste" className="formLabel inline-block mb-2 text-gray-700">Caste</label>
                      <input onChange={handleChange} value={studentDetails.caste} name="caste" type="text" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="caste"
                        placeholder="Enter caste" />
                    </div>


                    <div className=" mb-6">
                      <label htmlFor="subCaste" className="formLabel inline-block mb-2 text-gray-700">Subcast</label>
                      <input onChange={handleChange} value={studentDetails.subCaste} name="subCaste" type="text" className="form-control
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
    focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none" id="subCaste"
                        placeholder="Enter subcaste" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-end p-4 border-t border-solid border-slate-200 rounded-b">
                <button
                  className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => setOpenStudentDetailsEditModal(false)}
                >
                  Close
                </button>
                <button
                  className="bg-blue-500 text-white hover:bg-blue-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                  type="button"
                  onClick={() => {
                    handleEditStudentDetails()
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  )
}

export async function getServerSideProps(context) {
  const authRedirect = verifySSRAuth(context);
  if (authRedirect) {
    return authRedirect;
  }

  await connectDb()

  let students = await Student.find({}).sort({ className: 1, division: 1, rollNumber: 1 })

  return { props: { allStudents: JSON.parse(JSON.stringify(students)) } }
}

