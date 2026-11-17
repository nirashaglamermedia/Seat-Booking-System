
import React from "react";
import { Route, Routes } from "react-router-dom";

import "./App.css";
import Login from "./components/login";
import SignUp from "./components/register";
import UserList from "./components/admin/user/userlist";
import AddUser from "./components/admin/user/addUser";
import EmailInput from "./features/emailValidation";
import PasswordValidation from "./features/passwordValidation";
import EditUser from "./components/admin/user/editUser";
import SeatList from "./components/admin/seats/seatList";
import AddSeat from "./components/admin/seats/addSeat";
import EditSeat from "./components/admin/seats/editSeat";
import BookingList from "./components/admin/booking/bookingList";
import Booking from "./components/booking";
import EditBooking from "./components/admin/booking/editBooking";
import AdminDashboard from "./components/admin/adminDashbord";
import ProtectedRoute from "./features/ProtectedRoute";
import AdminLogin from "./components/admin/adminLogin";
import CouponCard from "./components/CouponCard";
import MyBooking from "./components/myBooking";
import MembershipList from "./components/admin/membership/membershipList";
import AddMembership from "./components/admin/membership/addMembership";
import EditMembership from "./components/admin/membership/editMembership";
import CouponsList from "./components/admin/coupon/couponsList";
import CinemaClub from "./components/cinemaClub";
import MyMembership from "./components/myMembership";
import PendingRequest from "./components/admin/membership/pendingRequest";
import MovieList from "./components/admin/movie/movieList";
import EditMovie from "./components/admin/movie/editMovie";
import SeatSelection from "./components/seatSelection";
import Home from "./components/home";
import MoviePage from "./components/moviePage";
import ViewTicket from "./components/viewTicket";
import ModifiedTicket from "./components/modifiedTicket";
import AddMovie from "./components/admin/movie/addMovie";




const App = () => {
  return (
    <div className="App">
      <Routes>
        
        <Route path="/" element={<Home/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<SignUp/>}/>
         <Route path="/adminLogin" element={<AdminLogin/>}/>
         <Route path="/movie-page/:movie_name" element={<MoviePage/>}/>
         <Route path="/seat-selection" element={<SeatSelection />} />
         
        <Route element={<ProtectedRoute />}>
          
          <Route path="/my-booking" element={<MyBooking />} />
          <Route path="/booking" element={<Booking/>}/>
          <Route path="/user-list" element={<UserList/>}/>
          <Route path="/add-user" element={<AddUser/>}/>
          <Route path="/edit-user/:user_id" element={<EditUser />} />
          <Route path="/email-validation" element={<EmailInput/>}/>
          <Route path="/password-validation" element={<PasswordValidation/>}/>
          <Route path="/seat-list" element={<SeatList />} />
          <Route path="/add-seat" element={<AddSeat/>}/>
          <Route path="/edit-seat/:seat_id" element={<EditSeat />} />
          <Route path="/booking-list" element={<BookingList/>}/>
          <Route path="/edit-booking/:booking_id" element={<EditBooking/>}/>
          <Route path="/admin-dashboard" element={<AdminDashboard/>}/>
          <Route path="/couponCard" element={<CouponCard/>}/>
          <Route path="/membership-list" element={<MembershipList/>}/>
          <Route path="/add-membership" element={<AddMembership/>}/>
          <Route path="/edit-membership/:membership_id" element={<EditMembership/>}/>
          <Route path="/coupons-list" element={<CouponsList/>}/>
          <Route path="/cinema-club" element={<CinemaClub/>}/>
          <Route path="/my-membership" element={<MyMembership/>}/>
          <Route path="/pending-request" element={<PendingRequest/>}/>
          <Route path="/movie-list" element={<MovieList/>}/>
          <Route path="/edit-movie/:movie_id" element={<EditMovie/>}/>
          <Route path="/view/:booking_id" element={<ViewTicket/>}/>
          <Route path="/modified/:booking_id" element={<ModifiedTicket/>}/>
          <Route path="/add-movie" element={<AddMovie/>}/>
        </Route>
      </Routes>
    </div>
  );
};

export default App;
