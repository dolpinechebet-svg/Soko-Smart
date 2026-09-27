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
  Sparkles
} from 'lucide-react';
import { MamaMbogaVendor, NluParseResult } from '../types';

interface WhatsAppSimulatorProps {
  vendors: MamaMbogaVendor[];
  selectedVendor: MamaMbogaVendor;
  setSelectedVendor: (v: MamaMbogaVendor) => void;
  onOrderCreated?: () => void;
  onAgreementConfirmed?: () => void;
  onOpenAgreementsTab: () => void;
}

interface MessageBubble {
  id: string;
  sender: 'vendor' | 'agent';
  text: string;
  timestamp: string;
  isAudio?: boolean;
  audioDuration?: string;
  quickReplies?: { title: string; payload: string }[];
  isAgreementNotice?: boolean;
  agreementId?: string;
}

export const WhatsAppSimulator: React.FC<WhatsAppSimulatorProps> = ({
  vendors,
  selectedVendor,
  setSelectedVendor,
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

  // Initialize conversation for selected vendor
  useEffect(() => {
    loadVendorSession(selectedVendor.phone);
  }, [selectedVendor.phone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, stkDialog]);

  const loadVendorSession = async (phone: string) => {
    try {
      const res = await fetch(`/api/chat/session/${encodeURIComponent(phone)}`);
      if (res.ok) {
        const session = await res.json();
        if (session.history && session.history.length > 0) {
          const formatted: MessageBubble[] = session.history.map((h: any, i: number) => ({
            id: `msg-${i}`,
            sender: h.role === 'vendor' ? 'vendor' : 'agent',
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

    // Default greeting if session not found
    setMessages([
      {
        id: 'msg-0',
        sender: 'agent',
        text: `Habari ${selectedVendor.name}! Mimi ni Soko Smart, mratibu wako wa ununuzi wa pamoja Makadara.\n\nNiambie nini unahitaji kesho (kwa mfano: "Nataka magunia 2 ya nyanya na debe 1 ya viazi kesho asubuhi") kwa sauti au ujumbe mfupi.`,
        timestamp: '07:00 AM'
      }
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMessage: MessageBubble = {
      id: `msg-${Date.now()}-v`,
      sender: 'vendor',
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
          phone: selectedVendor.phone,
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

        // If STK Push was triggered by NDIYO/confirmation
        if (data.triggerStkPush) {
          setTimeout(() => {
            triggerMpesaPrompt(data.stkAmount || 3510);
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

  // Trigger simulated Safaricom STK Push dialog on vendor phone
  const triggerMpesaPrompt = async (amount: number) => {
    try {
      const res = await fetch('/api/mpesa/stkpush', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: selectedVendor.id,
          phone: selectedVendor.phone,
          amountKsh: amount,
          purpose: 'vendor_pool_collection',
          agreementId: 'SS-MKD-260928-001'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setStkDialog({
          visible: true,
          checkoutRequestId: data.checkoutRequestId,
          amount: amount,
          title: 'SIM TOOLKIT · M-PESA',
          prompt: `Do you want to pay KSh ${amount.toLocaleString()} to SOKO SMART TILL 174379 for Makadara Produce Pool?`,
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
          // Post receipt notice in chat
          setMessages(prev => [
            ...prev,
            {
              id: `msg-${Date.now()}-receipt`,
              sender: 'agent',
              text: `✅ MALIPO YAMEPOKELEWA!\n\nStakabadhi ya M-PESA: ${data.tx.mpesaReceiptNumber}\nKiasi: KSh ${stkDialog.amount.toLocaleString()}\nKutoka: ${selectedVendor.phone}\nKuelekea: Soko Smart Escrow Suspense.\n\nMboga zako zitawasilishwa Hamza Market kabla ya 06:30 AM kesho. Ujumbe wa gari likiwasili utatumwa hapa.`,
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
        // Add as voice note bubble
        const userAudioMsg: MessageBubble = {
          id: `msg-${Date.now()}-voice`,
          sender: 'vendor',
          text: `🎙️ Sauti: "${data.transcription}"`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAudio: true,
          audioDuration: '0:07'
        };
        setMessages(prev => [...prev, userAudioMsg]);

        // Process through coordinator
        const chatRes = await fetch('/api/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: selectedVendor.phone,
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
      handleAudioSample('sample_sarah_nyanya');
    }, 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Left Column: Vendor Persona & Sheng/Swahili Test Control Deck */}
      <div className="lg:col-span-4 space-y-4">
        {/* Vendor Persona Selector Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Mama Mboga Simulator
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Makadara Corridor
            </span>
          </div>

          <label className="block text-xs text-stone-600 mb-1.5 font-medium">
            Select Active Vendor Persona:
          </label>
          <div className="space-y-2">
            {vendors.map(v => {
              const isSelected = v.id === selectedVendor.id;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVendor(v)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-stone-900">{v.name}</span>
                    <span className="text-xs text-stone-500 font-mono">{v.phone}</span>
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5 flex items-center justify-between">
                    <span>{v.stallLocation}</span>
                    <span className="text-stone-400 capitalize">{v.preferredLanguage}</span>
                  </div>
                  <div className="text-[11px] text-emerald-800 mt-1 flex items-center gap-2">
                    <span>Reputation: {v.reputationScore.fulfillmentRate}% on-time</span>
                    <span>·</span>
                    <span>{v.reputationScore.totalOrders} bulk cycles</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Voice Note Audio Injector Card */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-700" />
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-800">
                Voice Note Testing (Sheng / Swahili)
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-600 mb-3">
            Vendors frequently use voice notes while attending stalls. Test our code-switching STT engine:
          </p>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => handleAudioSample('sample_sarah_nyanya')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors flex items-start gap-2.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-stone-800 block">Sheng Order (Mama Sarah)</span>
                <span className="text-stone-500 italic text-[11px]">
                  "Niaje Soko Smart, nataka magunia tatu za nyanya na debe tano za viazi..."
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAudioSample('sample_wambui_sukuma')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors flex items-start gap-2.5"
            >
              <Play className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-stone-800 block">Swahili Order (Mama Wambui)</span>
                <span className="text-stone-500 italic text-[11px]">
                  "Habari ya jioni. Kesho asubuhi nahitaji sukuma wiki kilo arobaini..."
                </span>
              </div>
            </button>

            <button
              onClick={() => handleAudioSample('sample_achieng_tatizo')}
              disabled={isLoading}
              className="w-full text-left p-2.5 rounded-lg border border-rose-200 bg-rose-50/30 hover:bg-rose-50 transition-colors flex items-start gap-2.5"
            >
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-rose-900 block">Dispute Voice ("TATIZO")</span>
                <span className="text-rose-700 italic text-[11px]">
                  "Hallow Soko Smart, TATIZO. Gunia moja ya nyanya niliyopokea..."
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* NLU Parsing Inspector */}
        {lastNluResult && (
          <div className="bg-stone-900 text-stone-200 rounded-xl p-4 text-xs font-mono shadow-xs border border-stone-800">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-stone-800">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Live NLU Output Schema
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
                <span className="text-stone-400">Lang: </span>
                <span className="text-emerald-300 uppercase">{lastNluResult.detectedLanguage}</span>
              </div>
              {lastNluResult.extractedEntities.map((ent, idx) => (
                <div key={idx} className="bg-stone-800/80 p-1.5 rounded mt-1 text-[11px]">
                  <div className="text-white font-medium">{ent.produceName}</div>
                  <div className="text-stone-300">
                    {ent.quantity} {ent.unit} (~{ent.normalizedKg} kg)
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: High-Fidelity WhatsApp Phone Simulation */}
      <div className="lg:col-span-8 flex justify-center">
        <div className="w-full max-w-[440px] bg-[#111B21] rounded-[36px] p-3 shadow-2xl border-4 border-stone-800 relative overflow-hidden">
          {/* Phone Speaker Notch */}
          <div className="w-28 h-4 bg-stone-950 rounded-full mx-auto mb-2 flex items-center justify-center">
            <div className="w-8 h-1 bg-stone-800 rounded-full"></div>
          </div>

          {/* WhatsApp Interface Container */}
          <div className="bg-[#EFEAE2] rounded-[24px] overflow-hidden flex flex-col h-[680px] relative shadow-inner">
            {/* WhatsApp App Header */}
            <div className="bg-[#008069] text-white px-4 py-3 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-emerald-800 border border-emerald-400/40 flex items-center justify-center font-bold text-sm text-emerald-200">
                  SS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm leading-tight">Soko Smart Coordinator</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block"></span>
                  </div>
                  <span className="text-[11px] text-emerald-100/90 block leading-tight">
                    Msaidizi wa Makadara Mama Mboga
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Phone className="w-4 h-4 cursor-pointer hover:text-white" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-white" />
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[radial-gradient(#d4cbbe_1px,transparent_1px)] [background-size:16px_16px]">
              {/* WhatsApp Security Notice */}
              <div className="text-center my-1">
                <span className="bg-[#FFF4C7] text-[#54656F] text-[10px] px-2.5 py-1 rounded-md shadow-2xs inline-block max-w-[90%]">
                  🔒 Messages are coordinated securely via Soko Smart for Makadara Produce Pool.
                </span>
              </div>

              {messages.map(msg => {
                const isVendor = msg.sender === 'vendor';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isVendor ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg px-3 py-2 text-xs shadow-2xs leading-relaxed ${
                        isVendor
                          ? 'bg-[#E7FFDB] text-[#111B21] rounded-tr-none'
                          : 'bg-white text-[#111B21] rounded-tl-none'
                      }`}
                    >
                      {msg.isAudio ? (
                        <div className="flex items-center gap-2.5 py-1 min-w-[190px]">
                          <button
                            onClick={() =>
                              setIsPlayingAudio(isPlayingAudio === msg.id ? null : msg.id)
                            }
                            className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0"
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
                              {msg.audioDuration || '0:06'} · Voice Note
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="whitespace-pre-line">{msg.text}</div>
                      )}

                      <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-stone-400">
                        <span>{msg.timestamp}</span>
                        {isVendor && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                      </div>
                    </div>

                    {/* Quick Reply Chips if provided by Coordinator */}
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
              <div className="absolute inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
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
                        Inatuma PIN na kuthibitisha na Safaricom...
                      </p>
                    </div>
                  ) : stkDialog.status === 'success' ? (
                    <div className="py-3 text-center text-emerald-200 font-semibold text-xs">
                      ✅ PIN Imekubaliwa! Malipo Yamekamilika.
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

            {/* Quick Action Preset Chips for Vendor */}
            <div className="bg-[#F0F2F5] px-2 py-1.5 border-t border-stone-200 flex gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
              <button
                onClick={() => handleSendMessage('Nataka magunia 2 ya nyanya kesho')}
                className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                🍅 2 Magunia Nyanya
              </button>
              <button
                onClick={() => handleSendMessage('Nipatie kilo 50 za sukuma wiki')}
                className="whitespace-nowrap px-2.5 py-1 bg-white rounded-full border border-stone-300 text-stone-700 hover:border-emerald-600 hover:text-emerald-700"
              >
                🥬 50kg Sukuma
              </button>
              <button
                onClick={() => handleSendMessage('NDIYO')}
                className="whitespace-nowrap px-2.5 py-1 bg-emerald-100 border border-emerald-400 text-emerald-900 font-semibold hover:bg-emerald-200"
              >
                ✍️ "NDIYO" (Thibitisha)
              </button>
              <button
                onClick={() => handleSendMessage('TATIZO nyanya zimeoza')}
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
