const { Telegraf } = require('telegraf');

const botToken = process.env.BOT_TOKEN;

if (!botToken) {
    console.error('BOT_TOKEN is not set in environment variables!');
}

const bot = new Telegraf(botToken || 'DUMMY_TOKEN');

// Tes perintah start
bot.start((ctx) => {
    return ctx.reply('Halo! Bot berhasil terhubung dan merespons.');
});

// Tes echo (bot akan mengulangi pesan yang kamu kirim)
bot.on('message', (ctx) => {
    const text = ctx.message.text || 'Bukan pesan teks';
    return ctx.reply(`Pesan diterima: ${text}`);
});

module.exports = async (req, res) => {
    try {
        await bot.handleUpdate(req.body, res);
        return res.status(200).send('OK');
    } catch (err) {
        console.error('Error handling update:', err);
        // Mengembalikan status 200 agar Telegram tidak melakukan spam/retrying
        return res.status(200).send('OK'); 
    }
};
