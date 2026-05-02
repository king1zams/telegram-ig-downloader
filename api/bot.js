const axios = require('axios');

module.exports = async (req, res) => {
    // Token bot Anda
    const token = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';

    // Pastikan request dari Telegram ada isinya
    if (!req.body || !req.body.message) {
        return res.status(200).send('OK');
    }

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    // Jika pengguna mengetik perintah /start
    if (text === '/start') {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: 'Halo! Kirimkan link Instagram (Reels atau Foto) untuk mengunduh media berkualitas HD.'
        });
        return res.status(200).send('OK');
    }

    // Jika pesan bukan link instagram
    if (!text.includes('instagram.com')) {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: 'Silakan kirimkan link Instagram yang valid (contoh: https://www.instagram.com/reel/...)'
        });
        return res.status(200).send('OK');
    }

    // Beri tahu pengguna bahwa proses sedang berjalan
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: '🔄 Sedang memproses konten Instagram, mohon tunggu sebentar...'
    });

    try {
        // Menggunakan API publik alternatif yang lebih stabil
        const apiUrl = `https://api.siputzx.my.id/api/download/ig?url=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl);

        const data = response.data;

        if (data && data.result) {
            const result = data.result;
            let mediaUrl = null;
            let mediaType = null;

            // Mendeteksi apakah result berupa array atau objek
            if (Array.isArray(result) && result.length > 0) {
                mediaUrl = result[0].url;
                mediaType = result[0].type;
            } else if (typeof result === 'object' && result.url) {
                mediaUrl = result.url;
                mediaType = result.type;
            }

            if (mediaUrl) {
                if (mediaType === 'image') {
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        chat_id: chatId,
                        photo: mediaUrl,
                        caption: '✅ Berhasil! Foto Instagram.'
                    });
                } else {
                    await axios.post(`https://api.telegram.org/bot${token}/sendVideo`, {
                        chat_id: chatId,
                        video: mediaUrl,
                        caption: '✅ Berhasil! Video Instagram.'
                    });
                }
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: '❌ Gagal menemukan URL media. Pastikan link tidak berasal dari akun yang di-private.'
                });
            }
        } else {
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: '❌ Gagal mengambil data dari server, API mungkin sedang tidak aktif.'
            });
        }

    } catch (error) {
        console.error('Error processing request:', error);
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: '❌ Terjadi kesalahan pada server saat memproses link Anda.'
        });
    }

    return res.status(200).send('OK');
};
