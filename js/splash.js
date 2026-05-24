/*
 * Audit refactor:
 * - Kept the legacy splash entrypoint as a thin module facade.
 * - Delegated runtime behavior to src/main.js for clearer ownership.
 * - Preserved script path compatibility for index.html.
 */

import "../src/main.js";
