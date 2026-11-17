import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UsersService {
    constructor(private readonly databaseService: DatabaseService) {}

    async findAllUsers(role?:'User'|'Admin'|'Manager'){
        const pool = this.databaseService.getPool();
        if (role) {
            const result =await pool.query(
               'SELECT * FROM users WHERE role = $1 ORDER BY user_id',
                [role], 
            )
            return result.rows;
        }
         const result = await pool.query(
        'SELECT * FROM users ORDER BY user_id',
        );

        return result.rows;
        
    }
    async findOneUser(user_id:number){
        const pool = this.databaseService.getPool();
        const result = await pool.query(
        'SELECT * FROM users WHERE user_id = $1',
        [user_id],
        );

        if (result.rows.length === 0) {
        throw new NotFoundException(`User with ID ${user_id} not found`);
        }

        return result.rows[0];
        
    }
    
    
async createUser(user: any) {
  const { name, email,  password, phone ,role} = user;

   if (!['Admin', 'Manager'].includes(role)) {
    throw new BadRequestException(
      'Role must be Admin or Manager',
    );
  }

  const result = await this.databaseService.query(
    `INSERT INTO users
        (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, name, email, phone, role`,
    [name, email,  password, phone || null, role],
  );

  return result.rows[0];
}


    async updateUser(user_id: number, updateUser: any){
        const pool = this.databaseService.getPool();
        const field:string[]=[];
        const values:any[]=[];
        let parameterIndex =1;

            if(updateUser.name !== undefined){
               field.push(`name = $${parameterIndex}`);
               values.push(updateUser.name);
               parameterIndex++;
            }
            if (updateUser.email !== undefined) {
                field.push(`email = $${parameterIndex}`);
                values.push(updateUser.email);
                parameterIndex++;
            }

            if (updateUser.password !== undefined) {
                field.push(`password = $${parameterIndex}`);
                values.push(updateUser.password);
                parameterIndex++;
            }
            if (updateUser.phone !== undefined) {
                field.push(`phone = $${parameterIndex}`);
                values.push(updateUser.phone);
                parameterIndex++;
            }
            if (updateUser.role !== undefined) {
                field.push(`role = $${parameterIndex}`);
                values.push(updateUser.role);
                parameterIndex++;
            }
            if (field.length === 0) {
                return this.findOneUser(user_id);
            }

            values.push(user_id);

            const result = await this.databaseService.getPool().query(
            `
            UPDATE users
            SET ${field.join(', ')}
            WHERE user_id = $${parameterIndex}
            RETURNING *
            `,
            values,
            );

            return result.rows[0];

        
    }

    async deleteUser(user_id: number){
        const pool = this.databaseService.getPool();

        const bookingResult = await pool.query(
            `SELECT booking_id
            FROM bookings
            WHERE user_id = $1
            LIMIT 1`,
            [user_id],
        );

        if (bookingResult.rows.length > 0) {
            throw new BadRequestException(
            'Cannot delete this user because they have existing bookings.',
            );
        }
                const result = await pool.query(
            'DELETE FROM users WHERE user_id = $1 RETURNING *',
            [user_id],
        );

        if (result.rows.length === 0) {
            throw new NotFoundException(`User with ID ${user_id} not found`);
        }

        return result.rows[0];
    }

    
async registerUser(user: any) {
    const {
        name,
        email,
        password,
        conformpassword,
        phone,
    } = user;

    if (password !== conformpassword) {
        throw new BadRequestException('Passwords do not match');
    }

    const result = await this.databaseService.query(
        `INSERT INTO users
        (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING user_id, name, email, phone, role`,
        [
            name.trim(),
            email.trim(),
            password,
            phone || null,
            'User',
        ],
    );

    return result.rows[0];
}

}
