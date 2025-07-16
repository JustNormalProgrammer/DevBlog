import * as express from 'express-serve-static-core';

declare global {
    namespace Express {
        interface Request{
            username: string, 
            userId: string, 
            isAdmin: boolean
        }
    }
}