import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SeatGateway } from './seat.gateway';



@Injectable()
export class BookingsService {
   constructor(
    private readonly databaseService: DatabaseService,
    private readonly seatGateway: SeatGateway,
    
  ) {}
   
       
   
      async findAllBookings() {
        const result = await this.databaseService.query(
          `SELECT
              b.booking_id,
              b.user_id,
              u.name AS customer_name,
              h.hall_name AS hall_name,
              b.booking_date,
              b.visit_date,
              b.showtime_id,
              st.start_time,
              st.end_time,

            m.movie_name,
              b.arrival_status,
              b.arrived_at,
              
              COALESCE(
                STRING_AGG(
                  s.row_name || s.seat_number::text,
                  ', ' ORDER BY s.row_name, s.seat_number
                ) FILTER (WHERE bs.status = 'Booked'),
                'No seats'
              ) AS booked_seats,

              COALESCE(
                SUM(bs.ticket_price) FILTER (WHERE bs.status = 'Booked'),
                0
              )  AS total,

              CASE
                WHEN b.status = 'Cancelled' THEN 'Cancelled'
                WHEN COUNT(bs.id) FILTER (WHERE bs.status = 'Booked') = 0
                  THEN 'Cancelled'
                ELSE b.status
              END AS status

          FROM bookings b

          LEFT JOIN users u
            ON u.user_id = b.user_id

          LEFT JOIN booking_seats bs
            ON bs.booking_id = b.booking_id

          LEFT JOIN seats s
            ON s.seat_id = bs.seat_id

           LEFT JOIN showtimes st
            ON st.showtime_id = b.showtime_id

          LEFT JOIN movies m
            ON m.movie_id = st.movie_id
          LEFT JOIN halls h
             ON h.hall_id = st.hall_id

          GROUP BY
              b.booking_id,
              b.user_id,
              u.name,
              b.booking_date,
              b.visit_date,
              b.showtime_id,
              st.start_time,
              st.movie_id,
              st.end_time,
              m.movie_name,
              b.status,
              b.arrival_status,
              b.arrived_at
              h.hall_name,

          ORDER BY b.booking_id ASC`,
        );

        return result.rows;
      }

   
   
      
            async findOneBooking(booking_id: number) {
              const pool = this.databaseService.getPool();

              const result = await pool.query(
                `SELECT
                  b.*,
                  st.movie_id,
                  m.movie_name,
                  h.hall_name AS hall_name,
                  st.start_time,
                  st.end_time,
                  u.name AS customer_name,

                  COALESCE(
                    STRING_AGG(
                      s.row_name || s.seat_number::text,
                      ', ' ORDER BY s.row_name, s.seat_number
                    ) FILTER (
                      WHERE bs.status = 'Booked'
                    ),
                    'No seats'
                  ) AS booked_seats,

                  COALESCE(
                    JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'booking_seat_id', bs.id,
                        'seat_id', s.seat_id,
                        'seat_name', s.row_name || s.seat_number::text,
                        'ticket_price', bs.ticket_price,
                        'status', bs.status
                      )
                      ORDER BY s.row_name, s.seat_number
                    ) FILTER (
                      WHERE bs.id IS NOT NULL
                    ),
                    '[]'::json
                  ) AS seats

                FROM bookings b

                LEFT JOIN showtimes st
                  ON st.showtime_id = b.showtime_id
                
                LEFT JOIN halls h
                  ON h.hall_id = st.hall_id

                LEFT JOIN movies m
                  ON m.movie_id = st.movie_id

                LEFT JOIN users u
                  ON u.user_id = b.user_id

                LEFT JOIN booking_seats bs
                  ON bs.booking_id = b.booking_id

                LEFT JOIN seats s
                  ON s.seat_id = bs.seat_id

                WHERE b.booking_id = $1

                GROUP BY b.booking_id,st.movie_id,
                m.movie_name,
                h.hall_name,
                st.start_time,
                st.end_time, u.name`,
                [booking_id],
              );

              if (result.rows.length === 0) {
                throw new NotFoundException(
                  `Booking with ID ${booking_id} not found`,
                );
              }

              return result.rows[0];
            }

          
            
    async findBookingsByUserId(user_id: number) {
  const result = await this.databaseService.query(
    `SELECT
        b.booking_id,
        b.user_id,
        u.name AS customer_name,

        b.booking_date,
        TO_CHAR(b.visit_date, 'YYYY-MM-DD') AS visit_date,

        b.showtime_id,
        st.movie_id,
        st.start_time,
        st.end_time,

        (b.visit_date + st.start_time) AS show_start_datetime,

        m.movie_name,
        h.hall_name AS hall_name,

        b.arrival_status,
        b.arrived_at,

        COALESCE(
          STRING_AGG(
            s.row_name || s.seat_number::text,
            ', ' ORDER BY s.row_name, s.seat_number
          ) FILTER (WHERE bs.status = 'Booked'),
          'No seats'
        ) AS booked_seats,

        COALESCE(
          SUM(bs.ticket_price) FILTER (WHERE bs.status = 'Booked'),
          0
        ) AS total,

        CASE
          WHEN b.status = 'Cancelled' THEN 'Cancelled'
          WHEN COUNT(bs.id) FILTER (WHERE bs.status = 'Booked') = 0
            THEN 'Cancelled'
          ELSE b.status
        END AS status

    FROM bookings b

    LEFT JOIN users u
      ON u.user_id = b.user_id

    LEFT JOIN showtimes st
      ON st.showtime_id = b.showtime_id

    LEFT JOIN movies m
      ON m.movie_id = st.movie_id

    LEFT JOIN halls h
      ON h.hall_id = st.hall_id

    LEFT JOIN booking_seats bs
      ON bs.booking_id = b.booking_id

    LEFT JOIN seats s
      ON s.seat_id = bs.seat_id

    WHERE b.user_id = $1

    GROUP BY
        b.booking_id,
        b.user_id,
        u.name,
        b.booking_date,
        b.visit_date,
        b.showtime_id,
        st.movie_id,
        st.start_time,
        st.end_time,
        m.movie_name,
        h.hall_name,
        b.arrival_status,
        b.arrived_at,
        b.status

    ORDER BY b.booking_id DESC`,
    [user_id],
  );

  return result.rows;
}
        async confirmArrival(booking_id: number, user_id: number) {
            const pool = this.databaseService.getPool();
            const client = await pool.connect();

            try {
              await client.query('BEGIN');

              
              const bookingResult = await client.query(
                `SELECT
                    booking_id,
                    user_id,
                    status,
                    arrival_status
                FROM bookings
                WHERE booking_id = $1
                  AND user_id = $2
                FOR UPDATE`,
                [booking_id, user_id],
              );

              if (bookingResult.rows.length === 0) {
                throw new NotFoundException(
                  'Booking not found',
                );
              }

              const booking = bookingResult.rows[0];

              
              if (booking.status !== 'Confirmed') {
                throw new BadRequestException(
                  'Only confirmed bookings can confirm arrival',
                );
              }

              
              if (booking.arrival_status === 'Arrived') {
                throw new BadRequestException(
                  'Arrival has already been confirmed',
                );
              }

              
              const seatsResult = await client.query(
                `SELECT COUNT(*)::int AS total
                FROM booking_seats
                WHERE booking_id = $1
                  AND status = 'Booked'`,
                [booking_id],
              );

              if (Number(seatsResult.rows[0].total) === 0) {
                throw new BadRequestException(
                  'This booking has no active seats',
                );
              }

              
              const updateResult = await client.query(
                `UPDATE bookings
                SET arrival_status = 'Arrived',
                    arrived_at = CURRENT_TIMESTAMP
                WHERE booking_id = $1
                RETURNING booking_id, arrival_status, arrived_at`,
                [booking_id],
              );

              await client.query('COMMIT');

              return {
                message: 'Arrival confirmed successfully',
                booking: updateResult.rows[0],
              };

            } catch (error) {
              await client.query('ROLLBACK');
              throw error;

            } finally {
              client.release();
            }
          }
      
        async createBooking(booking: any) {
            const {
                user_id,
                seats,
                coupon_code,
                showtime_id,
                visit_date,
            } = booking;

            // 1. Basic validation
            if (
              !Number.isInteger(Number(user_id)) ||
              Number(user_id) <= 0 ||
              !Array.isArray(seats) ||
              seats.length === 0 ||
              seats.length > 10 ||
              !Number.isInteger(Number(showtime_id)) ||
              Number(showtime_id) <= 0 ||
              !visit_date ||
              !/^\d{4}-\d{2}-\d{2}$/.test(visit_date)
          ) {
              throw new BadRequestException(
                  'Valid user_id, showtime_id, visit_date and 1 to 10 seats are required',
              );
          }

            const pool = this.databaseService.getPool();
            const client = await pool.connect();

            try {
                await client.query('BEGIN');

                
                const userResult = await client.query(
                    `SELECT user_id
                    FROM users
                    WHERE user_id = $1
                    FOR UPDATE`,
                    [Number(user_id)],
                );

                if (userResult.rows.length === 0) {
                    throw new BadRequestException('User does not exist');
                }

                
                    const membershipResult = await client.query(
                        `SELECT membership_id, status, discount_percentage, max_seats
                        FROM memberships
                        WHERE user_id = $1
                          AND status = 'Active'
                          AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
                          AND (start_date IS NULL OR start_date <= CURRENT_DATE)
                        LIMIT 1`,
                        [Number(user_id)],
                    );

                    const membership = membershipResult.rows[0] || null;

                    const isActiveMember = !!membership;

                    const maxSeats = isActiveMember ? 10 : 5;

                    const membershipPercentage = isActiveMember
                        ? Number(membership.discount_percentage ?? 5)
                        : 0;

                    // Check customer's previously booked seats
            const existingSeatsResult = await client.query(
                `
                SELECT COUNT(*)::int AS total_seats
                FROM booking_seats bs
                INNER JOIN bookings b
                    ON bs.booking_id = b.booking_id
                WHERE b.user_id = $1
                  AND b.status = 'Confirmed'
                  AND bs.status = 'Booked'
                `,
                [Number(user_id)],
            );

            const existingSeats = Number(
                existingSeatsResult.rows[0].total_seats
            );

            // Calculate remaining seats
            const remainingSeats = Math.max(
                0,
                maxSeats - existingSeats,
            );

            // Check total booking limit
            if (existingSeats + seats.length > maxSeats) {
                throw new BadRequestException(
                    `You have already booked ${existingSeats} seats. ` +
                    `You can book only ${remainingSeats} more seats. ` +
                    `Your maximum limit is ${maxSeats} seats.`
                );
            }
                
                if (seats.length > maxSeats) {
                    throw new BadRequestException(
                        `You can book a maximum of ${maxSeats} seats per booking.`,
                    );
                }

                // 5. Validate seat IDs
                const seatIds = seats.map(
                    (seat: any) => Number(seat.seat_id),
                );

                if (
                    seatIds.some(
                        (id: number) => !Number.isInteger(id) || id <= 0,
                    ) ||
                    new Set(seatIds).size !== seatIds.length
                ) {
                    throw new BadRequestException(
                        'Invalid or duplicate seat IDs',
                    );
                }

              
                const seatResult = await client.query(
                    `SELECT seat_id, price, status
                    FROM seats
                    WHERE seat_id = ANY($1::int[])
                    ORDER BY seat_id
                    FOR UPDATE`,
                    [seatIds],
                );

                if (seatResult.rows.length !== seatIds.length) {
                    throw new BadRequestException(
                        'One or more seats do not exist',
                    );
                }

                
                const bookedSeatsResult = await client.query(
                  `SELECT DISTINCT bs.seat_id
                  FROM booking_seats bs
                  INNER JOIN bookings b ON bs.booking_id = b.booking_id
                  WHERE bs.seat_id = ANY($1::int[])
                    AND b.showtime_id = $2
                    AND b.visit_date = $3
                    AND b.status = 'Confirmed'
                    AND bs.status = 'Booked'`,
                  [seatIds, Number(showtime_id), visit_date],
                );

                if (bookedSeatsResult.rows.length > 0) {
                    throw new BadRequestException(
                        'One or more selected seats are already booked',
                    );
                }

                
                const priceById = new Map(
                    seatResult.rows.map((seat: any) => [
                        Number(seat.seat_id),
                        Number(seat.price),
                    ]),
                );

                const subtotal = seatIds.reduce(
                    (sum: number, id: number) =>
                        sum + priceById.get(id)!,
                    0,
                );

                
                let seatDiscount = 0;
                let membershipDiscount = 0;

                const bookingSeats = seatIds.map(
                    (seat_id: number, index: number) => {
                        const originalPrice = priceById.get(seat_id)!;

                        
                        const hasDiscount = (index + 1) % 3 === 0;

                        const currentSeatDiscount = hasDiscount
                            ? originalPrice * 0.5
                            : 0;

                        seatDiscount += currentSeatDiscount;

                        
                        const priceAfterSeatDiscount =
                            originalPrice - currentSeatDiscount;

                        
                        const currentMembershipDiscount =
                            priceAfterSeatDiscount *
                            membershipPercentage / 100;

                        membershipDiscount += currentMembershipDiscount;

                        
                        const ticketPrice =
                            Math.round(
                                (priceAfterSeatDiscount -
                                    currentMembershipDiscount) * 100,
                            ) / 100;

                        return {
                            seat_id,
                            original_price: originalPrice,
                            discount:
                                currentSeatDiscount +
                                currentMembershipDiscount,
                            ticket_price: ticketPrice,
                        };
                    },
                );

                
                const total = Math.round(
                    bookingSeats.reduce(
                        (sum, seat) => sum + seat.ticket_price,
                        0,
                    ) * 100,
                ) / 100;

                const discount = seatDiscount + membershipDiscount;

                
                let couponDiscount = 0;
                let appliedCoupon: any = null;

                if (
                    coupon_code !== undefined &&
                    coupon_code !== null &&
                    String(coupon_code).trim() !== ''
                ) {
                    const couponResult = await client.query(
                        `SELECT *
                        FROM coupons
                        WHERE coupon_code = $1
                          AND user_id = $2
                        FOR UPDATE`,
                        [
                            String(coupon_code).trim(),
                            Number(user_id),
                        ],
                    );

                    if (couponResult.rows.length === 0) {
                        throw new BadRequestException(
                            'Invalid coupon code or coupon does not belong to this customer',
                        );
                    }

                    const coupon = couponResult.rows[0];

                    if (coupon.status !== 'Available') {
                        throw new BadRequestException(
                            'This coupon has already been used or is unavailable',
                        );
                    }

                    const expiryResult = await client.query(
                      `SELECT expires_at <= CURRENT_TIMESTAMP AS is_expired
                      FROM coupons
                      WHERE coupon_id = $1`,
                      [coupon.coupon_id],
                  );

                  if (expiryResult.rows[0].is_expired) {
                      throw new BadRequestException(
                          'This coupon has expired',
                      );
                  } 

                    couponDiscount = Math.round(
                        (
                            total *
                            Number(coupon.discount_percentage) /
                            100
                        ) * 100,
                    ) / 100;

                    appliedCoupon = coupon;
                }

              
                const finalTotal = Math.max(
                    0,
                    Math.round((total - couponDiscount) * 100) / 100,
                );

                
                const bookingResult = await client.query(
                  `INSERT INTO bookings
                      (user_id, showtime_id, visit_date, total, status)
                  VALUES ($1, $2, $3, $4, $5)
                  RETURNING *`,
                  [
                    Number(user_id),
                    Number(showtime_id),
                    visit_date,
                    finalTotal,
                    'Confirmed',
                  ],
                );

                const savedBooking = bookingResult.rows[0];

                
                if (appliedCoupon) {
                    await client.query(
                        `UPDATE coupons
                        SET status = 'Used',
                            used_at = CURRENT_TIMESTAMP,
                            used_booking_id = $1
                        WHERE coupon_id = $2`,
                        [
                            savedBooking.booking_id,
                            appliedCoupon.coupon_id,
                        ],
                    );
                }

                
                for (const seat of bookingSeats) {
                    await client.query(
                        `INSERT INTO booking_seats
                            (booking_id, seat_id, ticket_price, status)
                        VALUES ($1, $2, $3, $4)`,
                        [
                            savedBooking.booking_id,
                            seat.seat_id,
                            seat.ticket_price,
                            'Booked',
                        ],
                    );

                }

                
                const previousBookingResult = await client.query(
                    `SELECT COUNT(*)::int AS total
                    FROM bookings
                    WHERE user_id = $1
                      AND status = 'Confirmed'
                      AND booking_id <> $2`,
                    [
                        Number(user_id),
                        savedBooking.booking_id,
                    ],
                );

                const previousBookings = Number(
                    previousBookingResult.rows[0].total,
                );

              
                let generatedCouponCode: string | null = null;

                if (previousBookings === 0) {
                    const newCouponCode =
                        'CINE' +
                        Math.random()
                            .toString(36)
                            .substring(2, 8)
                            .toUpperCase();

                    const newCouponResult = await client.query(
                      `INSERT INTO coupons
                          (
                              user_id,
                              coupon_code,
                              discount_percentage,
                              status,
                              expires_at
                          )
                      VALUES (
                          $1,
                          $2,
                          10,
                          'Available',
                          CURRENT_TIMESTAMP + INTERVAL '30 days'
                      )
                      ON CONFLICT (user_id) DO NOTHING
                      RETURNING coupon_code, expires_at`,
                      [
                          Number(user_id),
                          newCouponCode,
                      ],
                  );

                  if (newCouponResult.rows.length > 0) {
                      generatedCouponCode =
                          newCouponResult.rows[0].coupon_code;
                  }
                }

                
                await client.query('COMMIT');

                
                bookingSeats.forEach((seat) => {
                  this.seatGateway.server.emit('seatUpdated', {
                    seat_id: seat.seat_id,
                    status: 'Booked',
                    showtime_id: Number(showtime_id),
                    visit_date: visit_date,
                  });
                });
                
                return {
                    ...savedBooking,

                    subtotal,

                    seat_discount: seatDiscount,
                    membership_discount: membershipDiscount,
                    membership_percentage: membershipPercentage,

                    is_active_member: isActiveMember,
                    max_seats: maxSeats,

                    discount,

                    coupon_discount: couponDiscount,
                    final_total: finalTotal,

                    coupon_code: appliedCoupon
                        ? appliedCoupon.coupon_code
                        : null,

                    generated_coupon_code: generatedCouponCode,
                    generated_coupon_percentage:
                        generatedCouponCode ? 10 : null,

                    seats: bookingSeats,
                };

            } catch (error) {
                await client.query('ROLLBACK');
                throw error;

            } finally {
                client.release();
            }
        }

       
        

async updateBooking(
  booking_id: number,
  updateBooking: any,
) {
  const {
    showtime_id,
    visit_date,
    selected_seats,
  } = updateBooking;

  // 1. Validate request
  if (
    !Number.isInteger(Number(showtime_id)) ||
    Number(showtime_id) <= 0 ||
    !visit_date ||
    !/^\d{4}-\d{2}-\d{2}$/.test(visit_date) ||
    !Array.isArray(selected_seats) ||
    selected_seats.length === 0
  ) {
    throw new BadRequestException(
      'Valid showtime_id, visit_date and selected_seats are required',
    );
  }

  const pool = this.databaseService.getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 2. Lock booking
    const bookingResult = await client.query(
      `SELECT
          b.booking_id,
          b.user_id,
          b.showtime_id,
          b.visit_date,
          b.status,
          b.arrival_status
       FROM bookings b
       WHERE b.booking_id = $1
       FOR UPDATE`,
      [booking_id],
    );

    if (bookingResult.rows.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const currentBooking = bookingResult.rows[0];

    if (currentBooking.status !== 'Confirmed') {
      throw new BadRequestException(
        'Only confirmed bookings can be modified',
      );
    }

    if (currentBooking.arrival_status === 'Arrived') {
      throw new BadRequestException(
        'An arrived booking cannot be modified',
      );
    }

    // 3. Check 48-hour restriction
    const deadlineResult = await client.query(
      `SELECT
          (b.visit_date::date + st.start_time) AS show_start,
          CURRENT_TIMESTAMP AS current_time
       FROM bookings b
       INNER JOIN showtimes st
         ON st.showtime_id = b.showtime_id
       WHERE b.booking_id = $1`,
      [booking_id],
    );

    const showStart = new Date(
      deadlineResult.rows[0].show_start,
    ).getTime();

    const currentTime = new Date(
      deadlineResult.rows[0].current_time,
    ).getTime();

    if (currentTime >= showStart - 48 * 60 * 60 * 1000) {
      throw new BadRequestException(
        'Booking modification is allowed only before 48 hours of the show',
      );
    }

    // 4. Validate selected seats (seat IDs required)
    const seatIds = selected_seats.map((id: any) => Number(id));

    if (
      seatIds.some(
        (id: number) => !Number.isInteger(id) || id <= 0,
      ) ||
      new Set(seatIds).size !== seatIds.length
    ) {
      throw new BadRequestException(
        'Invalid or duplicate selected seats',
      );
    }

    // 5. Check showtime
    const showtimeResult = await client.query(
      `SELECT showtime_id, movie_id, start_time
       FROM showtimes
       WHERE showtime_id = $1`,
      [Number(showtime_id)],
    );

    if (showtimeResult.rows.length === 0) {
      throw new BadRequestException(
        'Selected showtime does not exist',
      );
    }

    // 6. Validate visit date
    const dateResult = await client.query(
      `SELECT
          $1::date AS selected_date,
          CURRENT_DATE AS today`,
      [visit_date],
    );

    if (
      dateResult.rows[0].selected_date <
      dateResult.rows[0].today
    ) {
      throw new BadRequestException(
        'Visit date cannot be in the past',
      );
    }

    // 7. Get active membership
    const membershipResult = await client.query(
      `SELECT discount_percentage, max_seats
       FROM memberships
       WHERE user_id = $1
         AND status = 'Active'
         AND (expiry_date IS NULL OR expiry_date >= CURRENT_DATE)
         AND (start_date IS NULL OR start_date <= CURRENT_DATE)
       LIMIT 1`,
      [Number(currentBooking.user_id)],
    );

    const membership = membershipResult.rows[0] || null;
    const isActiveMember = !!membership;

    const maxSeats = isActiveMember ? 10 : 5;

    const membershipPercentage = isActiveMember
      ? Number(membership.discount_percentage ?? 5)
      : 0;

    if (seatIds.length > maxSeats) {
      throw new BadRequestException(
        `You can select a maximum of ${maxSeats} seats`,
      );
    }

    // 8. Check user's total active seat limit
    const existingSeatsResult = await client.query(
      `SELECT COUNT(*)::int AS total_seats
       FROM booking_seats bs
       INNER JOIN bookings b
         ON b.booking_id = bs.booking_id
       WHERE b.user_id = $1
         AND b.status = 'Confirmed'
         AND bs.status = 'Booked'
         AND b.booking_id <> $2`,
      [
        Number(currentBooking.user_id),
        booking_id,
      ],
    );

    const existingSeats = Number(
      existingSeatsResult.rows[0].total_seats,
    );

    if (existingSeats + seatIds.length > maxSeats) {
      throw new BadRequestException(
        `You can book only ${maxSeats - existingSeats} more seats`,
      );
    }

    // 9. Lock selected seat records
    const seatResult = await client.query(
      `SELECT seat_id, price
       FROM seats
       WHERE seat_id = ANY($1::int[])
       ORDER BY seat_id
       FOR UPDATE`,
      [seatIds],
    );

    if (seatResult.rows.length !== seatIds.length) {
      throw new BadRequestException(
        'One or more selected seats do not exist',
      );
    }

    // 10. Check selected seats availability
    const unavailableResult = await client.query(
      `SELECT DISTINCT bs.seat_id
       FROM booking_seats bs
       INNER JOIN bookings b
         ON b.booking_id = bs.booking_id
       WHERE bs.seat_id = ANY($1::int[])
         AND b.showtime_id = $2
         AND b.visit_date = $3
         AND b.booking_id <> $4
         AND b.status = 'Confirmed'
         AND bs.status = 'Booked'`,
      [
        seatIds,
        Number(showtime_id),
        visit_date,
        booking_id,
      ],
    );

    if (unavailableResult.rows.length > 0) {
      throw new BadRequestException(
        'One or more selected seats are already booked',
      );
    }

    // 11. Calculate seat prices and discounts
    const priceById = new Map(
      seatResult.rows.map((seat: any) => [
        Number(seat.seat_id),
        Number(seat.price),
      ]),
    );

    const subtotal = seatIds.reduce(
      (sum: number, id: number) =>
        sum + Number(priceById.get(id)),
      0,
    );

    let seatDiscount = 0;
    let membershipDiscount = 0;

    const bookingSeats = seatIds.map(
      (seat_id: number, index: number) => {
        const originalPrice = Number(priceById.get(seat_id));

        const currentSeatDiscount =
          (index + 1) % 3 === 0
            ? originalPrice * 0.5
            : 0;

        seatDiscount += currentSeatDiscount;

        const priceAfterSeatDiscount =
          originalPrice - currentSeatDiscount;

        const currentMembershipDiscount =
          priceAfterSeatDiscount *
          membershipPercentage / 100;

        membershipDiscount += currentMembershipDiscount;

        const ticketPrice =
          Math.round(
            (priceAfterSeatDiscount -
              currentMembershipDiscount) * 100,
          ) / 100;

        return {
          seat_id,
          ticket_price: ticketPrice,
        };
      },
    );

    const total = Math.round(
      bookingSeats.reduce(
        (sum, seat) => sum + seat.ticket_price,
        0,
      ) * 100,
    ) / 100;

    // 12. Preserve an existing coupon attached to this booking
    const couponResult = await client.query(
      `SELECT coupon_id, discount_percentage
       FROM coupons
       WHERE used_booking_id = $1
       FOR UPDATE`,
      [booking_id],
    );

    let couponDiscount = 0;

    if (couponResult.rows.length > 0) {
      const coupon = couponResult.rows[0];

      couponDiscount = Math.round(
        total * Number(coupon.discount_percentage) / 100 * 100,
      ) / 100;
    }

    const finalTotal = Math.max(
      0,
      Math.round((total - couponDiscount) * 100) / 100,
    );

    // 13. Cancel old active booking seats
    const oldSeatsResult = await client.query(
      `SELECT seat_id
       FROM booking_seats
       WHERE booking_id = $1
         AND status = 'Booked'`,
      [booking_id],
    );

    await client.query(
      `UPDATE booking_seats
       SET status = 'Cancelled'
       WHERE booking_id = $1
         AND status = 'Booked'`,
      [booking_id],
    );

    // 14. Insert newly selected seats
    for (const seat of bookingSeats) {
      await client.query(
        `INSERT INTO booking_seats
           (booking_id, seat_id, ticket_price, status)
         VALUES ($1, $2, $3, 'Booked')`,
        [
          booking_id,
          seat.seat_id,
          seat.ticket_price,
        ],
      );
    }

    // 15. Update booking
    const updateResult = await client.query(
      `UPDATE bookings
       SET showtime_id = $1,
           visit_date = $2,
           total = $3
       WHERE booking_id = $4
       RETURNING *`,
      [
        Number(showtime_id),
        visit_date,
        finalTotal,
        booking_id,
      ],
    );

    await client.query('COMMIT');

    // 16. Realtime updates for old seats
    oldSeatsResult.rows.forEach((row: any) => {
      this.seatGateway.server.emit('seatUpdated', {
        seat_id: Number(row.seat_id),
        status: 'Available',
        showtime_id: Number(currentBooking.showtime_id),
        visit_date: String(currentBooking.visit_date).slice(0, 10),
      });
    });

    // 17. Realtime updates for new seats
    bookingSeats.forEach((seat: any) => {
      this.seatGateway.server.emit('seatUpdated', {
        seat_id: seat.seat_id,
        status: 'Booked',
        showtime_id: Number(showtime_id),
        visit_date,
      });
    });

    this.seatGateway.server.emit('bookingUpdated', {
      booking_id: Number(booking_id),
      user_id: Number(currentBooking.user_id),
      action: 'Modified',
    });

    return {
      message: 'Booking modified successfully',
      booking: updateResult.rows[0],
      seats: bookingSeats,
      subtotal,
      seat_discount: seatDiscount,
      membership_discount: membershipDiscount,
      coupon_discount: couponDiscount,
      total: finalTotal,
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

       
async deleteBooking(booking_id: number) {
  const pool = this.databaseService.getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    
    const bookingCheck = await client.query(
        `SELECT booking_id, user_id
        FROM bookings
        WHERE booking_id = $1
        FOR UPDATE`,
        [booking_id],
    );

    if (bookingCheck.rows.length === 0) {
      throw new NotFoundException(
        `Booking with ID ${booking_id} not found`,
      );
    }

    
    const seatsResult = await client.query(
      `SELECT seat_id
       FROM booking_seats
       WHERE booking_id = $1
         AND status = 'Booked'`,
      [booking_id],
    );

    
    await client.query(
      `UPDATE coupons
       SET used_booking_id = NULL
       WHERE used_booking_id = $1`,
      [booking_id],
    );

    
    await client.query(
      `UPDATE seats AS s
       SET status = 'Available'
       WHERE s.seat_id IN (
         SELECT bs.seat_id
         FROM booking_seats AS bs
         WHERE bs.booking_id = $1
       )
       AND NOT EXISTS (
         SELECT 1
         FROM booking_seats AS bs2
         INNER JOIN bookings AS b2
           ON b2.booking_id = bs2.booking_id
         WHERE bs2.seat_id = s.seat_id
           AND b2.booking_id <> $1
           AND b2.status = 'Confirmed'
           AND bs2.status = 'Booked'
       )`,
      [booking_id],
    );

   
    await client.query(
      `DELETE FROM booking_seats
       WHERE booking_id = $1`,
      [booking_id],
    );

    
    const result = await client.query(
      `DELETE FROM bookings
       WHERE booking_id = $1
       RETURNING *`,
      [booking_id],
    );

    
    await client.query('COMMIT');

    
    seatsResult.rows.forEach((row) => {
        this.seatGateway.server.emit('seatUpdated', {
            seat_id: row.seat_id,
            status: 'Available',
        });
    });

    
    this.seatGateway.server.emit('bookingUpdated', {
        booking_id: Number(booking_id),
        user_id: Number(bookingCheck.rows[0].user_id),
        action: 'Deleted',
    });

    return {
        message: 'Booking deleted successfully',
        booking: result.rows[0],
    };

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;

  } finally {
    client.release();
  }
}

async cancelBookingSeat(
  booking_id: number,
  booking_seat_id: number,
) {
  const pool = this.databaseService.getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    
    const bookingResult = await client.query(
      `SELECT booking_id, status
       FROM bookings
       WHERE booking_id = $1
       FOR UPDATE`,
      [booking_id],
    );

    if (bookingResult.rows.length === 0) {
      throw new NotFoundException(
        `Booking ${booking_id} not found`,
      );
    }

    if (bookingResult.rows[0].status !== 'Confirmed') {
      throw new BadRequestException(
        'Only confirmed bookings can have seats cancelled',
      );
    }

    
    const seatResult = await client.query(
      `SELECT bs.id, bs.seat_id, bs.status
       FROM booking_seats bs
       WHERE bs.id = $1
         AND bs.booking_id = $2
       FOR UPDATE`,
      [booking_seat_id, booking_id],
    );

    if (seatResult.rows.length === 0) {
      throw new NotFoundException(
        'Seat was not found in this booking',
      );
    }

    const bookingSeat = seatResult.rows[0];

    if (bookingSeat.status === 'Cancelled') {
      throw new BadRequestException(
        'This seat has already been cancelled',
      );
    }

    
    await client.query(
      `UPDATE booking_seats
       SET status = 'Cancelled'
       WHERE id = $1
         AND booking_id = $2`,
      [booking_seat_id, booking_id],
    );

   
    await client.query(
      `UPDATE seats s
       SET status = 'Available'
       WHERE s.seat_id = $1
         AND NOT EXISTS (
           SELECT 1
           FROM booking_seats bs
           INNER JOIN bookings b
             ON b.booking_id = bs.booking_id
           WHERE bs.seat_id = s.seat_id
             AND bs.status = 'Booked'
             AND b.status = 'Confirmed'
         )`,
      [bookingSeat.seat_id],
    );

    
    const totalResult = await client.query(
      `SELECT
         COALESCE(SUM(bs.ticket_price), 0) AS total,
         COUNT(*)::int AS remaining_seats
       FROM booking_seats bs
       WHERE bs.booking_id = $1
         AND bs.status = 'Booked'`,
      [booking_id],
    );

    const total = Number(totalResult.rows[0].total);
    const remainingSeats = Number(
      totalResult.rows[0].remaining_seats,
    );

    
    const newStatus =
      remainingSeats === 0 ? 'Cancelled' : 'Confirmed';

    const updatedBooking = await client.query(
      `UPDATE bookings
       SET total = $1,
           status = $2
       WHERE booking_id = $3
       RETURNING *`,
      [total, newStatus, booking_id],
    );

    await client.query('COMMIT');
    this.seatGateway.server.emit('seatUpdated', {
          seat_id: bookingSeat.seat_id,
          status: 'Available',
        });

    return {
      message: 'Seat cancelled successfully',
      booking: updatedBooking.rows[0],
      cancelled_booking_seat_id: booking_seat_id,
      remaining_seats: remainingSeats,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

    
}
