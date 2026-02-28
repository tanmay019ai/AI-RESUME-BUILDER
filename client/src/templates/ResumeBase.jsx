import React, { useMemo } from 'react';

function Section({ title, children }) {
  return (
    <section className="mt-5">
      <div className="text-[11px] font-semibold tracking-wider text-slate-500 dark:text-slate-400">{title}</div>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function densityScore(content) {
  if (!content) return 0;
  const summary = String(content.summary || '');
  const skills = Array.isArray(content.skills) ? content.skills.length : 0;
  const expBullets = (content.experience || []).reduce((acc, e) => acc + (e?.bullets?.length || 0), 0);
  const projBullets = (content.projects || []).reduce((acc, p) => acc + (p?.bullets?.length || 0), 0);
  const eduDetails = (content.education || []).reduce((acc, e) => acc + (e?.details?.length || 0), 0);
  return summary.length + skills * 20 + expBullets * 30 + projBullets * 25 + eduDetails * 15;
}

export default function ResumeBase({ profile, content, variant }) {
  const score = useMemo(() => densityScore(content), [content]);
  const compact = score > 900;

  const textClass = compact ? 'text-[13px] leading-5' : 'text-sm leading-6';
  const listClass = compact ? 'space-y-0.5' : 'space-y-1';

  const headline = content?.headline || profile?.targetRole || '';

  const photo = profile?.photoDataUrl;
  const showPhoto = Boolean(photo);

  const header = (
    <div
      className={
        'flex flex-col gap-2 rounded-2xl border p-5 md:flex-row md:items-start md:justify-between ' +
        (variant?.header === 'bold'
          ? 'border-slate-900 bg-slate-950 text-white dark:border-slate-800'
          : variant?.header === 'lined'
            ? 'border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/30'
            : 'border-slate-200 bg-white/40 dark:border-slate-800 dark:bg-slate-950/20')
      }
    >
      <div className="flex items-start gap-4">
        {showPhoto ? (
          <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <img src={photo} alt="Profile" className="h-full w-full object-cover" />
          </div>
        ) : null}

        <div>
        <div className="text-2xl font-semibold tracking-tight">{profile?.fullName}</div>
        {headline ? (
          <div
            className={
              'mt-1 text-sm ' +
              (variant?.header === 'bold' ? 'text-slate-200' : 'text-slate-600 dark:text-slate-400')
            }
          >
            {headline}
          </div>
        ) : null}
        </div>
      </div>
      <div
        className={
          'text-sm ' +
          (variant?.header === 'bold' ? 'text-slate-200' : 'text-slate-700 dark:text-slate-300')
        }
      >
        <div className="break-all">{profile?.email}</div>
        <div className="break-all">{profile?.phone}</div>
      </div>
    </div>
  );

  const blocks = (
    <>
      <Section title={variant?.labels?.summary || 'SUMMARY'}>
        <p className={textClass + ' text-slate-800 dark:text-slate-200'}>{content?.summary}</p>
      </Section>

      <Section title={variant?.labels?.skills || 'SKILLS'}>
        <p className={textClass + ' text-slate-800 dark:text-slate-200'}>{(content?.skills || []).join(' • ')}</p>
      </Section>

      <Section title={variant?.labels?.experience || 'EXPERIENCE'}>
        <div className="space-y-4">
          {(content?.experience || []).map((e, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/70 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-medium">
                  {e.title} — {e.company}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {e.startDate} - {e.endDate}
                </div>
              </div>
              {e.location ? <div className="text-xs text-slate-500 dark:text-slate-400">{e.location}</div> : null}
              <ul className={'mt-2 list-disc pl-5 ' + textClass + ' ' + listClass + ' text-slate-800 dark:text-slate-200'}>
                {(e.bullets || []).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={variant?.labels?.projects || 'PROJECTS'}>
        <div className="space-y-4">
          {(content?.projects || []).map((p, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/70 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="text-sm font-medium">
                {p.name}{' '}
                {p.tech?.length ? (
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">({p.tech.join(', ')})</span>
                ) : null}
              </div>
              <ul className={'mt-2 list-disc pl-5 ' + textClass + ' ' + listClass + ' text-slate-800 dark:text-slate-200'}>
                {(p.bullets || []).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      <Section title={variant?.labels?.education || 'EDUCATION'}>
        <div className="space-y-4">
          {(content?.education || []).map((ed, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200/70 bg-white/40 p-4 dark:border-slate-800 dark:bg-slate-950/20">
              <div className="flex items-baseline justify-between gap-3">
                <div className="text-sm font-medium">
                  {ed.school} — {ed.degree}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {ed.startDate} - {ed.endDate}
                </div>
              </div>
              <ul className={'mt-2 list-disc pl-5 ' + textClass + ' ' + listClass + ' text-slate-800 dark:text-slate-200'}>
                {(ed.details || []).map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
    </>
  );

  if (variant?.layout === 'two-col') {
    return (
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1">
          {header}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white/40 p-5 dark:border-slate-800 dark:bg-slate-950/20">
            <Section title={variant?.labels?.skills || 'SKILLS'}>
              <p className={textClass + ' text-slate-800 dark:text-slate-200'}>{(content?.skills || []).join(' • ')}</p>
            </Section>
            <Section title={variant?.labels?.education || 'EDUCATION'}>
              <div className="space-y-3">
                {(content?.education || []).map((ed, idx) => (
                  <div key={idx}>
                    <div className="text-sm font-medium">{ed.degree}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{ed.school}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {ed.startDate} - {ed.endDate}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white/40 p-6 dark:border-slate-800 dark:bg-slate-950/20">
            <Section title={variant?.labels?.summary || 'SUMMARY'}>
              <p className={textClass + ' text-slate-800 dark:text-slate-200'}>{content?.summary}</p>
            </Section>
            <Section title={variant?.labels?.experience || 'EXPERIENCE'}>
              <div className="space-y-4">
                {(content?.experience || []).map((e, idx) => (
                  <div key={idx}>
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-sm font-medium">
                        {e.title} — {e.company}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {e.startDate} - {e.endDate}
                      </div>
                    </div>
                    {e.location ? (
                      <div className="text-xs text-slate-500 dark:text-slate-400">{e.location}</div>
                    ) : null}
                    <ul
                      className={
                        'mt-2 list-disc pl-5 ' +
                        textClass +
                        ' ' +
                        listClass +
                        ' text-slate-800 dark:text-slate-200'
                      }
                    >
                      {(e.bullets || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
            <Section title={variant?.labels?.projects || 'PROJECTS'}>
              <div className="space-y-4">
                {(content?.projects || []).map((p, idx) => (
                  <div key={idx}>
                    <div className="text-sm font-medium">
                      {p.name}{' '}
                      {p.tech?.length ? (
                        <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                          ({p.tech.join(', ')})
                        </span>
                      ) : null}
                    </div>
                    <ul
                      className={
                        'mt-2 list-disc pl-5 ' +
                        textClass +
                        ' ' +
                        listClass +
                        ' text-slate-800 dark:text-slate-200'
                      }
                    >
                      {(p.bullets || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/40 p-6 dark:border-slate-800 dark:bg-slate-950/20">
      {header}
      {blocks}
    </div>
  );
}
