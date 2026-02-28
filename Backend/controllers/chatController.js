import ChatMessage from '../models/chatMessageModel.js';
import User from '../models/userModel.js';
import mongoose from 'mongoose';

/**
 * @desc    Fetch messages between two users
 */
export const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user._id;

        const messages = await ChatMessage.find({
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        })
        .sort({ createdAt: 1 })
        .limit(100);

        res.status(200).json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * @desc    Get list of users for chat sidebar
 */
export const getChatList = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        // Find all users except current user
        const users = await User.find({ _id: { $ne: currentUserId } })
            .select('name email role')
            .lean();

        // For each user, find the last message if any
        const chatList = await Promise.all(users.map(async (user) => {
            const lastMessage = await ChatMessage.findOne({
                $or: [
                    { sender: currentUserId, recipient: user._id },
                    { sender: user._id, recipient: currentUserId }
                ]
            })
            .sort({ createdAt: -1 })
            .select('content createdAt isRead sender');

            return {
                ...user,
                lastMessage: lastMessage || null
            };
        }));

        // Sort by last message date
        chatList.sort((a, b) => {
            if (!a.lastMessage) return 1;
            if (!b.lastMessage) return -1;
            return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
        });

        res.status(200).json({ success: true, data: chatList });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
