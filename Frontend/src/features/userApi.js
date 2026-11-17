
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
  reducerPath: 'userApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/users',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Users'],

  endpoints: (builder) => ({
    
    getUsers: builder.query({
      query: () => '',
      providesTags: ['Users'],
    }),

    
    getUserById: builder.query({
  query: (user_id) => `/${user_id}`,
}),
    deleteUser: builder.mutation({
        query: (user_id) => ({
            url: `/${user_id}`,
            method: 'DELETE',
        }),
        invalidatesTags: ['Users'],
        }),
    addUser: builder.mutation({
      query: (newUser) => ({
        url: '',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: ['Users'],
    }),
    updateUser: builder.mutation({
      query: ({ user_id, ...updatedUser }) => ({
        url: `/${user_id}`,
        method: 'PATCH',
        body: updatedUser,
      }),
      invalidatesTags: ['Users'],
    }),

    registerUser: builder.mutation({
      query: (user) => ({
        url: '/register',
        method: 'POST',
        body: user,
      }),
    }),

    
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useDeleteUserMutation,
  useAddUserMutation,
  useUpdateUserMutation,
  useRegisterUserMutation,
} = userApi;
