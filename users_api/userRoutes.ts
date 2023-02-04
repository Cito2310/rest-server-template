import { Router } from "express";
import { check } from "express-validator";

import { createUser, changeDataUser, loginUser, deleteUser, getUser } from './userControllers';

import { checkFields } from '../middlewares/checkFields';
import { validateJWT } from '../middlewares/validateJWT';


export const routeUser = Router();


routeUser.post("/register",[
    check("email", "0001 - email is required").trim().notEmpty(),
    check("email", "0002 - email invalid").trim().isEmail(),
    check("email", "0003 - email length can only be less than 200 characters").trim().isLength({max: 200}),

    check("password", "0004 - password is required").trim().notEmpty(),
    check("password", "0005 - password invalid").trim().isString(),
    check("password", "0006 - password length can only be greater than 8 and less than 24 characters").trim().isLength({min: 8, max: 32}),

    check("username", "0007 - username is required").trim().notEmpty(),
    check("username", "0008 - username not is string").trim().isString(),
    check("username", "0009 - username length can only be greater than 6 and less than 24 characters").trim().isLength({min: 6, max: 24}),
    checkFields
], createUser);


routeUser.put("/",[
    validateJWT,

    check("email", "0002 - email invalid").optional().trim().isEmail(),
    check("email", "0003 - email length can only be less than 200 characters").optional().trim().isLength({max: 200}),

    check("password", "0005 - password invalid").optional().trim().isString(),
    check("password", "0006 - password length can only be greater than 8 and less than 24 characters").optional().trim().isLength({min: 8, max: 32}),

    check("username", "0008 - username not is string").optional().trim().isString(),
    check("username", "0009 - username length can only be greater than 6 and less than 24 characters").optional().trim().isLength({min: 6, max: 24}),
    checkFields
], changeDataUser);


routeUser.get("/",[ validateJWT ], getUser);


routeUser.delete("/",[ validateJWT ], deleteUser);


routeUser.get("/login",[
    check("password", "0005 - password invalid").trim().isString(),
    check("password", "0006 - password length can only be greater than 8 and less than 24 characters").trim().isLength({max: 100}),

    check("username", "0008 - username not is string").trim().isString(),
    check("username", "0009 - username length can only be greater than 6 and less than 24 characters").trim().isLength({max: 100}),
    checkFields
], loginUser);