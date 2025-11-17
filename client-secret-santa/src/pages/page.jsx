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
import { Send, Gift, Loader2, Users, ArrowRight, Check, InfoIcon } from 'lucide-react';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// URL del tuo server backend Express
const BACKEND_URL = 'http://localhost:3000';
const MAX_PARTICIPANTS = 20;

export default function HomePage() {
  // ... [Tutta la tua logica JS rimane identica] ...
  const [step, setStep] = useState(1);
  const [numParticipants, setNumParticipants] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  const handleNumberChange = (value) => {
    // Allow clearing the input
    if (value === '' || value === null || typeof value === 'undefined') {
      setNumParticipants(0);
      setParticipants([]);
      return;
    }
    const parsed = parseInt(value, 10);
    const num = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    // Allow the user to enter numbers greater than MAX_PARTICIPANTS, but only
    // create the participants array when the number is within the allowed range.
    setNumParticipants(num);
    if (num > 0 && num <= MAX_PARTICIPANTS) {
      setParticipants(Array(num).fill().map(() => ({ name: '', email: '' })));
    } else {
      // don't create a huge participants array when the user types an out-of-range number
      setParticipants([]);
    }
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
    if (numParticipants > MAX_PARTICIPANTS) {
      toast.error(`Numero massimo partecipanti: ${MAX_PARTICIPANTS}.`);
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
      // Show success step with results; allow user to return to start manually
      setSendResults(sendData);
      setStep(3);
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

      {/* Immagini e Card: contenitore relativo per piazzare Rudolf negli angoli superiori della card */}
      <div className="relative w-full flex justify-center -mb-14">
        <div className="relative w-full max-w-2xl flex items-start justify-center">
          {/* Santa: rimane centrato sopra la card e si nasconde sotto la card allo step 2 */}
          <img
            src="/santa-claus.png"
            alt="Santa"
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out transform pointer-events-none ${step === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} top-[-6.5rem] md:top-[-13.5rem] h-44 md:h-[24rem] w-auto`}
            style={{ zIndex: step === 1 ? 50 : 0 }}
          />

          {/* Rudolf sinistra: entra da sinistra verso l'angolo superiore sinistro della card */}
          <img
            src="/rudolf-sx.png"
            alt="Rudolf left"
            className={`absolute -top-4 left-0 sm:left-4 object-contain transition-all duration-500 ease-in-out transform ${step === 2 ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 -translate-x-24'} w-28 sm:w-40`}
            style={{ zIndex: step === 2 ? 40 : 0 }}
          />

          {/* Rudolf destra: entra da destra verso l'angolo superiore destro della card */}
          <img
            src="/rudolf-dx.png"
            alt="Rudolf right"
            className={`absolute -top-4 right-0 sm:right-4 object-contain transition-all duration-500 ease-in-out transform ${step === 2 ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 translate-x-24'} w-28 sm:w-40`}
            style={{ zIndex: step === 2 ? 40 : 0 }}
          />

    {/* Card centrata */}
          <Card className={`w-full max-w-md md:max-w-2xl shadow-lg mx-auto relative transform transition-all duration-500 origin-top ${step === 1 ? 'translate-y-12 md:translate-y-28' : 'translate-y-8 md:translate-y-12'} ${step === 2 ? 'md:scale-105 scale-100' : 'scale-100'}`} style={{ zIndex: 30 }}>
        
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
                  {/* <Select value={numParticipants ? numParticipants.toString() : undefined} onValueChange={handleNumberChange}>
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
              </Select> */}
                <InputGroup>
                  <InputGroupInput
                    type="number"
                    min={3}
                    max={MAX_PARTICIPANTS}
                    placeholder="partecipanti"
                    className="!pl-1"
                    value={numParticipants || ''}
                    onChange={(e) => handleNumberChange(e.target.value)}
                  />
                  <InputGroupAddon>
                    <InputGroupText>n.</InputGroupText>
                  </InputGroupAddon>
                  <InputGroupAddon align="inline-end">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <InputGroupButton className="rounded-full" size="icon-xs">
                          <InfoIcon />
                        </InputGroupButton>
                      </TooltipTrigger>
                      <TooltipContent>Inserisci un numero tra 3 e {MAX_PARTICIPANTS}</TooltipContent>
                    </Tooltip>
                  </InputGroupAddon>
                </InputGroup>
                {numParticipants > 0 && numParticipants < 3 && (
                  <p className="text-sm text-red-500 mt-2">Devi inserire almeno 3 partecipanti.</p>
                )}
                {numParticipants > MAX_PARTICIPANTS && (
                  <p className="text-sm text-red-500 mt-2">Numero massimo partecipanti: {MAX_PARTICIPANTS}.</p>
                )}
            </div>
            <Button onClick={goToStep2} className="w-full" size="lg" disabled={numParticipants < 3 || numParticipants > MAX_PARTICIPANTS}>
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

        {/* --- STEP 3: CONFERMA INVIO --- */}
        {step === 3 && (
          <>
            <CardContent className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="p-4 rounded-full bg-green-100 text-green-600">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-semibold">Mail inviate con successo</h3>
              {sendResults && sendResults.message && (
                <p className="text-sm text-muted-foreground">{sendResults.message}</p>
              )}
            </CardContent>
            <CardFooter className="flex-col gap-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => {
                  // Reset to initial state
                  setStep(1);
                  setNumParticipants(0);
                  setParticipants([]);
                  setSendResults(null);
                }}
              >
                Torna all'inizio
              </Button>
            </CardFooter>
          </>
        )}
          </Card>
        </div>
      </div>
      <div className="fixed bottom-4 text-sm text-gray-500 flex items-center gap-2">
        <span>Realized by Giulia Bax</span>
        {/* LinkedIn icon: update the href if you want a different profile URL */}
        <a
          href="https://www.linkedin.com/in/giulia-bax-31014a239?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="LinkedIn profile of Giulia Bax"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.3c-1 0-1.8-0.8-1.8-1.8s0.8-1.8 1.8-1.8c1 0 1.8 0.8 1.8 1.8s-0.8 1.8-1.8 1.8zm13.5 10.3h-3v-4.5c0-1.1-0.9-2-2-2s-2 0.9-2 2v4.5h-3v-9h3v1.2c0.8-0.9 2.1-1.7 3.8-1.7 2.5 0 4.2 1.6 4.2 5v4.5z" />
          </svg>
        </a>
      </div>
    </div>
  );
}