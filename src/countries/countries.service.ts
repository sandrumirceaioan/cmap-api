import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Country } from './countries.interface';
import { mapLimit } from 'async';
import { CasinosService } from '../casinos/casinos.service';
import * as _ from 'underscore';

const ObjectId = Types.ObjectId;

@Injectable()
export class CountriesService {

    constructor(
        @InjectModel('Countrie') private readonly countryModel: Model<Country>,
        private casinosService: CasinosService,
    ) { }

    onModuleInit() {
        //this.importCountries();
        //this.mapCountries();
    }


    async add(country): Promise<Country> {
        let newCountry = new this.countryModel(country);
        let response = newCountry.save();
        return response;
    }

    async getAll(): Promise<Country[]> {
        return await this.countryModel.find();
    }


    async getOneById(id): Promise<Country> {
        let country = await this.countryModel.findOne({ _id: new ObjectId(id) });
        if (!country) throw new HttpException('Country not found!', HttpStatus.BAD_REQUEST);
        return country;
    }

    async getOneByName(countryName): Promise<Country> {
        let country = await this.countryModel.findOne({ countryName: countryName });
        return country;
    }

    async updateOneById(id, params): Promise<any> {
        let query = {
            _id: new ObjectId(id)
        };
        let updatedCountry = await this.countryModel.findOneAndUpdate(query, params, { new: true });
        if (!updatedCountry) throw new HttpException('Country not updated!', HttpStatus.BAD_REQUEST);
        return updatedCountry;

    }

    async deleteOneById(id) {
        let query = {
            _id: new ObjectId(id)
        };
        let deletedCountry = await this.countryModel.findByIdAndRemove(query);
        if (!deletedCountry) throw new HttpException('Country not deleted!', HttpStatus.BAD_REQUEST);
        return deletedCountry;
    }

    async importCountries(): Promise<any> {
        return new Promise((resolve, reject) => {

            let omitMap = ['Sint Maarten (Dutch part)', 'Congo - Brazzaville', 'Congo - Kinshasa', 'Asia', 'Anonymous Proxy', 'East Timor', 'Europe', 'Gaza Strip', 'Sint Eustatius (Dutch Island)', 'Saba', 'Statia', 'South Georgia and the South Sandwich Islands', 'British Antarctic Territory', 'Pacific Islands Trust Territory', 'Satellite Provider', 'U.S. Miscellaneous Pacific Islands', 'Arab Jamahiriya', 'Heard Island and McDonald Islands', 'Union of Soviet Socialist Republics', 'Asia/Pacific Region', 'Svalbard and Jan Mayen'];

            let countries = [

                { "name": "Tokelau", "code": "TK" },

            ];

            mapLimit(countries, 1, async (country) => {

                let imported = await this.add({
                    countryName: country.name,
                    countryCode: country.code,
                    countryFlag: country.code.toLowerCase() + '.png'
                });

                if (imported) return Promise.resolve(imported);

            }, (error, result) => {
                if (error) console.log(error);
                console.log('Imported: ', result.length);
                return resolve();
            });

        });
    }

    async mapCountries(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let updatedCasinos = 1;
            let casinos: any = await this.casinosService.getAll();

            mapLimit(casinos, 1, (casino, cb) => {
                let countries = casino.casinoRestrictedCountries;
                let countriesUpdated = [];

                mapLimit(countries, 1, async (country) => {
                    let found: any = await this.getOneByName(country.name);
                    // console.log('found: ', found, typeof found);
                    if (!found || found == 'null') {
                        country['code'] = 'N/A';
                    } else {
                        country['code'] = found.countryCode;
                    }
                    
                    countriesUpdated.push(country);
                    let updated = await this.casinosService.updateOneById(casino.id, {
                        casinoRestrictedCountries: countriesUpdated 
                    });

                    if (updated) return Promise.resolve();
                }, (err, res) => {
                    if (err) console.log('inner ERROR: ', err);
                    console.log(updatedCasinos++);
                    cb();
                });

            }, (error, result) => {
                if (error) console.log('main ERROR: ', error);
                console.log('DONE: ', result.length);
                return resolve();
            });

        });
    }

}