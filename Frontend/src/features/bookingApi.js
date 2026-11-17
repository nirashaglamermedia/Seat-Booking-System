
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const bookingApi = createApi({
  reducerPath: 'bookingApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/bookings',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Bookings'],

  endpoints: (builder) => ({
    getBookings: builder.query({
      query: () => '',
      providesTags: ['Bookings'],
    }),

    getBookingById: builder.query({
      query: (booking_id) => `/${booking_id}`,
      providesTags: ['Bookings'],
    }),
    getBookingByUserId: builder.query({
      query: (user_id) => `/user/${user_id}`,
      providesTags: ['Bookings'],
    }),

    addBooking: builder.mutation({
        query: (newBooking) => ({
            url: '',
            method: 'POST',
            body: newBooking,
        }),
        invalidatesTags: ['Bookings'],
        }),
    updateBooking:builder.mutation({
       query: ({ booking_id, ...updatedBooking }) => ({
            url: `/${booking_id}`,
            method: 'PATCH',
            body: updatedBooking,
        }),
        invalidatesTags: ['Bookings'], 
    }),
    cancelBookingSeat: builder.mutation({
      query: ({ booking_id, booking_seat_id }) => ({
        url: `/${booking_id}/seats/${booking_seat_id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    cancelFullBooking: builder.mutation({
      query: (booking_id) => ({
        url: `/${booking_id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Bookings'],
    }),
    deleteBooking: builder.mutation({
      query: (booking_id) => ({
        url: `/${booking_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Bookings'],
    }),

    markArrived: builder.mutation({
      query: ({ booking_id, user_id }) => ({
        url: `/${booking_id}/arrival`,
        method: 'PATCH',
        body: { user_id },
      }),
      invalidatesTags: ['Bookings'],
    }),
  }),
});

export const {
  useGetBookingsQuery,
  useGetBookingByIdQuery,
  useGetBookingByUserIdQuery,
  useDeleteBookingMutation,
  useUpdateBookingMutation,
  useCancelBookingSeatMutation,
  useCancelFullBookingMutation,
   useMarkArrivedMutation,
} = bookingApi;
