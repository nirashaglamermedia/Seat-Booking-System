import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Hall } from '../entities/halls.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HallsService {
    constructor(@InjectRepository(Hall)private hallRepository: Repository<Hall>,) {}

    async findAllHalls(){
        return this.hallRepository.find();
    }

    async findOneHall(hall_id:number){
        return this.hallRepository.findBy({hall_id:hall_id});
    }
    async createHall(data: Partial<Hall>){
        const hall = this.hallRepository.create(data);
        return this.hallRepository.save(hall);
    }

    async removeHall(hall_id: number) {
        return this.hallRepository.delete(hall_id);
    }
}
