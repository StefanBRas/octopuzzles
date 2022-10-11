<script lang="ts">
  import { graphql, mutation } from '$houdini';
  import type { Login } from '$houdini';
  import Button from '$ui/Button.svelte';
  import Logo from '$icons/Logo.svelte';
  import Input from '$ui/Input.svelte';
  import { authMode } from '$stores/authStore';
  import toErrorMap from '$utils/toErrorMap';
  import { me } from '$stores/meStore';

  let usernameOrEmail = '';
  let password = '';

  let errors: Record<string, string> = {};

  const login = mutation<Login>(graphql`
    mutation Login($usernameOrEmail: String!, $password: String!) {
      login(usernameOrEmail: $usernameOrEmail, password: $password) {
        errors {
          field
          message
        }
        user {
          id
          username
        }
      }
    }
  `);

  async function handleLogin(): Promise<void> {
    const res = await login({ usernameOrEmail, password });
    if (res?.login.errors) {
      errors = toErrorMap(res.login.errors);
    } else if (res?.login.user) {
      me.set(res.login.user);
      authMode.setAuthMode();
      usernameOrEmail = '';
      password = '';
    }
  }
</script>

<div class="px-4 sm:px-6">
  <Logo withText={false} size={200} />
  <h2 class="text-3xl font-bold text-gray-900 mt-4">Log In</h2>
</div>
<div class="mt-6 relative flex-1 px-4 sm:px-6">
  <form on:submit|preventDefault={handleLogin}>
    {#if errors.form}
      {errors.form}

      <p>
        If you didn't get a verification email, you can request a new one <a
          class="text-blue-500 underline"
          href="/resend-verification-email">here</a
        >
      </p>
    {/if}
    <Input label="Username or Email" bind:value={usernameOrEmail}>
      <p slot="error">{errors.usernameOrEmail ?? ''}</p>
    </Input>
    <Input label="Password" type="password" bind:value={password}>
      <p slot="error">{errors.password ?? ''}</p>
    </Input>
    <Button variant="primary" class="mt-4 w-full">Log In</Button>
  </form>

  <hr class="mt-6 mb-2" />
  <div class="flex justify-around mb-4">
    <a href="/forgot-password" class="text-xs" on:click={() => authMode.setAuthMode()}>
      Forgot Password?
    </a>
    <button class="text-xs" on:click={() => authMode.setAuthMode('signup')}>
      Create Account
    </button>
  </div>
</div>
