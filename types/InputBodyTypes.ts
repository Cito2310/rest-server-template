import { IUserMongo } from './TypesMoongose';

export interface IInputBodyUser extends IUserMongo {
    _id?: unknown
}

export interface IInputBodyChangeDataUser extends IUserMongo {
    _id?: unknown
}