import React, { useState, useEffect, useCallback } from "react";

// ─── FESTIVOS OFICIALES MÉXICO 2025-2026 ──────────────────────────────────────
const FESTIVOS = new Set([
  "2025-09-16","2025-11-17","2025-12-25",
  "2026-01-01","2026-02-02","2026-03-16",
  "2026-05-01","2026-09-16","2026-11-02","2026-11-16","2026-12-25",
]);

const ADMIN_PASS = "Admin2026";
const WA_NUMBER  = "524643599289";

const DIAS_ES  = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const MESES_ES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio",
                  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

function fmtDate(d) {
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}
function isoDate(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function parseISO(s) {
  const [y,m,dd] = s.split("-").map(Number);
  return new Date(y, m-1, dd);
}

function useStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init; }
    catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }, [key, val]);
  return [val, setVal];
}

// ─── ICON SVGs ────────────────────────────────────────────────────────────────
const Icons = {
  calendar: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  check:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  x:        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  lock:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  wa:       <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>,
  users:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  ban:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>,
  userPlus: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>,
  logout:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  factory:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20V8l6-4v4l6-4v4l6-4v16H2z"/><line x1="2" y1="20" x2="22" y2="20"/><rect x="10" y="14" width="4" height="6"/></svg>,
  trash:    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
};

// ─── CALENDAR COMPONENT ───────────────────────────────────────────────────────
function Calendar({ solicitudes, bloqueos, onSelect, selectedDate, adminMode = false, onAdminBlock }) {
  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + 30);

  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear,  setViewYear]  = useState(today.getFullYear());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1); }
    else setViewMonth(m => m-1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1); }
    else setViewMonth(m => m+1);
  };

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();

  function getDayStatus(iso) {
    const confirmed = solicitudes.filter(s => s.fecha === iso && s.estado === "confirmada").length;
    if (bloqueos[iso]) return { type: "blocked", label: "Bloqueado", count: confirmed };
    if (FESTIVOS.has(iso)) return { type: "festivo", label: "Festivo", count: 0 };
    if (confirmed === 0) return { type: "free", label: "Disponible", count: 0 };
    if (confirmed === 1) return { type: "one", label: "Disponible", count: 1 };
    return { type: "full", label: "Día Completo", count: confirmed };
  }

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ width:"100%" }}>
      {/* Header nav */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <button onClick={prevMonth} style={styles.navBtn}>‹</button>
        <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:20, fontWeight:600, letterSpacing:2, color:"#e2e8f0", textTransform:"uppercase" }}>
          {MESES_ES[viewMonth]} {viewYear}
        </span>
        <button onClick={nextMonth} style={styles.navBtn}>›</button>
      </div>

      {/* Day labels */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:3 }}>
        {DIAS_ES.map(d => (
          <div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, letterSpacing:1, color:"#64748b", padding:"4px 0", fontFamily:"'Barlow Condensed',sans-serif" }}>{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`}/>;
          const date = new Date(viewYear, viewMonth, day);
          const iso  = isoDate(date);
          const dow  = date.getDay();
          const isWeekend = dow === 0 || dow === 6;
          const isPast = date < today;
          const isFuture = date > maxDate;
          const { type, label, count } = getDayStatus(iso);
          const isSelected = selectedDate === iso;
          const isToday = isoDate(today) === iso;

          const disabled = isWeekend || isPast || isFuture || type === "full" || type === "blocked" || type === "festivo";

          let bg = "#1e293b", border = "1px solid #334155", textColor = "#94a3b8";
          if (isWeekend || isPast || isFuture) { bg = "#0f172a"; textColor = "#334155"; }
          else if (type === "blocked")  { bg = "#1c0a1a"; border = "1px solid #7c2d6a"; textColor = "#a855f7"; }
          else if (type === "festivo")  { bg = "#1a1200"; border = "1px solid #854d0e"; textColor = "#fbbf24"; }
          else if (type === "full")     { bg = "#1a0a0a"; border = "1px solid #991b1b"; textColor = "#ef4444"; }
          else if (type === "one")      { bg = "#0a1628"; border = "1px solid #1d4ed8"; textColor = "#60a5fa"; }
          else if (type === "free")     { bg = "#0a1a0f"; border = "1px solid #166534"; textColor = "#4ade80"; }

          if (isSelected) { border = "2px solid #f59e0b"; bg = "#1c1500"; }
          if (isToday && !isSelected) { border = "1px solid #f59e0b"; }

          return (
            <div
              key={iso}
              onClick={() => !disabled && (adminMode ? onAdminBlock?.(iso) : onSelect?.(iso))}
              style={{
                background: bg, border, borderRadius: 8,
                padding: "8px 4px 6px",
                cursor: disabled ? "default" : "pointer",
                opacity: (isPast || isFuture || isWeekend) ? 0.4 : 1,
                transition: "transform 0.1s, box-shadow 0.1s",
                position: "relative",
                minHeight: 62,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span style={{ fontSize:16, fontWeight:700, color: isToday ? "#f59e0b" : textColor, fontFamily:"'Barlow Condensed',sans-serif" }}>{day}</span>
              {!isWeekend && !isPast && !isFuture && (
                <span style={{ fontSize:9, fontWeight:600, color: textColor, textAlign:"center", lineHeight:1.2, marginTop:2, letterSpacing:0.5 }}>{label}</span>
              )}
              {count > 0 && (
                <span style={{ position:"absolute", top:4, right:5, background:"#1d4ed8", color:"#fff", borderRadius:99, fontSize:9, padding:"1px 5px", fontWeight:700 }}>{count}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginTop:16, justifyContent:"center" }}>
        {[
          { color:"#4ade80", label:"Disponible (libre)" },
          { color:"#60a5fa", label:"Disponible (1 persona)" },
          { color:"#ef4444", label:"Día Completo" },
          { color:"#a855f7", label:"Bloqueado" },
          { color:"#fbbf24", label:"Festivo" },
        ].map(l => (
          <div key={l.label} style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:10, height:10, borderRadius:3, background:l.color }}/>
            <span style={{ fontSize:10, color:"#64748b", fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.5 }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { if (msg) { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); } }, [msg]);
  if (!msg) return null;
  const colors = { success:"#166534,#dcfce7", error:"#991b1b,#fee2e2", info:"#1e40af,#dbeafe" };
  const [bg, text] = (colors[type]||colors.info).split(",");
  return (
    <div style={{ position:"fixed", top:20, right:20, zIndex:999, background:bg, color:text, borderRadius:12, padding:"14px 20px", fontWeight:600, fontSize:14, boxShadow:"0 8px 32px rgba(0,0,0,0.4)", maxWidth:320, display:"flex", alignItems:"center", gap:10, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:0.5 }}>
      {type==="success" ? Icons.check : Icons.x}
      {msg}
    </div>
  );
}

// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────
function AdminPanel({ solicitudes, setSolicitudes, bloqueos, setBloqueos, onLogout }) {
  const today = isoDate(new Date());
  const [blockDate, setBlockDate]   = useState("");
  const [blockNote, setBlockNote]   = useState("");
  const [toast, setToast]           = useState({ msg:"", type:"info" });

  const pendientes  = solicitudes.filter(s => s.estado === "pendiente");
  const hoy         = solicitudes.filter(s => s.fecha === today && s.estado === "confirmada");

  function confirm(id) {
    setSolicitudes(prev => prev.map(s => s.id===id ? {...s, estado:"confirmada"} : s));
    setToast({ msg:"Solicitud confirmada ✓", type:"success" });
  }
  function reject(id) {
    setSolicitudes(prev => prev.map(s => s.id===id ? {...s, estado:"rechazada"} : s));
    setToast({ msg:"Solicitud rechazada", type:"error" });
  }
  function deleteSol(id) {
    setSolicitudes(prev => prev.filter(s => s.id!==id));
  }
  function addBlock() {
    if (!blockDate) return;
    setBloqueos(prev => ({ ...prev, [blockDate]: blockNote || "Bloqueado por administrador" }));
    setToast({ msg:`Día ${fmtDate(parseISO(blockDate))} bloqueado`, type:"info" });
    setBlockDate(""); setBlockNote("");
  }
  function removeBlock(d) {
    setBloqueos(prev => { const n={...prev}; delete n[d]; return n; });
  }

  // ── Registro manual ──
  const [manNombre,   setManNombre]   = useState("");
  const [manEmpleado, setManEmpleado] = useState("");
  const [manFecha,    setManFecha]    = useState("");
  const [manErr,      setManErr]      = useState("");

  const today2 = new Date(); today2.setHours(0,0,0,0);
  const maxD = new Date(today2); maxD.setDate(today2.getDate()+60);

  function registrarManual() {
    setManErr("");
    if (!manNombre.trim() || !manEmpleado.trim() || !manFecha) {
      setManErr("Completa todos los campos."); return;
    }
    const dow = parseISO(manFecha).getDay();
    if (dow === 0 || dow === 6) { setManErr("No se puede registrar en fin de semana."); return; }
    if (FESTIVOS.has(manFecha)) { setManErr("Ese día es festivo."); return; }
    const confirmados = solicitudes.filter(s => s.fecha === manFecha && s.estado === "confirmada").length;
    if (confirmados >= 2) { setManErr("Ese día ya tiene 2 personas confirmadas."); return; }
    const dup = solicitudes.find(s =>
      s.nombre.toLowerCase() === manNombre.trim().toLowerCase() &&
      s.fecha === manFecha && (s.estado === "pendiente" || s.estado === "confirmada")
    );
    if (dup) { setManErr("Este operador ya tiene una solicitud para ese día."); return; }
    const id = `manual-${Date.now()}`;
    setSolicitudes(prev => [...prev, {
      id, nombre: manNombre.trim(), empleado: manEmpleado.trim(),
      fecha: manFecha, estado: "confirmada",
      ts: new Date().toISOString(), origen: "admin"
    }]);
    setToast({ msg:`Vacaciones registradas para ${manNombre.trim()} ✓`, type:"success" });
    setManNombre(""); setManEmpleado(""); setManFecha(""); setManErr("");
  }

  return (
    <div style={{ padding:"0 0 40px" }}>
      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:"" })}/>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:22, fontWeight:700, color:"#f1f5f9", letterSpacing:2, textTransform:"uppercase" }}>Panel de Administración</h2>
        <button onClick={onLogout} style={{ ...styles.btnSmall, background:"#1e293b", color:"#94a3b8", display:"flex", alignItems:"center", gap:6 }}>{Icons.logout} Salir</button>
      </div>

      {/* Hoy */}
      <div style={{ background:"#0f172a", border:"1px solid #1d4ed8", borderRadius:14, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          {Icons.users}
          <span style={styles.sectionTitle}>Ausentes Hoy — {fmtDate(new Date())}</span>
        </div>
        {hoy.length === 0
          ? <p style={{ color:"#64748b", fontSize:14 }}>No hay vacaciones confirmadas para hoy.</p>
          : hoy.map(s => (
            <div key={s.id} style={{ background:"#1e293b", borderRadius:8, padding:"10px 14px", marginBottom:6, display:"flex", alignItems:"center", gap:12 }}>
              <span style={{ color:"#f59e0b", fontSize:22 }}>👤</span>
              <div>
                <p style={{ color:"#f1f5f9", fontWeight:700, fontSize:15, fontFamily:"'Barlow Condensed',sans-serif" }}>{s.nombre}</p>
                <p style={{ color:"#64748b", fontSize:12 }}>Emp. #{s.empleado}</p>
              </div>
            </div>
          ))
        }
      </div>

      {/* Solicitudes pendientes */}
      <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:14, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          {Icons.calendar}
          <span style={styles.sectionTitle}>Solicitudes Pendientes ({pendientes.length})</span>
        </div>
        {pendientes.length === 0
          ? <p style={{ color:"#64748b", fontSize:14 }}>Sin solicitudes pendientes.</p>
          : pendientes.map(s => (
            <div key={s.id} style={{ background:"#1e293b", borderRadius:10, padding:"12px 14px", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
              <div>
                <p style={{ color:"#f1f5f9", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", fontSize:16 }}>{s.nombre}</p>
                <p style={{ color:"#94a3b8", fontSize:12 }}>Emp. #{s.empleado} · {fmtDate(parseISO(s.fecha))}</p>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={() => confirm(s.id)} style={{ ...styles.btnSmall, background:"#166534", color:"#dcfce7", display:"flex", alignItems:"center", gap:5 }}>{Icons.check} Confirmar</button>
                <button onClick={() => reject(s.id)} style={{ ...styles.btnSmall, background:"#991b1b", color:"#fee2e2", display:"flex", alignItems:"center", gap:5 }}>{Icons.x} Rechazar</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Historial */}
      <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:14, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <span style={styles.sectionTitle}>Historial de Solicitudes</span>
        </div>
        <div style={{ maxHeight:240, overflowY:"auto" }}>
          {solicitudes.filter(s => s.estado !== "pendiente").length === 0
            ? <p style={{ color:"#64748b", fontSize:14 }}>Sin historial.</p>
            : solicitudes.filter(s => s.estado !== "pendiente").reverse().map(s => (
              <div key={s.id} style={{ background:"#1e293b", borderRadius:8, padding:"10px 14px", marginBottom:6, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8 }}>
                <div>
                  <span style={{ color: s.estado==="confirmada" ? "#4ade80" : "#ef4444", fontSize:11, fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1 }}>{s.estado.toUpperCase()}</span>
                  {s.origen === "admin" && (
                    <span style={{ fontSize:10, background:"#166534", color:"#4ade80", borderRadius:20, padding:"1px 7px", fontWeight:700, letterSpacing:0.5, marginLeft:4 }}>MANUAL</span>
                  )}
                  <p style={{ color:"#f1f5f9", fontSize:14, fontWeight:600 }}>{s.nombre}</p>
                  <p style={{ color:"#64748b", fontSize:11 }}>Emp. #{s.empleado} · {fmtDate(parseISO(s.fecha))}</p>
                </div>
                <button onClick={() => deleteSol(s.id)} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:6, padding:"5px 8px", cursor:"pointer", color:"#64748b" }}>{Icons.trash}</button>
              </div>
            ))
          }
        </div>
      </div>

      {/* ── Registro Manual ── */}
      <div style={{ background:"#0f172a", border:"1px solid #166534", borderRadius:14, padding:20, marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
          <span style={{ color:"#4ade80" }}>{Icons.userPlus}</span>
          <span style={styles.sectionTitle}>Registrar Vacaciones Manualmente</span>
        </div>
        <p style={{ color:"#475569", fontSize:12, marginBottom:16, lineHeight:1.5 }}>
          Para operadores que no pueden usar la plataforma. La solicitud queda confirmada de inmediato.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
          <div>
            <label style={styles.label}>Nombre Completo</label>
            <input value={manNombre} onChange={e=>setManNombre(e.target.value)}
              placeholder="Ej: María López"
              style={{ ...styles.input, width:"100%" }}/>
          </div>
          <div>
            <label style={styles.label}>Núm. de Empleado</label>
            <input value={manEmpleado} onChange={e=>setManEmpleado(e.target.value)}
              placeholder="Ej: 00456"
              style={{ ...styles.input, width:"100%" }}/>
          </div>
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={styles.label}>Fecha de Vacaciones</label>
          <input type="date" value={manFecha} onChange={e=>setManFecha(e.target.value)}
            min={isoDate(today2)} max={isoDate(maxD)}
            style={{ ...styles.input, width:"100%" }}/>
        </div>

        {manErr && (
          <div style={{ background:"#1a0a0a", border:"1px solid #991b1b", borderRadius:8, padding:"9px 14px", marginBottom:10, color:"#ef4444", fontSize:13, display:"flex", alignItems:"center", gap:8 }}>
            {Icons.x} {manErr}
          </div>
        )}

        <button onClick={registrarManual}
          style={{ ...styles.btnPrimary, background:"#166534", width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          <span style={{ color:"#4ade80" }}>{Icons.userPlus}</span>
          Registrar y Confirmar Vacaciones
        </button>
      </div>

      {/* Bloqueos */}
      <div style={{ background:"#0f172a", border:"1px solid #7c2d6a", borderRadius:14, padding:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          {Icons.ban}
          <span style={styles.sectionTitle}>Bloqueos Manuales</span>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:14 }}>
          <input type="date" value={blockDate} onChange={e=>setBlockDate(e.target.value)}
            min={today} max={isoDate(maxD)}
            style={{ ...styles.input, flex:"1 1 140px" }}/>
          <input type="text" value={blockNote} onChange={e=>setBlockNote(e.target.value)}
            placeholder="Comentario (ej: Alta demanda)"
            style={{ ...styles.input, flex:"2 1 180px" }}/>
          <button onClick={addBlock} style={{ ...styles.btnPrimary, background:"#7c2d6a", flex:"0 0 auto" }}>Bloquear Día</button>
        </div>
        {Object.keys(bloqueos).length === 0
          ? <p style={{ color:"#64748b", fontSize:14 }}>Sin días bloqueados.</p>
          : Object.entries(bloqueos).sort().map(([d, note]) => (
            <div key={d} style={{ background:"#1c0a1a", border:"1px solid #7c2d6a", borderRadius:8, padding:"10px 14px", marginBottom:6, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={{ color:"#c084fc", fontWeight:700, fontFamily:"'Barlow Condensed',sans-serif", fontSize:15 }}>{fmtDate(parseISO(d))}</p>
                <p style={{ color:"#a855f7", fontSize:12 }}>{note}</p>
              </div>
              <button onClick={() => removeBlock(d)} style={{ background:"transparent", border:"1px solid #7c2d6a", borderRadius:6, padding:"5px 8px", cursor:"pointer", color:"#a855f7" }}>{Icons.trash}</button>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [solicitudes, setSolicitudes] = useStorage("vac_solicitudes", []);
  const [bloqueos,    setBloqueos]    = useStorage("vac_bloqueos", {});
  const [view, setView]               = useState("operator"); // operator | admin
  const [adminAuth, setAdminAuth]     = useState(false);
  const [adminPass, setAdminPass]     = useState("");
  const [passErr,   setPassErr]       = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [nombre,   setNombre]   = useState("");
  const [empleado, setEmpleado] = useState("");
  const [toast,    setToast]    = useState({ msg:"", type:"info" });

  const today = new Date(); today.setHours(0,0,0,0);
  const maxDate = new Date(today); maxDate.setDate(today.getDate()+30);

  function showToast(msg, type="info") { setToast({ msg, type }); }

  function handleLogin() {
    if (adminPass === ADMIN_PASS) { setAdminAuth(true); setView("admin"); setPassErr(false); }
    else setPassErr(true);
  }

  function handleSubmit() {
    if (!selectedDate || !nombre.trim() || !empleado.trim()) {
      showToast("Completa todos los campos y selecciona una fecha.", "error"); return;
    }
    // Check duplicado
    const dup = solicitudes.find(s => s.nombre.toLowerCase()===nombre.toLowerCase() && s.fecha===selectedDate && (s.estado==="pendiente"||s.estado==="confirmada"));
    if (dup) { showToast("Ya tienes una solicitud para ese día.", "error"); return; }

    const id = Date.now().toString();
    const fecha = selectedDate;
    setSolicitudes(prev => [...prev, { id, nombre:nombre.trim(), empleado:empleado.trim(), fecha, estado:"pendiente", ts: new Date().toISOString() }]);
    showToast("¡Solicitud enviada! Confirma por WhatsApp.", "success");

    const texto = encodeURIComponent(`Solicito vacaciones ${nombre.trim()} el día ${fmtDate(parseISO(selectedDate))}`);
    window.open(`https://wa.me/${WA_NUMBER}?text=${texto}`, "_blank");

    setNombre(""); setEmpleado(""); setSelectedDate(null);
  }

  const dayStatus = selectedDate ? (() => {
    const cnt = solicitudes.filter(s => s.fecha===selectedDate && s.estado==="confirmada").length;
    return cnt;
  })() : 0;

  return (
    <div style={{ minHeight:"100vh", background:"#020617", fontFamily:"'Barlow Condensed',sans-serif", color:"#f1f5f9" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; background: #020617; }
        input, button, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 99px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        @keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .fadein { animation: fadeIn 0.35s ease both; }
      `}</style>

      <Toast msg={toast.msg} type={toast.type} onClose={() => setToast({ msg:"" })}/>

      {/* HEADER */}
      <header style={{ background:"rgba(2,6,23,0.95)", borderBottom:"1px solid #1e293b", padding:"16px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, backdropFilter:"blur(12px)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ background:"#f59e0b", borderRadius:10, padding:"6px 8px", color:"#000" }}>{Icons.factory}</div>
          <div>
            <p style={{ fontSize:18, fontWeight:800, letterSpacing:2, textTransform:"uppercase", margin:0, lineHeight:1 }}>Portal de Vacaciones</p>
            <p style={{ fontSize:11, color:"#64748b", letterSpacing:3, margin:0, textTransform:"uppercase" }}>Ensamble Exterior · Piezas Pequeñas</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => { setView("operator"); setSelectedDate(null); }}
            style={{ ...styles.tabBtn, background: view==="operator" ? "#f59e0b" : "transparent", color: view==="operator" ? "#000" : "#64748b", border: view==="operator" ? "none" : "1px solid #334155" }}>
            Operador
          </button>
          <button onClick={() => { if(!adminAuth) setView("login"); else setView("admin"); }}
            style={{ ...styles.tabBtn, background: view==="admin" ? "#f59e0b" : "transparent", color: view==="admin" ? "#000" : "#64748b", border: view==="admin" ? "none" : "1px solid #334155", display:"flex", alignItems:"center", gap:5 }}>
            {Icons.lock} Admin
          </button>
        </div>
      </header>

      <main style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>

        {/* LOGIN VIEW */}
        {view === "login" && (
          <div className="fadein" style={{ maxWidth:360, margin:"60px auto" }}>
            <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:18, padding:32, textAlign:"center" }}>
              <div style={{ marginBottom:20, color:"#f59e0b" }}>{Icons.lock}</div>
              <h2 style={{ fontSize:24, fontWeight:800, letterSpacing:2, margin:"0 0 8px", textTransform:"uppercase" }}>Acceso Admin</h2>
              <p style={{ color:"#64748b", fontSize:14, marginBottom:24 }}>Ingresa la contraseña de administrador</p>
              <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()}
                placeholder="Contraseña"
                style={{ ...styles.input, width:"100%", marginBottom:12, textAlign:"center", fontSize:18, letterSpacing:4 }}/>
              {passErr && <p style={{ color:"#ef4444", fontSize:13, marginBottom:12 }}>Contraseña incorrecta.</p>}
              <button onClick={handleLogin} style={{ ...styles.btnPrimary, width:"100%" }}>Ingresar</button>
              <button onClick={() => setView("operator")} style={{ ...styles.btnSmall, width:"100%", marginTop:10, background:"transparent", color:"#64748b", border:"1px solid #334155" }}>Cancelar</button>
            </div>
          </div>
        )}

        {/* ADMIN VIEW */}
        {view === "admin" && adminAuth && (
          <div className="fadein">
            <AdminPanel
              solicitudes={solicitudes} setSolicitudes={setSolicitudes}
              bloqueos={bloqueos} setBloqueos={setBloqueos}
              onLogout={() => { setAdminAuth(false); setAdminPass(""); setView("operator"); }}
            />
          </div>
        )}

        {/* OPERATOR VIEW */}
        {view === "operator" && (
          <div className="fadein">
            <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:18, padding:"20px 16px", marginBottom:20 }}>
              <Calendar
                solicitudes={solicitudes} bloqueos={bloqueos}
                onSelect={setSelectedDate} selectedDate={selectedDate}
              />
            </div>

            {/* Request Form */}
            <div style={{ background:"#0f172a", border:"1px solid #334155", borderRadius:18, padding:24 }}>
              <h3 style={{ fontSize:18, fontWeight:700, letterSpacing:2, textTransform:"uppercase", marginBottom:20, color:"#f1f5f9" }}>Solicitar Vacaciones</h3>

              {selectedDate && (
                <div style={{ background:"#1c1500", border:"1px solid #92400e", borderRadius:10, padding:"10px 14px", marginBottom:16, display:"flex", alignItems:"center", gap:10 }}>
                  {Icons.calendar}
                  <div>
                    <p style={{ margin:0, fontWeight:700, color:"#f59e0b", fontSize:16 }}>{fmtDate(parseISO(selectedDate))}</p>
                    <p style={{ margin:0, fontSize:12, color:"#b45309" }}>
                      {dayStatus === 0 ? "✓ Disponible — primer operador" : `Disponible — ${dayStatus} persona ya programada`}
                    </p>
                  </div>
                </div>
              )}

              <div style={{ display:"flex", gap:12, flexDirection:"column" }}>
                <div>
                  <label style={styles.label}>Nombre Completo</label>
                  <input value={nombre} onChange={e=>setNombre(e.target.value)}
                    placeholder="Ej: Juan García López"
                    style={{ ...styles.input, width:"100%" }}/>
                </div>
                <div>
                  <label style={styles.label}>Número de Empleado</label>
                  <input value={empleado} onChange={e=>setEmpleado(e.target.value)}
                    placeholder="Ej: 00123"
                    style={{ ...styles.input, width:"100%" }}/>
                </div>

                {!selectedDate && (
                  <p style={{ color:"#64748b", fontSize:13, textAlign:"center", padding:"8px 0" }}>← Selecciona un día disponible en el calendario</p>
                )}

                <button onClick={handleSubmit}
                  disabled={!selectedDate || !nombre.trim() || !empleado.trim()}
                  style={{ ...styles.btnPrimary, width:"100%", fontSize:16, padding:"16px", display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                    opacity: (!selectedDate || !nombre.trim() || !empleado.trim()) ? 0.4 : 1,
                    cursor: (!selectedDate || !nombre.trim() || !empleado.trim()) ? "not-allowed" : "pointer",
                  }}>
                  <span style={{ color:"#25D366" }}>{Icons.wa}</span>
                  Confirmar y Enviar por WhatsApp
                </button>
                <p style={{ color:"#475569", fontSize:11, textAlign:"center", margin:0 }}>
                  Al confirmar se abrirá WhatsApp para notificar al supervisor
                </p>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = {
  navBtn: { background:"transparent", border:"1px solid #334155", color:"#94a3b8", borderRadius:8, width:36, height:36, cursor:"pointer", fontSize:20, display:"flex", alignItems:"center", justifyContent:"center" },
  sectionTitle: { fontFamily:"'Barlow Condensed',sans-serif", fontSize:16, fontWeight:700, letterSpacing:1.5, textTransform:"uppercase", color:"#94a3b8" },
  tabBtn: { fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, padding:"7px 16px", borderRadius:8, cursor:"pointer", textTransform:"uppercase", transition:"all 0.15s" },
  btnPrimary: { background:"#f59e0b", color:"#000", border:"none", borderRadius:12, padding:"13px 20px", fontWeight:800, fontSize:14, cursor:"pointer", letterSpacing:1, textTransform:"uppercase", transition:"opacity 0.15s" },
  btnSmall: { background:"#1e293b", color:"#f1f5f9", border:"1px solid #334155", borderRadius:8, padding:"8px 14px", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:0.5 },
  input: { background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"13px 16px", color:"#f1f5f9", fontSize:15, outline:"none" },
  label: { display:"block", fontSize:12, fontWeight:700, letterSpacing:1, color:"#64748b", textTransform:"uppercase", marginBottom:6 },
};
