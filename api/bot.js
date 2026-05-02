const axios = require('axios');

module.exports = async (req, res) => {
    const token = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';
    const rapidApiKey = process.env.RAPIDAPI_KEY || 'df6fd0d8e3msh10330fcee0931aep1a19ffjsnf475ff12048a';
    const rapidApiHost = 'instagram120.p.rapidapi.com';

    if (!req.body || !req.body.message) {
        return res.status(200).send('OK');
    }

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    if (text === '/start') {
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: 'Halo! Kirimkan username Instagram (contoh: keke) untuk melihat postingan terbarunya.'
        });
        return res.status(200).send('OK');
    }

    if (text.startsWith('/')) {
        return res.status(200).send('OK');
    }

    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: '🔄 Sedang memeriksa akun, mohon tunggu sebentar...'
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
                username: text,
                maxId: ''
            }
        };

        const response = await axios.request(options);
        const data = response.data;

        // Cetak respons ke log Vercel untuk debugging
        console.log('--- RESPON API ---', JSON.stringify(data, null, 2));

        if (data && data.items && data.items.length > 0) {
            const post = data.items[0];
            const mediaUrl = post.video_url || post.thumbnail_url || post.display_url;
            
            if (mediaUrl) {
                if (post.media_type === 2) {
                    await axios.post(`https://api.telegram.org/bot${token}/sendVideo`, {
                        chat_id: chatId,
                        video: mediaUrl,
                        caption: `✅ Berhasil! Postingan dari @${text}`
                    });
                } else {
                    await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
                        chat_id: chatId,
                        photo: mediaUrl,
                        caption: `✅ Berhasil! Postingan dari @${text}`
                    });
                }
            } else {
                await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                    chat_id: chatId,
                    text: '❌ Media tidak ditemukan pada postingan tersebut.'
                });
            }
        } else {
            // Beri tahu pengguna dan tampilkan sebagian struktur mentah jika kosong
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: `❌ Tidak ditemukan postingan. Cek Vercel Logs untuk melihat data yang dikirim oleh API.`
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
