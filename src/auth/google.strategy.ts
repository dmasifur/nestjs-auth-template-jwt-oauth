import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import { UsersService } from "src/users/users.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google'){
    constructor(
        private userService:UsersService
    ){
        super({
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret:process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL:'http://localhost:3000/auth/google-redirect',
            scope:['email','profile']
        })
    }


    async validate(    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,) {
        
        const {name, emails, photos} = profile

        const user = {
            firstName:name.givenName,
            lastName:name.familyName,
            email:emails[0].value,
            imageUrl:photos[0].value,
            
            
        }

        const isUser = await this.userService.findOne({email:user.email})
        if(!isUser){
            await this.userService.create({
                firstName:user.firstName,
                lastName:user.lastName,
                email:user.email,
                imageUrl:user.imageUrl,
                roleId:3
            })
        }
        done(null, user)
    }
}