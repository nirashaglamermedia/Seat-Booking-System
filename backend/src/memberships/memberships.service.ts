import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class MembershipsService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAllMembers(){
        const pool = this.databaseService.getPool();
            
             const result = await pool.query(
           `SELECT
            m.*,
            u.name,
            u.email
         FROM memberships m
         JOIN users u ON m.user_id = u.user_id
         WHERE m.status IN ('Active', 'Expired')
         ORDER BY m.membership_id ASC`
            );
    
            return result.rows;
    }

    async findOneMember(membership_id: number) {
        const pool = this.databaseService.getPool();

        const result = await pool.query(
            `SELECT *
            FROM memberships
            WHERE membership_id = $1`,
            [membership_id]
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(
                `Membership not found for membership ID ${membership_id}`
            );
        }

        return result.rows[0];
    }

    async createMembership(membership: any) {
        const {
            user_id,
            membership_type,
            discount_percentage,
            max_seats,
            status,
            start_date,
            expiry_date
        } = membership;

        const pool = this.databaseService.getPool();

        
        const user = await pool.query(
            `SELECT user_id FROM users WHERE user_id = $1`,
            [user_id]
        );

        if (user.rows.length === 0) {
            throw new NotFoundException(
                `User not found with ID ${user_id}`
            );
        }

        
        const existingMembership = await pool.query(
            `SELECT membership_id FROM memberships WHERE user_id = $1`,
            [user_id]
        );

        if (existingMembership.rows.length > 0) {
            throw new ConflictException(
                'This user already has a membership'
            );
        }

        
        const result = await pool.query(
            `INSERT INTO memberships (
                user_id,
                membership_type,
                discount_percentage,
                max_seats,
                status,
                start_date,
                expiry_date
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *`,
            [
                user_id,
                membership_type || 'Cinema Club',
                discount_percentage ?? 5,
                max_seats ?? 10,
                status || 'Pending',
                start_date || new Date(),
                expiry_date
            ]
        );

        return result.rows[0];
    }

    async updateMembership(membership_id: number, updateMember: any) {
        const field: string[] = [];
        const values: any[] = [];
        let parameterIndex = 1;

        const pool = this.databaseService.getPool();

        
        const existingMembership = await pool.query(
            `SELECT * FROM memberships WHERE membership_id = $1`,
            [membership_id]
        );

        if (existingMembership.rows.length === 0) {
            throw new NotFoundException(
                `Membership not found with ID ${membership_id}`
            );
        }

        
        const allowedFields = [
            'user_id',
            'membership_type',
            'discount_percentage',
            'max_seats',
            'status',
            'start_date',
            'expiry_date'
        ];
        
        for (const key of allowedFields) {
            if (updateMember[key] !== undefined) {
                field.push(`${key} = $${parameterIndex}`);
                values.push(updateMember[key]);
                parameterIndex++;
            }
        }

        if (field.length === 0) {
            throw new BadRequestException('No fields provided to update');
        }

        values.push(membership_id);

        const query = `
            UPDATE memberships
            SET ${field.join(', ')}
            WHERE membership_id = $${parameterIndex}
            RETURNING *
        `;

        const result = await pool.query(query, values);

        

        return result.rows[0];
    }

    async deleteMembership(membership_id: number){
        const pool = this.databaseService.getPool();


        const result = await pool.query(
            'DELETE FROM memberships WHERE membership_id = $1 RETURNING *',
            [membership_id],
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(`Membership with ID ${membership_id} not found`);
        }

        return result.rows[0];
    }

    async getPendingMemberships() {
        const pool = this.databaseService.getPool();

        const result = await pool.query(`
            SELECT
            m.*,
            u.name,
            u.email
            FROM memberships m
            JOIN users u ON m.user_id = u.user_id
            WHERE m.status = 'Pending'
            ORDER BY m.membership_id DESC
        `);

        return result.rows;
        }

    async approveMembership(membership_id: number) {
        const pool = this.databaseService.getPool();

        const existingMembership = await pool.query(
            `SELECT * FROM memberships WHERE membership_id = $1`,
            [membership_id]
        );

        if (existingMembership.rows.length === 0) {
            throw new NotFoundException(
                `Membership not found with ID ${membership_id}`
            );
        }

        if (existingMembership.rows[0].status !== 'Pending') {
            throw new BadRequestException(
                'Only Pending memberships can be approved'
            );
        }

        const result = await pool.query(
            `UPDATE memberships
            SET status = 'Active',
                start_date = CURRENT_DATE,
                expiry_date = CURRENT_DATE + INTERVAL '1 year'
            WHERE membership_id = $1
            RETURNING *`,
            [membership_id]
        );

        return result.rows[0];
    }
}
