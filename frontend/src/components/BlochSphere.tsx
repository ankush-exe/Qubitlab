type BlochSphereProps = { circuitHasHadamard: boolean; circuitHasX: boolean };

export function BlochSphere({ circuitHasHadamard, circuitHasX }: BlochSphereProps) {
  const stateLabel = circuitHasHadamard ? "superposition" : circuitHasX ? "|1>" : "|0>";
  const vector = circuitHasHadamard ? { x: 128, y: 72 } : circuitHasX ? { x: 128, y: 184 } : { x: 128, y: 38 };
  return (
    <section className="panel bloch-panel">
      <div className="panel-heading"><span className="eyebrow">03 / STATE VIEW</span><h2>Qubit orientation</h2></div>
      <div className="bloch-wrap">
        <svg viewBox="0 0 256 224" role="img" aria-label={`Bloch sphere showing ${stateLabel}`}>
          <defs><radialGradient id="sphere" cx="35%" cy="25%"><stop offset="0" stopColor="#273b61" /><stop offset="1" stopColor="#101a2d" /></radialGradient></defs>
          <ellipse cx="128" cy="112" rx="78" ry="28" fill="none" stroke="#365177" strokeWidth="1" />
          <circle cx="128" cy="112" r="78" fill="url(#sphere)" stroke="#4a719d" strokeWidth="1.5" />
          <path d="M128 34v156M50 112h156" stroke="#47749c" strokeWidth="1" strokeDasharray="3 5" />
          <line x1="128" y1="112" x2={vector.x} y2={vector.y} stroke="#59e4da" strokeWidth="3" />
          <circle cx={vector.x} cy={vector.y} r="6" fill="#f2b56b" stroke="#fff0d2" strokeWidth="2" />
          <text x="137" y="30" fill="#8da8c2" fontSize="11">|0&gt;</text><text x="137" y="205" fill="#8da8c2" fontSize="11">|1&gt;</text>
        </svg>
        <div><span className="state-value">{stateLabel}</span><p className="muted">Single-qubit state preview</p></div>
      </div>
    </section>
  );
}
