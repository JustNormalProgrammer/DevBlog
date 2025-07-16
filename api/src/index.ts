import express from "express";
import "dotenv/config";
import helmet from "helmet";
import posts from './routes/posts'
import auth from './routes/auth'
import cors from 'cors';
import cookieParser from 'cookie-parser';
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
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
