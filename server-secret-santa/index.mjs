
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import nodemailer from 'nodemailer';
import { writeFile } from 'fs/promises';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Transporter helper: preferisci usare variabili d'ambiente per il server SMTP
// If not provided, fall back to an Ethereal test account (development only).
const getTransporter = async () => {
    const emailHost = process.env.EMAIL_HOST;
    const emailPort = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : undefined;
    const emailSecure = process.env.EMAIL_SECURE === 'true';
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailHost && emailUser && emailPass) {
        // Use explicit SMTP settings from environment
        return nodemailer.createTransport({
            host: emailHost,
            port: emailPort || 587,
            secure: !!emailSecure,
            auth: { user: emailUser, pass: emailPass }
        });
    }

    // Otherwise create an Ethereal test account (no real emails sent)
    console.warn('⚠️  SMTP credentials not found in environment. Using Ethereal test account (dev only).');
    const testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal account created - preview emails at runtime.');
    return nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
    });
};

// Funzione per assegnare i Secret Santa
const assignSecretSanta = (participants) => {
    const receivers = [...participants];
    const assignments = [];
    
    for (const santa of participants) {
        // Trova un ricevente casuale che non sia il Secret Santa stesso
        let availableReceivers = receivers.filter(r => r.name !== santa.name);
        
        if (availableReceivers.length === 0) {
            return null; // Impossibile completare l'assegnazione
        }
        
        const randomIndex = Math.floor(Math.random() * availableReceivers.length);
        const receiver = availableReceivers[randomIndex];
        
        assignments.push({ santa, receiver });
        receivers.splice(receivers.indexOf(receiver), 1);
    }
    
    return assignments;
};

// Endpoint per generare le assegnazioni
app.post('/api/generate', (req, res) => {
    const { participants } = req.body;
    
    if (!participants || participants.length < 3) {
        return res.status(400).json({ 
            error: 'Servono almeno 3 partecipanti!' 
        });
    }
    
    let assignments = null;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!assignments && attempts < maxAttempts) {
        assignments = assignSecretSanta(participants);
        attempts++;
    }
    
    if (assignments) {
        res.json({ success: true, assignments });
    } else {
        res.status(500).json({ 
            error: 'Impossibile generare le assegnazioni' 
        });
    }
});

// Endpoint per inviare le email
app.post('/api/send-emails', async (req, res) => {
    const { assignments } = req.body;
    
    if (!assignments || assignments.length === 0) {
        return res.status(400).json({ 
            error: 'Nessuna assegnazione fornita' 
        });
    }
    
    const transporter = await getTransporter();
    const results = [];

    for (const assignment of assignments) {
        const { santa, receiver } = assignment;

        const mailOptions = {
            from: process.env.EMAIL_FROM || (process.env.EMAIL_USER || 'no-reply@example.com'),
            to: santa.email,
            subject: '🎅 Il tuo Secret Santa!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
                    <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                        <h1 style="margin: 0; font-size: 32px;">🎅 Secret Santa</h1>
                    </div>
                    
                    <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                        <p style="font-size: 18px; color: #333;">Ciao <strong>${santa.name}</strong>! 👋</p>
                        
                        <p style="font-size: 16px; color: #666; line-height: 1.6;">
                            È arrivato il momento tanto atteso! Quest'anno sei il Secret Santa di...
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #fbbf24;">
                            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">
                                🎁 ${receiver.name} 🎁
                            </p>
                        </div>
                        
                        <p style="font-size: 16px; color: #666; line-height: 1.6;">
                            Ricorda: questo è un segreto! 🤫
                        </p>
                        
                        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
                            <p style="font-size: 18px; color: #dc2626; font-weight: bold; margin: 10px 0;">
                                🎄 Buon divertimento e buon Natale! 🎄
                            </p>
                        </div>
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
                        <p>Questo è un messaggio automatico del Secret Santa Generator</p>
                    </div>
                </div>
            `
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            const preview = nodemailer.getTestMessageUrl(info);
            results.push({ 
                success: true, 
                santa: santa.name,
                receiver: receiver.name,
                preview: preview || null
            });
            console.log(`✓ Email inviata a ${santa.name} (destinatario: ${receiver.name})`);
            if (preview) console.log(`  › Preview URL: ${preview}`);
        } catch (error) {
            results.push({ 
                success: false, 
                santa: santa.name,
                error: error.message 
            });
            console.error(`✗ Errore invio email a ${santa.name}:`, error.message);
        }
    }
    
    const successCount = results.filter(r => r.success).length;

    // Persist assignments + results to assignments.json for later inspection
    try {
        const out = {
            timestamp: new Date().toISOString(),
            assignments,
            results
        };
        await writeFile(new URL('./assignments.json', import.meta.url), JSON.stringify(out, null, 2), 'utf8');
        console.log('Saved assignments and results to assignments.json');
    } catch (err) {
        console.error('Failed to write assignments.json:', err.message);
    }

    res.json({ 
        success: true,
        message: `${successCount}/${assignments.length} email inviate con successo`,
        results 
    });
});

// Endpoint per verificare la configurazione SMTP (non espone credenziali)
app.get('/api/verify-smtp', async (req, res) => {
    try {
        const transporter = await getTransporter();
        // transporter.verify will attempt to connect and authenticate
        await transporter.verify();
        return res.json({ success: true, message: 'SMTP verification succeeded' });
    } catch (err) {
        console.error('SMTP verification failed:', err && err.message ? err.message : err);
        return res.status(500).json({ success: false, error: 'SMTP verification failed', details: err && err.message ? err.message : String(err) });
    }
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`🎅 Server Secret Santa avviato su http://localhost:${PORT}`);
    console.log(`📧 Pronto per inviare le email!`);
});