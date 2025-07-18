import express, { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import "dotenv/config";
import helmet from "helmet";
import posts from './routes/posts'
import auth from './routes/auth'
import users from './routes/user'
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { handleRefreshToken } from "./controllers/authController";
const app = express();

const corsOptions = {
  credentials: true,
};
const port = process.env.PORT || 3000;
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());
app.use(cookieParser());

app.use('/posts', posts);
app.use('/auth', auth);
app.use('/users', users);
app.get('/refresh-token', handleRefreshToken)

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  res.sendStatus(500);
})

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
