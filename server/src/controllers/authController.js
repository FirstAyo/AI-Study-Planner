import { User } from "../models/userModel.js";

export const AuthController = {
  async signup(req, res) {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Missing fields" });
    // In real apps, hash the password and handle duplicates properly.
    const existing = await User.findByEmail(email);
    if (existing) return res.status(409).json({ error: "Email in use" });
    const user = await User.create({ email, password });
    return res.json({ token: "demo-token", user });
  },
  async login(req, res) {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user || user.password !== password)
      return res.status(401).json({ error: "Invalid" });
    return res.json({
      token: "demo-token",
      user: { id: user.id, email: user.email },
    });
  },
};
