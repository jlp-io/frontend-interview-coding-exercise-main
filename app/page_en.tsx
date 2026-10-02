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
  schedule: PaymentRow[];
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
const monthLabel = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
};
const dueMonth = (row: PaymentRow) => monthLabel(row.dueMonth);

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
          onChange={(e) => onChange(Number(e.target.value))}
          aria-invalid={!!error}
        />
        <span>{suffix}</span>
      </span>
      <input
        aria-label={`${label} slider`}
        className="range"
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
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
  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState("");
  const [page, setPage] = useState(1);
  const [hasRun, setHasRun] = useState(false);
  const schedule = simulation?.schedule ?? [];
  const monthly = simulation?.monthlyPayment ?? 0;
  const totalInterest = useMemo(
    () => schedule.reduce((sum, row) => sum + row.interest, 0),
    [schedule],
  );
  const total = principal + totalInterest;
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

  async function runSimulation(event?: FormEvent) {
    event?.preventDefault();
    setRequestError("");
    setHasRun(true);
    const clientErrors: Record<string, string> = {};
    if (principal < 20000 || principal > 310000)
      clientErrors.principal =
        "The amount must be between €20,000 and €310,000.";
    else if (Math.round(principal * 100) !== principal * 100)
      clientErrors.principal = "Use no more than two decimal places.";
    if (
      !Number.isInteger(durationMonths) ||
      durationMonths < 180 ||
      durationMonths > 360
    )
      clientErrors.durationMonths =
        "The term must be between 180 and 360 months.";
    if (annualIncome < 0 || annualIncome > 53900)
      clientErrors.annualIncome =
        "Annual income must be between €0 and €53,900.";
    else if (Math.round(annualIncome * 100) !== annualIncome * 100)
      clientErrors.annualIncome = "Use no more than two decimal places.";
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(startMonth))
      clientErrors.startMonth = "Choose a valid month.";
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
          startMonth,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const body = data as ErrorResponse;
        const nextErrors: Record<string, string> = {};
        Object.entries(body.errors ?? {}).forEach(([field, issues]) => {
          nextErrors[field] = issues.map((issue) => issue.message).join(" ");
        });
        setErrors(nextErrors);
        setSimulation(null);
      } else {
        setSimulation(data as Simulation);
        setPage(1);
      }
    } catch {
      setRequestError(
        "We could not reach the simulation service. Check that the API is running, then try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void runSimulation();
  }, []);

  function downloadCsv() {
    const lines = [
      ["#", "Month", "Payment", "Interest", "Principal", "Remaining balance"],
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
    link.download = "simu-amortization-schedule.csv";
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
            Simulator
          </a>
          <a href="#schedule">Payment schedule</a>
          <a href="#about">How it works</a>
        </nav>
        <div className="top-actions">
          <button className="icon-button mobile-menu" aria-label="Open menu">
            <Menu size={19} />
          </button>
          <button className="help-button">
            <CircleHelp size={16} /> Help center
          </button>
          <button className="avatar" aria-label="Profile">
            JD
          </button>
        </div>
      </header>
      <section className="intro" id="simulator">
        <div className="eyebrow">
          <span className="eyebrow-dot" /> YOUR FINANCES, IN FOCUS
        </div>
        <h1>
          A clearer path to <span>home.</span>
        </h1>
        <p>
          Explore your mortgage, understand every payment, and move forward with
          confidence.
        </p>
      </section>
      <div className="workspace">
        <form className="controls-card" onSubmit={runSimulation}>
          <div className="card-title">
            <div className="title-icon">
              <SlidersHorizontal size={17} />
            </div>
            <div>
              <h2>Loan details</h2>
              <p>Adjust your loan to see the difference.</p>
            </div>
          </div>
          <Field
            name="principal"
            label="Capital to borrow"
            value={principal}
            onChange={setPrincipal}
            suffix="€"
            min={20000}
            max={310000}
            step={1000}
            error={errors.principal}
          />
          <Field
            name="durationMonths"
            label="Loan term"
            value={durationMonths}
            onChange={setDurationMonths}
            suffix="months"
            min={180}
            max={360}
            error={errors.durationMonths}
          />
          <Field
            name="annualIncome"
            label="Annual income"
            value={annualIncome}
            onChange={setAnnualIncome}
            suffix="€/year"
            min={0}
            max={53900}
            step={100}
            error={errors.annualIncome}
          />
          <label className="field start-date">
            <span className="field-label">First payment month</span>
            <span
              className={`date-input ${errors.startMonth ? "input-error" : ""}`}
            >
              <CalendarDays size={17} />
              <input
                type="month"
                value={startMonth}
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
              <b>Income-based fixed rate</b>
              <br />
              The annual rate is selected automatically from the official income
              brackets.
            </span>
          </div>
          <button className="simulate-button" type="submit" disabled={loading}>
            {loading ? (
              <>
                <LoaderCircle className="spin" size={15} /> Calculating…
              </>
            ) : (
              <>
                Update simulation <ArrowRight size={14} />
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
                YOUR ESTIMATED MONTHLY PAYMENT{" "}
                <span className="info-dot">i</span>
              </span>
              <div className="payment-value">
                {simulation ? money(monthly) : "—"}
                <span> / month</span>
              </div>
              <p>
                {simulation
                  ? `Fixed rate of ${simulation.annualRate.toFixed(2)}% annual · ${simulation.monthlyRate.toFixed(6)}% monthly`
                  : "Run a simulation to see your repayment."}
              </p>
            </div>
            <div className="payment-icon">
              <House size={21} />
            </div>
            <div className="payment-foot">
              <span>
                <Check size={15} /> Fixed rate
              </span>
              <span>
                <Check size={15} /> Rate by income
              </span>
              <span>
                <Check size={15} /> Full schedule
              </span>
            </div>
          </div>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-top">
                <span>Total interest</span>
                <span className="stat-icon purple">
                  <Euro size={15} />
                </span>
              </div>
              <strong>{simulation ? money(totalInterest) : "—"}</strong>
              <small>Cost of borrowing</small>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Total repayment</span>
                <span className="stat-icon mint">
                  <Wallet size={15} />
                </span>
              </div>
              <strong>{simulation ? money(total) : "—"}</strong>
              <small>Capital + interest</small>
            </div>
            <div className="stat-card">
              <div className="stat-top">
                <span>Loan duration</span>
                <span className="stat-icon amber">
                  <Clock3 size={15} />
                </span>
              </div>
              <strong>
                {simulation ? (
                  <>
                    {Math.round((durationMonths / 12) * 100) / 100}{" "}
                    <em>years</em>
                  </>
                ) : (
                  "—"
                )}
              </strong>
              <small>
                {simulation
                  ? `${schedule.length} monthly payments`
                  : "180–360 months"}
              </small>
            </div>
          </div>
          <section className="chart-card">
            <div className="section-head">
              <div>
                <h2>Your loan over time</h2>
                <p>See how your balance changes with every payment.</p>
              </div>
            </div>
            <div className="chart-legend">
              <span>
                <i className="legend-capital" /> Remaining capital
              </span>
              <span>
                <i className="legend-interest" /> Interest paid
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
                    name="Remaining capital"
                    stroke="#6877e9"
                    strokeWidth={2.2}
                    fill="url(#capitalFill)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interest"
                    name="Interest paid"
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
                  ? `Repayment ends ${dueMonth(schedule[schedule.length - 1])}.`
                  : "Your projected balance will appear here."}
              </span>
              <a href="#schedule">
                View payment schedule <ArrowRight size={13} />
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
              <h2>Amortization schedule</h2>
              <p>A month-by-month breakdown of your loan.</p>
            </div>
          </div>
          <button
            className="download-button"
            onClick={downloadCsv}
            disabled={!simulation}
          >
            <ArrowDownToLine size={15} /> Download CSV
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>PAYMENT</th>
                <th>MONTH</th>
                <th>PAYMENT AMOUNT</th>
                <th>INTEREST</th>
                <th>PRINCIPAL</th>
                <th>REMAINING BALANCE</th>
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
              Calculating your amortization schedule…
            </div>
          )}
          {hasRun && !loading && !simulation && !requestError && (
            <div className="table-message">
              Correct the highlighted details to generate your schedule.
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            Showing{" "}
            <b>
              {schedule.length ? (page - 1) * pageSize + 1 : 0}–
              {Math.min(page * pageSize, schedule.length)}
            </b>{" "}
            of <b>{schedule.length}</b> payments
          </span>
          <div className="pagination">
            <button
              aria-label="Previous page"
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
              aria-label="Next page"
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
        <span>Made for the next chapter.</span>
        <a className="footer-link" href="#simulator">
          About this simulation <ArrowUpRight size={13} />
        </a>
      </footer>
    </main>
  );
}
