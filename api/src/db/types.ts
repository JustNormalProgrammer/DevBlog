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
    userId?: string,
    postId: string, 
    content: string,
    anonymousAuthorName?: string
}
export type UpdateComment = {
    userId: string,
    postId: string, 
    content: string
}