import React, { useState, useContext } from 'react'
import Link from "next/link"
import { useRouter } from "next/router"
import { AuthContext } from './../context/AuthState';
import { GiDeskLamp } from "react-icons/gi"
import { FiMenu } from "react-icons/fi"
import { AiOutlineHome, AiOutlineDashboard, AiOutlineLogout, AiOutlineClose } from "react-icons/ai"

export default function Navbar() {

  const [showToggler, setShowToggler] = useState(false)
  const [changeHambIcon, setChangeHambIcon] = useState(true)
  const router = useRouter()
  const currentPath = router.pathname
  const { removeToken, token } = useContext(AuthContext);

  return (
    <nav className="w-screen bg-gray-50 border-b border-gray-300/90  px-2 sm:px-4 py-2 fixed z-20 top-0  " >
      <div className=" flex flex-wrap  ">
        <div className='w-full relative sm:w-auto flex  items-center justify-center '>
          <Link href="/">
            <p className="flex text-xl   items-center justify-center gap-2 py-0.5 px-2 font-bold antialiased  cursor-pointer  ">
              <GiDeskLamp className="text-2xl text-teal-500 " /> <span className="h-8 text-teal-500">Class<span className='text-teal-400'>Scribe</span></span>  </p>
          </Link>
          {(token && !showToggler) && <div className="absolute inset-x-0 left-0 flex items-center sm:hidden">
            <button onClick={() => { setShowToggler(true) }} type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-400  focus:outline-none " title='toggle-menu'>
              <FiMenu className='text-2xl' />
            </button>
          </div>}
        </div>

        {token && <div className="hidden md:flex items-center justify-center sm:block sm:ml-6">
          <div className=" space-x-4 ">
            <Link href="/"><a className={`${currentPath == "/" ? "text-teal-500" : 'text-gray-500'}  hover:bg-gray-100  px-3 py-2 rounded-2xl text-sm font-medium transition duration-300 `} >Home</a></Link>
            <Link href="/dashboard/addstudent"><a className={`text-gray-500 hover:bg-gray-100  px-3 py-2 rounded-2xl text-sm font-medium transition duration-300`} >Dashboard</a></Link>

            <button
              type="button"
              onClick={() => {
                const confirmValue = confirm("Do you really want to Logout?")
                if (confirmValue) {
                  removeToken()
                }
              }}
              className="text-gray-500 hover:bg-gray-100 px-3 py-2 rounded-2xl text-sm font-medium transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>}
      </div>
      <div className={`sm:hidden absolute  top-0 left-0 bg-gray-100  w-[80%] h-screen transition-transform duration-300  ${(showToggler && token) ? "translate-x-0" : "-translate-x-full"}`} >
        <p className='text-center pt-10'>Menu</p>
        <div className='absolute top-3 right-4'>
          <button onClick={() => { setShowToggler(false) }}><AiOutlineClose className='text-lg' /></button>
        </div>
        <div className="px-2 pt-6 pb-3  flex flex-col  ">
          <ul className="flex flex-col gap-6">
            <li onClick={() => { setShowToggler(!showToggler); setChangeHambIcon(!changeHambIcon) }}>
              <Link href="/">
                <a className="text-gray-500 rounded-md text-sm font-medium transition duration-300"><span className='flex gap-2 items-center pl-4'><AiOutlineHome className='text-xl' />Home</span></a>
              </Link>
            </li>
            <li onClick={() => { setShowToggler(!showToggler); setChangeHambIcon(!changeHambIcon) }}>
              <Link href="/dashboard/addstudent">
                <a className="text-gray-500 rounded-md text-sm font-medium transition duration-300"><span className='flex gap-2 items-center pl-4'><AiOutlineDashboard className='text-xl' />Dashboard</span></a>
              </Link>
            </li>
            <li onClick={() => {
              let confirmValue = confirm("Do you really want to Logout?")
              if (confirmValue) {
                removeToken();
                setChangeHambIcon(!changeHambIcon)
                setShowToggler(!showToggler)
              }
            }}>
              <span className="text-red-500 cursor-pointer rounded-md text-sm font-medium transition duration-300"><span className='flex gap-2 items-center pl-4'><AiOutlineLogout className='text-xl' />Logout</span></span>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
