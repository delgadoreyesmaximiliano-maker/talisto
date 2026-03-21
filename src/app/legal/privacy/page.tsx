import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Conoce cómo Talisto SpA recopila, usa y protege tus datos personales conforme a la Ley 19.628 de Chile.',
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
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
            Política de Privacidad
          </h1>
          <p className="text-muted-foreground">
            Última actualización: marzo de 2026 — Talisto SpA, Chile
          </p>
        </div>

        <div className="space-y-10 text-sm sm:text-base leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              1. Quiénes somos
            </h2>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Talisto SpA</strong> (en adelante "Talisto", "nosotros" o "la empresa") es una empresa
              constituida en Chile, responsable del tratamiento de los datos personales que se recopilan a través
              de la plataforma <strong className="text-foreground">talisto.vercel.app</strong> y sus servicios asociados. Nos
              regimos por la <strong className="text-foreground">Ley N° 19.628 sobre Protección de la Vida Privada</strong> de la República de Chile.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              2. Datos que recopilamos
            </h2>
            <p className="text-muted-foreground mb-4">
              Recopilamos los siguientes tipos de datos personales con el fin de prestar nuestros servicios:
            </p>
            <div className="space-y-4">
              {[
                {
                  title: 'Datos de registro',
                  desc: 'Nombre, correo electrónico, nombre de empresa, RUT (opcional) y contraseña cifrada al crear una cuenta.',
                },
                {
                  title: 'Datos de uso',
                  desc: 'Interacciones con la plataforma, páginas visitadas, funciones utilizadas y registros de errores para mejorar el servicio.',
                },
                {
                  title: 'Datos de negocio',
                  desc: 'Inventario, ventas, clientes y demás información que tú ingresas voluntariamente en Talisto. Estos datos son de tu propiedad exclusiva.',
                },
                {
                  title: 'Datos de pago',
                  desc: 'Procesados íntegramente por Stripe. Talisto no almacena números de tarjetas ni datos bancarios sensibles.',
                },
                {
                  title: 'Datos técnicos',
                  desc: 'Dirección IP, tipo de dispositivo, navegador, sistema operativo y zona horaria, recopilados automáticamente.',
                },
              ].map((item) => (
                <div key={item.title} className="glass-panel rounded-xl p-4">
                  <p className="font-semibold text-foreground mb-1">{item.title}</p>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              3. Cómo usamos tus datos
            </h2>
            <ul className="space-y-2 text-muted-foreground list-none">
              {[
                'Proveer y mantener el servicio de CRM, inventario y ventas.',
                'Personalizar la experiencia y mostrar información relevante para tu empresa.',
                'Procesar pagos y gestionar suscripciones.',
                'Enviar notificaciones de servicio, alertas de seguridad y actualizaciones.',
                'Mejorar el producto mediante análisis de uso (datos agregados y anonimizados).',
                'Cumplir obligaciones legales y resolver disputas.',
                'Contactarte con fines de soporte técnico cuando lo solicites.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">
              No vendemos, alquilamos ni comercializamos tus datos personales a terceros bajo ninguna circunstancia.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              4. Cookies y tecnologías similares
            </h2>
            <p className="text-muted-foreground mb-4">
              Utilizamos cookies y tecnologías de seguimiento con los siguientes propósitos:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-dark">
                    <th className="py-3 pr-4 font-semibold text-foreground">Tipo</th>
                    <th className="py-3 pr-4 font-semibold text-foreground">Propósito</th>
                    <th className="py-3 font-semibold text-foreground">Duración</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b border-border-dark/50">
                    <td className="py-3 pr-4">Esenciales</td>
                    <td className="py-3 pr-4">Autenticación de sesión y seguridad</td>
                    <td className="py-3">Sesión</td>
                  </tr>
                  <tr className="border-b border-border-dark/50">
                    <td className="py-3 pr-4">Preferencias</td>
                    <td className="py-3 pr-4">Recordar configuración del usuario</td>
                    <td className="py-3">1 año</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4">Analíticas</td>
                    <td className="py-3 pr-4">Métricas de uso (datos anonimizados)</td>
                    <td className="py-3">90 días</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground mt-4">
              Puedes desactivar las cookies no esenciales desde la configuración de tu navegador. Ten en cuenta que
              algunas funcionalidades pueden verse afectadas.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              5. Compartición de datos con terceros
            </h2>
            <p className="text-muted-foreground mb-4">
              Solo compartimos datos con proveedores de confianza necesarios para operar el servicio:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              {[
                { provider: 'Supabase', purpose: 'Base de datos y autenticación (servidores en AWS us-east-1)' },
                { provider: 'Stripe', purpose: 'Procesamiento de pagos (PCI-DSS certificado)' },
                { provider: 'Vercel', purpose: 'Hosting y CDN de la aplicación' },
                { provider: 'Groq', purpose: 'Procesamiento de IA para el asistente CFO (datos sin identificar)' },
              ].map((item) => (
                <li key={item.provider} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">→</span>
                  <span><strong className="text-foreground">{item.provider}:</strong> {item.purpose}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground mt-4">
              Todos los proveedores están sujetos a acuerdos de confidencialidad y sólo pueden usar los datos para
              prestar los servicios contratados.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              6. Seguridad de los datos
            </h2>
            <p className="text-muted-foreground">
              Implementamos medidas técnicas y organizativas para proteger tu información: cifrado TLS en tránsito,
              contraseñas hasheadas con bcrypt, Row-Level Security (RLS) en Supabase para aislar datos por empresa,
              y acceso restringido al personal autorizado. Sin embargo, ningún sistema es 100 % seguro. En caso
              de brecha de seguridad que afecte tus datos, te notificaremos dentro de las 72 horas siguientes
              a que tomemos conocimiento del incidente.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              7. Tus derechos — Ley 19.628
            </h2>
            <p className="text-muted-foreground mb-4">
              Conforme a la Ley N° 19.628 y su reglamento, tienes derecho a:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { title: 'Acceso', desc: 'Solicitar qué datos personales tenemos sobre ti.' },
                { title: 'Rectificación', desc: 'Corregir datos inexactos o incompletos.' },
                { title: 'Cancelación', desc: 'Pedir la eliminación de tus datos cuando ya no sean necesarios.' },
                { title: 'Oposición', desc: 'Oponerte al tratamiento para fines de marketing.' },
                { title: 'Portabilidad', desc: 'Recibir tus datos en formato legible por máquina (CSV/JSON).' },
                { title: 'Bloqueo', desc: 'Solicitar la suspensión del tratamiento mientras se resuelve una disputa.' },
              ].map((right) => (
                <div key={right.title} className="glass-panel rounded-xl p-4">
                  <p className="font-semibold text-foreground mb-1">{right.title}</p>
                  <p className="text-muted-foreground text-sm">{right.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-4">
              Para ejercer cualquiera de estos derechos, escríbenos a{' '}
              <a href="mailto:privacidad@talisto.cl" className="text-primary hover:underline">
                privacidad@talisto.cl
              </a>
              . Responderemos dentro de los plazos que establece la ley (máximo 2 días hábiles para acuse de recibo,
              20 días hábiles para resolución).
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              8. Retención de datos
            </h2>
            <p className="text-muted-foreground">
              Conservamos tus datos mientras tu cuenta esté activa o sea necesario para prestar el servicio.
              Al cancelar tu suscripción, conservamos los datos por 30 días adicionales para permitirte
              recuperar la cuenta. Transcurrido ese período, los datos se eliminan de forma permanente, salvo
              que la ley exija una conservación mayor (por ejemplo, documentos tributarios: 6 años según SII).
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              9. Menores de edad
            </h2>
            <p className="text-muted-foreground">
              Talisto no está dirigido a personas menores de 18 años. No recopilamos intencionalmente datos
              de menores. Si detectas que un menor ha proporcionado información, contáctanos para eliminarla
              de inmediato.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              10. Cambios a esta política
            </h2>
            <p className="text-muted-foreground">
              Podemos actualizar esta Política de Privacidad periódicamente. Cuando realizemos cambios
              significativos, te notificaremos por correo electrónico o mediante un aviso destacado en la
              plataforma con al menos 15 días de anticipación. El uso continuado del servicio después de
              dicho aviso constituye aceptación de los cambios.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="text-xl font-bold text-foreground mb-4 pb-2 border-b border-border-dark" style={{ fontFamily: "'Outfit', sans-serif" }}>
              11. Contacto
            </h2>
            <p className="text-muted-foreground mb-4">
              Para cualquier consulta, reclamo o ejercicio de derechos relacionados con tus datos personales:
            </p>
            <div className="glass-panel rounded-xl p-6 space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Talisto SpA</strong></p>
              <p>Chile</p>
              <p>
                Correo:{' '}
                <a href="mailto:privacidad@talisto.cl" className="text-primary hover:underline">
                  privacidad@talisto.cl
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
            <Link href="/legal/terms" className="hover:text-primary transition-colors">
              Términos y Condiciones
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
