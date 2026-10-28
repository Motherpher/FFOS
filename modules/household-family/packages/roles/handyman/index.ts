import {
  Gate,
  type Project,
  type Run,
  type Recipe,
} from "../../contracts/index.js";
import type { GitHub } from "../../github-adapter/index.js";
import type { Store } from "../../state/index.js";

export async function executeRecipe(
  store: Store,
  github: GitHub,
  p: Project,
  r: Run,
  lease: string,
  recipe: Recipe,
  guard: (action: string) => Promise<void>,
) {
  const op = async <T>(
    key: string,
    input: unknown,
    act: () => Promise<T>,
  ): Promise<T> => {
    await guard(
      key.startsWith("commit:")
        ? "commit"
        : key.startsWith("pr:")
          ? "pull_request"
          : "branch",
    );
    const old = await store.operation(r.run_id, key, input);
    // Even confirmed receipts are re-read by the adapter, since branch/PR state is external.
    const result = await act();
    await store.operationDone(r.run_id, key, result);
    return result;
  };
  const recipeBase = r.recipe_bases[recipe.recipe_id] ?? r.commit_sha;
  if (!r.recipe_bases[recipe.recipe_id])
    await store.mutateRun(r.run_id, lease, {
      recipe_bases: { ...r.recipe_bases, [recipe.recipe_id]: recipeBase },
    });
  if ((await github.head(p, p.protected_branches[0]!)) !== r.baseline_sha)
    throw new Gate("BASELINE_BRANCH_DRIFT", "HOLD_HUMAN");
  const branch = await op(
    "branch",
    { branch: r.branch, baseline: r.baseline_sha },
    () => github.branch(p, r.branch, r.baseline_sha),
  );
  if (branch.sha !== r.commit_sha && branch.sha !== r.baseline_sha) {
    // Commit recovery below recognizes only exact registered content on this isolated branch.
    await guard("commit");
  }
  const result = await op(
    `commit:${recipe.recipe_id}`,
    { base: recipeBase, recipe },
    () =>
      github.commit(
        p,
        r.branch,
        recipeBase,
        recipe,
        `Household ${r.wp_id} / ${recipe.recipe_id}`,
        () => guard("commit"),
      ),
  );
  if (result.paths.some((path) => !recipe.changes.some((c) => c.path === path)))
    throw new Gate("UNAUTHORIZED_PATH_MUTATION", "HOLD_HUMAN");
  await store.mutateRun(r.run_id, lease, { commit_sha: result.sha });
  const pr = await op(
    `pr:${recipe.recipe_id}`,
    { branch: r.branch, base: p.protected_branches[0], commit: result.sha },
    () =>
      github.pullRequest(
        p,
        r.branch,
        p.protected_branches[0]!,
        r.wp_id,
        result.sha,
      ),
  );
  await store.mutateRun(r.run_id, lease, { pr_ref: pr.url });
  return result;
}
