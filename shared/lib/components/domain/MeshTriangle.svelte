<script lang="ts">
  import type { CircularMeshMatch, PublicProfile } from '../../types';
  import { loadGsap } from '../../motion/gsap';

  /**
   * The 3-way mesh visualisation — the app's signature screen, and the one place
   * the spec explicitly allocates an animation budget to (task 5.2).
   *
   * Inline SVG rather than a chart library: three points and three arcs do not
   * justify a dependency, and inline elements can be themed with CSS variables
   * and targeted individually by the timeline.
   *
   * Under prefers-reduced-motion, loadGsap() returns null and the diagram simply
   * renders in its final state. It is never built and then killed.
   */
  let {
    mesh,
    a,
    b,
    c
  }: {
    mesh: CircularMeshMatch;
    a: PublicProfile;
    b: PublicProfile;
    c: PublicProfile;
  } = $props();

  let root = $state<SVGSVGElement | null>(null);

  // Equilateral layout in a 320x300 viewBox.
  const P = { a: { x: 160, y: 42 }, b: { x: 286, y: 250 }, c: { x: 34, y: 250 } };

  /** Quadratic arc bowed outward from the centroid, so the loop reads as circular. */
  function arc(from: { x: number; y: number }, to: { x: number; y: number }) {
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2;
    const cx = 160;
    const cy = 180;
    const k = 0.22;
    return `M ${from.x} ${from.y} Q ${mx + (mx - cx) * k} ${my + (my - cy) * k} ${to.x} ${to.y}`;
  }

  const edges = $derived([
    { d: arc(P.a, P.b), skill: mesh.skillAtoB.title, from: a.name, to: b.name },
    { d: arc(P.b, P.c), skill: mesh.skillBtoC.title, from: b.name, to: c.name },
    { d: arc(P.c, P.a), skill: mesh.skillCtoA.title, from: c.name, to: a.name }
  ]);

  const nodes = $derived([
    { p: P.a, person: a },
    { p: P.b, person: b },
    { p: P.c, person: c }
  ]);

  const initials = (n: string) =>
    n.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  $effect(() => {
    const el = root;
    if (!el) return;

    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    loadGsap().then((gsap) => {
      if (!gsap || cancelled || !el) return;
      ctx = gsap.context(() => {
        // Kept under a second end to end. This is a screen people land on
        // directly, and a diagram that takes 1.5s to become readable reads as
        // slow rather than considered.
        const tl = gsap.timeline();
        tl.from('[data-mesh-edge]', {
          strokeDashoffset: 420,
          duration: 0.45,
          stagger: 0.1,
          ease: 'power2.out'
        })
          .from(
            '[data-mesh-node]',
            { scale: 0, transformOrigin: 'center', duration: 0.3, stagger: 0.07, ease: 'back.out(2)' },
            '-=0.35'
          )
          .from('[data-mesh-label]', { opacity: 0, duration: 0.25, stagger: 0.06 }, '-=0.2');
      }, el);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  });
</script>

<svg
  bind:this={root}
  viewBox="0 0 320 300"
  class="h-auto w-full max-w-md"
  role="img"
  aria-label="Three-way skill loop: {a.name} teaches {b.name} {mesh.skillAtoB.title}, {b.name} teaches {c.name} {mesh.skillBtoC.title}, and {c.name} teaches {a.name} {mesh.skillCtoA.title}."
>
  <defs>
    <linearGradient id="mesh-stroke-{mesh.id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="var(--color-brand-light)" />
      <stop offset="100%" stop-color="var(--color-cyan)" />
    </linearGradient>
    <marker id="mesh-arrow-{mesh.id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-cyan)" />
    </marker>
  </defs>

  {#each edges as edge, i (i)}
    <path
      data-mesh-edge
      d={edge.d}
      fill="none"
      stroke="url(#mesh-stroke-{mesh.id})"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-dasharray="420"
      marker-end="url(#mesh-arrow-{mesh.id})"
    />
  {/each}

  {#each nodes as node, i (i)}
    <g data-mesh-node>
      <circle cx={node.p.x} cy={node.p.y} r="26" fill="var(--color-card)" stroke="var(--color-primary)" stroke-width="2" />
      <text
        x={node.p.x}
        y={node.p.y + 5}
        text-anchor="middle"
        font-size="14"
        font-weight="800"
        fill="var(--color-primary)"
      >
        {initials(node.person.name)}
      </text>
      <text
        data-mesh-label
        x={node.p.x}
        y={node.p.y + (i === 0 ? -36 : 46)}
        text-anchor="middle"
        font-size="11"
        font-weight="700"
        fill="var(--color-ink-secondary)"
      >
        {node.person.name.split(' ')[0]}
      </text>
    </g>
  {/each}
</svg>

<!-- The same information as prose, for anyone the diagram does not reach. -->
<ol class="mt-4 space-y-1.5 text-[0.8125rem] text-(--color-ink-secondary)">
  {#each edges as edge, i (i)}
    <li>
      <strong class="font-bold text-(--color-ink)">{edge.from}</strong>
      teaches
      <strong class="font-bold text-(--color-ink)">{edge.to}</strong>
      {edge.skill}
    </li>
  {/each}
</ol>
