require('dotenv').config();
const { Telegraf } = require('telegraf');
const { Octokit } = require('@octokit/rest');
const axios = require('axios');

// Load environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;
const owner = process.env.GITHUB_USERNAME;
const repo = process.env.GITHUB_REPO;

// Initialize Octokit and Telegram Bot
const octokit = new Octokit({ auth: githubToken });
const bot = new Telegraf(token);

console.log("Bot is starting... waiting for messages!");

bot.on('message', async (ctx) => {
    const msg = ctx.message;

    // We only want to process messages with photos
    if (!msg.photo) {
        return ctx.reply("Please send me an image of your achievement along with a caption describing it!");
    }

    const caption = msg.caption || "New Achievement!";
    
    // Get the highest resolution photo
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;

    try {
        await ctx.reply("⏳ Processing your achievement... Please wait.");

        // 1. Get image URL from Telegram
        const fileLink = await ctx.telegram.getFileLink(fileId);
        
        // 2. Download the image
        const response = await axios.get(fileLink, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(response.data, 'binary');
        const imageBase64 = imageBuffer.toString('base64');
        
        const timestamp = Date.now();
        const imageFileName = `achievement_${timestamp}.png`;

        // 3. Upload Image to GitHub
        await ctx.reply("📁 Uploading image to GitHub...");
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: imageFileName,
            message: `Add new achievement image: ${imageFileName}`,
            content: imageBase64,
        });

        // 4. Fetch the current script.js from GitHub
        await ctx.reply("📝 Updating portfolio code...");
        
        const scriptFile = await octokit.repos.getContent({
            owner,
            repo,
            path: 'script.js'
        });
        
        const scriptSha = scriptFile.data.sha;
        let scriptContent = Buffer.from(scriptFile.data.content, 'base64').toString('utf-8');

        // Create the new JS object entry
        const cleanCaption = caption.replace(/"/g, "'").replace(/\n/g, ' ');
        
        const newEntry = `        },
        {
            image: "${imageFileName}",
            alt: "New Achievement",
            title: "LinkedIn Update",
            description: "${cleanCaption}"
        }`;

        // Find the exact place to inject this new data in script.js
        const targetString = "        }\r\n    ];";
        const fallbackTarget = "        }\n    ];";
        
        if (scriptContent.includes(targetString)) {
            scriptContent = scriptContent.replace(targetString, newEntry + "\r\n    ];");
        } else if (scriptContent.includes(fallbackTarget)) {
            scriptContent = scriptContent.replace(fallbackTarget, newEntry + "\n    ];");
        } else {
             scriptContent = scriptContent.replace("    ];", newEntry + "\n    ];");
        }

        // 5. Upload the modified script.js back to GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: 'script.js',
            message: "🚀 Auto-update portfolio with new achievement from Telegram",
            content: Buffer.from(scriptContent).toString('base64'),
            sha: scriptSha
        });
            
        await ctx.reply("✅ Success! Your portfolio has been updated. The live site will refresh with your new achievement in about a minute.");

    } catch (error) {
        console.error(error);
        await ctx.reply(`❌ An error occurred: ${error.message}`);
    }
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
