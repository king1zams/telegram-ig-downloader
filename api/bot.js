const axios = require('axios');

module.exports = async (req, res) => {
    // Cetak SEMUA data yang masuk dari Telegram ke Vercel Logs
    console.log('--- REQUEST RECEIVED ---');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    const token = '8647517615:AAGmZNTK_dwebq8_y33LADbEFjoXLODFfs4';
    const rapidApiKey = process.env.RAPIDAPI_KEY || 'df6fd0d8e3msh10330fcee0931aep1a19ffjsnf475ff12048a';
    const rapidApiHost = 'instagram120.p.rapidapi.com';

    // Pastikan request memiliki body
    if (!req.body || !req.body.message) {
        return res.status(200).send('OK - No message body');
    }

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;

    // Abaikan perintah /start atau command lainnya untuk pengetesan awal
    if (!text || text.startsWith('/')) {
        return res.status(200).send('OK - Command Ignored');
    }

    // Beri tahu pengguna bahwa bot sedang memproses
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: chatId,
        text: '🔄 Sedang memeriksa username, mohon tunggu sebentar...'
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

        // Cetak respons API ke log
        console.log('--- API RESPONSE ---', JSON.stringify(data, null, 2));

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
            await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
                chat_id: chatId,
                text: '❌ Tidak ditemukan postingan. Cek Vercel Logs untuk detail respons API.'
            });
        }

    } catch (error) {
        console.error('Error fetching RapidAPI data:', error.message);
        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: '❌ Terjadi kesalahan pada server saat mengambil data Instagram.'
        });
    }

    return res.status(200).send('OK');
};
