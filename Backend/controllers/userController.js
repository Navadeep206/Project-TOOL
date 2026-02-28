import User from '../models/userModel.js';
import generateToken from '../utils/generateToken.js';
import { ROLES } from '../constants/roles.js';
const createUser = async (req, res, next) => {
    try {
        const { name, password, email } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                message: "Please fill the details"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const userExist = await User.findOne({ email: normalizedEmail });
        if (userExist) {
            return res.status(400).json({
                message: "User already Exist"
            });
        }

        // --- INVITATION-BASED ONBOARDING REFACTOR ---
        // Only allow public registration for the first user (First Admin)
        const userCount = await User.countDocuments();
        if (userCount > 0) {
            return res.status(403).json({
                message: "Public registration is disabled. Please contact an administrator for an invitation."
            });
        }

        const user = await User.create({
            name,
            email: normalizedEmail,
            password,
            role: ROLES.ADMIN // First user is always Admin
        });

        generateToken(res, user._id, user.role);
        res.status(201).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ success: false, message: err.message || "Something went wrong" });
    }

}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Please Enter the credentials" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const logEntry = `[${new Date().toISOString()}] Login Attempt: ${normalizedEmail}\n`;
        import('fs').then(fs => fs.appendFileSync('auth.log', logEntry));

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.warn(`[Login] User not found: ${normalizedEmail}`);
            import('fs').then(fs => fs.appendFileSync('auth.log', `[${new Date().toISOString()}] User not found: ${normalizedEmail}\n`));
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        let isMatch = await user.matchPassword(password);
        console.log(`[Login] Password match for ${normalizedEmail}: ${isMatch}`);
        import('fs').then(fs => fs.appendFileSync('auth.log', `[${new Date().toISOString()}] Password match for ${normalizedEmail}: ${isMatch}\n`));

        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid email or password" });
        }

        generateToken(res, user._id, user.role);

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accessType: user.accessType
            }
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ success: false, message: "Server error during login" });
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        console.error('getUsers Error:', err);
        res.status(500).json({ success: false, message: "Server error fetching users" });
    }
}

export { createUser, loginUser, deleteUser, getUsers };
