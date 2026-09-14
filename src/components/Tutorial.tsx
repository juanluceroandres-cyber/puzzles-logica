interface TutorialProps {
  title: string;
  steps: string[];
  onStart: () => void;
}

export function Tutorial({ title, steps, onStart }: TutorialProps) {
  return (
    <div className="tutorial-overlay">
      <div className="tutorial-card">
        <h3>{title}</h3>
        <ol className="tutorial-steps">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
        <button type="button" className="btn-primary" onClick={onStart}>
          Comenzar
        </button>
      </div>
    </div>
  );
}
