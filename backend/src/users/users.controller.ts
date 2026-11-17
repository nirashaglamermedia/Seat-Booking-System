import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

     @Get()
    findAllUsers(@Query('role') role?: 'User' | 'Admin' | 'Manager') {
        return this.userService.findAllUsers(role);
     }
     @Get(':user_id')
    findOneUser(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.userService.findOneUser(user_id);
    }

    @Post()
    createUser(@Body() user: any) {
        return this.userService.createUser(user);
    }

    @Patch(':user_id')
    updateUser(
        @Param('user_id') user_id: string,
        @Body() updateUser: any,
        ) {
        return this.userService.updateUser(Number(user_id), updateUser);
        }

    
    @Delete(':user_id')
    deleteUser(@Param('user_id', ParseIntPipe) user_id: number) {
        return this.userService.deleteUser(user_id);
    }
    @Post('register')
    registerUser(@Body() user: any) {
        return this.userService.registerUser(user);
    }

}
