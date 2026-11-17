
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginData: any) {
    const { email, password } = loginData;

    
    if (!email || !password) {
      throw new UnauthorizedException(
        'email and password are required',
      );
    }

    
    const result = await this.databaseService.query(
      `SELECT user_id, name, email,password, role
       FROM users
       WHERE email = $1`,
      [email],
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    const user = result.rows[0];

    
    if (user.password !== password) {
      throw new UnauthorizedException(
        'Invalid email or password',
      );
    }

    
    const accessToken = this.jwtService.sign({
      sub: user.user_id,
      email: user.email,
      role: user.role,
    });

    
    return {
      message: 'Login successful',
      access_token: accessToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        
        role: user.role,
      },
    };
  }
}
