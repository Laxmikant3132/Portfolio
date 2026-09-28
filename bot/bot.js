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

bot.on('photo', async (ctx) => {
    const msg = ctx.message;

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
        const lines = caption.split('\n').filter(line => line.trim() !== '');
        const titleText = lines.length > 0 ? lines[0] : "New Achievement";
        const descText = lines.length > 1 ? lines.slice(1).join(' ') : "";
        
        const cleanTitle = titleText.replace(/"/g, "'");
        const cleanDesc = descText.replace(/"/g, "'");

        const newEntry = `,
        {
            image: "${imageFileName}",
            alt: "${cleanTitle}",
            title: "${cleanTitle}",
            description: "${cleanDesc}"
        }`;

        // Find the exact place to inject this new data in script.js
        // We replace the end of the array marker \n    ];
        if (scriptContent.includes('\n    ];')) {
            scriptContent = scriptContent.replace('\n    ];', newEntry + '\n    ];');
        } else {
            scriptContent = scriptContent.replace('\r\n    ];', newEntry + '\r\n    ];');
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

bot.command('delete', async (ctx) => {
    const message = ctx.message.text;
    const parts = message.split(' ');
    
    // If no filename is provided, list the achievements
    if (parts.length < 2) {
        try {
            await ctx.reply("⏳ Fetching your achievements...");
            const scriptFile = await octokit.repos.getContent({
                owner,
                repo,
                path: 'script.js'
            });
            const scriptContent = Buffer.from(scriptFile.data.content, 'base64').toString('utf-8');
            
            // Extract image names and titles using a simple regex
            const regex = /image:\s*["'](achievement_[^"']+)["'][^}]*?title:\s*["']([^"']*)["']/g;
            let match;
            let list = "Here are your bot-uploaded achievements:\n\n";
            let found = false;
            
            while ((match = regex.exec(scriptContent)) !== null) {
                found = true;
                const displayTitle = match[2] || "New Achievement";
                list += `📌 **${displayTitle}**\n👉 Copy this to delete: \`/delete ${match[1]}\`\n\n`;
            }
            
            if (!found) {
                return ctx.reply("I couldn't find any recent bot-uploaded achievements in your portfolio.");
            }
            return ctx.replyWithMarkdown(list);
        } catch (error) {
            return ctx.reply(`❌ Could not fetch achievements: ${error.message}`);
        }
    }

    const filename = parts[1];
    
    try {
        await ctx.reply(`🗑️ Attempting to delete ${filename}...`);

        const scriptFile = await octokit.repos.getContent({
            owner,
            repo,
            path: 'script.js'
        });
        
        const scriptSha = scriptFile.data.sha;
        let scriptContent = Buffer.from(scriptFile.data.content, 'base64').toString('utf-8');

        const regex = new RegExp(`\\s*\\{\\s*image:\\s*["']${filename}["'][\\s\\S]*?\\},?`, 'g');
        const originalLength = scriptContent.length;
        scriptContent = scriptContent.replace(regex, '');

        if (scriptContent.length === originalLength) {
            await ctx.reply(`⚠️ Could not find ${filename} in script.js. I'll still try to delete the image file.`);
        } else {
            scriptContent = scriptContent.replace(/,\\s*\\];/g, '\n    ];');
            await octokit.repos.createOrUpdateFileContents({
                owner,
                repo,
                path: 'script.js',
                message: `🗑️ Remove achievement ${filename} via Telegram`,
                content: Buffer.from(scriptContent).toString('base64'),
                sha: scriptSha
            });
            await ctx.reply("✅ Removed entry from script.js.");
        }

        let fileSha;
        try {
            const imageFile = await octokit.repos.getContent({
                owner,
                repo,
                path: filename
            });
            fileSha = imageFile.data.sha;
        } catch (err) {
            if (err.status === 404) {
                return ctx.reply(`⚠️ Image file ${filename} not found on GitHub.`);
            }
            throw err;
        }

        await octokit.repos.deleteFile({
            owner,
            repo,
            path: filename,
            message: `🗑️ Delete ${filename} via Telegram`,
            sha: fileSha
        });
        
        await ctx.reply(`✅ Successfully deleted ${filename} from the repository!`);

    } catch (error) {
        console.error(error);
        await ctx.reply(`❌ An error occurred: ${error.message}`);
    }
});

bot.launch();

// Dummy HTTP server to keep Render happy
const http = require('http');
http.createServer((req, res) => res.end('Bot is alive!')).listen(process.env.PORT || 3000);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
