import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Phone,
  MoreVertical,
  CheckCheck,
  Play,
  Pause,
  AlertCircle,
  FileText,
  Volume2,
  RefreshCw,
  Sparkles,
  Hammer,
  Scissors,
  Apple,
  Utensils,
  ShoppingBag,
  RotateCcw
} from 'lucide-react';
import { BusinessOwner, NluParseResult, BusinessTradeCategory } from '../types';

interface WhatsAppSimulatorProps {
  businesses: BusinessOwner[];
  selectedBusiness: BusinessOwner;
  setSelectedBusiness: (b: BusinessOwner) => void;
  onOrderCreated?: () => void;
  onAgreementConfirmed?: () => void;
  onOpenAgreementsTab: () => void;
}

interface MessageBubble {
  id: string;
  sender: 'trader' | 'agent';
  text: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
  quickReplies?: { title: string; payload: string }[];
  isAgreementNotice?: boolean;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  businesses,
  selectedBusiness,
  setSelectedBusiness,
  onOrderCreated,
  onAgreementConfirmed,
  onOpenAgreementsTab
}) => {
  const [messages, setMessages] = useState<MessageBubble[]>([]);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastNluResult, setLastNluResult] = useState<NluParseResult | null>(null);

  // M-PESA STK Push Dialog State on Phone Screen
  const [stkDialog, setStkDialog] = useState<{
    visible: boolean;
    checkoutRequestId: string;
    amount: number;
    title: string;
    prompt: string;
    pin: string;
    status: 'idle' | 'processing' | 'success' | 'failed';
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTraderSession(selectedBusiness.phone);
  }, [selectedBusiness.phone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stkDialog]);

  const loadTraderSession = async (phone: string) => {
    try {
      const res = await fetch(`/api/chat/session/${encodeURIComponent(phone)}`);
      if (res.ok) {
        const session = await res.json();
        if (session.history && session.history.length > 0) {
          const formatted: MessageBubble[] = session.history.map((h: any, i: number) => ({
            id: `msg-${i}`,
            sender: h.role === 'trader' ? 'trader' : 'agent',
            text: h.text,
            timestamp: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }));
          setMessages(formatted);
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load session from server:', e);
    }

    setMessages([
      {
        id: 'msg-0',
        sender: 'agent',
        text: `Habari ${selectedBusiness.ownerName}! Mimi ni Soko Smart, mratibu wako wa ununuzi wa pamoja wa bidhaa za jumla.\n\nNiambie nini unahitaji leo kwa ajili ya ${selectedBusiness.businessName} (kwa mfano kuandika au kutuma sauti).`,
        timestamp: '07:30 AM'
      }
    ]);
  };

  const handleResetSession = async () => {
    try {
      const res = await fetch(`/api/chat/reset/${encodeURIComponent(selectedBusiness.phone)}`, {
        method: 'POST'
      });
      if (res.ok) {
        loadTraderSession(selectedBusiness.phone);
        setLastNluResult(null);
      }
    } catch (err) {
      console.error('Reset error:', err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: MessageBubble = {
      id: `msg-${Date.now()}-t`,
      sender: 'trader',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedBusiness.phone,
          text: text.trim()
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLastNluResult(data.nlu);

        const agentMessage: MessageBubble = {
          id: `msg-${Date.now()}-a`,
          sender: 'agent',
          text: data.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          quickReplies: data.quickReplies
        };

        setMessages(prev => [...prev, agentMessage]);

        if (data.triggerStkPush) {
          setTimeout(() => {
            triggerMpesaPrompt(data.stkAmount || 6600);
          }, 800);
          onAgreementConfirmed?.();
        }

        if (data.nlu?.intent === 'place_order') {
          onOrderCreated?.();
        }
      }
    } catch (err) {
      console.error('Send error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMpesaPrompt = async (amount: number) => {
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          phone: selectedBusiness.phone,
          amountKsh: amount,
          purpose: 'trader_pool_collection',
          agreementId: 'SK254-MKD-HW-260929-01'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStkDialog({
          visible: true,
          checkoutRequestId: data.checkoutRequestId,
          amount: amount,
          title: 'SIM TOOLKIT · M-PESA',
          prompt: `Do you want to pay KSh ${amount.toLocaleString()} to SOKO SMART TILL 400200 for Pooled Bulk Order?`,
          pin: '',
          status: 'idle'
        });
      }
    } catch (err) {
      console.error('STK push error:', err);
    }
  };

  const handleStkPinSubmit = async () => {
    if (!stkDialog || !stkDialog.pin || stkDialog.pin.length < 4) return;
    setStkDialog(prev => prev ? { ...prev, status: 'processing' } : null);

    try {
      const res = await fetch('/api/mpesa/simulate-phone-stk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkoutRequestId: stkDialog.checkoutRequestId,
          pin: stkDialog.pin,
          action: 'submit'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStkDialog(prev => prev ? { ...prev, status: 'success' } : null);

        setTimeout(() => {
          setStkDialog(null);
          setMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}-receipt`,
              sender: 'agent',
              text: `✅ MALIPO YAMEPOKELEWA!\n\nStakabadhi ya M-PESA: ${data.tx.mpesaReceiptNumber}\nKiasi: KSh ${stkDialog.amount.toLocaleString()}\nKutoka: ${selectedBusiness.phone}\nKuelekea: Soko Smart Escrow Suspense.\n\nMzigo wako unaletwa Hamza Central Staging Hub kesho asubuhi. Ujumbe wa nambari ya lori utatumwa hapa.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1200);
      }
    } catch (err) {
      console.error('PIN submit error:', err);
      setStkDialog(prev => prev ? { ...prev, status: 'failed' } : null);
    }
  };

  const handleAudioSample = async (sampleId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/speech/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sampleId })
      });

      if (res.ok) {
        const data = await res.json();
        const userAudioMsg: MessageBubble = {
          id: `msg-${Date.now()}-voice`,
          sender: 'trader',
          text: `🎙️ Sauti: "${data.transcription}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAudio: true,
          audioDuration: '0:07'
        };
        setMessages(prev => [...prev, userAudioMsg]);

        const chatRes = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: selectedBusiness.phone,
            text: data.transcription
          })
        });

        if (chatRes.ok) {
          const chatData = await chatRes.json();
          setLastNluResult(chatData.nlu);
          setMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}-agent-resp`,
              sender: 'agent',
              text: chatData.replyText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              quickReplies: chatData.quickReplies
            }
          ]);
          if (chatData.nlu?.intent === 'place_order') {
            onOrderCreated?.();
          }
        }
      }
    } catch (err) {
      console.error('Audio sample error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateBrowserVoice = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      handleAudioSample(
        selectedBusiness.category === 'hardware'
          ? 'sample_hardware_cement'
          : selectedBusiness.category === 'salon_beauty'
          ? 'sample_salon_braids'
          : 'sample_tailoring_kanga'
      );
    }, 1800);
  };

  const getTradeBadge = (cat: BusinessTradeCategory) => {
    switch (cat) {
      case 'hardware':
        return { label: 'Hardware', color: 'bg-amber-100 text-amber-900 border-amber-300', icon: Hammer };
      case 'salon_beauty':
        return { label: 'Salon & Beauty', color: 'bg-pink-100 text-pink-900 border-pink-300', icon: Sparkles };
      case 'tailoring_textiles':
        return { label: 'Tailoring', color: 'bg-purple-100 text-purple-900 border-purple-300', icon: Scissors };
      case 'produce_kiosk':
        return { label: 'Mama Mboga', color: 'bg-emerald-100 text-emerald-900 border-emerald-300', icon: Apple };
      case 'kibanda_food':
        return { label: 'Food Kibanda', color: 'bg-orange-100 text-orange-900 border-orange-300', icon: Utensils };
      default:
        return { label: cat, color: 'bg-stone-100 text-stone-800 border-stone-300', icon: ShoppingBag };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Trade Persona Switcher & Sheng Voice Tester */}
      <div className="lg:col-span-4 space-y-4">
        {/* Trade Persona Selector Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Trader Persona Switcher
            </span>
            <span className="text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
              Kenya Multi-Trade
            </span>
          </div>

          <label className="block text-xs text-stone-600 mb-1.5 font-medium">
            Select Active Small Business Owner:
          </label>
          <div className="space-y-2">
            {businesses.map(b => {
              const isSelected = b.id === selectedBusiness.id;
              const badge = getTradeBadge(b.category);
              const IconComp = badge.icon;

              return (
                <button
                  key={b.id}
                  onClick={() => setSelectedBusiness(b)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-stone-900">{b.ownerName}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex items-center gap-1 ${badge.color}`}>
                      <IconComp className="w-3 h-3" />
                      {badge.label}
                    </span>
                  </div>
                  <div className="text-xs text-stone-700 font-medium mt-0.5">
                    {b.businessName}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-1 flex items-center justify-between">
                    <span>{b.locationDesc}</span>
                    <span className="font-mono text-stone-400">{b.phone}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Voice Note Audio Testing Deck */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-800" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Voice Ingestion by Trade (Sheng / Swahili)
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mb-3">
            Traders on market stalls use quick audio notes. Test Soko Smart's domain speech recognition:
          </p>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => handleAudioSample('sample_hardware_cement')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-amber-200 bg-amber-50/30 hover:bg-amber-50 transition-colors flex items-start gap-2.5"
            >
              <Play className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 block">Hardware Audio (John Kamau)</span>
                <span className="text-amber-800 italic text-[11px]">
                  "Niaje Soko Smart, nataka mifuko 20 ya saruji simiti Bamburi..."
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAudioSample('sample_salon_braids')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-pink-200 bg-pink-50/30 hover:bg-pink-50 transition-colors flex items-start gap-2.5"
            >
              <Play className="w-3.5 h-3.5 text-pink-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-pink-950 block">Salon Audio (Grace Wanjiru)</span>
                <span className="text-pink-800 italic text-[11px]">
                  "Habari Soko Smart. Nahitaji carton 1 ya Darling Abuja braids..."
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAudioSample('sample_tailoring_kanga')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50/30 hover:bg-purple-50 transition-colors flex items-start gap-2.5"
            >
              <Play className="w-3.5 h-3.5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-purple-950 block">Tailoring Audio (Mercy Achieng)</span>
                <span className="text-purple-800 italic text-[11px]">
                  "Hallow, nataka roli 3 za kitambaa cha kanga na uzi wa mashine..."
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAudioSample('sample_dispute_hardware')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-colors flex items-start gap-2.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-rose-950 block">Dispute Audio ("TATIZO")</span>
                <span className="text-rose-800 italic text-[11px]">
                  "Hallow Soko Smart, TATIZO. Mabati matatu tuliyoshusha yamepondoka..."
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Live NLU Schema Inspector */}
        {lastNluResult && (
          <div className="bg-stone-900 text-stone-200 rounded-xl p-4 text-xs font-mono shadow-xs border border-stone-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Soko Smart NLU Schema Output
              </span>
              <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">
                {(lastNluResult.confidence * 100).toFixed(0)}% Conf
              </span>
            </div>
            <div className="space-y-1">
              <div>
                <span className="text-stone-400">Intent: </span>
                <span className="text-amber-300 font-bold">{lastNluResult.intent}</span>
              </div>
              <div>
                <span className="text-stone-400">Inferred Category: </span>
                <span className="text-emerald-300 font-semibold">{lastNluResult.inferredCategory || 'general'}</span>
              </div>
              {lastNluResult.extractedEntities.map((ent, idx) => (
                <div key={idx} className="bg-stone-800/80 p-2 rounded mt-1 text-[11px]">
                  <div className="text-white font-medium">{ent.productName}</div>
                  <div className="text-stone-300">
                    {ent.quantity} {ent.unit} (~{ent.normalizedBaseQty} base)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: High-Fidelity WhatsApp Phone Simulation */}
      <div className="lg:col-span-8 flex justify-center">
        <div className="w-full max-w-[440px] bg-[#111B21] rounded-[38px] p-3 shadow-2xl border-4 border-stone-800 relative overflow-hidden">
          {/* Phone Speaker Notch */}
          <div className="w-28 h-4 bg-stone-950 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-8 h-1 bg-stone-800 rounded-full"></div>
          </div>

          {/* WhatsApp Interface Container */}
          <div className="bg-[#EFEAE2] rounded-[24px] overflow-hidden flex flex-col h-[690px] relative shadow-inner">
            {/* WhatsApp App Header */}
            <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-950 border border-emerald-400/50 flex items-center justify-center font-bold text-xs text-emerald-200 shadow-inner">
                  SS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-[15px] leading-tight text-white tracking-wide">
                      Soko Smart
                    </span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
                  </div>
                  <span className="text-[11px] text-emerald-100/90 block leading-tight">
                    Msaidizi wa Ununuzi wa Pamoja
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <button
                  onClick={handleResetSession}
                  title="Reset Chat Session"
                  className="p-1 hover:text-white transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[radial-gradient(#d4cbbe_1px,transparent_1px)] [background-size:16px_16px]">
              <div className="text-center my-1">
                <span className="bg-[#FFF4C7] text-[#54656F] text-[10px] px-2.5 py-1 rounded-md shadow-2xs inline-block max-w-[90%]">
                  🔒 Soko Smart B2B Pooling Gateway · Safaricom M-PESA Daraja Certified
                </span>
              </div>

              {messages.map(msg => {
                const isTrader = msg.sender === 'trader';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isTrader ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs shadow-2xs leading-relaxed ${
                        isTrader
                          ? 'bg-[#E7FFDB] text-[#111B21] rounded-tr-none'
                          : 'bg-white text-[#111B21] rounded-tl-none'
                      }`}
                    >
                      {msg.isAudio ? (
                        <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
                          <button
                            onClick={() =>
                              setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id)
                            }
                            className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0"
                          >
                            {isPlayingAudio === msg.id ? (
                              <Pause className="w-3.5 h-3.5" />
                            ) : (
                              <Play className="w-3.5 h-3.5 ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1">
                            <div className="h-1 bg-emerald-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-emerald-600 transition-all ${
                                  isPlayingAudio === msg.id ? 'w-full duration-3000' : 'w-1/3'
                                }`}
                              ></div>
                            </div>
                            <span className="text-[10px] text-stone-500 mt-1 block">
                              {msg.audioDuration || '0:07'} · Voice Note
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">{msg.text}</div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-400">
                        <span>{msg.timestamp}</span>
                        {isTrader && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>

                    {/* Quick Reply Chips */}
                    {msg.quickReplies && msg.quickReplies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[85%]">
                        {msg.quickReplies.map((qr, qidx) => (
                          <button
                            key={qidx}
                            onClick={() => handleSendMessage(qr.title)}
                            className="bg-white border border-[#008069] text-[#008069] text-[11px] font-medium px-2.5 py-1 rounded-full shadow-2xs hover:bg-emerald-50 active:scale-95 transition-all"
                          >
                            {qr.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-white rounded-lg px-3 py-2 text-xs text-stone-500 italic shadow-2xs flex items-center gap-1.5">
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                    <span>Soko Smart anajibu...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Simulated Live Safaricom STK Push Dialog Overlay */}
            {stkDialog && stkDialog.visible && (
              <div className="absolute inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-[320px] bg-[#004D25] text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-400">
                  <div className="text-center pb-2 border-b border-emerald-700/60 mb-3">
                    <span className="font-bold tracking-widest text-xs text-emerald-300">
                      SAFARICOM M-PESA
                    </span>
                    <p className="text-[11px] text-emerald-100 font-semibold mt-0.5">
                      LIPA NA M-PESA ONLINE
                    </p>
                  </div>

                  <p className="text-xs text-emerald-50 mb-3 leading-relaxed">
                    {stkDialog.prompt}
                  </p>

                  {stkDialog.status === 'processing' ? (
                    <div className="py-4 text-center space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-emerald-300 mx-auto" />
                      <p className="text-xs text-emerald-200">
                        Inathibitisha PIN na Safaricom...
                      </p>
                    </div>
                  ) : stkDialog.status === 'success' ? (
                    <div className="py-3 text-center text-emerald-200 font-semibold text-xs">
                      ✅ PIN Imekubaliwa! Amana ya Escrow Imelipwa.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-[11px] text-emerald-200 mb-1 font-mono">
                          Enter 4-Digit M-PESA PIN:
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={stkDialog.pin}
                          onChange={e =>
                            setStkDialog(prev => prev ? { ...prev, pin: e.target.value } : null)
                          }
                          placeholder="••••"
                          className="w-full bg-[#00381B] border border-emerald-500 rounded-lg px-3 py-2 text-center text-lg tracking-widest font-mono text-white focus:outline-none focus:ring-2 focus:ring-emerald-300"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                        <button
                          onClick={() => setStkDialog(null)}
                          className="py-2 rounded-lg bg-emerald-900 text-emerald-200 hover:bg-emerald-800 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleStkPinSubmit}
                          disabled={!stkDialog.pin || stkDialog.pin.length < 4}
                          className="py-2 rounded-lg bg-emerald-400 text-stone-950 font-bold hover:bg-emerald-300 disabled:opacity-50 transition-colors shadow-sm"
                        >
                          Send / Lipa
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Quick Action Chips by Selected Trade */}
            <div className="bg-[#F0F2F5] px-2 py-1.5 border-t border-stone-200 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => handleSendMessage('Hi')}
                className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700 font-medium"
              >
                👋 "Hi" (Onboarding)
              </button>
              {selectedBusiness.category === 'hardware' && (
                <button
                  onClick={() => handleSendMessage('Nahitaji mifuko 20 ya saruji Bamburi')}
                  className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                >
                  🧱 20 Mifuko Saruji
                </button>
              )}
              {selectedBusiness.category === 'salon_beauty' && (
                <button
                  onClick={() => handleSendMessage('Carton 1 ya Darling Abuja braids #1')}
                  className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                >
                  💇‍♀️ 1 Carton Braids
                </button>
              )}
              {selectedBusiness.category === 'tailoring_textiles' && (
                <button
                  onClick={() => handleSendMessage('Roli 3 za kitambaa cha kanga')}
                  className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                >
                  🧵 3 Roli za Kanga
                </button>
              )}
              {selectedBusiness.category === 'produce_kiosk' && (
                <button
                  onClick={() => handleSendMessage('Magunia 3 ya nyanya kesho')}
                  className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
                >
                  🍅 3 Magunia Nyanya
                </button>
              )}
              <button
                onClick={() => handleSendMessage('NDIYO')}
                className="whitespace-nowrap px-2.5 py-1 bg-emerald-100 border border-emerald-400 text-emerald-950 font-semibold hover:bg-emerald-200"
              >
                ✍️ "NDIYO"
              </button>
              <button
                onClick={() => handleSendMessage('TATIZO mzigo umeharibika')}
                className="whitespace-nowrap px-2.5 py-1 bg-rose-50 border border-rose-300 text-rose-800 hover:bg-rose-100"
              >
                ⚠️ "TATIZO"
              </button>
            </div>

            {/* WhatsApp Input Footer */}
            <div className="bg-[#F0F2F5] p-2 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Andika kwa Kiswahili, Sheng au English..."
                className="flex-1 bg-white rounded-full px-4 py-2 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 border border-stone-200"
              />

              <button
                onClick={simulateBrowserVoice}
                title="Send Voice Note"
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isRecording ? 'bg-rose-600 text-white animate-pulse' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                }`}
              >
                {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="w-9 h-9 rounded-full bg-[#008069] text-white flex items-center justify-center shrink-0 disabled:opacity-40 hover:bg-emerald-700 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
