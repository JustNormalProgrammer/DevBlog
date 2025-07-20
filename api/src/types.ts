import * as express from 'express-serve-static-core';

declare global {
    namespace Express {
        interface Request{
            username: string | null, 
            userId: string | null, 
            isAdmin: boolean,
            accessToken: {
                value: string, 
                exp: string;
            }
        }
    }
}
export interface CreatePost{
    title: string, 
    content: string, 
    isPublic: boolean,
    userId: string
}
export interface UpdatePost{
    title? : string, 
    content? : string, 
    isPublic? : boolean
}
export type CreateComment = {
    userId?: string | null,
    postId: string, 
    content: string,
    anonymousAuthorName?: string
}
export type UpdateComment = {
    userId: string,
    postId: string, 
    content: string
}
export type CreateRevokedToken = {
    userId: string, 
    revokedToken: string, 
    exp: string
}