// src/pages/page.jsx

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Gift, Loader2, Users, ArrowRight } from 'lucide-react';

// URL del tuo server backend Express
const BACKEND_URL = 'http://localhost:3001';
const MAX_PARTICIPANTS = 20;

export default function HomePage() {
  // ... [Tutta la tua logica JS rimane identica] ...
  const [step, setStep] = useState(1);
  const [numParticipants, setNumParticipants] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNumberChange = (value) => {
    const num = parseInt(value, 10);
    setNumParticipants(num);
    setParticipants(
      Array(num)
        .fill()
        .map(() => ({ name: '', email: '' }))
    );
  };

  const handleParticipantChange = (index, field, value) => {
    const newParticipants = [...participants];
    newParticipants[index][field] = value;
    setParticipants(newParticipants);
  };

  const goToStep2 = () => {
    if (numParticipants < 3) {
      toast.error('Devi selezionare almeno 3 partecipanti.');
      return;
    }
    setStep(2);
  };

  const handleRunLottery = async () => {
    // Validazione dei campi
    for (const p of participants) {
      if (!p.name || !p.email || !p.email.includes('@')) {
        toast.error("Controlla tutti i campi. Manca un nome o un'email non è valida.");
        return;
      }
    }

    const emails = participants.map((p) => p.email);
    const hasDuplicates = new Set(emails).size !== emails.length;
    if (hasDuplicates) {
      toast.error("Non puoi inserire la stessa email più volte.");
      return;
    }

    setIsLoading(true);
    try {
      const generateResponse = await fetch(`${BACKEND_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants }),
      });
      const generateData = await generateResponse.json();
      if (!generateResponse.ok) throw new Error(generateData.error);
      const { assignments } = generateData;
      toast.info('Coppie generate! Ora invio le email...');

      const sendResponse = await fetch(`${BACKEND_URL}/api/send-emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignments }),
      });
      const sendData = await sendResponse.json();
      if (!sendResponse.ok) throw new Error(sendData.error);
      toast.success(sendData.message || 'Email inviate con successo! 🎅');

      // Reset
      setStep(1);
      setNumParticipants(0);
      setParticipants([]);
    } catch (error) {
      console.error('Errore nel processo:', error);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  // --- RENDER ---
  return (
    // Contenitore principale: immagine sopra la card, card centrata
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto -mt-48 py-8">

      {/* Immagine sovrapposta alla card */}
      <div className="-mb-14 z-10">
        <img
          src="/santa-claus.png"
          alt="Illustrazione Secret Santa"
          className="w-64 md:w-80 lg:w-96 object-contain mx-auto"
        />
      </div>

      {/* Card centrata */}
      <Card className="w-full max-w-2xl shadow-lg mx-auto relative">
        
        <CardHeader className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary mb-4">
            <Gift className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl font-bold">Secret Santa</CardTitle>
          <CardDescription className="text-sm">Inizia selezionando il numero di partecipanti!</CardDescription>
        </CardHeader>

        {/* --- STEP 1: SELEZIONA NUMERO --- */}
        {step === 1 && (
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="num-participants" className="text-lg">
                Quanti partecipano?
              </Label>
              <Select onValueChange={handleNumberChange}>
                <SelectTrigger id="num-participants" className="w-full text-base py-6">
                  <SelectValue placeholder="Seleziona un numero..." />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: MAX_PARTICIPANTS - 2 }, (_, i) => i + 3).map(
                    (num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} partecipanti
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={goToStep2} className="w-full" size="lg" disabled={numParticipants < 3}>
              Prosegui <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        )}

        {/* --- STEP 2: INSERISCI DATI --- */}
        {step === 2 && (
          <>
            <CardContent className="space-y-6 max-h-[30vh] md:max-h-[30vh] overflow-y-auto pr-3">
              <h3 className="text-lg font-semibold text-center">
                Inserisci i {numParticipants} partecipanti
              </h3>
              {participants.map((p, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">Partecipante {index + 1}</h4>
                  <div className="space-y-1">
                    <Label htmlFor={`name-${index}`}>Nome</Label>
                    <Input
                      id={`name-${index}`}
                      placeholder="Nome"
                      value={p.name}
                      onChange={(e) =>
                        handleParticipantChange(index, 'name', e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`email-${index}`}>Email</Label>
                    <Input
                      id={`email-${index}`}
                      type="email"
                      placeholder="Email"
                      value={p.email}
                      onChange={(e) =>
                        handleParticipantChange(index, 'email', e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button
                className="w-full text-lg"
                size="lg"
                onClick={handleRunLottery}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Send className="mr-2 h-5 w-5" />
                )}
                Invia Mail
              </Button>
              <Button variant="link" onClick={() => setStep(1)}>
                Torna indietro
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* 'by Ciambelle' in basso a destra della pagina */}
      <div className="fixed bottom-4 right-4 text-sm text-gray-500">by Ciambelle</div>
    </div>
  );
}