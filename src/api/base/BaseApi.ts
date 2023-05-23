import { ApiError } from "../../types/errors";

export abstract class BaseAPI {
  protected abstract baseURL: string;

  protected async fetchData(url: string): Promise<any> {
    try {
      console.log("URL: ", `${this.baseURL}${url}`);
      const response = await fetch(`${this.baseURL}${url}`);
      console.log({ response });
      return await response.json();
    } catch (err) {
      this.handleError(err);
    }
  }

  protected async postData(url: string, data: any): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      this.handleError(err);
    }
  }

  protected handleError(err: unknown): void {
    throw new ApiError((err as Error).message);
  }
}
