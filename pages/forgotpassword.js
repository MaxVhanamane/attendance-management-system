import React, { useEffect, useState, useContext } from 'react'
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GiDeskLamp } from 'react-icons/gi';
import Image from 'next/image';
import { AuthContext } from '../context/AuthState';


export default function Forgotpassword() {
  const router = useRouter()
  const { token } = useContext(AuthContext)
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [cNewpassword, setCNewPassword] = useState("")

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
      setNewPassword(e.target.value)

    }
    else if (e.target.name === "cpassword") {
      setCNewPassword(e.target.value)

    }
  }

  const isValidEmail=(email)=> {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  const handleSendMail = async () => {
   if(!email.length>0){
    toast.warn("Kindly provide your email address.");
    return
   }
   
    if (isValidEmail(email)) {


      const data = { email, sendMail: true };

      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/forgotpassword`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const response = await res.json()

      if (response.success) {
        toast.success("We have emailed you password reset link. Check your mail.");
        setEmail("")
      }

      else {
        toast.error("No user found! Please enter a valid mail id.");

      }

    }

    else {
      toast.error("Please enter a valid email address.");
    }



  }


  const handleResetPassword = async () => {
    // Check if the password and confirm password matches
    if (newPassword === cNewpassword) {
      if(newPassword.length>7 && cNewpassword.length>7){

      const data = { email: router.query.email, sendMail: false, token: router.query.token, newPassword: newPassword };

      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/forgotpassword`, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const response = await res.json()

      if (response.success) {
        toast.success("Your password has been Changed successfully.", {

          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        router.push("/login")
      }

      else {
        toast.error(response.message, {

          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        router.push("/forgotpassword")

      }

    }
    
    else {
      toast.error("Password must be at least 8 characters long", {

        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  }


    else {
      toast.error("New password and confirm new password must be same.", {

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
    <section className="h-screen">
      <div className=" py-12 px-6 h-full">
        <div className="flex justify-center items-center flex-wrap h-full  text-gray-800">
          <div className="w-full  lg:w-1/2 sm:w-[70%] md:w-[90%]">
            <div className="   shadow-md shadow-gray-400 rounded-lg p-4">
              <div className="flex justify-center items-center md:justify-around flex-col md:flex-row ">
              <div className="  overflow-hidden ">
              <div className='lg:w-80 lg:h-80 w-64 h-44 md:w-72 md:h-72 relative'>
                <Image priority={true} src={ router.query.token ?"/happy.svg" :"/forgot_password.svg"} layout="fill" objectFit="contain" alt={router.query.token ?"Illustration of a happy face" :"Illustration of a person recovering password"} />
                </div>
              </div>
                  <div className=" 
                   w-64  md:w-72 lg:px-8 flex items-center justify-center flex-col">
                    <div className="flex items-center justify-center flex-col ">
                    <div className="w-[3.25rem] bg-teal-500 h-[3.25rem] hidden md:flex items-center justify-center text-white rounded-full font-bold mt-6 md:mt-auto shadow-lg shadow-gray-50  "><GiDeskLamp className='text-3xl'/></div>
                      <h4 className=" text-lg md:text-xl font-semibold  mb-4 mt-2 pb-1 text-gray-700">{router.query.token ?"Change Password":"Forgot Password"}</h4>

                    </div>
                    {/* If user has a token in his url it means he is visiting this page using the link that we sent him in a mail.
                    So we will show him password reset page. If he does not have a token in his url then will let him generate 
                    password reset link. */}
                    {router.query.token && <div className='w-64  md:w-72 lg:px-8'>

                      <div className="mb-4">
                        <input
                          onChange={handleChange}
                          type="password"
                          className=" block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none"
                          id="password"
                          placeholder="New password"
                          name="password"
                          value={newPassword}
                        />
                      </div>
                      <div className="mb-4">

                        <input
                          onChange={handleChange}
                          type="password"
                          className=" block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none"
                          id="cpassword"
                          placeholder="Confirm new password"
                          name="cpassword"
                          value={cNewpassword}

                        />
                      </div>

                      <div className="text-center pt-1 mb-4 md:mb-0 pb-1">
                        <button
                          onClick={handleResetPassword}

                          className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight  rounded shadow-md   active:shadow-lg  w-full mb-2 bg-teal-500 hover:bg-teal-600 ease-linear transition-all duration-150"
                          type="button"

                        >
                          Change Password
                        </button>
                        <button
                          onClick={() => router.push('/login')}
                          className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full  bg-gray-600 hover:bg-gray-700 "
                          type="button"

                        >
                          Back to Login page
                        </button>
                      </div>
                    </div>}

                    {!router.query.token && <div>
                      <div className="mb-4">
                        <input
                          onChange={handleChange}
                          type="email"
                          className="block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-teal-600 focus:outline-none"
                          id="email"
                          placeholder="Email"
                          name="email"
                          value={email} />
                          
                      </div>

                      <div className="text-center pt-1 mb-4 md:mb-0 ">
                        <button
                          onClick={handleSendMail}
                          className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full mb-3 bg-teal-500 hover:bg-teal-600 "
                          type="button"

                        >
                          Send Password Reset Link
                        </button>
                        <button
                          onClick={() => router.push('/login')}
                          className="  inline-block px-6 py-2.5 text-white font-medium text-xs leading-tight  rounded shadow-md   active:shadow-lg transition duration-150 ease-in-out w-full bg-gray-600 hover:bg-gray-700 "
                          type="button"

                        >
                          Back to Login page
                        </button>
                      </div>
                  
                    </div>}
                  </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
