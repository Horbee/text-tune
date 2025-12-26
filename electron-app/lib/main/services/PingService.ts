import axios from 'axios'

export class PingService {
  async ping<T>(url: string): Promise<{ data: T; status: number }> {
    try {
      const { data, status } = await axios.get<T>(url)
      return { data, status }
    } catch (error) {
      throw new Error(`Server is unreachable ${url}: ${error}`)
    }
  }
}
