import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { MembershipsService } from './memberships.service';

@Controller('memberships')
export class MembershipsController {
    constructor(
        private readonly membershipsService: MembershipsService,
      ) {}

    @Get()
    findAllMembers(){
        return this.membershipsService.findAllMembers();
    } 
    @Get('pending')
    getPendingMemberships() {
        return this.membershipsService.getPendingMemberships();
    }
    
    @Get(':membership_id')
    findOneMember(@Param('membership_id', ParseIntPipe) membership_id: number) {
        return this.membershipsService.findOneMember(membership_id);
    } 
    @Post()
    createMembership(@Body() membership: any){
        return this.membershipsService.createMembership(membership);
    }
    @Patch(':membership_id')
    updateMembership(@Param('membership_id', ParseIntPipe) membership_id: string,@Body() updateMember: any,){ 
        return this.membershipsService.updateMembership(Number(membership_id), updateMember);
    }
    @Patch(':membership_id/approve')
    approveMembership(
        @Param('membership_id', ParseIntPipe) membership_id: number
    ) {
        return this.membershipsService.approveMembership(membership_id);
    }
    @Delete(':membership_id')
    deleteMembership(@Param('membership_id', ParseIntPipe) membership_id: number){
        return this.membershipsService.deleteMembership(membership_id);
    }
    
}
