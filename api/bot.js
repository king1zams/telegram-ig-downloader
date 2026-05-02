module.exports = async (req, res) => {
    // Mengembalikan respons sederhana untuk memastikan Vercel berfungsi
    return res.status(200).json({
        message: "Bot is online and working!"
    });
};
