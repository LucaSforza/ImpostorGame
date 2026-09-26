// Clear the public result before an asynchronous rematch save can expose its word to the next player.
export function concealResult(root: ParentNode): void {
  root.querySelector('.game-screen.result')?.replaceChildren();
}
