const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 5000;
const secretKey = "secret_key";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cattalodge'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Főoldal kiszolgálása
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/main.html'));
});

// Regisztráció végpont
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
  }

  try {
    // Ellenőrizzük, hogy nincs-e már ilyen felhasználó
    const [existingUser] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Felhasználónév már létezik!" });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    await db.promise().query("INSERT INTO users (email, username, password) VALUES (?, ?, ?)", [email, username, hashedPassword]);

    res.json({ message: "Regisztráció sikeres!" });
  } catch (error) {
    console.error("Hiba történt:", error);
    res.status(500).json({ message: "Szerver hiba!" });
  }
});

// Bejelentkezés végpont
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Minden mező kitöltése kötelező!" });
  }

  try {
    const [results] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (results.length === 0) {
      return res.status(401).json({ message: "Érvénytelen felhasználónév!" });
    }

    const user = results[0];

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Helytelen jelszó!" });
    }

    const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    console.error("Hiba történt:", error);
    res.status(500).json({ message: "Szerver hiba!" });
  }
});

// Főoldal védelem
app.get('/main', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Nincs jogosultság!" });

  jwt.verify(authHeader.split(' ')[1], secretKey, (err, user) => {
    if (err) return res.status(403).json({ message: "Érvénytelen token!" });
    res.json({ message: `Üdvözöllek a főoldalon, ${user.username}!` });
  });
});

// Szerver indítása
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
