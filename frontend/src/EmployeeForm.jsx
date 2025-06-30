import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:4000/api';

export default function EmployeeForm({ onEmployeeAdded, selectedEmployee }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [poste, setPoste] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (selectedEmployee) {
      setNom(selectedEmployee.nom);
      setPrenom(selectedEmployee.prenom);
      setEmail(selectedEmployee.email);
      setPoste(selectedEmployee.poste);
      setTelephone(selectedEmployee.telephone);
      setPassword(''); // Ne pas afficher le mot de passe existant
    } else {
      setNom('');
      setPrenom('');
      setEmail('');
      setPoste('');
      setTelephone('');
      setPassword('');
    }
  }, [selectedEmployee]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('Soumission du formulaire...');

    const employeeData = { 
      nom, 
      prenom, 
      email, 
      poste, 
      telephone,
      password: password || 'password123' // Mot de passe par défaut si vide
    };

    console.log('Données à envoyer:', employeeData);
    console.log('URL:', selectedEmployee
      ? `${API_BASE_URL}/employees/${selectedEmployee.id}`
      : `${API_BASE_URL}/employees`);

    try {
      const res = await fetch(
        selectedEmployee
          ? `${API_BASE_URL}/employees/${selectedEmployee.id}`
          : `${API_BASE_URL}/employees`,
        {
          method: selectedEmployee ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(employeeData),
        }
      );

      console.log('Réponse reçue:', res.status, res.statusText);

      if (!res.ok) {
        const errorData = await res.text();
        console.error('Erreur serveur:', errorData);
        throw new Error(`Erreur lors de l'enregistrement du salarié: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      console.log('Succès:', result);

      // Appeler le callback AVANT de réinitialiser les champs
      onEmployeeAdded();

      // Réinitialiser les champs APRÈS le callback pour éviter les conflits
      if (!selectedEmployee) {
        // Seulement pour un nouvel employé
      setNom('');
      setPrenom('');
      setEmail('');
      setPoste('');
      setTelephone('');
        setPassword('');
      } else {
        // Pour une modification, juste vider le mot de passe
        setPassword('');
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 rounded shadow-lg"
      style={{
        maxWidth: '480px',
        backgroundColor: '#f0f7ff',
        marginRight: 'auto',
        marginLeft: 0,
        marginTop: '20px',
      }}
    >
      <h2 className="mb-4 text-center text-blue-800 font-extrabold">
        {selectedEmployee ? 'Modifier le salarié' : 'Ajouter un salarié'}
      </h2>

      <div className="mb-3">
        <label htmlFor="nom" className="form-label text-blue-700 fw-semibold">
          Nom
        </label>
        <input
          id="nom"
          type="text"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          required
          className="form-control"
          placeholder="Entrez le nom"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="prenom" className="form-label text-blue-700 fw-semibold">
          Prénom
        </label>
        <input
          id="prenom"
          type="text"
          value={prenom}
          onChange={(e) => setPrenom(e.target.value)}
          required
          className="form-control"
          placeholder="Entrez le prénom"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label text-blue-700 fw-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="form-control"
          placeholder="exemple@mail.com"
        />
      </div>

      <div className="mb-3">
        <label htmlFor="password" className="form-label text-blue-700 fw-semibold">
          Mot de passe {selectedEmployee && '(laisser vide pour ne pas changer)'}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="form-control"
          placeholder={selectedEmployee ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}
        />
        {!selectedEmployee && (
          <small className="text-muted">Laissez vide pour utiliser 'password123' par défaut</small>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="poste" className="form-label text-blue-700 fw-semibold">
          Poste
        </label>
        <input
          id="poste"
          type="text"
          value={poste}
          onChange={(e) => setPoste(e.target.value)}
          required
          className="form-control"
          placeholder="Entrez le poste"
        />
      </div>

      <div className="mb-4">
        <label
          htmlFor="telephone"
          className="form-label text-blue-700 fw-semibold"
        >
          Téléphone
        </label>
        <input
          id="telephone"
          type="tel"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
          required
          className="form-control"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <button
        type="submit"
        className="btn w-100"
        style={{
          backgroundColor: '#2563eb', // bleu vif
          color: 'white',
          fontWeight: '600',
          boxShadow:
            '0 4px 6px rgba(37, 99, 235, 0.4), 0 1px 3px rgba(37, 99, 235, 0.3)',
          transition: 'background-color 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1e40af')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
      >
        {selectedEmployee ? 'Enregistrer les modifications' : 'Ajouter'}
      </button>
    </form>
  );
}
