import bodyParser from 'body-parser';
import { body, validationResult } from 'express-validator';
import express from 'express';
import pg from 'pg';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.raw({ type: 'application/vnd.api+json' }));

app.post(
  '/',
  body('query').matches(/^SELECT .+$/i),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dsn = req.body.dsn;
    const query = req.body.query;

    // Initialise and connect to the database
    const client = new pg.Client({connectionString: dsn})
    client.connect((err) => {
      if (err) {
        res.status(400).json({ errors: { err }})
      }
    })

    const { rows } = await client.query(query);
    res.send(rows);
  },
);

app.listen(port, () => {
  console.log(`db-viewer-server listening at http://localhost:${port}`);
});