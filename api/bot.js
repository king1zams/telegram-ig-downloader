const { Telegraf } = require('telegraf');
const axios = require('axios');

module.exports = async (req, res) => {
    // Token bot Anda saat ini
    const botToken = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';

    const bot = new Telegraf(botToken);

    // Menangani perintah /start
    bot.start((ctx) => {
        return ctx.reply('Halo! Kirimkan link Instagram (Reels atau Foto) untuk mengunduh media berkualitas HD.');
    });

    // Menangani pesan teks
    bot.on('text', async (ctx) => {
        const text = ctx.message.text;

        if (text.startsWith('/')) {
            return;
        }

        if (text.includes('instagram.com')) {
            await ctx.reply('🔄 Sedang memproses konten Instagram (HD), mohon tunggu sebentar...');
            
            try {
                const response = await axios.post('https://api.cobalt.tools/api/json', {
                    url: text,
                    vQuality: 'max' // Meminta kualitas tertinggi / HD
                }, {
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });

                const data = response.data;

                if (data && (data.url || (data.picker && data.picker.length > 0))) {
                    let mediaUrl = data.url;
                    
                    if (!mediaUrl && data.picker && data.picker.length > 0) {
                        mediaUrl = data.picker[0].url;
                    }

                    if (mediaUrl) {
                        // Memisahkan penanganan video atau foto berdasarkan respons
                        if (data.type === 'video' || (!data.type && !mediaUrl.match(/\.(jpeg|jpg|png)/i))) {
                            return ctx.replyWithVideo({ url: mediaUrl }, { caption: '✅ Berhasil! Video Instagram HD.' });
                        } else {
                            return ctx.replyWithPhoto({ url: mediaUrl }, { caption: '✅ Berhasil! Foto Instagram HD.' });
                        }
                    } else {
                        return ctx.reply('❌ Gagal mengambil URL media dari server.');
                    }
                } else {
                    return ctx.reply('❌ Gagal mengambil data. Pastikan link benar dan akun tidak di-private.');
                }
            } catch (error) {
                console.error('Error with Cobalt API:', error);
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
        return res.status(200).send('OK'); // Mencegah retrying dari Telegram
    }
};
