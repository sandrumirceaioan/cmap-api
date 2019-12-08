import { HttpException, UnauthorizedException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User } from './users.interface';
import * as CryptoJS from 'crypto-js';
import { JwtService } from '@nestjs/jwt';

const ObjectId = Types.ObjectId;

@Injectable()
export class UsersService {

    constructor(
        @InjectModel('User') private readonly userModel: Model<User>,
        private readonly jwtService: JwtService
    ) { }

    async login(params): Promise<any> {
        let encriptedPassword = CryptoJS.SHA256(params.password, process.env.CRYPTOKEY).toString();
        const user = await this.userModel.findOne({ userName: params.username, userPassword: encriptedPassword });
        if (!user) {
            throw new UnauthorizedException();
        }
        const payload = {
            id: user._id,
            role: user.userRole,
            username: user.userName
        };
        const token = this.jwtService.sign(payload);
        return { token, user };

    }

    async register(user: User): Promise<any> {
        user.userPassword = CryptoJS.SHA256(user.userPassword, process.env.CRYPTOKEY).toString();
        let newUser = new this.userModel(user);
        let response = newUser.save();
        return response;
    }

    async getOneById(id): Promise<User> {
        let slot = await this.userModel.findOne({ _id: new ObjectId(id) });
        if (!slot) throw new HttpException('User not found!', HttpStatus.BAD_REQUEST);
        return slot;
    }


}
