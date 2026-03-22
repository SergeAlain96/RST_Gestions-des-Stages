import { useEffect, useState } from 'react';
import { cvService, competenceService } from '../services/api';
import type { CV, Competence } from '../types';

export default function ProfilEtudiantPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cv, setCv] = useState<CV | null>(null);
  const [competences, setCompetences] = useState<Competence[]>([]);
  const [selectedCompetences, setSelectedCompetences] = useState<number[]>([]);

  const [titre, setTitre] = useState('CV Étudiant');
  const [resume, setResume] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [allCompetences] = await Promise.all([competenceService.getAll()]);
        setCompetences(allCompetences);

        try {
          const mine = await cvService.getMine();
          setCv(mine);
          setTitre(mine.titre || 'CV Étudiant');
          setResume(mine.resume || '');
          setLinkedin(mine.linkedin || '');
          setGithub(mine.github || '');
          setPortfolio(mine.portfolio || '');
          setDisponible(mine.disponible_pour_stage);
          setSelectedCompetences((mine.competences || []).map((c) => c.id));
        } catch {
          setCv(null);
        }
      } catch {
        setError('Impossible de charger votre profil CV.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleCompetence = (id: number) => {
    setSelectedCompetences((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const form = new FormData();
      form.append('titre', titre);
      form.append('resume', resume);
      form.append('linkedin', linkedin);
      form.append('github', github);
      form.append('portfolio', portfolio);
      form.append('disponible_pour_stage', String(disponible));
      if (file) form.append('cv_pdf', file);
      selectedCompetences.forEach((id) => form.append('competence_ids', String(id)));

      const saved = cv
        ? await cvService.updateMine(form)
        : await cvService.createMine(form);

      setCv(saved);
      setSelectedCompetences((saved.competences || []).map((c) => c.id));
      setMessage(cv ? 'CV mis à jour avec succès.' : 'CV créé avec succès.');
      setFile(null);
    } catch {
      setError('Erreur lors de la sauvegarde du CV.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto px-4 py-12">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Mon Profil Étudiant & CV</h1>
      <p className="text-gray-500 mb-6">Créez et mettez à jour votre CV pour être visible des entreprises.</p>

      {message && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm">{message}</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Titre du CV</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Résumé</label>
          <textarea value={resume} onChange={(e) => setResume(e.target.value)} rows={5} className="w-full border border-gray-300 rounded-lg px-3 py-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
            <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">GitHub</label>
            <input value={github} onChange={(e) => setGithub(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Portfolio</label>
            <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Compétences</label>
          <div className="flex flex-wrap gap-2">
            {competences.map((c) => {
              const active = selectedCompetences.includes(c.id);
              return (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => toggleCompetence(c.id)}
                  className={`px-3 py-1.5 text-sm rounded-full border ${active ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700'}`}
                >
                  {c.nom}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fichier CV (PDF)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {cv?.cv_pdf && (
            <a href={cv.cv_pdf} target="_blank" rel="noreferrer" className="block mt-2 text-sm text-blue-600 hover:underline">
              Voir le CV actuel
            </a>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={disponible} onChange={(e) => setDisponible(e.target.checked)} />
          Disponible pour un stage / emploi
        </label>

        <button type="submit" disabled={saving} className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60">
          {saving ? 'Enregistrement...' : cv ? 'Mettre à jour mon CV' : 'Créer mon CV'}
        </button>
      </form>
    </div>
  );
}
