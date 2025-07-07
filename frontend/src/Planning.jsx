import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/fr';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';

// Configuration complète de moment pour le français
moment.locale('fr', {
  week: { dow: 1 }, // Lundi comme début de semaine
  weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
  monthsShort: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
});

const localizer = momentLocalizer(moment);

// Remplace toutes les URLs d'API par la variable d'environnement
const API_BASE_URL = import.meta.env.VITE_API_URL + '/api';

export default function Planning() {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    user_id: '',
    date: '',
    start_time: '',
    end_time: '',
    task: '',
    id: null,
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Charge les utilisateurs
  const loadUsers = () => {
    setError(null);
    axios.get(API_BASE_URL + '/employees')
      .then(res => setUsers(res.data))
      .catch((err) => {
        console.error('Erreur chargement salariés:', err);
        setError('Erreur lors du chargement des salariés');
      });
  };

  // Charge les événements et crée les dates en local (sans décalage)
  const loadEvents = () => {
    setError(null);
    setLoading(true);
    axios.get(API_BASE_URL + '/plannings')
      .then(res => {
        try {
        const mapped = res.data.map(p => {
            // Vérification des données avant traitement
            if (!p.date || !p.start_time || !p.end_time) {
              console.warn('Données manquantes pour l\'événement:', p);
              return null;
            }

          // Extraire uniquement la date YYYY-MM-DD (sans fuseau)
          const dateOnly = moment(p.date).format('YYYY-MM-DD');
          const start = moment(`${dateOnly} ${p.start_time}`, 'YYYY-MM-DD HH:mm:ss').toDate();
          const end = moment(`${dateOnly} ${p.end_time}`, 'YYYY-MM-DD HH:mm:ss').toDate();

            // Vérification que les dates sont valides
            if (!moment(start).isValid() || !moment(end).isValid()) {
              console.warn('Dates invalides pour l\'événement:', p);
              return null;
            }

          return {
            id: p.id,
            user_id: p.user_id,
              nom: p.nom || 'Nom inconnu',
              task: p.task || 'Tâche non définie',
              title: `${p.nom || 'Nom inconnu'} - ${p.task || 'Tâche non définie'}`,
            start,
            end,
          };
          }).filter(event => event !== null); // Filtrer les événements null
          
        setEvents(mapped);
        } catch (mappingError) {
          console.error('Erreur lors du mapping des événements:', mappingError);
          setError('Erreur lors du traitement des données du planning');
        }
      })
      .catch((err) => {
        console.error('Erreur chargement planning:', err);
        setError('Erreur lors du chargement du planning');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadUsers();
    loadEvents();
  }, []);

  // Gestion soumission formulaire (création/modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.user_id) return alert('Veuillez sélectionner un salarié');

    const dataToSend = {
      user_id: form.user_id,
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      task: form.task,
    };

    try {
      if (form.id) {
        await axios.put(API_BASE_URL + `/plannings/${form.id}`, dataToSend);
        alert("Tâche modifiée !");
      } else {
        await axios.post(API_BASE_URL + '/plannings', dataToSend);
        alert("Tâche créée !");
      }
      setForm({ user_id: '', date: '', start_time: '', end_time: '', task: '', id: null });
      loadEvents();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement:', err);
      alert("Erreur lors de l'enregistrement");
    }
  };

  // Gestion du changement de date avec gestion d'erreur
  const handleDateChange = (newDate) => {
    try {
      setDate(newDate);
      setError(null);
    } catch (err) {
      console.error('Erreur lors du changement de date:', err);
      setError('Erreur lors du changement de date');
    }
  };

  // Affichage d'erreur si nécessaire
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur détectée !</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              loadUsers();
              loadEvents();
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-primary">Planning des tâches</h2>

      {/* Indicateur de chargement */}
      {loading && (
        <div className="alert alert-info" role="alert">
          Chargement du planning en cours...
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="mb-5">
        <div className="row g-3">
          <div className="col-md-3">
            <select
              className="form-select"
              value={form.user_id}
              onChange={(e) => setForm({ ...form, user_id: e.target.value })}
              required
            >
              <option value="">-- Sélectionner un salarié --</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.nom} {user.prenom}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              className="form-control"
              type="text"
              placeholder="Tâche"
              value={form.task}
              onChange={(e) => setForm({ ...form, task: e.target.value })}
              required
            />
          </div>
          <div className="col-md-1 d-grid">
            <button type="submit" className="btn btn-success">
              {form.id ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </form>

      {/* Calendrier */}
      <Calendar
        localizer={localizer}
        culture="fr"
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        view={view}
        date={date}
        onNavigate={handleDateChange}
        onView={setView}
        views={['day', 'week', 'month']}
        step={60}
        timeslots={1}
        min={new Date(2024, 0, 1, 0, 0, 0)}
        max={new Date(2024, 0, 1, 23, 59, 59)}
        formats={{
          dayFormat: 'dddd D MMMM',
          dayHeaderFormat: 'dddd D MMMM',
          dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'dddd D MMMM', culture)} - ${localizer.format(end, 'dddd D MMMM', culture)}`,
          timeGutterFormat: 'HH:mm',
          selectRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`,
          eventTimeRangeFormat: ({ start, end }, culture, localizer) =>
            `${localizer.format(start, 'HH:mm', culture)} - ${localizer.format(end, 'HH:mm', culture)}`
        }}
        messages={{
          next: 'Suivant',
          previous: 'Précédent',
          today: "Aujourd'hui",
          month: 'Mois',
          week: 'Semaine',
          day: 'Jour',
          agenda: 'Agenda',
          noEventsInRange: 'Aucun événement dans cette période.',
          allDay: 'Toute la journée',
          yesterday: 'Hier',
          tomorrow: 'Demain',
          showMore: total => `+ ${total} événement(s) en plus`,
          date: 'Date',
          time: 'Heure',
          event: 'Événement',
          work_week: 'Semaine de travail'
        }}
        onSelectEvent={(event) => {
          setSelectedEvent(event);
          setShowModal(true);
        }}
      />




      {/* Modale détails tâche */}
      {selectedEvent && showModal && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setShowModal(false)}>
          <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Détails de la tâche</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p><strong>Salarié :</strong> {selectedEvent.nom}</p>
                <p><strong>Tâche :</strong> {selectedEvent.task}</p>
                <p><strong>Date :</strong> {moment(selectedEvent.start).format('dddd D MMMM YYYY')}</p>
                <p><strong>Heure :</strong> {moment(selectedEvent.start).format('HH:mm')} - {moment(selectedEvent.end).format('HH:mm')}</p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setForm({
                      user_id: selectedEvent.user_id,
                      date: moment(selectedEvent.start).format('YYYY-MM-DD'),
                      start_time: moment(selectedEvent.start).format('HH:mm'),
                      end_time: moment(selectedEvent.end).format('HH:mm'),
                      task: selectedEvent.task,
                      id: selectedEvent.id,
                    });
                    setShowModal(false);
                  }}
                
                >
                  
                  Modifier
                </button>

                <button
                  className="btn btn-danger"
                  onClick={async () => {
                    if (window.confirm('Voulez-vous supprimer cette tâche ?')) {
                      try {
                      await axios.delete(API_BASE_URL + `/plannings/${selectedEvent.id}`);
                      setShowModal(false);
                      loadEvents();
                      } catch (err) {
                        console.error('Erreur lors de la suppression:', err);
                        alert('Erreur lors de la suppression de la tâche');
                      }
                    }
                  }}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
