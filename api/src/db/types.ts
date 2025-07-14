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