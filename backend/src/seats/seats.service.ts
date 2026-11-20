import { Injectable, NotFoundException } from '@nestjs/common';

import { Seat } from '../entities/seats.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SeatsService {
    constructor(@InjectRepository(Seat)private seatRepository: Repository<Seat>,) {}

    
    async findAllSeats(row_name?: 'A' | 'B' | 'C' | 'D' | 'E'| 'F'| 'G') {
      if (row_name) {
          return this.seatRepository.find({
            where: { row_name },
            order: { seat_id: 'ASC' },
          });
        }

        return this.seatRepository.find({
          order: { seat_id: 'ASC' },
        });
    }


    async getSeatAvailability(showtime_id: number,visit_date: string,exclude_booking_id?: number,) {
      const result = await this.seatRepository.query(
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

        return result;
    }

    async findOneSeat(seat_id:number){
      const seat = await this.seatRepository.findOneBy({
        seat_id,
      });

      if (!seat) {
        throw new NotFoundException(
          `Seat with ID ${seat_id} not found`,
        );
      }

      return seat;
        
    }
    
    async createSeat(seat: any) {
        const newSeat = this.seatRepository.create(seat);

        return this.seatRepository.save(newSeat);
    }

    
    async updateSeat(seat_id: number, updateSeat: Partial<Seat>,) {
      
        const seat = await this.findOneSeat(seat_id);

        Object.assign(seat, updateSeat);

        return this.seatRepository.save(seat);
    }


    async deleteSeat(seat_id: number){
        const seat = await this.findOneSeat(seat_id);

        return this.seatRepository.remove(seat);
    }



}
