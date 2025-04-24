import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const USERS = [
  { username: "admin", password: "123456", token: "fake-jwt-token" },
];

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = USERS.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ message: "Username atau password salah." });
  }

  return res.json({ token: user.token });
});

app.listen(3000, () => console.log("API running on http://localhost:3000"));
