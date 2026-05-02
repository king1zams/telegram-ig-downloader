module.exports = async (req, res) => {
    const token = process.env.BOT_TOKEN;
    
    return res.status(200).json({
        token_status: token ? "Token terdeteksi oleh Vercel" : "Token TIDAK terdeteksi",
        token_awal: token ? token.substring(0, 10) + "..." : "Tidak ada"
    });
};
