import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/index'; 

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// ==========================================
// 1. REGISTER ROUTE 
// ==========================================
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // CHANGED: Insert into 'admins' table instead of 'users'
        const result = await query(
            'INSERT INTO admins (username, password_hash) VALUES ($1, $2) RETURNING id, username',
            [username, passwordHash]
        );

        res.json({ message: 'Admin created successfully!', user: result.rows[0] });
    } catch (error: any) {
        if (error.code === '23505') { 
            res.status(400).json({ error: 'Username already exists' });
        } else {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

// ==========================================
// 2. LOGIN ROUTE 
// ==========================================
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { username, password } = req.body;

    try {
        // CHANGED: Select from 'admins' table
        const result = await query('SELECT * FROM admins WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const user = result.rows[0];

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        // Generate JWT Token (Hardcoding role as 'admin' since everyone in this table is an admin)
        const token = jwt.sign(
            { id: user.id, username: user.username, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, role: 'admin' }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;