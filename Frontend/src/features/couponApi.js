import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const couponApi = createApi({
  reducerPath: 'couponApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:3001/coupons',

    prepareHeaders: (headers) => {
      const token = localStorage.getItem('access_token');

      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),

  tagTypes: ['Coupons'],

  endpoints: (builder) => ({

    
    getAllCoupons: builder.query({
      query: () => '',
      providesTags: ['Coupons'],
    }),

    
    getUserCoupon: builder.query({
      query: (user_id) => `/user/${user_id}`,
      providesTags: ['Coupons'],
    }),

    deleteCoupon: builder.mutation({
      query: (coupon_id) => ({
        url: `/${coupon_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Coupons'],
    }),

  }),
});

export const {
  useGetAllCouponsQuery,
  useGetUserCouponQuery,
  useDeleteCouponMutation,
} = couponApi;