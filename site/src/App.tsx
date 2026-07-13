import { useCallback, useEffect, useState } from 'react';
import type { CatKey, Expense, ItinDayOverride } from '../shared/seeds';
import * as api from './lib/api';
import { mergeDays } from './lib/mergeDays';
import { fetchWeather, type CityWx } from './lib/weather';
import { getWhoami, setWhoami } from './lib/whoami';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { IdentityPicker } from './components/IdentityPicker';
import { Home } from './views/Home';
import { Stay } from './views/Stay';
import { Plan } from './views/Plan';
import { MapView } from './views/MapView';
import { Weather } from './views/Weather';
import { Budget } from './views/Budget';
import { Admin } from './views/Admin';
import { Casino } from './views/Casino';

export type View = 'home' | 'stay' | 'plan' | 'map' | 'casino' | 'weather' | 'budget';
const VIEWS: View[] = ['home', 'stay', 'plan', 'map', 'casino', 'weather', 'budget'];

function readHash(): { view: View; admin: boolean; pinId: string | null } {
  const raw = (location.hash || '').replace('#', '');
  const [seg, pinId] = raw.split('/');
  const h = seg.toLowerCase();
  if (h === 'admin') return { view: 'home', admin: true, pinId: null };
  return { view: (VIEWS as string[]).includes(h) ? (h as View) : 'home', admin: false, pinId: pinId || null };
}

export default function App() {
  const [{ view, admin, pinId }, setRoute] = useState(readHash());
  const [theme, setTheme] = useState(document.documentElement.getAttribute('data-theme') || 'light');
  const [who, setWho] = useState<string | null>(getWhoami());
  const [state, setState] = useState<api.SharedState | null>(null);
  const [weather, setWeather] = useState<Record<string, CityWx> | null>(null);

  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => { api.fetchState().then(setState); }, []);
  useEffect(() => { fetchWeather().then(setWeather).catch(() => setWeather(null)); }, []);

  const setView = useCallback((v: View) => {
    if ((location.hash || '').replace('#', '') !== v) location.hash = v;
    setRoute({ view: v, admin: false, pinId: null });
    window.scrollTo(0, 0);
  }, []);

  const exitAdmin = useCallback(() => {
    location.hash = view;
    setRoute({ view, admin: false, pinId: null });
  }, [view]);

  const toggleTheme = () => {
    const t = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('miami_theme', t); } catch { /* fine */ }
    setTheme(t);
  };

  const pitches = state?.pitches ?? [];
  const expenses = state?.expenses ?? [];

  const vote = async (id: string) => {
    if (!who || !state) return;
    setState({
      ...state,
      pitches: state.pitches.map((p) => {
        if (p.id !== id) return p;
        const has = p.voters.includes(who);
        return { ...p, voters: has ? p.voters.filter((v) => v !== who) : [...p.voters, who] };
      }),
    });
    try { setState(await api.votePitch(id, who)); } catch { setState(await api.fetchState()); }
  };

  const addPitch = async (p: { title: string; category: CatKey; link: string; note: string; who: string[]; requester: string }) => {
    try { setState(await api.addPitch({ ...p, place: 'spot TBD', mx: 0, my: 0 })); } catch { alert("that didn't send. try again."); }
  };

  const addExpense = async (e: Omit<Expense, 'id'>) => {
    try { setState(await api.addExpense(e)); } catch { alert("that didn't send. try again."); }
  };

  const removeExpense = async (id: string) => {
    try { setState(await api.deleteExpense(id)); } catch { setState(await api.fetchState()); }
  };

  const declarePour = async (text: string) => {
    if (!who) return;
    try { setState(await api.savePour(who, text)); } catch { alert("that didn't send. try again."); }
  };

  const verdict = async (id: string, decision: 'approved' | 'denied', adminKey: string): Promise<'ok' | 'auth' | 'error'> => {
    try {
      setState(await api.verdictPitch(id, decision, adminKey));
      return 'ok';
    } catch (err) {
      if (err instanceof api.ApiAuthError) return 'auth';
      setState(await api.fetchState());
      return 'error';
    }
  };

  const addPin = async (pin: api.PinnedPitchInput, adminKey: string): Promise<'ok' | 'auth' | 'error'> => {
    try {
      setState(await api.addPinnedPitch(pin, adminKey));
      return 'ok';
    } catch (err) {
      return err instanceof api.ApiAuthError ? 'auth' : 'error';
    }
  };

  const saveDays = async (days: ItinDayOverride[], adminKey: string): Promise<'ok' | 'auth' | 'error'> => {
    try {
      setState(await api.saveItinerary(days, adminKey));
      return 'ok';
    } catch (err) {
      return err instanceof api.ApiAuthError ? 'auth' : 'error';
    }
  };

  const days = mergeDays(state?.days);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} />
      <main style={{ flex: 1 }}>
        {view === 'home' && !admin && <Home pitches={pitches} expenses={expenses} weather={weather} casino={state?.casino} pours={state?.pours} whoami={who} onDeclarePour={declarePour} days={days} />}
        {view === 'stay' && <Stay />}
        {view === 'plan' && <Plan days={days} />}
        {view === 'map' && <MapView pitches={pitches} whoami={who} onVote={vote} onAdd={addPitch} initialSelected={pinId} />}
        {view === 'casino' && <Casino whoami={who} />}
        {view === 'weather' && <Weather weather={weather} />}
        {view === 'budget' && <Budget expenses={expenses} whoami={who} onAdd={addExpense} onDelete={removeExpense} />}
      </main>
      <Footer />
      {admin && <Admin pitches={pitches} days={days} onVerdict={verdict} onAddPin={addPin} onSaveDays={saveDays} onExit={exitAdmin} />}
      {!who && <IdentityPicker onPick={(n) => { setWhoami(n); setWho(n); }} />}
    </div>
  );
}
