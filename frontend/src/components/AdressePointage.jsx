import { useEffect, useState } from 'react';

export default function AdressePointage({ latitude, longitude }) {
  const [adresse, setAdresse] = useState('Chargement...');

  useEffect(() => {
    if (latitude && longitude) {
      const apiKey = '512c73c1dba4bd21a292c7c5f169f0a5';
      const url = `http://api.positionstack.com/v1/reverse?access_key=${apiKey}&query=${latitude},${longitude}`;
      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.data && data.data.length > 0) {
            setAdresse(data.data[0].label);
          } else {
            setAdresse('Adresse inconnue');
          }
        })
        .catch(() => setAdresse('Erreur API'));
    } else {
      setAdresse('Non disponible');
    }
  }, [latitude, longitude]);

  return <span>{adresse}</span>;
} 