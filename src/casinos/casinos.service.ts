import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Casino } from './casinos.interface';

const ObjectId = Types.ObjectId;

@Injectable()
export class CasinosService {

    constructor(
        @InjectModel('Casino') private readonly casinoModel: Model<Casino>
    ) { }

    async add(casino): Promise<Casino> {
        let newCasino = new this.casinoModel(casino);
        let response = newCasino.save();
        return response;
    }

    async getAll(): Promise<Casino[]> {
        return await this.casinoModel.find();
    }

    async getOneById(id): Promise<Casino> {
        let casino = await this.casinoModel.findOne({_id: new ObjectId(id)});
        if (!casino) throw new HttpException('Casino not found!', HttpStatus.BAD_REQUEST);
        return casino;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedCasino = await this.casinoModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedCasino) throw new HttpException('Casino not updated!', HttpStatus.BAD_REQUEST);
        return updatedCasino;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedCasino = await this.casinoModel.findByIdAndRemove(query);
        if (!deletedCasino) throw new HttpException('CAsino not deleted!', HttpStatus.BAD_REQUEST);
        return deletedCasino;
    }
}
