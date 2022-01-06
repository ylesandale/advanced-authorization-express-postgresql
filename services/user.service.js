import bcrypt from "bcrypt";
import { v4 } from "uuid";
import db from "../db.js";
import mailService from "./mail.service.js";
import tokenService from "./token.service.js";
import UserDto from "../dtos/user.dto.js";
import apiError from "../exceptions/api-error.js";

class userService {
  async registration(email, password) {
    const candidate = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (candidate.rows[0]) {
      throw apiError.BadRequest(`User with mail ${email} already exists`);
    }
    const hashedPassword = await bcrypt.hash(password, 3);
    const activationLink = v4();
    const user = await db.query(
      "INSERT INTO users (email,password,activationLink) values($1,$2,$3) RETURNING *",
      [email, hashedPassword, activationLink]
    );
    await mailService.sendActivationMail(
      email,
      `${process.env.API_URL}/api/activate/${activationLink}`
    );
    const userDto = new UserDto(user.rows[0]);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async login(email, password) {
    const user = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (!user.rows[0]) {
      throw apiError.BadRequest("User with such email was not found");
    }

    const isPassEquals = await bcrypt.compare(password, user.rows[0].password);

    if (!isPassEquals) {
      throw apiError.BadRequest("Invalid password");
    }

    const userDto = new UserDto(user.rows[0]);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async activate(activationLink) {
    const user = await db.query(
      "SELECT * FROM users WHERE activationLink = $1",
      [activationLink]
    );
    if (!user.rows[0]) {
      throw apiError.BadRequest("Incorrect authorization link");
    }
    await db.query(
      "UPDATE users SET activated = $1 where activationLink = $2 RETURNING *",
      [true, activationLink]
    );
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw apiError.UnauthorizedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);

    if (!userData || !tokenFromDb) {
      throw apiError.UnauthorizedError();
    }

    const user = await db.query("SELECT * FROM users WHERE id = $1", [
      userData.id,
    ]);
    const userDto = new UserDto(user.rows[0]);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }

  async getAllUsers() {
    const users = await db.query("SELECT * FROM users");
    return users.rows[0];
  }
}

export default new userService();
