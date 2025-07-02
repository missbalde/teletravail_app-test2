import { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Configurer moment.js pour utiliser le français
moment.locale('fr');

// Correction filtrage mois - commit forcé pour Render

// Fonction utilitaire pour calculer la durée entre deux heures (format HH:mm ou HH:mm:ss)
function calculeDuree(start, end) {
  if (!start || !end) return '--:--:--';
  const [h1, m1, s1 = 0] = start.split(':').map(Number);
  const [h2, m2, s2 = 0] = end.split(':').map(Number);
  const t1 = h1 * 3600 + m1 * 60 + s1;
  const t2 = h2 * 3600 + m2 * 60 + s2;
  let diff = t2 - t1;
  if (diff < 0) return '--:--:--';
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  const s = diff % 60;
  return `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
}

export default function SalarieDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('statistiques');
  const [mesPointages, setMesPointages] = useState([]);
  const [mesTaches, setMesTaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const qrRef = useRef(null);
  const [qrUrl, setQrUrl] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(moment().format('YYYY-MM'));

  // Charger les pointages du salarié
  const loadMesPointages = async () => {
    if (!user?.employee_id) return;
    
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/pointages');
      const tousPointages = response.data;
      
      // Filtrer les pointages de ce salarié et du mois sélectionné
      const mesPointagesFiltres = tousPointages.filter(p =>
        String(p.employee_id) === String(user.employee_id) &&
        moment(p.date_pointage).format('YYYY-MM') === moment(selectedMonth, 'YYYY-MM').format('YYYY-MM')
      );
      
      // Créer toutes les sessions du mois
      const sessions = createSessionsMulti(mesPointagesFiltres);
      setMesPointages(sessions);
    } catch (error) {
      console.error('Erreur chargement pointages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nouvelle fonction pour regrouper les pointages en sessions (plusieurs par jour)
  function createSessionsMulti(rawPointages) {
    // On trie d'abord par date+heure
    const sorted = [...rawPointages].sort((a, b) => {
      if (a.date_pointage < b.date_pointage) return -1;
      if (a.date_pointage > b.date_pointage) return 1;
      if (a.heure_pointage < b.heure_pointage) return -1;
      if (a.heure_pointage > b.heure_pointage) return 1;
      return 0;
    });
    const sessions = [];
    let current = null;
    sorted.forEach(p => {
      if (p.type_pointage === 'arrivée' || p.type_pointage === 'arrivee') {
        // Si une session en cours sans départ, on la push quand même (cas anomalie)
        if (current && !current.exit_time) sessions.push(current);
        current = {
          date: p.date_pointage,
          entry_time: p.heure_pointage,
          exit_time: null
        };
      } else if ((p.type_pointage === 'départ' || p.type_pointage === 'depart') && current && !current.exit_time) {
        current.exit_time = p.heure_pointage;
        sessions.push(current);
        current = null;
      }
    });
    // Si une session reste ouverte (arrivée sans départ)
    if (current) sessions.push(current);
    return sessions;
  }

  // Charger les tâches du salarié
  const loadMesTaches = async () => {
    if (!user?.employee_id) return;
    
    try {
      const response = await axios.get('http://localhost:4000/api/plannings');
      const toutesTaches = response.data;
      
      console.log('Toutes les tâches reçues:', toutesTaches);
      console.log('Employee ID du salarié connecté:', user.employee_id);
      
      // Filtrer les tâches de ce salarié (utiliser user_id au lieu de employee_id)
      const mesTachesFiltrees = toutesTaches.filter(t => t.user_id === user.employee_id);
      console.log('Tâches filtrées pour ce salarié:', mesTachesFiltrees);
      
      setMesTaches(mesTachesFiltrees);
    } catch (error) {
      console.error('Erreur chargement tâches:', error);
    }
  };

  // Calculer les statistiques personnelles
  const getMesStatistiques = () => {
    const totalSessions = mesPointages.length;
    const presentCount = mesPointages.filter(p => p.entry_time).length;
    const completedCount = mesPointages.filter(p => p.entry_time && p.exit_time).length;

    // Calculer la durée totale de toutes les sessions complètes
    let totalSec = 0;
    mesPointages.forEach(s => {
      if (s.entry_time && s.exit_time) {
        const [h1, m1, s1 = 0] = s.entry_time.split(':').map(Number);
        const [h2, m2, s2 = 0] = s.exit_time.split(':').map(Number);
        const t1 = h1 * 3600 + m1 * 60 + s1;
        const t2 = h2 * 3600 + m2 * 60 + s2;
        if (!isNaN(t1) && !isNaN(t2) && t2 > t1) {
          totalSec += (t2 - t1);
        }
      }
    });

    // Formater la durée totale
    let totalDuration = '--:--';
    if (totalSec > 0) {
      const h = Math.floor(totalSec / 3600);
      const m = Math.floor((totalSec % 3600) / 60);
      const s = Math.round(totalSec % 60);
      totalDuration = `${h}h${m.toString().padStart(2, '0')}m${s.toString().padStart(2, '0')}s`;
    }

    return {
      total: totalSessions,
      present: presentCount,
      completed: completedCount,
      totalDuration
    };
  };

  useEffect(() => {
    loadMesPointages();
    loadMesTaches();
    if (user?.employee_id) {
      const url = `https://tonapp.com/pointage/qr/${user.employee_id}`;
      // QRCode.toDataURL(url, { width: 180, margin: 2 }, (err, dataUrl) => {
      //   if (!err) setQrUrl(dataUrl);
      // });
    }
  }, [user, selectedMonth]);

  // Recharger les données automatiquement toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'statistiques') {
        loadMesPointages();
      }
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [activeTab]);

  // Recharger les données quand on clique sur l'onglet statistiques
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === 'statistiques') {
      loadMesPointages();
    }
  };

  const stats = getMesStatistiques();

  const handleLogout = () => {
    logout();
  };

  if (!user) {
    return <div>Chargement...</div>;
  }
  if (!user.employee_id) {
    return <div>Erreur : employee_id manquant</div>;
  }

  // Générer l'URL à encoder dans le QR code
  // Utiliser la nouvelle adresse IP locale correcte
  const qrDataUrl = `http://192.168.10.55:5173/pointage/qr/${user.employee_id}`;
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrDataUrl)}&size=180x180`;

  // Fonction de téléchargement du QR code (version blob)
  const handleDownloadQR = async (e) => {
    e?.preventDefault?.();
    try {
      const response = await fetch(qrImgUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qrcode_${user.employee_id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Erreur lors du téléchargement du QR code');
    }
  };

  // Fonction pour télécharger la feuille de temps PDF
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.text('Feuille de temps - Historique des pointages', 14, 14);
    const tableColumn = ['Date', "Heure d'arrivée", 'Heure de départ', 'Durée', 'Statut'];
    const tableRows = mesPointages.map(session => [
      moment(session.date).format('dddd D MMMM YYYY'),
      session.entry_time || '--:--',
      session.exit_time || '--:--',
      calculeDuree(session.entry_time, session.exit_time),
      session.entry_time && session.exit_time ? 'Terminé' : session.entry_time ? 'Présent' : "Pas d'arrivée"
    ]);
    // Ajoute le total en bas
    let totalSec = 0;
    mesPointages.forEach(s => {
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
    doc.save('feuille_de_temps.pdf');
  };

  // Fonction pour télécharger la feuille de temps Excel
  const handleDownloadExcel = () => {
    const wsData = [
      ['Date', "Heure d'arrivée", 'Heure de départ', 'Durée', 'Statut'],
      ...mesPointages.map(session => [
        moment(session.date).format('dddd D MMMM YYYY'),
        session.entry_time || '--:--',
        session.exit_time || '--:--',
        calculeDuree(session.entry_time, session.exit_time),
        session.entry_time && session.exit_time ? 'Terminé' : session.entry_time ? 'Présent' : "Pas d'arrivée"
      ])
    ];
    // Ajoute le total en bas
    let totalSec = 0;
    mesPointages.forEach(s => {
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
    XLSX.writeFile(wb, 'feuille_de_temps.xlsx');
  };

  return (
    <div className="min-vh-100 bg-light" style={{ width: '100vw', margin: 0, padding: 0 }}>
      <header className="bg-success text-white py-3 shadow-sm">
        <div className="container-fluid px-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="h4 mb-0 fw-bold">Espace Salarié</h1>
              <small>Connecté en tant que {user.nom}</small>
            </div>
            <div className="d-flex gap-2">
              <a 
                href="/badgeuse" 
                className="btn btn-outline-light btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fas fa-clock me-1"></i>
                Pointr
              </a>
              <button
                onClick={handleLogout}
                className="btn btn-outline-light btn-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-4" style={{ width: '100%' }}>
        {/* QR Code personnel */}
        <div className="mb-4 d-flex flex-column align-items-center justify-content-center">
          <div className="card shadow-sm p-3" style={{ maxWidth: 260 }}>
            <div className="text-center">
              <img src={qrImgUrl} alt="QR Code personnel" width={180} height={180} style={{ borderRadius: 8, border: '1px solid #eee' }} />
              <div className="mt-2">
                <button className="btn btn-outline-primary btn-sm" onClick={handleDownloadQR}>
                  Télécharger le QR code
                </button>
              </div>
              <div className="mt-1 small text-muted" style={{ wordBreak: 'break-all' }}>
                {qrDataUrl}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation par onglets */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'statistiques' ? 'active' : ''}`}
              onClick={() => handleTabClick('statistiques')}
              type="button"
            >
              <i className="fas fa-chart-bar me-2"></i>
              Mes Statistiques
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'calendrier' ? 'active' : ''}`}
              onClick={() => handleTabClick('calendrier')}
              type="button"
            >
              <i className="fas fa-calendar me-2"></i>
              Mon Calendrier
            </button>
          </li>
        </ul>

        {/* Contenu des onglets */}
        <div className="tab-content">
          {/* Onglet Mes Statistiques */}
          <div className={`tab-pane fade ${activeTab === 'statistiques' ? 'show active' : ''}`}>
            {loading ? (
              <div className="alert alert-info">Chargement de vos statistiques...</div>
            ) : (
              <>
                {/* Filtre par mois */}
                <div className="mb-3 d-flex align-items-center gap-2">
                  <label className="form-label mb-0">Mois :</label>
                  <input type="month" className="form-control" style={{ maxWidth: 180 }} value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} />
                </div>

                {/* Statistiques personnelles */}
                <div className="d-flex gap-3 mb-4">
                  <div className="card bg-success text-white flex-fill">
                    <div className="card-body text-center py-3">
                      <h6 className="card-title mb-1">Mes Présences</h6>
                      <h4 className="mb-0">{stats.present}</h4>
                    </div>
                  </div>
                  <div className="card bg-info text-white flex-fill">
                    <div className="card-body text-center py-3">
                      <h6 className="card-title mb-1">Sessions Terminées</h6>
                      <h4 className="mb-0">{stats.completed}</h4>
                    </div>
                  </div>
                  <div className="card bg-warning text-dark flex-fill">
                    <div className="card-body text-center py-3">
                      <h6 className="card-title mb-1">Total Heures</h6>
                      <h4 className="mb-0">{stats.totalDuration}</h4>
                    </div>
                  </div>
                </div>

                {/* Tableau des pointages */}
                {mesPointages.length > 0 ? (
                  <div className="card shadow-sm">
                    <div className="card-header">
                      <h5 className="mb-0">Historique de mes pointages</h5>
                    </div>
                    <div className="card-body">
                      <div className="table-responsive">
                        <table className="table table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Date</th>
                              <th>Heure d'arrivée</th>
                              <th>Heure de départ</th>
                              <th>Durée</th>
                              <th>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mesPointages.map((session, index) => (
                              <tr key={index}>
                                <td>{moment(session.date).format('dddd D MMMM YYYY')}</td>
                                <td>{session.entry_time ? (<span className="badge bg-success">{session.entry_time}</span>) : (<span className="text-muted">--:--</span>)}</td>
                                <td>{session.exit_time ? (<span className="badge bg-danger">{session.exit_time}</span>) : (<span className="badge bg-warning text-dark">En cours</span>)}</td>
                                <td><span className="badge bg-info">{calculeDuree(session.entry_time, session.exit_time)}</span></td>
                                <td>{session.entry_time && session.exit_time ? (<span className="badge bg-secondary">Terminé</span>) : session.entry_time ? (<span className="badge bg-primary">Présent</span>) : (<span className="badge bg-light text-dark">Pas d'arrivée</span>)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    Aucun pointage trouvé pour le moment.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Onglet Mon Calendrier */}
          <div className={`tab-pane fade ${activeTab === 'calendrier' ? 'show active' : ''}`}>
            {(() => { moment.locale('fr'); return null; })()}
            {mesTaches.length > 0 ? (
              <div className="card shadow-sm">
                <div className="card-header">
                  <h5 className="mb-0">Mes tâches</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Heure de début</th>
                          <th>Heure de fin</th>
                          <th>Tâche</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mesTaches.map((tache, index) => (
                          <tr key={index}>
                            <td>{moment(tache.date).format('dddd D MMMM YYYY')}</td>
                            <td><span className="badge bg-primary">{tache.start_time}</span></td>
                            <td><span className="badge bg-info">{tache.end_time}</span></td>
                            <td><strong>{tache.task}</strong></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="alert alert-info">
                Aucune tâche assignée pour le moment.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 