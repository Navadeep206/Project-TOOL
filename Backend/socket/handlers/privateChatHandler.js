import ChatMessage from '../../models/chatMessageModel.js';

export const registerPrivateChatHandlers = (io, socket) => {
    const user = socket.user;

    // Join a private room unique to this user
    socket.join(`user_${user._id}`);
    console.log(`[CHAT_SOCKET] User ${user.name} joined private room user_${user._id}`);

    /**
     * @event private:message
     * @desc Send 1-on-1 message to another user
     */
    socket.on('private:message', async (data) => {
        const { recipientId, content } = data;

        try {
            // Persist message to DB
            const newMessage = await ChatMessage.create({
                sender: user._id,
                recipient: recipientId,
                content
            });

            // Emit to recipient's private room
            io.to(`user_${recipientId}`).emit('private:received', {
                message: newMessage,
                sender: { id: user._id, name: user.name }
            });

            // Also emit back to sender (for multi-device sync or just confirmation)
            socket.emit('private:sent', {
                message: newMessage
            });

            console.log(`[CHAT_SOCKET] Message from ${user.name} to user_${recipientId}`);
        } catch (error) {
            console.error('[CHAT_SOCKET_ERROR]', error);
            socket.emit('error', { message: 'Failed to send message' });
        }
    });

    /**
     * @event private:typing
     * @desc Broadcast typing status to a specific recipient
     */
    socket.on('private:typing', (data) => {
        const { recipientId, isTyping } = data;
        io.to(`user_${recipientId}`).emit('private:typing_update', {
            senderId: user._id,
            isTyping
        });
    });
};
