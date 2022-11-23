import bodyParser from "body-parser";
import express from "express";
import pg from "pg";

const pool = new pg.Pool();

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: "application/vnd.api+json" }));
app.use(bodyParser.text({ type: "text/html" }));

app.get("/", async (req, res) => {
  const { rows } = await pool.query("SELECT NOW()");
  res.send(`Hello, World! You've successfully connected to the database`);
});

app.listen(port, () => {
  console.log(`db-viewer-server listening at http://localhost:${port}`);
});