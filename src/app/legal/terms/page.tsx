import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y Condiciones',
  description: 'Lee los Términos y Condiciones de uso de Talisto, la plataforma de gestión para PyMEs chilenas.',
  robots: { index: true, follow: true },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="border-b border-border-dark bg-surface-dark/60 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <span className="text-xl font-extrabold text-primary" style={{ fontFamily: "'Outfit', sans-serif" }}>
            TALISTO
          </span>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <p className="text-sm text-primary font-semibold uppercase tracking-widest mb-3">Legal</p>
          <h1 className="text-4xl font-bold text-foreground mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Términos y Condiciones
          </h1>
          <p className="text-muted-foreground">
            Última actualización: marzo de 2026 — Talisto SpA, Chile
          </p>
        </div>

        <div className="space-y-10 text-sm sm:text-base leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              1. Aceptación de los Términos
            </h2>
            <p className="text-muted-foreground">
              Al registrarte, acceder o utilizar los servicios de <strong className="text-foreground">Talisto SpA</strong>{' '}
              (en adelante "Talisto", "el Servicio" o "la plataforma"), declaras haber leído, comprendido y
              aceptado íntegramente los presentes Términos y Condiciones ("T&C"). Si actúas en nombre de
              una empresa, declaras tener las facultades necesarias para obligarla. Si no estás de acuerdo
              con estos T&C, no debes utilizar el Servicio.
            </p>
            <p className="text-muted-foreground mt-3">
              Talisto se reserva el derecho de modificar estos T&C en cualquier momento. Las modificaciones
              entrarán en vigor a los 15 días de su publicación o notificación. El uso continuado constituye
              aceptación.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              2. Descripción del Servicio
            </h2>
            <p className="text-muted-foreground mb-4">
              Talisto es una plataforma SaaS (Software as a Service) que ofrece herramientas de:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                'CRM (Customer Relationship Management) para gestión de clientes',
                'Control de inventario y gestión de productos',
                'Seguimiento de ventas y facturación',
                'Análisis con inteligencia artificial para apoyo en la toma de decisiones',
                'Integraciones con servicios de terceros (WhatsApp, Telegram, etc.)',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">
              El Servicio se presta "tal como está" y podrá ser modificado, ampliado o descontinuado parcialmente
              con aviso previo de 30 días, salvo en caso de fuerza mayor.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              3. Registro y Cuenta
            </h2>
            <p className="text-muted-foreground mb-4">Al crear una cuenta en Talisto, el usuario se compromete a:</p>
            <div className="space-y-3">
              {[
                { title: 'Información veraz', desc: 'Proporcionar datos de registro precisos, completos y actualizados.' },
                { title: 'Seguridad de credenciales', desc: 'Mantener la confidencialidad de su contraseña y notificar de inmediato cualquier acceso no autorizado.' },
                { title: 'Responsabilidad', desc: 'Ser responsable de todas las actividades realizadas bajo su cuenta.' },
                { title: 'Mayoría de edad', desc: 'Tener al menos 18 años o representar a una persona jurídica válidamente constituida.' },
              ].map((item) => (
                <div key={item.title} className="glass-panel rounded-xl p-4">
                  <p className="font-semibold text-foreground mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              4. Uso Permitido
            </h2>
            <p className="text-muted-foreground mb-3">
              El Servicio está destinado exclusivamente al uso empresarial lícito. Queda expresamente prohibido:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                'Usar el Servicio para actividades ilegales, fraudulentas o que vulneren derechos de terceros.',
                'Intentar acceder, alterar o destruir datos de otros usuarios o sistemas de Talisto.',
                'Realizar ingeniería inversa, descompilar o intentar obtener el código fuente de la plataforma.',
                'Revender, sublicenciar o comercializar el acceso al Servicio sin autorización escrita.',
                'Enviar spam, malware o contenido que infrinja derechos de autor a través de la plataforma.',
                'Sobrecargar intencionalmente la infraestructura del Servicio (ataques DDoS o similares).',
                'Crear cuentas falsas o suplantar la identidad de otra persona o empresa.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-destructive mt-0.5 shrink-0 font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">
              Talisto se reserva el derecho de suspender o cancelar cuentas que incumplan estas condiciones,
              sin previo aviso y sin reembolso.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              5. Planes, Pagos y Suscripciones
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <div className="glass-panel rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">Periodo de Prueba</p>
                <p className="text-sm">
                  Talisto ofrece un período de prueba gratuito de <strong className="text-foreground">14 días</strong> sin requerir
                  tarjeta de crédito. Al finalizar, la cuenta se suspenderá automáticamente si no se contrata
                  un plan de pago.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">Facturación</p>
                <p className="text-sm">
                  Los planes de pago se facturan mensualmente o anualmente según lo elegido. Los precios
                  están expresados en <strong className="text-foreground">pesos chilenos (CLP) e incluyen IVA</strong>. El cobro
                  se realiza al inicio de cada período a través de Stripe.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">Cambios de Plan</p>
                <p className="text-sm">
                  Los upgrades son efectivos de inmediato (con ajuste prorrateado). Los downgrades aplican
                  al inicio del siguiente período de facturación.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">Cancelación y Reembolsos</p>
                <p className="text-sm">
                  Puedes cancelar tu suscripción en cualquier momento desde Configuración. El acceso se
                  mantiene hasta el fin del período pagado. <strong className="text-foreground">No se emiten reembolsos por períodos parciales,
                  salvo error de cobro imputable a Talisto</strong>. En caso de error, el reembolso se
                  procesa dentro de 5–10 días hábiles.
                </p>
              </div>
              <div className="glass-panel rounded-xl p-5">
                <p className="font-semibold text-foreground mb-2">Morosidad</p>
                <p className="text-sm">
                  En caso de fallo en el pago, Talisto intentará el cobro hasta 3 veces en 7 días. Si no
                  se regulariza, la cuenta será suspendida y los datos conservados por 30 días para
                  permitir la reactivación.
                </p>
              </div>
            </div>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              6. Propiedad Intelectual
            </h2>
            <p className="text-muted-foreground mb-3">
              <strong className="text-foreground">De Talisto:</strong> La plataforma, su código, diseño, marca, logotipos y contenidos
              son propiedad exclusiva de Talisto SpA y están protegidos por la Ley N° 17.336 de Propiedad
              Intelectual de Chile. Se te concede una licencia limitada, no exclusiva e intransferible para
              usar el Servicio.
            </p>
            <p className="text-muted-foreground">
              <strong className="text-foreground">De tus datos:</strong> Eres el propietario absoluto de todos los datos que ingresas
              en la plataforma (clientes, productos, ventas, etc.). Talisto solo los procesa para prestar
              el Servicio y no adquiere derechos sobre ellos.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              7. Disponibilidad y SLA
            </h2>
            <p className="text-muted-foreground">
              Talisto se compromete a mantener una disponibilidad objetivo del <strong className="text-foreground">99 % mensual</strong>,
              excluyendo mantenimientos programados (notificados con al menos 24 horas de anticipación) y
              eventos de fuerza mayor. No garantizamos un servicio ininterrumpido. El tiempo de inactividad
              no programado que supere el 1 % mensual podrá compensarse con crédito en cuenta según los
              registros de nuestro sistema de monitoreo.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              8. Limitación de Responsabilidad
            </h2>
            <p className="text-muted-foreground mb-3">
              En la máxima medida permitida por la ley chilena:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                'Talisto no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o imposibilidad de uso del Servicio.',
                'La responsabilidad total de Talisto no superará el monto pagado por el usuario en los últimos 3 meses.',
                'Talisto no garantiza la exactitud de las recomendaciones de IA; estas son orientativas y no reemplazan el juicio profesional.',
                'Talisto no será responsable por pérdida de datos causada por errores del usuario, ataques externos o eventos fuera de su control.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              9. Indemnización
            </h2>
            <p className="text-muted-foreground">
              El usuario se compromete a indemnizar y mantener indemne a Talisto SpA, sus directores,
              empleados y proveedores frente a cualquier reclamación, daño, pérdida o gasto (incluyendo
              honorarios legales razonables) derivados del incumplimiento de estos T&C, uso indebido del
              Servicio o violación de derechos de terceros.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              10. Privacidad
            </h2>
            <p className="text-muted-foreground">
              El tratamiento de datos personales se rige por nuestra{' '}
              <Link href="/legal/privacy" className="text-primary hover:underline">
                Política de Privacidad
              </Link>
              , la cual forma parte integrante de estos T&C y cumple con la Ley N° 19.628 sobre Protección
              de la Vida Privada de Chile.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              11. Ley Aplicable y Jurisdicción
            </h2>
            <p className="text-muted-foreground">
              Estos T&C se rigen íntegramente por las leyes de la <strong className="text-foreground">República de Chile</strong>.
              Cualquier controversia que surja en relación con el Servicio se someterá a la jurisdicción
              de los <strong className="text-foreground">Tribunales Ordinarios de Justicia de Santiago de Chile</strong>, renunciando
              las partes a cualquier otro fuero que pudiera corresponderles. Para disputas de consumo,
              aplica adicionalmente la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
            </p>
          </section>

          {/* 12 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              12. Terminación
            </h2>
            <p className="text-muted-foreground">
              Cualquiera de las partes puede dar por terminada la relación contractual en cualquier momento.
              El usuario puede hacerlo cancelando su cuenta desde la plataforma. Talisto puede hacerlo
              por incumplimiento de estos T&C, con o sin previo aviso según la gravedad de la infracción.
              Tras la terminación, Talisto conservará los datos por 30 días y luego los eliminará de forma
              permanente, salvo obligación legal en contrario.
            </p>
          </section>

          {/* 13 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              13. Contacto
            </h2>
            <p className="text-muted-foreground mb-4">
              Para consultas sobre estos Términos y Condiciones:
            </p>
            <div className="glass-panel rounded-xl p-6 space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Talisto SpA</strong></p>
              <p>Chile</p>
              <p>
                Correo legal:{' '}
                <a href="mailto:legal@talisto.cl" className="text-primary hover:underline">
                  legal@talisto.cl
                </a>
              </p>
              <p>
                General:{' '}
                <a href="mailto:hola@talisto.cl" className="text-primary hover:underline">
                  hola@talisto.cl
                </a>
              </p>
            </div>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border-dark flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Talisto SpA. Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-primary transition-colors">
              Política de Privacidad
            </Link>
            <Link href="/" className="hover:text-primary transition-colors">
              Inicio
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
