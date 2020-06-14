import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";

export const Power = t.type({
  id: UUID,
  name: t.string,
});

export type Power = t.TypeOf<typeof Power>;
