/// <reference types="@sveltejs/kit" />

// See https://kit.svelte.dev/docs/typescript
// for information about these interfaces
declare namespace App {
  interface Locals {
    session: import('svelte-kit-cookie-session').Session<SessionData>;
  }
  // interface Platform {}
  // interface Session {}
  // interface Stuff {}
}
