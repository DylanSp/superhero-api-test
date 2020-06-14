import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "io-ts-types/lib/UUID";
import * as t from "io-ts";

import { baseUrl } from "./constants";
import { Hero } from "../src/models/hero";
import { Power } from "../src/models/power";
import { fromRight, fromLeft } from "../src/fromFp";
import { fpAxios } from "../src/fpAxios";

axios.defaults.baseURL = baseUrl;

describe("Hero API", () => {
  it("Returns 201 Created response with hero data, location when creating a new hero", async () => {
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

    // Act
    const response = await axios.post("/heroes", hero);

    // Assert
    expect(response.status).toBe(201);
    expect(fromRight(Hero.decode(response.data))).toEqual(hero);
    // TODO - check Location header
  });

  it("Returns 422 Unprocessable Entity when attempting to create an existing hero", async () => {
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
    await fpAxios.post("/heroes", hero);

    // Act
    const response = await fpAxios.post("/heroes", hero);

    // Assert
    expect(fromLeft(response).response?.status).toBe(422);
  });

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

  it("Returns a created hero among all heroes", async () => {
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
    const getResponse = await axios.get(`/heroes`);

    // Assert
    expect(getResponse.status).toBe(200);

    const returnedHeroes = fromRight(t.array(Hero).decode(getResponse.data));
    expect(returnedHeroes).toContainEqual(hero);
  });
});
