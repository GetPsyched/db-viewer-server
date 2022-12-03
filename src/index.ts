import { body, validationResult } from "express-validator";
import express from "express";
import pg from "pg";
import cors from "cors";

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.raw({ type: "application/json" }));

type InformationSchema = {
  database: string;
  table: string;
  column: string;
};

app.get("/schema", async (req, res) => {
  // Initialise and connect to the database
  const client = new pg.Client({ connectionString: req.body.dsn });
  client.connect((err) => {
    if (err) {
      res.status(400).json({ errors: { err } });
    }
  });

  const query =
    `SELECT ` +
    `table_catalog AS database,` +
    `table_name AS table,` +
    `column_name AS column ` +
    `FROM ` +
    `INFORMATION_SCHEMA.columns ` +
    `WHERE ` +
    `table_schema = 'public' ` +
    `ORDER BY ` +
    `ordinal_position`;
  const rows: Array<InformationSchema> = (await client.query(query)).rows;

  var nested_object: any = {};
  rows.forEach((row: InformationSchema) => {
    if (nested_object[row.database]) {
      if (nested_object[row.database][row.table]) {
        nested_object[row.database][row.table].push(row.column);
      } else {
        nested_object[row.database][row.table] = new Array(row.column);
      }
    } else {
      nested_object[row.database] = {};
      nested_object[row.database][row.table] = new Array(row.column);
    }
  });

  res.send(nested_object);
});

app.post("/", body("query").matches(/^SELECT .+$/i), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const dsn = req.body.dsn;
  const query = req.body.query;

  // Initialise and connect to the database
  const client = new pg.Client({ connectionString: dsn });
  client.connect((err) => {
    if (err) {
      res.status(400).json({ errors: { err } });
    }
  });

  const { rows } = await client.query(query);
  res.send(rows);
});

app.listen(port, () => {
  console.log(`db-viewer-server listening at http://localhost:${port}`);
});
