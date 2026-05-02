const { Telegraf } = require('telegraf');
const axios = require('axios');

module.exports = async (req, res) => {
    // Token yang sudah terdeteksi dan diatur langsung
    const botToken = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';

    const bot = new Telegraf(botToken);

    // Menangani perintah /start
    bot.start((ctx) => {
        return ctx.reply('Halo! Kirimkan link Instagram (Reels atau Foto) untuk mengunduh media.');
    });

    // Menangani pesan teks
    bot.on('text', async (ctx) => {
        const text = ctx.message.text;

        if (text.startsWith('/')) {
            return;
        }

        if (text.includes('instagram.com')) {
            await ctx.reply('🔄 Sedang memproses konten Instagram, mohon tunggu sebentar...');
            
            try {
                const apiUrl = `https://api.betabotz.org/api/download/instagram?url=${encodeURIComponent(text)}`;
                const response = await axios.get(apiUrl);

                if (response.data && response.data.result) {
                    const result = response.data.result;
                    
                    if (result.length > 0) {
                        const mediaUrl = result[0].url;

                        if (result[0].type === 'image') {
                            return ctx.replyWithPhoto({ url: mediaUrl }, { caption: '✅ Berhasil! Foto Instagram.' });
                        } else {
                            return ctx.replyWithVideo({ url: mediaUrl }, { caption: '✅ Berhasil! Video Instagram.' });
                        }
                    } else {
                        return ctx.reply('❌ Gagal mengambil data. Pastikan link benar dan akun tidak di-private.');
                    }
                } else {
                    return ctx.reply('❌ Server API Instagram sedang gangguan atau tidak merespons.');
                }
            } catch (error) {
                console.error('Error processing Instagram link:', error);
                return ctx.reply('❌ Terjadi kesalahan pada server saat memproses link Instagram.');
            }
        } else {
            return ctx.reply('Silakan kirimkan link Instagram yang valid (contoh: https://www.instagram.com/reel/...)');
        }
    });

    try {
        await bot.handleUpdate(req.body, res);
        return res.status(200).send('OK');
    } catch (err) {
        console.error('Error handling update:', err);
        return res.status(200).send('OK'); // Mengembalikan OK agar Telegram tidak melakukan spam retry
    }
};
