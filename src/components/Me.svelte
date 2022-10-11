<script lang="ts">
  import { graphql, query } from '$houdini';
  import type { MeGeneric } from '$houdini';

  const {
    data: meData,
    loading,
    error
  } = query<MeGeneric>(graphql`
    query MeGeneric {
      me {
        id
        username
      }
    }
  `);
</script>

<slot me={$meData} loading={$loading} error={$error} />
