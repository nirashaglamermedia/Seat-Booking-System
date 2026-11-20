
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const hallApi = createApi({
  reducerPath: 'hallApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/halls',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Halls'],

  endpoints: (builder) => ({
    
    getHalls: builder.query({
      query: () => '',
      providesTags: ['Halls'],
    }),

    
    getHallById: builder.query({
      query: (hall_id) => `/${hall_id}`,
      providesTags: ['Halls'],
    }),

    
    addHall: builder.mutation({
      query: (newHall) => ({
        url: '',
        method: 'POST',
        body: newHall,
      }),
      invalidatesTags: ['Halls'],
    }),

    
    deactivateHall: builder.mutation({
      query: (hall_id) => ({
        url: `/deactivate/${hall_id}`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Halls'],
    }),
  }),
});

export const {
  useGetHallsQuery,
  useGetHallByIdQuery,
  useAddHallMutation,
  useDeactivateHallMutation,
} = hallApi;
