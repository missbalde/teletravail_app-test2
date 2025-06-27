import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function QrPointage() {
  const { employee_id } = useParams();
  const [status, setStatus] = useState('pending'); // pending, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!employee_id) {
      setStatus('error');
      setMessage('Identifiant salarié manquant dans l’URL.');
      return;
    }

    // Fonction pour envoyer le pointage (avec ou sans position)
    const sendPointage = (latitude, longitude) => {
      setMessage('Enregistrement du pointage…');
      fetch('https://cuddly-signs-rest.loca.lt/api/pointage/qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id,
          ...(latitude && longitude ? { latitude, longitude } : {})
        }),
      })
        .then(async (res) => {
          const data = await res.json();
          if (res.ok) {
            setStatus('success');
            setMessage(data.message || 'Pointage enregistré avec succès !');
          } else {
            setStatus('error');
            setMessage(data.error || 'Erreur lors de l’enregistrement du pointage.');
          }
        })
        .catch(() => {
          setStatus('error');
          setMessage('Erreur réseau ou serveur.');
        });
    };

    // Demander la géolocalisation
    if (!navigator.geolocation) {
      setMessage('La géolocalisation n’est pas supportée, pointage sans position…');
      sendPointage();
      return;
    }

    setMessage('Obtention de la position GPS…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        sendPointage(position.coords.latitude, position.coords.longitude);
      },
      (err) => {
        setMessage('Impossible d’obtenir la position GPS, pointage sans position…');
        sendPointage();
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [employee_id]);

  return (
    <div className="min-vh-100 d-flex flex-column justify-content-center align-items-center bg-light">
      <div className="card shadow p-4 text-center" style={{ maxWidth: 400 }}>
        <h2 className="mb-3">Pointage par QR Code</h2>
        {status === 'pending' && <div className="alert alert-info">{message}</div>}
        {status === 'success' && <div className="alert alert-success">{message}</div>}
        {status === 'error' && <div className="alert alert-danger">{message}</div>}
        <div className="mt-3 text-muted small">Vous pouvez fermer cette page après confirmation.</div>
      </div>
    </div>
  );
} 