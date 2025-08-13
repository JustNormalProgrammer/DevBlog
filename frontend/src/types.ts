export type LoginInputs = {
  username: string
  password: string
}
export type RegisterInputs = LoginInputs & {
  adminVerificationPwd?: string
}
export type User = {
  username: string
  isAdmin: boolean
}
export type ExpressValidatorError = {
  type: string
  value: string
  msg: string
  path: string
  location: string
}
export type CreatePostInputs = {
  title: string
  content: string
  isPublic: boolean
}

export type PostResponse = {
  id: string
  createdAt: string
  updatedAt: string
  userId: string
  title: string
  content: string
  isPublic: boolean
  username: string
}
export type CommentResponse = {
  id: string
  userId: string
  postId: string
  createdAt: string
  updatedAt: string
  content: string
  authorName: string
  isPublisher: boolean
  isVerified: boolean
}
