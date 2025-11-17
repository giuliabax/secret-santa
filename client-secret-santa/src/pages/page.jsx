// src/pages/page.jsx

import { useState, useEffect } from 'react';
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
  const [step, setStep] = useState(1);
  const [numParticipants, setNumParticipants] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sendResults, setSendResults] = useState(null);

  // Prevent horizontal scroll on body
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    document.body.style.overflowY = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflowX = 'auto';
      document.body.style.overflowY = 'auto';
      document.documentElement.style.overflow = 'auto';
    };
  }, []);

  const handleNumberChange = (value) => {
    if (value === '' || value === null || typeof value === 'undefined') {
      setNumParticipants(0);
      setParticipants([]);
      return;
    }
    const parsed = parseInt(value, 10);
    const num = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    setNumParticipants(num);
    if (num > 0 && num <= MAX_PARTICIPANTS) {
      setParticipants(Array(num).fill().map(() => ({ name: '', email: '' })));
    } else {
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
    <div className="flex flex-col items-center justify-center w-full h-screen max-w-5xl mx-auto px-2 sm:px-4 overflow-hidden">
      
      <div className="relative w-full flex justify-center items-center h-full">
        <div className="relative w-full max-w-2xl flex items-center justify-center">
          
          {/* Santa: rimane centrato sopra la card */}
          <img
            src="/santa-claus.png"
            alt="Santa"
            className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out transform pointer-events-none ${step === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} -top-[13rem] sm:-top-32 md:-top-[20.5rem] ${step === 1 ? 'h-60 sm:h-28 md:h-96' : 'h-20 sm:h-28 md:h-96'} w-auto z-50`}
            style={{ zIndex: step === 1 ? 50 : 0 }}
          />

          {/* Rudolf sinistra */}
          <img
            src="/rudolf-sx.png"
            alt="Rudolf left"
            className={`absolute -top-10 sm:-top-8 md:-top-14 left-0 sm:left-2 object-contain transition-all duration-500 ease-in-out transform ${step === 2 ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 -translate-x-24'} w-24 sm:w-20 md:w-48 z-40`}
            style={{ zIndex: step === 2 ? 40 : 0 }}
          />

          {/* Rudolf destra */}
          <img
            src="/rudolf-dx.png"
            alt="Rudolf right"
            className={`absolute -top-10 sm:-top-8 md:-top-14 right-0 sm:right-2 object-contain transition-all duration-500 ease-in-out transform ${step === 2 ? 'opacity-100 translate-x-0 delay-300' : 'opacity-0 translate-x-24'} w-24 sm:w-20 md:w-48 z-40`}
            style={{ zIndex: step === 2 ? 40 : 0 }}
          />

          {/* Card centrata */}
          <Card
            className={`w-full max-w-[calc(100vw-1rem)] sm:max-w-md md:max-w-xl shadow-lg mx-auto relative transform transition-all duration-500 origin-top z-30 max-h-[80vh] ${
              step === 2
                ? '-translate-y-12 sm:translate-y-0 md:-translate-y-10'
                : step === 3
                ? '-translate-y-12 sm:translate-y-0 md:-translate-y-10'
                : ''
            }`}
          >
        
            <CardHeader className="text-center pb-4">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-primary mb-3">
                <Gift className="h-5 w-5 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl font-bold">Secret Santa</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Inizia selezionando il numero di partecipanti!</CardDescription>
            </CardHeader>

            {/* --- STEP 1: SELEZIONA NUMERO --- */}
            {step === 1 && (
              <CardContent className="space-y-4 pb-6">
                <div className="space-y-2">
                  <Label htmlFor="num-participants" className="text-base">
                    Quanti partecipano?
                  </Label>
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
                    <p className="text-xs text-red-500">Devi inserire almeno 3 partecipanti.</p>
                  )}
                  {numParticipants > MAX_PARTICIPANTS && (
                    <p className="text-xs text-red-500">Numero massimo partecipanti: {MAX_PARTICIPANTS}.</p>
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
                <CardContent className="space-y-4 max-h-[55vh] overflow-y-auto pr-2 pb-4">
                  <h3 className="text-base font-semibold text-center sticky top-0 bg-card pb-2 z-10">
                    Inserisci i {numParticipants} partecipanti
                  </h3>
                  {participants.map((p, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <h4 className="font-medium text-sm">Partecipante {index + 1}</h4>
                      <div className="space-y-1">
                        <Label htmlFor={`name-${index}`} className="text-xs">Nome</Label>
                        <Input
                          id={`name-${index}`}
                          placeholder="Nome"
                          value={p.name}
                          onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`email-${index}`} className="text-xs">Email</Label>
                        <Input
                          id={`email-${index}`}
                          type="email"
                          placeholder="Email"
                          value={p.email}
                          onChange={(e) => handleParticipantChange(index, 'email', e.target.value)}
                          className="h-9"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex-col gap-3 pt-4">
                  <Button
                    className="w-full"
                    size="default"
                    onClick={handleRunLottery}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Invia Mail
                  </Button>
                  <Button variant="link" size="sm" onClick={() => setStep(1)}>
                    Torna indietro
                  </Button>
                </CardFooter>
              </>
            )}

            {/* --- STEP 3: CONFERMA INVIO --- */}
            {step === 3 && (
              <>
                <CardContent className="py-8 flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold">Mail inviate con successo</h3>
                  {sendResults && sendResults.message && (
                    <p className="text-xs text-muted-foreground text-center">{sendResults.message}</p>
                  )}
                </CardContent>
                <CardFooter className="flex-col gap-3 pt-2">
                  <Button
                    className="w-full"
                    size="default"
                    onClick={() => {
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
      
      {/* Footer fisso in basso */}
      <div className="absolute bottom-2 text-s text-gray-500 flex items-center gap-2 justify-center">
        <span>Realized by Giulia Bax</span>
        <a
          href="https://github.com/giuliabax"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-900 transition-colors"
          aria-label="GitHub profile of Giulia Bax"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.744.083-.729.083-.729 1.205.085 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.76-1.605-2.665-.305-5.467-1.332-5.467-5.93 0-1.31.468-2.381 1.235-3.221-.135-.303-.54-1.526.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.65.24 2.873.12 3.176.765.84 1.23 1.911 1.23 3.221 0 4.61-2.805 5.625-5.475 5.92.435.375.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
        </a>
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