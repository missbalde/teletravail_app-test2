import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import 'moment-timezone'; // Ajout pour activer .tz()
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import AdressePointage from './components/AdressePointage';
moment.locale('fr');

export default function PointageView() {
  const [pointages, setPointages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalEmployee, setModalEmployee] = useState(null);
  const [modalType, setModalType] = useState('pdf');
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  // Charger la liste des employés
  const loadEmployees = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error('Erreur chargement employés:', error);
    }
  };

  // Charge les pointages
  const loadPointages = () => {
    setLoading(true);
    setError(null);
    
    console.log('Début chargement pointages...');
    
    axios.get(`${import.meta.env.VITE_API_URL}/api/pointages`)
      .then(res => {
        console.log('Réponse API reçue:', res);
        console.log('Données pointages reçues:', res.data);
        
        if (!res.data || !Array.isArray(res.data)) {
          console.error('Données invalides reçues:', res.data);
          setError('Format de données invalide reçu du serveur');
          return;
        }
        
        // Filtrer par date si une date est sélectionnée
        let filteredPointages = res.data;
        if (selectedDate) {
          filteredPointages = res.data.filter(p => 
            moment(p.date_pointage).format('YYYY-MM-DD') === selectedDate
          );
        }
        
        console.log('Pointages filtrés:', filteredPointages);
        
        // Créer des sessions avec durée
        const sessions = createSessions(filteredPointages);
        console.log('Sessions créées:', sessions);
        setPointages(sessions);
      })
      .catch(err => {
        console.error('Erreur détaillée chargement pointages:', err);
        console.error('Message d\'erreur:', err.message);
        console.error('Réponse serveur:', err.response?.data);
        setError(`Erreur lors du chargement des pointages: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Créer des sessions avec durée
  const createSessions = (rawPointages) => {
    console.log('createSessions appelé avec:', rawPointages);
    const sessions = {};

    rawPointages.forEach(pointage => {
      console.log('Traitement pointage:', pointage);
      const key = `${pointage.employee_id}_${pointage.date_pointage}`;

      if (!sessions[key]) {
        sessions[key] = {
          employee_id: pointage.employee_id,
          nom: `${pointage.nom} ${pointage.prenom}`,
          date: pointage.date_pointage,
          entry_time: null,
          exit_time: null,
          entry_id: null,
          exit_id: null,
          latitude: null,
          longitude: null
        };
      }

      // Corriger l'inversion des types
      if (pointage.type_pointage === 'arrivée' || pointage.type_pointage === 'arrivee') {
        sessions[key].entry_time = pointage.heure_pointage;
        sessions[key].entry_id = pointage.id;
        sessions[key].latitude = pointage.latitude;
        sessions[key].longitude = pointage.longitude;
      } else if (pointage.type_pointage === 'départ' || pointage.type_pointage === 'depart') {
        sessions[key].exit_time = pointage.heure_pointage;
        sessions[key].exit_id = pointage.id;
        // On peut aussi stocker la position du départ si besoin
        // sessions[key].latitude_depart = pointage.latitude;
        // sessions[key].longitude_depart = pointage.longitude;
      }
    });

    console.log('Sessions créées:', sessions);
    return Object.values(sessions);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    loadPointages();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const formatTime = (timeString) => {
    console.log('formatTime appelé avec:', timeString);
    if (!timeString) {
      console.log('timeString est null/undefined');
      return '--:--';
    }
    try {
      // Correction : on suppose que l'heure reçue est en UTC, on l'affiche en Europe/Paris
      const localTime = moment.tz(timeString, 'HH:mm:ss', 'UTC').tz('Europe/Paris').format('HH:mm');
      console.log('Heure locale Paris:', localTime);
      return localTime;
    } catch (error) {
      console.error('Erreur formatage heure:', error, 'timeString:', timeString);
      return '--:--';
    }
  };

  const calculateDuration = (start, end) => {
    if (!start || !end) return '--:--';
    
    try {
      const startMoment = moment(start, 'HH:mm:ss');
      const endMoment = moment(end, 'HH:mm:ss');
      
      if (!startMoment.isValid() || !endMoment.isValid()) {
        return '--:--';
      }
      
      const duration = moment.duration(endMoment.diff(startMoment));
      
      if (duration.asMinutes() < 0) {
        return '--:--';
      }
      
      const hours = Math.floor(duration.asHours());
      const minutes = duration.minutes();
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Erreur calcul durée:', error);
      return '--:--';
    }
  };

  // Fonction pour supprimer un pointage
  const handleDeletePointage = async (pointageId) => {
    if (!pointageId) {
      alert('Impossible de supprimer ce pointage');
      return;
    }
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce pointage ?')) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/pointages/${pointageId}`);
        alert('Pointage supprimé avec succès !');
        loadPointages();
      } catch (err) {
        console.error('Erreur lors de la suppression:', err);
        alert('Erreur lors de la suppression du pointage');
      }
    }
  };

  // Calcul des statistiques
  const getStatistics = () => {
    console.log('=== DÉBUT CALCUL STATISTIQUES ===');
    console.log('Tous les pointages:', pointages);
    
    const totalSessions = pointages.length;
    const presentCount = pointages.filter(p => p.entry_time).length;
    const completedCount = pointages.filter(p => p.entry_time && p.exit_time).length;
    
    console.log('Sessions totales:', totalSessions);
    console.log('Présences:', presentCount);
    console.log('Sessions complétées:', completedCount);
    
    // Calculer la somme des durées moyennes de tous les salariés
    const employeeDurations = {};
    
    // Calculer la durée totale pour chaque employé
    pointages.forEach(p => {
      if (p.entry_time && p.exit_time) {
        try {
          const start = moment(p.entry_time, 'HH:mm:ss');
          const end = moment(p.exit_time, 'HH:mm:ss');
          
          if (start.isValid() && end.isValid()) {
            const duration = moment.duration(end.diff(start));
            const minutes = duration.asMinutes();
            
            console.log(`Employé ${p.employee_id} (${p.nom}): ${p.entry_time} -> ${p.exit_time} = ${minutes} minutes`);
            
            if (minutes > 0) {
              if (!employeeDurations[p.employee_id]) {
                employeeDurations[p.employee_id] = { total: 0, count: 0 };
              }
              employeeDurations[p.employee_id].total += minutes;
              employeeDurations[p.employee_id].count += 1;
            }
          }
        } catch (error) {
          console.error('Erreur calcul durée pour session:', p, error);
        }
      }
    });
    
    console.log('Durées par employé:', employeeDurations);
    
    // Calculer la somme des durées moyennes de tous les employés
    let averageDuration = '--:--';
    const employeeIds = Object.keys(employeeDurations);
    
    console.log('Nombre d\'employés avec durées:', employeeIds.length);
    
    if (employeeIds.length > 0) {
      // Calculer la moyenne de chaque employé puis faire la somme
      const employeeAverages = employeeIds.map(empId => {
        const emp = employeeDurations[empId];
        return emp.total / emp.count;
      });
      
      const sumOfAverages = employeeAverages.reduce((sum, avg) => sum + avg, 0);
      
      console.log('Moyennes par employé:', employeeAverages);
      console.log('Somme des moyennes:', sumOfAverages);
      
      const hours = Math.floor(sumOfAverages / 60);
      const minutes = Math.floor(sumOfAverages % 60);
      const seconds = Math.round((sumOfAverages % 1) * 60);
      averageDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      console.log('Somme des durées moyennes formatée:', averageDuration);
    }
    
    console.log('=== FIN CALCUL STATISTIQUES ===');
    
    return {
      total: totalSessions,
      present: presentCount,
      completed: completedCount,
      averageDuration
    };
  };

  // Fonction pour sélectionner un employé
  const handleEmployeeClick = (session) => {
    console.log('Clic sur employé:', session.employee_id, 'Actuellement sélectionné:', selectedEmployee);
    const newSelectedEmployee = selectedEmployee === session.employee_id ? null : session.employee_id;
    console.log('Nouvel employé sélectionné:', newSelectedEmployee);
    setSelectedEmployee(newSelectedEmployee);
  };

  // Calcul des statistiques pour un employé spécifique
  const getEmployeeStatistics = (employeeId) => {
    console.log('getEmployeeStatistics appelé pour employé:', employeeId);
    console.log('Tous les pointages:', pointages);
    
    const employeeSessions = pointages.filter(p => p.employee_id === employeeId);
    console.log('Sessions de l\'employé:', employeeSessions);
    
    const totalSessions = employeeSessions.length;
    const presentCount = employeeSessions.filter(p => p.entry_time).length;
    const completedCount = employeeSessions.filter(p => p.entry_time && p.exit_time).length;
    
    console.log('Statistiques calculées:', { totalSessions, presentCount, completedCount });
    
    // Calculer la durée moyenne pour cet employé
    const completedSessions = employeeSessions.filter(p => p.entry_time && p.exit_time);
    let averageDuration = '--:--';
    
    if (completedSessions.length > 0) {
      const totalMinutes = completedSessions.reduce((total, p) => {
        try {
          const start = moment(p.entry_time, 'HH:mm:ss');
          const end = moment(p.exit_time, 'HH:mm:ss');
          
          if (!start.isValid() || !end.isValid()) {
            return total;
          }
          
          const duration = moment.duration(end.diff(start));
          const minutes = duration.asMinutes();
          
          if (minutes < 0) {
            return total;
          }
          
          return total + minutes;
        } catch (error) {
          return total;
        }
      }, 0);
      
      if (totalMinutes > 0) {
        const avgMinutes = totalMinutes / completedSessions.length;
        const hours = Math.floor(avgMinutes / 60);
        const minutes = Math.floor(avgMinutes % 60);
        const seconds = Math.round((avgMinutes % 1) * 60);
        averageDuration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
    }
    
    const result = {
      total: totalSessions,
      present: presentCount,
      completed: completedCount,
      averageDuration
    };
    
    console.log('Résultat final getEmployeeStatistics:', result);
    return result;
  };

  const stats = getStatistics();

  // Fonction utilitaire pour calculer la durée entre deux heures (format HH:mm:ss)
  function calculeDuree(start, end) {
    if (!start || !end) return '--:--:--';
    const [h1, m1, s1 = 0] = (start || '').split(':').map(Number);
    const [h2, m2, s2 = 0] = (end || '').split(':').map(Number);
    const t1 = h1 * 3600 + m1 * 60 + s1;
    const t2 = h2 * 3600 + m2 * 60 + s2;
    let diff = t2 - t1;
    if (diff < 0) return '--:--:--';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
  }

  // Fonction utilitaire pour regrouper les pointages bruts en sessions (arrivée/départ par jour)
  function createSessionsFromRaw(rawPointages) {
    const sessions = {};
    rawPointages.forEach(pointage => {
      const key = `${pointage.employee_id}_${pointage.date_pointage}`;
      if (!sessions[key]) {
        sessions[key] = {
          date: pointage.date_pointage,
          entry_time: null,
          exit_time: null
        };
      }
      if (pointage.type_pointage === 'arrivée' || pointage.type_pointage === 'arrivee') {
        sessions[key].entry_time = pointage.heure_pointage;
      } else if (pointage.type_pointage === 'départ' || pointage.type_pointage === 'depart') {
        sessions[key].exit_time = pointage.heure_pointage;
      }
    });
    return Object.values(sessions);
  }

  // Ouvre la modale de sélection de mois/année
  const openDownloadModal = (emp, type) => {
    setModalEmployee(emp);
    setModalType(type);
    setSelectedMonth(moment().format('YYYY-MM'));
    setModalOpen(true);
  };

  // Ferme la modale
  const closeModal = () => {
    setModalOpen(false);
    setModalEmployee(null);
  };

  // Générer la fiche PDF pour un salarié et un mois donné
  const handleDownloadPDFMonth = () => {
    if (!modalEmployee || !selectedMonth) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/pointages?employee_id=` + modalEmployee.id)
      .then(res => {
        const allPointages = res.data || [];
        // Filtrer par mois/année
        const filtered = allPointages.filter(p => moment(p.date_pointage).format('YYYY-MM') === selectedMonth);
        const sessions = createSessionsFromRaw(filtered);
        const doc = new jsPDF();
        doc.text(`Feuille de temps - ${modalEmployee.nom} ${modalEmployee.prenom} (${selectedMonth})`, 14, 14);
        const tableColumn = ['Date', "Heure d'arrivée", 'Heure de départ', 'Durée', 'Statut'];
        const tableRows = sessions.map(session => [
          moment(session.date).format('dddd D MMMM YYYY'),
          session.entry_time || '--:--',
          session.exit_time || '--:--',
          calculeDuree(session.entry_time, session.exit_time),
          session.entry_time && session.exit_time ? 'Terminé' : session.entry_time ? 'Présent' : "Pas d'arrivée"
        ]);
        // Calcul du total
        let totalSec = 0;
        sessions.forEach(s => {
          const [h1, m1, s1 = 0] = (s.entry_time || '').split(':').map(Number);
          const [h2, m2, s2 = 0] = (s.exit_time || '').split(':').map(Number);
          const t1 = h1 * 3600 + m1 * 60 + s1;
          const t2 = h2 * 3600 + m2 * 60 + s2;
          if (!isNaN(t1) && !isNaN(t2) && t2 > t1) totalSec += (t2 - t1);
        });
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        const totalStr = `Total heures travaillées : ${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
        doc.autoTable({ head: [tableColumn], body: tableRows, startY: 22 });
        doc.text(totalStr, 14, doc.lastAutoTable.finalY + 10);
        doc.save(`fiche_${modalEmployee.nom}_${modalEmployee.prenom}_${selectedMonth}.pdf`);
        closeModal();
      })
      .catch(() => { alert('Erreur lors de la génération du PDF'); closeModal(); });
  };

  // Générer la fiche Excel pour un salarié et un mois donné
  const handleDownloadExcelMonth = () => {
    if (!modalEmployee || !selectedMonth) return;
    axios.get(`${import.meta.env.VITE_API_URL}/api/pointages?employee_id=` + modalEmployee.id)
      .then(res => {
        const allPointages = res.data || [];
        // Filtrer par mois/année
        const filtered = allPointages.filter(p => moment(p.date_pointage).format('YYYY-MM') === selectedMonth);
        const sessions = createSessionsFromRaw(filtered);
        const wsData = [
          ['Date', "Heure d'arrivée", 'Heure de départ', 'Durée', 'Statut'],
          ...sessions.map(session => [
            moment(session.date).format('dddd D MMMM YYYY'),
            session.entry_time || '--:--',
            session.exit_time || '--:--',
            calculeDuree(session.entry_time, session.exit_time),
            session.entry_time && session.exit_time ? 'Terminé' : session.entry_time ? 'Présent' : "Pas d'arrivée"
          ])
        ];
        // Calcul du total
        let totalSec = 0;
        sessions.forEach(s => {
          const [h1, m1, s1 = 0] = (s.entry_time || '').split(':').map(Number);
          const [h2, m2, s2 = 0] = (s.exit_time || '').split(':').map(Number);
          const t1 = h1 * 3600 + m1 * 60 + s1;
          const t2 = h2 * 3600 + m2 * 60 + s2;
          if (!isNaN(t1) && !isNaN(t2) && t2 > t1) totalSec += (t2 - t1);
        });
        const h = Math.floor(totalSec / 3600);
        const m = Math.floor((totalSec % 3600) / 60);
        const s = totalSec % 60;
        wsData.push([]);
        wsData.push([`Total heures travaillées : ${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`]);
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Feuille de temps');
        XLSX.writeFile(wb, `fiche_${modalEmployee.nom}_${modalEmployee.prenom}_${selectedMonth}.xlsx`);
        closeModal();
      })
      .catch(() => { alert('Erreur lors de la génération du fichier Excel'); closeModal(); });
  };

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Erreur détectée !</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-primary" 
            onClick={() => {
              setError(null);
              loadPointages();
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4" style={{ width: '100%', maxWidth: '100%' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="text-primary mb-0">Suivi des Pointages</h2>
        <div className="d-flex gap-3 align-items-center">
          <label htmlFor="dateFilter" className="form-label mb-0 fw-semibold">
            Filtrer par date :
          </label>
          <input
            type="date"
            id="dateFilter"
            className="form-control"
            value={selectedDate}
            onChange={handleDateChange}
            style={{ width: 'auto' }}
          />
        </div>
      </div>

      {loading && (
        <div className="alert alert-info" role="alert">
          Chargement des pointages en cours...
        </div>
      )}

      {!loading && pointages.length === 0 && (
        <div className="alert alert-warning" role="alert">
          <i className="fas fa-info-circle me-2"></i>
          Aucun pointage trouvé pour cette date.
        </div>
      )}

      {!loading && employees.length > 0 && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Employé</th>
                    <th>Date</th>
                    <th>Heure d'arrivée</th>
                    <th>Heure de départ</th>
                    <th>Adresse</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const session = pointages.find(
                      (s) => s.employee_id === emp.id || s.employee_id === emp.employee_id
                    );
                    return (
                      <tr
                        key={`emp_${emp.id}`}
                        onClick={() => handleEmployeeClick({ employee_id: emp.id })}
                        style={{ cursor: 'pointer' }}
                        className={selectedEmployee === emp.id ? 'table-active' : ''}
                      >
                        <td><strong>{emp.nom} {emp.prenom}</strong></td>
                        <td>{selectedDate ? moment(selectedDate).format('dddd D MMMM YYYY') : '--'}</td>
                        <td>{session && session.entry_time ? session.entry_time : '--'}</td>
                        <td>{session && session.exit_time ? session.exit_time : '--'}</td>
                        <td>
                          {session && session.latitude && session.longitude
                            ? <AdressePointage latitude={session.latitude} longitude={session.longitude} />
                            : 'Non disponible'}
                        </td>
                        <td>{session ? (session.entry_time && session.exit_time ? 'Terminé' : session.entry_time ? 'Présent' : 'Absent') : 'Absent'}</td>
                        <td>
                          <button className="btn btn-outline-primary btn-sm me-1" onClick={e => { e.stopPropagation(); openDownloadModal(emp, 'pdf'); }}>PDF</button>
                          <button className="btn btn-outline-success btn-sm" onClick={e => { e.stopPropagation(); openDownloadModal(emp, 'excel'); }}>Excel</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques */}
      {!loading && pointages.length > 0 && (
        <div className="d-flex gap-3 mt-4">
          <div className="card bg-success text-white flex-fill">
            <div className="card-body text-center py-3">
              <h6 className="card-title mb-1">
                {selectedEmployee ? 'Présences Employé' : 'Employés Présents'}
              </h6>
              <h4 className="mb-0">
                {selectedEmployee ? getEmployeeStatistics(selectedEmployee).present : stats.present}
              </h4>
            </div>
          </div>
          <div className="card bg-info text-white flex-fill">
            <div className="card-body text-center py-3">
              <h6 className="card-title mb-1">
                {selectedEmployee ? 'Finis Employé' : 'Employés Finis'}
              </h6>
              <h4 className="mb-0">
                {selectedEmployee ? getEmployeeStatistics(selectedEmployee).completed : stats.completed}
              </h4>
            </div>
          </div>
          <div className="card bg-warning text-dark flex-fill">
            <div className="card-body text-center py-3">
              <h6 className="card-title mb-1">
                {selectedEmployee ? 'Durée Moyenne Employé' : 'Durée Moyenne'}
              </h6>
              <h4 className="mb-0">
                {selectedEmployee ? getEmployeeStatistics(selectedEmployee).averageDuration : stats.averageDuration}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Message pour désélectionner */}
      {selectedEmployee && (
        <div className="text-center mt-3">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setSelectedEmployee(null)}
          >
            Voir toutes les statistiques
          </button>
        </div>
      )}

      {/* Modale de sélection du mois/année pour téléchargement fiche */}
      {modalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Télécharger la fiche de {modalEmployee?.nom} {modalEmployee?.prenom}</h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Choisir le mois :</label>
                <input type="month" className="form-control" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={closeModal}>Annuler</button>
                {modalType === 'pdf' ? (
                  <button className="btn btn-primary" onClick={handleDownloadPDFMonth}>Télécharger PDF</button>
                ) : (
                  <button className="btn btn-success" onClick={handleDownloadExcelMonth}>Télécharger Excel</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 