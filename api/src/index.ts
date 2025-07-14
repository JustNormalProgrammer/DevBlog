import express from "express";
import "dotenv/config";
import helmet from "helmet";
import posts from './routes/posts'

const app = express();

const port = process.env.PORT || 3000;

app.use(helmet());
app.use('/posts', posts);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Listening on port: ${port}`);
});
