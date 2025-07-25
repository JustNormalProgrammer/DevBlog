export type LoginInputs = {
    username: string
    password: string
}
export type RegisterInputs = LoginInputs & {
    adminVerificationPwd?: string;
}
export type User = {
    username: string, 
    isAdmin: boolean
}
export type ExpressValidatorError = {
    type: string, 
    value: string, 
    msg: string, 
    path: string, 
    location: string, 
}