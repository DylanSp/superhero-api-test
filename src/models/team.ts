import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { Hero } from "./hero";

export const Team = t.type({
  id: UUID,
  name: t.string,
  members: t.array(Hero),
});

export type Team = t.TypeOf<typeof Team>;
