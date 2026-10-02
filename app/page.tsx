"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import swcsIcon from "./swcs_icon.jpg";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  Euro,
  House,
  Menu,
  SlidersHorizontal,
  Sparkles,
  Wallet,
  LoaderCircle,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type PaymentRow = {
  month: number;
  dueMonth: string;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
};
type Simulation = {
  annualRate: number;
  monthlyRate: number;
  monthlyPayment: number;
  totalInterest: number;
  totalRepayment: number;
  schedule: PaymentRow[];
};
type InputConstraint = {
  minimum: number;
  maximum: number;
  maximumDecimalPlaces: number;
};
type InputRules = {
  principal: InputConstraint;
  durationMonths: InputConstraint;
  annualIncome: InputConstraint;
};
type ApiError = { code: string; message: string };
type ErrorResponse = {
  code: string;
  message: string;
  errors?: Record<string, ApiError[]>;
};
const money = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(n);
const decimal = (n: number, digits = 2) =>
  new Intl.NumberFormat("fr-BE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
const exceedsPrecision = (value: number, decimalPlaces: number) => {
  const scaled = value * 10 ** decimalPlaces;
  return Math.abs(scaled - Math.round(scaled)) > 1e-8;
};
const monthLabel = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-BE", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};
const dueMonth = (row: PaymentRow) => monthLabel(row.dueMonth);
const validationMessages: Record<string, string> = {
  PRINCIPAL_REQUIRED: "Saisissez le montant que vous souhaitez emprunter.",
  DURATION_REQUIRED: "Saisissez la durée du prêt en mois.",
  INCOME_REQUIRED: "Saisissez votre revenu annuel.",
  START_MONTH_INVALID: "Choisissez un mois valide au format AAAA-MM.",
};
const validationMessage = (issue: ApiError, rules: InputRules) => {
  switch (issue.code) {
    case "PRINCIPAL_OUT_OF_RANGE":
      return `Le montant doit être compris entre ${money(rules.principal.minimum)} et ${money(rules.principal.maximum)}.`;
    case "PRINCIPAL_PRECISION":
      return `Saisissez au maximum ${rules.principal.maximumDecimalPlaces} décimales.`;
    case "DURATION_OUT_OF_RANGE":
      return `La durée doit être comprise entre ${rules.durationMonths.minimum} et ${rules.durationMonths.maximum} mois.`;
    case "DURATION_PRECISION":
      return "La durée doit être exprimée en mois entiers.";
    case "INCOME_OUT_OF_RANGE":
      return `Le revenu annuel doit être compris entre ${money(rules.annualIncome.minimum)} et ${money(rules.annualIncome.maximum)} par an.`;
    case "INCOME_PRECISION":
      return `Saisissez au maximum ${rules.annualIncome.maximumDecimalPlaces} décimales.`;
    default:
      return validationMessages[issue.code] ?? issue.message;
  }
};

function Field({
  label,
  name,
  value,
  onChange,
  suffix,
  min,
  max,
  step = 1,
  error,
  disabled = false,
}: {
  label: string;
  name: string;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
  min: number;
  max: number;
  step?: number;
  error?: string;
  disabled?: boolean;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <span className={`input-wrap ${error ? "input-error" : ""}`}>
        <input
          name={name}
          type="number"
          value={value}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-invalid={!!error}
        />
        <span>{suffix}</span>
      </span>
      <input
        aria-label={`Curseur : ${label}`}
        className="range"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {error && <span className="error-text">{error}</span>}
    </label>
  );
}

export default function Home() {
  const [principal, setPrincipal] = useState(100000);
  const [durationMonths, setDurationMonths] = useState(360);
  const [annualIncome, setAnnualIncome] = useState(28000);
  const [startMonth, setStartMonth] = useState("2021-01");
  const [rules, setRules] = useState<InputRules | null>(null);
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [page, setPage] = useState(1);
  const [hasRun, setHasRun] = useState(false);
  const schedule = simulation?.schedule ?? [];
  const monthly = simulation?.monthlyPayment ?? 0;
  const totalInterest = simulation?.totalInterest ?? 0;
  const total = simulation?.totalRepayment ?? 0;
  const pageSize = 12,
    visibleRows = schedule.slice((page - 1) * pageSize, page * pageSize);
  const chartRows = useMemo(() => {
    let accrued = 0;
    return schedule
      .map((row, index) => {
        accrued += row.interest;
        return {
          date: dueMonth(row),
          capital: row.balance,
          interest: accrued,
          index,
        };
      })
      .filter(
        (row) => row.index % 6 === 0 || row.index === schedule.length - 1,
      );
  }, [schedule]);
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "";

  async function runSimulation(event?: FormEvent, activeRules = rules) {
    event?.preventDefault();
    setRequestError("");
    setHasRun(true);
    if (!activeRules) {
      setRequestError("Les règles de saisie n’ont pas pu être chargées.");
      return;
    }
    const clientErrors: Record<string, string> = {};
    if (
      principal < activeRules.principal.minimum ||
      principal > activeRules.principal.maximum
    )
      clientErrors.principal = validationMessage({ code: "PRINCIPAL_OUT_OF_RANGE", message: "" }, activeRules);
    else if (exceedsPrecision(principal, activeRules.principal.maximumDecimalPlaces))
      clientErrors.principal = validationMessage({ code: "PRINCIPAL_PRECISION", message: "" }, activeRules);
    if (
      durationMonths < activeRules.durationMonths.minimum ||
      durationMonths > activeRules.durationMonths.maximum
    )
      clientErrors.durationMonths = validationMessage({ code: "DURATION_OUT_OF_RANGE", message: "" }, activeRules);
    else if (exceedsPrecision(durationMonths, activeRules.durationMonths.maximumDecimalPlaces))
      clientErrors.durationMonths = validationMessage({ code: "DURATION_PRECISION", message: "" }, activeRules);
    if (
      annualIncome < activeRules.annualIncome.minimum ||
      annualIncome > activeRules.annualIncome.maximum
    )
      clientErrors.annualIncome = validationMessage({ code: "INCOME_OUT_OF_RANGE", message: "" }, activeRules);
    else if (exceedsPrecision(annualIncome, activeRules.annualIncome.maximumDecimalPlaces))
      clientErrors.annualIncome = validationMessage({ code: "INCOME_PRECISION", message: "" }, activeRules);
    if (startMonth && !/^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth))
      clientErrors.startMonth = "Choisissez un mois valide.";
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      setSimulation(null);
      return;
    }
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${apiBase}/api/v1/simulations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          principal,
          durationMonths,
          annualIncome,
          startMonth: startMonth || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const body = data as ErrorResponse;
        const nextErrors: Record<string, string> = {};
        Object.entries(body.errors ?? {}).forEach(([field, issues]) => {
          nextErrors[field] = issues.map((issue) => validationMessage(issue, activeRules)).join(" ");
        });
        setErrors(nextErrors);
        setSimulation(null);
      } else {
        setSimulation(data as Simulation);
        setPage(1);
      }
    } catch {
      setRequestError(
        "Le service de simulation est inaccessible. Vérifiez que l’API est démarrée, puis réessayez.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        const response = await fetch(`${apiBase}/api/v1/rules`);
        if (!response.ok) throw new Error("Rules request failed");
        const loadedRules = (await response.json()) as InputRules;
        if (cancelled) return;
        setRules(loadedRules);
        await runSimulation(undefined, loadedRules);
      } catch {
        if (!cancelled)
          setRequestError("Impossible de charger les règles de saisie depuis l’API.");
      }
    }
    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  function downloadCsv() {
    const lines = [
      [
        "N°",
        "Mois",
        "Mensualité",
        "Intérêts",
        "Capital remboursé",
        "Solde restant dû",
      ],
      ...schedule.map((row) => [
        row.month,
        dueMonth(row),
        row.payment.toFixed(2),
        row.interest.toFixed(2),
        row.principal.toFixed(2),
        row.balance.toFixed(2),
      ]),
    ];
    const link = document.createElement("a");
    link.href = URL.createObjectURL(
      new Blob(["\uFEFF" + lines.map((line) => line.join(";")).join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    link.download = "simu-tableau-amortissement.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  }

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#">
          <Image className="brand-icon" src={swcsIcon} alt="SWCS" /> SWCS
          <span className="brand-period">.</span>
        </a>
        <nav>
          <a className="nav-active" href="#simulator">
            Simulateur
          </a>
          <a href="#schedule">Échéancier</a>
          <a href="#about">Fonctionnement</a>
        </nav>
        <div className="top-actions">
          <button
            className="icon-button mobile-menu"
            aria-label="Ouvrir le menu"
          >
            <Menu size={19} />
          </button>
          <button className="help-button">
            <CircleHelp size={16} /> Centre d’aide
          </button>
          <button className="avatar" aria-label="Profil">
            JD
          </button>
        </div>
      </header>
      <section className="intro" id="simulator">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> VOS FINANCES EN TOUTE CLARTÉ
        </div>
        <h1>
          Un projet immobilier <span>plus clair.</span>
        </h1>
        <p>
          Estimez votre prêt, comprenez chaque mensualité et avancez en toute
          confiance.
        </p>
      </section>
      <div className="workspace">
        <form className="controls-card" onSubmit={runSimulation}>
          <div className="card-title">
            <div className="title-icon">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <h2>Votre prêt</h2>
              <p>Modifiez les paramètres pour comparer les résultats.</p>
            </div>
          </div>
          <Field
            name="principal"
            label="Capital à emprunter"
            value={principal}
            onChange={setPrincipal}
            suffix="€"
            min={rules?.principal.minimum ?? principal}
            max={rules?.principal.maximum ?? principal}
            step={1000}
            error={errors.principal}
            disabled={!rules}
          />
          <Field
            name="durationMonths"
            label="Durée du prêt"
            value={durationMonths}
            onChange={setDurationMonths}
            suffix="mois"
            min={rules?.durationMonths.minimum ?? durationMonths}
            max={rules?.durationMonths.maximum ?? durationMonths}
            error={errors.durationMonths}
            disabled={!rules}
          />
          <Field
            name="annualIncome"
            label="Revenu annuel"
            value={annualIncome}
            onChange={setAnnualIncome}
            suffix="€/an"
            min={rules?.annualIncome.minimum ?? annualIncome}
            max={rules?.annualIncome.maximum ?? annualIncome}
            step={100}
            error={errors.annualIncome}
            disabled={!rules}
          />
          <label className="field start-date">
            <span className="field-label">Mois de la première échéance</span>
            <span
              className={`date-input ${errors.startMonth ? "input-error" : ""}`}
            >
              <CalendarDays size={17} />
              <input
                type="month"
                value={startMonth}
                disabled={!rules}
                onChange={(e) => setStartMonth(e.target.value)}
                aria-invalid={!!errors.startMonth}
              />
            </span>
            {errors.startMonth && (
              <span className="error-text">{errors.startMonth}</span>
            )}
          </label>
          <div className="rate-note">
            <span className="note-symbol">
              <Sparkles size={14} />
            </span>
            <span>
              <b>Taux fixe selon le revenu</b>
              <br />
              Le taux annuel est déterminé automatiquement selon les tranches de
              revenus en vigueur.
            </span>
          </div>
          <button className="simulate-button" type="submit" disabled={loading || !rules}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={15} /> Calcul en cours…
              </>
            ) : (
              <>
                Mettre à jour la simulation <ArrowRight size={14} />
              </>
            )}
          </button>
          {requestError && (
            <p className="request-error" role="alert">
              {requestError}
            </p>
          )}
        </form>
        <section className="results-column" aria-live="polite">
          <div className="payment-card">
            <div className="payment-copy">
              <span className="metric-label">
                VOTRE MENSUALITÉ ESTIMÉE <span className="info-dot">i</span>
              </span>
              <div className="payment-value">
                {simulation ? money(monthly) : "—"}
                <span> / mois</span>
              </div>
              <p>
                {simulation
                  ? `Taux fixe de ${decimal(simulation.annualRate)} % annuel · ${decimal(simulation.monthlyRate, 6)} % mensuel`
                  : "Lancez une simulation pour connaître vos mensualités."}
              </p>
            </div>
            <div className="payment-icon">
              <House size={21} />
            </div>
            <div className="payment-foot">
              <span>
                <Check size={15} /> Taux fixe
              </span>
              <span>
                <Check size={15} /> Taux selon le revenu
              </span>
              <span>
                <Check size={15} /> Échéancier complet
              </span>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total des intérêts</span>
                <span className="stat-icon purple">
                  <Euro size={15} />
                </span>
              </div>
              <strong>{simulation ? money(totalInterest) : "—"}</strong>
              <small>Coût du crédit</small>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Total à rembourser</span>
                <span className="stat-icon mint">
                  <Wallet size={15} />
                </span>
              </div>
              <strong>{simulation ? money(total) : "—"}</strong>
              <small>Capital + intérêts</small>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Durée du prêt</span>
                <span className="stat-icon amber">
                  <Clock3 size={15} />
                </span>
              </div>
              <strong>
                {simulation ? (
                  <>
                    {decimal(Math.round((durationMonths / 12) * 100) / 100, 2)}{" "}
                    <em>ans</em>
                  </>
                ) : (
                  "—"
                )}
              </strong>
              <small>
                {simulation
                  ? `${schedule.length} mensualités`
                  : "180 à 360 mois"}
              </small>
            </div>
          </div>
          <section className="chart-card">
            <div className="section-head">
              <div>
                <h2>Évolution de votre prêt</h2>
                <p>Suivez l’évolution du solde au fil des mensualités.</p>
              </div>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-capital" /> Capital restant dû
              </span>
              <span>
                <i className="legend-interest" /> Intérêts payés
              </span>
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartRows}
                  margin={{ top: 10, right: 6, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="capitalFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#6675e8"
                        stopOpacity={0.24}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6675e8"
                        stopOpacity={0.015}
                      />
                    </linearGradient>
                    <linearGradient
                      id="interestFill"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#81cbb4"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="100%"
                        stopColor="#81cbb4"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#edf0f4" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#99a0ae", fontSize: 10 }}
                    interval={Math.max(0, Math.floor(chartRows.length / 6) - 1)}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    width={49}
                    tick={{ fill: "#99a0ae", fontSize: 10 }}
                    tickFormatter={(v) => `€${Math.round(v / 1000)}k`}
                  />
                  <Tooltip
                    formatter={(value) => money(Number(value))}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #eff0f3",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="capital"
                    name="Capital restant dû"
                    stroke="#6877e9"
                    strokeWidth={2.2}
                    fill="url(#capitalFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name="Intérêts payés"
                    stroke="#78c4ac"
                    strokeWidth={2}
                    fill="url(#interestFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-caption">
              <span>
                <span className="caption-dot" />{" "}
                {simulation
                  ? `Fin du remboursement : ${dueMonth(schedule[schedule.length - 1])}.`
                  : "Le solde prévisionnel s’affichera ici."}
              </span>
              <a href="#schedule">
                Voir l’échéancier <ArrowRight size={13} />
              </a>
            </div>
          </section>
        </section>
      </div>
      <section className="schedule-card" id="schedule">
        <div className="schedule-heading">
          <div className="schedule-title">
            <div className="title-icon schedule-icon">
              <CalendarDays size={17} />
            </div>
            <div>
              <h2>Tableau d’amortissement</h2>
              <p>Le détail de votre prêt, mois par mois.</p>
            </div>
          </div>
          <button
            className="download-button"
            onClick={downloadCsv}
            disabled={!simulation}
          >
            <ArrowDownToLine size={15} /> Télécharger le CSV
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>N°</th>
                <th>MOIS</th>
                <th>MENSUALITÉ</th>
                <th>INTÉRÊTS</th>
                <th>CAPITAL REMBOURSÉ</th>
                <th>SOLDE RESTANT DÛ</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={row.month}>
                  <td>
                    <span className="payment-index">
                      {String(row.month).padStart(2, "0")}
                    </span>
                  </td>
                  <td>{dueMonth(row)}</td>
                  <td className="amount-cell">{money(row.payment)}</td>
                  <td>{money(row.interest)}</td>
                  <td>{money(row.principal)}</td>
                  <td className="balance-cell">{money(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && (
            <div className="table-message">
              Calcul de votre tableau d’amortissement…
            </div>
          )}
          {hasRun && !loading && !simulation && !requestError && (
            <div className="table-message">
              Corrigez les champs signalés pour générer votre échéancier.
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Affichage de{" "}
            <b>
              {schedule.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, schedule.length)}
            </b>{" "}
            sur <b>{schedule.length}</b> échéances
          </span>
          <div className="pagination">
            <button
              aria-label="Page précédente"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
            <span>
              {schedule.length ? page : 0} /{" "}
              {Math.ceil(schedule.length / pageSize)}
            </span>
            <button
              aria-label="Page suivante"
              disabled={page >= Math.ceil(schedule.length / pageSize)}
              onClick={() =>
                setPage((p) =>
                  Math.min(Math.ceil(schedule.length / pageSize), p + 1),
                )
              }
            >
              ›
            </button>
          </div>
        </div>
      </section>
      <footer id="about">
        <a className="brand footer-brand" href="#">
          <Image className="brand-icon" src={swcsIcon} alt="SWCS" /> SWCS
          <span className="brand-period">.</span>
        </a>
        <span>Pour préparer la suite.</span>
        <a className="footer-link" href="#simulator">
          À propos de cette simulation <ArrowUpRight size={13} />
        </a>
      </footer>
    </main>
  );
}
