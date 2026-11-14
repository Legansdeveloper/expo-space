import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './bootstrap';
import '../../resources/css/app.css';

const demoProjects = [
  { id: '1', team: 'Team Aurora', title: 'EduGrow', category: 'Education', poster: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80', status: 'Published', description: 'Platform pembelajaran adaptif untuk membantu siswa belajar dengan cara yang lebih personal.' },
  { id: '2', team: 'Team Nexus', title: 'Pasar Lokal', category: 'Commerce', poster: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=80', status: 'Published', description: 'Ekosistem digital yang mempertemukan UMKM lokal dengan pelanggan di sekitarnya.' },
  { id: '3', team: 'Team Solace', title: 'CareConnect', category: 'Healthcare', poster: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=900&q=80', status: 'Published', description: 'Pengalaman layanan kesehatan yang lebih mudah diakses dan terhubung.' },
];

const SESSION_KEY = 'expo-space-session';

function getSession() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

async function postAuth(path, payload) {
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
    },
    credentials: 'same-origin',
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Terjadi kesalahan. Silakan coba lagi.');
  return data.user;
}

async function capstoneRequest(path, options = {}) {
  const response = await fetch(`/capstone/data${path}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || Object.values(data.errors || {}).flat()[0] || 'Request gagal.');
  return data;
}

async function mitraRequest(path, options = {}) {
  const response = await fetch(`/mitra/data${path}`, {
    credentials: 'same-origin',
    headers: { Accept: 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '', ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }) },
    ...options,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || Object.values(data.errors || {}).flat()[0] || 'Request gagal.');
  return data;
}

function setSession(account) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({
    name: account.name,
    email: account.email,
    role: account.role,
  }));
}

function roleHome(role) {
  return role === 'capstone' ? '/capstone/dashboard' : '/mitra/dashboard';
}

function posterUrl(path) {
  if (!path) return 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80';
  return path.startsWith('http') ? path : `/storage/${path}`;
}

function Layout({ children }) {
  const path = window.location.pathname;
  const isCapstone = path.startsWith('/capstone');
  const nav = isCapstone
    ? [['Dashboard', '/capstone/dashboard', '⌂'], ['Poster', '/capstone/poster', '▣'], ['Landing page', '/capstone/landing-page', '◉'], ['Business flow', '/capstone/business-flow', '⌁'], ['Aplikasi', '/capstone/application', '▤'], ['Preview', '/capstone/preview', '◫'], ['Kuesioner', '/capstone/questionnaire', '☷']]
    : [['Dashboard', '/mitra/dashboard', '⌂'], ['Projects', '/mitra/projects', '▣'], ['Settings', '/mitra/settings', '⚙']];
  const pageTitle = isCapstone
    ? (nav.find(([, href]) => href === path)?.[0] || 'Dashboard')
    : (nav.find(([, href]) => href === path)?.[0] || 'Projects');
  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">E</span><span>Expo<span className="brand-muted">Space</span></span></div>
      <div className="workspace"><span className="workspace-dot" /> {isCapstone ? 'Capstone workspace' : 'Partner workspace'} <span>⌄</span></div>
      <nav>{nav.map(([item, href, icon]) => <a className={path === href ? 'active' : ''} href={href} key={href} aria-current={path === href ? 'page' : undefined}><span className="nav-icon">{icon}</span>{item}</a>)}</nav>
      <div className="sidebar-bottom">{isCapstone ? <a href="/login" onClick={() => sessionStorage.removeItem(SESSION_KEY)}><span className="nav-icon">↪</span> Sign out</a> : <a href="/mitra/dashboard"><span className="nav-icon">⌂</span> Browse projects</a>}</div>
    </aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumbs">Workspace <span>/</span> {isCapstone ? `Capstone / ${pageTitle}` : pageTitle}</div><div className="top-actions"><a className="icon-button" href={isCapstone ? '/capstone/preview' : '/mitra/projects'} aria-label="Explore projects">⌕</a><a className="avatar" href={isCapstone ? '/capstone/dashboard' : '/mitra/settings'} aria-label="Account settings">AR</a></div></header>{children}</main>
  </div>;
}

function AuthShell({ children, eyebrow, title, description }) {
  return <div className="login-page"><div className="login-art"><div className="brand light"><span className="brand-mark">E</span> ExpoSpace</div><div className="login-quote"><span className="quote-mark">“</span><h1>Bring every<br /><em>expo project</em><br />to life.</h1><p>A single space for teams to share their work and partners to discover what’s next.</p></div><div className="login-orb orb-one" /><div className="login-orb orb-two" /></div><div className="login-form-wrap"><div className="login-form"><div className="mobile-brand brand"><span className="brand-mark">E</span> ExpoSpace</div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p className="muted">{description}</p>{children}</div></div></div>;
}

function Login() {
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  return <AuthShell eyebrow="WELCOME BACK" title="Sign in to your workspace" description="Enter your details to continue to ExpoSpace."><form onSubmit={async (event) => { event.preventDefault(); setError(''); setSubmitting(true); const form = new FormData(event.currentTarget); try { const account = await postAuth('/auth/login', { email: form.get('email'), password: form.get('password') }); setSession(account); window.location.href = roleHome(account.role); } catch (submitError) { setError(submitError.message); } finally { setSubmitting(false); } }}><label>Email address<input name="email" type="email" placeholder="you@company.com" required /></label><label>Password<input name="password" type="password" placeholder="••••••••" required /></label>{error && <p className="form-error">{error}</p>}<div className="form-row"><label className="check"><input type="checkbox" /> Remember me</label><a href="#">Forgot password?</a></div><button className="primary-button full" type="submit" disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'} <span>→</span></button></form><p className="login-help">Don’t have an account? <a href="/signup">Create an account</a></p></AuthShell>;
}

function Signup() {
  const [role, setRole] = React.useState('mitra');
  const [error, setError] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  return <AuthShell eyebrow="GET STARTED" title="Create your workspace account" description="Join ExpoSpace and start discovering or sharing projects."><form onSubmit={async (event) => { event.preventDefault(); setError(''); setSubmitting(true); const form = new FormData(event.currentTarget); try { const account = await postAuth('/auth/register', { name: form.get('name'), email: form.get('email'), password: form.get('password'), role }); setSession(account); window.location.href = roleHome(account.role); } catch (submitError) { setError(submitError.message); } finally { setSubmitting(false); } }}><label>Full name<input name="name" type="text" placeholder="Your full name" required /></label><label>Email address<input name="email" type="email" placeholder="you@company.com" required /></label><label>Password<input name="password" type="password" placeholder="At least 8 characters" minLength="8" required /></label><fieldset className="role-field"><legend>I’m joining as</legend><div className="role-options"><label className={role === 'mitra' ? 'role-option selected' : 'role-option'}><input type="radio" name="role" value="mitra" checked={role === 'mitra'} onChange={() => setRole('mitra')} /><span><strong>Mitra</strong><small>Explore Capstone projects</small></span></label><label className={role === 'capstone' ? 'role-option selected' : 'role-option'}><input type="radio" name="role" value="capstone" checked={role === 'capstone'} onChange={() => setRole('capstone')} /><span><strong>Capstone team</strong><small>Share your project work</small></span></label></div></fieldset>{error && <p className="form-error">{error}</p>}<button className="primary-button full" type="submit" disabled={submitting}>{submitting ? 'Creating account...' : 'Create account'} <span>→</span></button></form><p className="login-help">Already have an account? <a href="/login">Sign in</a></p></AuthShell>;
}

function StatusBadge({ children = 'Published' }) { return <span className="status-badge"><span />{children}</span>; }

function ProjectCard({ project }) {
  return <article className="project-card"><div className="card-image"><img src={posterUrl(project.poster?.poster_image)} alt={`${project.project_title} poster`} /><span className="card-category">{project.category || 'Uncategorized'}</span><button className="card-more">•••</button></div><div className="card-body"><div className="team-label"><span className="team-avatar">{project.team_name.slice(0, 2).toUpperCase()}</span>{project.team_name}</div><h3>{project.project_title}</h3><p>{project.project_description || 'Project Capstone yang siap untuk dieksplorasi.'}</p><div className="card-footer"><StatusBadge /><a href={`/mitra/project/${project.id}`}>View project <span>→</span></a></div></div></article>;
}

function VoteChart({ teams }) {
  const maxVotes = Math.max(...teams.map((team) => Number(team.votes) || 0), 0);
  const intervalCount = Math.min(4, Math.max(1, maxVotes));
  const tickStep = Math.max(1, Math.ceil(maxVotes / intervalCount));
  const axisMax = tickStep * intervalCount;
  const width = Math.max(520, teams.length * 136 + 64);
  const left = 48;
  const right = 16;
  const top = 18;
  const bottom = 218;
  const plotHeight = bottom - top;
  const slotWidth = (width - left - right) / teams.length;
  const truncate = (label) => label.length > 16 ? `${label.slice(0, 13)}...` : label;
  const points = teams.map((team, index) => {
    const votes = Number(team.votes) || 0;
    return {
      team,
      votes,
      x: left + slotWidth * index + slotWidth / 2,
      y: bottom - (votes / axisMax) * plotHeight,
    };
  });

  return <div className="vote-graph-scroll"><svg className="vote-graph" viewBox={`0 0 ${width} 284`} role="img" aria-label="Grafik jumlah vote per tim">
    <g className="vote-graph-axis">
      {Array.from({ length: intervalCount + 1 }, (_, index) => {
        const value = index * tickStep;
        const y = bottom - (value / axisMax) * plotHeight;
        return <g key={value}><line x1={left} y1={y} x2={width - right} y2={y} /><text x={left - 10} y={y + 4}>{value}</text></g>;
      })}
    </g>
    <text className="vote-graph-axis-title" x={left} y="10">Jumlah vote</text>
    {points.map(({ team, votes, x, y }, index) => {
      const title = `${team.team_name} - ${team.project_title}: ${votes} vote`;
      return <g key={team.id}>
        <title>{title}</title>
        <rect className={`vote-graph-bar${index === 0 && votes > 0 ? ' first' : ''}`} x={x - 22} y={y} width="44" height={bottom - y} rx="6" />
        <text className="vote-graph-value" x={x} y={Math.max(top + 13, y - 10)}>{votes}</text>
        <text className="vote-graph-team" x={x} y={bottom + 24}>{truncate(team.team_name)}</text>
        <text className="vote-graph-project" x={x} y={bottom + 42}>{truncate(team.project_title)}</text>
      </g>;
    })}
  </svg></div>;
}

function PartnerDashboard() {
  const [projects, setProjects] = React.useState([]);
  const [teamVotes, setTeamVotes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState(null);
  const [statsError, setStatsError] = React.useState('');
  const [projectsError, setProjectsError] = React.useState('');
  const [voteError, setVoteError] = React.useState('');
  const [votesLoading, setVotesLoading] = React.useState(true);
  React.useEffect(() => {
    fetch('/api/projects?per_page=3')
      .then((response) => { if (!response.ok) throw new Error('Gagal memuat project.'); return response.json(); })
      .then((data) => setProjects(data.data || []))
      .catch((requestError) => setProjectsError(requestError.message))
      .finally(() => setLoading(false));
    fetch('/api/projects/votes')
      .then((response) => { if (!response.ok) throw new Error('Gagal memuat analisis vote.'); return response.json(); })
      .then((data) => setTeamVotes(data.data || []))
      .catch((requestError) => setVoteError(requestError.message))
      .finally(() => setVotesLoading(false));
    fetch('/api/projects/stats')
      .then((response) => { if (!response.ok) throw new Error('Gagal memuat ringkasan dashboard.'); return response.json(); })
      .then(setStats)
      .catch((requestError) => setStatsError(requestError.message));
  }, []);
  const topVoted = teamVotes.slice(0, 5);
  const session = getSession();
  return <Layout><section className="page-container"><div className="page-heading"><div><p className="eyebrow">MITRA DASHBOARD</p><h1>Selamat datang, <em>{session?.name || 'Mitra'}.</em></h1><p className="muted">Temukan proyek terbaru dan lihat respons dari Mitra.</p></div><a className="primary-button" href="/mitra/projects">Jelajahi proyek <span>→</span></a></div>
    <div className="stats-row dashboard-stats">{statsError && <p className="form-error">{statsError}</p>}{!statsError && !stats && <p className="muted">Memuat ringkasan...</p>}{stats && <><div><span className="stat-value">{stats.projects}</span><span className="stat-label">Proyek dipublikasikan</span></div><div><span className="stat-value">{stats.teams}</span><span className="stat-label">Tim Capstone</span></div><div><span className="stat-value">{stats.categories}</span><span className="stat-label">Kategori</span></div></>}</div>
    <section className="vote-chart" aria-labelledby="vote-chart-title"><div className="vote-chart-heading"><div><p className="eyebrow">MITRA VOTES</p><h2 id="vote-chart-title">Tim dengan vote terbanyak</h2><p className="muted">Satu kuesioner yang dikirim dihitung sebagai satu vote.</p></div></div>{voteError && <p className="form-error">{voteError}</p>}{votesLoading ? <p className="muted">Memuat analisis vote...</p> : voteError ? null : topVoted.length === 0 ? <p className="muted">Belum ada tim yang memublikasikan proyek.</p> : <VoteChart teams={topVoted} />}</section>
    <div className="section-heading dashboard-section-heading"><div><h2>Proyek terbaru</h2><p className="muted">Jelajahi karya terbaru dari tim Capstone.</p></div><a className="outline-button" href="/mitra/projects">Semua proyek <span>→</span></a></div>{projectsError && <p className="form-error">{projectsError}</p>}{loading && <p className="muted">Memuat proyek...</p>}{!loading && !projectsError && projects.length === 0 && <div className="empty-state"><h3>Belum ada proyek</h3><p className="muted">Proyek yang dipublikasikan akan muncul di sini.</p></div>}{projects.length > 0 && <div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div>}
  </section></Layout>;
}

function PartnerProjects() {
  const [searchInput, setSearchInput] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [categories, setCategories] = React.useState([]);
  const [projects, setProjects] = React.useState([]);
  const [pagination, setPagination] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    fetch('/api/projects/categories')
      .then((response) => { if (!response.ok) throw new Error('Gagal memuat kategori proyek.'); return response.json(); })
      .then(setCategories)
      .catch((requestError) => setError(requestError.message));
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  React.useEffect(() => {
    const params = new URLSearchParams({ page: String(page), per_page: '12' });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    setLoading(true);
    setError('');
    fetch(`/api/projects?${params}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Gagal memuat proyek.');
        return data;
      })
      .then((data) => { setProjects(data.data || []); setPagination(data); })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [page, search, category]);

  return <Layout><section className="page-container"><div className="page-heading"><div><p className="eyebrow">PROJECT SHOWCASE</p><h1>Jelajahi <em>proyek.</em></h1><p className="muted">Temukan karya terbaru dari tim Capstone dan pilih proyek untuk dipelajari.</p></div></div>
    <div className="project-toolbar"><label className="search-box">⌕<input aria-label="Cari proyek" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Cari nama tim, proyek, kategori..." /></label><select aria-label="Filter kategori" value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">Semua kategori</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select><span className="project-total">{pagination ? `${pagination.total} proyek` : ''}</span></div>
    {error && <p className="form-error">{error}</p>}{loading && <p className="muted">Memuat proyek...</p>}{!loading && !error && projects.length === 0 && <div className="empty-state"><h3>Proyek tidak ditemukan</h3><p className="muted">Coba ubah kata kunci atau kategori pilihan Anda.</p><button className="outline-button" onClick={() => { setSearchInput(''); setSearch(''); setCategory(''); setPage(1); }}>Hapus filter</button></div>}
    {!loading && projects.length > 0 && <><div className="project-grid">{projects.map((project) => <ProjectCard project={project} key={project.id} />)}</div><div className="pagination"><span className="muted">Halaman {pagination.current_page} dari {pagination.last_page}</span><div><button className="outline-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>Sebelumnya</button><button className="outline-button" disabled={page >= pagination.last_page} onClick={() => setPage((current) => current + 1)}>Berikutnya</button></div></div></>}
  </section></Layout>;
}

function PartnerSettings() {
  const session = getSession();
  const [name, setName] = React.useState(session?.name || '');
  const [email, setEmail] = React.useState(session?.email || '');
  const [profileReady, setProfileReady] = React.useState(Boolean(session));
  const [loadingProfile, setLoadingProfile] = React.useState(!session);
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (session) return;
    fetch('/auth/profile', { credentials: 'same-origin', headers: { Accept: 'application/json' } })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 401) return null;
        if (!response.ok) throw new Error(data.message || 'Gagal memuat profil.');
        return data.user;
      })
      .then((user) => {
        if (user) {
          setName(user.name);
          setEmail(user.email);
          setSession(user);
          setProfileReady(true);
        }
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoadingProfile(false));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setError('');
    setSaved('');
    setSaving(true);
    try {
      const response = await fetch('/auth/profile', {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || Object.values(data.errors || {}).flat()[0] || 'Gagal menyimpan profil.');
      setSession(data.user);
      setName(data.user.name);
      setEmail(data.user.email);
      setSaved('Perubahan profil berhasil disimpan.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const signOut = async () => {
    setError('');
    setSigningOut(true);
    try {
      await postAuth('/auth/logout', {});
      sessionStorage.removeItem(SESSION_KEY);
      window.location.href = '/login';
    } catch (requestError) {
      setError(requestError.message);
      setSigningOut(false);
    }
  };

  return <Layout><section className="page-container"><div className="page-heading"><div><p className="eyebrow">PREFERENSI AKUN</p><h1>Pengaturan <em>akun.</em></h1><p className="muted">Kelola informasi profil yang digunakan di workspace ExpoSpace.</p></div></div>
    {loadingProfile ? <p className="muted">Memuat informasi akun...</p> : profileReady ? <form className="settings-card" onSubmit={saveProfile}><div className="settings-card-heading"><div className="avatar settings-avatar">{name.trim().slice(0, 2).toUpperCase() || 'MI'}</div><div><h2>Informasi profil</h2><p className="muted">Perbarui nama dan email akun Anda.</p></div></div><label>Nama<input value={name} onChange={(event) => setName(event.target.value)} maxLength="255" required /></label><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength="255" required /></label><div className="settings-role"><span className="settings-role-icon">✓</span><div><strong>Workspace Mitra</strong><p className="muted">Akun ini digunakan untuk menjelajahi proyek Capstone.</p></div></div>{error && <p className="form-error">{error}</p>}{saved && <p className="form-success">{saved}</p>}<div className="form-actions"><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan perubahan'}</button><button className="danger-button" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Keluar...' : 'Keluar dari akun'}</button></div></form> : <div className="settings-card"><h2>Masuk untuk mengatur akun</h2><p className="muted">Silakan masuk agar bisa memperbarui informasi profil Anda.</p>{error && <p className="form-error">{error}</p>}<a className="primary-button" href="/login">Masuk <span>→</span></a></div>}
  </section></Layout>;
}

function CapstoneDashboard() {
  const items = [['Poster', 'Upload your project poster', true], ['Landing page', 'Add your live landing page URL', true], ['Business flow', 'Add a flow diagram or link', false], ['Application', 'Add your application URL', false]];
  const session = getSession();
  if (!session || session.role !== 'capstone') return <Navigate to="/login" replace />;
  const [team, setTeam] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [message, setMessage] = React.useState('');
  const section = window.location.pathname.split('/')[2] || 'dashboard';
  React.useEffect(() => { capstoneRequest('').then((data) => setTeam(data.team)).catch((error) => setMessage(error.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <Layout><section className="page-container"><p className="muted">Loading workspace...</p></section></Layout>;
  if (section === 'preview') return <Layout><CapstonePreview team={team} /></Layout>;
  if (section === 'questionnaire') return <Layout><QuestionnaireEditor /></Layout>;
  if (section !== 'dashboard') return <Layout><ComponentEditor type={section} team={team} onSaved={(data) => setTeam({ ...team, ...data })} /></Layout>;
  const complete = [team?.poster, team?.landing_page, team?.business_flow, team?.application].filter(Boolean).length;
  if (!team) return <Layout><TeamEditor onSaved={setTeam} /></Layout>;
  return <Layout><section className="page-container"><div className="page-heading"><div><p className="eyebrow">CAPSTONE WORKSPACE</p><h1>Good morning, <em>{session.name || 'Capstone team'}.</em></h1><p className="muted">Here’s what’s happening with your Expo project.</p></div><div className="form-actions"><a className="outline-button" href="/capstone/preview">Preview project <span>↗</span></a>{team.is_published ? <StatusBadge>Published to Mitra</StatusBadge> : <button className="primary-button" disabled={complete !== 4} onClick={async () => { try { const data = await capstoneRequest('/publish', { method: 'POST' }); setTeam(data.team); setMessage('Project berhasil dipublikasikan. Sekarang project tampil di dashboard Mitra.'); } catch (e) { setMessage(e.message); } }}>{complete === 4 ? 'Publish project' : `Complete ${4 - complete} more section${4 - complete > 1 ? 's' : ''}`}</button>}</div></div>{message && <p className="form-success">{message}</p>}<div className="completion-card"><div><p className="eyebrow">PROJECT COMPLETION</p><div className="completion-number">{Math.round(complete / 4 * 100)}<span>%</span></div><p className="muted">{team.is_published ? 'Project sudah terlihat di dashboard Mitra.' : 'Lengkapi semua section, lalu klik Publish project agar terlihat oleh Mitra.'}</p></div><div className="progress-ring"><strong>{complete}/4</strong><span>sections<br />complete</span></div></div><div className="section-heading"><div><h2>{team.project_title}</h2><p className="muted">{team.project_description || 'Manage each part of your project from here.'}</p></div><a className="outline-button" href="/capstone/dashboard">Edit project info</a></div><div className="section-list">{items.map(([title, subtitle], index) => { const key = title === 'Poster' ? 'poster' : title === 'Landing page' ? 'landing_page' : title === 'Business flow' ? 'business_flow' : 'application'; const done = Boolean(team[key]); const slug = title.toLowerCase().replace(' ', '-'); return <div className="section-item" key={title}><div className={`section-number ${done ? 'done' : ''}`}>{done ? '✓' : `0${index + 1}`}</div><div className="section-copy"><h3>{title}</h3><p>{done ? 'Saved in your project' : subtitle}</p></div><span className={done ? 'complete-text' : 'incomplete-text'}>{done ? 'Complete' : 'Not started'}</span><a href={`/capstone/${slug}`} className="outline-button">{done ? 'Edit' : 'Add'} <span>→</span></a></div>; })}</div></section></Layout>;
}

function QuestionnaireEditor() {
  const [questions, setQuestions] = React.useState([]);
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState('');
  React.useEffect(() => { capstoneRequest('/questionnaire').then((data) => setQuestions(data.questions)).catch((e) => setError(e.message)); }, []);
  const updateQuestion = (index, key, value) => setQuestions((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const addQuestion = () => setQuestions((current) => [...current, { section: 'Bagian baru', question: '' }]);
  const removeQuestion = (index) => setQuestions((current) => current.filter((_, itemIndex) => itemIndex !== index));
  return <section className="page-container"><div className="page-heading"><div><p className="eyebrow">CAPSTONE SETUP</p><h1>Partner <em>questionnaire.</em></h1><p className="muted">Atur pertanyaan yang wajib dijawab Mitra untuk project Anda.</p></div><button className="outline-button" onClick={addQuestion}>+ Add question</button></div><p className="questionnaire-note">Gunakan skala 1–5: 1 Sangat Tidak Setuju sampai 5 Sangat Setuju. Template 10 pertanyaan sudah disiapkan dan masih bisa diedit.</p><form className="question-list" onSubmit={async (event) => { event.preventDefault(); try { const data = await capstoneRequest('/questionnaire', { method: 'PUT', body: JSON.stringify({ questions }) }); setQuestions(data.questions); setSaved('Pertanyaan berhasil disimpan.'); } catch (e) { setError(e.message); } }}>{questions.map((item, index) => <div className="question-item" key={`${index}-${item.id || 'new'}`}><div className="question-index">{String(index + 1).padStart(2, '0')}</div><div className="question-fields"><input value={item.section || ''} onChange={(event) => updateQuestion(index, 'section', event.target.value)} placeholder="Bagian / kategori" /><textarea value={item.question || ''} onChange={(event) => updateQuestion(index, 'question', event.target.value)} placeholder="Tulis pertanyaan..." rows="2" required /></div><button type="button" className="remove-question" onClick={() => removeQuestion(index)}>×</button></div>)}{error && <p className="form-error">{error}</p>}{saved && <p className="form-success">{saved}</p>}<button className="primary-button" type="submit">Save questionnaire</button></form></section>;
}

function MitraQuestionnaire({ projectId, onComplete }) {
  const [data, setData] = React.useState(null);
  const [answers, setAnswers] = React.useState({});
  const [respondent, setRespondent] = React.useState({ respondent_name: '', respondent_address: '', respondent_affiliation: '' });
  const [error, setError] = React.useState('');
  React.useEffect(() => { mitraRequest(`/questionnaire/${projectId}`).then(setData).catch((e) => setError(e.message)); }, [projectId]);
  if (error) return <section className="detail-container"><p className="form-error">{error}</p><a className="back-link" href="/mitra/dashboard">← Back to projects</a></section>;
  if (!data) return <section className="detail-container"><p className="muted">Loading questionnaire...</p></section>;
  return <section className="detail-container"><a className="back-link" href={`/mitra/project/${projectId}`}>← Back to project</a><div className="questionnaire-header"><p className="eyebrow">PROJECT FEEDBACK</p><h1>Help us improve <em>{data.team.project_title}.</em></h1><p className="muted">Isi identitas responden dan penilaian Anda. Partisipasi kuesioner tetap opsional.</p></div><form className="mitra-questionnaire" onSubmit={async (event) => { event.preventDefault(); setError(''); try { await mitraRequest(`/questionnaire/${projectId}`, { method: 'POST', body: JSON.stringify({ ...respondent, answers }) }); onComplete(); } catch (e) { setError(e.message); } }}><div className="respondent-fields"><h2>Identitas responden</h2><label>Nama / nama instansi<input name="respondent_name" value={respondent.respondent_name} onChange={(event) => setRespondent((current) => ({ ...current, respondent_name: event.target.value }))} maxLength="255" required /></label><label>Alamat<textarea name="respondent_address" value={respondent.respondent_address} onChange={(event) => setRespondent((current) => ({ ...current, respondent_address: event.target.value }))} rows="3" maxLength="1000" required /></label><label>Asal responden <span className="optional-label">(opsional)</span><select name="respondent_affiliation" value={respondent.respondent_affiliation} onChange={(event) => setRespondent((current) => ({ ...current, respondent_affiliation: event.target.value }))}><option value="">Pilih asal responden</option><option value="internal_ti">Internal Jurusan TI</option><option value="external">Dari luar</option></select></label></div>{data.questions.map((item, index) => <div className="rating-question" key={item.id}><div><span className="question-number">{index + 1}</span><span>{item.question}</span></div><div className="rating-options">{[1, 2, 3, 4, 5].map((score) => <label key={score} className={Number(answers[item.id]) === score ? 'rating selected' : 'rating'}><input type="radio" name={`question-${item.id}`} value={score} onChange={() => setAnswers((current) => ({ ...current, [item.id]: score }))} required /><strong>{score}</strong><small>{score === 1 ? 'STS' : score === 2 ? 'TS' : score === 3 ? 'N' : score === 4 ? 'S' : 'SS'}</small></label>)}</div></div>)}{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Submit questionnaire <span>→</span></button></form></section>;
}

function IframeZoomPreview({ src, title }) {
  const [zoom, setZoom] = React.useState(1);

  const adjustZoom = (next) => {
    const clamped = Math.min(1.8, Math.max(0.6, next));
    setZoom(Number(clamped.toFixed(2)));
  };

  return <div className="iframe-zoom-shell">
    <div className="iframe-zoom-controls">
      <button type="button" onClick={() => adjustZoom(zoom - 0.1)} aria-label="Zoom out">−</button>
      <span>{Math.round(zoom * 100)}%</span>
      <button type="button" onClick={() => adjustZoom(zoom + 0.1)} aria-label="Zoom in">+</button>
      <button type="button" className="reset" onClick={() => setZoom(1)}>Reset</button>
    </div>
    <div className="iframe-viewport">
      <div className="iframe-content" style={{ transform: `scale(${zoom})`, width: `${100 / zoom}%`, height: `${620 / zoom}px` }}>
        <iframe className="project-iframe" src={src} title={title} />
      </div>
    </div>
  </div>;
}

function CapstonePreview({ team }) {
  const [tab, setTab] = React.useState('landing');
  const content = tab === 'landing' ? team.landing_page : tab === 'business' ? team.business_flow : team.application;
  const url = tab === 'landing' ? content?.landing_page_url : tab === 'business' ? content?.business_flow_url : content?.application_url;
  const title = tab === 'landing' ? 'Landing page' : tab === 'business' ? 'Business flow' : 'Application';
  const complete = [team.poster, team.landing_page, team.business_flow, team.application].filter(Boolean).length;

  return <section className="page-container preview-page">
    <a className="back-link" href="/capstone/dashboard">← Back to dashboard</a>
    <div className="preview-title-row">
      <div><p className="eyebrow">PROJECT PREVIEW</p><h1>{team.project_title}</h1><p className="muted">{team.team_name} · {team.category || 'Capstone project'}</p></div>
      <StatusBadge>{team.is_published ? 'Published' : 'Draft'}</StatusBadge>
    </div>
    <div className="preview-summary">
      <img src={posterUrl(team.poster?.poster_image)} alt={`${team.project_title} poster`} />
      <div><p className="eyebrow">ABOUT THIS PROJECT</p><p className="preview-description">{team.project_description || 'Belum ada deskripsi project.'}</p><div className="preview-progress"><strong>{complete}/4</strong><span>project sections complete</span></div></div>
    </div>
    <div className="tabs"><button className={`tab ${tab === 'landing' ? 'active' : ''}`} onClick={() => setTab('landing')}>Landing page</button><button className={`tab ${tab === 'business' ? 'active' : ''}`} onClick={() => setTab('business')}>Business flow</button><button className={`tab ${tab === 'application' ? 'active' : ''}`} onClick={() => setTab('application')}>Application</button></div>
    <div className="preview-panel"><div className="preview-header"><div><h2>{title}</h2><p className="muted">Preview yang akan dilihat oleh Mitra.</p></div>{url && <a className="outline-button" href={url} target="_blank" rel="noreferrer">Open in new tab ↗</a>}</div>{tab === 'business' && content?.business_flow_type === 'image' ? <div className="preview-image-wrap"><img className="business-flow-image" src={posterUrl(content.business_flow_image)} alt="Business flow diagram" /></div> : url ? (tab === 'business' ? <IframeZoomPreview src={url} title={title} /> : <iframe className="project-iframe" src={url} title={title} />) : <div className="iframe-placeholder"><div className="placeholder-icon">↗</div><h3>{title} belum tersedia</h3><p>Lengkapi bagian ini dari dashboard Capstone agar preview dapat ditampilkan.</p><a className="primary-button" href={`/capstone/${tab === 'landing' ? 'landing-page' : tab === 'business' ? 'business-flow' : 'application'}`}>Manage {title}</a></div>}</div>
  </section>;
}

function TeamEditor({ onSaved }) {
  const [error, setError] = React.useState('');
  return <section className="page-container"><p className="eyebrow">FIRST SETUP</p><h1>Create your project</h1><p className="muted">Isi informasi dasar tim sebelum mengelola komponen project.</p><form className="crud-form" onSubmit={async (event) => { event.preventDefault(); try { const form = new FormData(event.currentTarget); const data = await capstoneRequest('/team', { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); onSaved(data.team); } catch (e) { setError(e.message); } }}><label>Team name<input name="team_name" required placeholder="Team Aurora" /></label><label>Project title<input name="project_title" required placeholder="Nama project" /></label><label>Category<input name="category" placeholder="Education" /></label><label>Description<textarea name="project_description" rows="4" /></label>{error && <p className="form-error">{error}</p>}<button className="primary-button" type="submit">Save project</button></form></section>;
}

function ComponentEditor({ type, team, onSaved }) {
  const [error, setError] = React.useState('');
  const [saved, setSaved] = React.useState('');
  const labels = { poster: 'Poster', 'landing-page': 'Landing page', 'business-flow': 'Business flow', application: 'Application' };
  const [flowType, setFlowType] = React.useState(team?.business_flow?.business_flow_type || 'url');
  if (!team) return <section className="page-container"><p className="form-error">Buat informasi project terlebih dahulu dari dashboard.</p><a className="outline-button" href="/capstone/dashboard">Kembali ke dashboard</a></section>;
  const save = async (event) => { event.preventDefault(); setError(''); setSaved(''); try { const form = new FormData(event.currentTarget); if (type === 'poster') { await capstoneRequest('/poster', { method: 'POST', body: form }); } else { if (type === 'business-flow') { form.set('business_flow_type', flowType); if (flowType === 'url') form.delete('business_flow_image'); else form.delete('business_flow_url'); await capstoneRequest(`/component/${type}`, { method: 'POST', body: form }); } else { await capstoneRequest(`/component/${type}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(form)) }); } } setSaved('Perubahan berhasil disimpan.'); onSaved({}); } catch (e) { setError(e.message); } };
  const remove = async () => { if (!window.confirm('Hapus komponen ini?')) return; try { await capstoneRequest(`/component/${type}`, { method: 'DELETE' }); setSaved('Komponen berhasil dihapus.'); onSaved({}); } catch (e) { setError(e.message); } };
  return <section className="page-container"><a className="back-link" href="/capstone/dashboard">← Back to dashboard</a><div className="page-heading crud-heading"><div><p className="eyebrow">PROJECT COMPONENT</p><h1>Manage <em>{labels[type]}</em></h1><p className="muted">Data ini tersimpan untuk {team.team_name}.</p></div></div><form className="crud-form" onSubmit={save}>{type === 'poster' && <label>Poster image<input name="poster_image" type="file" accept="image/png,image/jpeg,image/webp" required={!team.poster} /></label>}{type === 'landing-page' && <label>Landing page URL<input name="landing_page_url" type="url" defaultValue={team.landing_page?.landing_page_url || ''} placeholder="https://example.com" required /></label>}{type === 'application' && <label>Application URL<input name="application_url" type="url" defaultValue={team.application?.application_url || ''} placeholder="https://app.example.com" required /></label>}{type === 'business-flow' && <><label>Method<select value={flowType} onChange={(event) => setFlowType(event.target.value)}><option value="url">URL</option><option value="image">Image</option></select></label>{flowType === 'url' ? <label>Business flow URL<input name="business_flow_url" type="url" defaultValue={team.business_flow?.business_flow_url || ''} placeholder="https://..." required /></label> : <label>Business flow image<input name="business_flow_image" type="file" accept="image/png,image/jpeg,image/webp" required={!team.business_flow?.business_flow_image} /></label>}</>}{error && <p className="form-error">{error}</p>}{saved && <p className="form-success">{saved}</p>}<div className="form-actions"><button className="primary-button" type="submit">Save changes</button>{(team.poster || team[type === 'landing-page' ? 'landing_page' : type]) && <button className="danger-button" type="button" onClick={remove}>Delete</button>}</div></form></section>;
}

function ProjectDetail() {
  const projectId = window.location.pathname.split('/').pop();
  const [project, setProject] = React.useState(null);
  const [error, setError] = React.useState('');
  const [tab, setTab] = React.useState('landing');
  React.useEffect(() => { fetch(`/api/projects/${projectId}`).then((response) => { if (!response.ok) throw new Error('Project tidak ditemukan atau belum dipublikasikan.'); return response.json(); }).then(setProject).catch((requestError) => setError(requestError.message)); }, [projectId]);
  if (error) return <Layout><section className="detail-container"><a className="back-link" href="/mitra/dashboard">← Back to projects</a><p className="form-error">{error}</p></section></Layout>;
  if (!project) return <Layout><section className="detail-container"><p className="muted">Loading project...</p></section></Layout>;
  const content = tab === 'landing' ? project.landing_page : tab === 'business' ? project.business_flow : project.application;
  const url = tab === 'landing' ? content?.landing_page_url : tab === 'business' ? content?.business_flow_url : content?.application_url;
  return <Layout><section className="detail-container"><a className="back-link" href="/mitra/dashboard">← Back to projects</a><div className="detail-hero"><img src={posterUrl(project.poster?.poster_image)} alt={project.project_title} /><div><StatusBadge /><p className="eyebrow">CAPSTONE PROJECT</p><h1>{project.project_title}</h1><p className="team-label"><span className="team-avatar">{project.team_name.slice(0, 2).toUpperCase()}</span>{project.team_name}</p><p className="muted">{project.project_description}</p><a className="primary-button questionnaire-link" href={`/mitra/questionnaire/${projectId}`}>Isi kuesioner <span>→</span></a></div></div><div className="tabs"><button className={`tab ${tab === 'landing' ? 'active' : ''}`} onClick={() => setTab('landing')}>Landing page</button><button className={`tab ${tab === 'business' ? 'active' : ''}`} onClick={() => setTab('business')}>Business flow</button><button className={`tab ${tab === 'application' ? 'active' : ''}`} onClick={() => setTab('application')}>Application</button></div><div className="preview-panel"><div className="preview-header"><div><h2>{tab === 'landing' ? 'Landing page' : tab === 'business' ? 'Business flow' : 'Application'}</h2><p className="muted">Live preview of the project content.</p></div>{url && <a className="outline-button" href={url} target="_blank" rel="noreferrer">Open in new tab ↗</a>}</div>{tab === 'business' && content?.business_flow_type === 'image' ? <img className="business-flow-image" src={posterUrl(content.business_flow_image)} alt="Business flow" /> : url ? (tab === 'business' ? <IframeZoomPreview src={url} title={tab} /> : <iframe className="project-iframe" src={url} title={tab} />) : <div className="iframe-placeholder"><div className="placeholder-icon">↗</div><h3>Content not available</h3><p>Komponen ini belum dilengkapi oleh tim Capstone.</p></div>}</div></section></Layout>;
}

function App() {
  return <BrowserRouter><Routes><Route path="/" element={<Navigate to="/mitra/dashboard" replace />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/mitra/dashboard" element={<PartnerDashboard />} /><Route path="/mitra/projects" element={<PartnerProjects />} /><Route path="/mitra/settings" element={<PartnerSettings />} /><Route path="/mitra/project/:projectId" element={<ProjectDetail />} /><Route path="/mitra/questionnaire/:projectId" element={<MitraQuestionnairePage />} /><Route path="/capstone/dashboard" element={<CapstoneDashboard />} /><Route path="/capstone/:section" element={<CapstoneDashboard />} /><Route path="*" element={<Navigate to="/mitra/dashboard" replace />} /></Routes></BrowserRouter>;
}

function MitraQuestionnairePage() {
  const projectId = window.location.pathname.split('/').pop();
  return <Layout><MitraQuestionnaire projectId={projectId} onComplete={() => { window.location.href = `/mitra/project/${projectId}`; }} /></Layout>;
}

createRoot(document.getElementById('app')).render(<App />);
