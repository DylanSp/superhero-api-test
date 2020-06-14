import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID";
import { Power } from "./power";

export const Hero = t.type({
  id: UUID,
  name: t.string,
  location: t.string,
  powers: t.array(Power)
});

export type Hero = t.TypeOf<typeof Hero>;
