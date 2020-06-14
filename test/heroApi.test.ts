import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "io-ts-types/lib/UUID";

import { baseUrl } from "./constants";
import { Hero } from "../src/models/hero";
import { Power } from "../src/models/power";
import { fromRight } from "../src/fromFp";

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

    const returnedHero = fromRight(Hero.decode(getResponse.data));
    expect(returnedHero).toEqual(hero);
  });
});
