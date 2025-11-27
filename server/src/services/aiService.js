// Later you can add LLM calls here and import into controllers.
export function suggestPlan(prompt) {
  return [
    `Mini plan for: ${prompt}`,
    "- 25m read",
    "- 25m notes",
    "- 10m quiz",
  ].join("\n");
}
