import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class CouponsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAllCoupons() {
        const pool = this.databaseService.getPool();

        const result = await pool.query(
            `SELECT 
                c.*,
                u.name AS user_name
            FROM coupons c
            LEFT JOIN users u
                ON c.user_id = u.user_id
            ORDER BY c.coupon_id`
        );

        return result.rows;
    }
    async findCouponByUserId(user_id: number) {

        const pool = this.databaseService.getPool();

        const result = await pool.query(
            `SELECT *
            FROM coupons
            WHERE user_id = $1`,
            [user_id]
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Coupon not found for user ID ${user_id}`
            );
        }

        return result.rows[0];
    }
        async findOneCoupon(coupon_id:number){
            const pool = this.databaseService.getPool();
            const result = await pool.query(
            'SELECT * FROM coupons WHERE coupon_id = $1',
            [coupon_id],
            );
    
            if (result.rows.length === 0) {
            throw new NotFoundException(`User with ID ${coupon_id} not found`);
            }
    
            return result.rows[0];
            
        }

    
async createCoupon(user_id: number) {
    const couponCode =
        'CINE' + Math.random().toString(36).substring(2, 8).toUpperCase();

        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

    try {
        const result = await this.databaseService.query(
            `INSERT INTO coupons
                (user_id, coupon_code, discount_percentage, status,expires_at)
             VALUES ($1, $2, 10, 'Available',$3)
             RETURNING *`,
            [user_id, couponCode, expiryDate],
        );

        return result.rows[0];

    } catch (error: any) {
        if (error.code === '23505') {
            throw new ConflictException(
                'This customer already has a coupon',
            );
        }

        throw error;
    }
}
async deleteCoupon(coupon_id:number){
    const pool = this.databaseService.getPool();


        const result = await pool.query(
            'DELETE FROM coupons WHERE coupon_id = $1 RETURNING *',
            [coupon_id],
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(`Coupon with ID ${coupon_id} not found`);
        }

        return result.rows[0];
}


}
