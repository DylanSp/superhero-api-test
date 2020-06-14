import axios, { AxiosResponse, AxiosError, AxiosRequestConfig } from "axios";
import { tryCatch } from "fp-ts/lib/TaskEither";
import { Either } from "fp-ts/lib/Either";

const wrapNoPayload = (
  func: (url: string, config?: AxiosRequestConfig) => Promise<AxiosResponse>
) => (
  url: string,
  config?: AxiosRequestConfig
): Promise<Either<AxiosError, AxiosResponse>> => {
  return tryCatch(
    () => func(url, config),
    (err) => err as AxiosError
  )();
};

const wrapPayload = (
  func: (
    url: string,
    payload?: unknown,
    config?: AxiosRequestConfig
  ) => Promise<AxiosResponse>
) => (
  url: string,
  payload?: unknown,
  config?: AxiosRequestConfig
): Promise<Either<AxiosError, AxiosResponse>> => {
  return tryCatch(
    () => func(url, payload, config),
    (err) => err as AxiosError
  )();
};

export const fpAxios = {
  get: wrapNoPayload(axios.get),
  post: wrapPayload(axios.post),
  put: wrapPayload(axios.put),
  delete: wrapNoPayload(axios.delete),
};
