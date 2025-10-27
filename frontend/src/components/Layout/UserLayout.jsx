import React from 'react'
import Header from '../Common/Header'
import Footer from '../Common/Footer'
import ScrollToTop from '../Common/ScrollToTop'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
  return (
    <>
      {/* Header component */}
      <Header/>
      {/* Main content */}
      <main>
        <Outlet/>
      </main>
      {/* footer */}
      <Footer/>
      {/* Scroll to top button */}
      <ScrollToTop/>
    </>
  )
}

export default UserLayout
