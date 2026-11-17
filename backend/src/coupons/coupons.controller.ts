import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CouponsService } from './coupons.service';

@Controller('coupons')
export class CouponsController {
    constructor(private readonly couponService: CouponsService) {}

    @Get()
    findAllCoupons(){
       return this.couponService.findAllCoupons(); 
    }

    @Get(':coupon_id')
    findOneCoupon(@Param('coupon_id', ParseIntPipe) coupon_id: number){
        return this.couponService.findOneCoupon(coupon_id);
    }
    @Get('user/:user_id')
    findCouponByUserId(@Param('user_id', ParseIntPipe) user_id: number){
        return this.couponService.findCouponByUserId(user_id);
    }

    @Post()
    createCoupon(@Body() body: { user_id: number }) {
        return this.couponService.createCoupon(body.user_id);
    }
    @Delete(':coupon_id')
    deleteCoupon(@Param('coupon_id', ParseIntPipe) coupon_id: number){
        return this.couponService.deleteCoupon(coupon_id);
    }

   
}
