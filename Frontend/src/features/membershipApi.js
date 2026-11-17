import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const membershipApi =createApi({

    reducerPath: 'membershipApi',

    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/memberships',

        prepareHeaders: (headers) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
        },
    }),
    tagTypes:['Memberships'],

    endpoints:(builder)=>({
        getMemberships:builder.query({
            query:()=> '',
            providesTags: ['Memberships'],
        }),
        getMembershipById:builder.query({
            query: (membership_id) => `/${membership_id}`,
            providesTags: ['Memberships'],
        }),
        addMembership: builder.mutation({
            query: (newMembership) => ({
                url: '',
                method: 'POST',
                body: newMembership,
            }),
            invalidatesTags: ['Memberships'],
        }),
        updateMembership: builder.mutation({
            query: ({ membership_id, ...updatedMembership }) => ({
                url: `/${membership_id}`,
                method: 'PATCH',
                body: updatedMembership,
            }),
            invalidatesTags: ['Memberships'],
        }),
        deleteMembership:builder.mutation({
            query: (membership_id) => ({
                url: `/${membership_id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Memberships'],
        }),
        getPendingMemberships: builder.query({
            query: () => '/pending',
            providesTags: ['Memberships'],
        }),
        approveMembership: builder.mutation({
            query: (membership_id) => ({
                url: `/${membership_id}/approve`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Memberships'],
        }),
        rejectMembership: builder.mutation({
            query: (membership_id) => ({
                url: `/${membership_id}`,
                method: 'PATCH',
                body: {
                    status: 'Rejected',
                },
            }),
            invalidatesTags: ['Memberships'],
        }),
        getPendingMembershipCount: builder.query({
            query: () => '/pending/count',
            providesTags: ['Memberships'],
        }),
    })
});

export const {
    useGetMembershipsQuery,
    useGetMembershipByIdQuery,
    useAddMembershipMutation,
    useDeleteMembershipMutation,
    useUpdateMembershipMutation,
    useApproveMembershipMutation,
    useRejectMembershipMutation,
    useGetPendingMembershipsQuery,
    useGetPendingMembershipCountQuery,
}= membershipApi;