// this test suite uses both axios and fpAxios
// axios is used when we wish to fail a test on an error;
// fpAxios is used to more easily capture expected 4xx errors

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "io-ts-types/lib/UUID";
import * as t from "io-ts";

import { fromRight, fromLeft } from "../src/fromFp";
import { fpAxios } from "../src/fpAxios";
import { baseUrl } from "./constants";
import { Team } from "../src/models/team";
import { Hero } from "../src/models/hero";

axios.defaults.baseURL = baseUrl;
jest.setTimeout(10000); // necessary if database gets too big (with current inefficient implementation)

describe("Team API", () => {
  it("Returns 201 Created response with team data, location when creating a new team", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Created Hero",
      location: "Test Suite",
      powers: [],
    };

    const team: Team = {
      id: uuidv4() as UUID,
      name: "Created Team",
      members: [hero],
    };

    // Act
    const response = await axios.post("/teams", team);

    // Assert
    expect(response.status).toBe(201);
    expect(fromRight(Team.decode(response.data))).toEqual(team);
    expect(
      (response.headers["location"] as string).endsWith(`/teams/${team.id}`)
    ).toBeTruthy();
  });

  it("Returns 422 Unprocessable Entity when attempting to create an existing team", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Created Hero",
      location: "Test Suite",
      powers: [],
    };

    const team: Team = {
      id: uuidv4() as UUID,
      name: "Created Team",
      members: [hero],
    };
    await axios.post("/teams", team);

    // Act
    const response = await fpAxios.post("/teams", team);

    // Assert
    expect(fromLeft(response).response?.status).toBe(422);
  });

  it("Returns a created team", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Created Hero",
      location: "Test Suite",
      powers: [],
    };

    const team: Team = {
      id: uuidv4() as UUID,
      name: "Created Team",
      members: [hero],
    };

    await axios.post("/teams", team);

    // Act
    const getResponse = await axios.get(`/teams/${team.id}`);

    // Assert
    expect(getResponse.status).toBe(200);

    const returnedTeam = fromRight(Team.decode(getResponse.data));
    expect(returnedTeam).toEqual(team);
  });

  it("Returns a created team among all teams", async () => {
    // Arrange
    const hero: Hero = {
      id: uuidv4() as UUID,
      name: "Created Hero",
      location: "Test Suite",
      powers: [],
    };

    const team: Team = {
      id: uuidv4() as UUID,
      name: "Created Team",
      members: [hero],
    };

    await axios.post("/teams", team);

    // Act
    const getResponse = await axios.get(`/teams`);

    // Assert
    expect(getResponse.status).toBe(200);

    const returnedTeams = fromRight(t.array(Team).decode(getResponse.data));
    expect(returnedTeams).toContainEqual(team);
  });

  it("Returns updated details after updating a team", async () => {
    // Arrange
    const initialTeam: Team = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      members: [],
    };

    await axios.post("/teams", initialTeam);

    const updatedTeam: Team = {
      ...initialTeam,
      name: "Updated Team",
    };
    await axios.post(`/teams/${initialTeam.id}`, updatedTeam);

    // Act
    const getResponse = await axios.get(`/teams/${updatedTeam.id}`);

    // Assert
    expect(getResponse.status).toBe(200);
    expect(fromRight(Team.decode(getResponse.data))).toEqual(updatedTeam);
  });

  it("Returns 200 OK response with team data when updating a team", async () => {
    // Arrange
    const initialTeam: Team = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      members: [],
    };

    await axios.post("/teams", initialTeam);

    const updatedTeam: Team = {
      ...initialTeam,
      name: "Updated Team",
    };

    // Act
    const response = await axios.post(`/teams/${initialTeam.id}`, updatedTeam);

    // Assert
    expect(response.status).toBe(200);
    expect(fromRight(Team.decode(response.data))).toEqual(updatedTeam);
  });

  it("Returns 404 Not Found when trying to update a nonexistent team", async () => {
    // Arrange
    const team: Team = {
      id: uuidv4() as UUID,
      name: "Nonexistent Team",
      members: [],
    };

    // Act
    const response = await fpAxios.post(`/teams/${team.id}`, team);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 400 Bad Request when trying to update a team with inconsistent IDs", async () => {
    // Arrange
    const initialTeam: Team = {
      id: uuidv4() as UUID,
      name: "Initial Hero",
      members: [],
    };

    await axios.post("/teams", initialTeam);

    const updatedTeam: Team = {
      ...initialTeam,
      id: uuidv4() as UUID,
      name: "Updated Team",
    };

    // Act
    const response = await fpAxios.post(
      `/teams/${initialTeam.id}`,
      updatedTeam
    );

    // Assert
    expect(fromLeft(response).response?.status).toBe(400);
  });

  it("Returns 404 Not Found when trying to delete a nonexistent team", async () => {
    // Arrange - not needed

    // Act
    const response = await fpAxios.delete(`/teams/${uuidv4()}`);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 404 Not Found when trying to request a deleted team", async () => {
    // Arrange
    const team: Team = {
      id: uuidv4() as UUID,
      name: "Deleted Team",
      members: [],
    };
    await axios.post("/teams", team);
    await axios.delete(`/teams/${team.id}`);

    // Act
    const getResponse = await fpAxios.get(`/teams/${team.id}`);

    // Assert
    expect(fromLeft(getResponse).response?.status).toBe(404);
  });

  it("Returns 204 No Content when deleting an existing team", async () => {
    // Arrange
    const team: Team = {
      id: uuidv4() as UUID,
      name: "Deleted Team",
      members: [],
    };
    await axios.post("/teams", team);

    // Act
    const deleteResponse = await axios.delete(`/teams/${team.id}`);

    // Assert
    expect(deleteResponse.status).toBe(204);
  });
});
