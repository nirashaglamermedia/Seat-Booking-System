import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const movieApi =createApi({

    reducerPath: 'movieApi',

    baseQuery: fetchBaseQuery({
        baseUrl: 'http://localhost:3001/movies',

        prepareHeaders: (headers) => {
        const token = localStorage.getItem('access_token');

        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
        },
    }),
    tagTypes:['Movies'],

    endpoints:(builder)=>({
        getMovies:builder.query({
            query:()=> '',
            providesTags: ['Movies'],
        }),
        getMovieById:builder.query({
            query: (movie_id) => `/${movie_id}`,
            providesTags: ['Movies'],
        }),

        getMovieByName:builder.query({
            query: (movie_name) =>
            `/name/${encodeURIComponent(movie_name)}`,
             providesTags: ['Movies'],
        }),
        
        addMovieWithShowtime: builder.mutation({
            query: (newMovie) => ({
                url: '/with-showtime',
                method: 'POST',
                body: newMovie,
            }),
            invalidatesTags: ['Movies'],
        }),

        updateMovie: builder.mutation({
            query: ({ movie_id, ...updatedMovie }) => ({
                url: `/${movie_id}`,
                method: 'PATCH',
                body: updatedMovie,
            }),
            invalidatesTags: ['Movies'],
        }),
        deactivateMovie: builder.mutation({
            query: (movie_id) => ({
                url: `/deactivate/${movie_id}`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Movies'],
        }),
    })
});

export const {
    useGetMoviesQuery,
    useGetMovieByIdQuery,
    useGetMovieByNameQuery,
    
    useAddMovieWithShowtimeMutation,
    useUpdateMovieMutation,
    useDeactivateMovieMutation,
}= movieApi;