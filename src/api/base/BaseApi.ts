export abstract class BaseAPI {
  protected abstract baseURL: string;

  protected async fetchData(url: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}${url}`);
      return await response.json();
    } catch (err) {
      this.handleError(err);
    }
  }

  protected handleError(err: unknown): void {
    throw err;
  }
}
