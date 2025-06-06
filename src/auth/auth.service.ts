import {ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from 'argon2';
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "generated/prisma/runtime/library";

@Injectable()
export class AuthService{
    constructor(private prisma:PrismaService){}
    async signup(dto:AuthDto) {
        //generate the password hash
        const hash = await argon.hash(dto.password);
        //save the new user in the db

        try {
            const user = await this.prisma.user.create({
            data:{
                email:dto.email,
                hash,
            }
        });
            // Clone the user object and remove the hash
            const { hash: _, ...userWithoutHash } = user;
            return userWithoutHash;
        } catch (error) {
            if(error instanceof PrismaClientKnownRequestError){
                if (error.code === 'P2002') {
                    throw new ForbiddenException(
                        'Credentials taken'
                    );
                }
            }
            throw error;   
        }
    } 

    async signin(dto:AuthDto){
        //Find the user by email
        const user =
          await this.prisma.user.findUnique({
            where:{
                email:dto.email,
            },
          });

          //If user doesn't exist
          if (!user) {
            throw new ForbiddenException(
                'Credentials incorrect'
            );
          }

          const pwMatches = await argon.verify(
            user.hash,
            dto.password,
          );
          //If password incorrect throw exception
          if (!pwMatches) {
            throw new ForbiddenException(
                'Credentials incorrect'
            )
          }
            const { hash: _, ...userWithoutHash } = user;
            return userWithoutHash;
    }
} 