"use client";

import { useState, useEffect } from 'react';

export default function BulletinPage() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('/api/bulletin')
      .then(res => res.json())
      .then(setItems);
  }, []);

  return (
    <main style={{ padding: '2rem' }}>
      <h1>告示板</h1>
      <section>
        <h2>任務</h2>
        <ul>
          {items.filter(i => i.type === 'quest').map(q => (
            <li key={q.id}>
              <strong>{q.title}</strong> ({q.date})<br />
              {q.content}
            </li>
          ))}
        </ul>
      </section>
      <section style={{ marginTop: '2rem' }}>
        <h2>公告</h2>
        <ul>
          {items.filter(i => i.type === 'announcement').map(a => (
            <li key={a.id}>
              <strong>{a.title}</strong> ({a.date})<br />
              {a.content}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
