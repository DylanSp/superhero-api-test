// this test suite uses both axios and fpAxios
// axios is used when we wish to fail a test on an error;
// fpAxios is used to more easily capture expected 4xx errors

import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { UUID } from "io-ts-types/lib/UUID";
import * as t from "io-ts";

import { Power } from "../src/models/power";
import { fromRight, fromLeft } from "../src/fromFp";
import { fpAxios } from "../src/fpAxios";
import { baseUrl } from "./constants";

axios.defaults.baseURL = baseUrl;

describe("Power API", () => {
  it("Returns 201 Created response with power data, location when creating a new power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Test Power",
    };

    // Act
    const response = await axios.post("/powers", power);

    // Assert
    expect(response.status).toBe(201);
    expect(fromRight(Power.decode(response.data))).toEqual(power);
    expect(
      (response.headers["location"] as string).endsWith(`/powers/${power.id}`)
    ).toBeTruthy();
  });

  it("Returns 422 Unprocessable Entity when attempting to create an existing power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Test Power",
    };
    await axios.post("/powers", power);

    // Act
    const response = await fpAxios.post("/powers", power);

    // Assert
    expect(fromLeft(response).response?.status).toBe(422);
  });

  it("Returns a created power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Test Power",
    };

    await axios.post("/powers", power);

    // Act
    const getResponse = await axios.get(`/powers/${power.id}`);

    // Assert
    expect(getResponse.status).toBe(200);

    const returnedPower = fromRight(Power.decode(getResponse.data));
    expect(returnedPower).toEqual(power);
  });

  it("Returns a created power among all powers", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Test Power",
    };

    await axios.post("/powers", power);

    // Act
    const getResponse = await axios.get(`/powers`);

    // Assert
    expect(getResponse.status).toBe(200);

    const returnedPowers = fromRight(t.array(Power).decode(getResponse.data));
    expect(returnedPowers).toContainEqual(power);
  });

  it("Returns updated details after updating a power", async () => {
    // Arrange
    const initialPower: Power = {
      id: uuidv4() as UUID,
      name: "Initial Power",
    };

    await axios.post("/powers", initialPower);

    const updatedPower: Power = {
      ...initialPower,
      name: "Updated Power",
    };
    await axios.post(`/powers/${initialPower.id}`, updatedPower);

    // Act
    const getResponse = await axios.get(`/powers/${updatedPower.id}`);

    // Assert
    expect(getResponse.status).toBe(200);
    expect(fromRight(Power.decode(getResponse.data))).toEqual(updatedPower);
  });

  it("Returns 200 OK response with power data when updating a power", async () => {
    // Arrange
    const initialPower: Power = {
      id: uuidv4() as UUID,
      name: "Initial Power",
    };

    await axios.post("/powers", initialPower);

    const updatedPower: Power = {
      ...initialPower,
      name: "Updated Power",
    };

    // Act
    const response = await axios.post(
      `/powers/${updatedPower.id}`,
      updatedPower
    );

    // Assert
    expect(response.status).toBe(200);
    expect(fromRight(Power.decode(response.data))).toEqual(updatedPower);
  });

  it("Returns 404 Not Found when trying to update a nonexistent power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Nonexistent Power",
    };

    // Act
    const response = await fpAxios.post(`/powers/${power.id}`, power);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 400 Bad Request when trying to update a power with inconsistent IDs", async () => {
    // Arrange
    const initialPower: Power = {
      id: uuidv4() as UUID,
      name: "Initial Power",
    };

    await axios.post("/powers", initialPower);

    const updatedPower: Power = {
      id: uuidv4() as UUID,
      name: "Updated Power",
    };

    // Act
    const response = await fpAxios.post(
      `/powers/${initialPower.id}`,
      updatedPower
    );

    // Assert
    expect(fromLeft(response).response?.status).toBe(400);
  });

  it("Returns 404 Not Found when trying to delete a nonexistent power", async () => {
    // Arrange - not needed

    // Act
    const response = await fpAxios.delete(`/powers/${uuidv4()}`);

    // Assert
    expect(fromLeft(response).response?.status).toBe(404);
  });

  it("Returns 404 Not Found when trying to request a deleted power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Deleted Power",
    };
    await axios.post("/powers", power);
    await axios.delete(`/powers/${power.id}`);

    // Act
    const getResponse = await fpAxios.get(`/powers/${power.id}`);

    // Assert
    expect(fromLeft(getResponse).response?.status).toBe(404);
  });

  it("Returns 204 No Content when deleting an existing power", async () => {
    // Arrange
    const power: Power = {
      id: uuidv4() as UUID,
      name: "Deleted Power",
    };
    await axios.post("/powers", power);

    // Act
    const deleteResponse = await axios.delete(`/powers/${power.id}`);

    // Assert
    expect(deleteResponse.status).toBe(204);
  });
});
