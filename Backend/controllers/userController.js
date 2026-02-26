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

        const user = await User.create({
            name,
            email: normalizedEmail,
            password
        });

        generateToken(res, user._id, user.role);
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: err.message || "Something went wrong" });
    }

}

const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Please Enter the credentials" });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        console.log(`[Login] Attempt for: ${normalizedEmail}`);
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            console.log(`[Login] User not found: ${normalizedEmail}`);
            return res.status(401).json({ message: "Invalid email or password" });
        }

        let isMatch = await user.matchPassword(password);
        console.log(`[Login] Password match for ${normalizedEmail}: ${isMatch}`);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        generateToken(res, user._id, user.role);

        res.status(200).json({
            message: "User logged in successfully",
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accessType: user.accessType
        });
    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json({ message: "Server error during login" });
    }
}

const deleteUser = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Something went wrong" });
    }
}

const getUsers = async (req, res, next) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (err) {
        console.error('getUsers Error:', err);
        res.status(500).json({ message: "Server error fetching users" });
    }
}

export { createUser, loginUser, deleteUser, getUsers };
