import { useEffect, useState } from 'react';

export default function AdressePointage({ latitude, longitude }) {
  const [adresse, setAdresse] = useState('Chargement...');

  useEffect(() => {
    if (latitude && longitude) {
      const apiKey = 'f234696a8f354478805941824780c17e';
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`;

      fetch(url)
        .then(res => res.json())
        .then(data => {
          if (data && data.results && data.results.length > 0) {
            setAdresse(data.results[0].formatted);
          } else {
            setAdresse('Adresse inconnue');
          }
        })
        .catch(() => setAdresse('Erreur lors de la récupération de l’adresse'));
    } else {
      setAdresse('Coordonnées non disponibles');
    }
  }, [latitude, longitude]);

  return <span>{adresse}</span>;
}
