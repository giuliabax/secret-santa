
import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Configurazione del trasportatore email
const createTransporter = () => {
    // Usa variabili d'ambiente se disponibili, altrimenti usa i valori hardcoded
    const emailUser = process.env.EMAIL_USER || 'giulibax@gmail.com';
    const emailPass = process.env.EMAIL_PASS || 'gbfe mlxa khod cwhe';
    
    if (!emailUser || !emailPass) {
        console.error('⚠️  ATTENZIONE: Credenziali email non configurate!');
        console.error('   Crea un file .env con EMAIL_USER e EMAIL_PASS');
    }
    
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'giulibax@gmail.com',
            pass: 'fnkh wnlc wmxz vnte' // App password di Gmail
        }
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
    
    const transporter = createTransporter();
    const results = [];
    
    for (const assignment of assignments) {
        const { santa, receiver } = assignment;
        
        const mailOptions = {
            from: 'giulibax@gmail.com',
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
                            È arrivato il momento tanto atteso! Quest'anno il tuo Secret Santa è...
                        </p>
                        
                        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 25px 0; text-align: center; border: 2px solid #fbbf24;">
                            <p style="font-size: 24px; font-weight: bold; color: #dc2626; margin: 0;">
                                🎁 ${receiver.name} 🎁
                            </p>
                        </div>
                        
                        <p style="font-size: 16px; color: #666; line-height: 1.6;">
                            Ricorda: questo è un segreto! Non rivelare a nessuno chi è il tuo Secret Santa. 🤫
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
            await transporter.sendMail(mailOptions);
            results.push({ 
                success: true, 
                santa: santa.name,
                receiver: receiver.name 
            });
            console.log(`✓ Email inviata a ${santa.name} (destinatario: ${receiver.name})`);
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
    res.json({ 
        success: true,
        message: `${successCount}/${assignments.length} email inviate con successo`,
        results 
    });
});

// Avvia il server
app.listen(PORT, () => {
    console.log(`🎅 Server Secret Santa avviato su http://localhost:${PORT}`);
    console.log(`📧 Pronto per inviare le email!`);
});