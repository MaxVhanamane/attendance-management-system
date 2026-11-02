import React, { useContext, useRef, useEffect, useState } from 'react'
import Link from 'next/link';
import { IoIosAddCircle } from "react-icons/io";
import { BsFillEyeFill } from "react-icons/bs";
import { RiLogoutCircleRLine, RiCloseCircleFill } from "react-icons/ri";
import { GiDeskLamp, GiHamburgerMenu } from "react-icons/gi";
import { BiEditAlt } from "react-icons/bi";
import { AiFillHome } from "react-icons/ai";
import { useRouter } from 'next/router';
import { AuthContext } from './../context/AuthState';

export default function DashboardSidebar() {
   const router = useRouter()
   const currentPath = router.pathname
   const { role, removeToken } = useContext(AuthContext);
   const dashBoardToggler = useRef();

   const toggleSidebar = () => {
      if (dashBoardToggler.current.classList.contains("-translate-x-full")) {
         dashBoardToggler.current.classList.remove("-translate-x-full");
         dashBoardToggler.current.classList.add("-translate-x-0");
      } else {
         dashBoardToggler.current.classList.remove("-translate-x-0");
         dashBoardToggler.current.classList.add("-translate-x-full");
      }
   };

   const isAdmin = role && role.toLowerCase() === 'admin';

   return (
      <>
         <div onClick={toggleSidebar} className="lg:hidden fixed top-[0.5rem] left-5 text-3xl text-gray-50 flex items-center justify-center z-20">
            <GiHamburgerMenu />
         </div>
         <aside ref={dashBoardToggler} className="overflow-y-scroll h-full shadow-md rounded-sm sidebar w-60 fixed top-0 left-0 bg-gray-100 z-20 transform transition-transform -translate-x-full lg:translate-x-0 duration-300" aria-label="Sidebar">
            <div className="overflow-y-auto py-4 px-3 h-full bg-gray-50">
               <div onClick={toggleSidebar} className="fixed right-1 top-1 text-xl text-gray-500 lg:hidden cursor-pointer">
                  <RiCloseCircleFill />
               </div>

               <div className="flex text-lg transition duration-500 items-center justify-center gap-1 py-0.5 px-2 font-semibold antialiased text-gray-50 border border-teal-400 rounded-lg cursor-pointer my-2 lg:my-auto">
                  <GiDeskLamp className="text-xl text-teal-500" /><span className="h-8 text-teal-500">Class<span className='text-teal-400'>Scribe</span></span>
               </div>
               <ul className="space-y-2 mt-8">
                  <li onClick={toggleSidebar}>
                     <Link href="/dashboard/addstudent">
                        <a className={`cursor-pointer flex items-center p-2 ${currentPath === "/dashboard/addstudent" ? "text-teal-600 font-semibold" : 'text-gray-500'} text-base font-normal rounded-lg hover:bg-gray-100`}>
                           <IoIosAddCircle className="flex-shrink-0 w-6 h-6 transition duration-75" />
                           <span className="flex-1 ml-3 whitespace-nowrap">Add students</span>
                        </a>
                     </Link>
                  </li>

                  {isAdmin && (
                     <li onClick={toggleSidebar}>
                        <Link href="/dashboard/addteacher">
                           <a className={`cursor-pointer flex items-center p-2 ${currentPath === "/dashboard/addteacher" ? "text-teal-600 font-semibold" : 'text-gray-500'} text-base font-normal rounded-lg hover:bg-gray-100`}>
                              <IoIosAddCircle className="flex-shrink-0 w-6 h-6 transition duration-75" />
                              <span className="flex-1 ml-3 whitespace-nowrap">Add Teachers</span>
                           </a>
                        </Link>
                     </li>
                  )}

                  <li onClick={toggleSidebar}>
                     <Link href="/dashboard/editattendance">
                        <a className={`cursor-pointer flex items-center p-2 ${currentPath === "/dashboard/editattendance" ? "text-teal-600 font-semibold" : 'text-gray-500'} text-base font-normal rounded-lg hover:bg-gray-100`}>
                           <BiEditAlt className="flex-shrink-0 w-6 h-6 transition duration-75" />
                           <span className="flex-1 ml-3 whitespace-nowrap">Edit Attendance</span>
                        </a>
                     </Link>
                  </li>

                  <li onClick={toggleSidebar}>
                     <Link href="/dashboard/viewallstudents">
                        <a className={`cursor-pointer flex items-center p-2 ${currentPath === "/dashboard/viewallstudents" ? "text-teal-600 font-semibold" : 'text-gray-500'} text-base font-normal rounded-lg hover:bg-gray-100`}>
                           <BsFillEyeFill className="flex-shrink-0 w-6 h-6 transition duration-75" />
                           <span className="flex-1 ml-3 whitespace-nowrap">View all students</span>
                        </a>
                     </Link>
                  </li>

                  {isAdmin && (
                     <li onClick={toggleSidebar}>
                        <Link href="/dashboard/viewallteachers">
                           <a className={`cursor-pointer flex items-center p-2 ${currentPath === "/dashboard/viewallteachers" ? "text-teal-600 font-semibold" : 'text-gray-500'} text-base font-normal rounded-lg hover:bg-gray-100`}>
                              <BsFillEyeFill className="flex-shrink-0 w-6 h-6 transition duration-75" />
                              <span className="flex-1 ml-3 whitespace-nowrap">View all teachers</span>
                           </a>
                        </Link>
                     </li>
                  )}

                  <li onClick={toggleSidebar}>
                     <Link href="/">
                        <a className="cursor-pointer flex items-center p-2 text-base font-normal text-gray-500 rounded-lg hover:bg-gray-100">
                           <AiFillHome className="flex-shrink-0 w-6 h-6 text-gray-500 transition duration-75" />
                           <span className="flex-1 ml-3 whitespace-nowrap">Home</span>
                        </a>
                     </Link>
                  </li>

                  <li onClick={() => {
                     const con = confirm("Do you really want to logout?")
                     if (con) {
                        removeToken();
                     }
                  }}>
                     <p className="cursor-pointer flex items-center p-2 text-base font-normal text-red-500 rounded-lg hover:bg-gray-100">
                        <RiLogoutCircleRLine className="flex-shrink-0 w-6 h-6 text-red-500 transition duration-75" />
                        <span className="flex-1 ml-3 whitespace-nowrap">Logout</span>
                     </p>
                  </li>
               </ul>
            </div>
         </aside>
      </>
   )
}
