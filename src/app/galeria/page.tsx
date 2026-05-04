'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { hex2rgba } from '@/shared/lib/colors'

// ── Palette ───────────────────────────────────────────────
const WORLD_PALETTE: Record<string, { color: string; bg: string; name: string; star: string }> = {
  roshar:   { color: '#4d8fd4', bg: '#030c1e', name: 'Roshar',   star: 'Tanavast (Honor)' },
  scadrial: { color: '#c8a855', bg: '#0e0800', name: 'Scadrial',  star: 'Leras (Preservación)' },
  sel:      { color: '#7cba65', bg: '#030e04', name: 'Sel',       star: 'Aona (Devoción)' },
  nalthis:  { color: '#d47c4d', bg: '#160800', name: 'Nalthis',   star: 'Edgli (Dotación)' },
  taldain:  { color: '#d4c44d', bg: '#0a0800', name: 'Taldain',   star: 'Autonomía' },
  lumar:    { color: '#8a5fd4', bg: '#04020e', name: 'Lumar',     star: 'Desconocida' },
  komashi:  { color: '#d44d8a', bg: '#0e0208', name: 'Komashi',   star: 'Virtuosismo' },
  canticle: { color: '#d4804d', bg: '#140800', name: 'Canticle',  star: 'Desconocida' },
  yolen:    { color: '#c8b880', bg: '#080808', name: 'Yolen',     star: 'Origen del Cosmere' },
}

// ── Data ─────────────────────────────────────────────────
const WORLDS = [
  { id: 'roshar', books: [
    { title: 'El Camino de los Reyes', year: 2010, series: 'Stormlight #1', desc: 'Kaladin cae a la esclavitud. Las Altas Tormentas barren Roshar mientras los Caballeros Radiantes regresan.' },
    { title: 'Palabras Radiantes',     year: 2014, series: 'Stormlight #2', desc: 'Los Portadores del Vacío vuelven. Shallan llega a Urithiru. Kaladin jura el Tercer Ideal.' },
    { title: 'Juramentada',            year: 2017, series: 'Stormlight #3', desc: 'La gran Desolación comienza. Dalinar une a los reyes. Odium revela su verdadero poder.' },
    { title: 'El Ritmo de la Guerra',  year: 2020, series: 'Stormlight #4', desc: 'Urithiru cae. La Luz Siniestra emerge. Navani descubre los secretos del fabrialismo avanzado.' },
    { title: 'Viento y Verdad',        year: 2024, series: 'Stormlight #5', desc: 'La conclusión de la primera mitad. El Cosmere cambia irrevocablemente. Szeth encuentra su camino.' },
    { title: 'Edgedancer',             year: 2016, series: 'Novella',       desc: 'Lift busca al asesino de blanco mientras come todo lo que encuentra en la ciudad de Yeddaw.' },
    { title: 'Dawnshard',              year: 2020, series: 'Novella',       desc: 'Rysn navega al continente prohibido de Aimia y descubre uno de los poderes primordiales del Cosmere.' },
  ]},
  { id: 'scadrial', books: [
    { title: 'El Imperio Final',        year: 2006, series: 'Mistborn Era 1 #1', desc: 'Kelsier y Vin roban el Imperio. El Lord Legislador lleva mil años en el trono.' },
    { title: 'El Pozo de la Ascensión', year: 2007, series: 'Mistborn Era 1 #2', desc: 'El Imperio ha caído pero el verdadero enemigo despierta bajo Luthadel.' },
    { title: 'El Héroe de las Eras',    year: 2008, series: 'Mistborn Era 1 #3', desc: 'El apocalipsis llega. Ruina es libre. Sazed busca en qué creer al final del mundo.' },
    { title: 'Aleación de Ley',         year: 2011, series: 'Wax & Wayne #1',    desc: '300 años después. Wax, sheriff alomántico, regresa a la ciudad como heredero noble.' },
    { title: 'Sombras de Identidad',    year: 2016, series: 'Wax & Wayne #2',    desc: 'Los Colmillos usan hemalurgia. Kelsier opera desde el Reino Cognitivo.' },
    { title: 'Brazales de Duelo',       year: 2017, series: 'Wax & Wayne #3',    desc: 'Wax se enfrenta al Superviviente. Autonomía pone los ojos en Scadrial.' },
    { title: 'El Metal Perdido',        year: 2022, series: 'Wax & Wayne #4',    desc: 'La Era 2 concluye. El viaje entre mundos se vuelve central por primera vez.' },
  ]},
  { id: 'sel', books: [
    { title: 'Elantris',              year: 2005, series: 'Sel #1',  desc: 'La ciudad de dioses cayó. Raoden despierta transformado. Sarene llega a un reino en crisis.' },
    { title: 'El Alma del Emperador', year: 2012, series: 'Novella', desc: 'Hugo Award. Shai, Forjadora del Alma, debe recrear la mente del Emperador en 100 días.' },
  ]},
  { id: 'nalthis', books: [
    { title: 'El Aliento de los Dioses', year: 2009, series: 'Warbreaker', desc: 'Siri y Vivenna en la ciudad de los dioses Retornados. Vasher porta la espada que devora almas.' },
  ]},
  { id: 'taldain', books: [
    { title: 'White Sand (Arena Blanca)', year: 2016, series: 'Novela Gráfica', desc: 'Kenton sobrevive a una masacre y lidera a los Sand Masters. Khriss investiga la magia del desierto.' },
  ]},
  { id: 'lumar', books: [
    { title: 'Trenza del Mar Esmeralda', year: 2023, series: 'Secretas Historia #1', desc: 'Tress cruza los mares de esporas para rescatar a Charlie. Hoid narra su propia historia.' },
  ]},
  { id: 'komashi', books: [
    { title: 'Yumi y el Pintor de Pesadillas', year: 2023, series: 'Secretas Historia #2', desc: 'Una santa y un pintor sin talento intercambian mundos y vidas.' },
  ]},
  { id: 'canticle', books: [
    { title: 'El Hombre Iluminado', year: 2023, series: 'Secretas Historia #3', desc: 'Sigzil/Nomad huye por el Cosmere y en Canticle encuentra su redención bajo un sol letal.' },
  ]},
]

interface Character {
  name: string; role: string; book: string; power: string; trait: string; arc: string
}
const CHARACTERS: Record<string, Character[]> = {
  roshar: [
    { name: 'Kaladin Stormblessed',  role: 'Protagonista · Portador del Viento',         book: 'Stormlight 1-5',    power: 'Gravedad y Vínculo · Luz de Tormenta',        trait: 'Protector compulsivo. Luchador eterno contra su propia oscuridad.',            arc: 'De esclavo de puentes a Cuarto Ideal y Portador del Viento.' },
    { name: 'Dalinar Kholin',        role: 'El Unificador · Portador de la Bondad',       book: 'Stormlight 1-5',    power: 'Tesedor de Vínculos · Bondad',                trait: 'Antigua fiera de guerra transformada en estadista. Lleva el peso del mundo.',   arc: 'De conquistador brutal a garante del nuevo mundo.' },
    { name: 'Shallan Davar',         role: 'Forjadora de Patrones · Tejedora de Luz',     book: 'Stormlight 1-5',    power: 'Ilusión · Transformación · Luz de Tormenta',  trait: 'Identidades fragmentadas. Dibujante obsesiva. Oculta trauma bajo humor.',       arc: 'Aprende a integrar sus fragmentos de personalidad en lugar de huir.' },
    { name: 'Szeth-son-Neturo',      role: 'El Asesino de Blanco · Portador de la Verdad',book: 'Stormlight 1-5',    power: 'Gravedad · Lashings · Luz de Tormenta',       trait: 'Shin torturado por sus crímenes. Busca redención a través de la obediencia.',    arc: 'De asesino a la fuerza a guardián que elige por convicción.' },
    { name: 'Navani Kholin',         role: 'Reina · Gran Investigadora',                  book: 'Stormlight 1-5',    power: 'Fabrialismo · Luz Siniestra · Dawnshard',     trait: 'Científica brillante en un mundo que subestima a las mujeres académicas.',      arc: 'De esposa del rey a arquitecta del nuevo conocimiento del Cosmere.' },
    { name: 'Adolin Kholin',         role: 'Duelist · Príncipe',                          book: 'Stormlight 1-5',    power: 'Espadachín sin magia · Maya (Portadora viva)', trait: 'El hombre normal en una saga de héroes extraordinarios. Su normalidad es su fuerza.', arc: 'Devuelve la vida a un spren muerto con amistad pura, sin magia.' },
    { name: 'Lift',                  role: 'La que no debe crecer',                        book: 'Edgedancer · Stormlight', power: 'Progresión · Convierte comida en Stormlight', trait: 'Roba comida y huye de crecer. La chica que eligió no olvidar al mundo.', arc: 'Aprende que querer a la gente no es debilidad.' },
    { name: 'Venli',                 role: 'Traicionera arrepentida · Portadora del Despertar', book: 'Stormlight 3-5', power: 'Forma Iluminada · Despertar',             trait: 'Traicionó a su pueblo por ambición. Lidera su redención desde dentro.',         arc: 'De cómplice de la invasión a profetisa de la libertad reshi.' },
  ],
  scadrial: [
    { name: 'Kelsier',            role: 'El Superviviente · Señor de los Ladrones', book: 'Mistborn Era 1',  power: 'Alomancia completa · Inmortalidad cognitiva',   trait: 'Carismático hasta la manipulación. Ama a su equipo pero lo usa como piezas.',  arc: 'Muere y vuelve — primero como leyenda, luego como fuerza activa del Cosmere.' },
    { name: 'Vin',                role: 'La Heroína de las Eras',                   book: 'Mistborn Era 1',  power: 'Alomancia completa · Bruma · Ruina/Preservación', trait: 'Creció en las sombras. Desconfía de todos. Aprende a amar y a confiar.',       arc: 'De ladrona de los bajos fondos a avatar de las Esquirlas y Heroína mítica.' },
    { name: 'Sazed',              role: 'El Terrisano que se convirtió en dios',    book: 'Mistborn Era 1',  power: 'Feruquimia completa · Armonía (2 Esquirlas)',    trait: 'Estudioso humilde de religiones. Perdió su fe antes de ganarla toda.',         arc: 'Absorbe dos Esquirlas opuestas y lucha por mantener el equilibrio como Armonía.' },
    { name: 'Elend Venture',      role: 'El Rey Filósofo',                          book: 'Mistborn Era 1-2', power: 'Alomancia (tardía) · Feruquimia (mínima)',      trait: 'Idealista que aprende que gobernar exige sangre además de principios.',        arc: 'De noble literario a rey-guerrero que carga con las decisiones imposibles.' },
    { name: 'Waxillium Ladrian',  role: 'Sheriff · Heredero noble',                 book: 'Wax & Wayne',     power: 'Alomancia (hierro/acero) · Feruquimia (peso)',   trait: 'Hombre del orden en dos mundos: el salvaje Outer Ring y la alta sociedad.',    arc: 'Encuentra que identidad y deber pueden coexistir sin destruirse.' },
    { name: 'Wayne',              role: 'El Cambiante · Ladrón regenerador',        book: 'Wax & Wayne',     power: 'Alomancia (bendalloy) · Feruquimia (salud)',     trait: 'Se disfraza de cualquier persona. Bromista que oculta profundo dolor y culpa.', arc: 'Su sacrificio final revela que siempre fue el más noble del equipo.' },
  ],
  sel: [
    { name: 'Raoden',  role: 'Príncipe · Rey de Elantris',    book: 'Elantris',              power: 'Aon Dor (restaurado)',              trait: 'Mantiene esperanza y liderazgo incluso transformado en muerto viviente.', arc: 'De príncipe perfecto a dios caído a restaurador de Elantris.' },
    { name: 'Sarene',  role: 'Princesa diplomática',          book: 'Elantris',              power: 'Sin magia · Inteligencia política', trait: 'Letal en política. Rechaza el rol pasivo asignado a las mujeres de su época.', arc: 'Navega una conspiración política y salva a un reino sin poderes mágicos.' },
    { name: 'Hrathen', role: 'El Gyorn conquistador',         book: 'Elantris',              power: 'Fe y retórica · Dakhor (implícito)', trait: 'El villano más humano: convencido de que hace el bien al conquistar almas.', arc: 'Su fe se quiebra y elige a las personas sobre la doctrina.' },
    { name: 'Shai',    role: 'La Forjadora del Alma',         book: 'El Alma del Emperador', power: 'Sello del Alma · Forja de la Realidad', trait: 'La artista más grande del Cosmere. Ve la identidad como algo moldeable y real.', arc: 'Recrea el alma de un hombre y en el proceso define qué hace a una persona.' },
  ],
  nalthis: [
    { name: 'Vivenna',   role: 'Princesa preparada · Despertar tardía',         book: 'Warbreaker',           power: 'Despertar · Control de cabello · Aliento',       trait: 'Rígida por educación. Se deshace y reconstruye en la ciudad que la consume.',  arc: 'Va a rescatar a su hermana y termina siendo quien necesita rescate y transformación.' },
    { name: 'Siri',      role: 'La hermana enviada · Reina de dioses',          book: 'Warbreaker',           power: 'Mínima magia · Intuición social extraordinaria', trait: 'Libre y espontánea donde Vivenna era disciplinada. Sobrevive con simpatía genuina.', arc: 'Sobrevive a la corte divina siendo exactamente ella misma.' },
    { name: 'Lightsong', role: 'El Dios que no cree en sí mismo',               book: 'Warbreaker',           power: 'Retornado · Visión profética · Aliento divino',  trait: 'Sarcástico, perezoso, cuestionador de todo. Especialmente de su propia divinidad.', arc: 'Su escepticismo lo hace el único con claridad para el sacrificio necesario.' },
    { name: 'Vasher',    role: 'El Despertar más poderoso · Zahel en Roshar',   book: 'Warbreaker · Stormlight', power: 'Despertar avanzado · Comandante de Nightblood', trait: 'Peso devastador de siglos de vida y crímenes. Busca un lugar donde descansar.', arc: 'Abandona Nalthis y vive exiliado en Roshar, incapaz de dejar de luchar.' },
  ],
  lumar: [
    { name: 'Tress', role: 'Recolectora de tazas · Heroína improbable', book: 'Trenza del Mar Esmeralda', power: 'Sin magia · Ingenio extraordinario · Sporas', trait: 'Modesta por convicción, no por inseguridad. La persona más lista de su historia.', arc: 'Sale de su isla por amor y descubre que siempre fue extraordinaria.' },
  ],
  komashi: [
    { name: 'Yumi',   role: 'La Santa Elegida · Invocadora de espíritus', book: 'Yumi y el Pintor', power: 'Invocación de yoki-hijo · Sacrificio ritual', trait: 'Carga el mundo de sus espaldas desde niña. Nunca ha elegido nada por sí misma.', arc: 'Aprende que merecimiento y sacrificio no son la misma cosa.' },
    { name: 'Nikaro', role: 'El Pintor sin talento · Nikolin',             book: 'Yumi y el Pintor', power: 'Pintura de Pesadillas (latente)',             trait: 'Farsante brillante. Su mayor poder es que nadie lo ve venir.',                  arc: 'Descubre que su "falta de talento" era el don más necesario para salvar su mundo.' },
  ],
}

interface Worldhopper {
  name: string; realName: string; origin: string; accent: string; bg: string
  role: string; magic: string; appearances: { world: string; alias: string; role: string }[]
  mystery: string; quote: string
}
const WORLDHOPPERS: Worldhopper[] = [
  {
    name: 'Hoid / Wit / Cephandrius', realName: 'Desconocido', origin: 'Yolen',
    accent: '#c8b880', bg: '#06060a', role: 'El Eterno Testigo',
    magic: 'Alomancia · Despertar · Cantamundos · Surgebinding · Sello del Alma · y más',
    appearances: [
      { world: 'Roshar',   alias: 'Wit / Malasei el Juglar', role: 'Bufón de la corte Kholin · Mentor oculto de Kaladin' },
      { world: 'Scadrial', alias: 'Drifter / Coins',         role: 'Alomante menor · Operador en las sombras de la Era 1' },
      { world: 'Sel',      alias: 'Mendigo de Teod',         role: 'Colector de Investidura de las Esquirlas astilladas' },
      { world: 'Nalthis',  alias: 'El Flautista',            role: 'Juglar en la corte de Hallandren' },
      { world: 'Lumar',    alias: 'Ala (Wing)',              role: 'Narrador de la historia de Tress · Protagonista parcial' },
      { world: 'Taldain',  alias: 'Hoid',                   role: 'Presente en los eventos de White Sand' },
    ],
    mystery: '¿Por qué es inmortal? ¿Qué perdió en Yolen que lo impulsa a recolectar magia? ¿Es el héroe o el mayor peligro del Cosmere?',
    quote: '"He vivido durante siglos y lo único que he aprendido es que las personas como tú —las que se preocupan— son las más peligrosas de todas."',
  },
  {
    name: 'Kelsier el Superviviente', realName: 'Kelsier', origin: 'Scadrial',
    accent: '#d4804d', bg: '#0e0400', role: 'El Inmortal Involuntario',
    magic: 'Alomancia completa · Existencia cognitiva · Conexión entre mundos',
    appearances: [
      { world: 'Scadrial', alias: 'El Superviviente',                    role: 'Leyenda viviente · Fantasma cognitivo · Operador secreto de los Ghostbloods' },
      { world: 'Roshar',   alias: 'Thaidakar (El que tiene sombra larga)', role: 'Líder de los Ghostbloods · Opera desde el Reino Cognitivo influenciando Roshar' },
    ],
    mystery: 'Murió pero no se fue. Existe en el Reino Cognitivo y construye una organización secreta inter-mundo. ¿Cuál es su objetivo final?',
    quote: '"Sobrevivir no es suficiente. Tienes que vivir."',
  },
  {
    name: 'Vasher / Zahel', realName: 'Vasher', origin: 'Nalthis',
    accent: '#d47c4d', bg: '#140600', role: 'El Exiliado de Siglos',
    magic: 'Despertar maestro · Portador de Nightblood · Sustentado por Stormlight en Roshar',
    appearances: [
      { world: 'Nalthis', alias: 'Vasher', role: 'Uno de los cinco Inmortales Guerreros. Creó a Nightblood junto a Shashara.' },
      { world: 'Roshar',  alias: 'Zahel',  role: 'Maestro de armas en las fortalezas Kholin. Entrena a Adolin y Kaladin en secreto.' },
    ],
    mystery: '¿Por qué huyó de Nalthis? ¿Qué crimen lo hace incapaz de descansar? Su pasado y el de Vivenna están unidos a la historia de Nightblood.',
    quote: '"Cometí un error hace mucho tiempo. Algunas personas llaman a eso genio."',
  },
  {
    name: 'Khriss', realName: 'Khrissalla', origin: 'Taldain (Darkside)',
    accent: '#d4c44d', bg: '#080600', role: 'La Gran Estudiosa del Cosmere',
    magic: 'Sin magia · Conocimiento enciclopédico de la Investidura',
    appearances: [
      { world: 'Taldain', alias: 'Khriss', role: 'Protagonista de White Sand. Académica del Darkside que estudia el Dayside.' },
      { world: 'Cosmere', alias: 'Khriss', role: 'Autora de los ensayos de Arcanum Unbounded. Conoce más secretos del Cosmere que casi nadie.' },
    ],
    mystery: 'Es la autora en la sombra de los epílogos de Arcanum Unbounded. Su perspectiva sobre Hoid y las Esquirlas es la más objetiva que existe.',
    quote: '"La Investidura no entiende de lealtades. Es una fuerza, como la gravedad. La pregunta es quién la sostiene."',
  },
  {
    name: 'Nazh', realName: 'Nazrilof', origin: 'Threnody',
    accent: '#9090c8', bg: '#04040e', role: 'El Agente de Khriss',
    magic: 'Resistencia a las Sombras · Habilidad innata de Threnody',
    appearances: [
      { world: 'Roshar',   alias: 'Nazh', role: 'Colector de mapas y artefactos para Khriss. Sus anotaciones aparecen en los mapas del Archivo de las Tormentas.' },
      { world: 'Scadrial', alias: 'Nazh', role: 'Recopila información de la Era de los Metales.' },
    ],
    mystery: 'Huyó de Threnody, un mundo de sombras y muertos que regresan. Sus anotaciones en los mapas son la única ventana a su carácter.',
    quote: '"Khriss: necesito un aumento. Nazh."',
  },
]

// ── Noise / canvas helpers ────────────────────────────────
type RGB = { r: number; g: number; b: number }
const h2r = (hex: string): RGB => ({ r: parseInt(hex.slice(1,3),16), g: parseInt(hex.slice(3,5),16), b: parseInt(hex.slice(5,7),16) })
const hs  = (x: number, y: number, s = 7) => { const n = Math.sin(x*127.1+y*311.7+s*74.3)*43758.5453; return n-Math.floor(n) }
const ns  = (x: number, y: number, s = 7) => { const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,ux=fx*fx*(3-2*fx),uy=fy*fy*(3-2*fy); return hs(ix,iy,s)*(1-ux)*(1-uy)+hs(ix+1,iy,s)*ux*(1-uy)+hs(ix,iy+1,s)*(1-ux)*uy+hs(ix+1,iy+1,s)*ux*uy }
const fbm = (x: number, y: number, o = 4, s = 7) => { let v=0,a=0.5,f=1; for(let i=0;i<o;i++){v+=a*ns(x*f,y*f,s);a*=0.5;f*=2.1} return v }

function drawPortrait(canvas: HTMLCanvasElement, world: string) {
  const W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d')!
  const pal=WORLD_PALETTE[world]||{color:'#c8b880',bg:'#050508'}
  const ac=h2r(pal.color),bgc=h2r(pal.bg)
  const bg=ctx.createRadialGradient(W*.45,H*.35,0,W*.5,H*.5,W*.9)
  bg.addColorStop(0,`rgb(${Math.min(bgc.r+20,60)},${Math.min(bgc.g+18,55)},${Math.min(bgc.b+22,70)})`)
  bg.addColorStop(1,pal.bg); ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
  for(let i=0;i<4;i++){const y=H*(.15+i*.22),str=.03+i*.01,g2=ctx.createLinearGradient(0,y-40,0,y+40);g2.addColorStop(0,'rgba(0,0,0,0)');g2.addColorStop(.5,`rgba(${ac.r},${ac.g},${ac.b},${str})`);g2.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g2;ctx.fillRect(0,y-40,W,80)}
  if(world==='roshar'){ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.12)`;ctx.lineWidth=1;for(let i=0;i<5;i++){const sx=Math.random()*W;ctx.beginPath();ctx.moveTo(sx,0);let cx2=sx,cy2=0;while(cy2<H*.6){cx2+=(Math.random()-.5)*30;cy2+=Math.random()*40+10;ctx.lineTo(cx2,cy2)}ctx.stroke()}}
  else if(world==='scadrial'){ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.08)`;ctx.lineWidth=2;for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(i*W*.14,H);ctx.bezierCurveTo(i*W*.14+(Math.random()-.5)*40,H*.6,i*W*.14+(Math.random()-.5)*60,H*.3,i*W*.14+(Math.random()-.5)*50,0);ctx.stroke()}}
  else if(world==='komashi'){for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(Math.random()*W,0);ctx.lineTo(Math.random()*W,H);ctx.strokeStyle='rgba(255,80,20,.06)';ctx.lineWidth=3+Math.random()*6;ctx.stroke()}}
  else if(world==='lumar'){for(let i=0;i<4;i++){const mx=W*(.1+i*.25),my=H*(.08+i*.04),mr=W*.04,mg=ctx.createRadialGradient(mx,my,0,mx,my,mr);mg.addColorStop(0,'rgba(180,160,220,.6)');mg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=mg;ctx.fillRect(mx-mr,my-mr,mr*2,mr*2)}}
  const fx=W*.5,fy=H*.45
  for(let i=0;i<3;i++){const r=W*(.22+i*.08);ctx.beginPath();ctx.arc(fx,fy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},${.18-.05*i})`;ctx.lineWidth=i===0?1.5:.8;ctx.setLineDash(i===2?[4,6]:[]);ctx.stroke();ctx.setLineDash([])}
  const headR=W*.085
  const bodyGlow=ctx.createRadialGradient(fx,fy+headR*1.5,0,fx,fy+headR,W*.3);bodyGlow.addColorStop(0,`rgba(${ac.r},${ac.g},${ac.b},.14)`);bodyGlow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=bodyGlow;ctx.fillRect(0,0,W,H)
  const headGrad=ctx.createRadialGradient(fx-headR*.3,fy-H*.2-headR*.3,0,fx,fy-H*.2,headR);headGrad.addColorStop(0,`rgba(${ac.r*.4|0},${ac.g*.35|0},${ac.b*.3|0},.9)`);headGrad.addColorStop(1,'rgba(10,8,12,.85)');ctx.beginPath();ctx.arc(fx,fy-H*.2,headR,0,Math.PI*2);ctx.fillStyle=headGrad;ctx.fill();ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.35)`;ctx.lineWidth=1;ctx.stroke()
  const bg2=ctx.createLinearGradient(fx,fy-H*.1,fx,fy+H*.35);bg2.addColorStop(0,`rgba(${ac.r*.3|0},${ac.g*.28|0},${ac.b*.25|0},.8)`);bg2.addColorStop(1,'rgba(5,5,8,.7)');ctx.beginPath();ctx.moveTo(fx-W*.1,fy+H*.35);ctx.bezierCurveTo(fx-W*.12,fy+H*.1,fx-W*.07,fy-H*.08,fx,fy-H*.1);ctx.bezierCurveTo(fx+W*.07,fy-H*.08,fx+W*.12,fy+H*.1,fx+W*.1,fy+H*.35);ctx.closePath();ctx.fillStyle=bg2;ctx.fill();ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.2)`;ctx.lineWidth=1;ctx.stroke()
  const sparkle=ctx.createRadialGradient(fx,fy-H*.2,0,fx,fy-H*.2,headR*2.5);sparkle.addColorStop(0,`rgba(${ac.r},${ac.g},${ac.b},.25)`);sparkle.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=sparkle;ctx.fillRect(0,0,W,H)
  const bot=ctx.createLinearGradient(0,H*.6,0,H);bot.addColorStop(0,'rgba(0,0,0,0)');bot.addColorStop(1,'rgba(0,0,0,.75)');ctx.fillStyle=bot;ctx.fillRect(0,H*.6,W,H*.4)
}

function drawBookCover(canvas: HTMLCanvasElement, title: string, world: string) {
  const W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d')!
  const pal=WORLD_PALETTE[world]||{color:'#c8b880',bg:'#050508'}
  const ac=h2r(pal.color),bgc=h2r(pal.bg)
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,`rgb(${Math.min(bgc.r+25,70)},${Math.min(bgc.g+20,65)},${Math.min(bgc.b+28,80)})`);bg.addColorStop(1,pal.bg);ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
  const sd=title.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%100
  const imgD=ctx.createImageData(W,H);const d=imgD.data
  for(let py=0;py<H;py++)for(let px=0;px<W;px++){const idx=(py*W+px)*4,u=px/W,v=py/H,n=fbm(u*4+sd,v*4,4,sd);d[idx]=ac.r*(n*.4)|0;d[idx+1]=ac.g*(n*.35)|0;d[idx+2]=ac.b*(n*.5)|0;d[idx+3]=30}
  ctx.putImageData(imgD,0,0)
  const cg=ctx.createRadialGradient(W/2,H*.38,0,W/2,H*.38,W*.5);cg.addColorStop(0,`rgba(${ac.r},${ac.g},${ac.b},.22)`);cg.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=cg;ctx.fillRect(0,0,W,H)
  const cx2=W/2,cy2=H*.36,sr=W*.22
  if(world==='roshar'){for(let i=0;i<10;i++){const a=i/10*Math.PI*2;ctx.beginPath();ctx.moveTo(cx2+Math.cos(a)*sr*.4,cy2+Math.sin(a)*sr*.4);ctx.lineTo(cx2+Math.cos(a)*sr,cy2+Math.sin(a)*sr);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.3)`;ctx.lineWidth=1;ctx.stroke()}ctx.beginPath();ctx.arc(cx2,cy2,sr*.4,0,Math.PI*2);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.5)`;ctx.lineWidth=1.5;ctx.stroke()}
  else if(world==='scadrial'){ctx.beginPath();ctx.moveTo(cx2,cy2-sr);ctx.lineTo(cx2+sr*.5,cy2+sr*.6);ctx.lineTo(cx2-sr*.5,cy2+sr*.6);ctx.closePath();ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.45)`;ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle=`rgba(${ac.r},${ac.g},${ac.b},.08)`;ctx.fill()}
  else{ctx.beginPath();ctx.arc(cx2,cy2,sr,0,Math.PI*2);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.35)`;ctx.lineWidth=1.2;ctx.stroke();ctx.beginPath();ctx.arc(cx2,cy2,sr*.55,0,Math.PI*2);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.2)`;ctx.lineWidth=.8;ctx.stroke()}
  const bi=ctx.createLinearGradient(0,H*.55,0,H);bi.addColorStop(0,'rgba(0,0,0,0)');bi.addColorStop(.35,'rgba(0,0,0,.72)');bi.addColorStop(1,'rgba(0,0,0,.92)');ctx.fillStyle=bi;ctx.fillRect(0,H*.55,W,H*.45)
}

function drawWorldhopperCard(canvas: HTMLCanvasElement, wh: Worldhopper) {
  const W=canvas.width,H=canvas.height,ctx=canvas.getContext('2d')!
  const ac=h2r(wh.accent)
  const bg=ctx.createRadialGradient(W*.4,H*.35,0,W*.5,H*.5,W*.9);bg.addColorStop(0,`rgba(${ac.r*.15|0},${ac.g*.12|0},${ac.b*.18|0},1)`);bg.addColorStop(1,'rgba(2,2,6,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)
  for(let i=0;i<60;i++){const sx=Math.random()*W,sy=Math.random()*H,sr=Math.random()*1.5;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${.2+Math.random()*.6})`;ctx.fill()}
  const cx2=W*.5,cy2=H*.42
  wh.appearances.forEach((ap,i)=>{
    const angle=(i/wh.appearances.length)*Math.PI*2-Math.PI/2+.3,r=W*.3
    const tx=cx2+Math.cos(angle)*r,ty=cy2+Math.sin(angle)*r
    ctx.beginPath();ctx.moveTo(cx2,cy2);ctx.bezierCurveTo(cx2+(tx-cx2)*.3+(Math.random()-.5)*60,cy2+(ty-cy2)*.3+(Math.random()-.5)*40,cx2+(tx-cx2)*.7,cy2+(ty-cy2)*.7,tx,ty);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.2)`;ctx.lineWidth=.8;ctx.setLineDash([3,5]);ctx.stroke();ctx.setLineDash([])
    const wPal=Object.values(WORLD_PALETTE).find(p=>p.name===ap.world);const wc=h2r(wPal?.color||wh.accent)
    ctx.beginPath();ctx.arc(tx,ty,4,0,Math.PI*2);ctx.fillStyle=`rgba(${wc.r},${wc.g},${wc.b},.85)`;ctx.fill()
  })
  const hgr=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,W*.18);hgr.addColorStop(0,`rgba(${ac.r*.5|0},${ac.g*.45|0},${ac.b*.4|0},.85)`);hgr.addColorStop(1,'rgba(5,5,10,.9)');ctx.beginPath();ctx.arc(cx2,cy2,W*.14,0,Math.PI*2);ctx.fillStyle=hgr;ctx.fill();ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.55)`;ctx.lineWidth=1.5;ctx.stroke()
  ctx.beginPath();ctx.arc(cx2,cy2,W*.09,0,Math.PI*2);ctx.strokeStyle=`rgba(${ac.r},${ac.g},${ac.b},.3)`;ctx.lineWidth=.8;ctx.stroke()
  const glow=ctx.createRadialGradient(cx2,cy2,0,cx2,cy2,W*.22);glow.addColorStop(0,`rgba(${ac.r},${ac.g},${ac.b},.18)`);glow.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H)
  const bot=ctx.createLinearGradient(0,H*.6,0,H);bot.addColorStop(0,'rgba(0,0,0,0)');bot.addColorStop(1,'rgba(0,0,0,.82)');ctx.fillStyle=bot;ctx.fillRect(0,H*.6,W,H*.4)
}

// ── Sub-components ────────────────────────────────────────
function BookCard({ book, world, index }: { book: { title: string; year: number; series: string; desc: string }; world: string; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hov, setHov] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const pal = WORLD_PALETTE[world] || { color: '#c8b880' }

  useEffect(() => {
    if (!canvasRef.current) return
    drawBookCover(canvasRef.current, book.title, world)
  }, [book.title, world])

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => setExpanded(e => !e)}
      style={{
        background: 'linear-gradient(160deg,rgba(15,15,25,.9),rgba(5,5,10,.95))',
        border: `1px solid ${hex2rgba(pal.color, expanded ? .45 : hov ? .28 : .12)}`,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        boxShadow: expanded ? `0 8px 40px rgba(0,0,0,.6),0 0 20px ${hex2rgba(pal.color,.18)}` : hov ? `0 4px 20px rgba(0,0,0,.4),0 0 10px ${hex2rgba(pal.color,.1)}` : 'none',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        transform: hov && !expanded ? 'translateY(-4px)' : 'none',
        animation: `fadeUp .45s ease ${index * .05}s both`,
      }}
    >
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={320} height={240} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 50%,rgba(5,5,10,.9))' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 14 }}>
          <div style={{ color: pal.color, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 2, opacity: .8 }}>{book.series}</div>
          <div style={{ color: '#f0e8d8', fontSize: 13, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 700, lineHeight: 1.25, textShadow: '0 1px 4px rgba(0,0,0,.8)' }}>{book.title}</div>
        </div>
        <div style={{ position: 'absolute', top: 10, right: 10, color: hex2rgba(pal.color,.7), fontSize: 9 }}>{book.year}</div>
      </div>
      <div style={{ padding: '12px 14px', maxHeight: expanded ? 200 : 0, overflow: 'hidden', transition: 'max-height .3s ease' }}>
        <p style={{ color: '#8899bb', fontSize: 11.5, lineHeight: 1.65 }}>{book.desc}</p>
      </div>
      {!expanded && <div style={{ padding: '0 14px 10px', color: hex2rgba(pal.color,.4), fontSize: 9 }}>clic para leer →</div>}
    </div>
  )
}

function CharacterCard({ char, world, index }: { char: Character; world: string; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hov, setHov] = useState(false)
  const [open, setOpen] = useState(false)
  const pal = WORLD_PALETTE[world] || { color: '#c8b880' }

  useEffect(() => {
    if (!canvasRef.current) return
    drawPortrait(canvasRef.current, world)
  }, [char.name, world])

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'rgba(8,10,20,.95)',
        border: `1px solid ${hex2rgba(pal.color, open ? .45 : hov ? .3 : .14)}`,
        borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
        boxShadow: open ? `0 8px 40px rgba(0,0,0,.65),0 0 24px ${hex2rgba(pal.color,.2)}` : hov ? '0 4px 20px rgba(0,0,0,.4)' : 'none',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        transform: hov && !open ? 'translateY(-5px)' : 'none',
        animation: `fadeUp .45s ease ${index * .06}s both`,
      }}
    >
      <div style={{ position: 'relative', height: 180, overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={320} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%,rgba(8,10,20,.95))' }} />
        <div style={{ position: 'absolute', bottom: 10, left: 14, right: 14 }}>
          <div style={{ color: pal.color, fontSize: 8.5, letterSpacing: '.1em', textTransform: 'uppercase', opacity: .8, marginBottom: 2 }}>{char.book}</div>
          <div style={{ color: '#f0e8d8', fontSize: 14, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 700 }}>{char.name}</div>
          <div style={{ color: '#7788aa', fontSize: 10, marginTop: 2, fontStyle: 'italic' }}>{char.role}</div>
        </div>
      </div>
      <div style={{ padding: '12px 14px', maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height .35s ease' }}>
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: hex2rgba(pal.color,.7), fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Poderes</div>
          <div style={{ color: '#9ab0c8', fontSize: 11 }}>{char.power}</div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ color: hex2rgba(pal.color,.7), fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Carácter</div>
          <p style={{ color: '#8899bb', fontSize: 11, lineHeight: 1.6 }}>{char.trait}</p>
        </div>
        <div style={{ padding: '8px 10px', background: hex2rgba(pal.color,.06), borderLeft: `2px solid ${hex2rgba(pal.color,.4)}`, borderRadius: '0 6px 6px 0' }}>
          <div style={{ color: hex2rgba(pal.color,.6), fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 3 }}>Arco</div>
          <p style={{ color: '#8899bb', fontSize: 11, lineHeight: 1.55 }}>{char.arc}</p>
        </div>
      </div>
      {!open && <div style={{ padding: '0 14px 10px', color: hex2rgba(pal.color,.4), fontSize: 9 }}>clic para ver →</div>}
    </div>
  )
}

function WorldSection({ worldId, books }: { worldId: string; books: { title: string; year: number; series: string; desc: string }[] }) {
  const pal = WORLD_PALETTE[worldId] || { color: '#c8b880', name: worldId, star: '' }
  const [open, setOpen] = useState(true)
  return (
    <div style={{ marginBottom: 40 }}>
      <div onClick={() => setOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: open ? 24 : 0, cursor: 'pointer', paddingBottom: 14, borderBottom: `1px solid ${hex2rgba(pal.color, open ? .25 : .1)}`, transition: 'all .2s' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: pal.color, boxShadow: `0 0 16px ${pal.color}`, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <h2 style={{ color: '#f0e8d8', fontSize: 20, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 700, letterSpacing: '.06em' }}>{pal.name}</h2>
          <div style={{ color: '#445566', fontSize: 10, marginTop: 2 }}>Esquirla: {pal.star} · {books.length} {books.length === 1 ? 'obra' : 'obras'}</div>
        </div>
        <span style={{ color: '#334455', fontSize: 18, transform: open ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s' }}>▾</span>
      </div>
      {open && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
          {books.map((b, i) => <BookCard key={b.title} book={b} world={worldId} index={i} />)}
        </div>
      )}
    </div>
  )
}

function WorldhopperCard({ wh, index }: { wh: Worldhopper; index: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hov, setHov] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!canvasRef.current) return
    drawWorldhopperCard(canvasRef.current, wh)
  }, [wh.name])

  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      onClick={() => setOpen(o => !o)}
      style={{
        background: 'rgba(5,5,12,.95)',
        border: `1px solid ${hex2rgba(wh.accent, open ? .5 : hov ? .3 : .16)}`,
        borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        boxShadow: open ? `0 12px 50px rgba(0,0,0,.7),0 0 30px ${hex2rgba(wh.accent,.22)}` : hov ? `0 6px 24px rgba(0,0,0,.5),0 0 14px ${hex2rgba(wh.accent,.12)}` : 'none',
        transition: 'all .3s cubic-bezier(.22,1,.36,1)',
        transform: hov && !open ? 'translateY(-6px)' : 'none',
        animation: `fadeUp .5s ease ${index * .12}s both`,
      }}
    >
      <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
        <canvas ref={canvasRef} width={400} height={280} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 35%,rgba(5,5,12,.95))' }} />
        <div style={{ position: 'absolute', bottom: 14, left: 18, right: 18 }}>
          <div style={{ color: wh.accent, fontSize: 9, letterSpacing: '.14em', textTransform: 'uppercase', marginBottom: 4, opacity: .8 }}>{wh.origin} · {wh.appearances.length} mundos visitados</div>
          <h3 style={{ color: '#f0e8d8', fontSize: 18, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 700, lineHeight: 1.2 }}>{wh.name}</h3>
          <div style={{ color: '#7788aa', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>{wh.role}</div>
        </div>
      </div>
      <div style={{ padding: '14px 18px 0' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {wh.appearances.map(ap => {
            const wPal = Object.entries(WORLD_PALETTE).find(([,p]) => p.name === ap.world)
            const wColor = wPal ? wPal[1].color : '#888'
            return (
              <div key={ap.world} style={{ background: hex2rgba(wColor,.08), border: `1px solid ${hex2rgba(wColor,.25)}`, borderRadius: 6, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: wColor, boxShadow: `0 0 6px ${wColor}` }} />
                <span style={{ color: wColor, fontSize: 9, letterSpacing: '.05em' }}>{ap.world}</span>
                <span style={{ color: '#334455', fontSize: 9 }}>({ap.alias})</span>
              </div>
            )
          })}
        </div>
      </div>
      <div style={{ padding: '0 18px', maxHeight: open ? 400 : 0, overflow: 'hidden', transition: 'max-height .4s ease' }}>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: hex2rgba(wh.accent,.6), fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>Magia acumulada</div>
          <p style={{ color: '#9ab0c8', fontSize: 11 }}>{wh.magic}</p>
        </div>
        <div style={{ marginBottom: 12 }}>
          <div style={{ color: hex2rgba(wh.accent,.6), fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 8 }}>Rol en cada mundo</div>
          {wh.appearances.map(ap => (
            <div key={ap.world} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: `2px solid ${hex2rgba(wh.accent,.2)}` }}>
              <div style={{ color: wh.accent, fontSize: 10, marginBottom: 2 }}>{ap.world} — {ap.alias}</div>
              <p style={{ color: '#778899', fontSize: 10.5, lineHeight: 1.5 }}>{ap.role}</p>
            </div>
          ))}
        </div>
        <div style={{ padding: '10px 12px', background: hex2rgba(wh.accent,.06), borderLeft: `2px solid ${hex2rgba(wh.accent,.4)}`, borderRadius: '0 6px 6px 0', marginBottom: 14 }}>
          <div style={{ color: hex2rgba(wh.accent,.6), fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 4 }}>Misterio pendiente</div>
          <p style={{ color: '#8899bb', fontSize: 11, lineHeight: 1.6 }}>{wh.mystery}</p>
        </div>
      </div>
      <div style={{ padding: '8px 18px 14px', color: hex2rgba(wh.accent,.35), fontSize: 9, display: open ? 'none' : 'block' }}>clic para explorar →</div>
    </div>
  )
}

function HoidSection() {
  const hoid = WORLDHOPPERS[0]!
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tab, setTab] = useState<'mundos' | 'magia' | 'misterio'>('mundos')

  useEffect(() => {
    if (!canvasRef.current) return
    drawWorldhopperCard(canvasRef.current, hoid)
  }, [])

  const hoidFacts = [
    { icon: '✦', fact: 'Presenció la Fragmentación original de Adona — el evento que creó las Esquirlas.' },
    { icon: '◈', fact: 'Ha recolectado Investidura de al menos 6 sistemas de magia diferentes.' },
    { icon: '◉', fact: 'Es uno de los 17 originales de Yolen — el único mundo donde nacieron humanos antes de las Esquirlas.' },
    { icon: '⟳', fact: 'Su inmortalidad no proviene de una Esquirla — es algo anterior y más misterioso.' },
    { icon: '✦', fact: 'Su nombre real es desconocido. "Hoid" es solo el alias más frecuente.' },
    { icon: '◈', fact: 'Conecta con cada protagonista principal en cada saga, siempre en un momento pivote.' },
  ]

  return (
    <div>
      <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', marginBottom: 32, background: '#030308', border: `1px solid ${hex2rgba(hoid.accent,.3)}`, boxShadow: `0 0 60px ${hex2rgba(hoid.accent,.1)},0 20px 60px rgba(0,0,0,.6)` }}>
        <div style={{ height: 280, position: 'relative' }}>
          <canvas ref={canvasRef} width={1200} height={400} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(3,3,8,0) 40%, rgba(3,3,8,.95) 75%)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 30%, rgba(3,3,8,.98))' }} />
        </div>
        <div style={{ position: 'absolute', top: 0, right: 0, bottom: 160, width: '45%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 40px' }}>
          <div style={{ color: hoid.accent, fontSize: 9, letterSpacing: '.22em', textTransform: 'uppercase', marginBottom: 10, opacity: .8 }}>YOLEN · EL VIAJERO ETERNO</div>
          <h1 style={{ color: '#f5efe0', fontSize: 38, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 900, letterSpacing: '.08em', margin: '0 0 8px', textShadow: `0 0 40px ${hex2rgba(hoid.accent,.4)}` }}>HOID</h1>
          <div style={{ color: '#7788aa', fontSize: 13, fontStyle: 'italic', marginBottom: 20, lineHeight: 1.5 }}>Cephandrius Maxtori · Wit · Ala · Drifter · Malasei</div>
          <blockquote style={{ color: hoid.accent, fontSize: 12, fontStyle: 'italic', lineHeight: 1.7, borderLeft: `2px solid ${hex2rgba(hoid.accent,.5)}`, paddingLeft: 14, opacity: .9 }}>{hoid.quote}</blockquote>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 32px', background: 'rgba(3,3,8,.85)', backdropFilter: 'blur(10px)', borderTop: `1px solid ${hex2rgba(hoid.accent,.15)}` }}>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {[['Origen','Yolen (desconocido)'],['Mundos visitados',`${hoid.appearances.length}+ documentados`],['Sistemas de magia','6+ activos'],['Inmortalidad','Anterior a las Esquirlas']].map(([label,val])=>(
              <div key={label}>
                <div style={{ color: '#334455', fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase' }}>{label}</div>
                <div style={{ color: hoid.accent, fontSize: 12 }}>{val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 12, marginBottom: 32 }}>
        {hoidFacts.map((f, i) => (
          <div key={i} style={{ background: 'rgba(8,8,16,.9)', border: `1px solid ${hex2rgba(hoid.accent,.15)}`, borderRadius: 10, padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start', animation: `fadeUp .4s ease ${i*.07}s both` }}>
            <span style={{ color: hoid.accent, fontSize: 14, flexShrink: 0, marginTop: 1 }}>{f.icon}</span>
            <p style={{ color: '#8899bb', fontSize: 11.5, lineHeight: 1.65 }}>{f.fact}</p>
          </div>
        ))}
      </div>

      <div style={{ borderBottom: '1px solid rgba(255,255,255,.08)', marginBottom: 24, display: 'flex' }}>
        {(['mundos','magia','misterio'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', color: tab === t ? hoid.accent : '#445566', borderBottom: tab === t ? `2px solid ${hoid.accent}` : '2px solid transparent', transition: 'all .18s', marginBottom: -1 }}>
            {t === 'mundos' ? 'Sus Mundos' : t === 'magia' ? 'Magia' : 'Misterio'}
          </button>
        ))}
      </div>

      {tab === 'mundos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 14 }}>
          {hoid.appearances.map((ap, i) => {
            const wPal = Object.entries(WORLD_PALETTE).find(([,p]) => p.name === ap.world)
            const wColor = wPal ? wPal[1].color : '#888'
            return (
              <div key={ap.world} style={{ background: 'rgba(6,6,14,.9)', border: `1px solid ${hex2rgba(wColor,.22)}`, borderLeft: `3px solid ${wColor}`, borderRadius: 10, padding: '16px 18px', animation: `fadeUp .4s ease ${i*.08}s both` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: wColor, boxShadow: `0 0 10px ${wColor}`, flexShrink: 0 }} />
                  <span style={{ color: wColor, fontSize: 11, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 600 }}>{ap.world}</span>
                  <span style={{ marginLeft: 'auto', color: '#334455', fontSize: 9, letterSpacing: '.06em' }}>como {ap.alias}</span>
                </div>
                <p style={{ color: '#7788aa', fontSize: 11.5, lineHeight: 1.6 }}>{ap.role}</p>
              </div>
            )
          })}
        </div>
      )}
      {tab === 'magia' && (
        <div style={{ background: 'rgba(6,6,14,.9)', border: `1px solid ${hex2rgba(hoid.accent,.2)}`, borderRadius: 12, padding: '24px 28px' }}>
          <p style={{ color: '#8899bb', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>{hoid.magic}</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[['Alomancia','Scadrial · Quema metales para poderes'],['Despertar','Nalthis · Anima objetos con Aliento'],['Surgebinding','Roshar · Vínculo con spren + Stormlight'],['Cantamundos','Yolen · Arte verbal de poder desconocido'],['Aon Dor','Sel · Investidura geográfica de Elantris'],['Otros','Al menos 3 sistemas más no identificados']].map(([m,d])=>(
              <div key={m} style={{ padding: '10px 14px', background: hex2rgba(hoid.accent,.06), borderRadius: 8 }}>
                <div style={{ color: hoid.accent, fontSize: 10, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', marginBottom: 3 }}>{m}</div>
                <div style={{ color: '#7788aa', fontSize: 10.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {tab === 'misterio' && (
        <div>
          <p style={{ color: '#8899bb', fontSize: 13, lineHeight: 1.75, borderLeft: `2px solid ${hex2rgba(hoid.accent,.4)}`, paddingLeft: 20, marginBottom: 24 }}>{hoid.mystery}</p>
          <div style={{ background: 'rgba(6,6,14,.9)', border: `1px solid ${hex2rgba(hoid.accent,.2)}`, borderRadius: 12, padding: '20px 24px' }}>
            <div style={{ color: hoid.accent, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 12 }}>Teorías de los lectores</div>
            {['Hoid fue uno de los 16 candidatos originales a convertirse en portadores de las Esquirlas en la Fragmentación. Rechazó el poder.','Su inmortalidad proviene de un objeto pre-Fragmentación de Yolen, posiblemente relacionado con los Dawnshard.','Su objetivo final podría ser reunir suficiente Investidura para enfrentarse a Odium o prevenir una amenaza mayor.'].map((t,i)=>(
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i<2?12:0, paddingBottom: i<2?12:0, borderBottom: i<2?'1px solid rgba(255,255,255,.06)':'none' }}>
                <span style={{ color: hex2rgba(hoid.accent,.5), fontSize: 12, flexShrink: 0, marginTop: 1 }}>◈</span>
                <p style={{ color: '#8899bb', fontSize: 11.5, lineHeight: 1.65 }}>{t}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CharactersSection() {
  const [world, setWorld] = useState('roshar')
  const worlds = Object.keys(CHARACTERS)
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 28 }}>
        {worlds.map(w => {
          const p = WORLD_PALETTE[w] || { color: '#888', name: w }
          const active = world === w
          return (
            <button key={w} onClick={() => setWorld(w)} style={{ display: 'flex', alignItems: 'center', gap: 7, background: active ? hex2rgba(p.color,.12) : 'rgba(255,255,255,.03)', border: `1px solid ${active ? hex2rgba(p.color,.4) : 'rgba(255,255,255,.08)'}`, borderRadius: 8, padding: '7px 14px', cursor: 'pointer', color: active ? p.color : '#445566', fontSize: 11, letterSpacing: '.06em', transition: 'all .2s' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: p.color, opacity: active ? 1 : .4, boxShadow: active ? `0 0 8px ${p.color}` : 'none' }} />
              {p.name}
            </button>
          )
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
        {(CHARACTERS[world] || []).map((char, i) => <CharacterCard key={char.name} char={char} world={world} index={i} />)}
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────
const SECTIONS = [
  { id: 'hoid',       label: 'Hoid',        icon: '✦' },
  { id: 'libros',     label: 'Libros',       icon: '◈' },
  { id: 'personajes', label: 'Personajes',   icon: '◉' },
  { id: 'saltamundo', label: 'Saltamundo',   icon: '⟳' },
] as const
type SectionId = typeof SECTIONS[number]['id']

function Sidebar({ active, onSelect }: { active: SectionId; onSelect: (id: SectionId) => void }) {
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, bottom: 0, width: 56, background: 'rgba(1,3,6,.95)', backdropFilter: 'blur(20px)', borderRight: '1px solid rgba(255,255,255,.06)', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 80, gap: 8, zIndex: 100 }}>
      {SECTIONS.map(s => (
        <button key={s.id} onClick={() => onSelect(s.id)} title={s.label} style={{ width: 40, height: 40, borderRadius: 10, background: active === s.id ? hex2rgba('#c8b880',.12) : 'none', border: active === s.id ? '1px solid rgba(200,184,128,.3)' : '1px solid transparent', color: active === s.id ? '#c8b880' : '#445566', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>{s.icon}</button>
      ))}
      <div style={{ flex: 1 }} />
      <Link href="/" title="Volver al Atlas" style={{ width: 40, height: 40, borderRadius: 10, background: 'none', border: '1px solid rgba(255,255,255,.08)', color: '#334455', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, textDecoration: 'none', marginBottom: 20, transition: 'all .2s' }}>↗</Link>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────
const TITLES: Record<SectionId, string> = {
  hoid:       'Hoid — El Eterno Viajero',
  libros:     'Libros por Planeta',
  personajes: 'Personajes',
  saltamundo: 'Saltamundo',
}

export default function GaleriaPage() {
  const [section, setSection] = useState<SectionId>('hoid')

  return (
    <div style={{ minHeight: '100vh', background: '#010306', overflowY: 'auto', overflowX: 'hidden' }}>
      {/* disable the body::after vignette on this page */}
      <style>{`body::after { display: none !important; } html,body { overflow: visible !important; }`}</style>

      <Sidebar active={section} onSelect={setSection} />

      <div style={{ marginLeft: 56, minHeight: '100vh' }}>
        {/* Top bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 90, background: 'rgba(1,3,6,.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,.06)', padding: '0 40px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ color: '#334455', fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase' }}>Cosmere</span>
            <span style={{ color: '#223344' }}>›</span>
            <h1 style={{ color: '#c8b880', fontSize: 14, fontFamily: 'var(--font-cinzel,"Cinzel",serif)', fontWeight: 600, letterSpacing: '.06em' }}>{TITLES[section]}</h1>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <Link href="/guia" style={{ color: '#445566', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>Guía de Lectura</Link>
            <Link href="/"    style={{ color: '#445566', fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none' }}>↗ Atlas</Link>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '36px 40px 80px' }}>
          {section === 'hoid' && <HoidSection />}
          {section === 'libros' && (
            <div>{WORLDS.map(w => <WorldSection key={w.id} worldId={w.id} books={w.books} />)}</div>
          )}
          {section === 'personajes' && <CharactersSection />}
          {section === 'saltamundo' && (
            <div>
              <p style={{ color: '#445566', fontSize: 12, marginBottom: 28, maxWidth: 600, lineHeight: 1.7 }}>Los Saltamundo son personas que han descubierto cómo cruzar el Cosmere entre mundos, generalmente a través del Reino Cognitivo. Son raros, peligrosos, y casi todos guardan secretos que podrían reescribir la historia.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 20 }}>
                {WORLDHOPPERS.slice(1).map((wh, i) => <WorldhopperCard key={wh.name} wh={wh} index={i} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
