import { useState, useEffect } from 'react';

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [password, setPassword] = useState('');
  const [privateInfo, setPrivateInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/players')
      .then(res => res.json())
      .then(setPlayers);
  }, []);

  const handleShowInfo = (player) => {
    setSelected(player);
    setPrivateInfo(null);
    setPassword('');
    setError('');
  };

  const handleCheck = async () => {
    setError('');
    const res = await fetch('/api/player-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId: selected.id, password })
    });
    const data = await res.json();
    if (res.ok) {
      setPrivateInfo(data);
    } else {
      setError(data.message);
    }
  };

  return (
    <main style={{ padding: '2rem' }}>
      <h1>遊戲名單</h1>
      <ul>
        {players.map(player => (
          <li key={player.id} style={{ marginBottom: '1rem' }}>
            {player.name} (分數: {player.score}, 排名: {player.rank})
            <button style={{ marginLeft: '1rem' }} onClick={() => handleShowInfo(player)}>查看私密資料</button>
          </li>
        ))}
      </ul>
      {selected && (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '2rem' }}>
          <h2>玩家：{selected.name}</h2>
          {!privateInfo ? (
            <>
              <input type="password" placeholder="請輸入密碼" value={password} onChange={e => setPassword(e.target.value)} />
              <button onClick={handleCheck} style={{ marginLeft: '1rem' }}>確認</button>
              {error && <p style={{ color: 'red' }}>{error}</p>}
            </>
          ) : (
            <pre>{JSON.stringify(privateInfo, null, 2)}</pre>
          )}
        </div>
      )}
    </main>
  );
}
