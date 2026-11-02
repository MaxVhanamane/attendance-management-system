import Head from "next/head"
import connectDb from './../middleware/mongoose';
import Student from '../models/students';
import Select from './../components/Select';
import { useContext } from "react";
import { AuthContext } from "../context/AuthState";
import Loading from "../components/Loading";
import { verifySSRAuth } from "../middleware/auth";

export default function Home({ classList = [], divisionList = [] }) {
  const { loading } = useContext(AuthContext)

  if (loading) {
    return <Loading />
  }

  return (
    <>
      <Head>
        <title>ClassScribe - Home</title>
        <meta name="description" content="ClassScribe attendance management system." />
      </Head>
      <div className='lg:mb-28 mb-36'>
        <div className='flex flex-col items-center justify-center mt-[3.25rem]'>
          <h1 className='bg-teal-500 w-full text-white text-lg text-center py-1 font-medium'>
            <span>Shri Someshwar High School Hattur</span>
          </h1>
        </div>

        <div>
          <h1 className='text-center text-gray-700 font-bold md:text-2xl text-xl mx-1 mt-6'>
            Select Class and Division
          </h1>
        </div>
        <Select classList={classList} divisionList={divisionList} />
      </div>
    </>
  )
}

export async function getServerSideProps(context) {
  const authRedirect = verifySSRAuth(context);
  if (authRedirect) {
    return authRedirect;
  }

  await connectDb();

  const classList = await Student.distinct('className');
  const divisionList = await Student.distinct('division');

  return {
    props: {
      classList: classList.sort((a, b) => (isNaN(a) || isNaN(b) ? a.localeCompare(b) : a - b)),
      divisionList: divisionList.sort(),
    },
  };
}
