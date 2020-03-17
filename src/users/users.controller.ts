import { Controller, Post, Get, Put, Body, Query, Param, UseFilters, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.interface';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('/login')
    async login(@Body() user) {
      return this.usersService.login(user);
    }
  
    @Post('/register')
    async register(@Body() user: User) {
      let added = await this.usersService.register(user);
      if (!added) throw new HttpException('User not registered!', HttpStatus.BAD_REQUEST);
      return {
        user: added,
        message: 'User registered!'
      }
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('/verify')
    async verify(@Request() req) {
      return await this.usersService.getOneById(req.user.id);
    }

    @Get()
    async getCountryByIp(@Query() params) {
        let country = await this.usersService.getCountryByIp(params);
        return country;
    }

}