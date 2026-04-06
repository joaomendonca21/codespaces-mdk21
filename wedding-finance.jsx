import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line, CartesianGrid
} from "recharts";

const fmt = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 }).format(v);
const pct = (v, t) => t > 0 ? Math.round((v / t) * 100) : 0;

const STORES = ["Magazine Luiza", "Americanas", "Casas Bahia"];
const STORE_COLORS = { "Magazine Luiza": "#0086FF", "Americanas": "#E60014", "Casas Bahia": "#F26522" };
const CAT_COLORS = ["#C9956C", "#1A2744", "#7C6A9B", "#2E8B6A", "#E07B54"];

const INITIAL = {
  wedding: {
    goal: 79000,
    saved: 28500,
    history: [
      { month: "Jan/25", entrada: 4500, gasto: 0 },
      { month: "Fev/25", entrada: 5200, gasto: 2100 },
      { month: "Mar/25", entrada: 4800, gasto: 3800 },
      { month: "Abr/25", entrada: 6100, gasto: 4200 },
      { month: "Mai/25", entrada: 5500, gasto: 3600 },
      { month: "Jun/25", entrada: 7400, gasto: 2800 },
    ],
    festa: { orcado: 45000, gasto: 12300, investido: 9000 },
    viagem: { orcado: 20000, gasto: 4200, investido: 3500 },
    outros: { orcado: 14000, gasto: 2100, investido: 500 },
  },
  products: [
    { id: 1, name: "Sofá 3 lugares", cat: "Móveis", prio: "Alta", bought: false, stores: { "Magazine Luiza": 2899, "Americanas": 2650, "Casas Bahia": 2750 }, note: "Preferência couro sintético" },
    { id: 2, name: "Cama queen", cat: "Móveis", prio: "Alta", bought: false, stores: { "Magazine Luiza": 1899, "Americanas": 1750, "Casas Bahia": 1820 }, note: "Com cabeceira estofada" },
    { id: 3, name: "Geladeira 450L", cat: "Eletrodomésticos", prio: "Alta", bought: false, stores: { "Magazine Luiza": 3299, "Americanas": 3100, "Casas Bahia": 3450 }, note: "Frost free duplex" },
    { id: 4, name: "Fogão 5 bocas", cat: "Eletrodomésticos", prio: "Alta", bought: false, stores: { "Magazine Luiza": 1299, "Americanas": 1199, "Casas Bahia": 1249 }, note: "Com acendimento automático" },
    { id: 5, name: "Máquina de lavar", cat: "Eletrodomésticos", prio: "Alta", bought: false, stores: { "Magazine Luiza": 2099, "Americanas": 1999, "Casas Bahia": 2150 }, note: "12kg" },
    { id: 6, name: "TV 55\"", cat: "Eletrônicos", prio: "Média", bought: false, stores: { "Magazine Luiza": 2199, "Americanas": 2099, "Casas Bahia": 2299 }, note: "Smart TV 4K" },
    { id: 7, name: "Microondas 32L", cat: "Eletrodomésticos", prio: "Média", bought: false, stores: { "Magazine Luiza": 599, "Americanas": 549, "Casas Bahia": 579 }, note: "" },
    { id: 8, name: "Guarda-roupa 6p", cat: "Móveis", prio: "Alta", bought: false, stores: { "Magazine Luiza": 2499, "Americanas": 2299, "Casas Bahia": 2399 }, note: "Com espelho" },
    { id: 9, name: "Mesa de jantar", cat: "Móveis", prio: "Média", bought: false, stores: { "Magazine Luiza": 1299, "Americanas": 1199, "Casas Bahia": 1249 }, note: "6 cadeiras" },
    { id: 10, name: "Ar condicionado", cat: "Eletrodomésticos", prio: "Média", bought: false, stores: { "Magazine Luiza": 2299, "Americanas": 2199, "Casas Bahia": 2349 }, note: "12000 BTUs Inverter" },
    { id: 11, name: "Aspirador robô", cat: "Eletrônicos", prio: "Baixa", bought: false, stores: { "Magazine Luiza": 1599, "Americanas": 1499, "Casas Bahia": 1549 }, note: "" },
    { id: 12, name: "Lava-louças", cat: "Eletrodomésticos", prio: "Baixa", bought: false, stores: { "Magazine Luiza": 2599, "Americanas": 2399, "Casas Bahia": 2499 }, note: "8 serviços" },
  ],
  home: {
    type: "aluguel",
    rent: { value: 1800, cond: 350, iptu: 80 },
    buy: { value: 250000, down: 50000, rate: 10.5, months: 360 },
  },
  car: {
    status: "planejado",
    model: "VW Polo 2024",
    value: 89000,
    down: 20000,
    months: 60,
    rate: 14.5,
    fuel: 450, insurance: 250, maintenance: 150, ipva: 120,
  },
  income: {
    p1: 5500,
    p2: 4800,
    alloc: { moradia: 30, alimentação: 15, transporte: 10, lazer: 5, poupança: 20, casamento: 15, emergência: 5 },
  },
};

const PRIO_COLOR = { Alta: "#E53935", Média: "#E07B54", Baixa: "#7C6A9B" };

function ProgressBar({ value, max, color = "#C9956C", height = 10 }) {
  const p = Math.min(100, pct(value, max));
  return (
    <div style={{ background: "#f0ece8", borderRadius: 99, height, overflow: "hidden", width: "100%" }}>
      <div style={{ width: `${p}%`, background: color, height: "100%", borderRadius: 99, transition: "width 0.5s" }} />
    </div>
  );
}

function MetricCard({ label, value, sub, color = "#1A2744", small = false }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "14px 18px", minWidth: 0 }}>
      <div style={{ fontSize: 12, color: "#8a7f78", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
      <div style={{ fontSize: small ? 18 : 22, fontWeight: 700, color, fontFamily: "'Playfair Display', serif", lineHeight: 1.1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#a0968e", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ icon, title, sub }) {
  return (
    <div style={{ marginBottom: 20, paddingBottom: 12, borderBottom: "1.5px solid #e8e0d8" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <h2 style={{ margin: 0, fontSize: 20, fontFamily: "'Playfair Display', serif", color: "#1A2744", fontWeight: 700 }}>{title}</h2>
      </div>
      {sub && <p style={{ margin: "4px 0 0 30px", fontSize: 13, color: "#8a7f78", fontFamily: "'DM Sans', sans-serif" }}>{sub}</p>}
    </div>
  );
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────
function Overview({ data, setTab }) {
  const { wedding, products } = data;
  const totalProd = products.reduce((s, p) => s + Math.min(...Object.values(p.stores)), 0);
  const boughtProd = products.filter(p => p.bought).reduce((s, p) => s + Math.min(...Object.values(p.stores)), 0);
  const totalGasto = wedding.festa.gasto + wedding.viagem.gasto + wedding.outros.gasto;
  const totalInvestido = wedding.festa.investido + wedding.viagem.investido + wedding.outros.investido;
  const progressPct = pct(wedding.saved, wedding.goal);

  const pieData = [
    { name: "Festa", value: wedding.festa.orcado },
    { name: "Lua de mel", value: wedding.viagem.orcado },
    { name: "Outros", value: wedding.outros.orcado },
  ];

  const catData = [...new Set(products.map(p => p.cat))].map(cat => ({
    name: cat,
    total: products.filter(p => p.cat === cat).reduce((s, p) => s + Math.min(...Object.values(p.stores)), 0),
  })).sort((a, b) => b.total - a.total);

  return (
    <div>
      <SectionTitle icon="💍" title="Visão Geral" sub="Resumo do planejamento do casamento e da nova vida juntos" />

      {/* Hero progress */}
      <div style={{ background: "linear-gradient(135deg, #1A2744 0%, #2d3f6b 100%)", borderRadius: 16, padding: "24px 28px", marginBottom: 20, color: "#fff" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 13, opacity: 0.75, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>META TOTAL DO CASAMENTO</div>
            <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>{fmt(wedding.goal)}</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>Casamento + Lua de mel + Extras</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, opacity: 0.75, fontFamily: "'DM Sans', sans-serif", marginBottom: 4 }}>JÁ JUNTAMOS</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'Playfair Display', serif", color: "#E8C4A0" }}>{fmt(wedding.saved)}</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>{progressPct}% da meta</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 99, height: 12, overflow: "hidden" }}>
            <div style={{ width: `${progressPct}%`, background: "#C9956C", height: "100%", borderRadius: 99, transition: "width 0.5s" }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            <span>{fmt(wedding.saved)} guardados</span>
            <span>Faltam {fmt(wedding.goal - wedding.saved)}</span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total gasto" value={fmt(totalGasto)} sub="Casamento + viagem" color="#E53935" />
        <MetricCard label="Total investido" value={fmt(totalInvestido)} sub="Aplicações guardadas" color="#2E8B6A" />
        <MetricCard label="Lista de produtos" value={fmt(totalProd)} sub={`${products.length} itens mapeados`} color="#C9956C" />
        <MetricCard label="Já comprado" value={fmt(boughtProd)} sub={`${products.filter(p => p.bought).length} de ${products.length} itens`} color="#7C6A9B" />
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Distribuição orçamento casamento</div>
          <div style={{ position: "relative", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
            {pieData.map((d, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: CAT_COLORS[i], display: "inline-block" }} />
                {d.name} · {fmt(d.value)}
              </span>
            ))}
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Produtos por categoria</div>
          <div style={{ position: "relative", height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={catData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <XAxis type="number" tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Bar dataKey="total" fill="#C9956C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
        {[
          { tab: 1, icon: "💸", label: "Finanças casamento", desc: "Entradas e gastos" },
          { tab: 2, icon: "🛋️", label: "Lista de produtos", desc: "Benchmark de preços" },
          { tab: 3, icon: "🏡", label: "Gestão da casa", desc: "Aluguel ou compra" },
          { tab: 4, icon: "🚗", label: "Carro", desc: "Planejamento do veículo" },
          { tab: 5, icon: "📊", label: "Planejamento", desc: "Divisão da renda" },
        ].map(({ tab, icon, label, desc }) => (
          <button key={tab} onClick={() => setTab(tab)} style={{
            background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "14px 16px",
            textAlign: "left", cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#C9956C"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#e8e0d8"; e.currentTarget.style.transform = ""; }}
          >
            <div style={{ fontSize: 20, marginBottom: 6 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744", fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
            <div style={{ fontSize: 11, color: "#a0968e", marginTop: 2 }}>{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── WEDDING ──────────────────────────────────────────────────────────────────
function WeddingTab({ data, setData }) {
  const { wedding } = data;
  const [editing, setEditing] = useState(null);
  const totalGasto = wedding.festa.gasto + wedding.viagem.gasto + wedding.outros.gasto;
  const totalInvestido = wedding.festa.investido + wedding.viagem.investido + wedding.outros.investido;
  const totalOrcado = wedding.festa.orcado + wedding.viagem.orcado + wedding.outros.orcado;

  const categories = [
    { key: "festa", label: "Festa", icon: "🥂", color: "#C9956C" },
    { key: "viagem", label: "Lua de mel", icon: "✈️", color: "#1A2744" },
    { key: "outros", label: "Outros", icon: "📦", color: "#7C6A9B" },
  ];

  const histData = wedding.history.map(h => ({
    ...h,
    saldo: h.entrada - h.gasto,
  }));

  const updateField = (section, field, value) => {
    setData(d => ({
      ...d,
      wedding: { ...d.wedding, [section]: { ...d.wedding[section], [field]: parseFloat(value) || 0 } }
    }));
  };

  const addHistory = () => {
    const month = prompt("Mês (ex: Jul/25)");
    if (!month) return;
    const entrada = parseFloat(prompt("Valor que entrou (R$)") || 0);
    const gasto = parseFloat(prompt("Valor gasto (R$)") || 0);
    setData(d => ({ ...d, wedding: { ...d.wedding, history: [...d.wedding.history, { month, entrada, gasto }] } }));
  };

  return (
    <div>
      <SectionTitle icon="💍" title="Casamento & Lua de Mel" sub={`Meta total: ${fmt(wedding.goal)} — ${pct(wedding.saved, wedding.goal)}% atingida`} />

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Meta" value={fmt(wedding.goal)} sub="Total planejado" color="#1A2744" />
        <MetricCard label="Guardado" value={fmt(wedding.saved)} sub={`${pct(wedding.saved, wedding.goal)}% da meta`} color="#2E8B6A" />
        <MetricCard label="Gasto até agora" value={fmt(totalGasto)} sub="Pagamentos realizados" color="#E53935" />
        <MetricCard label="Investido" value={fmt(totalInvestido)} sub="Aplicações" color="#C9956C" />
      </div>

      {/* Progress da meta */}
      <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", fontFamily: "'DM Sans', sans-serif" }}>Progresso geral</span>
          <span style={{ fontSize: 13, color: "#8a7f78" }}>Faltam {fmt(wedding.goal - wedding.saved)}</span>
        </div>
        <ProgressBar value={wedding.saved} max={wedding.goal} color="#C9956C" height={14} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 12, color: "#8a7f78" }}>
          <span>{fmt(0)}</span>
          <span>{fmt(Math.round(wedding.goal * 0.25))}</span>
          <span>{fmt(Math.round(wedding.goal * 0.5))}</span>
          <span>{fmt(Math.round(wedding.goal * 0.75))}</span>
          <span>{fmt(wedding.goal)}</span>
        </div>
      </div>

      {/* Categoria cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {categories.map(({ key, label, icon, color }) => {
          const cat = wedding[key];
          return (
            <div key={key} style={{ background: "#fff", border: `1.5px solid ${color}30`, borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 18 }}>{icon}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color, fontFamily: "'Playfair Display', serif" }}>{label}</span>
                </div>
                <button onClick={() => setEditing(editing === key ? null : key)} style={{
                  background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#a0968e", padding: 4
                }}>✏️</button>
              </div>
              {editing === key ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {["orcado", "gasto", "investido"].map(f => (
                    <div key={f} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label style={{ fontSize: 12, color: "#8a7f78", width: 70 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                      <input type="number" defaultValue={cat[f]} onBlur={e => updateField(key, f, e.target.value)}
                        style={{ width: 110, fontSize: 13, padding: "4px 8px", border: "1px solid #e8e0d8", borderRadius: 6 }} />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "#8a7f78" }}>Orçado</span>
                      <span style={{ fontWeight: 600, color: "#1A2744" }}>{fmt(cat.orcado)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                      <span style={{ color: "#8a7f78" }}>Gasto</span>
                      <span style={{ fontWeight: 600, color: "#E53935" }}>{fmt(cat.gasto)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 12 }}>
                      <span style={{ color: "#8a7f78" }}>Investido</span>
                      <span style={{ fontWeight: 600, color: "#2E8B6A" }}>{fmt(cat.investido)}</span>
                    </div>
                    <ProgressBar value={cat.gasto + cat.investido} max={cat.orcado} color={color} height={8} />
                    <div style={{ fontSize: 11, color: "#a0968e", marginTop: 4, textAlign: "right" }}>
                      {pct(cat.gasto + cat.investido, cat.orcado)}% utilizado
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Histórico */}
      <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", fontFamily: "'DM Sans', sans-serif" }}>Histórico mensal</span>
          <button onClick={addHistory} style={{
            fontSize: 12, padding: "5px 12px", background: "#1A2744", color: "#fff",
            border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
          }}>+ Mês</button>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14, fontSize: 11, color: "#666" }}>
          {[{ color: "#2E8B6A", label: "Entrada" }, { color: "#E53935", label: "Gasto" }, { color: "#C9956C", label: "Saldo" }].map(l => (
            <span key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: l.color, display: "inline-block" }} />{l.label}
            </span>
          ))}
        </div>
        <div style={{ position: "relative", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={histData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmt(v)} />
              <Bar dataKey="entrada" fill="#2E8B6A" name="Entrada" radius={[3, 3, 0, 0]} />
              <Bar dataKey="gasto" fill="#E53935" name="Gasto" radius={[3, 3, 0, 0]} />
              <Bar dataKey="saldo" fill="#C9956C" name="Saldo" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── PRODUCTS ─────────────────────────────────────────────────────────────────
function ProductsTab({ data, setData }) {
  const [filterCat, setFilterCat] = useState("Todos");
  const [filterPrio, setFilterPrio] = useState("Todos");
  const [sortBy, setSortBy] = useState("name");
  const [showAdd, setShowAdd] = useState(false);
  const [newProd, setNewProd] = useState({ name: "", cat: "Móveis", prio: "Alta", note: "", ml: "", am: "", cb: "" });
  const [highlight, setHighlight] = useState(null);

  const cats = ["Todos", ...new Set(data.products.map(p => p.cat))];
  const prios = ["Todos", "Alta", "Média", "Baixa"];

  const filtered = useMemo(() => {
    return data.products
      .filter(p => filterCat === "Todos" || p.cat === filterCat)
      .filter(p => filterPrio === "Todos" || p.prio === filterPrio)
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "menor") return Math.min(...Object.values(a.stores)) - Math.min(...Object.values(b.stores));
        if (sortBy === "prio") {
          const o = { Alta: 0, Média: 1, Baixa: 2 };
          return o[a.prio] - o[b.prio];
        }
        return 0;
      });
  }, [data.products, filterCat, filterPrio, sortBy]);

  const totalMin = filtered.filter(p => !p.bought).reduce((s, p) => s + Math.min(...Object.values(p.stores)), 0);
  const totalBought = filtered.filter(p => p.bought).reduce((s, p) => s + Math.min(...Object.values(p.stores)), 0);

  const toggleBought = (id) => {
    setData(d => ({ ...d, products: d.products.map(p => p.id === id ? { ...p, bought: !p.bought } : p) }));
  };

  const addProduct = () => {
    const prod = {
      id: Date.now(), name: newProd.name, cat: newProd.cat, prio: newProd.prio,
      bought: false, note: newProd.note,
      stores: { "Magazine Luiza": parseFloat(newProd.ml) || 0, "Americanas": parseFloat(newProd.am) || 0, "Casas Bahia": parseFloat(newProd.cb) || 0 },
    };
    setData(d => ({ ...d, products: [...d.products, prod] }));
    setNewProd({ name: "", cat: "Móveis", prio: "Alta", note: "", ml: "", am: "", cb: "" });
    setShowAdd(false);
  };

  return (
    <div>
      <SectionTitle icon="🛋️" title="Lista de Produtos" sub="Benchmark de preços entre lojas para móveis e eletrodomésticos" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
        <MetricCard label="Total restante" value={fmt(totalMin)} sub={`${filtered.filter(p => !p.bought).length} itens a comprar`} color="#C9956C" />
        <MetricCard label="Já comprado" value={fmt(totalBought)} sub={`${filtered.filter(p => p.bought).length} itens`} color="#2E8B6A" />
        <MetricCard label="Total lista" value={fmt(totalMin + totalBought)} sub="Melhor preço possível" color="#1A2744" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setFilterCat(c)} style={{
              padding: "5px 12px", fontSize: 12, border: `1px solid ${filterCat === c ? "#C9956C" : "#e8e0d8"}`,
              background: filterCat === c ? "#C9956C15" : "#fff", borderRadius: 99, cursor: "pointer",
              color: filterCat === c ? "#C9956C" : "#666", fontFamily: "'DM Sans', sans-serif"
            }}>{c}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {prios.map(p => (
            <button key={p} onClick={() => setFilterPrio(p)} style={{
              padding: "5px 12px", fontSize: 12, border: `1px solid ${filterPrio === p ? "#1A2744" : "#e8e0d8"}`,
              background: filterPrio === p ? "#1A274415" : "#fff", borderRadius: 99, cursor: "pointer",
              color: filterPrio === p ? "#1A2744" : "#666", fontFamily: "'DM Sans', sans-serif"
            }}>{p}</button>
          ))}
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: "5px 10px", fontSize: 12, border: "1px solid #e8e0d8", borderRadius: 8,
          background: "#fff", cursor: "pointer", marginLeft: "auto", fontFamily: "'DM Sans', sans-serif"
        }}>
          <option value="name">Nome</option>
          <option value="menor">Menor preço</option>
          <option value="prio">Prioridade</option>
        </select>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: "6px 14px", fontSize: 12, background: "#1A2744", color: "#fff",
          border: "none", borderRadius: 8, cursor: "pointer", fontFamily: "'DM Sans', sans-serif"
        }}>+ Produto</button>
      </div>

      {/* Add product form */}
      {showAdd && (
        <div style={{ background: "#fff", border: "1.5px solid #C9956C", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Novo produto</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <input placeholder="Nome do produto" value={newProd.name} onChange={e => setNewProd(n => ({ ...n, name: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13 }} />
            <input placeholder="Observação" value={newProd.note} onChange={e => setNewProd(n => ({ ...n, note: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13 }} />
            <select value={newProd.cat} onChange={e => setNewProd(n => ({ ...n, cat: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13 }}>
              {["Móveis", "Eletrodomésticos", "Eletrônicos", "Decoração", "Outros"].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={newProd.prio} onChange={e => setNewProd(n => ({ ...n, prio: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13 }}>
              {["Alta", "Média", "Baixa"].map(p => <option key={p}>{p}</option>)}
            </select>
            {[["ml", "Magazine Luiza (R$)"], ["am", "Americanas (R$)"], ["cb", "Casas Bahia (R$)"]].map(([k, label]) => (
              <input key={k} placeholder={label} type="number" value={newProd[k]} onChange={e => setNewProd(n => ({ ...n, [k]: e.target.value }))} style={{ padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13 }} />
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
            <button onClick={addProduct} style={{ padding: "8px 18px", background: "#C9956C", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Adicionar</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", background: "#f0ece8", color: "#666", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Product list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.map(prod => {
          const prices = Object.entries(prod.stores);
          const minPrice = Math.min(...Object.values(prod.stores));
          const maxPrice = Math.max(...Object.values(prod.stores));
          const saving = maxPrice - minPrice;
          const isHighlit = highlight === prod.id;
          return (
            <div key={prod.id} onClick={() => setHighlight(isHighlit ? null : prod.id)} style={{
              background: "#fff", border: `1px solid ${isHighlit ? "#C9956C" : "#e8e0d8"}`,
              borderRadius: 12, padding: "14px 16px", cursor: "pointer",
              opacity: prod.bought ? 0.6 : 1, transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isHighlit ? 12 : 0, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <input type="checkbox" checked={prod.bought} onChange={() => toggleBought(prod.id)} onClick={e => e.stopPropagation()} style={{ width: 16, height: 16, accentColor: "#C9956C", flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: prod.bought ? "#a0968e" : "#1A2744", textDecoration: prod.bought ? "line-through" : "none", fontFamily: "'DM Sans', sans-serif" }}>{prod.name}</div>
                    <div style={{ display: "flex", gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, background: `${PRIO_COLOR[prod.prio]}20`, color: PRIO_COLOR[prod.prio], padding: "1px 8px", borderRadius: 99 }}>{prod.prio}</span>
                      <span style={{ fontSize: 11, background: "#f0ece8", color: "#8a7f78", padding: "1px 8px", borderRadius: 99 }}>{prod.cat}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#2E8B6A", fontFamily: "'Playfair Display', serif" }}>{fmt(minPrice)}</div>
                    <div style={{ fontSize: 11, color: "#a0968e" }}>melhor preço</div>
                  </div>
                  {saving > 0 && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#C9956C" }}>-{fmt(saving)}</div>
                      <div style={{ fontSize: 11, color: "#a0968e" }}>economiza</div>
                    </div>
                  )}
                </div>
              </div>

              {isHighlit && (
                <div>
                  <div style={{ position: "relative", height: 110, marginBottom: 10 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={prices.map(([store, price]) => ({ store: store.replace("Magazine Luiza", "Mag. Luiza"), price }))} layout="vertical">
                        <XAxis type="number" domain={[minPrice * 0.95, maxPrice * 1.05]} tickFormatter={v => fmt(v)} tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="store" tick={{ fontSize: 10 }} width={80} />
                        <Tooltip formatter={v => fmt(v)} />
                        <Bar dataKey="price" radius={[0, 4, 4, 0]}>
                          {prices.map(([store]) => <Cell key={store} fill={STORE_COLORS[store] || "#C9956C"} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {prod.note && <div style={{ fontSize: 12, color: "#8a7f78", background: "#faf7f4", borderRadius: 8, padding: "6px 10px" }}>📝 {prod.note}</div>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── HOME ──────────────────────────────────────────────────────────────────────
function HomeTab({ data, setData }) {
  const { home } = data;
  const setType = (t) => setData(d => ({ ...d, home: { ...d.home, type: t } }));
  const upd = (section, field, val) => setData(d => ({ ...d, home: { ...d.home, [section]: { ...d.home[section], [field]: parseFloat(val) || 0 } } }));

  const rentTotal = home.rent.value + home.rent.cond + home.rent.iptu;

  const pmt = (pv, r, n) => {
    const mr = r / 100 / 12;
    return mr > 0 ? pv * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : pv / n;
  };
  const finAmount = home.buy.value - home.buy.down;
  const monthlyBuy = pmt(finAmount, home.buy.rate, home.buy.months);
  const totalBuyPaid = monthlyBuy * home.buy.months + home.buy.down;

  const compData = [
    { name: "Aluguel", mensal: rentTotal, total12: rentTotal * 12, total: rentTotal * 12 * 5 },
    { name: "Financiamento", mensal: Math.round(monthlyBuy), total12: Math.round(monthlyBuy * 12), total: Math.round(totalBuyPaid) },
  ];

  return (
    <div>
      <SectionTitle icon="🏡" title="Gestão da Casa" sub="Aluguel vs compra — análise financeira para decidir" />

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["aluguel", "compra"].map(t => (
          <button key={t} onClick={() => setType(t)} style={{
            flex: 1, padding: "12px", border: `1.5px solid ${home.type === t ? "#C9956C" : "#e8e0d8"}`,
            background: home.type === t ? "#C9956C10" : "#fff", borderRadius: 10, cursor: "pointer",
            fontSize: 14, fontWeight: 600, color: home.type === t ? "#C9956C" : "#8a7f78", fontFamily: "'DM Sans', sans-serif"
          }}>{t === "aluguel" ? "🏠 Aluguel" : "🏗️ Comprar"}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Aluguel config */}
        <div style={{ background: "#fff", border: `1.5px solid ${home.type === "aluguel" ? "#C9956C" : "#e8e0d8"}`, borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>🏠 Aluguel</div>
          {[["value", "Aluguel mensal (R$)"], ["cond", "Condomínio (R$)"], ["iptu", "IPTU mensal (R$)"]].map(([f, label]) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>{label}</label>
              <input type="number" value={home.rent[f]} onChange={e => upd("rent", f, e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0ece8" }}>
            <div style={{ fontSize: 13, color: "#8a7f78" }}>Total mensal</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1A2744", fontFamily: "'Playfair Display', serif" }}>{fmt(rentTotal)}</div>
          </div>
        </div>

        {/* Compra config */}
        <div style={{ background: "#fff", border: `1.5px solid ${home.type === "compra" ? "#C9956C" : "#e8e0d8"}`, borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>🏗️ Financiamento</div>
          {[["value", "Valor do imóvel (R$)"], ["down", "Entrada (R$)"], ["rate", "Taxa anual (%)"], ["months", "Prazo (meses)"]].map(([f, label]) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>{label}</label>
              <input type="number" value={home.buy[f]} onChange={e => upd("buy", f, e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0ece8" }}>
            <div style={{ fontSize: 13, color: "#8a7f78" }}>Parcela mensal</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#1A2744", fontFamily: "'Playfair Display', serif" }}>{fmt(Math.round(monthlyBuy))}</div>
          </div>
        </div>
      </div>

      {/* Comparação */}
      <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "18px 20px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14, fontFamily: "'DM Sans', sans-serif" }}>Comparativo financeiro</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 16 }}>
          <MetricCard label="Aluguel mensal" value={fmt(rentTotal)} sub="Sem patrimônio" color="#E53935" small />
          <MetricCard label="Parcela mensal" value={fmt(Math.round(monthlyBuy))} sub="Constrói patrimônio" color="#2E8B6A" small />
          <MetricCard label="Valor financiado" value={fmt(finAmount)} sub={`Entrada: ${fmt(home.buy.down)}`} color="#1A2744" small />
          <MetricCard label="Total pago (30a)" value={fmt(Math.round(totalBuyPaid))} sub={`Juros: ${fmt(Math.round(totalBuyPaid - home.buy.value))}`} color="#7C6A9B" small />
        </div>
        <div style={{ position: "relative", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={compData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="mensal" fill="#C9956C" name="Mensal" radius={[4, 4, 0, 0]} />
              <Bar dataKey="total12" fill="#1A2744" name="Anual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Conselhos */}
      <div style={{ background: "#FAF7F4", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1A2744", marginBottom: 10 }}>💡 Pontos importantes</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            monthlyBuy > rentTotal ? `Parcela (${fmt(Math.round(monthlyBuy))}) é ${fmt(Math.round(monthlyBuy - rentTotal))} a mais que o aluguel por mês.` : `Parcela (${fmt(Math.round(monthlyBuy))}) é mais barata que o aluguel (${fmt(rentTotal)}) mensalmente.`,
            `No financiamento, você pagará ${fmt(Math.round(totalBuyPaid - home.buy.value))} de juros no total ao longo de ${home.buy.months / 12} anos.`,
            `Com aluguel, esse dinheiro "perdido" em ${home.buy.months} meses seria ${fmt(rentTotal * home.buy.months)}.`,
            "Considere custos extras na compra: escritura, ITBI (~2%), registro e reformas.",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "#5a5055" }}>
              <span style={{ color: "#C9956C", flexShrink: 0 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── CAR ────────────────────────────────────────────────────────────────────────
function CarTab({ data, setData }) {
  const { car } = data;
  const upd = (f, v) => setData(d => ({ ...d, car: { ...d.car, [f]: isNaN(parseFloat(v)) ? v : parseFloat(v) } }));

  const pmt = (pv, r, n) => {
    const mr = r / 100 / 12;
    return mr > 0 ? pv * (mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1) : pv / n;
  };
  const finAmount = car.value - car.down;
  const parcel = pmt(finAmount, car.rate, car.months);
  const monthlyTotal = parcel + car.fuel + car.insurance + car.maintenance + car.ipva;

  const costData = [
    { name: "Parcela", value: Math.round(parcel) },
    { name: "Combustível", value: car.fuel },
    { name: "Seguro", value: car.insurance },
    { name: "Manutenção", value: car.maintenance },
    { name: "IPVA", value: car.ipva },
  ];

  return (
    <div>
      <SectionTitle icon="🚗" title="Carro" sub="Planejamento e custo total do veículo" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14 }}>Dados do veículo</div>
          {[["model", "Modelo", "text"], ["value", "Valor (R$)", "number"], ["down", "Entrada (R$)", "number"], ["months", "Prazo (meses)", "number"], ["rate", "Taxa anual (%)", "number"]].map(([f, label, type]) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>{label}</label>
              <input type={type} value={car[f]} onChange={e => upd(f, e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14 }}>Custos mensais fixos</div>
          {[["fuel", "Combustível (R$)"], ["insurance", "Seguro (R$)"], ["maintenance", "Manutenção (R$)"], ["ipva", "IPVA mensal (R$)"]].map(([f, label]) => (
            <div key={f} style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>{label}</label>
              <input type="number" value={car[f]} onChange={e => upd(f, e.target.value)}
                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
            </div>
          ))}
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #f0ece8" }}>
            <div style={{ fontSize: 13, color: "#8a7f78" }}>Total mensal (sem parcela)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#C9956C", fontFamily: "'Playfair Display', serif" }}>{fmt(car.fuel + car.insurance + car.maintenance + car.ipva)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Parcela mensal" value={fmt(Math.round(parcel))} sub={`${car.months}x`} color="#E53935" small />
        <MetricCard label="Custo total/mês" value={fmt(Math.round(monthlyTotal))} sub="Incluindo todos custos" color="#1A2744" small />
        <MetricCard label="Total financiado" value={fmt(finAmount)} sub={`Entrada: ${fmt(car.down)}`} color="#C9956C" small />
        <MetricCard label="Total pago" value={fmt(Math.round(parcel * car.months + car.down))} sub="Incluindo juros" color="#7C6A9B" small />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 14 }}>Composição do custo mensal</div>
        <div style={{ position: "relative", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ece8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => `R$${v}`} tick={{ fontSize: 10 }} />
              <Tooltip formatter={v => fmt(v)} />
              <Bar dataKey="value" fill="#C9956C" radius={[4, 4, 0, 0]}>
                {costData.map((_, i) => <Cell key={i} fill={CAT_COLORS[i % CAT_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ── PLANNING ──────────────────────────────────────────────────────────────────
function PlanningTab({ data, setData }) {
  const { income } = data;
  const totalIncome = income.p1 + income.p2;
  const alloc = income.alloc;
  const totalAlloc = Object.values(alloc).reduce((s, v) => s + v, 0);

  const updIncome = (f, v) => setData(d => ({ ...d, income: { ...d.income, [f]: parseFloat(v) || 0 } }));
  const updAlloc = (f, v) => setData(d => ({ ...d, income: { ...d.income, alloc: { ...d.income.alloc, [f]: parseFloat(v) || 0 } } }));

  const allocItems = [
    { key: "moradia", label: "Moradia", color: "#1A2744", icon: "🏠" },
    { key: "alimentação", label: "Alimentação", color: "#2E8B6A", icon: "🍽️" },
    { key: "transporte", label: "Transporte", color: "#C9956C", icon: "🚗" },
    { key: "lazer", label: "Lazer", color: "#7C6A9B", icon: "🎉" },
    { key: "poupança", label: "Poupança", color: "#E07B54", icon: "💰" },
    { key: "casamento", label: "Casamento", color: "#D4567A", icon: "💍" },
    { key: "emergência", label: "Emergência", color: "#4A90A4", icon: "🛡️" },
  ];

  const pieData = allocItems.map(item => ({
    name: item.label,
    value: alloc[item.key],
    color: item.color,
    amount: Math.round(totalIncome * alloc[item.key] / 100),
  }));

  const isValid = totalAlloc === 100;

  return (
    <div>
      <SectionTitle icon="📊" title="Planejamento Financeiro" sub="Como dividir a renda para viver bem e guardar para os objetivos" />

      {/* Income inputs */}
      <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px", marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Renda do casal</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>Pessoa 1 (R$)</label>
            <input type="number" value={income.p1} onChange={e => updIncome("p1", e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ fontSize: 12, color: "#8a7f78", display: "block", marginBottom: 3 }}>Pessoa 2 (R$)</label>
            <input type="number" value={income.p2} onChange={e => updIncome("p2", e.target.value)}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #e8e0d8", borderRadius: 8, fontSize: 14, boxSizing: "border-box" }} />
          </div>
          <div style={{ background: "#faf7f4", borderRadius: 8, padding: "8px 12px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: 11, color: "#8a7f78" }}>Renda total</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#1A2744", fontFamily: "'Playfair Display', serif" }}>{fmt(totalIncome)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        {/* Allocation sliders */}
        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", fontFamily: "'DM Sans', sans-serif" }}>Distribuição da renda</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: isValid ? "#2E8B6A" : "#E53935", background: isValid ? "#2E8B6A15" : "#E5393515", padding: "3px 10px", borderRadius: 99 }}>
              {totalAlloc}% {isValid ? "✓" : "≠ 100%"}
            </div>
          </div>
          {allocItems.map(item => (
            <div key={item.key} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ fontSize: 13, color: "#3a3038", fontFamily: "'DM Sans', sans-serif" }}>{item.icon} {item.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="number" value={alloc[item.key]} onChange={e => updAlloc(item.key, e.target.value)}
                    style={{ width: 50, textAlign: "center", padding: "3px 4px", border: "1px solid #e8e0d8", borderRadius: 6, fontSize: 12 }} />
                  <span style={{ fontSize: 12, color: "#8a7f78" }}>%</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.color, minWidth: 65, textAlign: "right" }}>{fmt(Math.round(totalIncome * alloc[item.key] / 100))}</span>
                </div>
              </div>
              <div style={{ background: "#f0ece8", borderRadius: 99, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(alloc[item.key], 100)}%`, background: item.color, height: "100%", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Pie chart */}
        <div style={{ background: "#fff", border: "1px solid #e8e0d8", borderRadius: 12, padding: "16px 18px" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1A2744", marginBottom: 12, fontFamily: "'DM Sans', sans-serif" }}>Visualização</div>
          <div style={{ position: "relative", height: 180 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={75} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip formatter={(v, n, p) => [`${v}% · ${fmt(p.payload.amount)}`, n]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
            {allocItems.map(item => (
              <span key={item.key} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#666" }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: item.color, display: "inline-block" }} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
        {allocItems.map(item => (
          <div key={item.key} style={{ background: "#fff", border: `1px solid ${item.color}30`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
            <div style={{ fontSize: 11, color: "#8a7f78", marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: item.color, fontFamily: "'Playfair Display', serif" }}>{fmt(Math.round(totalIncome * alloc[item.key] / 100))}</div>
            <div style={{ fontSize: 11, color: "#a0968e" }}>{alloc[item.key]}% da renda</div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div style={{ background: "#1A2744", borderRadius: 12, padding: "16px 20px", color: "#fff" }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: "#E8C4A0" }}>💡 Regras práticas para casais</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            "Regra 50-30-20: 50% necessidades, 30% desejos, 20% poupança/investimentos.",
            "Para o casamento: tente reservar pelo menos 15-20% da renda conjunta todo mês.",
            "Fundo de emergência: mínimo 3-6 salários guardados antes de fazer grandes gastos.",
            "Conta conjunta para despesas fixas + contas individuais para gastos pessoais funciona bem para casais.",
            `Com renda de ${fmt(totalIncome)}/mês, em ${Math.ceil((79000 - 28500) / (totalIncome * 0.15))} meses vocês atingem a meta guardando 15%.`,
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, opacity: 0.9 }}>
              <span style={{ color: "#C9956C", flexShrink: 0 }}>•</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── APP ROOT ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(INITIAL);

  const tabs = [
    { label: "Visão Geral", icon: "🏠" },
    { label: "Casamento", icon: "💍" },
    { label: "Produtos", icon: "🛋️" },
    { label: "Casa", icon: "🏡" },
    { label: "Carro", icon: "🚗" },
    { label: "Planejamento", icon: "📊" },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#FAF7F4", minHeight: "100vh" }}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ background: "#1A2744", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#E8C4A0", fontSize: 18, fontWeight: 700, fontFamily: "'Playfair Display', serif" }}>💍 Nós Dois</div>
          <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>Gestão financeira do casamento</div>
        </div>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>
          Meta: <span style={{ color: "#E8C4A0", fontWeight: 700 }}>R$ 79.000</span>
        </div>
      </div>

      {/* Tab nav */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e0d8", padding: "0 16px", display: "flex", overflowX: "auto", gap: 2 }}>
        {tabs.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: "12px 14px", border: "none", background: "none", cursor: "pointer",
            borderBottom: `2.5px solid ${tab === i ? "#C9956C" : "transparent"}`,
            color: tab === i ? "#C9956C" : "#8a7f78",
            fontSize: 13, fontWeight: tab === i ? 600 : 400,
            whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
            transition: "all 0.15s",
          }}>
            <span style={{ marginRight: 6 }}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>
        {tab === 0 && <Overview data={data} setTab={setTab} />}
        {tab === 1 && <WeddingTab data={data} setData={setData} />}
        {tab === 2 && <ProductsTab data={data} setData={setData} />}
        {tab === 3 && <HomeTab data={data} setData={setData} />}
        {tab === 4 && <CarTab data={data} setData={setData} />}
        {tab === 5 && <PlanningTab data={data} setData={setData} />}
      </div>
    </div>
  );
}
