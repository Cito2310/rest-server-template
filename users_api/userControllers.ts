import { Request, Response } from "express";
import bcryptjs from "bcryptjs";

import { User } from "./userModels";
import { Task } from '../project_task_api/taskModels';

import { IBodyCreateUser, IBodyChangeDataUser } from '../types/routeBodyUser';

import { generatorJWT } from '../helpers/generatorJWT';
import { ProjectTask } from '../project_task_api/projectTaskModels';

// Create User
export const createUser = async (req: Request, res: Response) => {
    try {
        const { _id, ...userData } = req.body as IBodyCreateUser;
    
        // find user exist with email or username
        const [ existUsername, existEmail ] = await Promise.all([
            User.findOne({ username: userData.username }),
            User.findOne({ email: userData.email }),
        ])
    
        // check username or email not exist
        if ( existUsername ) return res.status(400).json([{msg: "0010 - username already exists"}])
        if ( existEmail ) return res.status(400).json([{msg: "0011 - email is already registered"}])
    
        // encrypt password
        const salt = bcryptjs.genSaltSync();
        userData.password = bcryptjs.hashSync( userData.password , salt)
    
        // create new user and save
        const newUser = new User(userData);
        await newUser.save();
    
        // generator JWT
        const token: string = await generatorJWT({ id: newUser._id });
    
        // return new user
        return res.json({ user: newUser, token });
        

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: "1500 - unexpected server error"
        })
    }
}


// ChangeDataUser - Need Token
export const changeDataUser = async (req: Request, res: Response) => {
    try {
        const { _id: id, ...newData } = req.body as IBodyChangeDataUser;
        const { _id, username, email, password } = req.user;


        // C H E C K S
        // check user data not is same ( email - password - username )
        if ( newData.email && email === newData.email ) return res.status(400).json({msg: "1400 - Equal email"});

        const validPassword = bcryptjs.compareSync( newData.password || "", password );
        if ( newData.password && validPassword ) return res.status(400).json({msg: "2400 - Equal password"});

        if ( newData.username && username === newData.username ) return res.status(400).json({msg: "3400 - Equal username"});

        // check user data already exist
        const [ existUsername, existEmail ] = await Promise.all([
            User.findOne({ username: newData.username }),
            User.findOne({ email: newData.email }),
        ])

        if ( existEmail ) return res.status(400).json({msg: "4400 - This email is already registered"});
        if ( existUsername ) return res.status(400).json({msg: "5400 - This username is already registered"});


        // CHANGE AND SAVE USER
        // change password && encrypt password
        if ( newData.password ) {
            const salt = bcryptjs.genSaltSync()
            newData.password = bcryptjs.hashSync(newData.password, salt)
        }

        // find user and update
        let userChanged: any;
        try {
            userChanged = await User.findByIdAndUpdate( _id, newData );
        } catch (error) {
            return res.status(404).json({ msg: "1404 - User not exist" });
        }

        // save user data
        await userChanged.save();

        // return
        return res.status(204).json()


    } catch (error) {
        return res.status(500).json({
            msg: "1500 - unexpected server error"
        })
    }
}


// Get User - Need Token
export const getUser = async (req: Request, res: Response) => {
    try {
        const user = await User.findById(req.user._id);
        if ( !user ) return res.status(404).json({ msg: "9404 - user not found" });
        return res.status(200).json(user);
        

    } catch (error) {
        return res.status(500).json({
            msg: "1500 - unexpected server error"
        })
    }
}


// Delete User - Need Token
export const deleteUser = async (req: Request, res: Response) => {
    try {
        // check exist user
        const user = await User.findById(req.user._id).populate("project");
        if ( !user ) return res.status(404).json({ msg: "9404 - user not found" });

        // delete project and task
        user.project.map( async( project) => {
            const arrayPromiseTasks = project.tasks.map( task => {
                return Task.findByIdAndDelete( task._id )
            });
            await Promise.all( arrayPromiseTasks ); // delete task
            await ProjectTask.findByIdAndDelete( project._id ); // delete project
        })

        // delete user
        await User.findByIdAndDelete(req.user._id);
        return res.status(204).json();


    } catch (error) {
        return res.status(500).json({
            msg: "1500 - unexpected server error"
        })
    }
}


// Login User - Need Token
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;

        // CHECK DATA
        // check username
        const existUser = await User.findOne({ username });
        if ( !existUser ) return res.status(400).json({ msg: "9753 - login invalid" });

        // check password
        const samePassword = bcryptjs.compareSync( password, existUser.password );
        if ( !samePassword ) return res.status(400).json({ msg: "9753 - login invalid" })

        // generate JWT and return
        const token: string = await generatorJWT({ id: existUser._id });
        return res.status(200).json({ token });


    } catch (error) {
        return res.status(500).json({
            msg: "1500 - unexpected server error"
        })
    }
}