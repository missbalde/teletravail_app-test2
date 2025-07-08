import { useEffect, useState } from 'react';

export default function AdressePointage({ latitude, longitude }) {
  const [adresse, setAdresse] = useState('Chargement...');

  useEffect(() => {
    if (latitude != null && longitude != null) {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
      fetch(url, {
        headers: {
          'User-Agent': 'teletravail-app/1.0 (contact@tondomaine.com)'
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            setAdresse(data.display_name);
          } else {
            setAdresse('Adresse inconnue');
          }
        })
        .catch(() => {
          setAdresse('Erreur lors de la récupération de l’adresse');
        });
    } else {
      setAdresse('Coordonnées non disponibles');
    }
  }, [latitude, longitude]);

  return <span>{adresse}</span>;
}
