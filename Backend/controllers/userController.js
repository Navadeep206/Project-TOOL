import User from "./models/userModel.js"
const createUser = async (req, res, next) => {
    const { name, password, email } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({
            message: "Please fill the details"

        })
    }
    const userExist = await User.findone({ email });
    if (userExist) {
        return res.status(400).json({
            message: "User already Exist"
        })

    }
    try {
        const user = await User.createUser({
            name, email, password
        })
        res.status(201).json({
            id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })

    } catch (err) {
        console.log(error);
        res.status(500).json({ message: "Something went wrong" });
    }

}
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({
            message: "Please Enter the credintials"
        })
    }
    const user = User.findone({ email });
    if (!user) {
        return res.status(400).json({
            message: "User doesn't exist",
        })
    }
    const isMatch = bcrypt(password, user.password);
    if (!isMatch) {
        return res.status(400).json({
            message: "Please Enter the vaild Credintials",
        })
    }
    res.status(200).json({
        message: "User logged in successfully",
        id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id)
    })

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

export default { createUser, loginUser, deleteUser };