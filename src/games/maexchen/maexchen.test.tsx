import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { maexchen } from './index';
import { PartyCtx, type PartyValue } from '../../features/party/PartyContext';
import { usePlayer, defaultProfile } from '../../store/player';
import type { GamePlayer } from '../types';

vi.mock('../../lib/haptics', () => ({ haptic: vi.fn() }));
vi.mock('../../lib/sound', () => ({ sound: vi.fn() }));

/**
 * Die Ansage-Tabelle ist zugleich der Blick in den Becher: Wer würfelt, sieht
 * seinen Wurf dort markiert, und was unter der letzten Ansage liegt, ist
 * ausgegraut statt verschwunden.
 */

type State = ReturnType<typeof maexchen.createState>;

const me: GamePlayer = { id: 'p0', name: 'Mira', color: 'blue', online: true };
const ben: GamePlayer = { id: 'p1', name: 'Ben', color: 'pink', online: true };
const roster = [me, ben];

function mount(patch: Partial<State>, online = false, who = me) {
  const state: State = {
    ...maexchen.createState(roster),
    order: ['p0', 'p1'],
    turnIndex: 0,
    phase: 'announce',
    ...patch,
  };
  const party = { mode: online ? 'online' : 'local', players: roster, me: who } as unknown as PartyValue;
  const Game = maexchen.Component;
  return render(
    <PartyCtx.Provider value={party}>
      <Game state={state} players={roster} me={who} isHost online={online} dispatch={() => {}} quit={() => {}} />
    </PartyCtx.Provider>,
  );
}

const chip = (label: string) => screen.getByRole('button', { name: new RegExp(`^${label}`) });

beforeEach(() => {
  usePlayer.setState({ profile: { ...defaultProfile(), name: me.name }, currentDrinkId: 'beer-pils', log: [] });
});

describe('Mäxchen: Wurf in der Tabelle', () => {
  it('markiert den eigenen Wurf in der Tabelle', () => {
    mount({ dice: [3, 4] });
    const mine = chip('4-3');
    expect(within(mine).getByText('dein Wurf')).toBeTruthy();
    expect(mine).toBeEnabled();
    expect(screen.getAllByText('dein Wurf')).toHaveLength(1);
  });

  it('zeigt alle Würfe und graut aus, was nicht mehr reicht', () => {
    // Zu schlagen: 5-4 (Index 8). Der Wurf 4-3 liegt darunter.
    mount({ dice: [4, 3], previous: 8 });
    expect(screen.getAllByRole('button', { name: /^(\d-\d|Mäxchen)/ })).toHaveLength(21);
    expect(chip('4-3')).toBeDisabled();
    expect(within(chip('4-3')).getByText('dein Wurf')).toBeTruthy();
    expect(chip('5-4')).toBeDisabled();
    expect(chip('6-1')).toBeEnabled();
    expect(screen.getByText(/Dein Wurf reicht nicht/)).toBeTruthy();
  });

  it('verrät online den Wurf nicht an die anderen', () => {
    mount({ dice: [2, 1] }, true, ben);
    expect(screen.queryByText('dein Wurf')).toBeNull();
    expect(chip('Mäxchen')).toBeDisabled();
  });
});
