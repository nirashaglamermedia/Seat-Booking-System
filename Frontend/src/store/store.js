import { configureStore } from '@reduxjs/toolkit';
import { userApi } from '../features/userApi';
import {seatApi } from '../features/seatApi';
import { bookingApi } from '../features/bookingApi';
import { authApi } from '../features/authApi';
import { couponApi } from '../features/couponApi';
import { membershipApi } from '../features/membershipApi';
import { movieApi } from '../features/movieApi';
import { hallApi } from '../features/hallapi';

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [seatApi.reducerPath]: seatApi.reducer,
    [bookingApi.reducerPath]: bookingApi.reducer,
    [authApi.reducerPath]:authApi.reducer,
    [couponApi.reducerPath]:couponApi.reducer,
    [membershipApi.reducerPath]: membershipApi.reducer,
    [movieApi.reducerPath]: movieApi.reducer,
    [hallApi.reducerPath]:hallApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      userApi.middleware,seatApi.middleware,bookingApi.middleware,
      authApi.middleware,couponApi.middleware,membershipApi.middleware,
      movieApi.middleware, hallApi.middleware,
    ),
    
});