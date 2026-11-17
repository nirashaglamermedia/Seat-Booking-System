import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class SeatsService {
    constructor(private readonly databaseService: DatabaseService) {}

    
async findAllSeats(row_name?: 'A' | 'B' | 'C' | 'D' | 'E'| 'F'| 'G') {
  const pool = this.databaseService.getPool();

  if (row_name) {
    const result = await pool.query(
      'SELECT * FROM seats WHERE row_name = $1 ORDER BY seat_id',
      [row_name],
    );

    return result.rows;
  }

  const result = await pool.query(
    'SELECT * FROM seats ORDER BY seat_id',
  );

  return result.rows;
}


async getSeatAvailability(
  showtime_id: number,
  visit_date: string,
  exclude_booking_id?: number,
) {
  const pool = this.databaseService.getPool();

  const result = await pool.query(
    `SELECT
        s.seat_id,
        s.row_name,
        s.seat_number,
        s.price,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM booking_seats bs
            INNER JOIN bookings b
              ON bs.booking_id = b.booking_id
            WHERE bs.seat_id = s.seat_id
              AND b.showtime_id = $1
              AND b.visit_date = $2
              AND b.status = 'Confirmed'
              AND bs.status = 'Booked'
              AND (
                $3::int IS NULL
                OR b.booking_id <> $3
              )
          )
          THEN 'Booked'
          ELSE 'Available'
        END AS status
     FROM seats s
     ORDER BY s.row_name, s.seat_number`,
    [showtime_id, visit_date, exclude_booking_id ?? null],
  );

  return result.rows;
}

async findOneSeat(seat_id:number){
        const pool = this.databaseService.getPool();
        const result = await pool.query(
        'SELECT * FROM seats WHERE seat_id = $1',
        [seat_id],
        );

        if (result.rows.length === 0) {
        throw new NotFoundException(`Seat with ID ${seat_id} not found`);
        }

        return result.rows[0];
        
    }
    
    async createSeat(seat: any) {
        const { row_name, seat_number, price} = seat;

        const result = await this.databaseService.query(
            `INSERT INTO seats
            (row_name, seat_number, price)
            VALUES ($1, $2, $3)
            RETURNING seat_id,row_name, seat_number, price`,
            [row_name, seat_number, price],
        );

        return result.rows[0];
    }

    
async updateSeat(seat_id: number, updateSeat: any) {
  const field: string[] = [];
  const values: any[] = [];
  let parameterIndex = 1;

  
  if (updateSeat.row_name !== undefined) {
    field.push(`row_name = $${parameterIndex}`);
    values.push(updateSeat.row_name);
    parameterIndex++;
  }

  
  if (updateSeat.seat_number !== undefined) {
    field.push(`seat_number = $${parameterIndex}`);
    values.push(updateSeat.seat_number);
    parameterIndex++;
  }

  
  if (updateSeat.price !== undefined) {
    field.push(`price = $${parameterIndex}`);
    values.push(updateSeat.price);
    parameterIndex++;
  }

  
  if (field.length === 0) {
    return this.findOneSeat(seat_id);
  }

  values.push(seat_id);

  const result = await this.databaseService.getPool().query(
    `
      UPDATE seats
      SET ${field.join(', ')}
      WHERE seat_id = $${parameterIndex}
      RETURNING *
    `,
    values,
  );

  if (result.rows.length === 0) {
    throw new NotFoundException(`Seat with ID ${seat_id} not found`);
  }

  return result.rows[0];
}


    async deleteSeat(seat_id: number){
        const pool = this.databaseService.getPool();


        const result = await pool.query(
            'DELETE FROM seats WHERE seat_id = $1 RETURNING *',
            [seat_id],
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(`Seat with ID ${seat_id} not found`);
        }

        return result.rows[0];
    }



}
