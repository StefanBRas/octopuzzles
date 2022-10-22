import { z } from 'zod';

const LabelValidator = z.object({
  name: z.string(),
  description: z.string()
});

export type Label = z.infer<typeof LabelValidator>;
