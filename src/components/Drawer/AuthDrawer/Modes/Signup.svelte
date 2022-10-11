<script lang="ts">
  import { graphql, mutation } from '$houdini';
  import type { Register } from '$houdini';
  import Button from '$ui/Button.svelte';
  import Logo from '$icons/Logo.svelte';
  import Input from '$ui/Input.svelte';
  import { authMode } from '$stores/authStore';
  import toErrorMap from '$utils/toErrorMap';

  let username = '';
  let email = '';
  let password = '';

  let errors: Record<string, string> = {};

  /** If the signup was successful */
  let registerCompleted = false;

  const register = mutation<Register>(graphql`
    mutation Register($username: String!, $email: String!, $password: String!) {
      register(username: $username, email: $email, password: $password) {
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

  const handleRegister = async (): Promise<void> => {
    const res = await register({ username, email, password });
    if (res?.register.errors) {
      errors = toErrorMap(res.register.errors);
    } else if (res?.register.user) {
      registerCompleted = true;
      username = '';
      email = '';
      password = '';
    }
  };
</script>

<div class="px-4 sm:px-6">
  <Logo withText={false} size={200} />
  <h2 class="text-3xl font-bold text-gray-900 mt-4">Sign Up</h2>
</div>
<div class="mt-6 relative flex-1 px-4 sm:px-6">
  {#if registerCompleted}
    <div>
      <p>Thank you for signing up to OctoPuzzles.</p>
      <p>We have send you an email with a verification link.</p>
      <p>
        If you didn't get a verification email, you can request a new one <a
          class="text-blue-500 underline"
          href="/resend-verification-email">here</a
        >
      </p>
      <Button on:click={() => authMode.setAuthMode()}>Okay</Button>
    </div>
  {:else}
    <form on:submit|preventDefault={handleRegister}>
      <Input label="Username" bind:value={username}>
        <p slot="error">{errors.username ?? ''}</p>
      </Input>
      <Input label="Email" bind:value={email}>
        <p slot="error">{errors.email ?? ''}</p>
      </Input>
      <Input label="Password" type="password" bind:value={password} hideHelpSlot={!errors.password}>
        <p slot="help">Your password should be at least 10 characters long</p>
        <p slot="error">{errors.password ?? ''}</p>
      </Input>
      <Button variant="primary" class="mt-4 w-full">Sign up</Button>
    </form>
    <p class="text-xs text-gray-500 mt-4">
      By signing up, you agree to our <a
        href="/terms-and-conditions"
        on:click={() => authMode.setAuthMode(undefined)}
        class="hover:underline text-blue-500">terms and conditions</a
      >
    </p>
    <hr class="mt-6 mb-2" />
    <div class="flex justify-around mb-1">
      <button class="text-xs" on:click={() => authMode.setAuthMode('login')}>
        Already have an account?
      </button>
    </div>
  {/if}
</div>
