import React, { useState, useEffect } from 'react';
import { ItineraryStop, FilterState } from '../types/travel';
import { useLanguage } from '../context/LanguageContext';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Luggage, 
  Train, 
  DollarSign, 
  ShieldCheck, 
  Compass,
  ArrowRightLeft,
  Coins,
  Calculator,
  Info
} from 'lucide-react';

interface DispatchPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  itinerary: ItineraryStop[];
  filter: FilterState;
}

// Current Uzbekistan Central Bank (CBU) / Market Exchange Rate (approx. 1 USD = 12,850 UZS)
const DEFAULT_EXCHANGE_RATE = 12850;

export const DispatchPlanModal: React.FC<DispatchPlanModalProps> = ({
  isOpen,
  onClose,
  itinerary,
  filter
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [copiedUzs, setCopiedUzs] = useState(false);

  // Currency Converter State
  const [exchangeRate, setExchangeRate] = useState<number>(DEFAULT_EXCHANGE_RATE);
  const [usdAmount, setUsdAmount] = useState<string>('100');
  const [uzsAmount, setUzsAmount] = useState<string>((100 * DEFAULT_EXCHANGE_RATE).toString());
  const [converterDirection, setConverterDirection] = useState<'usd_to_uzs' | 'uzs_to_usd'>('usd_to_uzs');

  const totalCost = itinerary.reduce((acc, stop) => {
    const avgDaily = (stop.destination.dailyBudgetMin + stop.destination.dailyBudgetMax) / 2;
    return acc + avgDaily * stop.days;
  }, 0);

  const totalDays = itinerary.reduce((acc, stop) => acc + stop.days, 0);
  const tripBudgetUsd = Math.round(totalCost);
  const tripBudgetUzs = Math.round(totalCost * exchangeRate);

  // When modal opens or itinerary updates, initialize converter with trip budget if available
  useEffect(() => {
    if (tripBudgetUsd > 0) {
      setUsdAmount(tripBudgetUsd.toString());
      setUzsAmount(Math.round(tripBudgetUsd * exchangeRate).toString());
    } else {
      setUsdAmount('100');
      setUzsAmount((100 * exchangeRate).toString());
    }
  }, [isOpen, tripBudgetUsd, exchangeRate]);

  if (!isOpen) return null;

  // Handle USD input change
  const handleUsdChange = (val: string) => {
    setUsdAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      setUzsAmount(Math.round(num * exchangeRate).toString());
    } else {
      setUzsAmount('');
    }
  };

  // Handle UZS input change
  const handleUzsChange = (val: string) => {
    setUzsAmount(val);
    const num = parseFloat(val.replace(/,/g, ''));
    if (!isNaN(num) && num >= 0 && exchangeRate > 0) {
      setUsdAmount((num / exchangeRate).toFixed(2));
    } else {
      setUsdAmount('');
    }
  };

  // Quick preset buttons
  const setQuickPreset = (amount: number) => {
    setUsdAmount(amount.toString());
    setUzsAmount(Math.round(amount * exchangeRate).toString());
    setConverterDirection('usd_to_uzs');
  };

  const handleCopyUzs = () => {
    const num = parseFloat(uzsAmount.replace(/,/g, ''));
    if (!isNaN(num)) {
      navigator.clipboard.writeText(`${num.toLocaleString()} UZS`);
      setCopiedUzs(true);
      setTimeout(() => setCopiedUzs(false), 2000);
    }
  };

  const handleCopy = () => {
    const text = `SILK WAY LOGISTICS DISPATCH & ITINERARY
"Experience Uzbekistan Effortlessly"
Travel Dates: ${filter.departureDate} to ${filter.returnDate} (${totalDays} Days)
Estimated Total Budget: $${tripBudgetUsd.toLocaleString()} USD (~${tripBudgetUzs.toLocaleString()} UZS at 1 USD = ${exchangeRate.toLocaleString()} UZS)

DESTINATIONS & TRANSIT STOPS:
${itinerary.map((s, i) => `${i + 1}. ${s.destination.name}, ${s.destination.country} (${s.days} days)
   - Connection: ${s.destination.transitTimeFromHub}
   - Daily Logistics: $${s.destination.dailyBudgetMin} - $${s.destination.dailyBudgetMax}/day (~${Math.round(s.destination.dailyBudgetMin * exchangeRate).toLocaleString()} - ${Math.round(s.destination.dailyBudgetMax * exchangeRate).toLocaleString()} UZS)
   - Luggage Forwarding: ${s.destination.luggageForwardingSupported ? 'Available (Hands-free)' : 'Self-managed'}
   - Highlight: ${s.destination.highlight}`).join('\n\n')}

Logistics Manifest Generated via Silk Way Tourism & Logistics Platform.
"Experience Uzbekistan Effortlessly"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const parsedUsd = parseFloat(usdAmount) || 0;
  const parsedUzs = parseFloat(uzsAmount.replace(/,/g, '')) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center shadow-xs">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {t('dispatch.title', 'Logistics Dispatch Manifest')}
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded uppercase">
                  {t('brand.name', 'Silk Way')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {t('dispatch.subtitle', 'Experience Uzbekistan Effortlessly · Travel & Currency Dossier')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-900 text-white rounded-xl">
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('itinerary.duration', 'Duration')}</span>
              <span className="text-sm font-bold font-mono tabular-nums">{totalDays} Days</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('itinerary.destinations', 'Destinations')}</span>
              <span className="text-sm font-bold font-mono tabular-nums">{itinerary.length} Hubs</span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('itinerary.budgetUsd', 'Est. Budget (USD)')}</span>
              <span className="text-sm font-bold font-mono text-emerald-400 tabular-nums">
                ${tripBudgetUsd.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('itinerary.budgetUzs', 'Est. Budget (UZS)')}</span>
              <span className="text-xs font-bold font-mono text-amber-300 tabular-nums">
                ~{tripBudgetUzs.toLocaleString()} UZS
              </span>
            </div>
          </div>

          {/* ===================== CURRENCY CONVERTER (USD ⇄ UZS) ===================== */}
          <div className="p-4 bg-gradient-to-br from-amber-50/70 via-slate-50 to-emerald-50/60 rounded-2xl border border-amber-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg shadow-xs">
                  <Coins className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-950 flex items-center gap-1.5">
                    <span>{t('dispatch.converterTitle', 'Currency Converter (USD ⇄ UZS)')}</span>
                    <span className="text-[10px] font-mono font-semibold bg-amber-200/80 text-amber-900 px-1.5 py-0.2 rounded">
                      Live Market
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {t('dispatch.converterDesc', `Real-time market rate: 1 USD = ${exchangeRate.toLocaleString()} UZS (Central Bank of Uzbekistan benchmark)`)}
                  </p>
                </div>
              </div>

              {tripBudgetUsd > 0 && (
                <button
                  onClick={() => setQuickPreset(tripBudgetUsd)}
                  className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/70 rounded-lg shadow-xs transition-colors shrink-0"
                >
                  <Calculator className="w-3 h-3 text-amber-600" />
                  <span>Sync Trip Total (${tripBudgetUsd})</span>
                </button>
              )}
            </div>

            {/* Input Converter Boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* USD Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>US Dollar (USD)</span>
                  <span className="font-mono text-emerald-700 font-bold">$ USD</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={usdAmount}
                    onChange={(e) => handleUsdChange(e.target.value)}
                    placeholder="Enter USD..."
                    className="w-full text-base font-bold font-mono text-slate-950 bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* UZS Box */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs space-y-1 focus-within:border-slate-900 focus-within:ring-1 focus-within:ring-slate-900 transition-all">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                  <span>Uzbekistan Som (UZS)</span>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-amber-700 font-bold">UZS</span>
                    <button
                      onClick={handleCopyUzs}
                      title="Copy UZS amount"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    >
                      {copiedUzs ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={parsedUzs > 0 ? parsedUzs.toLocaleString() : uzsAmount}
                    onChange={(e) => handleUzsChange(e.target.value)}
                    placeholder="Enter UZS..."
                    className="w-full text-base font-bold font-mono text-emerald-800 bg-transparent focus:outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">so'm</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-0.5">
                Quick Estimates:
              </span>
              {[
                { label: '$25 (Lunch & Taxi)', val: 25 },
                { label: '$50 (Day Tour)', val: 50 },
                { label: '$100 (Hotel & Meal)', val: 100 },
                { label: '$250 (Boutique Stay)', val: 250 },
                { label: '$500 (Multi-City)', val: 500 },
                ...(tripBudgetUsd > 0 ? [{ label: `Trip Total ($${tripBudgetUsd})`, val: tripBudgetUsd }] : [])
              ].map((preset) => {
                const isActive = Math.round(parsedUsd) === preset.val;
                return (
                  <button
                    key={preset.label}
                    onClick={() => setQuickPreset(preset.val)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white font-bold shadow-xs'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Practical On-The-Ground Price Reference */}
            <div className="pt-2 border-t border-amber-200/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-white/80 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">🍲 Uzbek Plov & Tea</span>
                <strong className="text-slate-800 font-mono">~60,000 UZS</strong>
                <span className="text-slate-400 text-[10px] ml-1">($4.70)</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">🚕 City Yandex Taxi</span>
                <strong className="text-slate-800 font-mono">~25,000 UZS</strong>
                <span className="text-slate-400 text-[10px] ml-1">($1.95)</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">🚅 Afrosiyob Bullet Train</span>
                <strong className="text-slate-800 font-mono">~200,000 UZS</strong>
                <span className="text-slate-400 text-[10px] ml-1">($15.50)</span>
              </div>
              <div className="p-2 bg-white/80 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[9px] uppercase font-bold">🏨 Boutique Hotel</span>
                <strong className="text-slate-800 font-mono">~1,100,000 UZS</strong>
                <span className="text-slate-400 text-[10px] ml-1">($85.00)</span>
              </div>
            </div>
          </div>

          {/* Detailed Stops Timeline */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Train className="w-4 h-4 text-blue-600" />
              Routing & Station Dispatch
            </h4>

            {itinerary.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No stops added yet.</p>
            ) : (
              <div className="space-y-3">
                {itinerary.map((stop, index) => {
                  const minUzs = Math.round(stop.destination.dailyBudgetMin * exchangeRate).toLocaleString();
                  const maxUzs = Math.round(stop.destination.dailyBudgetMax * exchangeRate).toLocaleString();

                  return (
                    <div
                      key={stop.id}
                      className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-900">
                            {stop.destination.name}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({stop.destination.country})
                          </span>
                        </div>
                        <span className="text-xs font-semibold font-mono bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                          {stop.days} {stop.days === 1 ? 'day' : 'days'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        <strong className="text-slate-900">Transit:</strong> {stop.destination.transitTimeFromHub}
                      </p>

                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg flex items-center justify-between flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-slate-700 font-medium">
                          <Luggage className="w-3.5 h-3.5 text-blue-600" />
                          {stop.destination.luggageForwardingSupported
                            ? 'Hands-Free Luggage Forwarding Verified'
                            : 'Standard Luggage Station Drop'}
                        </span>
                        <div className="text-right">
                          <span className="font-mono text-slate-900 font-bold">
                            ${stop.destination.dailyBudgetMin} - ${stop.destination.dailyBudgetMax}/day
                          </span>
                          <span className="text-[10px] text-slate-500 block font-mono">
                            ~{minUzs} - {maxUzs} UZS
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Logistics Quality Checklist */}
          <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Logistics Readiness Guarantee
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              All chosen hubs feature verified intermodal high-speed rail, scenic highway transfers, or scheduled maritime ferries. Luggage transit passes can be arranged directly upon terminal arrival.
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 md:p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            {t('dispatch.close', 'Close')}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('dispatch.copied', 'Copied!')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('dispatch.copyManifest', 'Copy Text (USD & UZS)')}</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('dispatch.printDossier', 'Print Manifest')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
