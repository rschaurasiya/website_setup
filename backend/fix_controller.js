const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'controllers', 'userController.js');

try {
    let content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    // We identified that duplicates start around line 574.
    // We want to keep lines 1 to 573.
    // And then we want the module.exports which starts around line 648.

    // Let's find the exact line numbers dynamically to be safe.

    // Find the end of reviewApplication
    let splitIndex = -1;
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('// @desc    Review Application')) {
            // Found start of reviewApplication.
            // Now find the end of this function.
            // It's irrelevant, we know the duplicates start *after* this function.
        }
        if (lines[i].includes('// @desc    Forgot Password') && i > 300) {
            // We know the *first* forgotPassword is around line 196. 
            // The *second* (duplicate) one is around 574.
            splitIndex = i;
            break;
        }
    }

    if (splitIndex === -1) {
        console.log('Could not find the duplicate Forgot Password block. Checking if already fixed.');
        // Verify if verifyOtp appears twice
        const matches = content.match(/const verifyOtp/g);
        if (matches && matches.length === 1) {
            console.log('File appears to be already fixed (only one verifyOtp found).');
            process.exit(0);
        } else {
            console.log('WARNING: Duplicate content structure unclear.');
        }
    } else {
        console.log(`Found duplicate block starting at line ${splitIndex + 1}`);

        // Now find where module.exports starts
        let exportsIndex = -1;
        for (let i = lines.length - 1; i > splitIndex; i--) {
            if (lines[i].trim().startsWith('module.exports = {')) {
                exportsIndex = i;
                break;
            }
        }

        if (exportsIndex === -1) {
            console.error('Could not find module.exports at the end.');
            process.exit(1);
        }

        console.log(`Found module.exports starting at line ${exportsIndex + 1}`);

        // Construct new content
        const newLines = [
            ...lines.slice(0, splitIndex),
            ...lines.slice(exportsIndex)
        ];

        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log('✅ userController.js fixed successfully.');
    }

} catch (err) {
    console.error('Error fixing file:', err);
    process.exit(1);
}
