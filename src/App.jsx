import { useState } from 'react'
import {
  ArrowRight,
  AtSign,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Gamepad2,
  MapPin,
  Menu,
  MessageCircle,
  Scissors,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from 'lucide-react'

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

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Trabajos', href: '#trabajos' },
  { label: 'Sobre Q2N', href: '#sobre' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contacto', href: '#contacto' },
]

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

const faqs = [
  {
    question: '¿Cómo reservo un turno?',
    answer:
      'Escribí por WhatsApp o por mensaje privado de Instagram para consultar disponibilidad.',
  },
  {
    question: '¿Dónde está Q2N Barber Shop?',
    answer:
      'Q2N está en Quequén, Buenos Aires. Para recibir la ubicación exacta, escribí por WhatsApp.',
  },
  {
    question: '¿Hacen fade o degradé?',
    answer:
      'Sí, en las publicaciones de Q2N se muestran trabajos de fade, degradé y taper fade.',
  },
  {
    question: '¿Puedo consultar por barba o diseños?',
    answer:
      'Sí, podés escribir y mandar una referencia para confirmar disponibilidad del servicio que estás buscando.',
  },
]

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

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
            {isMenuOpen ? (
              <X size={22} strokeWidth={2.5} aria-hidden="true" />
            ) : (
              <Menu size={22} strokeWidth={2.5} aria-hidden="true" />
            )}
          </button>

          <div
            className={`nav-links${isMenuOpen ? ' is-open' : ''}`}
            id="primary-navigation"
          >
            {navLinks.map((link) => (
              <a href={link.href} key={link.href} onClick={closeMenu}>
                {link.label}
              </a>
            ))}
          </div>

          <a className="nav-cta" href={whatsappUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>
            Reservar turno
            <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
          </a>
        </nav>
      </header>

      <main id="inicio">
        <section
          className="hero"
          style={{ '--hero-image': `url(${workFade})` }}
          aria-labelledby="hero-title"
        >
          <div className="section-inner hero-content">
            <p className="eyebrow">
              <MapPin size={16} strokeWidth={2.4} aria-hidden="true" />
              Barbería en Quequén
            </p>
            <h1 id="hero-title">Cortes modernos, fade y barba en Quequén</h1>
            <p className="hero-copy">
              En Q2N Barber Shop te esperamos con atención cercana, detalle en cada corte
              y reserva simple por WhatsApp.
            </p>

            <div className="hero-actions" aria-label="Acciones principales">
              <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                Reservar por WhatsApp
                <MessageCircle size={19} strokeWidth={2.4} aria-hidden="true" />
              </a>
              <a className="button button-secondary" href="#trabajos">
                Ver trabajos
                <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <div className="hero-points" aria-label="Datos principales de Q2N">
              <span>Fade</span>
              <span>Degradé</span>
              <span>Taper fade</span>
              <span>Diseños</span>
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
              <p>
                Consultá disponibilidad por WhatsApp y coordiná el corte que querés llevar.
              </p>
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
                un corte rápido: técnica, detalle y una atención cercana para salir con
                confianza.
              </p>
              <a className="button button-dark" href={whatsappUrl} target="_blank" rel="noreferrer">
                Consultar disponibilidad
                <ArrowRight size={18} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>

            <div className="community-panel">
              <img src={q2nCup} alt="Q2N Cup Barber Competition" loading="lazy" />
              <div>
                <span>
                  <Gamepad2 size={16} strokeWidth={2.4} aria-hidden="true" />
                  Comunidad Q2N
                </span>
                <h3>Más que una barbería</h3>
                <p>
                  Acciones como la Q2N Cup muestran una marca joven, local y cercana a
                  quienes la eligen.
                </p>
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
              <p>
                Las dudas clave se resuelven por WhatsApp para confirmar disponibilidad,
                ubicación exacta y servicio.
              </p>
            </div>

            <div className="faq-list">
              {faqs.map((faq) => (
                <details className="faq-item" key={faq.question}>
                  <summary>
                    {faq.question}
                    <ChevronRight size={18} strokeWidth={2.4} aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contacto" aria-labelledby="contact-title">
          <div className="section-inner contact-grid">
            <div>
              <p className="eyebrow eyebrow-on-dark">
                <MessageCircle size={16} strokeWidth={2.4} aria-hidden="true" />
                Contacto
              </p>
              <h2 id="contact-title">Reservá tu turno en Q2N</h2>
              <p>
                Escribinos por WhatsApp y consultá disponibilidad. Tu consulta no molesta.
              </p>
            </div>

            <div className="contact-actions" aria-label="Canales de contacto">
              <a className="button button-primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                Enviar WhatsApp
                <MessageCircle size={19} strokeWidth={2.4} aria-hidden="true" />
              </a>
              <a className="button button-outline" href={instagramUrl} target="_blank" rel="noreferrer">
                Instagram
                <AtSign size={18} strokeWidth={2.4} aria-hidden="true" />
              </a>
              <a className="button button-outline" href={facebookUrl} target="_blank" rel="noreferrer">
                Facebook
                <Share2 size={18} strokeWidth={2.4} aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <a className="floating-whatsapp" href={whatsappUrl} target="_blank" rel="noreferrer">
        <MessageCircle size={21} strokeWidth={2.5} aria-hidden="true" />
        Pedir turno
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

export default App
