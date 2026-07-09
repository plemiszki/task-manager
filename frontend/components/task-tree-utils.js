export function patchTaskTree(tasksByTimeframe, patchNodes) {
  const touchedTimeframes = new Set(
    patchNodes.map((p) => p.timeframe).filter((tf) => tasksByTimeframe[tf])
  );
  const next = { ...tasksByTimeframe };
  touchedTimeframes.forEach((timeframe) => {
    next[timeframe] = next[timeframe].map((rootTask) =>
      applyPatch(rootTask, patchNodes)
    );
  });
  return next;
}

function applyPatch(task, patchNodes) {
  const match = patchNodes.find((p) => p.id === task.id);
  let updated = match ? { ...task, ...match, subtasks: task.subtasks } : task;
  if (updated.subtasks && updated.subtasks.length > 0) {
    const newSubtasks = updated.subtasks.map((sub) => applyPatch(sub, patchNodes));
    if (newSubtasks.some((s, i) => s !== updated.subtasks[i])) {
      updated = { ...updated, subtasks: newSubtasks };
    }
  }
  return updated;
}
