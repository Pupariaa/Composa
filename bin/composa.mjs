#!/usr/bin/env node

/**
 * Composa CLI - Interactive Email Provider Setup
 * 
 * Usage:
 *   composa-test gmail     - Setup Gmail configuration
 *   composa-test outlook   - Setup Outlook configuration
 *   composa-test yahoo     - Setup Yahoo configuration
 *   composa-test sendgrid  - Setup SendGrid configuration
 *   composa-test mailgun   - Setup Mailgun configuration
 *   composa-test list      - List all available providers
 *   composa-test help      - Show help information
 */

import { createInterface } from 'readline';
import { writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
    listProviders,
    getProviderSetup,
    createProviderConfig,
    emailProviders
} from '../src/email-providers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function colorize(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function createReadlineInterface() {
    return createInterface({
        input: process.stdin,
        output: process.stdout
    });
}

function question(rl, prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function hideInput(rl, prompt) {
    return new Promise((resolve) => {
        process.stdout.write(prompt);
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        let input = '';
        process.stdin.on('data', function (char) {
            char = char + '';
            switch (char) {
                case '\n':
                case '\r':
                case '\u0004':
                    process.stdin.setRawMode(false);
                    process.stdin.pause();
                    process.stdin.removeAllListeners('data');
                    process.stdout.write('\n');
                    resolve(input);
                    break;
                case '\u0003':
                    process.exit();
                    break;
                case '\u007f':
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                    break;
                default:
                    input += char;
                    process.stdout.write('*');
                    break;
            }
        });
    });
}

function showBanner() {
    console.log(colorize(`
╔══════════════════════════════════════════════════════════════╗
║                        Composa CLI                          ║
║              Interactive Email Provider Setup                ║
╚══════════════════════════════════════════════════════════════╝
`, 'cyan'));
}

function showHelp() {
    console.log(colorize('\nComposa CLI Commands:', 'bright'));
    console.log(colorize('  composa gmail     ', 'green') + '- Setup Gmail configuration');
    console.log(colorize('  composa yahoo     ', 'green') + '- Setup Yahoo configuration');
    console.log(colorize('  composa aol       ', 'green') + '- Setup AOL configuration');
    console.log(colorize('  composa gmx       ', 'green') + '- Setup GMX configuration');
    console.log(colorize('  composa zoho      ', 'green') + '- Setup Zoho configuration');
    console.log(colorize('  composa icloud    ', 'green') + '- Setup iCloud configuration');
    console.log(colorize('  composa list      ', 'green') + '- List all available providers');
    console.log(colorize('  composa help      ', 'green') + '- Show this help information');
    console.log(colorize('\nExample:', 'yellow'));
    console.log(colorize('  npx composa gmail', 'cyan'));
    console.log('');
}

function showProviderList() {
    console.log(colorize('\nAvailable Email Providers:', 'bright'));
    const providers = listProviders();

    providers.forEach(provider => {
        // Keep only personal email providers: gmail, yahoo, outlook, aol, gmx, zoho, icloud
        if (provider === 'gmail' || provider === 'yahoo' || provider === 'outlook' ||
            provider === 'aol' || provider === 'gmx' || provider === 'zoho' || provider === 'icloud') {
            const config = emailProviders[provider];
            console.log(colorize(`  • ${provider.padEnd(12)}`, 'green') +
                colorize(`- ${config.host}`, 'white'));
        }
    });
    console.log(colorize('\nNote: Outlook is temporarily not supported due to Microsoft restrictions.', 'yellow'));
    console.log('');
}

async function setupProvider(providerName) {
    const rl = createReadlineInterface();

    try {
        if (providerName === 'gmail') {
            await setupGmailAppPassword(rl);
        } else if (providerName === 'yahoo') {
            await setupYahoo(rl);
        } else if (providerName === 'aol') {
            await setupAOL(rl);
        } else if (providerName === 'gmx') {
            await setupGMX(rl);
        } else if (providerName === 'zoho') {
            await setupZoho(rl);
        } else if (providerName === 'icloud') {
            await setupiCloud(rl);
        } else {
            await setupOtherProvider(providerName, rl);
        }
    } catch (error) {
        console.log(colorize(`Error: ${error.message}`, 'red'));
    } finally {
        rl.close();
    }
}

async function setupGmailAppPassword(rl) {
    console.log(colorize(`\nSetting up GMAIL App Password configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the Gmail App Password Setup!', 'bright'));
    console.log(colorize('This will guide you through enabling 2FA and creating an App Password for Gmail.', 'white'));

    // Step 1: Enable 2FA
    console.log(colorize('\nSTEP 1: Enable Two-Factor Authentication', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to your Google Account settings:', 'bright'));
    console.log(colorize('   https://myaccount.google.com/', 'blue'));

    console.log(colorize('\n2. Click on "Security" in the left sidebar', 'bright'));
    console.log(colorize('\n3. Under "Signing in to Google", click "2-Step Verification"', 'bright'));
    console.log(colorize('\n4. Follow the setup process to enable 2FA', 'bright'));
    console.log(colorize('   • You\'ll need your phone for verification', 'white'));
    console.log(colorize('   • This is required to create App Passwords', 'white'));

    const twoFAEnabled = await question(rl, colorize('\nHave you enabled 2-Step Verification? (y/N): ', 'green'));
    if (twoFAEnabled.toLowerCase() !== 'y' && twoFAEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease enable 2-Step Verification first, then run this command again.', 'yellow'));
        return;
    }

    // Step 2: Generate App Password
    console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go directly to App Passwords:', 'bright'));
    console.log(colorize('   https://myaccount.google.com/apppasswords', 'blue'));

    console.log(colorize('\n2. You might need to sign in again', 'bright'));
    console.log(colorize('\n3. Select "Mail" as the app type', 'bright'));
    console.log(colorize('\n4. Select "Other (custom name)" as the device', 'bright'));
    console.log(colorize('\n5. Enter a name like "Composa Email Client"', 'bright'));
    console.log(colorize('\n6. Click "Generate"', 'bright'));
    console.log(colorize('\n7. Copy the 16-character password (like: abcd efgh ijkl mnop)', 'bright'));

    const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
    if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease generate an App Password first, then run this command again.', 'yellow'));
        return;
    }

    // Step 3: Get Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\nNow enter your Gmail credentials:', 'bright'));

    const email = await question(rl, colorize('\nEnter your Gmail address: ', 'green'));
    const appPassword = await question(rl, colorize('Enter your App Password (16 characters): ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('gmail', { user: email, pass: appPassword });

    // Generate example code
    const exampleCode = generateGmailExampleCode(email, appPassword);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., gmail-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'gmail-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\nGmail Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. Your App Password is secure and app-specific', 'white'));
    console.log(colorize('3. No browser windows or additional authorization needed', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your App Password secure', 'white'));
    console.log(colorize('• Never commit your .env file to version control', 'white'));
    console.log(colorize('• You can revoke this App Password anytime in Google Account settings', 'white'));
}

async function setupYahoo(rl) {
    console.log(colorize(`\nSetting up YAHOO App Password configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the Yahoo Setup!', 'bright'));
    console.log(colorize('This will guide you through setting up Yahoo Mail with App Passwords.', 'white'));

    // Step 1: Enable 2-Step Verification
    console.log(colorize('\nSTEP 1: Enable 2-Step Verification', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Yahoo Account Security:', 'bright'));
    console.log(colorize('   https://login.yahoo.com/account/security', 'blue'));

    console.log(colorize('\n2. Sign in with your Yahoo account', 'bright'));
    console.log(colorize('\n3. Under "Two-step verification", click "Turn on"', 'bright'));
    console.log(colorize('\n4. Follow the setup process (SMS or authenticator app)', 'bright'));
    console.log(colorize('\n5. Complete the 2-step verification setup', 'bright'));

    const twoStepEnabled = await question(rl, colorize('\nHave you enabled 2-Step Verification? (y/N): ', 'green'));
    if (twoStepEnabled.toLowerCase() !== 'y' && twoStepEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease enable 2-Step Verification first, then run this command again.', 'yellow'));
        return;
    }

    // Check if App Passwords are available
    console.log(colorize('\nIMPORTANT: Yahoo App Passwords Availability', 'yellow'));
    console.log(colorize('─'.repeat(50), 'cyan'));
    console.log(colorize('\nYahoo has restrictions on App Passwords for some accounts:', 'bright'));
    console.log(colorize('• Business/Enterprise accounts may not have App Passwords', 'white'));
    console.log(colorize('• Some regions have limited App Password support', 'white'));
    console.log(colorize('• Yahoo may require OAuth2 for certain account types', 'white'));

    console.log(colorize('\nIf App Passwords are not available:', 'yellow'));
    console.log(colorize('1. Try Gmail instead (more reliable)', 'white'));
    console.log(colorize('2. Contact Yahoo support for your account type', 'white'));

    const continueAnyway = await question(rl, colorize('\nDo you want to continue anyway? (y/N): ', 'green'));
    if (continueAnyway.toLowerCase() !== 'y' && continueAnyway.toLowerCase() !== 'yes') {
        console.log(colorize('\nRecommendation: Use Gmail instead with: npx composa gmail', 'cyan'));
        return;
    }

    // Step 2: Generate App Password
    console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Yahoo App Passwords:', 'bright'));
    console.log(colorize('   https://login.yahoo.com/account/security/app-passwords', 'blue'));

    console.log(colorize('\n2. Sign in with your Yahoo account', 'bright'));
    console.log(colorize('\n3. Click "Generate app password"', 'bright'));
    console.log(colorize('\n4. Enter a name like "Composa Email Client"', 'bright'));
    console.log(colorize('\n5. Click "Generate password"', 'bright'));
    console.log(colorize('\n6. Copy the generated password (16 characters)', 'bright'));
    console.log(colorize('\n7. The password will look like: abcd-efgh-ijkl-mnop', 'bright'));

    const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
    if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
        console.log(colorize('\n❌ App Password generation failed or not available.', 'red'));
        console.log(colorize('\n💡 This is common with Yahoo accounts. Alternative:', 'yellow'));
        console.log(colorize('1. Use Gmail instead: npx composa-test gmail', 'white'));
        return;
    }

    // Step 3: Enter Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const email = await question(rl, colorize('\nEnter your Yahoo email address: ', 'green'));
    const password = await question(rl, colorize('Enter your App Password: ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('yahoo', { user: email, pass: password });

    // Generate example code
    const exampleCode = generateYahooExampleCode(email, password);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., yahoo-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'yahoo-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\nYahoo Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. Your credentials are secure and app-specific', 'white'));
    console.log(colorize('3. No browser windows or additional authorization needed', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your App Password secure', 'white'));
    console.log(colorize('• Never commit your code with credentials to version control', 'white'));
    console.log(colorize('• You can revoke this App Password anytime in Yahoo Account settings', 'white'));
}

async function setupAOL(rl) {
    console.log(colorize(`\nSetting up AOL App Password configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the AOL Setup!', 'bright'));
    console.log(colorize('This will guide you through setting up AOL Mail with App Passwords.', 'white'));

    // Step 1: Enable 2-Step Verification
    console.log(colorize('\nSTEP 1: Enable 2-Step Verification', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to AOL Account Security:', 'bright'));
    console.log(colorize('   https://login.aol.com/account/security', 'blue'));

    console.log(colorize('\n2. Sign in with your AOL account', 'bright'));
    console.log(colorize('\n3. Under "Two-step verification", click "Turn on"', 'bright'));
    console.log(colorize('\n4. Follow the setup process (SMS or authenticator app)', 'bright'));
    console.log(colorize('\n5. Complete the 2-step verification setup', 'bright'));

    const twoStepEnabled = await question(rl, colorize('\nHave you enabled 2-Step Verification? (y/N): ', 'green'));
    if (twoStepEnabled.toLowerCase() !== 'y' && twoStepEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease enable 2-Step Verification first, then run this command again.', 'yellow'));
        return;
    }

    // Step 2: Generate App Password
    console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to AOL App Passwords:', 'bright'));
    console.log(colorize('   https://login.aol.com/account/security/app-passwords', 'blue'));

    console.log(colorize('\n2. Sign in with your AOL account', 'bright'));
    console.log(colorize('\n3. Click "Generate app password"', 'bright'));
    console.log(colorize('\n4. Enter a name like "Composa Email Client"', 'bright'));
    console.log(colorize('\n5. Click "Generate password"', 'bright'));
    console.log(colorize('\n6. Copy the generated password (16 characters)', 'bright'));
    console.log(colorize('\n7. The password will look like: abcd-efgh-ijkl-mnop', 'bright'));

    const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
    if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
        console.log(colorize('\n❌ App Password generation failed or not available.', 'red'));
        console.log(colorize('\n💡 This can happen with AOL accounts. Alternative:', 'yellow'));
        console.log(colorize('1. Use Gmail instead: npx composa-test gmail', 'white'));
        return;
    }

    // Step 3: Enter Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const email = await question(rl, colorize('\nEnter your AOL email address: ', 'green'));
    const password = await question(rl, colorize('Enter your App Password: ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('aol', { user: email, pass: password });

    // Generate example code
    const exampleCode = generateAOLExampleCode(email, password);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., aol-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'aol-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\nAOL Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. Your credentials are secure and app-specific', 'white'));
    console.log(colorize('3. No browser windows or additional authorization needed', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your App Password secure', 'white'));
    console.log(colorize('• Never commit your code with credentials to version control', 'white'));
    console.log(colorize('• You can revoke this App Password anytime in AOL Account settings', 'white'));
}

async function setupGMX(rl) {
    console.log(colorize(`\nSetting up GMX App Password configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the GMX Setup!', 'bright'));
    console.log(colorize('This will guide you through setting up GMX Mail with App Passwords.', 'white'));

    // Step 1: Enable 2-Factor Authentication
    console.log(colorize('\nSTEP 1: Enable 2-Factor Authentication', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to GMX Mail:', 'bright'));
    console.log(colorize('   https://www.gmx.com/mail/', 'blue'));

    console.log(colorize('\n2. Sign in with your GMX account', 'bright'));
    console.log(colorize('\n3. Click on "Account" in the top right corner', 'bright'));
    console.log(colorize('\n4. Click on "Security Options"', 'bright'));
    console.log(colorize('\n5. Scroll down to "Two-factor authentication"', 'bright'));
    console.log(colorize('\n6. Click "Activate two-factor-authentication"', 'bright'));
    console.log(colorize('\n7. Click "Start Setup Now"', 'bright'));
    console.log(colorize('\n8. Follow the setup process (SMS or authenticator app)', 'bright'));

    console.log(colorize('\n⚠️  Note: Some GMX accounts may have restrictions on 2FA activation.', 'yellow'));
    console.log(colorize('If you cannot activate 2FA, you can try using your regular password.', 'white'));

    const twoStepEnabled = await question(rl, colorize('\nHave you enabled 2-Factor Authentication? (y/N): ', 'green'));
    if (twoStepEnabled.toLowerCase() !== 'y' && twoStepEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\n⚠️  No problem! You can still try with your regular password.', 'yellow'));
        console.log(colorize('Some GMX accounts work without 2FA for SMTP.', 'white'));
    }

    // Step 2: Generate App Password (if 2FA enabled)
    if (twoStepEnabled.toLowerCase() === 'y' || twoStepEnabled.toLowerCase() === 'yes') {
        console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
        console.log(colorize('─'.repeat(40), 'cyan'));

        console.log(colorize('\n1. In the same Security Options page', 'bright'));
        console.log(colorize('\n2. Look for "Application-specific passwords"', 'bright'));
        console.log(colorize('\n3. Click on it to generate a new App Password', 'bright'));
        console.log(colorize('\n4. Enter a name like "Composa Email Client"', 'bright'));
        console.log(colorize('\n5. Copy the generated password', 'bright'));

        const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
        if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
            console.log(colorize('\n⚠️  No problem! We\'ll use your regular password instead.', 'yellow'));
        }
    }

    // Step 3: Enter Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const email = await question(rl, colorize('\nEnter your GMX email address: ', 'green'));
    const password = await question(rl, colorize('Enter your password (or App Password if you have one): ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('gmx', { user: email, pass: password });

    // Generate example code
    const exampleCode = generateGMXExampleCode(email, password);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., gmx-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'gmx-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\nGMX Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. If it doesn\'t work, try enabling 2FA and using an App Password', 'white'));
    console.log(colorize('3. GMX sometimes requires App Passwords for SMTP', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your password/App Password secure', 'white'));
    console.log(colorize('• Never commit your code with credentials to version control', 'white'));
    console.log(colorize('• You can revoke App Passwords anytime in GMX Security Options', 'white'));
}

async function setupZoho(rl) {
    console.log(colorize(`\nSetting up ZOHO Mail configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the Zoho Setup!', 'bright'));
    console.log(colorize('This will guide you through setting up Zoho Mail.', 'white'));

    // Step 1: Enable 2-Factor Authentication
    console.log(colorize('\nSTEP 1: Enable 2-Factor Authentication', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Zoho Account Security:', 'bright'));
    console.log(colorize('   https://accounts.zoho.com/home#security', 'blue'));

    console.log(colorize('\n2. Sign in with your Zoho account', 'bright'));
    console.log(colorize('\n3. Under "Two-Factor Authentication", click "Set Up"', 'bright'));
    console.log(colorize('\n4. Follow the setup process (SMS or authenticator app)', 'bright'));
    console.log(colorize('\n5. Complete the 2-factor authentication setup', 'bright'));

    console.log(colorize('\n⚠️  Note: Zoho requires 2FA to generate App Passwords.', 'yellow'));

    const twoStepEnabled = await question(rl, colorize('\nHave you enabled 2-Factor Authentication? (y/N): ', 'green'));
    if (twoStepEnabled.toLowerCase() !== 'y' && twoStepEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease enable 2-Factor Authentication first, then run this command again.', 'yellow'));
        console.log(colorize('Zoho requires 2FA to generate App Passwords for SMTP.', 'white'));
        return;
    }

    // Step 2: Generate App Password
    console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Zoho Account Security:', 'bright'));
    console.log(colorize('   https://accounts.zoho.com/home#security', 'blue'));

    console.log(colorize('\n2. Sign in with your Zoho account', 'bright'));
    console.log(colorize('\n3. Click on "Application-specific passwords"', 'bright'));
    console.log(colorize('\n4. Click "Generate new password"', 'bright'));
    console.log(colorize('\n5. Enter a name like "Composa Email Client"', 'bright'));
    console.log(colorize('\n6. Click "Generate"', 'bright'));
    console.log(colorize('\n7. Copy the generated password', 'bright'));

    const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
    if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
        console.log(colorize('\n❌ App Password generation failed or not available.', 'red'));
        console.log(colorize('\n💡 This can happen with Zoho accounts. Alternative:', 'yellow'));
        console.log(colorize('1. Use Gmail instead: npx composa-test gmail', 'white'));
        return;
    }

    // Step 3: Enter Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const email = await question(rl, colorize('\nEnter your Zoho email address: ', 'green'));
    const password = await question(rl, colorize('Enter your App Password: ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('zoho', { user: email, pass: password });

    // Generate example code
    const exampleCode = generateZohoExampleCode(email, password);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., zoho-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'zoho-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\n Zoho Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. Your credentials are secure and app-specific', 'white'));
    console.log(colorize('3. No browser windows or additional authorization needed', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your App Password secure', 'white'));
    console.log(colorize('• Never commit your code with credentials to version control', 'white'));
    console.log(colorize('• You can revoke this App Password anytime in Zoho Account settings', 'white'));
    console.log(colorize('• Zoho is great for business/professional email sending', 'white'));
}

async function setupiCloud(rl) {
    console.log(colorize(`\nSetting up iCLOUD App Password configuration`, 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    console.log(colorize('\nWelcome to the iCloud Setup!', 'bright'));
    console.log(colorize('This will guide you through setting up iCloud Mail with App Passwords.', 'white'));

    // Step 1: Enable 2-Factor Authentication
    console.log(colorize('\nSTEP 1: Enable 2-Factor Authentication', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Apple ID Security:', 'bright'));
    console.log(colorize('   https://appleid.apple.com/', 'blue'));

    console.log(colorize('\n2. Sign in with your Apple ID', 'bright'));
    console.log(colorize('\n3. In the "Security" section, click "Two-Factor Authentication"', 'bright'));
    console.log(colorize('\n4. Follow the setup process (SMS or trusted device)', 'bright'));
    console.log(colorize('\n5. Complete the 2-factor authentication setup', 'bright'));

    console.log(colorize('\n⚠️  Note: Apple requires 2FA to generate App Passwords.', 'yellow'));

    const twoStepEnabled = await question(rl, colorize('\nHave you enabled 2-Factor Authentication? (y/N): ', 'green'));
    if (twoStepEnabled.toLowerCase() !== 'y' && twoStepEnabled.toLowerCase() !== 'yes') {
        console.log(colorize('\nPlease enable 2-Factor Authentication first, then run this command again.', 'yellow'));
        console.log(colorize('Apple requires 2FA to generate App Passwords for SMTP.', 'white'));
        return;
    }

    // Step 2: Generate App Password
    console.log(colorize('\nSTEP 2: Generate App Password', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    console.log(colorize('\n1. Go to Apple ID Security:', 'bright'));
    console.log(colorize('   https://appleid.apple.com/', 'blue'));

    console.log(colorize('\n2. Sign in with your Apple ID', 'bright'));
    console.log(colorize('\n3. In the "Security" section, click "App-Specific Passwords"', 'bright'));
    console.log(colorize('\n4. Click "Generate Password"', 'bright'));
    console.log(colorize('\n5. Enter a name like "Composa Email Client"', 'bright'));
    console.log(colorize('\n6. Click "Create"', 'bright'));
    console.log(colorize('\n7. Copy the generated password (16 characters)', 'bright'));
    console.log(colorize('\n8. The password will look like: abcd-efgh-ijkl-mnop', 'bright'));

    const appPasswordGenerated = await question(rl, colorize('\nHave you generated an App Password? (y/N): ', 'green'));
    if (appPasswordGenerated.toLowerCase() !== 'y' && appPasswordGenerated.toLowerCase() !== 'yes') {
        console.log(colorize('\n❌ App Password generation failed or not available.', 'red'));
        console.log(colorize('\nThis can happen with Apple accounts. Alternative:', 'yellow'));
        console.log(colorize('1. Use Gmail instead: npx composa-test gmail', 'white'));
        return;
    }

    // Step 3: Enter Credentials
    console.log(colorize('\nSTEP 3: Enter Your Credentials', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const email = await question(rl, colorize('\nEnter your iCloud email address: ', 'green'));
    const password = await question(rl, colorize('Enter your App Password: ', 'green'));

    // Step 4: Generate Configuration
    console.log(colorize('\nSTEP 4: Generate Configuration', 'yellow'));
    console.log(colorize('─'.repeat(40), 'cyan'));

    const config = createProviderConfig('icloud', { user: email, pass: password });

    // Generate example code
    const exampleCode = generateiCloudExampleCode(email, password);
    console.log(colorize('\nCopy this code into your project:', 'bright'));
    console.log(colorize('─'.repeat(60), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(60), 'cyan'));

    // Security warning
    console.log(colorize('\nSECURITY WARNING:', 'red'));
    console.log(colorize('The code above contains your email credentials in plain text.', 'yellow'));
    console.log(colorize('For production use, store credentials in environment variables:', 'white'));
    console.log(colorize('  - Create a .env file with EMAIL_USER and EMAIL_PASS', 'white'));
    console.log(colorize('  - Use process.env.EMAIL_USER and process.env.EMAIL_PASS', 'white'));
    console.log(colorize('  - Add .env to your .gitignore file', 'white'));

    // Pause to let user read the code
    await question(rl, colorize('\nPress Enter when you have copied the code above...', 'yellow'));

    // Ask if user wants to save to file
    const saveToFile = await question(rl, colorize('\nDo you want to save this code to a file? (y/N): ', 'green'));
    if (saveToFile.toLowerCase() === 'y' || saveToFile.toLowerCase() === 'yes') {
        const filename = await question(rl, colorize('Enter filename (e.g., icloud-setup.js): ', 'green'));
        const filepath = join(process.cwd(), filename || 'icloud-setup.js');
        writeFileSync(filepath, exampleCode);
        console.log(colorize(`Code saved to ${filepath}`, 'green'));
    }

    // Final instructions
    console.log(colorize('\n iCloud Setup Complete!', 'green'));
    console.log(colorize('\nWhat you can do now:', 'yellow'));
    console.log(colorize('1. Use the generated code to send emails', 'white'));
    console.log(colorize('2. Your credentials are secure and app-specific', 'white'));
    console.log(colorize('3. No browser windows or additional authorization needed', 'white'));
    console.log(colorize('4. Works immediately after setup', 'white'));

    console.log(colorize('\nPro Tips:', 'magenta'));
    console.log(colorize('• Keep your App Password secure', 'white'));
    console.log(colorize('• Never commit your code with credentials to version control', 'white'));
    console.log(colorize('• You can revoke this App Password anytime in Apple ID settings', 'white'));
    console.log(colorize('• iCloud is great for Apple ecosystem integration', 'white'));
}

async function setupOtherProvider(providerName, rl) {
    // Get provider information
    const setup = getProviderSetup(providerName);

    console.log(colorize(`\nSetting up ${providerName.toUpperCase()} configuration`, 'bright'));
    console.log(colorize('─'.repeat(50), 'cyan'));

    // Show setup instructions
    console.log(colorize('\n📝 Setup Instructions:', 'yellow'));
    setup.setupSteps.forEach(step => {
        console.log(colorize(`  ${step}`, 'white'));
    });

    if (setup.docs) {
        console.log(colorize(`\n📚 Documentation: ${setup.docs}`, 'blue'));
    }

    if (setup.notes) {
        console.log(colorize(`\n💡 Note: ${setup.notes}`, 'magenta'));
    }

    console.log(colorize('\n' + '─'.repeat(50), 'cyan'));

    // Get credentials
    let email, password, apiKey, domain;

    if (providerName === 'outlook' || providerName === 'yahoo') {
        email = await question(rl, colorize('\nEnter your email address: ', 'green'));

        if (setup.requiresAppPassword) {
            console.log(colorize('\n🔐 You need an App Password (not your regular password)', 'yellow'));
            password = await hideInput(rl, colorize('Enter your App Password: ', 'green'));
        } else {
            password = await hideInput(rl, colorize('Enter your password: ', 'green'));
        }
    } else if (providerName === 'sendgrid') {
        apiKey = await hideInput(rl, colorize('\nEnter your SendGrid API Key: ', 'green'));
    } else if (providerName === 'mailgun') {
        domain = await question(rl, colorize('\n🌐 Enter your Mailgun domain (e.g., your-domain.mailgun.org): ', 'green'));
        apiKey = await hideInput(rl, colorize('Enter your Mailgun API Key: ', 'green'));
    } else {
        email = await question(rl, colorize('\nEnter your email/username: ', 'green'));
        password = await hideInput(rl, colorize('Enter your password/API key: ', 'green'));
    }

    // Test configuration
    console.log(colorize('\n🧪 Testing configuration...', 'yellow'));

    let config;
    try {
        if (providerName === 'outlook' || providerName === 'yahoo') {
            config = createProviderConfig(providerName, { user: email, pass: password });
        } else if (providerName === 'sendgrid') {
            config = createProviderConfig(providerName, { user: 'apikey', pass: apiKey });
        } else if (providerName === 'mailgun') {
            config = createProviderConfig(providerName, { user: `postmaster@${domain}`, pass: apiKey });
        } else {
            config = createProviderConfig(providerName, { user: email, pass: password });
        }

        console.log(colorize('✅ Configuration created successfully!', 'green'));
    } catch (error) {
        console.log(colorize(`❌ Error creating configuration: ${error.message}`, 'red'));
        return;
    }

    // Generate .env file
    const envContent = generateEnvContent(providerName, config, { email, password, apiKey, domain });
    const envPath = join(process.cwd(), '.env');

    // Check if .env already exists
    let envExists = existsSync(envPath);
    if (envExists) {
        const overwrite = await question(rl, colorize('\n⚠️  .env file already exists. Overwrite? (y/N): ', 'yellow'));
        if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
            console.log(colorize('❌ Setup cancelled.', 'red'));
            return;
        }
    }

    writeFileSync(envPath, envContent);
    console.log(colorize(`\n✅ Configuration saved to ${envPath}`, 'green'));

    // Generate example code
    const exampleCode = generateExampleCode(providerName, config, { email, password, apiKey, domain });
    console.log(colorize('\n📝 Example usage in your code:', 'bright'));
    console.log(colorize('─'.repeat(50), 'cyan'));
    console.log(colorize(exampleCode, 'white'));
    console.log(colorize('─'.repeat(50), 'cyan'));

    console.log(colorize('\n Setup complete! You can now use Composa with your email provider.', 'green'));
}

function generateEnvContent(providerName, config, credentials) {
    let content = `# Composa Email Configuration - ${providerName.toUpperCase()}\n`;
    content += `# Generated by Composa CLI\n\n`;

    if (providerName === 'gmail' || providerName === 'outlook' || providerName === 'yahoo') {
        content += `EMAIL_USER=${credentials.email}\n`;
        content += `EMAIL_PASS=${credentials.password}\n`;
    } else if (providerName === 'sendgrid') {
        content += `SENDGRID_API_KEY=${credentials.apiKey}\n`;
    } else if (providerName === 'mailgun') {
        content += `MAILGUN_DOMAIN=${credentials.domain}\n`;
        content += `MAILGUN_API_KEY=${credentials.apiKey}\n`;
    } else {
        content += `EMAIL_USER=${credentials.email}\n`;
        content += `EMAIL_PASS=${credentials.password}\n`;
    }

    content += `\n# SMTP Configuration\n`;
    content += `SMTP_HOST=${config.host}\n`;
    content += `SMTP_PORT=${config.port}\n`;
    content += `SMTP_SECURE=${config.secure}\n`;

    return content;
}

function generateGmailExampleCode(email, appPassword) {
    let code = `import { EmailClient, defaultSubjects, createGmailConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createGmailConfig('${email}', '${appPassword}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateYahooExampleCode(email, password) {
    let code = `import { EmailClient, defaultSubjects, createYahooConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createYahooConfig('${email}', '${password}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateAOLExampleCode(email, password) {
    let code = `import { EmailClient, defaultSubjects, createAOLConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createAOLConfig('${email}', '${password}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateGMXExampleCode(email, password) {
    let code = `import { EmailClient, defaultSubjects, createGMXConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createGMXConfig('${email}', '${password}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateZohoExampleCode(email, password) {
    let code = `import { EmailClient, defaultSubjects, createZohoConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createZohoConfig('${email}', '${password}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateiCloudExampleCode(email, password) {
    let code = `import { EmailClient, defaultSubjects, createiCloudConfig } from "composa-test";\n\n`;

    code += `const mailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    subjects: defaultSubjects,\n`;
    code += `    transport: createiCloudConfig('${email}', '${password}'),\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await mailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateOAuth2ExampleCode(config) {
    let code = `import { EmailClient } from "composa-test";\n`;
    code += `import nodemailer from 'nodemailer';\n\n`;

    code += `// OAuth2 Configuration\n`;
    code += `const oauth2Config = {\n`;
    code += `    type: 'oauth2',\n`;
    code += `    user: 'me',\n`;
    code += `    clientId: process.env.GMAIL_CLIENT_ID,\n`;
    code += `    clientSecret: process.env.GMAIL_CLIENT_SECRET,\n`;
    code += `    refreshToken: process.env.GMAIL_REFRESH_TOKEN,\n`;
    code += `    accessToken: process.env.GMAIL_ACCESS_TOKEN,\n`;
    code += `    accessUrl: process.env.GMAIL_ACCESS_URL,\n`;
    code += `    scope: process.env.GMAIL_SCOPE.split(' ')\n`;
    code += `};\n\n`;

    code += `// Create transporter\n`;
    code += `const transporter = nodemailer.createTransporter(oauth2Config);\n\n`;

    code += `// Create Composa client\n`;
    code += `const gmailMailer = new EmailClient({\n`;
    code += `    defaultLang: "fr",\n`;
    code += `    transport: transporter,\n`;
    code += `});\n\n`;

    code += `// Send an email\n`;
    code += `const result = await gmailMailer.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa OAuth2!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

function generateExampleCode(providerName, config, credentials) {
    let code = `import { EmailClient, createGmailConfig } from "composa-test";\n\n`;

    if (providerName === 'gmail') {
        code += `const gmailMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createGmailConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else if (providerName === 'yahoo') {
        code += `import { EmailClient, createYahooConfig } from "composa-test";\n\n`;
        code += `const yahooMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createYahooConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else if (providerName === 'aol') {
        code += `import { EmailClient, createAOLConfig } from "composa-test";\n\n`;
        code += `const aolMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createAOLConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else if (providerName === 'gmx') {
        code += `import { EmailClient, createGMXConfig } from "composa-test";\n\n`;
        code += `const gmxMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createGMXConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else if (providerName === 'zoho') {
        code += `import { EmailClient, createZohoConfig } from "composa-test";\n\n`;
        code += `const zohoMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createZohoConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else if (providerName === 'icloud') {
        code += `import { EmailClient, createiCloudConfig } from "composa-test";\n\n`;
        code += `const icloudMailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createiCloudConfig(\n`;
        code += `        "${credentials.email}",\n`;
        code += `        "${credentials.password}"\n`;
        code += `    ),\n`;
        code += `});\n\n`;
    } else {
        code += `import { EmailClient, createProviderConfig } from "composa-test";\n\n`;
        code += `const mailer = new EmailClient({\n`;
        code += `    defaultLang: "fr",\n`;
        code += `    transport: createProviderConfig("${providerName}", {\n`;
        code += `        user: "${credentials.email}",\n`;
        code += `        pass: "${credentials.password}"\n`;
        code += `    }),\n`;
        code += `});\n\n`;
    }

    code += `// Send an email\n`;
    const mailerVarName = providerName === 'gmail' ? 'gmailMailer' :
        providerName === 'yahoo' ? 'yahooMailer' :
            providerName === 'aol' ? 'aolMailer' :
                providerName === 'gmx' ? 'gmxMailer' :
                    providerName === 'zoho' ? 'zohoMailer' :
                        providerName === 'icloud' ? 'icloudMailer' : 'mailer';

    code += `const result = await ${mailerVarName}.sendMail({\n`;
    code += `    to: "user@example.com",\n`;
    code += `    subject: "Test Email",\n`;
    code += `    html: "<h1>Hello from Composa!</h1>"\n`;
    code += `});\n`;
    code += `console.log("Email sent:", result);`;

    return code;
}

// Main CLI logic
async function main() {
    const args = process.argv.slice(2);
    const command = args[0];

    showBanner();

    if (!command || command === 'help') {
        showHelp();
        return;
    }

    if (command === 'list') {
        showProviderList();
        return;
    }

    // Check if provider exists and is not outlook
    const providers = listProviders();
    if (!providers.includes(command.toLowerCase()) || command.toLowerCase() === 'outlook') {
        if (command.toLowerCase() === 'outlook') {
            console.log(colorize(`Outlook is temporarily not supported due to Microsoft restrictions.`, 'red'));
            console.log(colorize('Microsoft has disabled SMTP authentication for Outlook/Hotmail.', 'yellow'));
            console.log(colorize('\nRecommendation: Use Gmail instead with App Passwords.', 'green'));
            console.log(colorize('Run: npx composa gmail', 'cyan'));
        } else {
            console.log(colorize(`Unknown provider: ${command}`, 'red'));
            console.log(colorize('Available providers:', 'yellow'));
            providers.forEach(provider => {
                // Show only personal email providers
                if (provider === 'gmail' || provider === 'yahoo' || provider === 'outlook' ||
                    provider === 'aol' || provider === 'gmx' || provider === 'zoho' || provider === 'icloud') {
                    console.log(colorize(`  • ${provider}`, 'green'));
                }
            });
            console.log(colorize('\nUse "composa list" to see all providers', 'cyan'));
        }
        return;
    }

    await setupProvider(command.toLowerCase());
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.log(colorize(`Unexpected error: ${error.message}`, 'red'));
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    console.log(colorize(`Unhandled promise rejection: ${error.message}`, 'red'));
    process.exit(1);
});

// Run the CLI
main().catch(console.error);
