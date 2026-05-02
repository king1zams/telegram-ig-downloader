const axios = require('axios');

module.exports = async (req, res) => {
    // Token bot Telegram Anda
    const token = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';
    
    // Ambil kunci dari Environment Variable
    const rapidApiKey = process.env.RAPIDAPI_KEY;
    const rapidApiHost = 'instagram120.p.rapidapi.com';

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
            text: 'Halo! Kirimkan username Instagram (tanpa @) untuk melihat postingan terbaru.'
        });
        return res.status(200).send('OK');
    }

    // Beri tahu pengguna bahwa proses sedang berjalan
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: '🔄 Sedang mengambil postingan, mohon tunggu sebentar...'
    });

    try {
        const options = {
            method: 'POST',
            url: `https://${rapidApiHost}/api/instagram/posts`,
            headers: {
                'x-rapidapi-key': rapidApiKey,
                'x-rapidapi-host': rapidApiHost,
                'Content-Type': 'application/json'
            },
            data: {
                username: text, // Menggunakan teks yang dikirim pengguna sebagai username
                maxId: ''
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        // Memeriksa apakah postingan ditemukan
        if (data && data.items && data.items.length > 0) {
            const post = data.items[0];
            const mediaUrl = post.thumbnail_url || post.video_url || post.display_url;
            
            if (mediaUrl) {
                if (post.media_type === 2) { // Tipe Video
                    await axios.post(`https://api.telegram.org/bot${token}/sendVideo`, {
                        chat_id: chatId,
                        video: mediaUrl,
                        caption: `✅ Berhasil! Postingan dari @${text}`
                    });
                } else { // Tipe Foto
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        chat_id: chatId,
                        photo: mediaUrl,
                        caption: `✅ Berhasil! Postingan dari @${text}`
                    });
                }
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: '❌ Tidak dapat menemukan media pada postingan tersebut.'
                });
            }
        } else {
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: '❌ Tidak ada postingan ditemukan atau username tidak valid.'
            });
        }

    } catch (error) {
        console.error('Error fetching RapidAPI data:', error);
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: '❌ Terjadi kesalahan pada server saat mengambil data Instagram.'
        });
    }

    return res.status(200).send('OK');
};
