import jwt from "jsonwebtoken";
import db from "../db.js";

class tokenService {
  generateTokens(payload) {
    const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "30h",
    });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
      expiresIn: "30d",
    });
    return { accessToken, refreshToken };
  }

  async saveToken(userId, refreshToken) {
    const tokenData = await db.query("SELECT * FROM token WHERE user_id = $1", [
      userId,
    ]);
    if (tokenData.rows.length > 0) {
      return await db.query(
        "UPDATE token SET refresh_token = $1 where user_id = $2 RETURNING *",
        [refreshToken, userId]
      );
    }

    const token = await db.query(
      "INSERT INTO token (user_id,refresh_token) values($1,$2) RETURNING *",
      [userId, refreshToken]
    );
    return token.rows[0];
  }

  async removeToken(refreshToken) {
    const tokenData = await db.query(
      "DELETE FROM token WHERE refresh_token = $1 RETURNING *",
      [refreshToken]
    );
    return tokenData.rows[0];
  }

  validateAccessToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  validateRefreshToken(token) {
    try {
      const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      return userData;
    } catch (e) {
      return null;
    }
  }

  async findToken(refreshToken) {
    const tokenData = await db.query(
      "SELECT * FROM token WHERE refresh_token = $1",
      [refreshToken]
    );
    return tokenData.rows[0];
  }
}

export default new tokenService();
