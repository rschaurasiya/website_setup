const db = require('../db');

const restoreData = async () => {
    try {
        console.log("--- RESTORING DATA ---");

        // 1. Restore Team Members (if empty)
        const teamCheck = await db.query("SELECT COUNT(*) FROM team_members");
        if (teamCheck.rows[0].count == 0) {
            console.log("Restoring Team Members...");
            await db.query(`
                INSERT INTO team_members (name, role, image_url, bio) VALUES 
                ('Chand Chaurasiya', 'Founder & Lead Attorney', '/uploads/team1.jpg', 'Expert in criminal law with 15 years experience.'),
                ('An Aspirant', 'Associate Editor', '/uploads/team2.jpg', 'Specializing in constitutional law and research.')
            `);
            console.log("✅ Team Members Restored");
        } else {
            console.log("Team members already exist.");
        }

        // 2. Restore About Page (if empty)
        const aboutCheck = await db.query("SELECT COUNT(*) FROM about_page");
        if (aboutCheck.rows[0].count == 0) {
            console.log("Restoring About Page...");
            await db.query(`
                INSERT INTO about_page (title, content, image_url) VALUES 
                ('About LawBlog', 'We are dedicated to providing the best legal insights and resources.', '/uploads/about.jpg')
            `);
            console.log("✅ About Page Restored");
        } else {
            console.log("About page already exists.");
        }

        // 3. Fix Admin User (Ensure firebase_uid matches if needed, though login handles it)
        // Just ensuring admin exists and is not blocked
        await db.query("UPDATE users SET is_blocked = false WHERE role = 'admin'");
        console.log("✅ Admin Unblocked (Safety Check)");

        process.exit();
    } catch (err) {
        console.error("RESTORE ERROR:", err);
        process.exit(1);
    }
};

restoreData();
