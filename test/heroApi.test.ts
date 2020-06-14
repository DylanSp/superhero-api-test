import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "io-ts-types/lib/UUID";
import { isLeft } from "fp-ts/lib/Either";

import { baseUrl } from "./constants";
import { Hero } from "../src/models/hero";
import { Power } from "../src/models/power";

axios.defaults.baseURL = baseUrl;

describe("Hero API", () => {
  it("Returns a created hero", async () => {
    // Arrange
    const flightPower: Power = {
      id: uuidv4() as UUID,
      name: "Flight",
    };
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Created Hero",
      location: "Test Suite",
      powers: [flightPower],
    };

    await axios.post("/heroes", hero);

    // Act
    const getResponse = await axios.get(`/heroes/${hero.id}`);

    // Assert
    expect(getResponse.status).toBe(200);

    const possibleHero = Hero.decode(getResponse.data);
    if (isLeft(possibleHero)) {
      throw new Error("Returned non-hero");
    }

    expect(possibleHero.right).toEqual(hero);
  });
});
