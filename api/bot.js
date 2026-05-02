const { Telegraf } = require('telegraf');
const axios = require('axios');

const botToken = process.env.BOT_TOKEN;
if (!botToken) {
    throw new Error('BOT_TOKEN is not set');
}

const bot = new Telegraf(botToken);

bot.start((ctx) => {
    return ctx.reply('Halo dr.Izam zam yang terhormat,Kirimkan link Instagram (Reels atau Foto) untuk mengunduh media.');
});

bot.on('text', async (ctx) => {
    const text = ctx.message.text;

    if (text.includes('instagram.com')) {
        await ctx.reply('🔄 Sedang memproses konten Instagram, mohon tunggu sebentar...');
        
        try {
            const response = await axios.get(`https://api.betabotz.org/api/download/instagram?url=${encodeURIComponent(text)}`);
            const result = response.data.result;

            if (result && result.length > 0) {
                const mediaUrl = result[0].url;

                if (result[0].type === 'image') {
                    return ctx.replyWithPhoto({ url: mediaUrl }, { caption: '✅ Berhasil! Foto Instagram.' });
                } else {
                    return ctx.replyWithVideo({ url: mediaUrl }, { caption: '✅ Berhasil! Video Instagram.' });
                }
            } else {
                return ctx.reply('❌ Gagal mengambil data Instagram. Pastikan akun tidak di-private.');
            }
        } catch (error) {
            return ctx.reply('❌ Terjadi kesalahan saat memproses link Instagram.');
        }
    } else {
        return ctx.reply('Silakan kirimkan link Instagram yang valid (contoh: https://www.instagram.com/reel/...)');
    }
});

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            await bot.handleUpdate(req.body, res);
            return res.status(200).send('OK');
        } catch (err) {
            console.error('Error handling update:', err);
            return res.status(500).send('Internal Server Error');
        }
    } else {
        return res.status(200).send('Bot is running!');
    }
};
