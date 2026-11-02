import Head from 'next/head'
import { useState } from 'react'
import Student from '../../models/students';
import connectDb from '../../middleware/mongoose';
import DashboardSidebar from '../../components/DashboardSidebar';
import Link from 'next/link';
import { verifySSRAuth } from '../../middleware/auth';


export default function EditAttendace({ allStudents }) {

  const [data, setData] = useState([])
  const [studentsToSortByClassNameAndDivision, setStudentsToSortByClassNameAndDivision] = useState(allStudents)

  let classNamesWithDuplicates = studentsToSortByClassNameAndDivision.map((student) => { return student.className })
  let uniqueClassNames = [...new Set(classNamesWithDuplicates)].sort(function (a, b) { return a - b; });

  const [selectClass, setSelectClass] = useState();
  const [selectDivisionName, setselectDivisionName] = useState();
  const [checkStudents, setCheckStudents] = useState(false)

  let division = studentsToSortByClassNameAndDivision.map((div) => { return div.division })
  let uniqueDivisionName = [...new Set(division)].sort()


  const handleSearch = async () => {

    let foundStudents = studentsToSortByClassNameAndDivision.filter((data) => {

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


  return (
    <>
      <Head>
        <title>Edit Attendance - ClassScribe</title>
        <meta name="description" content="Edit student attendance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DashboardSidebar />
      <div className="lg:ml-60 sticky top-0  z-10">
        <div className="  p-2 font-semibold md:text-lg text-lg mx-auto text-center shadow  text-gray-50 bg-gradient-to-tr from-teal-500 to-teal-200   "><h1 className="text-center mx-auto">Edit attendance</h1></div></div>
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
                      <Link href={`/dashboard/viewattendance?_id=${item._id}&className=${item.className}&division=${item.division}&name=${item.name}`}><button className="bg-teal-500 hover:bg-teal-600 text-white rounded py-0.5 px-1  md:px-2 md:py-1 ease-linear transition-all duration-150" >View <span className='hidden lg:inline-block'>Attendance</span></button></Link>
                    </div>
                  </td>

                </tr>
              })}
            </tbody>
          </table>
        </div> : <div className="flex justify-center items-center font-bold my-12 p-10 text-teal-500">{checkStudents ? <p className="text-red-500">No student records found! Please add students</p> : <p>Please select classname and division</p>} </div>}
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


