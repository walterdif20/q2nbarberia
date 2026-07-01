import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Gamepad2,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Scissors,
  Settings,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  UserRound,
  X,
} from 'lucide-react'

import { AdminPackTemplateForm } from './components/AdminPackTemplateForm'
import { AdminPurchaseTable } from './components/AdminPurchaseTable'
import { AdminVisitTable } from './components/AdminVisitTable'
import { PackCard } from './components/PackCard'
import { PurchasePackModal } from './components/PurchasePackModal'
import { StatusBadge } from './components/StatusBadge'
import { UserPackCard } from './components/UserPackCard'
import { VisitRequestForm } from './components/VisitRequestForm'
import { AuthProvider, useAuth } from './context/AuthContext'
import { isFirebaseConfigured } from './firebase'
import { logoutUser, signInWithGoogle } from './services/authService'
import {
  listenActivePackTemplates,
  listenAllPackTemplates,
  savePackTemplate,
  setPackTemplateActive,
} from './services/packTemplateService'
import {
  approvePayment,
  disableUserPack,
  listenAllUserPacks,
  listenUserPacks,
  purchasePack,
  reactivateUserPack,
  rejectPayment,
} from './services/userPackService'
import { listenSettings, saveSettings } from './services/settingsService'
import {
  cancelVisit,
  confirmVisit,
  createVisitRequest,
  listenAllVisits,
  listenUserVisits,
} from './services/visitService'
import { formatDate, formatMoney, getEffectiveOperationalStatus, mapFirebaseError } from './utils/packUtils'

import q2nLogo from '../logo.jpg'
import q2nMonogram from '../logoblack.jpg'
import workFade from './assets/q2n-instagram-work-1.webp'
import workReelOne from './assets/q2n-instagram-work-2.webp'
import workReelTwo from './assets/q2n-instagram-work-3.webp'
import workColor from './assets/q2n-instagram-work-5.webp'
import q2nCup from './assets/q2n-instagram-community.webp'

const whatsappMessage = 'Hola Q2N, quiero consultar disponibilidad para un corte.'
const whatsappUrl = `https://wa.me/5492262233258?text=${encodeURIComponent(whatsappMessage)}`
const instagramUrl = 'https://www.instagram.com/q2nbarberia/'
const facebookUrl = 'https://www.facebook.com/pages/Q2n-Barber-Shop/1175614445922522/'

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')

const services = [
  {
    icon: Scissors,
    title: 'Corte masculino',
    text: 'Cortes clásicos o modernos, pensados según tu pelo, tu estilo y el resultado que querés llevarte.',
  },
  {
    icon: Sparkles,
    title: 'Fade y degradé',
    text: 'Laterales trabajados con detalle, terminaciones limpias y una transición prolija.',
  },
  {
    icon: BadgeCheck,
    title: 'Taper fade',
    text: 'Una opción actual y versátil para mantener un corte prolijo sin perder naturalidad.',
  },
  {
    icon: Star,
    title: 'Diseños',
    text: 'Detalles personalizados para sumar identidad al corte. Consultá referencias por WhatsApp.',
  },
]

const benefits = [
  {
    icon: ShieldCheck,
    title: 'Detalle en cada corte',
    text: 'La prioridad está en las líneas, proporciones y terminaciones que hacen que el corte se vea bien.',
  },
  {
    icon: CalendarCheck,
    title: 'Reserva simple',
    text: 'Pedí tu turno por WhatsApp o mensaje privado y consultá disponibilidad sin vueltas.',
  },
  {
    icon: MapPin,
    title: 'Barbería local',
    text: 'Q2N trabaja desde Quequén para clientes de Quequén, Necochea y alrededores.',
  },
]

const galleryItems = [
  {
    image: workFade,
    title: 'Fade prolijo',
    label: 'Foto real de Instagram',
    alt: 'Trabajo real de Q2N Barber Shop con corte fade prolijo',
  },
  {
    image: workReelOne,
    title: 'Corte moderno',
    label: 'Reel de Q2N',
    alt: 'Miniatura de reel real de Q2N con corte masculino moderno',
  },
  {
    image: workReelTwo,
    title: 'Taper fade',
    label: 'Reel de Q2N',
    alt: 'Miniatura de reel real de Q2N con taper fade',
  },
  {
    image: workColor,
    title: 'Estilo con identidad',
    label: 'Reel de Q2N',
    alt: 'Miniatura de reel real de Q2N con corte y color',
  },
]

function getRoutePath() {
  const pathname = window.location.pathname
  if (basePath && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length) || '/'
  }
  return pathname || '/'
}

function navigateTo(path) {
  const nextPath = path.startsWith('/') ? path : `/${path}`
  const browserPath = `${basePath}${nextPath}`.replace('//', '/')
  window.history.pushState({}, '', browserPath)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

function useRoute() {
  const [path, setPath] = useState(getRoutePath)

  useEffect(() => {
    const handlePopState = () => setPath(getRoutePath())
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  return [path, navigateTo]
}

function Link({ children, className, onClick, to, ...props }) {
  return (
    <a
      className={className}
      href={`${basePath}${to}`.replace('//', '/')}
      onClick={(event) => {
        event.preventDefault()
        onClick?.(event)
        navigateTo(to)
      }}
      {...props}
    >
      {children}
    </a>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}

function Router() {
  const [path] = useRoute()
  const { isAdmin, loading, user } = useAuth()

  if (path === '/login') return <AuthPage />
  if (path === '/register') return <AuthPage />

  if (path.startsWith('/admin')) {
    if (loading) return <LoadingScreen />
    if (!user) return <AuthPage redirectTo="/admin" />
    if (!isAdmin) return <AccessDenied />
    return <AdminArea path={path} />
  }

  if (path.startsWith('/app')) {
    if (loading) return <LoadingScreen />
    if (!user) return <AuthPage redirectTo="/app" />
    return <UserArea path={path} />
  }

  return <LandingPage />
}

function LoadingScreen() {
  return (
    <main className="app-shell centered-shell">
      <div className="app-card">
        <span className="card-kicker">Q2N Barber Shop</span>
        <h1>Cargando sistema</h1>
        <p>Estamos preparando tu sesión.</p>
      </div>
    </main>
  )
}

function FirebaseSetupNotice() {
  if (isFirebaseConfigured) return null

  return (
    <div className="setup-notice">
      <strong>Firebase todavía no está configurado.</strong>
      <span>Creá un archivo `.env.local` con las variables `VITE_FIREBASE_*` indicadas en el README.</span>
    </div>
  )
}

function AuthPage({ redirectTo = '/app' }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
      navigateTo(redirectTo)
    } catch (authError) {
      setError(mapFirebaseError(authError))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" to="/">
        <span className="brand-logo" aria-hidden="true">
          <img src={q2nLogo} alt="" />
        </span>
        <span>
          <strong>Q2N Barber Shop</strong>
          <small>Sistema de packs</small>
        </span>
      </Link>

      <section className="auth-card app-card">
        <FirebaseSetupNotice />
        <span className="card-kicker">Cuenta Google</span>
        <h1>Entra a tus packs</h1>
        <p>
          Usa tu cuenta de Google para comprar packs, activar tu transferencia y avisar tu proxima visita desde el panel.
        </p>

        <div className="form-stack">
          {error ? <div className="form-error">{error}</div> : null}
          <button
            className="button button-google button-full"
            disabled={loading || !isFirebaseConfigured}
            type="button"
            onClick={handleGoogleSignIn}
          >
            <span className="google-mark" aria-hidden="true">G</span>
            {loading ? 'Conectando...' : 'Continuar con Google'}
          </button>
        </div>

        <p className="auth-switch">Tu perfil se crea automaticamente con los datos de Google.</p>
      </section>
    </main>
  )
}

function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  const navLinks = [
    { label: 'Servicios', href: '#servicios' },
    { label: 'Trabajos', href: '#trabajos' },
    { label: 'Sobre Q2N', href: '#sobre' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Packs', to: '/app/packs' },
  ]

  return (
    <>
      <header className={`site-header${isMenuOpen ? ' is-menu-open' : ''}`}>
        <nav className="nav-bar" aria-label="Navegación principal">
          <a className="brand" href="#inicio" aria-label="Ir al inicio" onClick={closeMenu}>
            <span className="brand-logo" aria-hidden="true">
              <img src={q2nLogo} alt="" />
            </span>
            <span>
              <strong>Q2N Barber Shop</strong>
              <small>Quequén, Buenos Aires</small>
            </span>
          </a>

          <button
            className="nav-toggle"
            type="button"
            aria-controls="primary-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>

          <div className={`nav-links${isMenuOpen ? ' is-open' : ''}`} id="primary-navigation">
            {navLinks.map((link) => (
              link.to ? (
                <Link key={link.to} to={link.to} onClick={closeMenu}>{link.label}</Link>
              ) : (
                <a href={link.href} key={link.href} onClick={closeMenu}>{link.label}</a>
              )
            ))}
          </div>

          <Link className="nav-cta" to="/app/packs" onClick={closeMenu}>
            Comprar pack
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </Link>
        </nav>
      </header>

      <main id="inicio">
        <section className="hero" style={{ '--hero-image': `url(${workFade})` }} aria-labelledby="hero-title">
          <div className="section-inner hero-content">
            <p className="eyebrow">
              <MapPin size={16} strokeWidth={2.4} aria-hidden="true" />
              Barbería en Quequén
            </p>
            <h1 id="hero-title">Cortes modernos, fade y packs en Quequén</h1>
            <p className="hero-copy">
              Comprá packs de cortes con descuento, activalos con transferencia y avisá tus próximas visitas desde tu panel.
            </p>

            <div className="hero-actions" aria-label="Acciones principales">
              <Link className="button button-primary" to="/app/packs">
                Ver packs
                <Scissors size={19} strokeWidth={2.4} aria-hidden="true" />
              </Link>
              <a className="button button-secondary" href="#trabajos">
                Ver trabajos
                <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <div className="hero-points" aria-label="Datos principales de Q2N">
              <span>Fade</span>
              <span>Degradé</span>
              <span>Packs</span>
              <span>WhatsApp</span>
            </div>
          </div>
        </section>

        <section className="quick-band" aria-label="Resumen de contacto">
          <div className="section-inner quick-grid">
            <div>
              <span>WhatsApp</span>
              <strong>2262 23-3258</strong>
            </div>
            <div>
              <span>Instagram</span>
              <strong>@q2nbarberia</strong>
            </div>
            <div>
              <span>Zona</span>
              <strong>Quequén / Necochea</strong>
            </div>
          </div>
        </section>

        <section className="section" id="servicios" aria-labelledby="services-title">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow">
                <Scissors size={16} strokeWidth={2.4} aria-hidden="true" />
                Servicios
              </p>
              <h2 id="services-title">Barbería para salir prolijo y con estilo</h2>
              <p>Consultá disponibilidad, comprá packs y coordiná el corte que querés llevar.</p>
            </div>

            <div className="card-grid service-grid">
              {services.map((service) => {
                const Icon = service.icon
                return (
                  <article className="feature-card" key={service.title}>
                    <span className="feature-icon" aria-hidden="true">
                      <Icon size={23} strokeWidth={2.3} />
                    </span>
                    <h3>{service.title}</h3>
                    <p>{service.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section media-section" id="trabajos" aria-labelledby="work-title">
          <div className="section-inner">
            <div className="section-heading split-heading">
              <div>
                <p className="eyebrow">
                  <AtSign size={16} strokeWidth={2.4} aria-hidden="true" />
                  Trabajos reales
                </p>
                <h2 id="work-title">Mirá algunos cortes de Q2N</h2>
              </div>
              <a className="text-link" href={instagramUrl} target="_blank" rel="noreferrer">
                Ver más en Instagram
                <ArrowRight size={17} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <div className="gallery-grid">
              {galleryItems.map((item) => (
                <article className="gallery-item" key={item.title}>
                  <img src={item.image} alt={item.alt} loading="lazy" />
                  <div>
                    <span>{item.label}</span>
                    <h3>{item.title}</h3>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section-dark" aria-labelledby="why-title">
          <div className="section-inner">
            <div className="section-heading">
              <p className="eyebrow eyebrow-on-dark">
                <ShieldCheck size={16} strokeWidth={2.4} aria-hidden="true" />
                Por qué elegir Q2N
              </p>
              <h2 id="why-title">Técnica, cercanía y una marca con identidad local</h2>
            </div>

            <div className="benefit-grid">
              {benefits.map((benefit) => {
                const Icon = benefit.icon
                return (
                  <article className="benefit-item" key={benefit.title}>
                    <span className="benefit-icon" aria-hidden="true">
                      <Icon size={22} strokeWidth={2.3} />
                    </span>
                    <div>
                      <h3>{benefit.title}</h3>
                      <p>{benefit.text}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="section about-section" id="sobre" aria-labelledby="about-title">
          <div className="section-inner about-grid">
            <div className="about-copy">
              <p className="eyebrow">
                <BadgeCheck size={16} strokeWidth={2.4} aria-hidden="true" />
                Sobre Q2N
              </p>
              <h2 id="about-title">Una barbería con estilo propio en Quequén</h2>
              <p>
                Q2N Barber Shop es un espacio pensado para quienes buscan algo más que
                un corte rápido: técnica, detalle y una atención cercana para salir con confianza.
              </p>
              <Link className="button button-dark" to="/app/packs">
                Comprar un pack
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </Link>
            </div>

            <div className="community-panel">
              <img src={q2nCup} alt="Q2N Cup Barber Competition" loading="lazy" />
              <div>
                <span>
                  <Gamepad2 size={16} strokeWidth={2.4} aria-hidden="true" />
                  Comunidad Q2N
                </span>
                <h3>Más que una barbería</h3>
                <p>Acciones como la Q2N Cup muestran una marca joven, local y cercana a quienes la eligen.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section faq-section" id="faq" aria-labelledby="faq-title">
          <div className="section-inner faq-grid">
            <div>
              <p className="eyebrow">
                <Clock3 size={16} strokeWidth={2.4} aria-hidden="true" />
                Preguntas frecuentes
              </p>
              <h2 id="faq-title">Antes de pedir turno</h2>
              <p>Las dudas clave se resuelven por WhatsApp para confirmar disponibilidad, ubicación exacta y servicio.</p>
            </div>

            <div className="faq-list">
              <details className="faq-item">
                <summary>¿Cómo compro un pack?<ChevronRight size={18} aria-hidden="true" /></summary>
                <p>Creás tu cuenta, elegís el pack, transferís al alias y lo activás desde tu panel.</p>
              </details>
              <details className="faq-item">
                <summary>¿Cuándo puedo usarlo?<ChevronRight size={18} aria-hidden="true" /></summary>
                <p>Después de marcar la transferencia como realizada, el pack queda disponible en tu panel.</p>
              </details>
              <details className="faq-item">
                <summary>¿Cómo aviso una visita?<ChevronRight size={18} aria-hidden="true" /></summary>
                <p>Desde “Mis packs” podés informar día y hora estimada. La barbería confirma la visita y descuenta un corte.</p>
              </details>
            </div>
          </div>
        </section>
      </main>

      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
        <MessageCircle size={21} strokeWidth={2.5} aria-hidden="true" />
        WhatsApp
      </a>

      <footer className="site-footer">
        <div className="section-inner footer-grid">
          <a className="footer-brand" href="#inicio" aria-label="Volver al inicio">
            <span className="brand-logo footer-logo" aria-hidden="true">
              <img src={q2nMonogram} alt="" />
            </span>
            <span>
              <strong>Q2N Barber Shop</strong>
              <small>Barbería en Quequén, Buenos Aires</small>
            </span>
          </a>
          <p>WhatsApp 2262 23-3258 · Instagram @q2nbarberia</p>
        </div>
      </footer>
    </>
  )
}

function UserArea({ path }) {
  const { profile, user } = useAuth()
  const [packs, setPacks] = useState([])
  const [settings, setSettings] = useState({})
  const [selectedPack, setSelectedPack] = useState(null)
  const [selectedVisitPack, setSelectedVisitPack] = useState(null)
  const [userPacks, setUserPacks] = useState([])
  const [visits, setVisits] = useState([])
  const [loadingAction, setLoadingAction] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => listenSettings(setSettings), [])
  useEffect(() => listenActivePackTemplates(setPacks), [])
  useEffect(() => listenUserPacks(user.uid, setUserPacks), [user.uid])
  useEffect(() => listenUserVisits(user.uid, setVisits), [user.uid])

  const activePacks = userPacks.filter((pack) => getEffectiveOperationalStatus(pack) === 'active')
  const currentPath = path === '/app' ? '/app/packs' : path

  async function handlePurchase() {
    setLoadingAction(true)
    setError('')
    setMessage('')

    try {
      await purchasePack({ packTemplate: selectedPack, user })
      setSelectedPack(null)
      setMessage('Tu pack ya está activo en tu panel.')
      navigateTo('/app/my-packs')
    } catch (purchaseError) {
      setError(mapFirebaseError(purchaseError))
    } finally {
      setLoadingAction(false)
    }
  }

  async function handleVisitRequest(data) {
    setLoadingAction(true)
    setError('')
    setMessage('')

    try {
      await createVisitRequest({
        requestedDate: data.requestedDate,
        requestedTime: data.requestedTime,
        user,
        userPack: selectedVisitPack,
      })
      setSelectedVisitPack(null)
      setMessage('Tu visita quedó informada.')
      navigateTo('/app/visits')
    } catch (visitError) {
      setError(mapFirebaseError(visitError))
    } finally {
      setLoadingAction(false)
    }
  }

  return (
    <DashboardShell
      navItems={[
        { icon: Scissors, label: 'Comprar packs', to: '/app/packs' },
        { icon: CalendarCheck, label: 'Mis packs', to: '/app/my-packs' },
        { icon: Clock3, label: 'Visitas', to: '/app/visits' },
      ]}
      title={`Hola, ${profile?.displayName || user.email}`}
    >
      <FirebaseSetupNotice />
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      {currentPath === '/app/packs' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Packs disponibles"
            title="Comprá cortes con descuento"
            text="Elegí un pack, transferí al alias y activalo desde el panel sin cargar comprobantes."
          />
          <div className="app-grid">
            {packs.map((pack) => <PackCard key={pack.id} pack={pack} onBuy={setSelectedPack} />)}
            {!packs.length ? <div className="empty-state">Todavía no hay packs activos.</div> : null}
          </div>
        </section>
      ) : null}

      {currentPath === '/app/my-packs' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Mis packs"
            title="Cortes disponibles"
            text="Los estados visibles son simples: activo, vencido, consumido o no disponible."
          />
          <div className="app-grid two-columns">
            {userPacks.map((pack) => (
              <UserPackCard key={pack.id} pack={pack} onRequestVisit={setSelectedVisitPack} />
            ))}
            {!userPacks.length ? <div className="empty-state">Todavía no compraste packs.</div> : null}
          </div>
        </section>
      ) : null}

      {currentPath === '/app/visits' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Visitas"
            title="Historial y próximos avisos"
            text="Informá una visita desde un pack activo. El corte se descuenta al confirmar la atención."
          />
          {activePacks.length ? (
            <div className="quick-actions">
              {activePacks.map((pack) => (
                <button key={pack.id} type="button" onClick={() => setSelectedVisitPack(pack)}>
                  Avisar visita con {pack.packName}
                </button>
              ))}
            </div>
          ) : null}
          <VisitList visits={visits} />
        </section>
      ) : null}

      <PurchasePackModal
        loading={loadingAction}
        onClose={() => setSelectedPack(null)}
        onConfirm={handlePurchase}
        pack={selectedPack}
        settings={settings}
      />
      <VisitRequestForm
        loading={loadingAction}
        onClose={() => setSelectedVisitPack(null)}
        onSubmit={handleVisitRequest}
        pack={selectedVisitPack}
      />
    </DashboardShell>
  )
}

function VisitList({ visits }) {
  if (!visits.length) return <div className="empty-state">No hay visitas informadas.</div>

  return (
    <div className="visit-list">
      {visits.map((visit) => (
        <article className="app-card compact-card" key={visit.id}>
          <div>
            <span className="card-kicker">{visit.packName}</span>
            <h3>{visit.requestedDate} · {visit.requestedTime}</h3>
          </div>
          <StatusBadge status={visit.status} />
        </article>
      ))}
    </div>
  )
}

function AdminArea({ path }) {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [purchases, setPurchases] = useState([])
  const [visits, setVisits] = useState([])
  const [settings, setSettings] = useState({})
  const [editingPack, setEditingPack] = useState(null)
  const [filter, setFilter] = useState('')
  const [loadingAction, setLoadingAction] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => listenAllPackTemplates(setTemplates), [])
  useEffect(() => listenAllUserPacks(setPurchases), [])
  useEffect(() => listenAllVisits(setVisits), [])
  useEffect(() => listenSettings(setSettings), [])

  const currentPath = path === '/admin' ? '/admin/purchases' : path
  const filteredPurchases = useMemo(() => {
    const needle = filter.trim().toLowerCase()
    if (!needle) return purchases
    return purchases.filter((purchase) => (
      purchase.userEmail?.toLowerCase().includes(needle)
      || purchase.userName?.toLowerCase().includes(needle)
      || purchase.internalPaymentStatus?.toLowerCase().includes(needle)
      || getEffectiveOperationalStatus(purchase).toLowerCase().includes(needle)
    ))
  }, [filter, purchases])

  const pendingCount = purchases.filter((purchase) => purchase.internalPaymentStatus === 'pending').length
  const activeCount = purchases.filter((purchase) => getEffectiveOperationalStatus(purchase) === 'active').length
  const pendingVisits = visits.filter((visit) => visit.status === 'pending').length

  async function runAdminAction(action) {
    setLoadingAction(true)
    setError('')
    setMessage('')

    try {
      await action()
      setMessage('Acción realizada correctamente.')
    } catch (adminError) {
      setError(mapFirebaseError(adminError))
    } finally {
      setLoadingAction(false)
    }
  }

  async function handleTemplateSubmit(template) {
    await runAdminAction(async () => {
      await savePackTemplate(template)
      setEditingPack(null)
    })
  }

  async function handleSettingsSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    await runAdminAction(() => saveSettings({
      alias: form.get('alias'),
      businessName: form.get('businessName'),
      paymentInstructions: form.get('paymentInstructions'),
    }))
  }

  return (
    <DashboardShell
      navItems={[
        { icon: LayoutDashboard, label: 'Revisión', to: '/admin/purchases' },
        { icon: Scissors, label: 'Packs', to: '/admin/packs' },
        { icon: Clock3, label: 'Visitas', to: '/admin/visits' },
        { icon: Settings, label: 'Ajustes', to: '/admin/settings' },
      ]}
      title="Panel administrador"
    >
      {message ? <div className="form-success">{message}</div> : null}
      {error ? <div className="form-error">{error}</div> : null}

      <div className="stat-grid">
        <StatCard label="Pendientes de revisión" value={pendingCount} />
        <StatCard label="Packs activos" value={activeCount} />
        <StatCard label="Visitas pendientes" value={pendingVisits} />
      </div>

      {currentPath === '/admin/purchases' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Compras"
            title="Pagos y packs de clientes"
            text="Acá sí se muestran estados internos de revisión de pago."
          />
          <input
            className="search-input"
            placeholder="Buscar por nombre, email o estado"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          />
          <AdminPurchaseTable
            purchases={filteredPurchases}
            onApprove={(purchase) => runAdminAction(() => approvePayment(purchase.id, user))}
            onDisable={(purchase) => runAdminAction(() => disableUserPack(purchase.id, user, window.prompt('Motivo de baja') || ''))}
            onReactivate={(purchase) => runAdminAction(() => reactivateUserPack(purchase.id))}
            onReject={(purchase) => runAdminAction(() => rejectPayment(purchase.id, user, window.prompt('Motivo de rechazo') || ''))}
          />
        </section>
      ) : null}

      {currentPath === '/admin/packs' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Plantillas"
            title="Packs comerciales"
            text="Creá packs con precio sin descuento, precio final, ahorro y días de validez."
          />
          <AdminPackTemplateForm
            editingPack={editingPack}
            loading={loadingAction}
            onCancelEdit={() => setEditingPack(null)}
            onSubmit={handleTemplateSubmit}
          />
          <div className="template-list">
            {templates.map((template) => (
              <article className="app-card compact-card" key={template.id}>
                <div>
                  <span className="card-kicker">{template.cutsQuantity} cortes · {template.validityDays} días</span>
                  <h3>{template.name}</h3>
                  <p>{formatMoney(template.regularPrice)} → {formatMoney(template.packPrice)}</p>
                </div>
                <div className="row-actions">
                  <StatusBadge status={template.isActive ? 'active' : 'disabled'} />
                  <button type="button" onClick={() => setEditingPack(template)}>Editar</button>
                  <button type="button" onClick={() => runAdminAction(() => setPackTemplateActive(template.id, !template.isActive))}>
                    {template.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {currentPath === '/admin/visits' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Visitas"
            title="Confirmar atención y descontar cortes"
            text="Confirmar una visita descuenta exactamente 1 corte usando una transacción Firestore."
          />
          <AdminVisitTable
            visits={visits}
            onCancel={(visit) => runAdminAction(() => cancelVisit(visit.id, user))}
            onConfirm={(visit) => runAdminAction(() => confirmVisit(visit.id, user))}
          />
        </section>
      ) : null}

      {currentPath === '/admin/settings' ? (
        <section className="dashboard-section">
          <SectionHeader
            kicker="Negocio"
            title="Alias e instrucciones"
            text="Estos datos se muestran al cliente antes de activar su pack."
          />
          <form className="admin-form app-card" onSubmit={handleSettingsSubmit}>
            <label>
              Nombre del negocio
              <input name="businessName" defaultValue={settings.businessName || 'Q2N Barber Shop'} />
            </label>
            <label>
              Alias de transferencia
              <input name="alias" defaultValue={settings.alias || ''} required />
            </label>
            <label>
              Instrucciones de pago
              <textarea name="paymentInstructions" defaultValue={settings.paymentInstructions || ''} rows="4" />
            </label>
            <button className="button button-primary" disabled={loadingAction} type="submit">
              Guardar ajustes
            </button>
          </form>
        </section>
      ) : null}
    </DashboardShell>
  )
}

function DashboardShell({ children, navItems, title }) {
  const { isAdmin, profile } = useAuth()

  async function handleLogout() {
    await logoutUser()
    navigateTo('/')
  }

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="brand dashboard-brand" to="/">
          <span className="brand-logo" aria-hidden="true">
            <img src={q2nLogo} alt="" />
          </span>
          <span>
            <strong>Q2N Packs</strong>
            <small>{isAdmin ? 'Admin' : 'Cliente'}</small>
          </span>
        </Link>

        <nav className="dashboard-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link key={item.to} to={item.to}>
                <Icon size={18} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <button className="button button-outline button-full" type="button" onClick={handleLogout}>
          <LogOut size={18} aria-hidden="true" />
          Salir
        </button>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="card-kicker">{profile?.email}</span>
            <h1>{title}</h1>
          </div>
          <div className="user-pill">
            <UserRound size={18} aria-hidden="true" />
            {profile?.role || 'user'}
          </div>
        </header>

        {children}
      </section>
    </main>
  )
}

function SectionHeader({ kicker, text, title }) {
  return (
    <div className="section-heading dashboard-heading">
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <article className="app-card stat-card">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

function AccessDenied() {
  return (
    <main className="app-shell centered-shell">
      <section className="app-card">
        <span className="card-kicker">Acceso protegido</span>
        <h1>No tenés permisos de administrador</h1>
        <p>Tu usuario está activo, pero no tiene rol admin en Firestore.</p>
        <Link className="button button-primary" to="/app">Ir a mi panel</Link>
      </section>
    </main>
  )
}

export default App
