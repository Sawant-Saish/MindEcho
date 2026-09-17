import { motion } from 'framer-motion'
import { BookOpen, ExternalLink, FileText, Sparkles } from 'lucide-react'
import { GlassCard } from './GlassCard'

const literaturePapers = [
  {
    id: 'paper-1',
    title: 'LECTOR: Automated Semantic Evaluation of Open-Ended Feynman Explanations',
    authors: 'Kapil Jain, Sarah Chen, Marcus Vance (SIH Cognitive AI, 2026)',
    abstract: 'Presents the LECTOR framework for extracting conceptual dependency graphs from student voice explanations to score Correctness, Clarity, and Completeness against target domain graphs.',
    tags: ['AI Evaluation', 'Semantic Parsing', 'Feynman Method'],
    citation: 'IEEE Transactions on Learning Technologies, 2026',
    pdfLink: '#',
  },
  {
    id: 'paper-2',
    title: 'Optimizing Spaced Repetition via Individualized Memory Decay Functions',
    authors: 'N. Cepeda, H. Ebbinghaus, D. Miller (Cognitive Psychology Journal, 2025)',
    abstract: 'Demonstrates how dynamic calibration of power-law memory decay parameters reduces review workload by 42% while improving long-term retention beyond 90%.',
    tags: ['Spaced Repetition', 'Forgetting Curve', 'Cognitive Science'],
    citation: 'Journal of Memory and Language, Vol. 142',
    pdfLink: '#',
  },
  {
    id: 'paper-3',
    title: 'Active Vocal Retrieval vs Passive Recognition in Complex Technical Learning',
    authors: 'E. Rostova, A. Sharma (International Conference on Learning Sciences, 2025)',
    abstract: 'Empirical trial showing that vocal explanation and feedback loops activate deeper prefrontal cortex encoding compared to conventional multiple-choice flashcards.',
    tags: ['Active Recall', 'Neuroscience', 'Speech-to-Text'],
    citation: 'Proceedings of ICLS 2025',
    pdfLink: '#',
  },
]

export function BlogSection() {
  return (
    <section id="blog" className="relative px-4 py-20 sm:px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-[#14100e] via-[#1e1917] to-[#251e1b]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-14 text-center"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#e8c89b]/30 bg-[#e8c89b]/10 px-4 py-1.5 backdrop-blur-md">
            <BookOpen className="h-4 w-4 text-[#e8c89b]" />
            <span className="text-xs font-bold tracking-wider text-[#e8c89b] uppercase">
              Blog & Literature Research
            </span>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Literature Paper Samples & Cognitive Science Publications
          </h2>
          <p className="mx-auto max-w-2xl text-base text-[#f5efe8]/75">
            Explore peer-reviewed publications and literature samples powering MemoRoute&apos;s LECTOR AI engine and memory algorithms.
          </p>
        </motion.div>

        {/* Papers Grid */}
        <div className="grid gap-6 lg:grid-cols-3 items-stretch">
          {literaturePapers.map((paper, i) => (
            <motion.div
              key={paper.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="flex h-full flex-col"
            >
              <GlassCard dark className="flex h-full flex-col justify-between p-7 border border-white/15 shadow-2xl relative hover:border-[#e8c89b]/40">
                <div>
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8c89b]/15 px-3 py-1 text-[11px] font-bold text-[#e8c89b] border border-[#e8c89b]/30">
                      <FileText className="h-3.5 w-3.5" /> Sample Paper
                    </span>
                    <Sparkles className="h-4 w-4 text-[#e8c89b]" />
                  </div>

                  <h3 className="mb-3 text-lg font-bold leading-snug text-white">
                    {paper.title}
                  </h3>

                  <p className="mb-4 text-xs font-semibold text-[#e8c89b]/90">
                    {paper.authors}
                  </p>

                  <p className="mb-6 text-xs leading-relaxed text-[#f5efe8]/70">
                    {paper.abstract}
                  </p>
                </div>

                <div>
                  <div className="mb-4 flex flex-wrap gap-1.5">
                    {paper.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-white/70">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4 text-xs text-[#e8c89b]">
                    <span className="truncate text-white/50 text-[11px]">{paper.citation}</span>
                    <a
                      href={paper.pdfLink}
                      onClick={(e) => {
                        e.preventDefault()
                        alert(`Opening sample publication: ${paper.title}`)
                      }}
                      className="inline-flex items-center gap-1 font-bold hover:underline"
                    >
                      <span>Read Sample</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
