css_to_append = """
/* Auto Scan Timeline */
.auto-scan-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
}

.auto-scan-timeline::-webkit-scrollbar {
  width: 6px;
}
.auto-scan-timeline::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}
.auto-scan-timeline::-webkit-scrollbar-thumb {
  background: var(--uber-border);
  border-radius: 6px;
}

.auto-scan-step {
  display: grid;
  grid-template-columns: 24px 32px 1fr;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--uber-border);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
}

.auto-scan-step.running {
  background: rgba(59, 130, 246, 0.05);
  border-color: var(--uber-accent);
}

.auto-scan-step.completed {
  border-color: rgba(16, 185, 129, 0.2);
}

.step-index-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.step-index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--uber-muted);
}

.auto-scan-step.running .step-index {
  background: var(--uber-accent);
  color: white;
}

.auto-scan-step.completed .step-index {
  background: var(--uber-success);
  color: white;
}

.step-rail {
  flex: 1;
  width: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
}

.auto-scan-step.completed .step-rail {
  background: var(--uber-success);
  opacity: 0.3;
}

.step-icon {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: var(--uber-muted);
}

.auto-scan-step.running .step-icon {
  color: var(--uber-accent);
}

.auto-scan-step.completed .step-icon {
  color: var(--uber-success);
}

.step-lottie-icon {
  width: 24px;
  height: 24px;
}

.step-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.step-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--uber-text);
}

.step-state {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  color: var(--uber-muted);
}

.step-state.running {
  background: rgba(59, 130, 246, 0.1);
  color: var(--uber-accent);
}

.step-state.completed {
  background: rgba(16, 185, 129, 0.1);
  color: var(--uber-success);
}

.step-detail {
  font-size: 0.85rem;
  color: var(--uber-muted);
  margin: 0;
  line-height: 1.4;
}

.step-bar {
  margin-top: 8px;
  height: 4px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  overflow: hidden;
}

.step-bar-fill {
  height: 100%;
  background: var(--uber-accent);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.step-bar-fill.completed {
  background: var(--uber-success);
}

.step-bar-fill.error {
  background: var(--uber-danger);
}
"""
with open('src/styles/scan-progress.css', 'a') as f:
    f.write(css_to_append)
