import {
	createContext,
	Fragment,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from 'react'
import { Link, useNavigate } from 'react-router-dom'
import DraggableWidgetGrid, {
	type WidgetItem,
} from '@/components/ui/draggable-widget-grid'
import { useNotes } from '@/context/NotesContext'

type Kind =
	| 'sessions'
	| 'retention'
	| 'streak'
	| 'weak'
	| 'explanations'
	| 'lector'
	| 'modes'
	| 'subjects'

interface Widget extends WidgetItem {
	kind: Kind
}

const WIDGETS: Widget[] = [
	{ id: 'sessions', kind: 'sessions', size: 'wide', label: 'Study sessions today' },
	{ id: 'retention', kind: 'retention', size: 'sm', label: 'Retention health' },
	{ id: 'streak', kind: 'streak', size: 'sm', label: 'Study streak' },
	{ id: 'weak', kind: 'weak', size: 'sm', label: 'Weak concepts' },
	{ id: 'explanations', kind: 'explanations', size: 'wide', label: 'Recent explanations' },
	{ id: 'lector', kind: 'lector', size: 'sm', label: 'LECTOR score' },
	{ id: 'modes', kind: 'modes', size: 'wide', label: 'Adaptive Revision Schedule' },
	{ id: 'subjects', kind: 'subjects', size: 'wide', label: 'Topics by subject' },
]

const LiveContext = createContext(true)

const PALETTE = [
	'[--background:#1e1917] [--color-background:#1e1917] [--foreground:#f5efe8] [--color-foreground:#f5efe8] [--card:rgba(255,255,255,0.07)] [--color-card:rgba(255,255,255,0.07)] [--card-foreground:#f5efe8] [--color-card-foreground:#f5efe8] [--muted-foreground:#b3a69a] [--color-muted-foreground:#b3a69a] [--border:rgba(255,255,255,0.14)] [--color-border:rgba(255,255,255,0.14)] [--ring:#e8c89b] [--color-ring:#e8c89b]',
].join(' ')

function useTick(ms = 2000) {
	const live = useContext(LiveContext)
	const [tick, setTick] = useState(0)
	useEffect(() => {
		if (!live) return
		const id = window.setInterval(() => {
			if (!document.hidden) setTick((t) => t + 1)
		}, ms)
		return () => window.clearInterval(id)
	}, [live, ms])
	return tick
}

function noise(seed: number) {
	const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
	return x - Math.floor(x)
}

const fmt = (v: number) => v.toLocaleString('en-US')

type Tone = 'ok' | 'warn' | 'err' | 'idle'

const DOT: Record<Tone, string> = {
	ok: 'bg-emerald-500',
	warn: 'bg-amber-500',
	err: 'bg-rose-500',
	idle: 'bg-muted-foreground/60',
}

const TEXT: Record<Tone, string> = {
	ok: 'text-emerald-700',
	warn: 'text-amber-700',
	err: 'text-rose-700',
	idle: 'text-muted-foreground',
}

const ACCENT = 'bg-gold'

const HEAT = [
	'bg-foreground/[0.06]',
	'bg-gold/25',
	'bg-gold/40',
	'bg-gold/60',
	'bg-gold/85',
]

function Shell({
	title,
	meta,
	children,
}: {
	title: string
	meta?: ReactNode
	children: ReactNode
}) {
	return (
		<section className="@container flex h-full flex-col gap-4 p-4 sm:p-[22px]">
			<header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-[14px] leading-none">
				<h3 className="truncate text-[12px] tracking-[0.1em] text-muted-foreground uppercase">
					{title}
				</h3>
				{meta && <span className="shrink-0 text-muted-foreground">{meta}</span>}
			</header>
			<div className="flex min-h-0 flex-1 flex-col">{children}</div>
		</section>
	)
}

function Big({
	children,
	unit,
	unitWide = false,
}: {
	children: ReactNode
	unit?: string
	unitWide?: boolean
}) {
	return (
		<p className="text-[28px] leading-none font-normal tracking-tight text-foreground tabular-nums @[240px]:text-[30px]">
			{children}
			{unit && (
				<span
					className={`text-[13px] tracking-normal text-muted-foreground ${
						unitWide ? 'sr-only @[200px]:not-sr-only' : ''
					}`}>
					{'\u00a0'}
					{unit}
				</span>
			)}
		</p>
	)
}

function Delta({
	value,
	against,
	suffix,
	good = 'up',
}: {
	value: number
	against: string
	suffix?: string
	good?: 'up' | 'down'
}) {
	const up = value >= 0
	const tone: Tone = up === (good === 'up') ? 'ok' : 'err'
	return (
		<span className={`text-[14px] tabular-nums ${TEXT[tone]}`}>
			<span aria-hidden="true">{up ? '↑' : '↓'} </span>
			{Math.abs(value)}%
			{suffix && (
				<span aria-hidden="true" className="text-muted-foreground">
					{' '}
					{suffix}
				</span>
			)}
			<span className="sr-only"> {against}</span>
		</span>
	)
}

function Dot({ tone, pulse = false }: { tone: Tone; pulse?: boolean }) {
	return (
		<span aria-hidden="true" className="relative inline-flex size-2 shrink-0">
			{pulse && (
				<span
					className={`absolute inset-0 animate-ping rounded-full opacity-50 motion-reduce:hidden ${DOT[tone]}`}
				/>
			)}
			<span className={`relative size-2 rounded-full ${DOT[tone]}`} />
		</span>
	)
}

function Row({
	children,
	value,
	className = '',
}: {
	children: ReactNode
	value: ReactNode
	className?: string
}) {
	return (
		<div className={`flex items-center gap-2 text-[13px] ${className}`}>
			<dt className="flex min-w-0 items-center gap-2 truncate text-foreground">
				{children}
			</dt>
			<dd className="ml-auto text-muted-foreground tabular-nums">{value}</dd>
		</div>
	)
}

const DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Today']
const SLOTS = 32
const SLOT_MINUTES = 45
const NOW = 28
const HOURS = ['12AM', '6AM', '12PM', '6PM']

function sessionsAt(day: number, slot: number) {
	const hour = (slot * SLOT_MINUTES) / 60
	const weekend = DAYS[day] === 'Sat' || DAYS[day] === 'Sun'
	const shape =
		2.5 +
		Math.exp(-((hour - 15) ** 2) / 30) * 12 +
		Math.exp(-((hour - 10) ** 2) / 10) * 8
	return Math.max(
		0,
		Math.round(
			shape * 2.5 * (weekend ? 0.55 : 1) * (0.5 + noise(day * 97 + slot)),
		),
	)
}

const slotClock = (slot: number) => {
	const minutes = slot * SLOT_MINUTES
	return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

function Sessions() {
	const t = useTick(2500)
	const today = DAYS.length - 1
	const grid = DAYS.map((_, d) =>
		Array.from({ length: SLOTS }, (_, s) =>
			d === today && s > NOW
				? null
				: sessionsAt(d, s) + (d === today && s === NOW ? t % 8 : 0),
		),
	)
	const peak = Math.max(...grid.flat().map((v) => v ?? 0))
	const total = grid[today].reduce<number>((a, v) => a + (v ?? 0), 0)

	return (
		<Shell
			title="Study sessions"
			meta={<Delta value={18} against="compared with yesterday" suffix="vs yesterday" />}>
			<Big>{fmt(total)}</Big>
			<div className="mt-auto">
				<div
					role="img"
					aria-label={`Study sessions per 45 minutes over the last 5 days. ${fmt(total)} sessions so far today.`}
					className="grid grid-cols-1 items-center gap-x-3 gap-y-[3px] @[480px]:grid-cols-[auto_minmax(0,1fr)]">
					{grid.map((row, d) => (
						<Fragment key={DAYS[d]}>
							<span
								aria-hidden="true"
								className={`hidden text-[12px] leading-none @[480px]:block ${
									d === today ? 'text-foreground' : 'text-muted-foreground'
								}`}>
								{DAYS[d]}
							</span>
							<span className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[3px]">
								{row.map((v, s) => {
									const level =
										v === null || v === 0
											? 0
											: Math.max(1, Math.ceil((v / peak) * 4))
									return (
										<span
											key={s}
											title={
												v === null
													? undefined
													: `${DAYS[d]} ${slotClock(s)} · ${v} sessions`
											}
											className={`aspect-square rounded-[2.5px] transition-colors duration-700 motion-reduce:transition-none ${
												d === today && s === NOW ? 'bg-gold' : HEAT[level]
											}`}
										/>
									)
								})}
							</span>
						</Fragment>
					))}
					<span aria-hidden="true" className="hidden @[480px]:block" />
					<span
						aria-hidden="true"
						className="mt-2 hidden grid-cols-4 text-[12px] text-muted-foreground @[480px]:grid">
						{HOURS.map((h) => (
							<span key={h}>{h}</span>
						))}
					</span>
				</div>
			</div>
		</Shell>
	)
}

const RETENTION_GAPS: Record<number, Tone> = { 12: 'warn', 24: 'warn' }

function Retention() {
	const { retentionAverage } = useNotes()
	const degraded = retentionAverage < 85
	return (
		<Shell title="Retention health" meta="30d">
			<Big unit="retained" unitWide>
				{retentionAverage}%
			</Big>
			<p
				className={`mt-3 flex items-center gap-2 text-[13px] ${
					degraded ? TEXT.warn : 'text-foreground'
				}`}>
				<Dot tone={degraded ? 'warn' : 'ok'} pulse />
				<span className="truncate">
					{degraded ? 'Some concepts fading' : 'Retention on track'}
				</span>
			</p>
			<div className="mt-auto">
				<div
					role="img"
					aria-label="Retention over the last 30 days"
					className="flex h-5 gap-[2px] @[240px]:h-6">
					{Array.from({ length: 30 }, (_, i) => (
						<span
							key={i}
							className={`flex-1 rounded-[1.5px] ${
								RETENTION_GAPS[i] ? 'bg-amber-400/80' : 'bg-foreground/15'
							}`}
						/>
					))}
				</div>
			</div>
		</Shell>
	)
}

function Streak() {
	const t = useTick(3000)
	const days = Array.from({ length: 14 }, (_, i) =>
		Math.round(20 + noise(i * 5) * 40 + i * 2),
	)
	days[13] = Math.round(25 + (t % 30) * 1.5)
	const max = Math.max(...days)
	return (
		<Shell
			title="Study streak"
			meta={<Delta value={12} against="compared with last week" suffix="vs last week" />}>
			<Big unit="days">14</Big>
			<div
				role="img"
				aria-label={`Daily study minutes over the last 14 days, between ${Math.min(...days)} and ${max} minutes.`}
				className="mt-auto flex h-10 items-end gap-[3px]">
				{days.map((d, i) => (
					<span
						key={i}
						className={`flex-1 rounded-full transition-[height] duration-700 motion-reduce:transition-none ${
							i === days.length - 1 ? ACCENT : 'bg-foreground/15'
						}`}
						style={{ height: `${(d / max) * 100}%` }}
					/>
				))}
			</div>
		</Shell>
	)
}

function WeakConcepts() {
	const { notes } = useNotes()
	const weakNotes = [...notes]
		.sort((a, b) => (a.retentionHealth || 0) - (b.retentionHealth || 0))
		.slice(0, 3)

	return (
		<Shell title="Weak concepts" meta="needs review">
			<Big unit="topics">{weakNotes.length}</Big>
			<dl className="mt-auto space-y-2">
				{weakNotes.map((n, i) => (
					<Row key={n.id} value={`${n.retentionHealth}%`}>
						<Dot tone={i === 0 ? 'err' : 'warn'} />
						<span className="truncate">{n.title}</span>
					</Row>
				))}
			</dl>
		</Shell>
	)
}

function Explanations() {
	const { explanations, avgLectorScore } = useNotes()
	const recent = explanations.slice(0, 4)
	return (
		<Shell
			title="Recent explanations"
			meta={
				<span className="flex items-center gap-1.5">
					<Dot tone="ok" pulse />
					live
				</span>
			}>
			<Big unit="avg LECTOR">{avgLectorScore.toFixed(1)}</Big>
			<ol
				aria-label="Most recent explanations"
				className="mt-auto space-y-2 text-[13px]">
				{recent.map((r, i) => {
					const tone: Tone = r.score >= 9.0 ? 'ok' : r.score >= 8.0 ? 'warn' : 'err'
					return (
						<li
							key={r.id}
							className={`grid grid-cols-[6px_minmax(0,1fr)_48px] items-center gap-3 @[440px]:grid-cols-[6px_100px_minmax(0,1fr)_20%_48px] ${
								i === 0 ? 'text-foreground' : 'text-muted-foreground'
							}`}>
							<Dot tone={tone} />
							<span className="truncate">{r.id.substring(0, 8)}</span>
							<span aria-hidden="true" className="hidden truncate @[440px]:block">
								{r.topic}
							</span>
							<span
								aria-hidden="true"
								className="hidden h-[3px] rounded-full bg-foreground/10 @[440px]:block">
								<span
									className={`block h-full rounded-full ${i === 0 ? ACCENT : 'bg-foreground/25'}`}
									style={{ width: `${(r.score / 10) * 100}%` }}
								/>
							</span>
							<span className="text-right tabular-nums">{r.score.toFixed(1)}</span>
						</li>
					)
				})}
			</ol>
		</Shell>
	)
}

function LectorScore() {
	const { avgLectorScore, explanations } = useNotes()
	const latestExp = explanations[0]
	const correctness = latestExp ? (latestExp.correctness / 100).toFixed(2) : '0.94'
	const clarity = latestExp ? (latestExp.clarity / 100).toFixed(2) : '0.90'
	const completeness = latestExp ? (latestExp.completeness / 100).toFixed(2) : '0.92'

	return (
		<Shell title="LECTOR score">
			<div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
				<Big>{avgLectorScore.toFixed(2)}</Big>
				<span className={`text-[14px] tabular-nums ${TEXT.ok}`}>
					<span aria-hidden="true">↑ </span>0.04
					<span className="sr-only"> since last week</span>
				</span>
			</div>
			<dl className="mt-auto space-y-2">
				<Row key="Correctness" value={correctness}>
					Correctness
				</Row>
				<Row key="Clarity" value={clarity}>
					Clarity
				</Row>
				<Row key="Completeness" value={completeness}>
					Completeness
				</Row>
			</dl>
		</Shell>
	)
}

function DueRevisions() {
	const { notes } = useNotes()
	const navigate = useNavigate()
	const todayStr = '2026-09-18'

	const dueNotes = notes.filter((n) => n.nextReviewDate)
	const dueTodayCount = notes.filter(
		(n) => n.nextReviewDate && n.nextReviewDate <= todayStr,
	).length

	return (
		<Shell
			title="Adaptive Revision Schedule"
			meta={
				<Link
					to="/calendar"
					className="text-xs text-[#e8c89b] hover:underline font-semibold flex items-center gap-1">
					Full Calendar →
				</Link>
			}>
			<Big unit="due for review today">{dueTodayCount}</Big>
			<ul className="mt-3 space-y-2 text-[13px]">
				{dueNotes.slice(0, 3).map((n) => {
					const isDueNow = Boolean(n.nextReviewDate && n.nextReviewDate <= todayStr)
					return (
						<li
							key={n.id}
							className="flex items-center justify-between gap-2 rounded-xl bg-foreground/5 p-2 border border-foreground/10 hover:border-gold/40 transition">
							<div className="flex items-center gap-2 truncate">
								<span className="text-base">{n.icon}</span>
								<span className="truncate font-semibold text-foreground">{n.title}</span>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
										isDueNow
											? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
											: 'bg-foreground/10 text-muted-foreground'
									}`}>
									{isDueNow ? 'Due Today' : n.nextReviewDate}
								</span>

								<button
									onClick={() =>
										navigate(`/concept/new?noteId=${n.id}&topic=${encodeURIComponent(n.title)}`)
									}
									className="rounded-lg bg-[#e8c89b]/20 hover:bg-[#e8c89b]/30 px-2.5 py-1 text-[10px] font-bold text-[#e8c89b] border border-[#e8c89b]/40 transition">
									Practice Test
								</button>
							</div>
						</li>
					)
				})}
			</ul>
		</Shell>
	)
}

const SUBJECTS = [
	{ name: 'Computer Science', share: 0.38, swatch: ACCENT },
	{ name: 'Physics', share: 0.24, swatch: 'bg-gold/55' },
	{ name: 'Biology', share: 0.22, swatch: 'bg-gold/35' },
	{ name: 'Mathematics', share: 0.16, swatch: 'bg-foreground/20' },
]

function Subjects() {
	return (
		<Shell title="Topics by subject" meta="all time">
			<Big unit="concepts">24</Big>
			<dl className="mt-auto grid grid-cols-2 gap-x-6 gap-y-2">
				{SUBJECTS.map((s) => (
					<Row key={s.name} value={`${Math.round(s.share * 100)}%`}>
						<span
							aria-hidden="true"
							className={`size-1.5 shrink-0 rounded-full ${s.swatch}`}
						/>
						<span className="truncate">{s.name}</span>
					</Row>
				))}
			</dl>
			<div
				role="img"
				aria-label={`Share of concepts: ${SUBJECTS.map((s) => `${s.name} ${Math.round(s.share * 100)}%`).join(', ')}.`}
				className="mt-4 flex h-[3px] gap-[3px]">
				{SUBJECTS.map((s) => (
					<span
						key={s.name}
						className={`h-full rounded-full ${s.swatch}`}
						style={{ width: `${s.share * 100}%` }}
					/>
				))}
			</div>
		</Shell>
	)
}

const VIEWS: Record<Kind, () => ReactNode> = {
	sessions: Sessions,
	retention: Retention,
	streak: Streak,
	weak: WeakConcepts,
	explanations: Explanations,
	lector: LectorScore,
	modes: DueRevisions,
	subjects: Subjects,
}

const renderWidget = (item: Widget) => {
	const View = VIEWS[item.kind]
	return <View />
}

const STORAGE_KEY = 'memoroute_dashboard_layout'

export function LearningDashboardGrid() {
	const [live, setLive] = useState(true)
	const [widgets, setWidgets] = useState<Widget[]>(() => {
		try {
			const saved = localStorage.getItem(STORAGE_KEY)
			if (saved) {
				const ids = JSON.parse(saved) as string[]
				const ordered = ids
					.map((id) => WIDGETS.find((w) => w.id === id))
					.filter(Boolean) as Widget[]
				if (ordered.length === WIDGETS.length) return ordered
			}
		} catch {
			/* use default */
		}
		return WIDGETS
	})

	useEffect(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches)
			setLive(false)
	}, [])

	const handleChange = (items: WidgetItem[]) => {
		const next = items.map((item) => {
			const found = WIDGETS.find((w) => w.id === item.id)
			return found ?? { ...item, kind: 'sessions' as Kind }
		}) as Widget[]
		setWidgets(next)
		localStorage.setItem(STORAGE_KEY, JSON.stringify(next.map((w) => w.id)))
	}

	return (
		<div
			className={`w-full text-foreground antialiased ${PALETTE}`}
			style={{ fontFamily: 'var(--font-sans)' }}>
			<p className="mb-4 text-[14px] text-muted-foreground">
				<span className="[@media(pointer:coarse)]:hidden">
					Drag and rearrange widgets to customize your learning dashboard.
				</span>
				<span className="hidden [@media(pointer:coarse)]:inline">
					Press and hold a widget, then drag to rearrange the layout.
				</span>
			</p>
			<section aria-labelledby="learning-dashboard-title">
				<h2 id="learning-dashboard-title" className="sr-only">
					Learning dashboard
				</h2>
				<LiveContext.Provider value={live}>
					<DraggableWidgetGrid
						items={widgets}
						onChange={handleChange}
						renderItem={(item) => renderWidget(item as Widget)}
					/>
				</LiveContext.Provider>
			</section>
		</div>
	)
}
