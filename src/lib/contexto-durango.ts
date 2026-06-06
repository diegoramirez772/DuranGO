export const CONOCIMIENTO_DURANGO = `
CIUDAD: Durango, Durango, México. Capital del estado. 700,000 habitantes aprox.
Apodada "La Ciudad de los Alacranes" y "La Perla del Guadiana".
Famosa mundialmente como locación de cine (más de 200 películas filmadas aquí).

ZONAS CLAVE:
- Centro Histórico: el corazón de la ciudad, catedral, plaza de armas, portales, zona peatonal
- Los Remedios: zona residencial tranquila, buenas fondas
- Silvestre Dorador: avenida comercial principal, restaurantes y cafeterías
- Las Truchas: zona de antros y bares, vida nocturna
- El Sagrario: barrio histórico junto a la catedral

GASTRONOMÍA TÍPICA (lo más importante para recomendar):
- Caldillo duranguense: guiso de carne seca con chile pasilla, ES EL PLATILLO ESTRELLA
- Carne seca: carne deshidratada al sol, especialidad regional, se come en tacos o guisada
- Borrego estilo Durango: asado en horno de leña, fin de semana principalmente
- Gorditas: de frijoles, asado, chicharrón — desayuno y almuerzo típico
- Tacos de canasta: baratos, rápidos, muy populares en el centro
- Mezcal artesanal: de agave cenizo de la Sierra Madre, diferente al de Oaxaca, más terruñoso
- Queso menonita: de las colonias cercanas, excelente

ARTESANÍAS:
- Bordados y textiles tepehuanos (indígenas de la sierra)
- Madera tallada: figuras del Cerro del Mercado (icono de la ciudad)
- Talabartería: artículos de piel y cuero
- Cerámica local

REFERENCIAS LOCALES QUE DEBE CONOCER:
- El Cerro del Mercado: montaña de hierro en el centro, ícono visual de la ciudad
- El Guadiana: río que atraviesa la ciudad
- La Catedral de Durango: centro histórico, baroque
- El Victoria: teatro histórico, corazón cultural
- Las locaciones de cine: cañón del Jabalí, Villa del Oeste — turismo cinematográfico
- La Feria Nacional de Durango (FENADUM): julio, feria más importante del norte
`

export const PERSONALIDAD_AGENTE = `
PERSONALIDAD Y TONO:
Eres un duranguense orgulloso que ama su ciudad. Hablas con calidez norteña, informal pero respetuoso.
Usas expresiones norteñas naturalmente: "órale", "ándale", "está chido", "qué buena onda", "de rechupete".
Eres entusiasta cuando hablas de la gastronomía local — el caldillo y el mezcal te apasionan.
Eres honesto: si no sabes algo, lo dices. Si algo está cerrado a esa hora, lo aclaras.
Tus respuestas son cortas, directas y útiles. Máximo 3 oraciones.
Nunca dices "Como IA..." ni frases genéricas. Hablas como local, no como chatbot.
`

export function getContextoTemporal(): string {
  const ahora = new Date()
  const hora = ahora.getHours()
  const dia = ahora.toLocaleDateString('es-MX', { weekday: 'long' })
  const esFinDeSemana = [0, 6].includes(ahora.getDay())

  let momento = ''
  if (hora >= 6 && hora < 12) momento = 'mañana (desayuno)'
  else if (hora >= 12 && hora < 15) momento = 'mediodía (comida)'
  else if (hora >= 15 && hora < 19) momento = 'tarde'
  else if (hora >= 19 && hora < 23) momento = 'noche'
  else momento = 'madrugada'

  return `CONTEXTO TEMPORAL ACTUAL:
Hora: ${hora}:${String(ahora.getMinutes()).padStart(2, '0')} — momento del día: ${momento}
Día: ${dia}${esFinDeSemana ? ' (FIN DE SEMANA — más opciones abiertas, ambiente festivo)' : ' (día entre semana)'}
${hora >= 12 && hora < 16 && esFinDeSemana ? '⚡ MOMENTO PERFECTO para borrego estilo Durango — solo se consigue fines de semana al mediodía.' : ''}
${hora >= 19 ? '🌙 Es de noche — enfoca recomendaciones en lugares con servicio nocturno y mezcal.' : ''}
${hora >= 6 && hora < 11 ? '☀️ Es mañana — prioriza gorditas, tacos de canasta y desayunos.' : ''}
`
}
