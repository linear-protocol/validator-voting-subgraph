export default {
  '*.(ts|mjs)': () => ['pnpm lint', 'pnpm prettier'],
};
