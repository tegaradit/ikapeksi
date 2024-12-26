const pool = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function generateAccessToken(userId) {
    return jwt.sign({ id: userId }, process.env.SECRET_KEY, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
    return jwt.sign({ id: userId }, process.env.REFRESH_SECRET_KEY, { expiresIn: '7d' });
}
exports.login = async function (req, res) {
    try {
        const { email, password } = req.body;
        if (typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ message: 'Invalid request' });
        }

        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE email = ? AND password = ?`,
            [email, password]
        );

        if (rows.length > 0) {
            const userId = rows[0].id;
            const accessToken = generateAccessToken(userId);
            const refreshToken = generateRefreshToken(userId);

            await pool.execute(
                `UPDATE users SET refresh_token = ? WHERE id = ?`,
                [refreshToken, userId]
            );

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                // domain: window.com,
                secure: false,
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 hari
            });

            res.status(200).json({
                message: 'Login successful',
                accessToken
            });
        } else {
            res.status(400).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


exports.refreshToken = async function (req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token not provided' });
        }

        const [rows] = await pool.execute(
            `SELECT * FROM users WHERE refresh_token = ?`,
            [refreshToken]
        );

        if (rows.length === 0) {
            return res.status(403).json({ message: 'Invalid refresh token' });
        }
        jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid refresh token' });
            }

            const newAccessToken = generateAccessToken(decoded.id);
            res.status(200).json({
                accessToken: newAccessToken
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.logout = async function (req, res) {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(200).json({ message: 'Logout successful' });
        }

        await pool.execute(
            `UPDATE users SET refresh_token = NULL WHERE refresh_token = ?`,
            [refreshToken]
        );

        // Hapus cookie refreshToken
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: false, 
            sameSite: 'lax'
        });

        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



