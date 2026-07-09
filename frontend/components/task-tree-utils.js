export function patchTaskTree(tasksByTimeframe, patchNodes) {
  const touchedIds = new Set(patchNodes.map((p) => p.id));
  const touchedTimeframes = new Set(
    patchNodes.map((p) => p.timeframe).filter((tf) => tasksByTimeframe[tf])
  );
  const next = { ...tasksByTimeframe };
  touchedTimeframes.forEach((timeframe) => {
    const patched = next[timeframe].map((rootTask) =>
      applyPatch(rootTask, patchNodes, touchedIds)
    );
    next[timeframe] = sortIfTouched(patched, touchedIds);
  });
  return next;
}

function applyPatch(task, patchNodes, touchedIds) {
  const match = patchNodes.find((p) => p.id === task.id);
  let updated = match ? { ...task, ...match, subtasks: task.subtasks } : task;
  if (updated.subtasks && updated.subtasks.length > 0) {
    const newSubtasks = sortIfTouched(
      updated.subtasks.map((sub) => applyPatch(sub, patchNodes, touchedIds)),
      touchedIds
    );
    if (newSubtasks.some((s, i) => s !== updated.subtasks[i])) {
      updated = { ...updated, subtasks: newSubtasks };
    }
  }
  return updated;
}

function sortIfTouched(list, touchedIds) {
  if (!list.some((item) => touchedIds.has(item.id))) return list;
  return [...list].sort((a, b) => a.position - b.position);
}
