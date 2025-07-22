import express, { Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import errorHandler from './middlewares/errorHandler';
import routes from './routes/routes';

const app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins: (string | undefined)[] = [
  'https://twinstagram.vercel.app',
];

const corsOptionsDelegate = (req: Request, callback: Function) => {
  const origin = req.header('Origin');

  if (origin && allowedOrigins.includes(origin)) {
    callback(null, {
      origin: true,
      credentials: true,
      optionsSuccessStatus: 200,
    });
  } else {
    callback(null, {
      origin: false,
    });
  }
};

app.use(cors(corsOptionsDelegate));

app.use(routes);

//Global error handler
app.use(errorHandler);

export default app;
