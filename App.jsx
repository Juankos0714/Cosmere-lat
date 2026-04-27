// App.jsx — Cosmere UI: Vista Sistema Inmersiva

const { useState, useEffect, useRef, useCallback } = React;

// ─── helpers ──────────────────────────────────────────────
const hex2rgba = (hex, a) => {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
};

// ─── Galaxy System Markers (HTML overlays over 3D canvas) ─
function GalaxyMarkers({ visible, onSelect }) {
  const [positions, setPositions] = useState([]);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    const handler = e => setPositions(e.detail);
    document.addEventListener('cosmere:markerPositions', handler);
    return () => document.removeEventListener('cosmere:markerPositions', handler);
  }, []);

  if (!visible) return null;

  return (
    <div style={{position:'fixed',inset:0,zIndex:55,pointerEvents:'none'}}>
      {positions.filter(p => !p.behind).map(p => {
        const sys = COSMERE_DATA.systems.find(s => s.id === p.id);
        if (!sys) return null;
        const isHov = hovered === p.id;
        return (
          <div key={p.id}
            onMouseEnter={() => setHovered(p.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onSelect(p.id)}
            style={{
              position:'absolute',
              left: p.x, top: p.y,
              transform:'translate(-50%,-50%)',
              pointerEvents:'all',
              cursor:'pointer',
              zIndex:56,
            }}>
            {/* Outer ring pulse */}
            <div style={{
              position:'absolute',
              width: isHov ? 52 : 36, height: isHov ? 52 : 36,
              borderRadius:'50%',
              border:`1px solid ${hex2rgba(sys.color, isHov ? .7 : .4)}`,
              top:'50%',left:'50%',
              transform:'translate(-50%,-50%)',
              transition:'all .25s ease',
              boxShadow:`0 0 ${isHov?24:12}px ${hex2rgba(sys.color, isHov?.55:.3)}`,
              animation: isHov ? 'none' : 'ringPulse 2.5s ease-in-out infinite',
            }}/>
            {/* Core dot */}
            <div style={{
              width: isHov ? 14 : 10, height: isHov ? 14 : 10,
              borderRadius:'50%',
              background: sys.color,
              boxShadow:`0 0 ${isHov?20:10}px ${sys.color}`,
              transition:'all .22s ease',
              position:'relative',zIndex:1,
            }}/>
            {/* Label */}
            <div style={{
              position:'absolute',
              left:'50%',top:'calc(100% + 14px)',
              transform:'translateX(-50%)',
              whiteSpace:'nowrap',
              pointerEvents:'none',
              opacity: isHov ? 1 : 0.7,
              transition:'opacity .2s',
            }}>
              <div style={{color: isHov ? sys.color : '#99aabb',fontSize: isHov?12:10,fontFamily:"'Cinzel',serif",fontWeight:600,letterSpacing:'.08em',textAlign:'center',textShadow:'0 0 12px rgba(0,0,0,.8)'}}>
                {sys.name.replace('Sistema ','').replace('Sistema','').trim()}
              </div>
              {isHov && (
                <div style={{color:'#445566',fontSize:9,fontFamily:"'DM Sans',sans-serif",textAlign:'center',marginTop:3,letterSpacing:'.06em',animation:'fadeIn .18s ease'}}>
                  {sys.planets.length} planetas · {sys.books.length} libros
                </div>
              )}
            </div>
            {/* Hover tooltip card */}
            {isHov && (
              <div style={{
                position:'absolute',
                left:'calc(100% + 18px)',top:'50%',
                transform:'translateY(-50%)',
                background:'rgba(6,10,22,.95)',
                border:`1px solid ${hex2rgba(sys.color,.35)}`,
                borderLeft:`3px solid ${sys.color}`,
                borderRadius:8, padding:'10px 14px',
                backdropFilter:'blur(18px)',
                boxShadow:`0 0 28px ${hex2rgba(sys.color,.25)}, 0 6px 24px rgba(0,0,0,.7)`,
                minWidth:180,
                animation:'fadeIn .18s ease',
                pointerEvents:'none',zIndex:70,
              }}>
                <div style={{color:sys.color,fontSize:9,letterSpacing:'.14em',textTransform:'uppercase',fontFamily:"'Cinzel',serif",marginBottom:4}}>{sys.starType}</div>
                <div style={{color:'#e8e0d0',fontSize:14,fontFamily:"'Cinzel',serif",fontWeight:600,marginBottom:5}}>{sys.name}</div>
                <div style={{color:'#556677',fontSize:10,fontFamily:"'DM Sans',sans-serif",fontStyle:'italic',lineHeight:1.4,marginBottom:6}}>"{sys.tagline}"</div>
                <div style={{color:'#446688',fontSize:9,letterSpacing:'.05em',fontFamily:"'DM Sans',sans-serif"}}>clic para explorar →</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Galaxy Header ────────────────────────────────────────
function GalaxyHeader({ visible }) {
  return (
    <div style={{
      position:'fixed',top:0,left:0,right:0,zIndex:50,
      padding:'28px 40px',
      display:'flex',alignItems:'flex-start',justifyContent:'space-between',
      pointerEvents:'none',
      opacity: visible ? 1 : 0,
      transition:'opacity .7s ease',
    }}>
      <div>
        <div style={{color:'#c8b880',fontSize:9,letterSpacing:'.25em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:4,opacity:.75}}>Brandon Sanderson</div>
        <h1 style={{margin:0,color:'#f0e8d8',fontSize:30,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:'.12em',textShadow:'0 0 40px rgba(200,180,120,.3)'}}>COSMERE</h1>
        <div style={{color:'#445566',fontSize:10,letterSpacing:'.15em',marginTop:5,fontFamily:"'DM Sans',sans-serif"}}>ATLAS ESTELAR INTERACTIVO</div>
      </div>
      <div style={{textAlign:'right',marginTop:6}}>
        <div style={{color:'#334455',fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:'.06em'}}>
          {COSMERE_DATA.systems.length} sistemas · {COSMERE_DATA.systems.reduce((a,s)=>a+s.books.length,0)} libros
        </div>
      </div>
    </div>
  );
}

// ─── Galaxy Hint ──────────────────────────────────────────
function GalaxyHint({ visible }) {
  return (
    <div style={{
      position:'fixed',bottom:36,left:'50%',transform:'translateX(-50%)',
      zIndex:50,pointerEvents:'none',
      opacity: visible ? .55 : 0,
      transition:'opacity .7s ease',
      textAlign:'center',
    }}>
      <div style={{color:'#556677',fontSize:11,letterSpacing:'.1em',fontFamily:"'DM Sans',sans-serif"}}>Pasa el cursor sobre un sistema · Clic para explorar</div>
    </div>
  );
}

// ─── Back Button ──────────────────────────────────────────
function BackButton({ visible, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        position:'fixed',top:24,left:24,zIndex:300,
        display:'flex',alignItems:'center',gap:9,
        background: hov ? 'rgba(18,26,50,.98)' : 'rgba(8,12,28,.88)',
        border:'1px solid rgba(100,140,200,.22)',
        borderRadius:10,padding:'9px 18px',
        cursor:'pointer',
        color: hov ? '#c8d8f0' : '#7788aa',
        fontSize:11,letterSpacing:'.1em',textTransform:'uppercase',
        fontFamily:"'DM Sans',sans-serif",
        backdropFilter:'blur(18px)',
        boxShadow: hov ? '0 4px 24px rgba(0,0,0,.55),0 0 12px rgba(80,130,255,.12)' : '0 2px 12px rgba(0,0,0,.4)',
        transition:'all .22s ease',
        transform: visible ? 'translateX(0)' : 'translateX(-130%)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'all' : 'none',
      }}>
      <span style={{fontSize:15}}>←</span>
      <span>Galaxia</span>
    </button>
  );
}

// ─── Connection Badge ──────────────────────────────────────
function ConnBadge({ conn, accentColor }) {
  const [hov, setHov] = useState(false);
  const target = COSMERE_DATA.systems.find(s => s.id === conn.target);
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      style={{
        background: hov ? hex2rgba(accentColor,.12) : hex2rgba(accentColor,.06),
        border:`1px solid ${hex2rgba(accentColor, hov ? .45 : .22)}`,
        borderRadius:8, padding:'10px 14px',
        cursor:'default',
        transition:'all .2s ease',
        position:'relative',
      }}>
      {/* Color dot for target system */}
      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
        <div style={{width:7,height:7,borderRadius:'50%',background:target?.color||accentColor,boxShadow:`0 0 6px ${target?.color||accentColor}`,flexShrink:0}}/>
        <span style={{color:accentColor,fontSize:10,fontFamily:"'DM Sans',sans-serif",letterSpacing:'.08em',textTransform:'uppercase',fontWeight:500}}>{conn.label}</span>
        {target && <span style={{marginLeft:'auto',color:'#334455',fontSize:9,letterSpacing:'.05em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>{target.name.split(' ')[1]||target.name}</span>}
      </div>
      {hov && (
        <div style={{color:'#8899bb',fontSize:11,lineHeight:1.55,fontFamily:"'DM Sans',sans-serif",animation:'fadeIn .18s ease'}}>
          {conn.desc}
        </div>
      )}
    </div>
  );
}

// ─── Book Card ────────────────────────────────────────────
function BookCard({ book, accentColor, index }) {
  const [expanded, setExpanded] = useState(false);
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHov(true)}
      onMouseLeave={()=>setHov(false)}
      onClick={()=>setExpanded(e=>!e)}
      style={{
        background: expanded
          ? `linear-gradient(145deg, ${hex2rgba(book.color||'#1a1a2e',.95)}, ${hex2rgba(book.color||'#0d0d1a',1)})`
          : `linear-gradient(145deg, ${hex2rgba(book.color||'#1a1a2e',.7)}, ${hex2rgba(book.color||'#0d0d1a',.85)})`,
        border:`1px solid ${hex2rgba(accentColor, expanded ? .45 : hov ? .3 : .18)}`,
        borderRadius:10,
        padding: expanded ? '16px 18px' : '12px 18px',
        cursor:'pointer',
        transition:'all .3s cubic-bezier(.22,1,.36,1)',
        boxShadow: expanded
          ? `0 8px 32px rgba(0,0,0,.6), 0 0 20px ${hex2rgba(accentColor,.2)}`
          : hov ? `0 4px 20px rgba(0,0,0,.5),0 0 10px ${hex2rgba(accentColor,.12)}` : '0 2px 10px rgba(0,0,0,.35)',
        position:'relative',overflow:'hidden',
        animation:`slideUp .38s ease ${index*.055}s both`,
        marginBottom:2,
      }}>
      {/* Spine */}
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:3,background:accentColor,opacity: expanded ? 1 : .6,boxShadow:`0 0 8px ${accentColor}`,borderRadius:'10px 0 0 10px'}}/>

      <div style={{paddingLeft:10}}>
        {/* Year + POVs */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
          <span style={{color:hex2rgba(accentColor,.7),fontSize:10,letterSpacing:'.1em',fontFamily:"'DM Sans',sans-serif"}}>{book.year}</span>
          {book.pov && (
            <div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'flex-end'}}>
              {book.pov.slice(0,3).map(p=>(
                <span key={p} style={{background:hex2rgba(accentColor,.1),border:`1px solid ${hex2rgba(accentColor,.25)}`,color:hex2rgba(accentColor,.8),fontSize:8,padding:'1px 6px',borderRadius:10,letterSpacing:'.04em',fontFamily:"'DM Sans',sans-serif"}}>{p}</span>
              ))}
            </div>
          )}
        </div>

        {/* Title */}
        <div style={{color:'#e0d8c8',fontSize:13,fontFamily:"'Cinzel',serif",fontWeight:600,lineHeight:1.35,marginBottom:3}}>{book.title}</div>
        <div style={{color:'#556677',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginBottom: expanded?10:0}}>{book.subtitle}</div>

        {/* Expandable summary */}
        {expanded && book.summary && (
          <div style={{
            color:'#9ab0c8',fontSize:12,lineHeight:1.7,
            fontFamily:"'DM Sans',sans-serif",
            borderTop:`1px solid ${hex2rgba(accentColor,.18)}`,
            paddingTop:10, marginTop:4,
            animation:'fadeIn .25s ease',
          }}>
            {book.summary}
          </div>
        )}

        {/* Expand hint */}
        {!expanded && (
          <div style={{color:'#334455',fontSize:9,letterSpacing:'.06em',fontFamily:"'DM Sans',sans-serif",marginTop:2,display:'flex',alignItems:'center',gap:4}}>
            <span style={{color:hex2rgba(accentColor,.4),fontSize:11}}>+</span>
            <span>ver resumen</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── System Side Panel ─────────────────────────────────────
function SystemPanel({ systemId, onClose }) {
  const sys = systemId ? COSMERE_DATA.systems.find(s=>s.id===systemId) : null;
  const [visible, setVisible] = useState(false);
  const [tab, setTab] = useState('libros');
  const scrollRef = useRef(null);

  useEffect(()=>{
    if (systemId) { setTimeout(()=>setVisible(true),120); setTab('libros'); if(scrollRef.current) scrollRef.current.scrollTop=0; }
    else setVisible(false);
  },[systemId]);

  if (!sys) return null;

  const tabs = [
    { id:'libros', label:'Libros' },
    { id:'planetas', label:'Planetas' },
    { id:'conexiones', label:'Conexiones' },
  ];

  return (
    <div style={{
      position:'fixed',top:0,right:0,bottom:0,
      width: visible ? 420 : 0,
      zIndex:200,
      transition:'width .55s cubic-bezier(.22,1,.36,1)',
      overflow:'hidden',
      pointerEvents: visible ? 'all' : 'none',
    }}>
      <div style={{
        width:420,height:'100%',
        background:'rgba(5,9,20,.95)',
        backdropFilter:'blur(28px)',
        borderLeft:`1px solid ${hex2rgba(sys.color,.2)}`,
        boxShadow:`-12px 0 60px rgba(0,0,0,.7), -4px 0 20px ${hex2rgba(sys.color,.08)}`,
        display:'flex',flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header gradient band */}
        <div style={{
          padding:'28px 28px 0',
          background:`linear-gradient(180deg, ${hex2rgba(sys.color,.08)} 0%, transparent 100%)`,
          flexShrink:0,
        }}>
          {/* Close */}
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:14}}>
            <div>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:sys.color,boxShadow:`0 0 14px ${sys.color}`,flexShrink:0}}/>
                <span style={{color:sys.color,fontSize:9,letterSpacing:'.16em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif"}}>{sys.starType}</span>
              </div>
              <h2 style={{margin:0,color:'#f0e8d8',fontSize:20,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:'.04em'}}>{sys.name}</h2>
              <div style={{color:'#556688',fontSize:11,marginTop:4,fontFamily:"'DM Sans',sans-serif",fontStyle:'italic',lineHeight:1.4}}>"{sys.tagline}"</div>
            </div>
            <button onClick={onClose} style={{
              background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',
              color:'#7788aa',width:34,height:34,borderRadius:8,cursor:'pointer',
              fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginTop:2,
            }}>✕</button>
          </div>

          {/* System description */}
          <p style={{color:'#7a90a8',fontSize:11.5,lineHeight:1.65,margin:'0 0 14px',fontFamily:"'DM Sans',sans-serif"}}>
            {sys.description}
          </p>

          {/* Shard + Magic pills */}
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:18}}>
            <MetaPill label="Esquirla" value={sys.shard} color={sys.color} />
            <MetaPill label="Magia" value={sys.magic} color={sys.color} />
          </div>

          {/* Tabs */}
          <div style={{display:'flex',borderBottom:`1px solid ${hex2rgba(sys.color,.15)}`}}>
            {tabs.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                background:'none',border:'none',cursor:'pointer',
                padding:'7px 16px 8px',fontSize:11,letterSpacing:'.08em',textTransform:'uppercase',
                fontFamily:"'DM Sans',sans-serif",
                color: tab===t.id ? sys.color : '#445566',
                borderBottom: tab===t.id ? `2px solid ${sys.color}` : '2px solid transparent',
                transition:'all .18s',marginBottom:-1,
              }}>{t.label}</button>
            ))}
          </div>
        </div>

        {/* Scrollable content */}
        <div ref={scrollRef} style={{
          flex:1,overflowY:'auto',padding:'18px 28px 32px',
          scrollbarWidth:'thin',scrollbarColor:`${hex2rgba(sys.color,.3)} transparent`,
        }}>

          {/* ── LIBROS ── */}
          {tab==='libros' && (
            <div style={{display:'flex',flexDirection:'column',gap:8,animation:'fadeIn .3s ease'}}>
              <div style={{color:'#334455',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:4}}>
                {sys.books.length} {sys.books.length===1?'libro':'libros'} · clic para ver resumen
              </div>
              {sys.books.map((book,i)=>(
                <BookCard key={book.title} book={book} accentColor={sys.color} index={i} />
              ))}
              {sys.novellas.length > 0 && (
                <div style={{marginTop:8}}>
                  <div style={{color:'#334455',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:8}}>Novellas</div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {sys.novellas.map(n=>(
                      <span key={n} style={{background:hex2rgba(sys.color,.08),border:`1px solid ${hex2rgba(sys.color,.25)}`,color:sys.color,fontSize:10,padding:'4px 12px',borderRadius:20,fontFamily:"'DM Sans',sans-serif"}}>
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PLANETAS ── */}
          {tab==='planetas' && (
            <div style={{display:'flex',flexDirection:'column',gap:10,animation:'fadeIn .3s ease'}}>
              {sys.planets.map((p,i)=>(
                <div key={p.id} style={{
                  background:'rgba(255,255,255,.025)',
                  border:`1px solid ${hex2rgba(sys.color,.2)}`,
                  borderRadius:10,padding:'14px 16px',
                  animation:`slideUp .38s ease ${i*.1}s both`,
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <div style={{width:14,height:14,borderRadius:'50%',background:p.color,boxShadow:`0 0 10px ${p.color}99`,flexShrink:0}}/>
                    <span style={{color:'#e0d8c8',fontSize:14,fontFamily:"'Cinzel',serif",fontWeight:600}}>{p.name}</span>
                    {p.isTidallyLocked && <span style={{fontSize:8,color:sys.color,letterSpacing:'.1em',textTransform:'uppercase',background:hex2rgba(sys.color,.1),padding:'2px 6px',borderRadius:4}}>bloqueado</span>}
                  </div>
                  <p style={{color:'#7a90a8',fontSize:12,lineHeight:1.6,margin:'0 0 10px',fontFamily:"'DM Sans',sans-serif"}}>{p.desc}</p>
                  <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                    {p.hasAtmosphere && <MiniTag label="Atmósfera" c={sys.color}/>}
                    {p.hasMoon && <MiniTag label={`Luna: ${p.moonName}`} c={sys.color}/>}
                    {p.specialEffect==='highstorm' && <MiniTag label="Altas Tormentas" c={sys.color}/>}
                    {p.specialEffect==='mist' && <MiniTag label="Brumas" c={sys.color}/>}
                    {p.isTidallyLocked && <MiniTag label="Dayside / Darkside" c={sys.color}/>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── CONEXIONES ── */}
          {tab==='conexiones' && (
            <div style={{animation:'fadeIn .3s ease'}}>
              <div style={{color:'#334455',fontSize:9,letterSpacing:'.12em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:12}}>
                Hilos de Investidura con otros mundos
              </div>

              {/* Visual connection map */}
              <ConnectionMap sys={sys} />

              <div style={{display:'flex',flexDirection:'column',gap:8,marginTop:16}}>
                {(sys.connections||[]).map((conn,i)=>(
                  <ConnBadge key={i} conn={conn} accentColor={sys.color} />
                ))}
                {(!sys.connections||sys.connections.length===0) && (
                  <div style={{color:'#334455',fontSize:12,fontFamily:"'DM Sans',sans-serif",fontStyle:'italic',padding:'20px 0'}}>
                    Conexiones no documentadas aún.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaPill({ label, value, color }) {
  return (
    <div style={{background:hex2rgba(color,.08),border:`1px solid ${hex2rgba(color,.22)}`,borderRadius:6,padding:'5px 10px',flexShrink:0,maxWidth:'100%'}}>
      <div style={{color:hex2rgba(color,.6),fontSize:8,letterSpacing:'.1em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:2}}>{label}</div>
      <div style={{color:'#a0b4c8',fontSize:11,fontFamily:"'DM Sans',sans-serif",lineHeight:1.3}}>{value}</div>
    </div>
  );
}

function MiniTag({ label, c }) {
  return (
    <span style={{fontSize:9,letterSpacing:'.07em',textTransform:'uppercase',background:hex2rgba(c,.1),border:`1px solid ${hex2rgba(c,.28)}`,color:c,padding:'2px 8px',borderRadius:20,fontFamily:"'DM Sans',sans-serif"}}>{label}</span>
  );
}

// ─── Connection Map SVG ────────────────────────────────────
function ConnectionMap({ sys }) {
  const SYSTEMS = COSMERE_DATA.systems;
  const W = 360, H = 140, cx = W/2, cy = H/2, r = 50;
  const positions = {};
  SYSTEMS.forEach((s,i) => {
    const angle = (i / SYSTEMS.length) * Math.PI * 2 - Math.PI/2;
    positions[s.id] = { x: cx + Math.cos(angle)*r, y: cy + Math.sin(angle)*r, s };
  });
  const myPos = positions[sys.id];
  const connIds = new Set((sys.connections||[]).map(c=>c.target));

  return (
    <svg width={W} height={H} style={{display:'block',margin:'0 auto',overflow:'visible'}}>
      {/* Connection lines */}
      {(sys.connections||[]).map((conn,i) => {
        const tp = positions[conn.target];
        if (!tp) return null;
        return (
          <line key={i}
            x1={myPos.x} y1={myPos.y} x2={tp.x} y2={tp.y}
            stroke={sys.color} strokeWidth={1} strokeOpacity={.35}
            strokeDasharray="3 4"
          />
        );
      })}
      {/* All system dots */}
      {SYSTEMS.map(s => {
        const p = positions[s.id];
        const isMe = s.id === sys.id;
        const isConn = connIds.has(s.id);
        return (
          <g key={s.id}>
            <circle cx={p.x} cy={p.y} r={isMe?8:isConn?5:3.5}
              fill={s.color} opacity={isMe?1:isConn?.85:.3}
              style={{filter: isMe||isConn ? `drop-shadow(0 0 4px ${s.color})` : 'none'}}
            />
            <text x={p.x} y={p.y+(isMe?16:12)} textAnchor="middle"
              fill={isMe||isConn ? s.color : '#334455'}
              fontSize={isMe?9:8} fontFamily="'DM Sans',sans-serif"
              letterSpacing=".04em">
              {s.name.split(' ')[1] || s.name.split(' ')[0]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Loading Screen ────────────────────────────────────────
function LoadingScreen({ gone }) {
  return (
    <div style={{
      position:'fixed',inset:0,zIndex:9999,
      background:'#010306',
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      opacity: gone ? 0 : 1,
      transition:'opacity 1.2s ease',
      pointerEvents: gone ? 'none' : 'all',
    }}>
      <div style={{color:'#c8b880',fontSize:9,letterSpacing:'.28em',textTransform:'uppercase',fontFamily:"'DM Sans',sans-serif",marginBottom:18,opacity:.8}}>Brandon Sanderson</div>
      <h1 style={{color:'#f0e8d8',fontSize:44,fontFamily:"'Cinzel',serif",fontWeight:700,letterSpacing:'.2em',margin:'0 0 6px'}}>COSMERE</h1>
      <div style={{color:'#2a3545',fontSize:11,letterSpacing:'.2em',fontFamily:"'DM Sans',sans-serif",marginBottom:44}}>ATLAS ESTELAR</div>
      <div style={{width:180,height:1,background:'rgba(255,255,255,.05)',borderRadius:1,overflow:'hidden'}}>
        <div style={{height:'100%',background:`linear-gradient(90deg, #c8b880, #4d8fd4)`,borderRadius:1,animation:'load 1.6s ease forwards'}}/>
      </div>
      <div style={{color:'#223344',fontSize:10,fontFamily:"'DM Sans',sans-serif",marginTop:14,letterSpacing:'.08em'}}>Inicializando el universo…</div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────
function App() {
  const [loadGone, setLoadGone] = useState(false);
  const [appState, setAppState] = useState('galaxy');
  const [activeSystem, setActiveSystem] = useState(null);

  useEffect(()=>{
    const onReady = () => setTimeout(()=>setLoadGone(true), 500);
    const onState = e => {
      const { state, systemId } = e.detail;
      setAppState(state);
      if (state==='system') setActiveSystem(systemId);
      if (state==='galaxy') setActiveSystem(null);
    };

    if (window.CosmereScene) onReady();
    else document.addEventListener('cosmere:ready', onReady);
    document.addEventListener('cosmere:stateChange', onState);
    return () => {
      document.removeEventListener('cosmere:ready', onReady);
      document.removeEventListener('cosmere:stateChange', onState);
    };
  },[]);

  const handleBack   = useCallback(()=>{ if(window.CosmereScene) window.CosmereScene.flyBack(); },[]);
  const handleClose  = useCallback(()=>{ if(window.CosmereScene) window.CosmereScene.flyBack(); },[]);
  const handleSelect = useCallback(id  =>{ if(window.CosmereScene) window.CosmereScene.flyToSystem(id); },[]);

  return (
    <>
      <LoadingScreen gone={loadGone} />
      <GalaxyHeader visible={loadGone && appState==='galaxy'} />
      <GalaxyHint   visible={loadGone && appState==='galaxy'} />
      <GalaxyMarkers visible={loadGone && appState==='galaxy'} onSelect={handleSelect} />
      <BackButton visible={appState==='system'} onClick={handleBack} />
      <SystemPanel systemId={activeSystem} onClose={handleClose} />
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('ui-root'));
root.render(<App />);
