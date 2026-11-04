import React, { useState, useEffect, useContext } from 'react'
import Link from "next/link"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/router';
import Head from "next/head";
import { AuthContext } from '../context/AuthState';
import { GiDeskLamp } from "react-icons/gi"
import Image from 'next/image';


export default function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { setToken, setRole, setUser, token } = useContext(AuthContext)
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  useEffect(() => {
    if (token) {
      router.push("/")
    }
  }, [token, router])

  const handleChange = (e) => {

    if (e.target.name === "email") {
      setEmail(e.target.value)
    }
    else if (e.target.name === "password") {
      setPassword(e.target.value)

    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoggingIn(true)
    const data = { email, password };

    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify(data),
    })

    const response = await res.json()

    if (response.success) {
      setToken("authenticated")
      setRole(response.role)
      if (setUser) {
        setUser({ email: response.email, role: response.role })
      }

      toast.success('Logged in successfully!', {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      router.push("/")
    }
    else {
      setIsLoggingIn(false)
      toast.error(response.error, {
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }

  return (
    <>
      <Head>
        <title>ClassScribe - Login</title>
        <meta name="description" content="Login page" />
      </Head>
      <section className=" bg-gray-50 fixed top-[54px] inset-0 ">

        <div className="flex justify-center items-center  text-gray-800 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2   w-full  lg:w-1/2 sm:w-[70%] md:w-[90%]  ">
          <div className=" w-full flex items-center justify-center flex-col md:flex-row mx-6 rounded-lg px-2 border border-gray-300/90">
            <div className="  overflow-hidden ">
              <div className='lg:w-80 lg:h-80 w-64 h-64 md:w-72 md:h-72 relative'>
                <Image priority={true} src={"/school.svg"} layout="fill" objectFit="contain" alt='Illustration of students going to school' />
              </div>
            </div>
            <div className=" md:w-80 w-64">
              <div className="">
                <div className=" px-4 md:px-0">
                  <div className="md:p-10   ">
                    <div className="flex items-center justify-center flex-col">
                      <div className="w-[3.25rem] hidden  bg-teal-500 h-[3.25rem] md:flex items-center justify-center text-white rounded-full font-bold mt-6 md:mt-auto"><GiDeskLamp className='text-3xl' /></div>
                      <h4 className="text-xl md:text-2xl font-semibold  mb-5 mt-2 pb-1 text-gray-700">Login</h4>
                    </div>
                    <form onSubmit={handleLogin} className="" >
                      <div className="mb-4">
                        <input
                          onChange={handleChange}
                          type="email"
                          className=" block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none"
                          id="email"
                          placeholder="Email"
                          name="email"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <input
                          onChange={handleChange}
                          type="password"
                          className=" block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none"
                          id="password"
                          placeholder="Password"
                          name="password"
                          required
                        />
                      </div>
                      <div className="text-center pt-1 mb-10 pb-1">
                        <button
                          className=" bg-teal-500 hover:bg-teal-600 ease-linear transition-all duration-150 inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight  rounded shadow-md   active:shadow-lg  w-full mb-3  "
                          type="submit"
                          disabled={isLoggingIn}
                        >
                          {!isLoggingIn ? <p className='h-4'>Log in</p> : <p className='flex items-center justify-center flex-row'> <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg> Logging in...</p>}
                        </button>
                        <Link href="/forgotpassword" ><span className="text-gray-600 hover:text-gray-800 ease-linear transition-all duration-150 font-semibold text-md cursor-pointer">Forgot password?</span></Link>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
