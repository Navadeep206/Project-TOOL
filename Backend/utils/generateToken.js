import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    const token = jwt.sign({ userId, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    // Set JWT as an HTTP-Only cookie for enhanced security
    res.cookie('jwt', token, {
        httpOnly: true,
        secure: true, // Required for sameSite: 'none'
        sameSite: 'none', // Allow cross-domain cookies (Render -> Vercel)
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return token;
};

export default generateToken;
