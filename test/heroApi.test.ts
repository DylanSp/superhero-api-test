// this test suite uses both axios and fpAxios
// axios is used when we wish to fail a test on an error;
// fpAxios is used to more easily capture expected 4xx errors

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
    expect(
      (response.headers["location"] as string).endsWith(`/heroes/${hero.id}`)
    ).toBeTruthy();
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
    await axios.post("/heroes", hero);

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

  it("Returns updated details after updating a hero", async () => {
    // Arrange
    const initialHero: Hero = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      location: "Test Suite",
      powers: [],
    };

    await axios.post("/heroes", initialHero);

    const updatedHero: Hero = {
      ...initialHero,
      name: "Updated Hero",
    };
    await axios.post(`/heroes/${initialHero.id}`, updatedHero);

    // Act
    const getResponse = await axios.get(`/heroes/${updatedHero.id}`);

    // Assert
    expect(getResponse.status).toBe(200);
    expect(fromRight(Hero.decode(getResponse.data))).toEqual(updatedHero);
  });

  it("Returns 200 OK response with hero data when updating a hero", async () => {
    // Arrange
    const initialHero: Hero = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      location: "Test Suite",
      powers: [],
    };

    await axios.post("/heroes", initialHero);

    const updatedHero: Hero = {
      ...initialHero,
      name: "Updated Hero",
    };

    // Act
    const response = await axios.post(`/heroes/${updatedHero.id}`, updatedHero);

    // Assert
    expect(response.status).toBe(200);
    expect(fromRight(Hero.decode(response.data))).toEqual(updatedHero);
  });

  it("Returns 404 Not Found when trying to update a nonexistent hero", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Nonexistent Hero",
      location: "Test Suite",
      powers: [],
    };

    // Act
    const response = await fpAxios.post(`/heroes/${hero.id}`, hero);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 400 Bad Request when trying to update a hero with inconsistent IDs", async () => {
    // Arrange
    const initialHero: Hero = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      location: "Test Suite",
      powers: [],
    };

    await axios.post("/heroes", initialHero);

    const updatedHero: Hero = {
      ...initialHero,
      id: uuidv4() as UUID,
      name: "Updated Hero",
    };

    // Act
    const response = await fpAxios.post(
      `/heroes/${initialHero.id}`,
      updatedHero
    );

    // Assert
    expect(fromLeft(response).response?.status).toBe(400);
  });

  it("Returns 404 Not Found when trying to delete a nonexistent hero", async () => {
    // Arrange - not needed

    // Act
    const response = await fpAxios.delete(`/heroes/${uuidv4()}`);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 404 Not Found when trying to request a deleted hero", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Deleted Hero",
      location: "Test Suite",
      powers: [],
    };
    await axios.post("/heroes", hero);
    await axios.delete(`/heroes/${hero.id}`);

    // Act
    const getResponse = await fpAxios.get(`/heroes/${hero.id}`);

    // Assert
    expect(fromLeft(getResponse).response?.status).toBe(404);
  });

  it("Returns 204 No Content when deleting an existing hero", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Deleted Hero",
      location: "Test Suite",
      powers: [],
    };
    await axios.post("/heroes", hero);

    // Act
    const deleteResponse = await axios.delete(`/heroes/${hero.id}`);

    // Assert
    expect(deleteResponse.status).toBe(204);
  });

  it("Returns heroes searched for by location", async () => {
    // Arrange
    const location = "SearchLocation";

    const heroInSearch: Hero = {
      id: uuidv4() as UUID,
      name: "TestHero",
      location,
      powers: [],
    };

    const heroNotInSearch: Hero = {
      id: uuidv4() as UUID,
      name: "TestHero",
      location: `Not${location}`,
      powers: [],
    };

    await axios.post("/heroes", heroInSearch);
    await axios.post("/heroes", heroNotInSearch);

    // Act
    const searchResponse = await axios.get(`/heroes?location=${location}`);

    // Assert
    const returnedHeroes = fromRight(t.array(Hero).decode(searchResponse.data));
    expect(returnedHeroes).toContainEqual(heroInSearch);
    expect(returnedHeroes).not.toContainEqual(heroNotInSearch);
  });
});
