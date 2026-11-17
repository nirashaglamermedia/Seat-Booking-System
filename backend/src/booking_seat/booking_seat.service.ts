import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BookingSeatService {

    constructor(private readonly databaseService: DatabaseService) {}

    async findAllBookingSeats() {
      const result = await this.databaseService.query(
      'SELECT * FROM booking_seats ORDER BY id',
    );

    return result.rows;
    }
    
    async findOneBookingSeat(id:number){
            const pool = this.databaseService.getPool();
            const result = await pool.query(
            'SELECT * FROM booking_seats WHERE id = $1',
            [id],
            );
    
            if (result.rows.length === 0) {
            throw new NotFoundException(`Booking_Seat with ID ${id} not found`);
            }
    
            return result.rows[0];
            
        }
        
    async createBookingSeat(booking: any) {
        const { booking_id,seat_id, ticket_price } = booking;
        if (
            !Number.isInteger(Number(booking_id)) ||
            Number(booking_id) <= 0 ||
            !Number.isInteger(Number(seat_id)) ||
            Number(seat_id) <= 0 ||
            ticket_price === undefined ||
            !Number.isFinite(Number(ticket_price)) ||
            Number(ticket_price) < 0
            ) {
                throw new BadRequestException(
                    'Valid booking_id and ticket_price are required',
                );
            }
            const result = await this.databaseService.query(
                `INSERT INTO booking_seats
                (booking_id, seat_id, ticket_price)
                VALUES ($1, $2, $3)
                RETURNING *`,
                [
                    Number(booking_id),
                    Number(seat_id),
                    Number(ticket_price),
                ],
                );

                return result.rows[0];
    }
    
        
    async updateBookingSeat(id: number, updateSeat: any) {
            const field: string[] = [];
            const values: any[] = [];
            let parameterIndex = 1;

            if (updateSeat.booking_id !== undefined) {
                field.push(`booking_id = $${parameterIndex}`);
                values.push(updateSeat.booking_id);
                parameterIndex++;
            }

            if (updateSeat.seat_id !== undefined) {
                field.push(`seat_id = $${parameterIndex}`);
                values.push(updateSeat.seat_id);
                parameterIndex++;
            }

            if (updateSeat.ticket_price !== undefined) {
                field.push(`ticket_price = $${parameterIndex}`);
                values.push(updateSeat.ticket_price);
                parameterIndex++;
            }

            if (field.length === 0) {
                return this.findOneBookingSeat(id);
            }

            values.push(id);

            const result = await this.databaseService.query(
                `UPDATE booking_seats
                SET ${field.join(', ')}
                WHERE id = $${parameterIndex}
                RETURNING *`,
                values,
            );

            if (result.rows.length === 0) {
                throw new NotFoundException(
                `Booking seat with ID ${id} not found`,
                );
            }

            return result.rows[0];
    }

    
    async deleteBookingSeat(id: number){
        const pool = this.databaseService.getPool();
    
    
            const result = await pool.query(
                'DELETE FROM booking_seats WHERE id = $1 RETURNING *',
                [id],
            );
    
            if (result.rows.length === 0) {
                throw new NotFoundException(`Booking_Seat with ID ${id} not found`);
            }
    
            return result.rows[0];
        }
    
    
    
}
