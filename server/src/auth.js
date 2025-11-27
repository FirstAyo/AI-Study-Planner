import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "./config/db.js";

export async function createUser(name, email, password) {
  // 1. Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Insert into database
  const [user] = await db("users")
    .insert({
      name,
      email,
      password: hashedPassword,
    })
    .returning(["id", "name", "email"]);

  return user;
}

export async function findUserByEmail(email) {
  const user = await db("users").where({ email }).first();
  return user;
}

export async function checkPassword(plainPassword, hashedPassword) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}

export function createToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  return token;
}
