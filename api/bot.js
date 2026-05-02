const axios = require('axios');

module.exports = async (req, res) => {
    // Token bot Telegram Anda
    const token = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';
    
    // Ambil kunci dari Environment Variables
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = 'instagram120.p.rapidapi.com'; // Menggunakan host RapidAPI Anda

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
        text: '🔄 Sedang memproses konten Instagram (HD), mohon tunggu sebentar...'
    });

    try {
        const options = {
            method: 'GET',
            url: `https://${rapidApiHost}/`, 
            params: {
                url: text
            },
            headers: {
                'X-RapidAPI-Key': rapidApiKey,
                'X-RapidAPI-Host': rapidApiHost
            }
        };

        const response = await axios.request(options);
        const data = response.data;
        
        // Mengambil URL berdasarkan struktur respons umum RapidAPI
        let mediaUrl = data.url || (data.links && data.links.length > 0 ? data.links[0].url : null) || data.video_url || data.thumbnail_url;
        let mediaType = data.type || 'video';

        if (mediaUrl) {
            if (mediaType === 'image' || mediaUrl.match(/\.(jpeg|jpg|png)/i)) {
                await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
                    chat_id: chatId,
                    photo: mediaUrl,
                    caption: '✅ Berhasil! Foto Instagram HD.'
                });
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendVideo`, {
                    chat_id: chatId,
                    video: mediaUrl,
                    caption: '✅ Berhasil! Video Instagram HD.'
                });
            }
        } else {
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: '❌ Gagal menemukan URL media. Pastikan link bukan dari akun yang di-private.'
            });
        }

    } catch (error) {
        console.error('Error processing RapidAPI request:', error);
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: '❌ Terjadi kesalahan pada server saat memproses link Anda. Pastikan RapidAPI Key Anda masih aktif.'
        });
    }

    return res.status(200).send('OK');
};
