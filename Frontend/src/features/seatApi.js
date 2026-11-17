
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const seatApi = createApi({
  reducerPath: 'seatApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/seats',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Seats'],

  endpoints: (builder) => ({
    
    getSeats: builder.query({
      query: () => '',
      providesTags: ['Seats'],
    }),

    
    getSeatById: builder.query({
      query: (seat_id) => `/${seat_id}`,
      providesTags: ['Seats'],
    }),

    addSeat: builder.mutation({
      query: (newSeat) => ({
        url: '',
        method: 'POST',
        body: newSeat,
      }),
      invalidatesTags: ['Seats'],
    }),
    
updateSeat: builder.mutation({
  query: ({ seat_id, ...updatedSeat }) => ({
    url: `/${seat_id}`,
    method: 'PATCH',
    body: updatedSeat,
  }),
  invalidatesTags: ['Seats'],
}),

    
    deleteSeat: builder.mutation({
      query: (seat_id) => ({
        url: `/${seat_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Seats'],
    }),
  }),
});

export const {
  useGetSeatsQuery,
  useGetSeatByIdQuery,
  useAddSeatMutation,
  useDeleteSeatMutation,
  useUpdateSeatMutation,
} = seatApi;
